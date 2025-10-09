"use server"

import { db } from "@/lib/db"
import { invitation, member, organization, user, roles } from "@/lib/db/schemas"
import { eq, and } from "drizzle-orm"
import { nanoid } from "nanoid"
import { sendInviteEmail } from "@/lib/email"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

interface SendInviteInput {
  organizationId: string
  email: string
  roleId: string
}

export async function sendInvite(input: SendInviteInput) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    const currentUserId = session.user.id

    // Check if user has permission to invite members
    const canInvite = await hasPermission(currentUserId, input.organizationId, PERMISSIONS.INVITE_MEMBERS)

    if (!canInvite) {
      return {
        success: false,
        error: "You don't have permission to invite members",
      }
    }

    const role = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, input.roleId), eq(roles.organizationId, input.organizationId)))
      .limit(1)

    if (!role.length) {
      return { success: false, error: "Invalid role" }
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(and(eq(member.organizationId, input.organizationId), eq(user.email, input.email)))
      .limit(1)

    if (existingMember.length > 0) {
      return { success: false, error: "User is already a member" }
    }

    // Check if there's already a pending invitation
    const existingInvite = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.organizationId, input.organizationId),
          eq(invitation.email, input.email),
          eq(invitation.status, "pending"),
        ),
      )
      .limit(1)

    if (existingInvite.length > 0) {
      return { success: false, error: "Invitation already sent to this email" }
    }

    // Get organization details
    const org = await db.select().from(organization).where(eq(organization.id, input.organizationId)).limit(1)

    if (!org.length) {
      return { success: false, error: "Organization not found" }
    }

    // Create invitation
    const inviteId = nanoid()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    await db.insert(invitation).values({
      id: inviteId,
      organizationId: input.organizationId,
      email: input.email,
      role: input.roleId, // Store roleId in the role field
      status: "pending",
      expiresAt,
      inviterId: currentUserId,
    })

    // Send invitation email
    const inviteUrl = `http://localhost/invites/${inviteId}`
    await sendInviteEmail({
      to: input.email,
      organizationName: org[0].name,
      inviterName: session.user.name || "Someone",
      inviteUrl,
      roleName: role[0].name,
    })

    return { success: true, inviteId }
  } catch (error) {
    console.error("Error sending invite:", error)
    return { success: false, error: "Failed to send invitation" }
  }
}

export async function acceptInvite(inviteId: string) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    const currentUserId = session.user.id
    const currentUserEmail = session.user.email

    // Get the invitation
    const invite = await db.select().from(invitation).where(eq(invitation.id, inviteId)).limit(1)

    if (!invite.length) {
      return { success: false, error: "Invitation not found" }
    }

    const inviteData = invite[0]

    // Check if invitation is for the current user's email
    if (inviteData.email !== currentUserEmail) {
      return {
        success: false,
        error: "This invitation is for a different email address",
      }
    }

    // Check if invitation is still pending
    if (inviteData.status !== "pending") {
      return { success: false, error: "This invitation has already been used" }
    }

    // Check if invitation has expired
    if (new Date() > inviteData.expiresAt) {
      return { success: false, error: "This invitation has expired" }
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(member)
      .where(and(eq(member.organizationId, inviteData.organizationId), eq(member.userId, currentUserId)))
      .limit(1)

    if (existingMember.length > 0) {
      return { success: false, error: "You are already a member" }
    }

    // Add user to organization
    await db.insert(member).values({
      id: nanoid(),
      organizationId: inviteData.organizationId,
      userId: currentUserId,
      role: inviteData.role || "member",
      createdAt: new Date(),
    })

    // Mark invitation as accepted
    await db.update(invitation).set({ status: "accepted" }).where(eq(invitation.id, inviteId))

    // Get organization details
    const org = await db.select().from(organization).where(eq(organization.id, inviteData.organizationId)).limit(1)

    return {
      success: true,
      organizationId: inviteData.organizationId,
      organizationName: org[0]?.name,
    }
  } catch (error) {
    console.error("Error accepting invite:", error)
    return { success: false, error: "Failed to accept invitation" }
  }
}

export async function getInvite(inviteId: string) {
  try {
    const invite = await db
      .select({
        id: invitation.id,
        email: invitation.email,
        roleId: invitation.role,
        roleName: roles.name,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        organizationName: organization.name,
        inviterName: user.name,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.organizationId, organization.id))
      .innerJoin(user, eq(invitation.inviterId, user.id))
      .innerJoin(roles, eq(invitation.role, roles.id))
      .where(eq(invitation.id, inviteId))
      .limit(1)

    if (!invite.length) {
      return { success: false, error: "Invitation not found" }
    }

    return { success: true, invite: invite[0] }
  } catch (error) {
    console.error("Error getting invite:", error)
    return { success: false, error: "Failed to get invitation" }
  }
}

export async function getOrganizationRoles(organizationId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Get all roles for this organization
    const orgRoles = await db
      .select({
        id: roles.id,
        name: roles.name,
      })
      .from(roles)
      .where(eq(roles.organizationId, organizationId))

    return { success: true, roles: orgRoles }
  } catch (error) {
    console.error("Error getting organization roles:", error)
    return { success: false, error: "Failed to get roles" }
  }
}

export async function getPendingInvites(organizationId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Check if user has permission to view invites
    const canManage = await hasPermission(session.user.id, organizationId, PERMISSIONS.MANAGE_MEMBERS)

    if (!canManage) {
      return {
        success: false,
        error: "You don't have permission to view invitations",
      }
    }

    const invites = await db
      .select({
        id: invitation.id,
        email: invitation.email,
        roleId: invitation.role,
        roleName: roles.name,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        inviterName: user.name,
      })
      .from(invitation)
      .innerJoin(user, eq(invitation.inviterId, user.id))
      .innerJoin(roles, eq(invitation.role, roles.id))
      .where(and(eq(invitation.organizationId, organizationId), eq(invitation.status, "pending")))

    return { success: true, invites }
  } catch (error) {
    console.error("Error getting pending invites:", error)
    return { success: false, error: "Failed to get invitations" }
  }
}

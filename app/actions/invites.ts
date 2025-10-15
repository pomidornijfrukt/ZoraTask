"use server"

import { and, count, eq, gt } from "drizzle-orm"
import { nanoid } from "nanoid"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { invitation, member, organization, user } from "@/lib/db/schemas"

export async function acceptInvite(inviteId: string) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return { success: false, error: "Unauthorized" }
		}

		const currentUserId = session.user.id
		const currentUserEmail = session.user.email

		const invite = await db
			.select()
			.from(invitation)
			.where(eq(invitation.id, inviteId))
			.limit(1)

		if (!invite.length) {
			return { success: false, error: "Invitation not found" }
		}

		const inviteData = invite[0]

		if (inviteData.email !== currentUserEmail) {
			return {
				success: false,
				error: "This invitation is for a different email address",
			}
		}

		if (inviteData.status !== "pending") {
			return { success: false, error: "This invitation has already been used" }
		}

		if (new Date() > inviteData.expiresAt) {
			return { success: false, error: "This invitation has expired" }
		}

		const existingMember = await db
			.select()
			.from(member)
			.where(
				and(
					eq(member.organizationId, inviteData.organizationId),
					eq(member.userId, currentUserId),
				),
			)
			.limit(1)

		if (existingMember.length > 0) {
			return { success: false, error: "You are already a member" }
		}

		await db.insert(member).values({
			id: nanoid(),
			organizationId: inviteData.organizationId,
			userId: currentUserId,
			role: inviteData.role || "Member",
			createdAt: new Date(),
		})

		await db
			.update(invitation)
			.set({ status: "accepted" })
			.where(eq(invitation.id, inviteId))

		const org = await db
			.select()
			.from(organization)
			.where(eq(organization.id, inviteData.organizationId))
			.limit(1)

		return {
			success: true,
			organizationId: inviteData.organizationId,
			organizationName: org[0]?.name,
			organizationSlug: org[0]?.slug,
		}
	} catch (error) {
		console.error("Error accepting invite:", error)
		return { success: false, error: "Failed to accept invitation" }
	}
}

export async function rejectInvite(inviteId: string) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return { success: false, error: "Unauthorized" }
		}

		const currentUserEmail = session.user.email

		const invite = await db
			.select()
			.from(invitation)
			.where(eq(invitation.id, inviteId))
			.limit(1)

		if (!invite.length) {
			return { success: false, error: "Invitation not found" }
		}

		const inviteData = invite[0]

		if (inviteData.email !== currentUserEmail) {
			return {
				success: false,
				error: "This invitation is for a different email address",
			}
		}

		if (inviteData.status !== "pending") {
			return { success: false, error: "This invitation has already been used" }
		}

		await db
			.update(invitation)
			.set({ status: "rejected" })
			.where(eq(invitation.id, inviteId))

		return { success: true }
	} catch (error) {
		console.error("Error rejecting invite:", error)
		return { success: false, error: "Failed to reject invitation" }
	}
}

export async function getUserPendingInvites() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user?.email) {
			return { success: false, error: "Unauthorized" }
		}

		const userEmail = session.user.email
		const now = new Date()

		const invites = await db
			.select({
				id: invitation.id,
				organizationName: organization.name,
				roleName: invitation.role,
				inviterName: user.name,
				expiresAt: invitation.expiresAt,
			})
			.from(invitation)
			.innerJoin(organization, eq(invitation.organizationId, organization.id))
			.innerJoin(user, eq(invitation.inviterId, user.id))
			.where(
				and(
					eq(invitation.email, userEmail),
					eq(invitation.status, "pending"),
					gt(invitation.expiresAt, now),
				),
			)
			.orderBy(invitation.expiresAt)

		return { success: true, invites }
	} catch (error) {
		console.error("Error getting user pending invites:", error)
		return { success: false, error: "Failed to get invitations" }
	}
}

export async function getUserPendingInvitesCount() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user?.email) {
			return { success: false, error: "Unauthorized" }
		}

		const userEmail = session.user.email
		const now = new Date()

		const result: { count: number }[] = await db
			.select({ count: count() })
			.from(invitation)
			.where(
				and(
					eq(invitation.email, userEmail),
					eq(invitation.status, "pending"),
					gt(invitation.expiresAt, now),
				),
			)

		const pendingCount = result[0]?.count || 0

		return { success: true, count: pendingCount }
	} catch (error) {
		console.error("Error getting user pending invites count:", error)
		return { success: false, error: "Failed to get invites count" }
	}
}

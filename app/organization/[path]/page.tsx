import { InviteMemberDialog } from "@/components/invite-member-dialog"
import { PendingInvitesList } from "@/components/pending-invites-list"
import { db } from "@/lib/db"
import { organization, roles, invitation, user } from "@/lib/db/schemas"
import { eq, and } from "drizzle-orm"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ path: string }>
}

export default async function OrganizationInvitesPage({ params }: PageProps) {
  const { path } = await params

  // Get organization by slug
  const org = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, path))
    .limit(1)

  if (!org.length) {
    notFound()
  }

  const organizationId = org[0].id
  const organizationName = org[0].name

  // Fetch roles on the server side
  const orgRoles = await db
    .select({
      id: roles.id,
      name: roles.name,
    })
    .from(roles)
    .where(eq(roles.organizationId, organizationId))

  // Fetch pending invites on the server side
  const pendingInvites = await db
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
    .where(and(
      eq(invitation.organizationId, organizationId), 
      eq(invitation.status, "pending")
    ))

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Invitations</h1>
          <p className="text-muted-foreground">Manage pending invitations to {organizationName}</p>
        </div>
        <InviteMemberDialog organizationId={organizationId} roles={orgRoles} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pending Invitations</h2>
        <PendingInvitesList
          organizationId={organizationId}
          initialInvites={pendingInvites.map((invite) => ({
            ...invite,
            roleId: invite.roleId ?? "",
            expiresAt: invite.expiresAt instanceof Date ? invite.expiresAt.toISOString() : String(invite.expiresAt),
          }))}
        />
      </div>
    </div>
  )
}

import { InviteMemberDialog } from "@/components/invite-member-dialog"
import { PendingInvitesList } from "@/components/pending-invites-list"

interface PageProps {
  params: Promise<{ orgId: string }>
}

export default async function OrganizationInvitesPage({ params }: PageProps) {
  const { orgId } = await params

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Invitations</h1>
          <p className="text-muted-foreground">Manage pending invitations to your organization</p>
        </div>
        <InviteMemberDialog organizationId={orgId} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pending Invitations</h2>
        <PendingInvitesList organizationId={orgId} />
      </div>
    </div>
  )
}

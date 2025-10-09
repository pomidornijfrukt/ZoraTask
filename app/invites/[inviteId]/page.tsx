import { getInvite } from "@/app/actions/invites"
import { AcceptInviteClient } from "./accept-invite-client"

interface PageProps {
  params: Promise<{ inviteId: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { inviteId } = await params
  const result = await getInvite(inviteId)

  if (!result.success || !result.invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-2xl font-bold">Invitation Not Found</h1>
          <p className="text-muted-foreground">This invitation link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  const { invite } = result

  // Check if expired
  if (new Date() > new Date(invite.expiresAt)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-2xl font-bold">Invitation Expired</h1>
          <p className="text-muted-foreground">
            This invitation has expired. Please contact the organization admin for a new invitation.
          </p>
        </div>
      </div>
    )
  }

  // Check if already accepted
  if (invite.status !== "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-2xl font-bold">Invitation Already Used</h1>
          <p className="text-muted-foreground">This invitation has already been accepted.</p>
        </div>
      </div>
    )
  }

  return <AcceptInviteClient invite={invite} inviteId={inviteId} />
}
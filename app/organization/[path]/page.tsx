import { InviteMemberDialog } from "@/components/invite-member-dialog"
import { PendingInvitesList } from "@/components/pending-invites-list"
import { db } from "@/lib/db"
import { organization } from "@/lib/db/schemas"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ path: string }>
}

export default async function OrganizationInvitesPage({ params }: PageProps) {
  const { path } = await params

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

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Invitations</h1>
          <p className="text-muted-foreground">
            Manage pending invitations to {organizationName}
          </p>
        </div>
        <InviteMemberDialog 
          organizationId={organizationId}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pending Invitations</h2>
        <PendingInvitesList 
          organizationId={organizationId} 
        />
      </div>
    </div>
  )
}
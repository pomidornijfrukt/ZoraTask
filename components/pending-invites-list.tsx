"use client"

import { useEffect, useState } from "react"
import { getPendingInvites } from "@/app/actions/invites"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

interface PendingInvite {
  id: string
  email: string
  role: string | null
  status: string
  expiresAt: Date
  inviterName: string | null
}

interface PendingInvitesListProps {
  organizationId: string
}

export function PendingInvitesList({ organizationId }: PendingInvitesListProps) {
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadInvites() {
      setIsLoading(true)
      const result = await getPendingInvites(organizationId)

      if (result.success && result.invites) {
        setInvites(result.invites)
      } else {
        setError(result.error || "Failed to load invitations")
      }
      setIsLoading(false)
    }

    loadInvites()
  }, [organizationId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
    )
  }

  if (invites.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No pending invitations
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Invited By</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell className="font-medium">{invite.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{invite.role || "member"}</Badge>
              </TableCell>
              <TableCell>{invite.inviterName || "Unknown"}</TableCell>
              <TableCell>{new Date(invite.expiresAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="outline">{invite.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

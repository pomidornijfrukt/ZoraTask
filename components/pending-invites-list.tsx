"use client"

import { useEffect, useState } from 'react'
import { getPendingInvites } from '@/app/actions/invites'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface PendingInvitesListProps {
  organizationId: string
}

export function PendingInvitesList({ organizationId }: PendingInvitesListProps) {
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInvites()
  }, [organizationId])

  const loadInvites = async () => {
    try {
      const result = await getPendingInvites(organizationId)
      if (result.success) {
        setInvites(result.invites || [])
      } else {
        setError(result.error || 'Failed to load invites')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spinner />
  if (error) return <div className="text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      {invites.length === 0 ? (
        <p className="text-muted-foreground">No pending invitations</p>
      ) : (
        invites.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">{invite.email}</p>
              <p className="text-sm text-muted-foreground">
                Role: {invite.roleName} • Expires: {new Date(invite.expiresAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Invited by: {invite.inviterName}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Resend
            </Button>
          </div>
        ))
      )}
    </div>
  )
}

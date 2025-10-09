"use client"

import { useEffect, useState } from 'react'
import { getPendingInvites } from '@/app/actions/invites'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (invites.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No pending invitations. Invite team members to get started.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{invite.email}</CardTitle>
                <CardDescription>
                  Invited by {invite.inviterName} • Role: {invite.roleName}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Resend
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-muted-foreground">
              Expires: {new Date(invite.expiresAt).toLocaleDateString()} at{' '}
              {new Date(invite.expiresAt).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
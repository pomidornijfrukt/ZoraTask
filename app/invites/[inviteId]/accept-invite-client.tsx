"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { acceptInvite } from "@/app/actions/invites"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

interface AcceptInviteClientProps {
  invite: {
    id: string
    email: string
    roleId: string | null
    roleName: string
    organizationName: string
    inviterName: string | null
  }
  inviteId: string
}

export function AcceptInviteClient({ invite, inviteId }: AcceptInviteClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAccept = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await acceptInvite(inviteId)

      if (result.success) {
        // Redirect to organization page
        router.push(`/organization/${result.organizationSlug}`)
      } else {
        setError(result.error || "Failed to accept invitation")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">You're Invited!</h1>
          <p className="text-muted-foreground">
            {invite.inviterName || "Someone"} has invited you to join <strong>{invite.organizationName}</strong>
          </p>
        </div>

        <div className="space-y-3 rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email:</span>
            <span className="text-sm font-medium">{invite.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant="secondary">{invite.roleName}</Badge>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button onClick={handleAccept} disabled={isLoading} className="w-full" size="lg">
          {isLoading && <Spinner className="mr-2 h-4 w-4" />}
          Accept Invitation
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By accepting, you'll become a member of this organization
        </p>
      </div>
    </div>
  )
}

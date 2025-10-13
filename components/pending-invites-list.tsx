"use client"

import { useState } from "react"
import { resendInvite } from "@/app/actions/invites"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface PendingInvitesListProps {
	organizationId: string
	initialInvites: Array<{
		id: string
		email: string
		roleId: string
		roleName: string
		status: string
		expiresAt: string
		inviterName: string
	}>
}

export function PendingInvitesList({
	initialInvites,
}: PendingInvitesListProps) {
	const [invites, setInvites] = useState(initialInvites)
	const [loadingId, setLoadingId] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const handleResend = async (inviteId: string) => {
		setLoadingId(inviteId)
		setError(null)

		try {
			const result = await resendInvite(inviteId)

			if (result.success) {
				// Update the local state to reflect the new expiration date
				setInvites((prev) =>
					prev.map((invite) => {
						if (invite.id === inviteId) {
							const newExpiresAt = new Date()
							newExpiresAt.setDate(newExpiresAt.getDate() + 7)
							return {
								...invite,
								expiresAt: newExpiresAt.toISOString(),
							}
						}
						return invite
					}),
				)
			} else {
				setError(result.error || "Failed to resend invitation")
			}
		} catch (_err) {
			setError("An unexpected error occurred")
		} finally {
			setLoadingId(null)
		}
	}

	const isExpired = (expiresAt: string) => new Date() > new Date(expiresAt)

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
			{error && (
				<div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
					{error}
				</div>
			)}

			{invites.map((invite) => {
				const expired = isExpired(invite.expiresAt)
				return (
					<Card key={invite.id} className={expired ? "opacity-60" : ""}>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-base">{invite.email}</CardTitle>
									<CardDescription>
										Invited by {invite.inviterName} • Role: {invite.roleName}
									</CardDescription>
								</div>
								<div className="flex items-center space-x-2">
									{expired && (
										<Badge variant="destructive" className="text-xs">
											Expired
										</Badge>
									)}
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleResend(invite.id)}
										disabled={loadingId === invite.id}
									>
										{loadingId === invite.id ? (
											<Spinner className="h-4 w-4" />
										) : (
											"Resend"
										)}
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pt-0">
							<div className="text-sm text-muted-foreground">
								Expires: {new Date(invite.expiresAt).toLocaleDateString()} at{" "}
								{new Date(invite.expiresAt).toLocaleTimeString()}
								{expired && " (Expired)"}
							</div>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}

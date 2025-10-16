"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { acceptInvite, rejectInvite } from "@/app/actions/invites"
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

interface InboxClientProps {
	initialInvites: Array<{
		id: string
		organizationName: string
		roleName: string
		inviterName: string
		expiresAt: Date
	}>
	onInviteUpdate?: () => void
}

export function InboxClient({
	initialInvites,
	onInviteUpdate,
}: InboxClientProps) {
	const [invites, setInvites] = useState(initialInvites)
	const [loadingId, setLoadingId] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const handleAccept = async (inviteId: string) => {
		setLoadingId(inviteId)
		setError(null)

		try {
			const result = await acceptInvite(inviteId)

			if (result.success) {
				setInvites((prev) => prev.filter((invite) => invite.id !== inviteId))
				onInviteUpdate?.()
				// TODO: Redirect to organizations
				router.push(`/account/organizations`)
			} else {
				setError(result.error || "Failed to accept invitation")
			}
		} catch (_err) {
			setError("An unexpected error occurred")
		} finally {
			setLoadingId(null)
		}
	}

	const handleReject = async (inviteId: string) => {
		setLoadingId(inviteId)
		setError(null)

		try {
			const result = await rejectInvite(inviteId)

			if (result.success) {
				setInvites((prev) => prev.filter((invite) => invite.id !== inviteId))
				onInviteUpdate?.()
			} else {
				setError(result.error || "Failed to reject invitation")
			}
		} catch (_err) {
			setError("An unexpected error occurred")
		} finally {
			setLoadingId(null)
		}
	}

	const isExpired = (expiresAt: Date) => new Date() > new Date(expiresAt)

	if (invites.length === 0) {
		return (
			<div className="container mx-auto max-w-4xl py-8">
				<div className="text-center space-y-4">
					<h1 className="text-3xl font-bold">Invites</h1>
					<p className="text-muted-foreground">
						You don't have any pending invitations.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto max-w-4xl space-y-6 py-8">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Invites</h1>
				<p className="text-muted-foreground">
					Manage your organization invitations
				</p>
			</div>

			{error && (
				<div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
					{error}
				</div>
			)}

			<div className="space-y-4">
				{invites.map((invite) => {
					const expired = isExpired(invite.expiresAt)
					return (
						<Card key={invite.id} className={expired ? "opacity-60" : ""}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-xl">
											{invite.organizationName}
										</CardTitle>
										<CardDescription>
											Invited by {invite.inviterName} • Role: {invite.roleName}
										</CardDescription>
									</div>
									<Badge variant={expired ? "destructive" : "secondary"}>
										{invite.roleName}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">
										<div>
											Expires: {new Date(invite.expiresAt).toLocaleDateString()}
											{expired && " (Expired)"}
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<Button
											variant="outline"
											onClick={() => handleReject(invite.id)}
											disabled={loadingId === invite.id}
											size="sm"
										>
											{loadingId === invite.id ? (
												<Spinner className="h-4 w-4" />
											) : (
												"Reject"
											)}
										</Button>
										<Button
											onClick={() => handleAccept(invite.id)}
											disabled={loadingId === invite.id || expired}
											size="sm"
										>
											{loadingId === invite.id && (
												<Spinner className="mr-2 h-4 w-4" />
											)}
											{expired ? "Expired" : "Accept"}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</div>
	)
}

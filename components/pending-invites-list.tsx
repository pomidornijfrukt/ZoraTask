"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

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
	const [invites, _setInvites] = useState(initialInvites)

	const handleResend = async (inviteId: string) => {
		// Implement resend functionality here
		console.log("Resend invite:", inviteId)
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
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleResend(invite.id)}
							>
								Resend
							</Button>
						</div>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="text-sm text-muted-foreground">
							Expires: {new Date(invite.expiresAt).toLocaleDateString()} at{" "}
							{new Date(invite.expiresAt).toLocaleTimeString()}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

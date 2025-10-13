"use client"

import { useCallback, useEffect, useState } from "react"
import { getUserPendingInvites } from "@/app/actions/invites"
import { InboxClient } from "./inbox-client"

interface Invite {
	id: string
	organizationName: string
	roleName: string
	inviterName: string
	expiresAt: Date
}

export default function InboxPage() {
	const [invites, setInvites] = useState<Invite[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchInvites = useCallback(async () => {
		setLoading(true)
		const result = await getUserPendingInvites()

		if (result.success) {
			setInvites(result.invites || [])
		} else {
			setError(result.error || "Failed to load invites")
		}
		setLoading(false)
	}, []) // Empty dependency array since we don't use any external variables

	useEffect(() => {
		fetchInvites()
	}, [fetchInvites]) // Now fetchInvites is stable and won't cause re-renders

	if (loading) {
		return (
			<div className="container mx-auto max-w-4xl py-8">
				<div className="text-center">Loading...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="container mx-auto max-w-4xl py-8">
				<div className="text-center text-destructive">Error: {error}</div>
			</div>
		)
	}

	return <InboxClient initialInvites={invites} onInviteUpdate={fetchInvites} />
}

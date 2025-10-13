import { getUserPendingInvites } from "@/app/actions/invites"
import { InboxClient } from "./inbox-client"

export default async function InboxPage() {
	const result = await getUserPendingInvites()

	if (!result.success) {
		return (
			<div className="container mx-auto max-w-4xl py-8">
				<div className="text-center text-destructive">
					Error: {result.error}
				</div>
			</div>
		)
	}

	return <InboxClient initialInvites={result.invites ?? []} />
}
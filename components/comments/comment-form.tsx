"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createComment } from "@/lib/actions/comments"

interface CommentFormProps {
	taskId: string
	currentUser?: {
		id: string
		name: string
		image: string | null
	}
	onCommentAdded: () => void
}

export function CommentForm({
	taskId,
	currentUser,
	onCommentAdded,
}: CommentFormProps) {
	const [body, setBody] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!body.trim()) return

		setIsSubmitting(true)
		try {
			await createComment({ taskId, body })
			setBody("")
			onCommentAdded()
		} catch (err) {
			console.error(err)
			alert("Failed to add comment")
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!currentUser) {
		return null
	}

	return (
		<form onSubmit={handleSubmit} className="flex gap-3">
			<Avatar className="h-8 w-8 flex-shrink-0">
				<AvatarImage
					src={currentUser.image ?? undefined}
					alt={currentUser.name}
				/>
				<AvatarFallback className="text-xs bg-muted text-muted-foreground">
					{currentUser.name
						.split(" ")
						.map((n) => n[0])
						.join("")}
				</AvatarFallback>
			</Avatar>

			<div className="flex-1 space-y-2">
				<Textarea
					placeholder="Add a comment..."
					value={body}
					onChange={(e) => setBody(e.target.value)}
					className="min-h-[80px]"
					disabled={isSubmitting}
				/>
				<Button type="submit" size="sm" disabled={isSubmitting || !body.trim()}>
					{isSubmitting ? "Adding..." : "Add Comment"}
				</Button>
			</div>
		</form>
	)
}

"use client"

import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { CommentWithAuthor } from "@/lib/data/comments"
import { CommentForm } from "./comment-form"
import { CommentItem } from "./comment-item"

interface CommentsListProps {
	taskId: string
	initialComments: CommentWithAuthor[]
	currentUser?: {
		id: string
		name: string
		image: string | null
	}
}

export function CommentsList({
	taskId,
	initialComments,
	currentUser,
}: CommentsListProps) {
	const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments)
	const router = useRouter()

	useEffect(() => {
		setComments(initialComments)
	}, [initialComments])

	function handleUpdate() {
		router.refresh()
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<MessageSquare className="h-5 w-5 text-muted-foreground" />
				<h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
			</div>

			<div className="space-y-4">
				{comments.length === 0 ? (
					<p className="text-sm text-muted-foreground py-4">
						No comments yet. Be the first to comment!
					</p>
				) : (
					comments.map((comment) => (
						<CommentItem
							key={comment.id}
							comment={comment}
							currentUserId={currentUser?.id}
							onUpdate={handleUpdate}
						/>
					))
				)}
			</div>

			<div className="pt-4 border-t">
				<CommentForm
					taskId={taskId}
					currentUser={currentUser}
					onCommentAdded={handleUpdate}
				/>
			</div>
		</div>
	)
}

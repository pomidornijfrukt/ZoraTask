"use client"

import { formatDistanceToNow } from "date-fns"
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { deleteComment, updateComment } from "@/lib/actions/comments"
import type { CommentWithAuthor } from "@/lib/data/comments"

interface CommentItemProps {
	comment: CommentWithAuthor
	currentUserId?: string
	onUpdate: () => void
}

export function CommentItem({
	comment,
	currentUserId,
	onUpdate,
}: CommentItemProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editBody, setEditBody] = useState(comment.body)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const isAuthor = currentUserId === comment.author.id

	async function handleUpdate() {
		if (!editBody.trim()) return

		setIsSubmitting(true)
		try {
			await updateComment(comment.id, editBody)
			setIsEditing(false)
			onUpdate()
		} catch (err) {
			console.error(err)
			alert("Failed to update comment")
		} finally {
			setIsSubmitting(false)
		}
	}

	async function handleDelete() {
		if (!confirm("Delete this comment? This action cannot be undone.")) return

		setIsSubmitting(true)
		try {
			await deleteComment(comment.id)
			onUpdate()
		} catch (err) {
			console.error(err)
			alert("Failed to delete comment")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="flex gap-3 group">
			<Avatar className="h-8 w-8 flex-shrink-0">
				<AvatarImage
					src={comment.author.image ?? undefined}
					alt={comment.author.name}
				/>
				<AvatarFallback className="text-xs bg-muted text-muted-foreground">
					{comment.author.name
						.split(" ")
						.map((n) => n[0])
						.join("")}
				</AvatarFallback>
			</Avatar>

			<div className="flex-1 space-y-1">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium">{comment.author.name}</span>
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(comment.createdAt), {
							addSuffix: true,
						})}
					</span>
					{comment.createdAt.getTime() !== comment.updatedAt.getTime() && (
						<span className="text-xs text-muted-foreground">(edited)</span>
					)}
				</div>

				{isEditing ? (
					<div className="space-y-2">
						<Textarea
							value={editBody}
							onChange={(e) => setEditBody(e.target.value)}
							className="min-h-[60px]"
							disabled={isSubmitting}
						/>
						<div className="flex gap-2">
							<Button
								size="sm"
								onClick={handleUpdate}
								disabled={isSubmitting || !editBody.trim()}
							>
								{isSubmitting ? "Saving..." : "Save"}
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									setEditBody(comment.body)
									setIsEditing(false)
								}}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<p className="text-sm text-foreground whitespace-pre-wrap">
						{comment.body}
					</p>
				)}
			</div>

			{isAuthor && !isEditing && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => setIsEditing(true)}
							className="flex items-center gap-2"
						>
							<Edit2 className="h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleDelete}
							className="flex items-center gap-2 text-destructive"
						>
							<Trash2 className="h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	)
}

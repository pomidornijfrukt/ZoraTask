"use client"

import type { User } from "better-auth"
import { CommentsList } from "@/components/comments"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import type { CommentWithAuthor } from "@/lib/data/comments"
import type { Task, TaskMetadata } from "@/lib/types"

interface TaskDetailsDialogProps {
	task: Task
	metadata: TaskMetadata
	comments: CommentWithAuthor[]
	currentUser?: User
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function TaskDetailsDialog({
	task,
	metadata,
	comments,
	currentUser,
	open,
	onOpenChange,
}: TaskDetailsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{task.name}</DialogTitle>
					<DialogDescription>Task details and discussion</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Task Info */}
					<div className="space-y-4">
						<div>
							<h4 className="text-sm font-medium text-muted-foreground mb-2">
								Description
							</h4>
							{metadata?.description ? (
								<p className="text-sm whitespace-pre-wrap">
									{metadata.description.body}
								</p>
							) : (
								<p className="text-sm text-muted-foreground">
									No description provided
								</p>
							)}
						</div>

						{metadata?.priority && (
							<div>
								<h4 className="text-sm font-medium text-muted-foreground mb-2">
									Priority
								</h4>
								<span className="text-sm px-2 py-1 rounded bg-muted text-muted-foreground">
									{metadata.priority.name}
								</span>
							</div>
						)}

						{metadata?.assignees && metadata.assignees.length > 0 && (
							<div>
								<h4 className="text-sm font-medium text-muted-foreground mb-2">
									Assignees
								</h4>
								<div className="flex flex-wrap gap-2">
									{metadata.assignees.map((assignee) => (
										<span
											key={assignee.id}
											className="text-sm px-2 py-1 rounded bg-muted text-muted-foreground"
										>
											{assignee.name}
										</span>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Comments Section */}
					<div className="pt-6 border-t">
						<CommentsList
							taskId={task.id}
							initialComments={comments}
							currentUser={
								currentUser
									? {
											id: currentUser.id,
											name: currentUser.name,
											image: currentUser.image ?? null,
										}
									: undefined
							}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

"use server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getTaskMetadata } from "@/lib/data/task"
import type { Task } from "@/lib/types"

export async function TaskCardContent({ task }: { task: Task }) {
	const metadata = await getTaskMetadata(task.id)
	return (
		<div className="space-y-3">
			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<h4 className="font-medium text-foreground text-sm leading-tight">
					{task.name}
				</h4>
				{metadata.priority?.name}
			</div>

			{/* Description */}
			<p className="text-sm text-muted-foreground line-clamp-2">
				{metadata.description?.body}
			</p>

			{/* Assignees */}
			<div className="flex items-center justify-between">
				{metadata.assignees.map((assignee) => (
					<Avatar key={assignee.id} className="h-6 w-6">
						<AvatarImage
							src={assignee.image ?? undefined}
							alt={assignee.name}
						/>
						<AvatarFallback className="text-xs bg-muted text-muted-foreground">
							{assignee.name
								.split(" ")
								.map((n) => n[0])
								.join("")}
						</AvatarFallback>
					</Avatar>
				))}
			</div>
		</div>
	)
}

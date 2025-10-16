"use client"

import type { User } from "better-auth"
import { useState } from "react"
import { useDragAndDrop } from "@/hooks/use-drag-and-drop"
import type { CommentWithAuthor } from "@/lib/data/comments"
import { getTaskComments } from "@/lib/data/comments"
import type {
	Category,
	Priority,
	Project,
	Task,
	TaskMetadata,
} from "@/lib/types"
import { AddCategoryButton } from "./add-category"
import { Column } from "./category-column"
import { TaskCard } from "./task-card"
import { TaskDetailsDialog } from "./task-details-dialog"

interface KanbanBoardProps {
	project: Project
	tasks: Task[]
	categories: Category[]
	priorities: Priority[]
	createCategory: (projectId: string, name: string) => Promise<Category>
	metadatas: TaskMetadata[]
	members: User[]
	currentUser?: User
}

export function KanbanBoard({
	project,
	tasks: initialTasks,
	categories,
	priorities,
	createCategory,
	metadatas,
	members,
	currentUser,
}: KanbanBoardProps) {
	const { tasks, handleDragStart, handleDragOver, handleDrop } =
		useDragAndDrop(initialTasks)

	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
	const [detailsOpen, setDetailsOpen] = useState(false)
	const [taskComments, setTaskComments] = useState<CommentWithAuthor[]>([])

	async function handleViewDetails(taskId: string) {
		setSelectedTaskId(taskId)
		const comments = await getTaskComments(taskId)
		setTaskComments(comments)
		setDetailsOpen(true)
	}

	function handleCloseDetails() {
		setDetailsOpen(false)
		setSelectedTaskId(null)
		setTaskComments([])
	}

	const selectedTask = selectedTaskId
		? tasks.find((t) => t.id === selectedTaskId)
		: null
	const selectedMetadata = selectedTaskId
		? metadatas.find((m) => m.task.id === selectedTaskId)
		: null

	return (
		<div className="flex gap-6 overflow-x-auto pb-4">
			{categories.map((category) => {
				const columnTasks = tasks.filter(
					(task) => task.categoryId === category.id,
				)
				return (
					<Column
						key={category.id}
						projectId={project.id}
						category={category}
						priorities={priorities}
						handleDragOver={handleDragOver}
						handleDrop={handleDrop}
					>
						{columnTasks.map((task) => {
							const metadata = metadatas.find((m) => m.task.id === task.id)
							if (!metadata) return null
							return (
								<TaskCard
									key={task.id}
									task={task}
									handleDragStart={handleDragStart}
									metadata={metadata}
									priorities={priorities}
									members={members}
									onViewDetails={handleViewDetails}
								/>
							)
						})}
					</Column>
				)
			})}

			<div className="flex-shrink-0 w-80">
				<AddCategoryButton
					projectId={project.id}
					createCategory={createCategory}
				/>
			</div>

			{selectedTask && selectedMetadata && (
				<TaskDetailsDialog
					task={selectedTask}
					metadata={selectedMetadata}
					comments={taskComments}
					currentUser={currentUser}
					open={detailsOpen}
					onOpenChange={handleCloseDetails}
				/>
			)}
		</div>
	)
}

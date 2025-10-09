"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useDragAndDrop } from "@/hooks/use-drag-and-drop"
import type { Category, Priority, Project, Task } from "@/lib/types"
import { AddCategoryButton } from "./project/add-category"
import { Column } from "./project/category-column"
import { TaskCardContent } from "./project/task-card-content"

interface KanbanBoardProps {
	project: Project
	tasks: Task[]
	categories: Category[]
	priorities: Priority[]
	createCategory: (projectId: string, name: string) => Promise<Category>
}

export function KanbanBoard({
	project,
	tasks: initialTasks,
	categories,
	priorities,
	createCategory,
}: KanbanBoardProps) {
	const { tasks, handleDragStart, handleDragOver, handleDrop } =
		useDragAndDrop(initialTasks)

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
						{columnTasks.map(async (task) => (
							<TaskCard
								key={task.id}
								task={task}
								handleDragStart={handleDragStart}
							/>
						))}
					</Column>
				)
			})}

			<div className="flex-shrink-0 w-80">
				<AddCategoryButton
					projectId={project.id}
					createCategory={createCategory}
				/>
			</div>
		</div>
	)
}

function TaskCard({
	task,
	handleDragStart,
}: {
	task: Task

	handleDragStart: (e: React.DragEvent, task: Task) => void
}) {
	return (
		<Card
			className="bg-background border-border cursor-move hover:border-primary/50 transition-colors"
			draggable
			onDragStart={(e) => handleDragStart(e, task)}
		>
			<CardContent className="p-4">
				<TaskCardContent task={task} />
			</CardContent>
		</Card>
	)
}

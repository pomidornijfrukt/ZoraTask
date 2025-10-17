"use client"

import type { User } from "better-auth"
import { useDragAndDrop } from "@/hooks/use-drag-and-drop"
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

interface KanbanBoardProps {
	project: Project
	tasks: Task[]
	categories: Category[]
	priorities: Priority[]
	createCategory: (projectId: string, name: string) => Promise<Category>
	metadatas: TaskMetadata[]
	members: User[]
}

export function KanbanBoard({
	project,
	tasks: initialTasks,
	categories,
	priorities,
	createCategory,
	metadatas,
	members,
}: KanbanBoardProps) {
	const {
		tasks,
		handleCreateTask,
		handleDragStart,
		handleDragOver,
		handleDrop,
	} = useDragAndDrop(initialTasks)

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
						handleCreateTask={handleCreateTask}
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
		</div>
	)
}

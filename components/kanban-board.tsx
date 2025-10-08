"use client"

import { Plus } from "lucide-react"
import type React from "react"
import type { ComponentProps } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDragAndDrop } from "@/hooks/use-drag-and-drop"
import type { Project, Task, TaskMetadata } from "@/lib/types"

interface KanbanBoardProps {
	project: Project
	tasks: Task[]
	metadata: TaskMetadata
}

interface Column {
	id: Task["categoryId"]
	title: string
	color: string
}

const columns: Column[] = [
	{ id: "todo", title: "To Do", color: "bg-muted" },
	{ id: "in-progress", title: "In Progress", color: "bg-yellow-500/10" },
	{ id: "done", title: "Done", color: "bg-green-500/10" },
]

export function KanbanBoard({
	project,
	tasks: initialTasks,
	metadata,
}: KanbanBoardProps) {
	const { tasks, handleDragStart, handleDragOver, handleDrop } =
		useDragAndDrop(initialTasks)

	return (
		<div className="flex gap-6 overflow-x-auto pb-4">
			{columns.map((column) => {
				const columnTasks = tasks.filter(
					(task) => task.categoryId === column.id,
				)

				return (
					<Column
						key={column.id}
						column={column}
						tasks={columnTasks}
						handleDragOver={handleDragOver}
						handleDrop={handleDrop}
					>
						{columnTasks.map((task) => {
							return (
								<TaskCard
									key={task.id}
									task={task}
									project={project}
									metadata={metadata}
									handleDragStart={handleDragStart}
								/>
							)
						})}
					</Column>
				)
			})}
		</div>
	)
}

function Column({
	column,
	tasks,
	children,
	handleDragOver,
	handleDrop,
	...props
}: {
	column: Column
	tasks: Task[]
	handleDragOver: (e: React.DragEvent) => void
	handleDrop: (e: React.DragEvent, status: Task["categoryId"]) => void
} & ComponentProps<"div">) {
	return (
		<Card
			className="flex-shrink-0 w-80 bg-card border-border h-full"
			onDragOver={handleDragOver}
			onDrop={(e) => handleDrop(e, column.id)}
			{...props}
		>
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-card-foreground flex items-center gap-2">
						<div
							className={`w-3 h-3 rounded-full ${column.color.replace("/10", "")}`}
						/>
						{column.title}
					</CardTitle>
					<Badge variant="secondary" className="bg-muted text-muted-foreground">
						{tasks.length}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				{children}

				<Button
					variant="ghost"
					className="w-full border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Task
				</Button>
			</CardContent>
		</Card>
	)
}

async function TaskCard({
	task,
	handleDragStart,
	metadata,
}: {
	task: Task
	project: Project
	metadata: TaskMetadata
	handleDragStart: (e: React.DragEvent, task: Task) => void
}) {
	return (
		<Card
			key={task.id}
			className="bg-background border-border cursor-move hover:border-primary/50 transition-colors"
			draggable={true}
			onDragStart={(e) => handleDragStart(e, task)}
		>
			<CardContent className="p-4">
				<div className="space-y-3">
					{/* Task Header */}
					<div className="flex items-start justify-between gap-2">
						<h4 className="font-medium text-foreground text-sm leading-tight">
							{task.name}
						</h4>
						{metadata.priority.name}
					</div>

					{/* Task Description */}
					<p className="text-sm text-muted-foreground line-clamp-2">
						{metadata.description.body}
					</p>

					{/* Task Footer */}
					<div className="flex items-center justify-between">
						{metadata.assignees.map((assignee) => {
							return (
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
							)
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

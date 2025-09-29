"use client"

import { AlertTriangle, Calendar, Clock, Plus } from "lucide-react"
import type React from "react"
import type ComponentProps from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDragAndDrop } from "@/hooks/use-drag-and-drop"
import type { Project, Task } from "@/lib/data"
import { getMemberById } from "@/lib/data"

interface KanbanBoardProps {
	project: Project
	tasks: Task[]
}

interface Column {
	id: Task["status"]
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
}: KanbanBoardProps) {
	const { tasks, handleDragStart, handleDragOver, handleDrop } =
		useDragAndDrop(initialTasks)

	return (
		<div className="flex gap-6 overflow-x-auto pb-4">
			{columns.map((column) => {
				const columnTasks = tasks.filter((task) => task.status === column.id)

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
	handleDrop: (e: React.DragEvent, status: Task["status"]) => void
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

function TaskCard({
	task,
	project,
	handleDragStart,
}: {
	task: Task
	project: Project
	handleDragStart: (e: React.DragEvent, task: Task) => void
}) {
	const assignee = getMemberById(task.assigneeId, project)
	const overdue = new Date(task.dueDate) < new Date()

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "bg-red-500/10 text-red-500 border-red-500/20"
			case "medium":
				return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
			case "low":
				return "bg-green-500/10 text-green-500 border-green-500/20"
			default:
				return "bg-muted text-muted-foreground"
		}
	}

	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case "high":
				return <AlertTriangle className="h-3 w-3" />
			case "medium":
				return <Clock className="h-3 w-3" />
			case "low":
				return <Clock className="h-3 w-3" />
			default:
				return null
		}
	}

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
							{task.title}
						</h4>
						<Badge
							className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}
							variant="outline"
						>
							{getPriorityIcon(task.priority)}
							{task.priority}
						</Badge>
					</div>

					{/* Task Description */}
					<p className="text-sm text-muted-foreground line-clamp-2">
						{task.description}
					</p>

					{/* Task Footer */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Calendar className="h-3 w-3 text-muted-foreground" />
							<span
								className={`text-xs ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
							>
								{new Date(task.dueDate).toLocaleDateString()}
							</span>
							{overdue && (
								<Badge variant="destructive" className="text-xs px-1 py-0">
									Overdue
								</Badge>
							)}
						</div>

						{assignee && (
							<Avatar className="h-6 w-6">
								<AvatarImage
									src={assignee.avatar || "/placeholder.svg"}
									alt={assignee.name}
								/>
								<AvatarFallback className="text-xs bg-muted text-muted-foreground">
									{assignee.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

import { useState } from "react"
import type { Task } from "@/lib/data"

export function useDragAndDrop(initialTasks: Task[]) {
	const [tasks, setTasks] = useState<Task[]>(initialTasks)
	const [draggedTask, setDraggedTask] = useState<Task | null>(null)

	const handleDragStart = (e: React.DragEvent, task: Task) => {
		setDraggedTask(task)
		e.dataTransfer.effectAllowed = "move"
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		e.dataTransfer.dropEffect = "move"
	}

	const handleDrop = (e: React.DragEvent, newStatus: Task["status"]) => {
		e.preventDefault()
		if (!draggedTask) return

		setTasks((prev) =>
			prev.map((t) =>
				t.id === draggedTask.id ? { ...t, status: newStatus } : t,
			),
		)
		setDraggedTask(null)
	}

	return {
		tasks,
		setTasks,
		handleDragStart,
		handleDragOver,
		handleDrop,
	}
}

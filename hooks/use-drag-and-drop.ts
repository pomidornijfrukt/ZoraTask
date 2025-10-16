import { useState, useTransition } from "react"
import { updateTaskCategory } from "@/lib/actions/tasks"
import type { Task } from "@/lib/types"

export function useDragAndDrop(initialTasks: Task[]) {
	const [tasks, setTasks] = useState<Task[]>(initialTasks)
	const [draggedTask, setDraggedTask] = useState<Task | null>(null)
	const [isPending, startTransition] = useTransition()

	const handleDragStart = (e: React.DragEvent, task: Task) => {
		setDraggedTask(task)
		e.dataTransfer.effectAllowed = "move"
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		e.dataTransfer.dropEffect = "move"
	}

	const handleDrop = (
		e: React.DragEvent,
		newCategoryId: Task["categoryId"],
	) => {
		e.preventDefault()
		if (!draggedTask || !newCategoryId) return

		const updated = tasks.map((t) =>
			t.id === draggedTask.id ? { ...t, categoryId: newCategoryId } : t,
		)

		startTransition(() => setTasks(updated))
		startTransition(async () => {
			try {
				await updateTaskCategory(draggedTask.id, newCategoryId)
			} catch (err) {
				console.error("Failed to update category", err)
			}
		})

		setDraggedTask(null)
	}

	const handleCreateTask = (newTask: Task) => {
		setTasks([...tasks, newTask])
	}

	return {
		tasks,
		handleCreateTask,
		isPending,
		handleDragStart,
		handleDragOver,
		handleDrop,
	}
}

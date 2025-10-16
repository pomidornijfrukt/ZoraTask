"use client"

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
} from "@dnd-kit/sortable"
import type { User } from "better-auth"
import { useState } from "react"
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
	categories: initialCategories,
	priorities,
	createCategory,
	metadatas,
	members,
}: KanbanBoardProps) {
	const [tasks, setTasks] = useState(initialTasks)
	const [categories, setCategories] = useState(initialCategories)
	const [activeId, setActiveId] = useState<string | null>(null)

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	)

	// Sort categories by order
	const sortedCategories = [...categories].sort((a, b) => {
		const orderA = Number.parseInt(a.order || "0", 10)
		const orderB = Number.parseInt(b.order || "0", 10)
		return orderA - orderB
	})

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string)
	}

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event
		if (!over) return

		const activeId = active.id as string
		const overId = over.id as string

		// Check if we're dragging a task
		const activeTask = tasks.find((t) => t.id === activeId)
		if (!activeTask) return

		// Check if we're over a category (column)
		const overCategory = categories.find((c) => c.id === overId)
		if (overCategory && activeTask.categoryId !== overCategory.id) {
			setTasks((prevTasks) =>
				prevTasks.map((t) =>
					t.id === activeId ? { ...t, categoryId: overCategory.id } : t,
				),
			)
		}

		// Check if we're over another task
		const overTask = tasks.find((t) => t.id === overId)
		if (overTask && activeTask.categoryId === overTask.categoryId) {
			const categoryTasks = tasks.filter(
				(t) => t.categoryId === activeTask.categoryId,
			)
			const oldIndex = categoryTasks.findIndex((t) => t.id === activeId)
			const newIndex = categoryTasks.findIndex((t) => t.id === overId)

			if (oldIndex !== newIndex) {
				const reorderedTasks = arrayMove(categoryTasks, oldIndex, newIndex)
				setTasks((prevTasks) => {
					const otherTasks = prevTasks.filter(
						(t) => t.categoryId !== activeTask.categoryId,
					)
					return [...otherTasks, ...reorderedTasks]
				})
			}
		}
	}

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event
		setActiveId(null)

		if (!over) return

		const activeId = active.id as string
		const overId = over.id as string

		// Handle category reordering
		const activeCategory = categories.find((c) => c.id === activeId)
		if (activeCategory && categories.find((c) => c.id === overId)) {
			const oldIndex = categories.findIndex((c) => c.id === activeId)
			const newIndex = categories.findIndex((c) => c.id === overId)

			if (oldIndex !== newIndex) {
				const reorderedCategories = arrayMove(categories, oldIndex, newIndex)
				setCategories(reorderedCategories)

				// Update order in database
				const updates = reorderedCategories.map((cat, index) => ({
					id: cat.id,
					order: index.toString(),
				}))

				try {
					await fetch("/api/categories/order", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ updates }),
					})
				} catch (err) {
					console.error("Failed to update category order", err)
					setCategories(categories)
				}
			}
			return
		}

		// Handle task reordering
		const activeTask = tasks.find((t) => t.id === activeId)
		if (activeTask) {
			const categoryTasks = tasks.filter(
				(t) => t.categoryId === activeTask.categoryId,
			)
			const updates = categoryTasks.map((task, index) => ({
				id: task.id,
				order: index.toString(),
			}))

			// Update category if changed
			const overCategory = categories.find((c) => c.id === overId)
			if (overCategory && activeTask.categoryId !== overCategory.id) {
				try {
					await fetch("/api/tasks/category", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							taskId: activeTask.id,
							categoryId: overCategory.id,
						}),
					})
				} catch (err) {
					console.error("Failed to update task category", err)
					setTasks(initialTasks)
				}
			}

			// Update order
			try {
				await fetch("/api/tasks/order", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ updates }),
				})
			} catch (err) {
				console.error("Failed to update task order", err)
				setTasks(tasks)
			}
		}
	}

	const activeTask = tasks.find((t) => t.id === activeId)
	const activeMetadata = activeTask
		? metadatas.find((m) => m.task.id === activeTask.id)
		: null

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div className="flex gap-6 overflow-x-auto pb-4">
				<SortableContext
					items={sortedCategories.map((c) => c.id)}
					strategy={horizontalListSortingStrategy}
				>
					{sortedCategories.map((category) => {
						const columnTasks = tasks
							.filter((task) => task.categoryId === category.id)
							.sort((a, b) => {
								const orderA = Number.parseInt(a.order || "0", 10)
								const orderB = Number.parseInt(b.order || "0", 10)
								return orderA - orderB
							})

						return (
							<Column
								key={category.id}
								projectId={project.id}
								category={category}
								priorities={priorities}
								tasks={columnTasks}
								metadatas={metadatas}
								members={members}
							/>
						)
					})}
				</SortableContext>

				<div className="flex-shrink-0 w-80">
					<AddCategoryButton
						projectId={project.id}
						createCategory={createCategory}
					/>
				</div>
			</div>

			<DragOverlay>
				{activeTask && activeMetadata ? (
					<TaskCard
						task={activeTask}
						metadata={activeMetadata}
						priorities={priorities}
						members={members}
						isDragOverlay
					/>
				) : null}
			</DragOverlay>
		</DndContext>
	)
}

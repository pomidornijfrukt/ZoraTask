"use client"

import { useDroppable } from "@dnd-kit/core"
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { User } from "better-auth"
import { GripVertical, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { deleteCategory, updateCategory } from "@/lib/actions/categories"
import { createTask } from "@/lib/actions/tasks"
import type { Category, Priority, Task, TaskMetadata } from "@/lib/types"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { AddTaskButton } from "./add-task"
import { SortableTaskCard } from "./task-card"

interface ColumnContainerProps {
	category: Category
	tasks: Task[]
	projectId: string
	priorities: Priority[]
	metadatas: TaskMetadata[]
	members: User[]
}

export function Column({
	category,
	tasks,
	projectId,
	priorities,
	metadatas,
	members,
}: ColumnContainerProps) {
	const [isEditOpen, setIsEditOpen] = useState(false)
	const router = useRouter()

	const {
		attributes,
		listeners,
		setNodeRef: setSortableRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: category.id,
		data: {
			type: "category",
			category,
		},
	})

	const { setNodeRef: setDroppableRef } = useDroppable({
		id: category.id,
		data: {
			type: "category",
			category,
		},
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	}

	async function handleRename(formData: FormData) {
		const name = formData.get("name") as string
		if (!name || !name.trim()) throw new Error("Name is required")
		await updateCategory(category.id, name.trim())
		setIsEditOpen(false)
		router.refresh()
	}

	async function handleDelete() {
		await deleteCategory(category.id)
		router.refresh()
	}

	return (
		<Card
			ref={(node) => {
				setSortableRef(node)
				setDroppableRef(node)
			}}
			style={style}
			className="flex-shrink-0 w-80 bg-card border-border h-full"
		>
			<CardHeader className="pb-4 flex items-center justify-between">
				<div className="flex items-center gap-2 flex-1">
					<button
						type="button"
						{...attributes}
						{...listeners}
						className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
					>
						<GripVertical className="h-4 w-4 text-muted-foreground" />
					</button>
					<CardTitle className="text-card-foreground">
						{category.name}
					</CardTitle>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild={true}>
						<Button variant="ghost" size="sm">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
							Rename
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={handleDelete}>Delete</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>

			<CardContent className="space-y-3">
				<SortableContext
					items={tasks.map((t) => t.id)}
					strategy={verticalListSortingStrategy}
				>
					{tasks.map((task) => {
						const metadata = metadatas.find((m) => m.task.id === task.id)
						if (!metadata) return null
						return (
							<SortableTaskCard
								key={task.id}
								task={task}
								metadata={metadata}
								priorities={priorities}
								members={members}
							/>
						)
					})}
				</SortableContext>
				<AddTaskButton
					projectId={projectId}
					categoryId={category.id}
					priorities={priorities}
					createTask={createTask}
				/>
			</CardContent>

			{/* Rename Dialog */}
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Rename Category</DialogTitle>
					</DialogHeader>
					<form action={handleRename} className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-muted-foreground"
							>
								Name
							</label>
							<Input name="name" defaultValue={category.name} required />
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" type="button">
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit">Save</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</Card>
	)
}

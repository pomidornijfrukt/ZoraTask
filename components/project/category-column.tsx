"use client"

import type { User } from "better-auth"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { deleteCategory, updateCategory } from "@/lib/actions/categories"
import { createTask } from "@/lib/actions/tasks"
import type { Category, Priority } from "@/lib/types"
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

interface ColumnContainerProps {
	category: Category
	handleDragOver: (e: React.DragEvent) => void
	handleDrop: (e: React.DragEvent, newCategoryId: string) => void
	children: React.ReactNode
	projectId: string
	priorities: Priority[]
	members: User[]
}

export function Column({
	category,
	children,
	handleDragOver,
	handleDrop,
	projectId,
	priorities,
	members,
}: ColumnContainerProps) {
	const [isEditOpen, setIsEditOpen] = useState(false)
	const router = useRouter()

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
			className="flex-shrink-0 w-80 bg-card border-border h-full"
			onDragOver={handleDragOver}
			onDrop={(e) => handleDrop(e, category.id)}
		>
			<CardHeader className="pb-4 flex items-center justify-between">
				<div className="flex-1">
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
				{children}
				<AddTaskButton
					projectId={projectId}
					categoryId={category.id}
					priorities={priorities}
					members={members}
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

"use client"

import type { User } from "better-auth"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Priority, Task } from "@/lib/types"

interface AddTaskButtonProps {
	projectId: string
	categoryId: string
	priorities: Priority[]
	members: User[]
	createTask: (data: {
		name: string
		description: string
		categoryId: string
		priorityId: string
		projectId: string
		assignees?: string[]
	}) => Promise<Task>
}

export function AddTaskButton({
	projectId,
	categoryId,
	priorities,
	members,
	createTask,
}: AddTaskButtonProps) {
	const router = useRouter()
	const [open, setOpen] = useState(false)

	const handle = async (formData: FormData) => {
		const name = formData.get("name") as string
		const description = formData.get("description") as string
		const priorityId = formData.get("priorityId") as string
		const assignees = (formData.getAll("assignees") as string[]) || []

		if (!name) {
			alert("Task name is required")
			return
		}

		await createTask({
			name,
			description,
			categoryId,
			priorityId,
			projectId,
			assignees,
		})

		setOpen(false)
		router.refresh()
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className="w-full border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Task
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Create task</DialogTitle>
					<DialogDescription>
						Add a short name, choose a priority and optionally add a
						description.
					</DialogDescription>
				</DialogHeader>

				<form action={handle} className="space-y-4">
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-muted-foreground"
						>
							Name
						</label>
						<Input name="name" placeholder="Task name" required />
					</div>

					<div>
						<label
							htmlFor="priorityId"
							className="block text-sm font-medium text-muted-foreground"
						>
							Priority
						</label>

						<Select name="priorityId" defaultValue={priorities[0]?.id ?? ""}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select priority" />
							</SelectTrigger>
							<SelectContent>
								{priorities.map((p) => (
									<SelectItem key={p.id} value={p.id}>
										{p.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-muted-foreground"
						>
							Description
						</label>
						<Textarea
							name="description"
							placeholder="Short task description (optional)"
							rows={4}
						/>
					</div>

					<div>
						<label
							htmlFor="assignees"
							className="block text-sm font-medium text-muted-foreground"
						>
							Assignees
						</label>
						<div className="mt-2 space-y-2 max-h-40 overflow-auto">
							{members.map((u) => (
								<label
									key={u.id}
									className="flex items-center gap-2 text-sm cursor-pointer select-none"
								>
									<input
										type="checkbox"
										name="assignees"
										value={u.id}
										className="h-4 w-4 rounded border"
									/>
									<span>{u.name}</span>
								</label>
							))}
						</div>
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline" type="button">
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

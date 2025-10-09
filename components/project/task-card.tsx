"use client"

import type { User } from "better-auth"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { deleteTask, updateTask } from "@/lib/actions/tasks"
import type { Priority, Task, TaskMetadata } from "@/lib/types"

interface Option {
	id: string
	name: string
	[key: string]: any
}

interface TaskCardProps {
	task: Task
	metadata: TaskMetadata
	handleDragStart: (e: React.DragEvent, task: Task) => void
	isLoading?: boolean
	priorities: Priority[]
	members: User[]
}

export function TaskCard({
	task,
	metadata,
	handleDragStart,
	isLoading = false,
	priorities,
	members,
}: TaskCardProps) {
	const [editOpen, setEditOpen] = useState(false)
	const [submitting, setSubmitting] = useState(false)

	const priorityOptions = useMemo(() => {
		if (priorities?.length) return priorities
		if (!metadata?.priority) return []
		return [{ id: metadata.priority.id, name: metadata.priority.name }]
	}, [priorities, metadata?.priority])

	// safe userOptions
	const userOptions = useMemo(() => {
		if (members?.length) return members
		return (
			metadata?.assignees?.map((a) => ({
				id: a.id,
				name: a.name,
				image: a.image,
			})) ?? []
		)
	}, [members, metadata?.assignees?.map])

	// safe initial states (use optional chaining)
	const [name, setName] = useState(task?.name ?? "")
	const [description, setDescription] = useState(
		metadata?.description?.body ?? "",
	)
	const [priorityId, setPriorityId] = useState<string | undefined>(
		metadata?.priority?.id ?? priorityOptions[0]?.id,
	)
	const [selectedAssignees, setSelectedAssignees] = useState<string[]>(
		metadata?.assignees?.map((a) => a.id) ?? [],
	)

	// safe effect dependencies (avoid calling .map in deps)
	useEffect(() => {
		if (editOpen) {
			setName(task?.name ?? "")
			setDescription(metadata?.description?.body ?? "")
			setPriorityId(metadata?.priority?.id ?? priorityOptions[0]?.id)
			setSelectedAssignees(metadata?.assignees?.map((a) => a.id) ?? [])
		}
		// note: using length for array deps avoids creating a new identity on each render
	}, [
		editOpen,
		metadata?.description?.body,
		metadata?.priority?.id,
		priorityOptions[0]?.id,
		task?.name,
		metadata?.assignees?.map,
	])
	const router = useRouter()

	async function handleDelete() {
		if (!confirm("Delete this task? This action cannot be undone.")) return
		await deleteTask(task.id)
		router.refresh()
	}

	async function handleEditSubmit(e: React.FormEvent) {
		e.preventDefault()
		setSubmitting(true)
		try {
			const payload = {
				id: task.id,
				name,
				description,
				priorityId,
				assignees: selectedAssignees,
			}

			await updateTask(task.id, payload)

			setEditOpen(false)
		} catch (err) {
			console.error(err)
			alert("Failed to update task")
		} finally {
			setSubmitting(false)
			router.refresh()
		}
	}

	function toggleAssignee(id: string) {
		setSelectedAssignees((prev) =>
			prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
		)
	}

	return (
		<Card
			className="bg-background border-border cursor-move hover:border-primary/50 transition-colors"
			draggable={!isLoading}
			onDragStart={(e) => handleDragStart(e, task)}
			style={{ opacity: isLoading ? 0.6 : 1 }}
		>
			<CardContent className="p-4">
				<div className="space-y-3">
					{/* Header */}
					<div className="flex items-start justify-between gap-2">
						<h4 className="font-medium text-foreground text-sm leading-tight">
							{task.name}
						</h4>

						<div className="flex items-center gap-2">
							{metadata?.priority && (
								<span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
									{metadata.priority?.name}
								</span>
							)}

							{/* 3-dot menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="p-1">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => {
											setEditOpen(true)
										}}
										className="flex items-center gap-2"
									>
										<Edit className="h-4 w-4" />
										Edit
									</DropdownMenuItem>

									<DropdownMenuItem
										onClick={handleDelete}
										className="flex items-center gap-2 text-destructive"
									>
										<Trash2 className="h-4 w-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					{/* Description */}
					{metadata?.description && (
						<p className="text-sm text-muted-foreground line-clamp-2">
							{metadata.description.body}
						</p>
					)}

					{/* Assignees */}
					{metadata?.assignees?.length > 0 && (
						<div className="flex items-center gap-2">
							{metadata.assignees.map((assignee) => (
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
							))}
						</div>
					)}
				</div>
			</CardContent>

			{/* Edit Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				{/* DialogTrigger is unnecessary because we open the dialog via the dropdown above */}
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Edit task</DialogTitle>
						<DialogDescription>
							Update the task details below.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleEditSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-muted-foreground"
							>
								Name
							</label>
							<Input
								name="name"
								placeholder="Task name"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div>
							<label
								htmlFor="priorityId"
								className="block text-sm font-medium text-muted-foreground"
							>
								Priority
							</label>

							<Select
								name="priorityId"
								value={priorityId ?? ""}
								onValueChange={(v) => setPriorityId(v)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select priority" />
								</SelectTrigger>
								<SelectContent>
									{priorityOptions.map((p) => (
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
								value={description}
								onChange={(e) => setDescription(e.target.value)}
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
								{userOptions.map((u) => (
									<label
										key={u.id}
										className="flex items-center gap-2 text-sm cursor-pointer select-none"
									>
										<input
											type="checkbox"
											checked={selectedAssignees.includes(u.id)}
											onChange={() => toggleAssignee(u.id)}
											className="h-4 w-4 rounded border"
										/>
										<div className="flex items-center gap-2">
											<Avatar className="h-6 w-6">
												<AvatarImage src={u.image ?? undefined} alt={u.name} />
												<AvatarFallback className="text-xs bg-muted text-muted-foreground">
													{u.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<span>{u.name}</span>
										</div>
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
							<Button type="submit" disabled={submitting}>
								{submitting ? "Saving..." : "Save"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</Card>
	)
}

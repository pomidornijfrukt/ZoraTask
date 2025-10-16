import { ArrowLeft } from "lucide-react"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	createPriority,
	deletePriority,
	updatePriority,
} from "@/lib/actions/priority"
import {
	addProjectMember,
	deleteProject,
	getProjectById,
	removeProjectMember,
	updateProject,
} from "@/lib/actions/projects"
import { getPrioritiesByProject, getProjectMembers } from "@/lib/data/projects"

export default async function ProjectSettingsPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const project = await getProjectById(id)
	if (!project) redirect("/projects")

	async function handleUpdate(formData: FormData) {
		"use server"
		const name = formData.get("name") as string
		const description = formData.get("description") as string
		await updateProject(id, { name, description })
		revalidatePath(`/projects/${id}/settings`)
	}

	async function handleDelete() {
		"use server"
		await deleteProject(id)
		redirect("/projects")
	}

	return (
		<div className="container mx-auto py-10">
			<div className="flex items-center gap-4 mb-8">
				<Button variant="ghost" size="sm" asChild={true}>
					<Link
						href={`/projects/${id}`}
						className="flex items-center gap-2"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Project
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Project Settings</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<form action={handleUpdate} className="space-y-4">
						<div>
							<Label>Name</Label>
							<Input name="name" defaultValue={project.name} />
						</div>
						<div>
							<Label>Description</Label>
							<Input name="description" defaultValue={project.description} />
						</div>
						<Button type="submit">Save Changes</Button>
					</form>

					<MembersSection projectId={id} />

					<PrioritySection projectId={id} />

					<div className="border-t pt-6 mt-6">
						<h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
						<form action={handleDelete}>
							<Button type="submit" variant="destructive" className="mt-2">
								Delete Project
							</Button>
						</form>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

async function MembersSection({ projectId }: { projectId: string }) {
	const members = await getProjectMembers(projectId)

	async function handleAddMember(formData: FormData) {
		"use server"
		const memberId = formData.get("memberId") as string
		await addProjectMember(projectId, memberId)
		revalidatePath(`/projects/${projectId}/settings`)
	}

	async function handleRemoveMember(formData: FormData) {
		"use server"
		const memberId = formData.get("memberId") as string
		await removeProjectMember(projectId, memberId)
		revalidatePath(`/projects/${projectId}/settings`)
	}

	return (
		<div>
			<h3 className="text-lg font-semibold mt-8 mb-2">Members</h3>
			<ul className="space-y-2">
				{members.map((m) => (
					<li key={m.id} className="flex justify-between items-center">
						<span>{m.name}</span>
						<form action={handleRemoveMember}>
							<input type="hidden" name="memberId" value={m.id} />
							<Button variant="outline" size="sm" type="submit">
								Remove
							</Button>
						</form>
					</li>
				))}
			</ul>

			<form action={handleAddMember} className="flex gap-2 mt-4">
				<Input name="memberId" placeholder="Enter user ID..." />
				<Button type="submit">Add Member</Button>
			</form>
		</div>
	)
}

async function PrioritySection({ projectId }: { projectId: string }) {
	const priorities = await getPrioritiesByProject(projectId)

	async function handleAddPriority(formData: FormData) {
		"use server"
		const name = (formData.get("priorityName") as string) || ""
		if (!name.trim()) throw new Error("Priority name required")
		await createPriority(projectId, name.trim())
		revalidatePath(`/projects/${projectId}/settings`)
	}

	async function handleRenamePriority(formData: FormData) {
		"use server"
		const id = formData.get("priorityId") as string
		const name = (formData.get("priorityName") as string) || ""
		if (!id) throw new Error("Missing priority id")
		if (!name.trim()) throw new Error("Priority name required")
		await updatePriority(id, name.trim())
		revalidatePath(`/projects/${projectId}/settings`)
	}

	async function handleDeletePriority(formData: FormData) {
		"use server"
		const id = formData.get("priorityId") as string
		if (!id) throw new Error("Missing priority id")
		await deletePriority(id)
		revalidatePath(`/projects/${projectId}/settings`)
	}

	return (
		<div>
			<h3 className="text-lg font-semibold mt-8 mb-2">Priorities</h3>

			{priorities.length === 0 ? (
				<div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
					<p className="mb-2">No priorities yet for this project.</p>
					<p className="text-xs">
						Add a priority below to use it when creating tasks.
					</p>
				</div>
			) : (
				<ul className="space-y-3">
					{priorities.map((p) => (
						<li key={p.id} className="flex items-center gap-3">
							<form
								action={handleRenamePriority}
								className="flex items-center gap-2"
							>
								<input type="hidden" name="priorityId" value={p.id} />
								<Input name="priorityName" defaultValue={p.name} />
								<Button type="submit" size="sm">
									Rename
								</Button>
							</form>

							<form action={handleDeletePriority}>
								<input type="hidden" name="priorityId" value={p.id} />
								<Button type="submit" variant="outline" size="sm">
									Delete
								</Button>
							</form>
						</li>
					))}
				</ul>
			)}

			{/* Add new priority */}
			<form action={handleAddPriority} className="flex gap-2 mt-4">
				<Input name="priorityName" placeholder="New priority name" />
				<Button type="submit">Add Priority</Button>
			</form>
		</div>
	)
}

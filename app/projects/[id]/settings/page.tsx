import { ArrowLeft } from "lucide-react"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	addProjectMember,
	deleteProject,
	getProjectById,
	removeProjectMember,
	updateProject,
} from "@/lib/actions/projects"
import { getProjectMembers } from "@/lib/data/projects"

export default async function ProjectSettingsPage({
	params,
}: {
	params: { id: string }
}) {
	const project = await getProjectById(params.id)
	if (!project) redirect("/projects")

	const members = await getProjectMembers(params.id)

	async function handleUpdate(formData: FormData) {
		"use server"
		const name = formData.get("name") as string
		const description = formData.get("description") as string
		await updateProject(params.id, { name, description })
		revalidatePath(`/projects/${params.id}/settings`)
	}

	async function handleDelete() {
		"use server"
		await deleteProject(params.id)
		redirect("/projects")
	}

	async function handleAddMember(formData: FormData) {
		"use server"
		const memberId = formData.get("memberId") as string
		await addProjectMember(params.id, memberId)
		revalidatePath(`/projects/${params.id}/settings`)
	}

	async function handleRemoveMember(formData: FormData) {
		"use server"
		const memberId = formData.get("memberId") as string
		await removeProjectMember(params.id, memberId)
		revalidatePath(`/projects/${params.id}/settings`)
	}

	return (
		<div className="container mx-auto py-10">
			<div className="flex items-center gap-4 mb-8">
				<Button variant="ghost" size="sm" asChild={true}>
					<Link
						href={`/projects/${params.id}`}
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
					{/* Update Project Info */}
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

					{/* Members */}
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

					{/* Danger Zone */}
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

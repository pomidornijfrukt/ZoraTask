"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createProject } from "@/lib/actions/projects"

export default function CreateProjectDialog() {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [isPending, startTransition] = useTransition()

	const [name, setName] = useState("")
	const [description, setDescription] = useState("")
	const [organizationId, setOrganizationId] = useState("")
	const [error, setError] = useState<string | null>(null)

	const close = () => setOpen(false)
	const openDialog = () => {
		setError(null)
		setName("")
		setDescription("")
		setOrganizationId("")
		setOpen(true)
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)

		// lightweight client validation
		if (!name.trim()) {
			setError("Project name is required")
			return
		}
		if (!organizationId.trim()) {
			setError("organizationId is required")
			return
		}

		// call server action inside a transition so React can remain responsive
		startTransition(async () => {
			try {
				await createProject({
					name: name.trim(),
					description: description.trim(),
					organizationId: organizationId.trim(),
				})
				// refresh the current route so server components re-run and show the new project
				router.refresh()
				close()
			} catch (err: any) {
				console.error("createProject failed", err)
				setError(err?.message ?? "Failed to create project")
			}
		})
	}

	return (
		<>
			<Button className="flex items-center gap-2" onClick={openDialog}>
				<span className="sr-only">Create project</span>
				<Plus className="h-4 w-4 mr-2" />
				New Project
			</Button>

			{open && (
				<div
					role="dialog"
					aria-modal="true"
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
				>
					{/* backdrop */}
					<div
						className="absolute inset-0 bg-black/50"
						onClick={close}
						aria-hidden
					/>

					<Card className="relative z-10 w-full max-w-lg">
						<CardHeader>
							<CardTitle>Create project</CardTitle>
						</CardHeader>

						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-muted-foreground"
									>
										Name
									</label>
									<input
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
										className="mt-1 block w-full rounded-md border p-2"
										placeholder="Project name"
									/>
								</div>

								<div>
									<label
										htmlFor="description"
										className="block text-sm font-medium text-muted-foreground"
									>
										Description
									</label>
									<textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										className="mt-1 block w-full rounded-md border p-2"
										placeholder="Short project description"
										rows={3}
									/>
								</div>

								<div>
									<label
										htmlFor="organization"
										className="block text-sm font-medium text-muted-foreground"
									>
										Organization ID
									</label>
									<input
										value={organizationId}
										onChange={(e) => setOrganizationId(e.target.value)}
										required
										className="mt-1 block w-full rounded-md border p-2"
										placeholder="organization id"
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Use the organization id you want this project to belong to.
									</p>
								</div>

								{error && (
									<div className="text-sm text-red-500" role="alert">
										{error}
									</div>
								)}

								<div className="flex items-center justify-end gap-2 pt-2">
									<Button type="button" variant="outline" onClick={close}>
										Cancel
									</Button>
									<Button type="submit" disabled={isPending}>
										{isPending ? "Creating…" : "Create"}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			)}
		</>
	)
}

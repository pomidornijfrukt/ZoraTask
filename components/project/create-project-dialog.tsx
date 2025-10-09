"use client"

import type { Organization } from "better-auth/plugins"
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

export default function CreateProjectDialog({
	organizations,
	createProject,
}: {
	organizations: Organization[],
	createProject: (payload: {
	name: string
	description: string
	organizationId: string
}) => Promise<{ id: string; name: string; description: string; organizationId: string; createdAt: Date; updatedAt: Date }>;
}) {
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false)

	const handle = async (formData: FormData) => {
		const name = formData.get("name") as string
		const description = (formData.get("description") as string) || ""
		const organizationId = formData.get("organizationId") as string

		if (!name || !name.trim()) {
			throw new Error("Project name is required")
		}
		if (!organizationId || !organizationId.trim()) {
			throw new Error("Organization ID is required")
		}

		await createProject({
			name: name.trim(),
			description: description.trim(),
			organizationId: organizationId.trim(),
		})

		setIsOpen(false)
		router.refresh()
	}
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button className="flex items-center gap-2">
					<Plus className="h-4 w-4" />
					New Project
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Create project</DialogTitle>
					<DialogDescription>
						Fill in project details to get started.
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
						<Input name="name" placeholder="Project name" required />
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
							placeholder="Short project description"
							rows={3}
						/>
					</div>

					<div>
						<label
							htmlFor="organizationId"
							className="block text-sm font-medium text-muted-foreground"
						>
							Organization
						</label>
						<Select name="organizationId" defaultValue="" required>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select organization" />
							</SelectTrigger>
							<SelectContent>
								{organizations.map((org) => (
									<SelectItem key={org.id} value={org.id}>
										{org.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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

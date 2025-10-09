"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Category } from "@/lib/types"

export function AddCategoryButton({
	projectId,
	createCategory,
}: {
	projectId: string
	createCategory: (
		projectId: string,
		name: string,
	) => Promise<Category>
}) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [name, setName] = useState("")

	const handle = async (formData: FormData) => {
		const name = formData.get("name") as string
		await createCategory(projectId, name)
		router.refresh();
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className="w-full border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Category
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Category</DialogTitle>
				</DialogHeader>
				<form action={handle} className="space-y-4">
					<div>
						<label htmlFor="name">Name</label>
						<Input
							name="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="submit">Create</Button>
						</DialogClose>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

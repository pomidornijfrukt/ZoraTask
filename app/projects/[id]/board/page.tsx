import { ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { KanbanBoard } from "@/components/kanban-board"
import { Button } from "@/components/ui/button"
import { createCategory } from "@/lib/actions/categories"
import {
	getCategoriesByProject,
	getPrioritiesByProject,
	getProject,
} from "@/lib/data/projects"
import { getTasksByProject } from "@/lib/data/task"

interface BoardPageProps {
	params: {
		id: string
	}
}

export default async function BoardPage({ params }: BoardPageProps) {
	const project = await getProject(params.id)

	if (!project) {
		notFound()
	}

	const tasks = await getTasksByProject(params.id)
	const categories = await getCategoriesByProject(params.id)
	const priorities = await getPrioritiesByProject(params.id)

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" asChild={true}>
							<Link
								href={`/projects/${project.id}`}
								className="flex items-center gap-2"
							>
								<ArrowLeft className="h-4 w-4" />
								Back to Project
							</Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold text-foreground">
								{project.name} - Board
							</h1>
							<p className="text-muted-foreground">
								Drag and drop tasks to update their status
							</p>
						</div>
					</div>
					<div className="flex gap-2">
						<Button asChild variant="outline">
							<Link
								href={`/projects/${project.id}/settings`}
								className="flex items-center gap-2"
							>
								<Settings className="h-4 w-4 mr-2" />
								Project Settings
							</Link>
						</Button>
					</div>
				</div>

				<KanbanBoard
					project={project}
					tasks={tasks}
					categories={categories}
					priorities={priorities}
					createCategory={createCategory}
				/>
			</div>
		</div>
	)
}

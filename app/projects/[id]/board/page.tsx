import { notFound } from "next/navigation"
import { KanbanBoard } from "@/components/kanban-board"
import { getProject, getTasksByProject } from "@/lib/data"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Plus } from "lucide-react"

interface BoardPageProps {
  params: {
    id: string
  }
}

export default function BoardPage({ params }: BoardPageProps) {
  const project = getProject(params.id)

  if (!project) {
    notFound()
  }

  const tasks = getTasksByProject(params.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/projects/${project.id}`} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Project
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name} - Board</h1>
              <p className="text-muted-foreground">Drag and drop tasks to update their status</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Board Settings
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <KanbanBoard project={project} tasks={tasks} />
      </div>
    </div>
  )
}

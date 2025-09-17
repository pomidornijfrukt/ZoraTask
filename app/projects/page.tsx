import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { getProjects, getTasksByProject } from "@/lib/data"
import { Plus, Calendar, Users, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function ProjectsPage() {
  const projects = getProjects()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "planning":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-3 w-3" />
      case "planning":
        return <AlertCircle className="h-3 w-3" />
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const getProjectStats = (projectId: string) => {
    const tasks = getTasksByProject(projectId)
    const completed = tasks.filter((task) => task.status === "done").length
    const inProgress = tasks.filter((task) => task.status === "in-progress").length
    const todo = tasks.filter((task) => task.status === "todo").length

    return { total: tasks.length, completed, inProgress, todo }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage and track all your projects in one place</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const stats = getProjectStats(project.id)
            const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

            return (
              <Card key={project.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-card-foreground mb-2">{project.name}</CardTitle>
                      <CardDescription className="text-sm">{project.description}</CardDescription>
                    </div>
                    <Badge className={`ml-2 flex items-center gap-1 ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-card-foreground font-medium">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Task Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <div className="text-lg font-semibold text-card-foreground">{stats.todo}</div>
                        <div className="text-xs text-muted-foreground">To Do</div>
                      </div>
                      <div className="bg-yellow-500/10 rounded-lg p-2">
                        <div className="text-lg font-semibold text-yellow-500">{stats.inProgress}</div>
                        <div className="text-xs text-muted-foreground">In Progress</div>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-2">
                        <div className="text-lg font-semibold text-green-500">{stats.completed}</div>
                        <div className="text-xs text-muted-foreground">Done</div>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Team</span>
                      </div>
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 3).map((member) => (
                          <Avatar key={member.id} className="h-8 w-8 border-2 border-card">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.members.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{project.members.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Updated Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild className="flex-1">
                        <Link href={`/projects/${project.id}`}>View Overview</Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1 bg-transparent">
                        <Link href={`/projects/${project.id}/board`}>Open Board</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">Create your first project to get started with Zora.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

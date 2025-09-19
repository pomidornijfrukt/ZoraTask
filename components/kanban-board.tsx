"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Project, Task } from "@/lib/data"
import { getMemberById } from "@/lib/data"
import { Calendar, Clock, AlertTriangle, Plus } from "lucide-react"

interface KanbanBoardProps {
  project: Project
  tasks: Task[]
}

interface Column {
  id: Task["status"]
  title: string
  color: string
}

const columns: Column[] = [
  { id: "todo", title: "To Do", color: "bg-muted" },
  { id: "in-progress", title: "In Progress", color: "bg-yellow-500/10" },
  { id: "done", title: "Done", color: "bg-green-500/10" },
]

export function KanbanBoard({ project, tasks: initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault()

    if (!draggedTask) return

    // Update task status
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === draggedTask.id ? { ...task, status: newStatus } : task)),
    )

    setDraggedTask(null)
  }

  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-3 w-3" />
      case "medium":
        return <Clock className="h-3 w-3" />
      case "low":
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id)

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <Card className="bg-card border-border h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color.replace("/10", "")}`} />
                    {column.title}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    {columnTasks.length}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {columnTasks.map((task) => {
                  const assignee = getMemberById(task.assigneeId, project)
                  const overdue = isOverdue(task.dueDate)

                  return (
                    <Card
                      key={task.id}
                      className="bg-background border-border cursor-move hover:border-primary/50 transition-colors"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Task Header */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-foreground text-sm leading-tight">{task.title}</h4>
                            <Badge
                              className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}
                              variant="outline"
                            >
                              {getPriorityIcon(task.priority)}
                              {task.priority}
                            </Badge>
                          </div>

                          {/* Task Description */}
                          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>

                          {/* Task Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span
                                className={`text-xs ${overdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                              >
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                              {overdue && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  Overdue
                                </Badge>
                              )}
                            </div>

                            {assignee && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                  {assignee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Add Task Button */}
                <Button
                  variant="ghost"
                  className="w-full border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

import projectsData from "@/data/projects.json"
import tasksData from "@/data/tasks.json"

export interface Project {
  id: string
  name: string
  description: string
  status: "active" | "planning" | "completed"
  createdAt: string
  updatedAt: string
  members: Member[]
}

export interface Member {
  id: string
  name: string
  role: string
  avatar: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  projectId: string
  assigneeId: string
  createdAt: string
  updatedAt: string
  dueDate: string
}

export const getProjects = (): Project[] => {
  return projectsData.projects
}

export const getProject = (id: string): Project | undefined => {
  return projectsData.projects.find((project) => project.id === id)
}

export const getTasks = (): Task[] => {
  return tasksData.tasks
}

export const getTasksByProject = (projectId: string): Task[] => {
  return tasksData.tasks.filter((task) => task.projectId === projectId)
}

export const getTasksByStatus = (projectId: string, status: Task["status"]): Task[] => {
  return tasksData.tasks.filter((task) => task.projectId === projectId && task.status === status)
}

export const getMemberById = (memberId: string, project: Project): Member | undefined => {
  return project.members.find((member) => member.id === memberId)
}

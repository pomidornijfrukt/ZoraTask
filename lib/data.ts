import projectsData from "@/data/projects.json" with { type: "json" }
import tasksData from "@/data/tasks.json" with { type: "json" }
import organizationData from "@/data/organizations.json" with { type: "json" }

export interface Project {
	id: string
	name: string
	description: string
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
	status: string
	priority: string
	projectId: string
	assigneeId: string
	createdAt: string
	updatedAt: string
	dueDate: string
}

export interface Organization {
	id: string
	name: string
	slug: string
	logo: string
	created_at: string
	metadata: string
}

export const getProjects = (): Project[] => {
	return projectsData.projects
}

export const getProject = (id: string): Project | undefined => {
	return projectsData.projects.find((project) => project.id === id)
}

export const getOrganizations = (): Organization[] => {
	return organizationData.organizations
}

export const getOrganization = (id: string): Organization | undefined => {
	return organizationData.organizations.find((organization) => organization.id === id)
}

export const getTasks = (): Task[] => {
	return tasksData.tasks
}

export const getTasksByProject = (projectId: string): Task[] => {
	return tasksData.tasks.filter((task) => task.projectId === projectId)
}

export const getTasksByStatus = (
	projectId: string,
	status: Task["status"],
): Task[] => {
	return tasksData.tasks.filter(
		(task) => task.projectId === projectId && task.status === status,
	)
}

export const getMemberById = (
	memberId: string,
	project: Project,
): Member | undefined => {
	return project.members.find((member) => member.id === memberId)
}

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { projectMemberships, projects, user } from "@/lib/db/schemas"

export async function getProject(projectId: string) {
	const [project] = await db
		.select()
		.from(projects)
		.where(eq(projects.id, projectId))
	return project
}

export async function getProjects(userId: string) {
	const rows = await db
		.select()
		.from(projects)
		.innerJoin(
			projectMemberships,
			eq(projectMemberships.projectId, projects.id),
		)
		.where(eq(projectMemberships.memberId, userId))
	return rows.map((r) => ({ ...r.projects }))
}

export async function getProjectMembers(projectId: string) {
	const members = await db
		.select()
		.from(user)
		.innerJoin(projectMemberships, eq(projectMemberships.memberId, user.id))
		.where(eq(projectMemberships.projectId, projectId))

	return members.map((m) => ({ ...m.user }))
}

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import {
	comments,
	priorities,
	taskAssignees,
	tasks,
	user,
} from "@/lib/db/schemas"

export async function getTasksByProject(projectId: string) {
	return db.select().from(tasks).where(eq(tasks.projectId, projectId))
}

export async function getTaskMetadata(taskId: string) {
	const assignees = await getTaskAssignees(taskId)
	const description = await getTaskDescription(taskId)
	const priority = await getTaskPriority(taskId)
	return { assignees, description, priority }
}

export async function getTaskAssignees(taskId: string) {
	const assignees = await db
		.select()
		.from(user)
		.innerJoin(taskAssignees, eq(taskAssignees.userId, user.id))
		.where(eq(taskAssignees.taskId, taskId))

	return assignees.map((a) => ({ ...a.user }))
}

export async function getTaskDescription(taskId: string) {
	const description = await db
		.select()
		.from(comments)
		.innerJoin(tasks, eq(tasks.descriptionId, comments.id))
		.where(eq(tasks.id, taskId))

	const [comment] = description.map((d) => ({ ...d.comments }))
	return comment
}

export async function getTaskPriority(taskId: string) {
	const priority = await db
		.select()
		.from(priorities)
		.innerJoin(tasks, eq(tasks.priorityId, priorities.id))
		.where(eq(tasks.id, taskId))

	const [taskPriority] = priority.map((p) => ({ ...p.priorities }))
	return taskPriority
}

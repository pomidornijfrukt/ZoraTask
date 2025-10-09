"use server"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import {
	comments,
	priorities,
	taskAssignees,
	tasks,
	user,
} from "@/lib/db/schemas"
import type { TaskMetadata } from "@/lib/types"

export async function getTasksByProject(projectId: string) {
	return db.select().from(tasks).where(eq(tasks.projectId, projectId))
}

export async function getProjectTasksMetadata(projectId: string) {
	// single query, left joins so tasks without description/priority/assignees are still returned
	const rows = await db
		.select()
		.from(tasks)
		.leftJoin(comments, eq(tasks.descriptionId, comments.id))
		.leftJoin(priorities, eq(tasks.priorityId, priorities.id))
		.leftJoin(taskAssignees, eq(taskAssignees.taskId, tasks.id))
		.leftJoin(user, eq(taskAssignees.userId, user.id))
		.where(eq(tasks.projectId, projectId))

	// reduce rows into a map keyed by task id
	const map = new Map<string, TaskMetadata>()

	for (const row of rows) {
		const t = row.tasks

		// init if first time seeing this task
		if (!map.has(t.id)) {
			map.set(t.id, {
				task: t,
				description: row.comments ? { ...row.comments } : null,
				priority: row.priorities ? { ...row.priorities } : null,
				assignees: [],
			})
		}

		const md = map.get(t.id)
		// row.user can be undefined when there is no assignee for that row
		if (row.user && md) {
			// avoid duplicates (same user might appear twice if your join produced duplicates)
			if (!md.assignees.some((u) => u.id === row.user?.id)) {
				md.assignees.push({ ...row.user })
			}
		}
	}

	return Array.from(map.values())
}

export async function getTaskMetadataById(taskId: string) {
	const rows = await db
		.select()
		.from(tasks)
		.leftJoin(comments, eq(tasks.descriptionId, comments.id))
		.leftJoin(priorities, eq(tasks.priorityId, priorities.id))
		.leftJoin(taskAssignees, eq(taskAssignees.taskId, tasks.id))
		.leftJoin(user, eq(taskAssignees.userId, user.id))
		.where(eq(tasks.id, taskId))

	const first = rows[0]
	const t = first.tasks

	const md: TaskMetadata = {
		task: t,
		description: first.comments ?? null,
		priority: first.priorities ?? null,
		assignees: [],
	}

	for (const row of rows) {
		if (row.user) {
			if (!md.assignees.some((u) => u.id === row.user?.id)) {
				md.assignees.push({ ...row.user })
			}
		}
	}

	return md
}

export async function getProjectTasksMetadataMap(projectId: string) {
	const list = await getProjectTasksMetadata(projectId)
	return new Map(list.map((m) => [m.task.id, m] as const))
}

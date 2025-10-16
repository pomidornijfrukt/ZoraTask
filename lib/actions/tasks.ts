"use server"

import { and, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { v7 } from "uuid"
import { db } from "@/lib/db"
import { comments, tasks } from "../db/schemas"
import type { Task } from "../types"
import { getSessionUserId } from "./utils"

export const createTask = async (taskData: {
	name: string
	description: string
	categoryId: string
	priorityId: string
	projectId: string
}) => {
	const reporterId = await getSessionUserId()
	const { name, description, categoryId, priorityId, projectId } = taskData

	const task = await db
		.insert(tasks)
		.values({
			id: v7(),
			name,
			projectId,
			categoryId,
			priorityId,
			reporterId,
		})
		.returning()

	await db.insert(comments).values({
		id: v7(),
		taskId: task[0].id,
		body: description,
		authorId: reporterId,
	})

	return task[0]
}

export const updateTask = async (
	taskId: string,
	updatedData: Partial<Task>,
) => {
	await db.update(tasks).set(updatedData).where(eq(tasks.id, taskId))
}

export async function deleteTask(id: string) {
	await db.delete(tasks).where(eq(tasks.id, id))
	return { ok: true }
}

export const getTaskDetails = async (taskId: string) => {
	const task = await db
		.select()
		.from(tasks)
		.where(eq(tasks.id, taskId))
		.limit(1)
	const description = await db
		.select()
		.from(comments)
		.where(and(eq(comments.taskId, taskId), isNull(comments.parentId)))
		.limit(1)
	return { task, description }
}

export async function updateTaskCategory(taskId: string, categoryId: string) {
	await db.update(tasks).set({ categoryId }).where(eq(tasks.id, taskId))

	return { ok: true }
}

export async function createTaskForm(
	formData: FormData,
	projectId: string,
	categoryId: string,
) {
	const name = formData.get("name") as string
	const description = formData.get("description") as string
	const priorityId = formData.get("priorityId") as string

	if (!name) throw new Error("Task name required")

	const task = await createTask({
		name,
		description,
		priorityId,
		categoryId,
		projectId,
	})

	revalidatePath(`/projects/${projectId}/board`)
	return task
}

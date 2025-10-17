"use server"

import { and, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { v7 } from "uuid"
import { db } from "@/lib/db"
import { comments, taskAssignees, tasks } from "../db/schemas"
import type { Task } from "../types"
import { getSessionUserId } from "./utils"

export const createTask = async (taskData: {
	name: string
	description?: string
	categoryId: string
	priorityId: string
	projectId: string
	assignees?: string[]
}) => {
	const reporterId = await getSessionUserId()
	const { name, description, categoryId, priorityId, projectId, assignees } =
		taskData

	// 1) Create task first
	const [task] = await db
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

	// 2) Always create the initial description comment (can be empty)
	const [desc] = await db
		.insert(comments)
		.values({
			id: v7(),
			taskId: task.id,
			body: description ?? "",
			authorId: reporterId,
			parentId: null,
		})
		.returning()

	// 3) Link the description comment on the task
	await db
		.update(tasks)
		.set({ descriptionId: desc.id })
		.where(eq(tasks.id, task.id))

	// 4) Optionally insert assignees
	if (assignees && assignees.length > 0) {
		await db
			.insert(taskAssignees)
			.values(
				assignees.map((userId) => ({ id: v7(), userId, taskId: task.id })),
			)
	}

	return task
}

type UpdateTaskInput = {
	name?: string
	description?: string | null
	priorityId?: string | null
	assignees?: string[] // userIds
	categoryId?: string | null
}

export const updateTask = async (
	taskId: string,
	updatedData: UpdateTaskInput,
) => {
	// Fetch current task to know descriptionId
	const [existing] = await db
		.select()
		.from(tasks)
		.where(eq(tasks.id, taskId))
		.limit(1)
	if (!existing) return

	const toUpdateTask: Partial<Task> = {}
	if (typeof updatedData.name !== "undefined")
		toUpdateTask.name = updatedData.name ?? existing.name
	if (typeof updatedData.priorityId !== "undefined")
		toUpdateTask.priorityId = updatedData.priorityId
	if (typeof updatedData.categoryId !== "undefined")
		toUpdateTask.categoryId = updatedData.categoryId

	if (Object.keys(toUpdateTask).length > 0) {
		await db.update(tasks).set(toUpdateTask).where(eq(tasks.id, taskId))
	}

	// Ensure a description comment exists and update it when provided
	if (typeof updatedData.description !== "undefined") {
		const userId = await getSessionUserId()
		if (existing.descriptionId) {
			await db
				.update(comments)
				.set({ body: updatedData.description ?? "" })
				.where(eq(comments.id, existing.descriptionId))
		} else {
			const [newDesc] = await db
				.insert(comments)
				.values({
					id: v7(),
					taskId,
					body: updatedData.description ?? "",
					authorId: userId,
					parentId: null,
				})
				.returning()
			await db
				.update(tasks)
				.set({ descriptionId: newDesc.id })
				.where(eq(tasks.id, taskId))
		}
	}

	// Sync assignees if provided (replace strategy)
	if (Array.isArray(updatedData.assignees)) {
		// Remove all existing
		await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId))
		// Insert new set
		if (updatedData.assignees.length > 0) {
			await db
				.insert(taskAssignees)
				.values(
					updatedData.assignees.map((userId) => ({ id: v7(), userId, taskId })),
				)
		}
	}
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
	const assignees = formData.getAll("assignees") as string[]
	if (!name) throw new Error("Task name required")

	const task = await createTask({
		name,
		description,
		priorityId,
		categoryId,
		projectId,
		assignees,
	})

	revalidatePath(`/projects/${projectId}/board`)
	return task
}

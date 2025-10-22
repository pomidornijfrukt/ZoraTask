"use server"

import { and, eq, isNull, ne } from "drizzle-orm"
import { v7 } from "uuid"
import { db } from "@/lib/db"
import { comments, tasks } from "../db/schemas"
import { getSessionUserId } from "./utils"

export async function createComment(data: {
	taskId: string
	body: string
	parentId?: string
}) {
	const authorId = await getSessionUserId()
	const { taskId, body, parentId } = data

	const comment = await db
		.insert(comments)
		.values({
			id: v7(),
			taskId,
			body,
			authorId,
			parentId: parentId || null,
		})
		.returning()

	return comment[0]
}

export async function updateComment(commentId: string, body: string) {
	const userId = await getSessionUserId()

	// Verify the user is the author
	const existing = await db
		.select()
		.from(comments)
		.where(eq(comments.id, commentId))
		.limit(1)

	if (!existing[0] || existing[0].authorId !== userId) {
		throw new Error("Unauthorized to update this comment")
	}

	const updated = await db
		.update(comments)
		.set({ body })
		.where(eq(comments.id, commentId))
		.returning()

	return updated[0]
}

export async function deleteComment(commentId: string) {
	const userId = await getSessionUserId()

	// Verify the user is the author
	const existing = await db
		.select()
		.from(comments)
		.where(eq(comments.id, commentId))
		.limit(1)

	if (!existing[0] || existing[0].authorId !== userId) {
		throw new Error("Unauthorized to delete this comment")
	}

	await db.delete(comments).where(eq(comments.id, commentId))

	return { ok: true }
}

export async function getCommentsByTask(taskId: string) {
	// Get all comments that are not descriptions (have parentId or are not the task description)
	const allComments = await db
		.select()
		.from(comments)
		.where(eq(comments.taskId, taskId))

	return allComments
}

export async function getTaskComments(taskId: string) {
	// Get only team discussion comments (exclude the description comment)
	const rows = await db
		.select()
		.from(comments)
		.leftJoin(tasks, eq(tasks.id, comments.taskId))
		.where(
			and(
				eq(comments.taskId, taskId),
				isNull(comments.parentId),
				ne(comments.id, tasks.descriptionId),
			),
		)

	// comments are in rows[i].comments due to the join
	return rows.map((r) => r.comments)
}

"use server"

import { and, eq, isNull } from "drizzle-orm"
import { db } from "@/lib/db"
import { comments, tasks, user } from "@/lib/db/schemas"

export type CommentWithAuthor = {
	id: string
	body: string
	createdAt: Date
	updatedAt: Date
	taskId: string
	parentId: string | null
	author: {
		id: string
		name: string
		image: string | null
	}
}

export async function getTaskComments(
	taskId: string,
): Promise<CommentWithAuthor[]> {
	// Get the task to find the description comment ID
	const task = await db
		.select()
		.from(tasks)
		.where(eq(tasks.id, taskId))
		.limit(1)

	const descriptionId = task[0]?.descriptionId

	// Get all comments for the task with author info, excluding the description
	const rows = await db
		.select({
			comment: comments,
			author: user,
		})
		.from(comments)
		.leftJoin(user, eq(comments.authorId, user.id))
		.where(and(eq(comments.taskId, taskId), isNull(comments.parentId)))

	// Filter out the description comment and format the result
	return rows
		.filter((row) => row.comment.id !== descriptionId)
		.map((row) => ({
			id: row.comment.id,
			body: row.comment.body,
			createdAt: row.comment.createdAt,
			updatedAt: row.comment.updatedAt,
			taskId: row.comment.taskId,
			parentId: row.comment.parentId,
			author: {
				id: row.author?.id || "",
				name: row.author?.name || "Unknown",
				image: row.author?.image || null,
			},
		}))
}

export async function getCommentById(commentId: string) {
	const rows = await db
		.select({
			comment: comments,
			author: user,
		})
		.from(comments)
		.leftJoin(user, eq(comments.authorId, user.id))
		.where(eq(comments.id, commentId))
		.limit(1)

	if (!rows[0]) return null

	const row = rows[0]
	return {
		id: row.comment.id,
		body: row.comment.body,
		createdAt: row.comment.createdAt,
		updatedAt: row.comment.updatedAt,
		taskId: row.comment.taskId,
		parentId: row.comment.parentId,
		author: {
			id: row.author?.id || "",
			name: row.author?.name || "Unknown",
			image: row.author?.image || null,
		},
	}
}

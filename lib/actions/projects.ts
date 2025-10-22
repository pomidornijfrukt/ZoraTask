"use server"

import { and, eq } from "drizzle-orm"
import { v7 } from "uuid"
import { db } from "@/lib/db"
import { priorities, projectMemberships, projects } from "@/lib/db/schemas"
import { checkIfOwner, getSessionUserId } from "./utils"

export async function createProject(payload: {
	name: string
	description: string
	organizationId: string
}) {
	const userId = await getSessionUserId()

	// Validation
	if (!payload.name || payload.name.trim().length === 0) {
		throw new Error("Project name is required")
	}
	if (payload.name.length > 64) {
		throw new Error("Project name must be less than 64 characters")
	}
	if (payload.description.length > 100) {
		throw new Error("Project description must be less than 100 characters")
	}

	const newId = v7()

	const [created] = await db
		.insert(projects)
		.values({
			id: newId,
			ownerId: userId,
			organizationId: payload.organizationId,
			name: payload.name,
			description: payload.description,
		})
		.returning()

	await db.insert(projectMemberships).values({
		id: v7(),
		memberId: userId,
		projectId: newId,
	})

	// DEFAULT PRIORITIES FOR EVERY NEW PROJECT
	const DEFAULT_PRIORITIES = ["Low", "Medium", "High"]
	const priorityRows = DEFAULT_PRIORITIES.map((name) => ({
		id: v7(),
		projectId: newId,
		name,
	}))
	await db.insert(priorities).values(priorityRows).returning()

	return created
}

export async function getProjectById(projectId: string) {
	const userId = await getSessionUserId()

	const [proj] = await db
		.select()
		.from(projects)
		.where(eq(projects.id, projectId))
		.limit(1)

	if (!proj) return null

	if (proj.ownerId === userId) return proj

	const membership = await db
		.select()
		.from(projectMemberships)
		.where(
			and(
				eq(projectMemberships.projectId, projectId),
				eq(projectMemberships.memberId, userId),
			),
		)
		.limit(1)

	if (membership.length === 0) throw new Error("Forbidden")

	return proj
}

export async function updateProject(
	projectId: string,
	updates: Partial<{
		name: string
		description: string
		organizationId: string
	}>,
) {
	checkIfOwner(projectId)

	const [updated] = await db
		.update(projects)
		.set({
			...(updates.name ? { name: updates.name } : {}),
			...(updates.description ? { description: updates.description } : {}),
			...(updates.organizationId
				? { organizationId: updates.organizationId }
				: {}),
		})
		.where(eq(projects.id, projectId))
		.returning()

	return updated
}

export async function deleteProject(projectId: string) {
	checkIfOwner(projectId)

	await db.delete(projects).where(eq(projects.id, projectId))
	return { ok: true }
}

export async function addProjectMember(projectId: string, memberId: string) {
	checkIfOwner(projectId)

	const membershipId = v7()
	await db.insert(projectMemberships).values({
		id: membershipId,
		memberId,
		projectId,
	})

	return {
		id: membershipId,
		memberId,
		projectId,
		joinedAt: new Date(),
	}
}

export async function removeProjectMember(projectId: string, memberId: string) {
	checkIfOwner(projectId)

	await db
		.delete(projectMemberships)
		.where(
			and(
				eq(projectMemberships.projectId, projectId),
				eq(projectMemberships.memberId, memberId),
			),
		)

	return { ok: true }
}

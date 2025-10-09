"use server"

import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { v7 } from "uuid"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
	categories,
	priorities,
	projectMemberships,
	projects,
} from "@/lib/db/schemas"

export type ProjectInsert = InferInsertModel<typeof projects>
export type ProjectRow = InferSelectModel<typeof projects>
export type MembershipRow = InferInsertModel<typeof projectMemberships>
export type CategoryInsert = InferInsertModel<typeof categories>
export type PriorityInsert = InferInsertModel<typeof priorities>

async function getSessionUserId() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session?.user?.id) throw new Error("Unauthorized")
	return session.user.id as string
}

async function checkIfOwner(projectId: string) {
	const userId = await getSessionUserId()

	const [existing] = await db
		.select()
		.from(projects)
		.where(eq(projects.id, projectId))
		.limit(1)

	if (!existing) throw new Error("Project not found")
	if (existing.ownerId !== userId) throw new Error("Forbidden")
}

export async function createProject(payload: {
	name: string
	description: string
	organizationId: string
}): Promise<ProjectRow> {
	const userId = await getSessionUserId()

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

	return created
}

export async function getProjectById(
	projectId: string,
): Promise<ProjectRow | null> {
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
): Promise<ProjectRow> {
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

export async function deleteProject(
	projectId: string,
): Promise<{ ok: boolean }> {
	checkIfOwner(projectId)

	await db.delete(projects).where(eq(projects.id, projectId))
	return { ok: true }
}

export async function addProjectMember(
	projectId: string,
	memberId: string,
): Promise<MembershipRow> {
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
	} as MembershipRow
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

export async function addCategory(
	projectId: string,
	name: string,
): Promise<CategoryInsert> {
	checkIfOwner(projectId)

	const id = v7()
	await db.insert(categories).values({ id, projectId, name })
	return { id, projectId, name } as CategoryInsert
}

export async function addPriority(
	projectId: string,
	name: string,
): Promise<PriorityInsert> {
	checkIfOwner(projectId)

	const id = v7()
	await db.insert(priorities).values({ id, projectId, name })
	return { id, projectId, name } as PriorityInsert
}

// /** List projects user has access to (owner or member) */
// export async function getProjectsForUser(
// 	userId?: string,
// ): Promise<ProjectRow[]> {
// 	// if no userId provided, read from session
// 	const uid = userId ?? (await getSessionUserId())

// 	// join memberships and projects to get projects where user is member OR owner
// 	const rows = await db
// 		.select()
// 		.from(projects)
// 		.leftJoin(projectMemberships, eq(projectMemberships.projectId, projects.id))
// 		.where(
// 			// either ownerId = uid OR membership.memberId = uid
// 			// drizzle-orm doesn't support OR easily across two where() calls; use manual condition by repeating queries or using where(...) with raw
// 			// Simpler: fetch projects where ownerId = uid, and unions with membership-based projects:
// 			// We'll do two queries and merge
// 			eq(projects.ownerId, uid),
// 		)

// 	const ownerProjects = rows

// 	const memberRows = await db
// 		.select()
// 		.from(projects)
// 		.innerJoin(
// 			projectMemberships,
// 			eq(projectMemberships.projectId, projects.id),
// 		)
// 		.where(eq(projectMemberships.memberId, uid))

// 	// merge unique projects by id
// 	const map = new Map<string, ProjectRow>()
// 	for (const p of ownerProjects) map.set(p.projects)
// 	for (const p of memberRows) map.set(p.projectMemberships)

// 	return Array.from(map.values())
// }

"use server"

import { eq } from "drizzle-orm"
import { v7 } from "uuid"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schemas"
import { checkIfOwner } from "./utils"

export async function createCategory(projectId: string, name: string) {
	await checkIfOwner(projectId)
	const id = v7()
	await db.insert(categories).values({ id, projectId, name })
	return { id, projectId, name }
}

export async function updateCategory(id: string, name: string) {
	await db
		.update(categories)
		.set({ name })
		.where(eq(categories.id, id))
		.returning()
	return { id, name }
}

export async function updateCategoryOrder(id: string, order: string) {
	await db.update(categories).set({ order }).where(eq(categories.id, id))
	return { ok: true }
}

export async function updateCategoriesOrder(
	updates: { id: string; order: string }[],
) {
	for (const { id, order } of updates) {
		await db.update(categories).set({ order }).where(eq(categories.id, id))
	}
	return { ok: true }
}

export async function deleteCategory(id: string) {
	await db.delete(categories).where(eq(categories.id, id))
	return { ok: true }
}

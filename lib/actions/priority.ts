// "use server"

// import { eq } from "drizzle-orm"
// import { v7 } from "uuid"
// import { db } from "../db"
// import { priorities } from "../db/schemas"
// import { checkIfOwner } from "./utils"

// export async function createPriority(projectId: string, name: string) {
// 	checkIfOwner(projectId)

// 	const id = v7()
// 	await db.insert(priorities).values({ id, projectId, name })
// 	return { id, projectId, name }
// }

// export async function updatePriority(priorityId: string, name: string) {
// 	const [existing] = await db
// 		.select()
// 		.from(priorities)
// 		.where(eq(priorities.id, priorityId))
// 		.limit(1)

// 	if (!existing) throw new Error("Priority not found")
// 	checkIfOwner(existing.projectId)

// 	const [updated] = await db
// 		.update(priorities)
// 		.set({ name })
// 		.where(eq(priorities.id, priorityId))
// 		.returning()

// 	return updated
// }

// export async function deletePriority(priorityId: string) {
// 	const [existing] = await db
// 		.select()
// 		.from(priorities)
// 		.where(eq(priorities.id, priorityId))
// 		.limit(1)

// 	if (!existing) throw new Error("Priority not found")
// 	checkIfOwner(existing.projectId)

// 	await db.delete(priorities).where(eq(priorities.id, priorityId))

// 	return { ok: true }
// }

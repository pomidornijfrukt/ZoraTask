import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "../db"
import { projects } from "../db/schemas"

export async function getSessionUserId() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session?.user?.id) throw new Error("Unauthorized")
	return session.user.id as string
}

export async function checkIfOwner(projectId: string) {
	const userId = await getSessionUserId()

	const [existing] = await db
		.select()
		.from(projects)
		.where(eq(projects.id, projectId))
		.limit(1)

	if (!existing) throw new Error("Project not found")
	if (existing.ownerId !== userId) throw new Error("Forbidden")
}

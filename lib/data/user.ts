import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schemas"

export async function getUser(userId: string) {
	const [foundUser] = await db.select().from(user).where(eq(user.id, userId))
	return foundUser
}

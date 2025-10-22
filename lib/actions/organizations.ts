import { eq } from "drizzle-orm"
import { db } from "../db"
import { member, organization, user } from "../db/schemas"

export async function getOrganizationMembers(organizationId: string) {
	const members = await db
		.select()
		.from(user)
		.innerJoin(member, eq(member.userId, user.id))
		.where(eq(member.organizationId, organizationId))
	return members.map((m) => ({ ...m.user }))
}

export async function getOrganizations(userId: string) {
	const organizations = await db
		.select()
		.from(organization)
		.innerJoin(member, eq(member.organizationId, organization.id))
		.where(eq(member.userId, userId))
	return organizations.map((o) => ({ ...o.organization }))
}

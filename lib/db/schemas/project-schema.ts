import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { organization, user } from "./auth-schema"

export const projects = pgTable("projects", {
	id: text("id").primaryKey(),
	ownerId: text("owner_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
})

export const projectMemberships = pgTable("projectMemberships", {
	id: text("id").primaryKey(),
	memberId: text("member_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	projectId: text("project_id")
		.notNull()
		.references(() => projects.id, { onDelete: "cascade" }),
	joinedAt: timestamp("joined_at").defaultNow().notNull(),
})

export const categories = pgTable("categories", {
	id: text("id").primaryKey(),
	projectId: text("project_id")
		.notNull()
		.references(() => projects.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	order: text("order").default("0"),
})

export const priorities = pgTable("priorities", {
	id: text("id").primaryKey(),
	projectId: text("project_id")
		.notNull()
		.references(() => projects.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
})

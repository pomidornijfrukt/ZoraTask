import {
	type AnyPgColumn,
	type PgTable,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core"
import { user } from "./auth-schema"
import { categories, priorities, projects } from "./project-schema"

export const comments = pgTable("comments", {
	id: text("id").primaryKey(),
	authorId: text("author_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	parentId: text("parent_id").references((): AnyPgColumn => comments.id, {
		onDelete: "set null",
	}),
	taskId: text("task_id")
		.notNull()
		.references(() => tasks.id, { onDelete: "cascade" }),
	body: text("body").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
}) satisfies PgTable

export const tasks = pgTable("tasks", {
	id: text("id").primaryKey(),
	parentId: text("parent_id").references((): AnyPgColumn => tasks.id, {
		onDelete: "cascade",
	}),
	projectId: text("project_id")
		.notNull()
		.references(() => projects.id, { onDelete: "cascade" }),
	descriptionId: text("description_id").references(
		(): AnyPgColumn => comments.id,
		{
			onDelete: "cascade",
		},
	),
	categoryId: text("category_id").references(() => categories.id, {
		onDelete: "cascade",
	}),
	priorityId: text("priority_id").references(() => priorities.id, {
		onDelete: "cascade",
	}),
	reporterId: text("reporter_id")
		.references(() => user.id, { onDelete: "set null" }),
	name: text("name").notNull(),
	executionStatus: text("execution_status"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
})

export const taskAssignees = pgTable("taskAssignees", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	taskId: text("task_id")
		.notNull()
		.references(() => tasks.id, { onDelete: "cascade" }),
})

export const attachments = pgTable("attachments", {
	id: text("id").primaryKey(),
	commentId: text("comment_id")
		.notNull()
		.references(() => comments.id, { onDelete: "cascade" }),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
})

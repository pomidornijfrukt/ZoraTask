import type { User } from "better-auth"
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import type {
	categories,
	comments,
	priorities,
	projects,
	tasks,
} from "@/lib/db/schemas"

export type Project = InferSelectModel<typeof projects>
export type NewProject = InferInsertModel<typeof projects>

export type Task = InferSelectModel<typeof tasks>
export type NewTask = InferInsertModel<typeof tasks>

export type TaskMetadata = {
	task: Task
	description: Comment | null
	priority: Priority | null
	assignees: User[]
}

export type Category = InferSelectModel<typeof categories>
export type Priority = InferSelectModel<typeof priorities>
export type Comment = InferSelectModel<typeof comments>

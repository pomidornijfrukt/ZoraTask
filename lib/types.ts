import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import type { categories, priorities, projects, tasks } from "@/lib/db/schemas"
import type { getTaskMetadata } from "./data/task"

export type Project = InferSelectModel<typeof projects>
export type NewProject = InferInsertModel<typeof projects>

export type Task = InferSelectModel<typeof tasks>
export type NewTask = InferInsertModel<typeof tasks>

export type TaskMetadata = Awaited<ReturnType<typeof getTaskMetadata>>

export type Category = InferSelectModel<typeof categories>
export type Priority = InferSelectModel<typeof priorities>

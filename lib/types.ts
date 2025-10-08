import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import type { projects, tasks } from "@/lib/db/schemas"
import type { getTaskMetadata } from "./data/task"

export type Project = InferSelectModel<typeof projects>
export type NewProject = InferInsertModel<typeof projects>

export type Task = InferSelectModel<typeof tasks>
export type NewTask = InferInsertModel<typeof tasks>

export type TaskMetadata = Awaited<ReturnType<typeof getTaskMetadata>>

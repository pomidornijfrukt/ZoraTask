import { NextResponse } from "next/server"
import { updateTaskCategory } from "@/lib/actions/tasks"

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { taskId, categoryId } = body

		if (!taskId || !categoryId) {
			return NextResponse.json(
				{ error: "taskId and categoryId are required" },
				{ status: 400 },
			)
		}

		await updateTaskCategory(taskId, categoryId)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error updating task category:", error)
		return NextResponse.json(
			{ error: "Failed to update task category" },
			{ status: 500 },
		)
	}
}

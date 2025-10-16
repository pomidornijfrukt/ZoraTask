import { NextResponse } from "next/server"
import { updateTasksOrder } from "@/lib/actions/tasks"

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { updates } = body

		if (!updates || !Array.isArray(updates)) {
			return NextResponse.json(
				{ error: "Invalid updates format" },
				{ status: 400 },
			)
		}

		await updateTasksOrder(updates)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error updating task order:", error)
		return NextResponse.json(
			{ error: "Failed to update task order" },
			{ status: 500 },
		)
	}
}

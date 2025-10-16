import { NextResponse } from "next/server"
import { updateCategoriesOrder } from "@/lib/actions/categories"

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

		await updateCategoriesOrder(updates)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error updating category order:", error)
		return NextResponse.json(
			{ error: "Failed to update category order" },
			{ status: 500 },
		)
	}
}

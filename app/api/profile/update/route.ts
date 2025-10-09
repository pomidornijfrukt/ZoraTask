import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { userProfile } from "@/lib/db/schemas/user-schema"
import { updateProfileSchema } from "@/lib/validations/profile"

export async function POST(request: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await request.json()

		const validatedData = updateProfileSchema.parse(body)

		const existingProfile = await db.query.userProfile.findFirst({
			where: eq(userProfile.id, session.user.id),
		})

		if (existingProfile) {
			await db
				.update(userProfile)
				.set({
					firstName: validatedData.firstName,
					lastName: validatedData.lastName,
					bio: validatedData.bio || null,
					phoneNumber: validatedData.phoneNumber || null,
					timeZone: validatedData.timeZone || null,
					language: validatedData.language || null,
					age: validatedData.age || null,
				})
				.where(eq(userProfile.id, session.user.id))
		} else {
			await db.insert(userProfile).values({
				id: session.user.id,
				firstName: validatedData.firstName,
				lastName: validatedData.lastName,
				bio: validatedData.bio || null,
				phoneNumber: validatedData.phoneNumber || null,
				timeZone: validatedData.timeZone || null,
				language: validatedData.language || null,
				age: validatedData.age || null,
			})
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		if (error instanceof Error && error.name === "ZodError") {
			return NextResponse.json(
				{ error: "Invalid input", details: error },
				{ status: 400 },
			)
		}

		console.error("Profile update error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}

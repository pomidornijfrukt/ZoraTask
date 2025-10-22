import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { userProfile } from "@/lib/db/schemas/user-schema"

export async function GET() {
	"use cache"
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const profile = await db.query.userProfile.findFirst({
			where: eq(userProfile.id, session.user.id),
		})

		if (!profile) {
			// Return empty profile structure if not found
			return NextResponse.json({
				id: session.user.id,
				image: session.user.image || null,
				email: session.user.email,
				name: session.user.name || null,
				firstName: null,
				lastName: null,
				bio: null,
				phoneNumber: null,
				timeZone: null,
				language: null,
				birthDate: null,
			})
		}

		// Merge session data with profile data
		return NextResponse.json({
			id: profile.id,
			image: session.user.image || null,
			email: session.user.email,
			name: session.user.name || null,
			firstName: profile.firstName,
			lastName: profile.lastName,
			bio: profile.bio,
			phoneNumber: profile.phoneNumber,
			timeZone: profile.timeZone,
			language: profile.language,
			birthDate: profile.birthDate?.toISOString() || null,
		})
	} catch (error) {
		console.error("Profile fetch error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}

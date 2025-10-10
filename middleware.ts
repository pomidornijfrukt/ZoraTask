import { getCookieCache } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
	const session = await getCookieCache(request)
	if (!session) {
		return NextResponse.redirect(new URL("/auth/sign-in", request.url))
	}
	return NextResponse.next()
}

export const config = {
	runtime: "nodejs",
	matcher: ["/projects/:path*", "/account/:path*", "/organization/:path*"],
}

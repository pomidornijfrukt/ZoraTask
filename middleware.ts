import { getCookieCache } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
	const session = await getCookieCache(request)
	const { pathname } = request.nextUrl

	// If user is authenticated and trying to access auth pages, redirect to /projects
	if (session && pathname.startsWith("/auth/")) {
		return NextResponse.redirect(new URL("/projects", request.url))
	}

	// If user is not authenticated and trying to access protected routes, redirect to sign-in
	if (!session && !pathname.startsWith("/auth/")) {
		return NextResponse.redirect(new URL("/auth/sign-in", request.url))
	}

	return NextResponse.next()
}

export const config = {
	runtime: "nodejs",
	matcher: [
		"/projects/:path*",
		"/account/:path*",
		"/organization/:path*",
		"/auth/:path*",
	],
}

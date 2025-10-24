import { auth } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
	const session = await auth.api.getSession({ headers: request.headers })
	const pathname = request.nextUrl.pathname

	// If the user is authenticated and tries to access the sign-in page, redirect them to /projects
	if (session && pathname.startsWith("/auth/sign-in")) {
		return NextResponse.redirect(new URL("/projects", request.url))
	}

	// If the user is not authenticated and tries to access a protected route, redirect them to /auth/sign-in
	if (!session && !pathname.startsWith("/auth/sign-in")) {
		return NextResponse.redirect(new URL("/auth/sign-in", request.url))
	}

	return NextResponse.next()
}

export const config = {
	runtime: "nodejs", // Is needed.
	matcher: [
		"/projects/:path*",
		"/account/:path*",
		"/organization/:path*",
		"/inbox/:path*",
		"/auth/:path*",
	],
}

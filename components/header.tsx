"use client"

import {
	OrganizationLogo,
	OrganizationSwitcher,
	UserAvatar,
	UserButton,
} from "@daveyplate/better-auth-ui"
import { FolderOpen, Home, Kanban, type LucideIcon } from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
	const pathname = usePathname()

	// Access session data using Better Auth's useSession hook
	const { data: session, isPending } = authClient.useSession()

	// Determine if the user is signed in
	const isSignedIn = !isPending && session?.user

	// Access active organization using Better Auth's useActiveOrganization hook
	const { data: activeOrg } = authClient.useActiveOrganization()

	return (
		<header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b bg-card">
			{/* Logo and Navigation */}
			<div className="flex items-center space-x-8">
				<Link href="/" className="flex items-center space-x-2">
					<Kanban className="h-8 w-8 text-primary" />
					<span className="text-xl font-bold text-foreground">Zora</span>
				</Link>

				<div className="flex space-x-1">
					<NavButton
						href="/"
						active={pathname === "/"}
						label="Home"
						icon={Home}
					/>
					<NavButton
						href="/projects"
						active={pathname.startsWith("/projects")}
						label="Projects"
						icon={FolderOpen}
					/>
				</div>
			</div>

			<div className="flex items-center space-x-4">
				{/* Organization switcher */}
				<OrganizationSwitcher
					hidePersonal
					trigger={
						<button
							type="button"
							className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<OrganizationLogo className="h-8 w-8" />
							<span className="hidden sm:inline-block">
								{isPending ? "Loading..." : activeOrg?.name || "Organizations"}
							</span>
						</button>
					}
				/>
				{/* Theme Picker */}
				<ThemeToggle />
				{/* Auth buttons */}
				{isSignedIn ? (
					<UserButton
						size="icon"
						trigger={
							<button type="button">
								<UserAvatar user={session?.user} />
							</button>
						}
					/>
				) : (
					<Link
						href="/auth/sign-in"
						className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
					>
						Sign In
					</Link>
				)}
			</div>
		</header>
	)
}

function NavButton({
	href,
	active,
	label,
	icon: Icon,
}: {
	href: LinkProps["href"]
	active: boolean
	label: string
	icon: LucideIcon
}) {
	return (
		<Button variant={active ? "default" : "ghost"} size="sm" asChild={true}>
			<Link href={href} className="flex items-center space-x-2">
				<Icon className="h-4 w-4" />
				<span>{label}</span>
			</Link>
		</Button>
	)
}

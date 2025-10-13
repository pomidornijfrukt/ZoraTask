"use client"

import {
	OrganizationLogo,
	OrganizationSwitcher,
	UserAvatar,
	UserButton,
} from "@daveyplate/better-auth-ui"
import { FolderOpen, Home, Kanban, Bell, type LucideIcon } from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { ThemeToggle } from "./theme-toggle"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
	const pathname = usePathname()
	const { data: session, isPending } = authClient.useSession()
	const isSignedIn = !isPending && session?.user
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
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button type="button" className="flex items-center">
								<UserAvatar user={session?.user} />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href="/inbox" className="flex items-center space-x-2 cursor-pointer">
									<Bell className="h-4 w-4" />
									<span>Invites</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<UserButton
								size="sm"
								trigger={
									<button type="button" className="w-full text-left">
										Account
									</button>
								}
							/>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Button variant="outline" asChild>
						<Link href="/auth/sign-in">Sign in</Link>
					</Button>
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
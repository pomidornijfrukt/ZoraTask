"use client"

import {
	OrganizationSwitcher,
	UserAvatar,
	UserButton,
} from "@daveyplate/better-auth-ui"
import {
	Bell,
	Building,
	FolderOpen,
	Home,
	Kanban,
	type LucideIcon,
} from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserPendingInvitesCount } from "@/app/actions/invites"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
	const pathname = usePathname()
	const { data: session, isPending } = authClient.useSession()
	const isSignedIn = !isPending && session?.user
	const { data: activeOrg } = authClient.useActiveOrganization()
	const [invitesCount, setInvitesCount] = useState(0)

	// Fetch pending invites count
	useEffect(() => {
		async function fetchInvitesCount() {
			if (session?.user?.email) {
				const result = await getUserPendingInvitesCount()
				if (result.success) {
					setInvitesCount(result.count ?? 0)
				}
			}
		}

		fetchInvitesCount()
	}, [session?.user?.email])

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

			<div className="flex items-center space-x-2">
				{/* Theme Picker */}
				<div
					className={cn(
						"h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground",
						isSignedIn && "order-3",
					)}
				>
					<ThemeToggle />
				</div>
				{/* Auth buttons */}
				{isSignedIn ? (
					<>
						{/* Organization switcher */}
						<OrganizationSwitcher
							hidePersonal
							trigger={
								<button
									type="button"
									className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-2 h-9 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
								>
									<Building className="size-5" />
									<span className="hidden sm:inline-block">
										{isPending
											? "Loading..."
											: activeOrg?.name || "Organizations"}
									</span>
								</button>
							}
						/>
						{/* Inbox button with notification badge */}
						<Button variant="outline" size="icon" asChild className="relative">
							<Link href="/inbox">
								<Bell className="h-4 w-4" />
								{invitesCount > 0 && (
									<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
										{invitesCount}
									</span>
								)}
							</Link>
						</Button>
						{/* User dropdown */}
						<UserButton
							size="icon"
							trigger={
								<button type="button" className="order-last">
									<UserAvatar user={session?.user} />
								</button>
							}
						/>
					</>
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

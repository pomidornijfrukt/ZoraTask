"use client"

import {
	AccountSettingsCards,
	OrganizationsCard,
	SessionsCard,
} from "@daveyplate/better-auth-ui"
import { Building2, Monitor, Settings, User } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AccountProfileForm } from "@/components/account-profile-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const accountNavItems = [
	{ path: "settings", label: "Account Settings", icon: Settings },
	{ path: "profile", label: "Profile", icon: User },
	{ path: "organizations", label: "Organizations", icon: Building2 },
	{ path: "sessions", label: "Sessions", icon: Monitor },
]

export default function AccountSettingsPage() {
	const searchParams = useSearchParams()
	const currentTab = searchParams.get("tab") || "profile"

	const renderContent = () => {
		switch (currentTab) {
			case "settings":
				return <AccountSettingsCards />
			case "organizations":
				return <OrganizationsCard />
			case "sessions":
				return <SessionsCard />
			default:
				return <AccountProfileForm />
		}
	}

	return (
		<div className="container mx-auto p-4 md:p-6 max-w-7xl">
			<div className="mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
					Account Settings
				</h1>
				<p className="text-sm md:text-base text-muted-foreground">
					Manage your account settings and preferences
				</p>
			</div>

			<div className="flex flex-col lg:flex-row gap-6">
				{/* Navigation Sidebar */}
				<nav className="lg:w-64 flex-shrink-0">
					<Card>
						<CardContent className="p-2">
							<div className="flex flex-row lg:flex-col space-x-1 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible">
								{accountNavItems.map((item) => {
									const Icon = item.icon
									return (
										<Link key={item.path} href={`/account?tab=${item.path}`}>
											<Button
												variant="ghost"
												className={cn(
													"w-full justify-start whitespace-nowrap",
													currentTab === item.path &&
														"bg-accent text-accent-foreground",
												)}
											>
												<Icon className="mr-2 h-4 w-4" />
												<span className="hidden sm:inline">{item.label}</span>
											</Button>
										</Link>
									)
								})}
							</div>
						</CardContent>
					</Card>
				</nav>

				{/* Content Area */}
				<div className="flex-1 min-w-0">{renderContent()}</div>
			</div>
		</div>
	)
}

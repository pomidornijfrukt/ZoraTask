"use client"
import { authClient } from "@/lib/auth/auth-client"
import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
	const router = useRouter()
	return (
		<AuthUIProvider
			authClient={authClient}
			navigate={router.push}
			replace={router.replace}
			additionalFields={{}}
			onSessionChange={() => {
				router.refresh()
			}}
			deleteUser={true}
			organization
			credentials={false}
			social={{ providers: ["github", "google"] }}
			account={{
				fields: ["name", "email"],
			}}
		>
			{children}
		</AuthUIProvider>
	)
}

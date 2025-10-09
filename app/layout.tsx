import { Analytics } from "@vercel/analytics/next"
import type React from "react"
import { Suspense } from "react"
import "@/styles/globals.css"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="dark">
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem={true}
				>
					<Providers>
						<Suspense fallback={null}>
							<Header />
							{children}
							<Analytics />
							<Toaster />
						</Suspense>
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	)
}

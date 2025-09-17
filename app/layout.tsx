import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "@/styles/globals.css"
import { Providers } from "./providers"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"

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
          enableSystem
        >
          <Suspense fallback={null}>
            <Header />
            <Providers>{children}</Providers>
            <Analytics />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}

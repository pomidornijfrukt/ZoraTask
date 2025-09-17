"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Kanban, Home, FolderOpen } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/projects",
      label: "Projects",
      icon: FolderOpen,
      active: pathname.startsWith("/projects"),
    },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Kanban className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Zora</span>
            </Link>

            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button key={item.href} variant={item.active ? "default" : "ghost"} size="sm" asChild>
                    <Link href={item.href} className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

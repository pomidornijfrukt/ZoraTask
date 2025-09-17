"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Kanban, Home, FolderOpen } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { UserButton } from "@daveyplate/better-auth-ui";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const pathname = usePathname();

  // Access session data using Better Auth's useSession hook
  const { data: session, isPending } = authClient.useSession();

  // Determine if the user is signed in
  const isSignedIn = !isPending && session?.user;

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
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b bg-card">
      {/* Logo and Navigation */}
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2">
          <Kanban className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Zora</span>
        </Link>

        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant={item.active ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Picker */}
        <ThemeToggle />
        {/* Auth buttons */}
        {!isSignedIn ? (
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Sign In
          </Link>
        ) : (
          <UserButton />
        )}
      </div>
    </header>
  );
}

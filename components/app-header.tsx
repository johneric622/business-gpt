"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileText, LogOut } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            BusinessPlan GPT
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {!isLoading && user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Sign out</span>
              </Button>
            </>
          ) : !isLoading ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="text-xs">
                <Link href="/auth?mode=signup">Sign Up</Link>
              </Button>
            </>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

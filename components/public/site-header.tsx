"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const isCatalog = pathname.startsWith("/prompts");

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[color:var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-base font-bold tracking-tight">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--foreground)] text-[color:var(--background)]">
            P
          </span>
          {siteConfig.name}
        </Link>

        <nav className="flex items-center gap-2" aria-label="Primary">
          <Button variant={isCatalog ? "default" : "ghost"} asChild>
            <Link href="/prompts" aria-current={isCatalog ? "page" : undefined}>
              Catalog
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              href="/login"
              className={cn(pathname === "/login" ? "font-semibold" : undefined)}
              aria-current={pathname === "/login" ? "page" : undefined}
            >
              Admin Login
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[color:var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-base font-bold tracking-tight">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--foreground)] text-[color:var(--background)]">
            P
          </span>
          {siteConfig.name}
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/prompts">Catalog</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Admin Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

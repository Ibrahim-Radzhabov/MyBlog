import Link from "next/link";

import { siteConfig } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 text-sm text-[color:var(--muted-foreground)] sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p>
          {new Date().getFullYear()} {siteConfig.name}. Готовые сценарии работы с промптами для команд.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/prompts" className="hover:text-[color:var(--foreground)]">
            Каталог промптов
          </Link>
          <Link href="/login" className="hover:text-[color:var(--foreground)]">
            Админка
          </Link>
        </div>
      </div>
    </footer>
  );
}

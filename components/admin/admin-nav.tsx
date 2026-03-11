"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type AdminLink = {
  href: string;
  label: string;
};

type AdminNavProps = {
  links: AdminLink[];
};

export function AdminNav({ links }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Разделы админки">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-[color:var(--foreground)] text-[color:var(--background)]"
                : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

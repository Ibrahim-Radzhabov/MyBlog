import { signOutAction } from "@/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";

type AdminShellProps = {
  children: React.ReactNode;
};

const links = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/prompts", label: "Промпты" },
  { href: "/admin/prompts/new", label: "Новый промпт" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/tags", label: "Теги" },
];

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[color:var(--surface)]/60">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--background)]">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Админка</p>
            <h1 className="text-base font-semibold">{siteConfig.name}</h1>
          </div>

          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Выйти
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="h-fit rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-3 lg:sticky lg:top-24">
          <AdminNav links={links} />
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}

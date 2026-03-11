import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">404</p>
      <h1 className="text-4xl font-semibold">Страница не найдена</h1>
      <p className="text-sm text-[color:var(--muted-foreground)]">
        Страница, которую вы ищете, не существует или была перемещена.
      </p>
      <Button asChild>
        <Link href="/">На главную</Link>
      </Button>
    </main>
  );
}

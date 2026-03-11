import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/public/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/constants";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";

type SearchParams = Promise<{
  error?: string;
}>;

const errorMessages: Record<string, string> = {
  auth_required: "Для доступа к админке необходимо войти.",
  not_admin_email: "Этот аккаунт не совпадает с ADMIN_EMAIL.",
  forbidden: "Профиль не имеет роль admin.",
};

export const metadata: Metadata = {
  title: "Вход в админку",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  if (user && user.email?.toLowerCase() === siteConfig.adminEmail.toLowerCase() && profile?.role === "admin") {
    redirect("/admin");
  }

  const error = params.error ? errorMessages[params.error] : null;

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[color:var(--background)] lg:grid-cols-2">
      <section className="hidden border-r border-[color:var(--border)] bg-[color:var(--surface)] p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Открытый доступ</p>
          <h1 className="text-4xl font-semibold leading-tight">Каталог доступен всем, но редактирование разрешено только администратору.</h1>
        </div>
        <Button asChild variant="outline" className="w-fit">
          <Link href="/prompts">Назад в каталог</Link>
        </Button>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Вход администратора</CardTitle>
            <CardDescription>
              Доступ разрешен только для <strong>{siteConfig.adminEmail}</strong> с ролью <strong>admin</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <p className="rounded-md border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 p-2 text-sm text-[color:var(--danger)]">
                {error}
              </p>
            ) : null}
            <LoginForm />
            <p className="text-center text-xs text-[color:var(--muted-foreground)]">
              Публичная регистрация должна быть отключена в настройках Supabase Auth.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

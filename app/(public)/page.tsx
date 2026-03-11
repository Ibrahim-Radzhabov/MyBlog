import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { PromptCard } from "@/components/public/prompt-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCategories } from "@/lib/db/categories";
import { getFeaturedPrompts } from "@/lib/db/prompts";

export const metadata: Metadata = {
  title: "Каталог промптов",
  description: "Готовые промпты для маркетинга, текста, продуктовой работы и автоматизации.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Каталог промптов",
    description: "Готовые промпты для маркетинга, текста, продуктовой работы и автоматизации.",
    url: "/",
  },
};

const howItWorks = [
  {
    title: "Выберите промпт",
    description: "Откройте каталог и найдите нужный шаблон по категориям и тегам.",
  },
  {
    title: "Настройте под задачу",
    description: "Проверьте переменные, пример результата и скопируйте текст в один клик.",
  },
  {
    title: "Используйте в работе",
    description: "Применяйте структуру промптов в клиентских проектах и внутренних процессах.",
  },
];

export default async function HomePage() {
  const [featuredPrompts, categories] = await Promise.all([getFeaturedPrompts(3), getAllCategories()]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid items-center gap-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
            MVP-каталог промптов
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Публикуйте и управляйте промптами в удобной и безопасной админ-панели.
          </h1>
          <p className="max-w-xl text-base text-[color:var(--muted-foreground)]">
            Гости видят только опубликованные материалы, а управление и редактирование доступны только администратору.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/prompts">Открыть каталог</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Вход в админку</Link>
            </Button>
          </div>
        </div>

        <Card className="border-[color:var(--border)] bg-[color:var(--surface)]">
          <CardHeader>
            <CardTitle>Готово к запуску</CardTitle>
            <CardDescription>Безопасная архитектура на App Router и Supabase RLS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[color:var(--muted-foreground)]">
            <p>Админка защищена на сервере.</p>
            <p>Публичный каталог с поиском и фильтрами.</p>
            <p>SEO-метаданные, sitemap и robots готовы.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Рекомендуемые промпты</h2>
            <p className="text-sm text-[color:var(--muted-foreground)]">Подборка опубликованных примеров из каталога.</p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/prompts">Смотреть все</Link>
          </Button>
        </div>

        {featuredPrompts.length === 0 ? (
          <EmptyState
            title="Пока нет опубликованных промптов"
            description="Опубликуйте хотя бы один промпт в админке, чтобы заполнить каталог."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Категории</h2>
        {categories.length === 0 ? (
          <EmptyState title="Категорий пока нет" description="Категории появятся после заполнения данных или создания в админке." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <CardDescription>{category.description || "Категория готова для группировки промптов."}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Как это работает</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {howItWorks.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

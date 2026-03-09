import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { PromptCard } from "@/components/public/prompt-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCategories } from "@/lib/db/categories";
import { getFeaturedPrompts } from "@/lib/db/prompts";

export const metadata: Metadata = {
  title: "Prompt Catalog",
  description: "Browse premium-ready prompts for writing, marketing, product workflows, and automation.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Prompt Catalog",
    description: "Browse premium-ready prompts for writing, marketing, product workflows, and automation.",
    url: "/",
  },
};

const howItWorks = [
  {
    title: "Browse curated prompts",
    description: "Discover production-ready prompts grouped by category and tags.",
  },
  {
    title: "Pick your template",
    description: "Open prompt details, inspect variables, and copy the final prompt text instantly.",
  },
  {
    title: "Apply to your workflow",
    description: "Reuse prompt structures in your products, client work, or internal ops.",
  },
];

export default async function HomePage() {
  const [featuredPrompts, categories] = await Promise.all([getFeaturedPrompts(3), getAllCategories()]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid items-center gap-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
            Prompt Catalog MVP
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Publish, manage, and ship prompt experiences with clean admin control.
          </h1>
          <p className="max-w-xl text-base text-[color:var(--muted-foreground)]">
            Public visitors can explore published prompts instantly, while admin-only tools keep editorial workflow secure.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/prompts">Browse all prompts</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Admin login</Link>
            </Button>
          </div>
        </div>

        <Card className="border-[color:var(--border)] bg-[color:var(--surface)]">
          <CardHeader>
            <CardTitle>Launch-ready content operations</CardTitle>
            <CardDescription>Security-first architecture with App Router + Supabase RLS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[color:var(--muted-foreground)]">
            <p>Server-protected admin area.</p>
            <p>Public storefront with search and filters.</p>
            <p>SEO-ready detail pages and sitemap support.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Featured prompts</h2>
            <p className="text-sm text-[color:var(--muted-foreground)]">Freshly curated examples from the published catalog.</p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/prompts">View all</Link>
          </Button>
        </div>

        {featuredPrompts.length === 0 ? (
          <EmptyState
            title="No published prompts yet"
            description="Publish at least one prompt from the admin area to populate the storefront."
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
        <h2 className="text-2xl font-semibold">Category highlights</h2>
        {categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Categories will appear here once seeded or created by admin." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <CardDescription>{category.description || "Category ready for prompt grouping."}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">How it works</h2>
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

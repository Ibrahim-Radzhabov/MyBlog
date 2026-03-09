import Link from "next/link";
import type { Metadata } from "next";

import { EmptyState } from "@/components/shared/empty-state";
import { PromptCard } from "@/components/public/prompt-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { defaultPageSize } from "@/lib/constants";
import { getAllCategories } from "@/lib/db/categories";
import { getPromptCatalog } from "@/lib/db/prompts";
import { getAllTags } from "@/lib/db/tags";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  tag?: string;
  page?: string;
}>;

export const metadata: Metadata = {
  title: "Prompts",
  description: "Explore published prompts with fast search and category filtering.",
  alternates: {
    canonical: "/prompts",
  },
  openGraph: {
    title: "Prompts",
    description: "Explore published prompts with fast search and category filtering.",
    url: "/prompts",
  },
};

function buildPageHref(currentParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(currentParams.toString());

  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/prompts?${query}` : "/prompts";
}

export default async function PromptsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const [catalog, categories, tags] = await Promise.all([
    getPromptCatalog({
      search: q || undefined,
      categorySlug: category || undefined,
      tagSlug: tag || undefined,
      page,
      pageSize: defaultPageSize,
      includeDrafts: false,
    }),
    getAllCategories(),
    getAllTags(),
  ]);

  const activeParams = new URLSearchParams();
  if (q) activeParams.set("q", q);
  if (category) activeParams.set("category", category);
  if (tag) activeParams.set("tag", tag);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold md:text-4xl">Prompt catalog</h1>
        <p className="max-w-2xl text-sm text-[color:var(--muted-foreground)]">
          Browse only published prompts. Filter by category and tags to find the exact template you need.
        </p>
      </section>

      <Card>
        <CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search prompts"
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            />

            <select
              name="category"
              defaultValue={category}
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              name="tag"
              defaultValue={tag}
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            >
              <option value="">All tags</option>
              {tags.map((item) => (
                <option key={item.id} value={item.slug}>
                  #{item.name}
                </option>
              ))}
            </select>

            <Button type="submit">Apply</Button>
          </form>
        </CardContent>
      </Card>

      {catalog.items.length === 0 ? (
        <EmptyState
          title="No prompts found"
          description="Try clearing filters or using a broader search query."
          action={
            <Button asChild variant="outline">
              <Link href="/prompts">Clear filters</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {catalog.items.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[color:var(--border)] pt-4">
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Showing page {catalog.page} of {Math.max(catalog.pageCount, 1)}
            </p>
            <div className="flex items-center gap-2">
              {catalog.page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildPageHref(activeParams, catalog.page - 1)}>Previous</Link>
                </Button>
              ) : null}

              {catalog.page < catalog.pageCount ? (
                <Button asChild size="sm">
                  <Link href={buildPageHref(activeParams, catalog.page + 1)}>Next</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

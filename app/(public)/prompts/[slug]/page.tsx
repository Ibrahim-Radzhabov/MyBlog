import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CopyPromptButton } from "@/components/public/copy-prompt-button";
import { PromptCard } from "@/components/public/prompt-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPromptBySlug, recordPromptView } from "@/lib/db/prompts";
import { safeJsonParse } from "@/lib/utils";
import type { PromptVariable } from "@/types/prompt";

type Params = Promise<{
  slug: string;
}>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPromptBySlug(slug);

  if (!data) {
    return {
      title: "Prompt not found",
    };
  }

  return {
    title: data.prompt.seo_title ?? data.prompt.title,
    description: data.prompt.seo_description ?? data.prompt.short_description,
    openGraph: {
      title: data.prompt.seo_title ?? data.prompt.title,
      description: data.prompt.seo_description ?? data.prompt.short_description,
      type: "article",
      url: `/prompts/${slug}`,
      images: data.prompt.cover_image_url ? [data.prompt.cover_image_url] : undefined,
    },
  };
}

export default async function PromptDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getPromptBySlug(slug);

  if (!data) {
    notFound();
  }

  const requestHeaders = await headers();
  await recordPromptView({
    promptId: data.prompt.id,
    sessionId: requestHeaders.get("x-vercel-id") ?? undefined,
    referrer: requestHeaders.get("referer") ?? undefined,
    userAgent: requestHeaders.get("user-agent") ?? undefined,
  });

  const variables = safeJsonParse<PromptVariable[]>(JSON.stringify(data.prompt.variables_json), []);

  return (
    <article className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-sm text-[color:var(--muted-foreground)]">
        <Link href="/prompts" className="hover:text-[color:var(--foreground)] hover:underline">
          Prompts
        </Link>
        <span className="mx-2">/</span>
        <span>{data.prompt.title}</span>
      </nav>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {data.prompt.category ? <Badge variant="secondary">{data.prompt.category.name}</Badge> : null}
          {data.prompt.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              #{tag.name}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{data.prompt.title}</h1>
        <p className="max-w-3xl text-base text-[color:var(--muted-foreground)]">{data.prompt.short_description}</p>
      </header>

      {data.prompt.cover_image_url ? (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.prompt.cover_image_url} alt={data.prompt.title} className="h-auto w-full object-cover" loading="lazy" />
        </div>
      ) : null}

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Full prompt</h2>
          <CopyPromptButton content={data.prompt.full_prompt_text} />
        </div>

        <pre className="prose-prompt whitespace-pre-wrap text-sm text-[color:var(--foreground)]">
          {data.prompt.full_prompt_text}
        </pre>
      </section>

      {variables.length > 0 ? (
        <section className="space-y-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <h2 className="text-xl font-semibold">Variables</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {variables.map((variable) => (
              <Card key={variable.name}>
                <CardHeader>
                  <CardTitle className="text-base">{variable.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-[color:var(--muted-foreground)]">
                  <p>
                    <span className="font-medium text-[color:var(--foreground)]">Name:</span> {variable.name}
                  </p>
                  <p>
                    <span className="font-medium text-[color:var(--foreground)]">Type:</span> {variable.type}
                  </p>
                  <p>
                    <span className="font-medium text-[color:var(--foreground)]">Required:</span>{" "}
                    {variable.required ? "Yes" : "No"}
                  </p>
                  {variable.placeholder ? (
                    <p>
                      <span className="font-medium text-[color:var(--foreground)]">Placeholder:</span>{" "}
                      {variable.placeholder}
                    </p>
                  ) : null}
                  {variable.options?.length ? (
                    <p>
                      <span className="font-medium text-[color:var(--foreground)]">Options:</span>{" "}
                      {variable.options.join(", ")}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {data.prompt.output_example ? (
        <section className="space-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <h2 className="text-xl font-semibold">Output example</h2>
          <pre className="prose-prompt whitespace-pre-wrap text-sm text-[color:var(--foreground)]">
            {data.prompt.output_example}
          </pre>
        </section>
      ) : null}

      {data.related.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Related prompts</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.related.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      ) : null}

      <div>
        <Link href="/prompts" className="text-sm font-medium underline-offset-4 hover:underline">
          Back to catalog
        </Link>
      </div>
    </article>
  );
}

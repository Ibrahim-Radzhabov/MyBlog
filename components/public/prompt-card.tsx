import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type PromptCardProps = {
  prompt: {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    status: "draft" | "published";
    category: {
      name: string;
      slug: string;
    } | null;
    tags: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  showStatus?: boolean;
};

export function PromptCard({ prompt, showStatus = false }: PromptCardProps) {
  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {prompt.category ? <Badge variant="secondary">{prompt.category.name}</Badge> : null}
          {showStatus ? <StatusBadge status={prompt.status} /> : null}
        </div>
        <CardTitle className="line-clamp-2 text-xl leading-snug">
          <Link href={`/prompts/${prompt.slug}`} className="hover:underline">
            {prompt.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="line-clamp-3 text-sm leading-relaxed text-[color:var(--muted-foreground)]">{prompt.short_description}</p>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-[11px]">
              #{tag.name}
            </Badge>
          ))}
        </div>
        <Link
          href={`/prompts/${prompt.slug}`}
          className="text-sm font-medium text-[color:var(--foreground)] underline-offset-4 hover:underline"
        >
          Открыть
        </Link>
      </CardFooter>
    </Card>
  );
}

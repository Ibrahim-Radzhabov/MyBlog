import Link from "next/link";

import { deletePromptAction, togglePromptStatusAction } from "@/actions/prompts";
import { ConfirmActionModal } from "@/components/shared/confirm-action-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminPageSize } from "@/lib/constants";
import { getAllCategories } from "@/lib/db/categories";
import { getPromptCatalog } from "@/lib/db/prompts";
import { formatDate } from "@/lib/utils";

type SearchParams = Promise<{
  q?: string;
  status?: "draft" | "published";
  category?: string;
  page?: string;
}>;

function buildPageHref(currentParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(currentParams.toString());

  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/admin/prompts?${query}` : "/admin/prompts";
}

export default async function AdminPromptsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status === "draft" || params.status === "published" ? params.status : undefined;
  const category = params.category?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const [catalog, categories] = await Promise.all([
    getPromptCatalog({
      search: q || undefined,
      status,
      categorySlug: category || undefined,
      includeDrafts: true,
      page,
      pageSize: adminPageSize,
    }),
    getAllCategories(),
  ]);

  const activeParams = new URLSearchParams();
  if (q) activeParams.set("q", q);
  if (status) activeParams.set("status", status);
  if (category) activeParams.set("category", category);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold">Manage prompts</h2>
          <p className="text-sm text-[color:var(--muted-foreground)]">Search, publish, unpublish, and edit prompt records.</p>
        </div>
        <Button asChild>
          <Link href="/admin/prompts/new">New prompt</Link>
        </Button>
      </div>

      <form className="grid gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-4 md:grid-cols-[1fr_180px_200px_auto]">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search title or slug"
          className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
        />

        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

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

        <Button type="submit">Apply</Button>
      </form>

      {catalog.items.length === 0 ? (
        <EmptyState
          title="No prompts found"
          description="Create a new prompt or adjust filters to see existing entries."
          action={
            <Button asChild>
              <Link href="/admin/prompts/new">Create prompt</Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--background)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.items.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell className="font-medium">{prompt.title}</TableCell>
                  <TableCell className="text-[color:var(--muted-foreground)]">/{prompt.slug}</TableCell>
                  <TableCell>{prompt.category?.name ?? "-"}</TableCell>
                  <TableCell>
                    <StatusBadge status={prompt.status} />
                  </TableCell>
                  <TableCell className="text-[color:var(--muted-foreground)]">{formatDate(prompt.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/prompts/${prompt.id}/edit`}>Edit</Link>
                      </Button>

                      <form action={togglePromptStatusAction}>
                        <input type="hidden" name="promptId" value={prompt.id} />
                        <Button type="submit" size="sm" variant="secondary">
                          {prompt.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                      </form>

                      <ConfirmActionModal
                        action={deletePromptAction}
                        fields={{ promptId: prompt.id }}
                        title="Delete prompt?"
                        description={`This will permanently remove “${prompt.title}”.`}
                        triggerLabel="Delete"
                        confirmLabel="Delete prompt"
                        testId={`delete-prompt-${prompt.slug}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-[color:var(--border)] px-4 py-3">
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Page {catalog.page} of {Math.max(catalog.pageCount, 1)}
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
        </div>
      )}
    </div>
  );
}

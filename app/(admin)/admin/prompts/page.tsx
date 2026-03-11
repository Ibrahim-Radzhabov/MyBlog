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
          <h2 className="text-3xl font-semibold">Управление промптами</h2>
          <p className="text-sm text-[color:var(--muted-foreground)]">Ищите, публикуйте, снимайте с публикации и редактируйте промпты.</p>
        </div>
        <Button asChild>
          <Link href="/admin/prompts/new">Новый промпт</Link>
        </Button>
      </div>

      <form className="grid gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-4 md:grid-cols-[1fr_180px_200px_auto]">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Поиск по названию или slug"
          className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
        />

        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
        >
          <option value="">Все статусы</option>
          <option value="draft">Черновик</option>
          <option value="published">Опубликовано</option>
        </select>

        <select
          name="category"
          defaultValue={category}
          className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
        >
          <option value="">Все категории</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>

        <Button type="submit">Применить</Button>
      </form>

      {catalog.items.length === 0 ? (
        <EmptyState
          title="Промпты не найдены"
          description="Создайте новый промпт или измените фильтры, чтобы увидеть существующие записи."
          action={
            <Button asChild>
              <Link href="/admin/prompts/new">Создать промпт</Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--background)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Обновлено</TableHead>
                <TableHead className="text-right">Действия</TableHead>
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
                        <Link href={`/admin/prompts/${prompt.id}/edit`}>Редактировать</Link>
                      </Button>

                      <form action={togglePromptStatusAction}>
                        <input type="hidden" name="promptId" value={prompt.id} />
                        <Button type="submit" size="sm" variant="secondary">
                          {prompt.status === "published" ? "Снять с публикации" : "Опубликовать"}
                        </Button>
                      </form>

                      <ConfirmActionModal
                        action={deletePromptAction}
                        fields={{ promptId: prompt.id }}
                        title="Удалить промпт?"
                        description={`Промпт «${prompt.title}» будет удален без возможности восстановления.`}
                        triggerLabel="Удалить"
                        confirmLabel="Удалить промпт"
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
              Страница {catalog.page} из {Math.max(catalog.pageCount, 1)}
            </p>

            <div className="flex items-center gap-2">
              {catalog.page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={buildPageHref(activeParams, catalog.page - 1)}>Назад</Link>
                </Button>
              ) : null}

              {catalog.page < catalog.pageCount ? (
                <Button asChild size="sm">
                  <Link href={buildPageHref(activeParams, catalog.page + 1)}>Вперед</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

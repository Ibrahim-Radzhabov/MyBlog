import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentPrompts } from "@/lib/db/prompts";
import { getAdminStats, getRecentAdminEvents } from "@/lib/db/stats";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [stats, recentPrompts, recentAdminEvents] = await Promise.all([
    getAdminStats(),
    getRecentPrompts(8),
    getRecentAdminEvents(8),
  ]);

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h2 className="text-3xl font-semibold">Дашборд</h2>
        <p className="text-sm text-[color:var(--muted-foreground)]">Следите за состоянием публикаций и переходите к управлению промптами.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Всего промптов</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalPrompts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Опубликовано</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.publishedPrompts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Черновики</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.draftPrompts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Просмотры (7 дней)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.recentViews}</p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/prompts/new">Создать промпт</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/prompts">Управление промптами</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/categories">Управление категориями</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/tags">Управление тегами</Link>
        </Button>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Недавние промпты</h3>
        {recentPrompts.length === 0 ? (
          <EmptyState
            title="Промптов пока нет"
            description="Создайте первый промпт, чтобы наполнить каталог и начать собирать статистику."
            action={
              <Button asChild>
                <Link href="/admin/prompts/new">Создать первый промпт</Link>
              </Button>
            }
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-[color:var(--border)]">
                {recentPrompts.map((prompt) => (
                  <li key={prompt.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="font-medium">{prompt.title}</p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">/{prompt.slug} · Обновлено {formatDate(prompt.updated_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={prompt.status} />
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/prompts/${prompt.id}/edit`}>Редактировать</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Журнал действий</h3>
        {recentAdminEvents.length === 0 ? (
          <EmptyState
            title="Пока нет действий администратора"
            description="Здесь появятся события создания, обновления, удаления и загрузки."
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-[color:var(--border)]">
                {recentAdminEvents.map((event) => (
                  <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {event.action} · {event.entity_type}
                      </p>
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        {event.entity_ref ?? event.entity_id ?? "-"}
                      </p>
                    </div>
                    <p className="text-xs text-[color:var(--muted-foreground)]">
                      {formatDateTime(event.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

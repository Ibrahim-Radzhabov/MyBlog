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
        <h2 className="text-3xl font-semibold">Dashboard</h2>
        <p className="text-sm text-[color:var(--muted-foreground)]">Track publishing health and jump straight into prompt operations.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalPrompts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.publishedPrompts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.draftPrompts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[color:var(--muted-foreground)]">Views (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.recentViews}</p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/prompts/new">Create prompt</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/prompts">Manage prompts</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/categories">Manage categories</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/tags">Manage tags</Link>
        </Button>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Recent prompts</h3>
        {recentPrompts.length === 0 ? (
          <EmptyState
            title="No prompts yet"
            description="Create your first prompt to unlock catalog content and analytics."
            action={
              <Button asChild>
                <Link href="/admin/prompts/new">Create first prompt</Link>
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
                      <p className="text-xs text-[color:var(--muted-foreground)]">/{prompt.slug} · Updated {formatDate(prompt.updated_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={prompt.status} />
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/prompts/${prompt.id}/edit`}>Edit</Link>
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
        <h3 className="text-xl font-semibold">Audit trail</h3>
        {recentAdminEvents.length === 0 ? (
          <EmptyState
            title="No admin events yet"
            description="Admin create/update/delete and upload actions will appear here."
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

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SearchEventRow = Database["public"]["Tables"]["search_events"]["Row"];

function isMissingSearchEventsTable(code?: string) {
  return code === "42P01";
}

export async function getAdminStats() {
  const supabase = await createClient();

  const [
    { count: totalPrompts, error: totalError },
    { count: publishedPrompts, error: publishedError },
    { count: draftPrompts, error: draftError },
    { count: recentViews, error: viewsError },
  ] = await Promise.all([
    supabase.from("prompts").select("id", { count: "exact", head: true }),
    supabase.from("prompts").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("prompts").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase
      .from("prompt_views")
      .select("id", { count: "exact", head: true })
      .gte("viewed_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()),
  ]);

  if (totalError || publishedError || draftError || viewsError) {
    throw new Error(
      totalError?.message ?? publishedError?.message ?? draftError?.message ?? viewsError?.message
    );
  }

  return {
    totalPrompts: totalPrompts ?? 0,
    publishedPrompts: publishedPrompts ?? 0,
    draftPrompts: draftPrompts ?? 0,
    recentViews: recentViews ?? 0,
  };
}

export async function getRecentViews(limit = 12) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompt_views")
    .select("id, prompt_id, viewed_at, referrer")
    .order("viewed_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getRecentAdminEvents(limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_events")
    .select("id, action, entity_type, entity_id, entity_ref, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function recordSearchEvent(params: {
  query?: string;
  categorySlug?: string;
  tagSlug?: string;
  resultsCount: number;
  path?: string;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("search_events").insert({
    query: params.query?.trim() ?? "",
    category_slug: params.categorySlug?.trim() || null,
    tag_slug: params.tagSlug?.trim() || null,
    results_count: Math.max(0, params.resultsCount),
    path: params.path ?? "/prompts",
    session_id: params.sessionId ?? null,
    referrer: params.referrer ?? null,
    user_agent: params.userAgent ?? null,
  });

  if (!error) {
    return;
  }

  if (isMissingSearchEventsTable(error.code)) {
    return;
  }

  console.error("Failed to record search event", error.message);
}

export async function getSearchInsights(days = 30, limit = 8) {
  const supabase = await createClient();
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * days).toISOString();
  const { data, error } = await supabase
    .from("search_events")
    .select("query, results_count, searched_at")
    .gte("searched_at", since)
    .order("searched_at", { ascending: false })
    .limit(5000);

  if (error) {
    if (isMissingSearchEventsTable(error.code)) {
      return {
        topQueries: [] as Array<{
          query: string;
          searches: number;
          zeroResults: number;
          lastSearchedAt: string;
        }>,
        zeroResultQueries: [] as Array<{
          query: string;
          misses: number;
          lastSearchedAt: string;
        }>,
      };
    }

    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<Pick<SearchEventRow, "query" | "results_count" | "searched_at">>;

  const aggregates = new Map<
    string,
    {
      query: string;
      searches: number;
      zeroResults: number;
      lastSearchedAt: string;
    }
  >();

  for (const row of rows) {
    const normalizedQuery = row.query.trim().toLowerCase();
    if (!normalizedQuery) {
      continue;
    }

    const current = aggregates.get(normalizedQuery) ?? {
      query: normalizedQuery,
      searches: 0,
      zeroResults: 0,
      lastSearchedAt: row.searched_at,
    };

    current.searches += 1;
    if (row.results_count === 0) {
      current.zeroResults += 1;
    }
    if (row.searched_at > current.lastSearchedAt) {
      current.lastSearchedAt = row.searched_at;
    }

    aggregates.set(normalizedQuery, current);
  }

  const topQueries = Array.from(aggregates.values())
    .sort((a, b) => b.searches - a.searches || b.lastSearchedAt.localeCompare(a.lastSearchedAt))
    .slice(0, limit);

  const zeroResultQueries = Array.from(aggregates.values())
    .filter((entry) => entry.zeroResults > 0)
    .sort((a, b) => b.zeroResults - a.zeroResults || b.lastSearchedAt.localeCompare(a.lastSearchedAt))
    .slice(0, limit)
    .map((entry) => ({
      query: entry.query,
      misses: entry.zeroResults,
      lastSearchedAt: entry.lastSearchedAt,
    }));

  return { topQueries, zeroResultQueries };
}

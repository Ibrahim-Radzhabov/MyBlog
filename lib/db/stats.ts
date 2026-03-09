import { createClient } from "@/lib/supabase/server";

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

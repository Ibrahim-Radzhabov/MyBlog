import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type PromptRow = Database["public"]["Tables"]["prompts"]["Row"];
type PromptListRow = Pick<
  PromptRow,
  | "id"
  | "title"
  | "slug"
  | "short_description"
  | "status"
  | "cover_image_url"
  | "updated_at"
  | "published_at"
  | "category_id"
>;

type PromptCard = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  status: "draft" | "published";
  cover_image_url: string | null;
  updated_at: string;
  published_at: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
};

type CatalogFilters = {
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
  page?: number;
  pageSize?: number;
  includeDrafts?: boolean;
  status?: "draft" | "published";
};

async function getCategoryIdBySlug(slug: string | undefined) {
  if (!slug) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return data?.id ?? null;
}

async function getTagIdBySlug(slug: string | undefined) {
  if (!slug) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("id").eq("slug", slug).maybeSingle();

  return data?.id ?? null;
}

async function getPromptIdsByTag(tagId: string | null) {
  if (!tagId) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("prompt_tags").select("prompt_id").eq("tag_id", tagId);

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((row) => row.prompt_id);
}

async function enrichPromptRows(rows: PromptListRow[]): Promise<PromptCard[]> {
  if (rows.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const categoryIds = Array.from(new Set(rows.map((row) => row.category_id).filter(Boolean))) as string[];
  const promptIds = rows.map((row) => row.id);

  const [{ data: categories }, { data: promptTags }] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("id, name, slug").in("id", categoryIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; slug: string }> }),
    supabase
      .from("prompt_tags")
      .select("prompt_id, tags ( id, name, slug )")
      .in("prompt_id", promptIds),
  ]);

  const categoriesMap = new Map((categories ?? []).map((category) => [category.id, category]));
  const tagsMap = new Map<string, PromptCard["tags"]>();

  (promptTags ?? []).forEach((row) => {
    const current = tagsMap.get(row.prompt_id) ?? [];
    const tagData = Array.isArray(row.tags) ? row.tags[0] : row.tags;

    if (tagData) {
      current.push({
        id: tagData.id,
        name: tagData.name,
        slug: tagData.slug,
      });
    }

    tagsMap.set(row.prompt_id, current);
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    short_description: row.short_description,
    status: row.status,
    cover_image_url: row.cover_image_url,
    updated_at: row.updated_at,
    published_at: row.published_at,
    category: row.category_id ? categoriesMap.get(row.category_id) ?? null : null,
    tags: tagsMap.get(row.id) ?? [],
  }));
}

export async function getPromptCatalog(filters: CatalogFilters = {}) {
  const supabase = await createClient();
  const {
    search,
    categorySlug,
    tagSlug,
    page = 1,
    pageSize = 12,
    includeDrafts = false,
    status,
  } = filters;

  const categoryId = await getCategoryIdBySlug(categorySlug);
  if (categorySlug && !categoryId) {
    return {
      items: [] as PromptCard[],
      total: 0,
      page,
      pageSize,
      pageCount: 0,
    };
  }

  const tagId = await getTagIdBySlug(tagSlug);
  if (tagSlug && !tagId) {
    return {
      items: [] as PromptCard[],
      total: 0,
      page,
      pageSize,
      pageCount: 0,
    };
  }

  const promptIdsByTag = await getPromptIdsByTag(tagId);
  if (Array.isArray(promptIdsByTag) && promptIdsByTag.length === 0) {
    return {
      items: [] as PromptCard[],
      total: 0,
      page,
      pageSize,
      pageCount: 0,
    };
  }

  let countQuery = supabase.from("prompts").select("id", { count: "exact", head: true });
  let dataQuery = supabase
    .from("prompts")
    .select(
      "id, title, slug, short_description, status, cover_image_url, category_id, published_at, updated_at"
    )
    .order("updated_at", { ascending: false });

  if (!includeDrafts) {
    countQuery = countQuery.eq("status", "published");
    dataQuery = dataQuery.eq("status", "published");
  }

  if (status) {
    countQuery = countQuery.eq("status", status);
    dataQuery = dataQuery.eq("status", status);
  }

  if (categoryId) {
    countQuery = countQuery.eq("category_id", categoryId);
    dataQuery = dataQuery.eq("category_id", categoryId);
  }

  if (Array.isArray(promptIdsByTag)) {
    countQuery = countQuery.in("id", promptIdsByTag);
    dataQuery = dataQuery.in("id", promptIdsByTag);
  }

  if (search) {
    countQuery = countQuery.textSearch("search_vector", search);
    dataQuery = dataQuery.textSearch("search_vector", search);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  dataQuery = dataQuery.range(from, to);

  const [{ count, error: countError }, { data: rows, error: rowsError }] = await Promise.all([
    countQuery,
    dataQuery,
  ]);

  if (countError) {
    throw new Error(countError.message);
  }

  if (rowsError) {
    throw new Error(rowsError.message);
  }

  const total = count ?? 0;
  const pageCount = Math.ceil(total / pageSize);
  const items = await enrichPromptRows(rows ?? []);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount,
  };
}

export async function getFeaturedPrompts(limit = 3) {
  const catalog = await getPromptCatalog({
    includeDrafts: false,
    page: 1,
    pageSize: limit,
  });

  return catalog.items;
}

export async function getPromptBySlug(slug: string) {
  const supabase = await createClient();
  const { data: prompt, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!prompt) {
    return null;
  }

  const promptListRow: PromptListRow = {
    id: prompt.id,
    title: prompt.title,
    slug: prompt.slug,
    short_description: prompt.short_description,
    status: prompt.status,
    cover_image_url: prompt.cover_image_url,
    updated_at: prompt.updated_at,
    published_at: prompt.published_at,
    category_id: prompt.category_id,
  };

  const [enriched] = await enrichPromptRows([promptListRow]);

  const relatedQuery = supabase
    .from("prompts")
    .select("id, title, slug, short_description, status, cover_image_url, category_id, published_at, updated_at")
    .eq("status", "published")
    .neq("id", prompt.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const { data: relatedRows, error: relatedError } = prompt.category_id
    ? await relatedQuery.eq("category_id", prompt.category_id)
    : await relatedQuery;

  if (relatedError) {
    throw new Error(relatedError.message);
  }

  return {
    prompt: {
      ...prompt,
      category: enriched?.category ?? null,
      tags: enriched?.tags ?? [],
    },
    related: await enrichPromptRows(relatedRows ?? []),
  };
}

export async function getPromptByIdForAdmin(id: string) {
  const supabase = await createClient();

  const [{ data: prompt, error: promptError }, { data: promptTags, error: tagsError }] = await Promise.all([
    supabase.from("prompts").select("*").eq("id", id).maybeSingle(),
    supabase.from("prompt_tags").select("tag_id").eq("prompt_id", id),
  ]);

  if (promptError) {
    throw new Error(promptError.message);
  }

  if (tagsError) {
    throw new Error(tagsError.message);
  }

  if (!prompt) {
    return null;
  }

  return {
    ...prompt,
    tag_ids: (promptTags ?? []).map((row) => row.tag_id),
  };
}

export async function getRecentPrompts(limit = 8) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompts")
    .select("id, title, slug, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function recordPromptView(params: {
  promptId: string;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("prompt_views").insert({
    prompt_id: params.promptId,
    session_id: params.sessionId ?? null,
    referrer: params.referrer ?? null,
    user_agent: params.userAgent ?? null,
  });

  if (error) {
    console.error("Failed to record prompt view", error.message);
  }
}

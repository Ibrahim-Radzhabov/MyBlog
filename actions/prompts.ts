"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminEvent } from "@/lib/db/audit";
import { promptFormSchema, type PromptFormValues } from "@/lib/validations/prompt";

function parseTagIds(value: FormDataEntryValue | null) {
  const raw = (value?.toString() ?? "").trim();

  if (!raw) {
    return [] as string[];
  }

  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function parseVariables(value: FormDataEntryValue | null) {
  const raw = value?.toString() ?? "";

  if (!raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => ({
      name: String(item.name ?? "").trim(),
      label: String(item.label ?? "").trim(),
      type: String(item.type ?? "text") as "text" | "number" | "select" | "boolean",
      required: Boolean(item.required),
      placeholder: String(item.placeholder ?? "").trim(),
      options: Array.isArray(item.options)
        ? item.options.map((option: unknown) => String(option).trim()).filter(Boolean)
        : [],
    }));
  } catch {
    return [];
  }
}

function toPromptPayload(formData: FormData): PromptFormValues {
  const intent = formData.get("intent")?.toString();
  const explicitStatus = formData.get("status")?.toString();
  const status = explicitStatus === "published" || intent === "publish" ? "published" : "draft";

  return {
    title: formData.get("title")?.toString().trim() ?? "",
    slug: formData.get("slug")?.toString().trim() ?? "",
    shortDescription: formData.get("shortDescription")?.toString().trim() ?? "",
    fullPromptText: formData.get("fullPromptText")?.toString().trim() ?? "",
    outputExample: formData.get("outputExample")?.toString().trim() ?? "",
    categoryId: formData.get("categoryId")?.toString().trim() ?? "",
    tagIds: parseTagIds(formData.get("tagIds")),
    variables: parseVariables(formData.get("variables")),
    status,
    coverImageUrl: formData.get("coverImageUrl")?.toString().trim() ?? "",
    seoTitle: formData.get("seoTitle")?.toString().trim() ?? "",
    seoDescription: formData.get("seoDescription")?.toString().trim() ?? "",
  };
}

function failRedirect(path: string, error: string): never {
  const message = encodeURIComponent(error);
  redirect(`${path}?toast=form_error&message=${message}`);
}

function normalizePromptData(values: PromptFormValues) {
  return {
    title: values.title,
    slug: values.slug,
    short_description: values.shortDescription,
    full_prompt_text: values.fullPromptText,
    output_example: values.outputExample || null,
    variables_json: values.variables,
    category_id: values.categoryId || null,
    status: values.status,
    cover_image_url: values.coverImageUrl || null,
    seo_title: values.seoTitle || null,
    seo_description: values.seoDescription || null,
    published_at: values.status === "published" ? new Date().toISOString() : null,
  };
}

async function syncPromptTags(promptId: string, tagIds: string[], supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"]) {
  const { error: deleteError } = await supabase.from("prompt_tags").delete().eq("prompt_id", promptId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (tagIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from("prompt_tags")
    .insert(tagIds.map((tagId) => ({ prompt_id: promptId, tag_id: tagId })));

  if (insertError) {
    throw new Error(insertError.message);
  }
}

function revalidatePromptPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/prompts");
  revalidatePath("/admin");
  revalidatePath("/admin/prompts");

  if (slug) {
    revalidatePath(`/prompts/${slug}`);
  }
}

export async function createPromptAction(formData: FormData) {
  const admin = await requireAdmin();
  const payload = toPromptPayload(formData);
  const parsed = promptFormSchema.safeParse(payload);

  if (!parsed.success) {
    failRedirect("/admin/prompts/new", parsed.error.issues[0]?.message ?? "Некорректные данные промпта");
  }

  const normalized = normalizePromptData(parsed.data);

  const { data: prompt, error } = await admin.supabase
    .from("prompts")
    .insert({
      ...normalized,
      created_by: admin.user.id,
    })
    .select("id, slug")
    .single();

  if (error || !prompt) {
    failRedirect(
      "/admin/prompts/new",
      error?.message.includes("duplicate") ? "Такой slug уже существует" : error?.message ?? "Не удалось создать промпт"
    );
  }

  await syncPromptTags(prompt.id, parsed.data.tagIds, admin.supabase);
  await logAdminEvent({
    supabase: admin.supabase,
    adminId: admin.user.id,
    action: "prompt.create",
    entityType: "prompt",
    entityId: prompt.id,
    entityRef: prompt.slug,
    metadata: {
      status: parsed.data.status,
      tagCount: parsed.data.tagIds.length,
      categoryId: parsed.data.categoryId || null,
    },
  });

  revalidatePromptPaths(prompt.slug);
  redirect(`/admin/prompts?toast=created&message=${encodeURIComponent("Промпт создан")}`);
}

export async function updatePromptAction(formData: FormData) {
  const admin = await requireAdmin();
  const promptId = formData.get("promptId")?.toString();

  if (!promptId) {
    failRedirect("/admin/prompts", "Не указан id промпта");
  }

  const payload = toPromptPayload(formData);
  const parsed = promptFormSchema.safeParse(payload);

  if (!parsed.success) {
    failRedirect(
      `/admin/prompts/${promptId}/edit`,
      parsed.error.issues[0]?.message ?? "Некорректные данные промпта"
    );
  }

  const existing = await admin.supabase
    .from("prompts")
    .select("status")
    .eq("id", promptId)
    .maybeSingle();

  const normalized = normalizePromptData(parsed.data);

  const publishTimestamp =
    parsed.data.status === "published" && existing.data?.status !== "published"
      ? new Date().toISOString()
      : parsed.data.status === "published"
        ? undefined
        : null;

  const { data: updated, error } = await admin.supabase
    .from("prompts")
    .update({
      ...normalized,
      published_at: publishTimestamp,
    })
    .eq("id", promptId)
    .select("id, slug")
    .single();

  if (error || !updated) {
    failRedirect(
      `/admin/prompts/${promptId}/edit`,
      error?.message.includes("duplicate") ? "Такой slug уже существует" : error?.message ?? "Не удалось обновить промпт"
    );
  }

  await syncPromptTags(promptId, parsed.data.tagIds, admin.supabase);
  await logAdminEvent({
    supabase: admin.supabase,
    adminId: admin.user.id,
    action: "prompt.update",
    entityType: "prompt",
    entityId: updated.id,
    entityRef: updated.slug,
    metadata: {
      status: parsed.data.status,
      tagCount: parsed.data.tagIds.length,
      categoryId: parsed.data.categoryId || null,
    },
  });

  revalidatePromptPaths(updated.slug);
  redirect(`/admin/prompts?toast=updated&message=${encodeURIComponent("Промпт обновлен")}`);
}

export async function deletePromptAction(formData: FormData) {
  const admin = await requireAdmin();
  const promptId = formData.get("promptId")?.toString();

  if (!promptId) {
    redirect(`/admin/prompts?toast=delete_error&message=${encodeURIComponent("Не указан id промпта")}`);
  }

  const { data: existing } = await admin.supabase
    .from("prompts")
    .select("slug, title, status")
    .eq("id", promptId)
    .maybeSingle();

  const { error } = await admin.supabase.from("prompts").delete().eq("id", promptId);

  if (error) {
    redirect(`/admin/prompts?toast=delete_error&message=${encodeURIComponent(error.message)}`);
  }
  await logAdminEvent({
    supabase: admin.supabase,
    adminId: admin.user.id,
    action: "prompt.delete",
    entityType: "prompt",
    entityId: promptId,
    entityRef: existing?.slug ?? null,
    metadata: {
      title: existing?.title ?? null,
      previousStatus: existing?.status ?? null,
    },
  });

  revalidatePromptPaths(existing?.slug);
  redirect(`/admin/prompts?toast=deleted&message=${encodeURIComponent("Промпт удален")}`);
}

export async function togglePromptStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const promptId = formData.get("promptId")?.toString();

  if (!promptId) {
    redirect(`/admin/prompts?toast=publish_error&message=${encodeURIComponent("Не указан id промпта")}`);
  }

  const { data: existing, error: readError } = await admin.supabase
    .from("prompts")
    .select("slug, status")
    .eq("id", promptId)
    .single();

  if (readError || !existing) {
    redirect(
      `/admin/prompts?toast=publish_error&message=${encodeURIComponent(readError?.message ?? "Промпт не найден")}`
    );
  }

  const nextStatus = existing.status === "published" ? "draft" : "published";
  const { error } = await admin.supabase
    .from("prompts")
    .update({
      status: nextStatus,
      published_at: nextStatus === "published" ? new Date().toISOString() : null,
    })
    .eq("id", promptId);

  if (error) {
    redirect(`/admin/prompts?toast=publish_error&message=${encodeURIComponent(error.message)}`);
  }
  await logAdminEvent({
    supabase: admin.supabase,
    adminId: admin.user.id,
    action: nextStatus === "published" ? "prompt.publish" : "prompt.unpublish",
    entityType: "prompt",
    entityId: promptId,
    entityRef: existing.slug,
    metadata: {
      previousStatus: existing.status,
      nextStatus,
    },
  });

  revalidatePromptPaths(existing.slug);
  redirect(
    `/admin/prompts?toast=status_changed&message=${encodeURIComponent(
      nextStatus === "published" ? "Промпт опубликован" : "Промпт переведен в черновик"
    )}`
  );
}

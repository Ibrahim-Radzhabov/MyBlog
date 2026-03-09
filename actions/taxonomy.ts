"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/require-admin";
import { logAdminEvent } from "@/lib/db/audit";
import { slugify } from "@/lib/utils";

const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  slug: z.string().trim().optional(),
  description: z.string().trim().max(300, "Description is too long").optional(),
});

const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2, "Category name is required"),
  slug: z.string().trim().min(2, "Category slug is required"),
  description: z.string().trim().max(300, "Description is too long").optional(),
});

const createTagSchema = z.object({
  name: z.string().trim().min(2, "Tag name is required"),
  slug: z.string().trim().optional(),
});

const updateTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2, "Tag name is required"),
  slug: z.string().trim().min(2, "Tag slug is required"),
});

function fail(path: string, message: string): never {
  redirect(`${path}?toast=form_error&message=${encodeURIComponent(message)}`);
}

function revalidateTaxonomyPages() {
  revalidatePath("/");
  revalidatePath("/prompts");
  revalidatePath("/admin");
  revalidatePath("/admin/prompts");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/tags");
}

export async function createCategoryAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const parsed = createCategorySchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
  });

  if (!parsed.success) {
    fail("/admin/categories", parsed.error.issues[0]?.message ?? "Invalid category data");
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);

  if (!slug) {
    fail("/admin/categories", "Category slug cannot be empty");
  }

  const { data: created, error } = await supabase
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
    })
    .select("id")
    .single();

  if (error) {
    fail(
      "/admin/categories",
      error.message.includes("duplicate") ? "Category slug already exists" : error.message
    );
  }
  await logAdminEvent({
    supabase,
    adminId: user.id,
    action: "category.create",
    entityType: "category",
    entityId: created?.id ?? null,
    entityRef: slug,
    metadata: {
      name: parsed.data.name,
    },
  });

  revalidateTaxonomyPages();
  redirect("/admin/categories?toast=created&message=Category%20created");
}

export async function updateCategoryAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const parsed = updateCategorySchema.safeParse({
    id: formData.get("categoryId")?.toString() ?? "",
    name: formData.get("name")?.toString() ?? "",
    slug: slugify(formData.get("slug")?.toString() ?? ""),
    description: formData.get("description")?.toString() ?? "",
  });

  if (!parsed.success) {
    fail("/admin/categories", parsed.error.issues[0]?.message ?? "Invalid category data");
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
    })
    .eq("id", parsed.data.id);

  if (error) {
    fail(
      "/admin/categories",
      error.message.includes("duplicate") ? "Category slug already exists" : error.message
    );
  }
  await logAdminEvent({
    supabase,
    adminId: user.id,
    action: "category.update",
    entityType: "category",
    entityId: parsed.data.id,
    entityRef: parsed.data.slug,
    metadata: {
      name: parsed.data.name,
    },
  });

  revalidateTaxonomyPages();
  redirect("/admin/categories?toast=updated&message=Category%20updated");
}

export async function deleteCategoryAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const id = formData.get("categoryId")?.toString();
  if (!id) {
    fail("/admin/categories", "Missing category id");
  }

  const { data: existing } = await supabase.from("categories").select("slug, name").eq("id", id).maybeSingle();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    fail("/admin/categories", error.message);
  }
  await logAdminEvent({
    supabase,
    adminId: user.id,
    action: "category.delete",
    entityType: "category",
    entityId: id,
    entityRef: existing?.slug ?? null,
    metadata: {
      name: existing?.name ?? null,
    },
  });

  revalidateTaxonomyPages();
  redirect("/admin/categories?toast=deleted&message=Category%20deleted");
}

export async function createTagAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const parsed = createTagSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
  });

  if (!parsed.success) {
    fail("/admin/tags", parsed.error.issues[0]?.message ?? "Invalid tag data");
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);

  if (!slug) {
    fail("/admin/tags", "Tag slug cannot be empty");
  }

  const { data: created, error } = await supabase
    .from("tags")
    .insert({
      name: parsed.data.name,
      slug,
    })
    .select("id")
    .single();

  if (error) {
    fail("/admin/tags", error.message.includes("duplicate") ? "Tag slug already exists" : error.message);
  }
  await logAdminEvent({
    supabase,
    adminId: user.id,
    action: "tag.create",
    entityType: "tag",
    entityId: created?.id ?? null,
    entityRef: slug,
    metadata: {
      name: parsed.data.name,
    },
  });

  revalidateTaxonomyPages();
  redirect("/admin/tags?toast=created&message=Tag%20created");
}

export async function updateTagAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const parsed = updateTagSchema.safeParse({
    id: formData.get("tagId")?.toString() ?? "",
    name: formData.get("name")?.toString() ?? "",
    slug: slugify(formData.get("slug")?.toString() ?? ""),
  });

  if (!parsed.success) {
    fail("/admin/tags", parsed.error.issues[0]?.message ?? "Invalid tag data");
  }

  const { error } = await supabase
    .from("tags")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
    })
    .eq("id", parsed.data.id);

  if (error) {
    fail("/admin/tags", error.message.includes("duplicate") ? "Tag slug already exists" : error.message);
  }
  await logAdminEvent({
    supabase,
    adminId: user.id,
    action: "tag.update",
    entityType: "tag",
    entityId: parsed.data.id,
    entityRef: parsed.data.slug,
    metadata: {
      name: parsed.data.name,
    },
  });

  revalidateTaxonomyPages();
  redirect("/admin/tags?toast=updated&message=Tag%20updated");
}

export async function deleteTagAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const id = formData.get("tagId")?.toString();

  if (!id) {
    fail("/admin/tags", "Missing tag id");
  }

  const { data: existing } = await supabase.from("tags").select("slug, name").eq("id", id).maybeSingle();
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) {
    fail("/admin/tags", error.message);
  }
  await logAdminEvent({
    supabase,
    adminId: user.id,
    action: "tag.delete",
    entityType: "tag",
    entityId: id,
    entityRef: existing?.slug ?? null,
    metadata: {
      name: existing?.name ?? null,
    },
  });

  revalidateTaxonomyPages();
  redirect("/admin/tags?toast=deleted&message=Tag%20deleted");
}

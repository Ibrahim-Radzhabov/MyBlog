import { notFound } from "next/navigation";

import { deletePromptAction, updatePromptAction } from "@/actions/prompts";
import { PromptForm } from "@/components/admin/prompt-form";
import { ConfirmActionModal } from "@/components/shared/confirm-action-modal";
import { getAllCategories } from "@/lib/db/categories";
import { getPromptByIdForAdmin } from "@/lib/db/prompts";
import { getAllTags } from "@/lib/db/tags";
import { safeJsonParse } from "@/lib/utils";
import type { PromptVariable } from "@/types/prompt";

type Params = Promise<{
  id: string;
}>;

export default async function EditPromptPage({ params }: { params: Params }) {
  const { id } = await params;
  const [prompt, categories, tags] = await Promise.all([
    getPromptByIdForAdmin(id),
    getAllCategories(),
    getAllTags(),
  ]);

  if (!prompt) {
    notFound();
  }

  const initialVariables = safeJsonParse<PromptVariable[]>(JSON.stringify(prompt.variables_json), []).map(
    (variable) => ({
      name: variable.name,
      label: variable.label,
      type: variable.type,
      required: Boolean(variable.required),
      placeholder: variable.placeholder ?? "",
      optionsText: variable.options?.join(", ") ?? "",
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold">Редактировать промпт</h2>
          <p className="text-sm text-[color:var(--muted-foreground)]">Обновите поля, статус публикации, теги и SEO-метаданные.</p>
        </div>

        <ConfirmActionModal
          action={deletePromptAction}
          fields={{ promptId: prompt.id }}
          title="Удалить промпт?"
          description={`Промпт «${prompt.title}» будет удален без возможности восстановления.`}
          triggerLabel="Удалить промпт"
          confirmLabel="Удалить промпт"
          triggerSize="default"
          testId={`delete-edit-prompt-${prompt.slug}`}
        />
      </div>

      <PromptForm
        action={updatePromptAction}
        mode="edit"
        categories={categories}
        tags={tags}
        initialValues={{
          promptId: prompt.id,
          title: prompt.title,
          slug: prompt.slug,
          shortDescription: prompt.short_description,
          fullPromptText: prompt.full_prompt_text,
          outputExample: prompt.output_example ?? "",
          categoryId: prompt.category_id ?? "",
          tagIds: prompt.tag_ids,
          status: prompt.status,
          coverImageUrl: prompt.cover_image_url ?? "",
          seoTitle: prompt.seo_title ?? "",
          seoDescription: prompt.seo_description ?? "",
          variables: initialVariables,
        }}
      />
    </div>
  );
}

import { createPromptAction } from "@/actions/prompts";
import { PromptForm } from "@/components/admin/prompt-form";
import { getAllCategories } from "@/lib/db/categories";
import { getAllTags } from "@/lib/db/tags";

export default async function NewPromptPage() {
  const [categories, tags] = await Promise.all([getAllCategories(), getAllTags()]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-semibold">Create prompt</h2>
        <p className="text-sm text-[color:var(--muted-foreground)]">Write content once, save as draft, then publish when ready.</p>
      </div>

      <PromptForm
        action={createPromptAction}
        mode="create"
        categories={categories}
        tags={tags}
        initialValues={{
          title: "",
          slug: "",
          shortDescription: "",
          fullPromptText: "",
          outputExample: "",
          categoryId: "",
          tagIds: [],
          status: "draft",
          coverImageUrl: "",
          seoTitle: "",
          seoDescription: "",
          variables: [],
        }}
      />
    </div>
  );
}

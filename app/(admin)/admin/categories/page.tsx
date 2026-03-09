import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/taxonomy";
import { ConfirmActionModal } from "@/components/shared/confirm-action-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCategories } from "@/lib/db/categories";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Manage categories</h2>
        <p className="text-sm text-[color:var(--muted-foreground)]">Create and maintain grouping for the prompt catalog.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New category</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createCategoryAction}
            className="grid gap-3 md:grid-cols-[1fr_1fr_1.3fr_auto]"
            data-testid="category-create-form"
          >
            <input
              name="name"
              placeholder="Category name"
              required
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            />
            <input
              name="slug"
              placeholder="category-slug (optional)"
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            />
            <input
              name="description"
              placeholder="Short description"
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Add your first category to organize prompts." />
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="space-y-3 p-4">
                <form action={updateCategoryAction} className="grid gap-2 md:grid-cols-[1fr_1fr_1.5fr_auto]">
                  <input type="hidden" name="categoryId" value={category.id} />
                  <input
                    name="name"
                    defaultValue={category.name}
                    required
                    className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
                  />
                  <input
                    name="slug"
                    defaultValue={category.slug}
                    required
                    className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
                  />
                  <input
                    name="description"
                    defaultValue={category.description ?? ""}
                    className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
                  />
                  <Button type="submit" variant="secondary">
                    Update
                  </Button>
                </form>

                <ConfirmActionModal
                  action={deleteCategoryAction}
                  fields={{ categoryId: category.id }}
                  title="Delete category?"
                  description={`This will remove “${category.name}” and detach it from prompts.`}
                  triggerLabel="Delete"
                  confirmLabel="Delete category"
                  testId={`delete-category-${category.slug}`}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

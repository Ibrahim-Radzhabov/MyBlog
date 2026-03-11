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
        <h2 className="text-3xl font-semibold">Управление категориями</h2>
        <p className="text-sm text-[color:var(--muted-foreground)]">Создавайте и поддерживайте структуру разделов каталога.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Новая категория</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createCategoryAction}
            className="grid gap-3 md:grid-cols-[1fr_1fr_1.3fr_auto]"
            data-testid="category-create-form"
          >
            <input
              name="name"
              placeholder="Название категории"
              required
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            />
            <input
              name="slug"
              placeholder="slug-kategorii (необязательно)"
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            />
            <input
              name="description"
              placeholder="Краткое описание"
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            />
            <Button type="submit">Создать</Button>
          </form>
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <EmptyState title="Категорий пока нет" description="Добавьте первую категорию для удобной структуры каталога." />
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
                    Обновить
                  </Button>
                </form>

                <ConfirmActionModal
                  action={deleteCategoryAction}
                  fields={{ categoryId: category.id }}
                  title="Удалить категорию?"
                  description={`Категория «${category.name}» будет удалена и отвязана от промптов.`}
                  triggerLabel="Удалить"
                  confirmLabel="Удалить категорию"
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

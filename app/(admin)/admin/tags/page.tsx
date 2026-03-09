import { createTagAction, deleteTagAction, updateTagAction } from "@/actions/taxonomy";
import { ConfirmActionModal } from "@/components/shared/confirm-action-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTags } from "@/lib/db/tags";

export default async function AdminTagsPage() {
  const tags = await getAllTags();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Manage tags</h2>
        <p className="text-sm text-[color:var(--muted-foreground)]">Maintain reusable labels for prompt discovery and filters.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New tag</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTagAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]" data-testid="tag-create-form">
            <input
              name="name"
              placeholder="Tag name"
              required
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            />
            <input
              name="slug"
              placeholder="tag-slug (optional)"
              className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
            />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      {tags.length === 0 ? (
        <EmptyState title="No tags yet" description="Create tags to improve catalog filtering and discoverability." />
      ) : (
        <div className="space-y-3">
          {tags.map((tag) => (
            <Card key={tag.id}>
              <CardContent className="space-y-3 p-4">
                <form action={updateTagAction} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <input type="hidden" name="tagId" value={tag.id} />
                  <input
                    name="name"
                    defaultValue={tag.name}
                    required
                    className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
                  />
                  <input
                    name="slug"
                    defaultValue={tag.slug}
                    required
                    className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
                  />
                  <Button type="submit" variant="secondary">
                    Update
                  </Button>
                </form>

                <ConfirmActionModal
                  action={deleteTagAction}
                  fields={{ tagId: tag.id }}
                  title="Delete tag?"
                  description={`This will remove “#${tag.name}” from all prompts.`}
                  triggerLabel="Delete"
                  confirmLabel="Delete tag"
                  testId={`delete-tag-${tag.slug}`}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

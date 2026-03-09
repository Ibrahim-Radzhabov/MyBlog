"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { CoverUploadField } from "@/components/admin/cover-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type TagOption = {
  id: string;
  name: string;
  slug: string;
};

type VariableInput = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "boolean";
  required: boolean;
  placeholder: string;
  optionsText: string;
};

type PromptFormInitialValues = {
  promptId?: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullPromptText: string;
  outputExample: string;
  categoryId: string;
  tagIds: string[];
  status: "draft" | "published";
  coverImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  variables: VariableInput[];
};

type PromptFormProps = {
  action: (formData: FormData) => void;
  categories: CategoryOption[];
  tags: TagOption[];
  initialValues: PromptFormInitialValues;
  mode: "create" | "edit";
};

function SubmitButtons({ mode, onStatusChange }: { mode: "create" | "edit"; onStatusChange: (status: "draft" | "published") => void }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="submit"
        name="intent"
        value="draft"
        variant="secondary"
        disabled={pending}
        onClick={() => onStatusChange("draft")}
      >
        {pending ? "Saving..." : mode === "create" ? "Save as draft" : "Update draft"}
      </Button>

      <Button
        type="submit"
        name="intent"
        value="publish"
        disabled={pending}
        onClick={() => onStatusChange("published")}
      >
        {pending ? "Publishing..." : mode === "create" ? "Publish prompt" : "Update & publish"}
      </Button>
    </div>
  );
}

const emptyVariable: VariableInput = {
  name: "",
  label: "",
  type: "text",
  required: false,
  placeholder: "",
  optionsText: "",
};

export function PromptForm({ action, categories, tags, initialValues, mode }: PromptFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [slug, setSlug] = useState(initialValues.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues.slug));
  const [status, setStatus] = useState<"draft" | "published">(initialValues.status);
  const [coverImageUrl, setCoverImageUrl] = useState(initialValues.coverImageUrl);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(initialValues.tagIds));
  const [variables, setVariables] = useState<VariableInput[]>(
    initialValues.variables.length > 0 ? initialValues.variables : []
  );

  const serializedVariables = useMemo(
    () =>
      JSON.stringify(
        variables.map((variable) => ({
          name: variable.name,
          label: variable.label,
          type: variable.type,
          required: variable.required,
          placeholder: variable.placeholder,
          options:
            variable.type === "select"
              ? variable.optionsText
                  .split(",")
                  .map((option) => option.trim())
                  .filter(Boolean)
              : [],
        }))
      ),
    [variables]
  );

  const onTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);

    if (!slugTouched) {
      setSlug(slugify(nextTitle));
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((previous) => {
      const next = new Set(previous);

      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }

      return next;
    });
  };

  const updateVariable = <K extends keyof VariableInput>(index: number, key: K, value: VariableInput[K]) => {
    setVariables((previous) =>
      previous.map((variable, variableIndex) =>
        variableIndex === index
          ? {
              ...variable,
              [key]: value,
            }
          : variable
      )
    );
  };

  const removeVariable = (index: number) => {
    setVariables((previous) => previous.filter((_, variableIndex) => variableIndex !== index));
  };

  return (
    <form action={action} className="space-y-8">
      {initialValues.promptId ? <input type="hidden" name="promptId" value={initialValues.promptId} /> : null}
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="tagIds" value={Array.from(selectedTags).join(",")} />
      <input type="hidden" name="variables" value={serializedVariables} />
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />

      <section className="grid gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="High-converting product description generator"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            placeholder="product-description-generator"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initialValues.categoryId}
            className="h-10 w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="shortDescription">Short description</Label>
          <Textarea
            id="shortDescription"
            name="shortDescription"
            defaultValue={initialValues.shortDescription}
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="fullPromptText">Prompt content (markdown-friendly)</Label>
          <Textarea
            id="fullPromptText"
            name="fullPromptText"
            defaultValue={initialValues.fullPromptText}
            rows={12}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="outputExample">Output example</Label>
          <Textarea id="outputExample" name="outputExample" defaultValue={initialValues.outputExample} rows={5} />
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = selectedTags.has(tag.id);

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    active
                      ? "border-[color:var(--foreground)] bg-[color:var(--foreground)] text-[color:var(--background)]"
                      : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  }`}
                >
                  #{tag.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={initialValues.seoTitle} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoDescription">SEO description</Label>
          <Input id="seoDescription" name="seoDescription" defaultValue={initialValues.seoDescription} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="coverImageUrlManual">Cover image URL (manual)</Label>
          <Input
            id="coverImageUrlManual"
            value={coverImageUrl}
            onChange={(event) => setCoverImageUrl(event.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2">
          <CoverUploadField value={coverImageUrl} onChange={setCoverImageUrl} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Variables</h3>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Build variables used inside the prompt template.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => setVariables((prev) => [...prev, emptyVariable])}>
            Add variable
          </Button>
        </div>

        {variables.length === 0 ? (
          <p className="rounded-md border border-dashed border-[color:var(--border)] p-3 text-sm text-[color:var(--muted-foreground)]">
            No variables yet. Add one if this prompt needs user-provided inputs.
          </p>
        ) : (
          <div className="space-y-3">
            {variables.map((variable, index) => (
              <div
                key={`${variable.name}-${index}`}
                className="grid gap-3 rounded-md border border-[color:var(--border)] p-3 md:grid-cols-12"
              >
                <Input
                  className="md:col-span-2"
                  placeholder="name"
                  value={variable.name}
                  onChange={(event) => updateVariable(index, "name", event.target.value)}
                />
                <Input
                  className="md:col-span-3"
                  placeholder="label"
                  value={variable.label}
                  onChange={(event) => updateVariable(index, "label", event.target.value)}
                />
                <select
                  className="h-10 rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-3 text-sm md:col-span-2"
                  value={variable.type}
                  onChange={(event) =>
                    updateVariable(index, "type", event.target.value as VariableInput["type"])
                  }
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="select">Select</option>
                </select>
                <Input
                  className="md:col-span-3"
                  placeholder="placeholder"
                  value={variable.placeholder}
                  onChange={(event) => updateVariable(index, "placeholder", event.target.value)}
                />

                <label className="inline-flex items-center gap-2 text-sm md:col-span-1 md:justify-center">
                  <input
                    type="checkbox"
                    checked={variable.required}
                    onChange={(event) => updateVariable(index, "required", event.target.checked)}
                  />
                  req
                </label>

                <Button
                  type="button"
                  variant="ghost"
                  className="md:col-span-1"
                  onClick={() => removeVariable(index)}
                >
                  Remove
                </Button>

                {variable.type === "select" ? (
                  <Input
                    className="md:col-span-12"
                    placeholder="options separated by commas"
                    value={variable.optionsText}
                    onChange={(event) => updateVariable(index, "optionsText", event.target.value)}
                  />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <SubmitButtons mode={mode} onStatusChange={setStatus} />
    </form>
  );
}

export type { PromptFormInitialValues, CategoryOption, TagOption };

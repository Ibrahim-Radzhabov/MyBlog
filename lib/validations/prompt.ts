import { z } from "zod";

const variableTypeSchema = z.enum(["text", "number", "select", "boolean"]);

export const promptVariableSchema = z
  .object({
    name: z.string().trim().min(1, "Variable name is required"),
    label: z.string().trim().min(1, "Variable label is required"),
    type: variableTypeSchema,
    required: z.boolean().default(false),
    placeholder: z.string().trim().optional(),
    options: z.array(z.string().trim().min(1)).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "select" && (!value.options || value.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select variables require at least one option",
        path: ["options"],
      });
    }
  });

export const promptFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can contain only lowercase letters, numbers, and hyphens"),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Short description must be at least 10 characters")
    .max(260, "Short description is too long"),
  fullPromptText: z.string().trim().min(20, "Prompt text must be at least 20 characters"),
  outputExample: z.string().trim().optional(),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  tagIds: z.array(z.string().uuid()).default([]),
  variables: z.array(promptVariableSchema).default([]),
  status: z.enum(["draft", "published"]),
  coverImageUrl: z.string().trim().url("Cover image URL must be valid").optional().or(z.literal("")),
  seoTitle: z.string().trim().max(70, "SEO title should be 70 chars or less").optional(),
  seoDescription: z
    .string()
    .trim()
    .max(160, "SEO description should be 160 chars or less")
    .optional(),
});

export type PromptFormValues = z.infer<typeof promptFormSchema>;

import { z } from "zod";

const variableTypeSchema = z.enum(["text", "number", "select", "boolean"]);

export const promptVariableSchema = z
  .object({
    name: z.string().trim().min(1, "Имя переменной обязательно"),
    label: z.string().trim().min(1, "Подпись переменной обязательна"),
    type: variableTypeSchema,
    required: z.boolean().default(false),
    placeholder: z.string().trim().optional(),
    options: z.array(z.string().trim().min(1)).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "select" && (!value.options || value.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Для типа «список» укажите хотя бы один вариант",
        path: ["options"],
      });
    }
  });

export const promptFormSchema = z.object({
  title: z.string().trim().min(3, "Название должно содержать минимум 3 символа"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug должен содержать минимум 3 символа")
    .regex(/^[a-z0-9-]+$/, "Slug может содержать только строчные латинские буквы, цифры и дефис"),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Краткое описание должно содержать минимум 10 символов")
    .max(260, "Краткое описание слишком длинное"),
  fullPromptText: z.string().trim().min(20, "Текст промпта должен содержать минимум 20 символов"),
  outputExample: z.string().trim().optional(),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  tagIds: z.array(z.string().uuid()).default([]),
  variables: z.array(promptVariableSchema).default([]),
  status: z.enum(["draft", "published"]),
  coverImageUrl: z.string().trim().url("URL обложки должен быть корректным").optional().or(z.literal("")),
  seoTitle: z.string().trim().max(70, "SEO-заголовок должен быть не длиннее 70 символов").optional(),
  seoDescription: z
    .string()
    .trim()
    .max(160, "SEO-описание должно быть не длиннее 160 символов")
    .optional(),
});

export type PromptFormValues = z.infer<typeof promptFormSchema>;

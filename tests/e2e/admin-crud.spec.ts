import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

const canRunAdminCrud = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.ADMIN_EMAIL &&
    adminEmail &&
    adminPassword
);

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Пароль").fill(adminPassword!);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
}

test.describe("admin CRUD with confirmations", () => {
  test.skip(!canRunAdminCrud, "Set Supabase env + E2E admin creds to run CRUD checks.");

  test("admin can create, publish, and delete prompt with taxonomy", async ({ page }) => {
    const suffix = `${Date.now()}`;
    const categoryName = `E2E Категория ${suffix}`;
    const categorySlug = `e2e-category-${suffix}`;
    const tagName = `E2E Тег ${suffix}`;
    const tagSlug = `e2e-tag-${suffix}`;

    const promptTitle = `E2E Prompt ${suffix}`;
    const promptSlug = `e2e-prompt-${suffix}`;

    await loginAsAdmin(page);

    await page.goto("/admin/categories");
    await page.getByTestId("category-create-form").getByPlaceholder("Название категории").fill(categoryName);
    await page.getByTestId("category-create-form").getByPlaceholder("slug-kategorii (необязательно)").fill(categorySlug);
    await page.getByTestId("category-create-form").getByRole("button", { name: "Создать" }).click();
    await expect(page.locator(`input[name="slug"][value="${categorySlug}"]`)).toBeVisible();

    await page.goto("/admin/tags");
    await page.getByTestId("tag-create-form").getByPlaceholder("Название тега").fill(tagName);
    await page.getByTestId("tag-create-form").getByPlaceholder("slug-tega (необязательно)").fill(tagSlug);
    await page.getByTestId("tag-create-form").getByRole("button", { name: "Создать" }).click();
    await expect(page.locator(`input[name="slug"][value="${tagSlug}"]`)).toBeVisible();

    await page.goto("/admin/prompts/new");
    await page.locator("#title").fill(promptTitle);
    await page.locator("#slug").fill(promptSlug);
    await page.locator("#shortDescription").fill(
      "This prompt is created by Playwright to validate create and publish flow end-to-end."
    );
    await page
      .locator("#fullPromptText")
      .fill("You are a helpful assistant. Return a concise response for {{topic}} in bullet points.");
    await page.locator("#outputExample").fill("- Point one\n- Point two");
    await page.locator("#categoryId").selectOption({ label: categoryName });
    await page.getByRole("button", { name: `#${tagName}` }).click();

    await page.getByRole("button", { name: "Сохранить как черновик" }).click();
    await expect(page).toHaveURL(/\/admin\/prompts/);

    const promptRow = page.getByRole("row", { name: new RegExp(promptTitle) });
    await expect(promptRow).toBeVisible();
    await expect(promptRow.getByText("Черновик")).toBeVisible();

    await promptRow.getByRole("link", { name: "Редактировать" }).click();
    await expect(page).toHaveURL(new RegExp(`/admin/prompts/.+/edit`));

    await page
      .locator("#shortDescription")
      .fill("Updated from e2e flow to verify edit action, publish state, and audit trail logging.");
    await page.getByRole("button", { name: "Обновить и опубликовать" }).click();
    await expect(page).toHaveURL(/\/admin\/prompts/);

    const updatedPromptRow = page.getByRole("row", { name: new RegExp(promptTitle) });
    await expect(updatedPromptRow).toBeVisible();
    await expect(updatedPromptRow.getByText("Опубликовано")).toBeVisible();
    await expect(updatedPromptRow.getByText("Виден")).toBeVisible();

    await updatedPromptRow.getByRole("button", { name: "Скрыть" }).click();
    await expect(updatedPromptRow.getByText("Скрыт")).toBeVisible();
    await expect(updatedPromptRow.getByRole("button", { name: "Показать" })).toBeVisible();

    await updatedPromptRow.getByRole("button", { name: "Показать" }).click();
    await expect(updatedPromptRow.getByText("Виден")).toBeVisible();
    await expect(updatedPromptRow.getByRole("button", { name: "Скрыть" })).toBeVisible();

    await page.getByTestId(`delete-prompt-${promptSlug}-trigger`).click();
    await expect(page.getByTestId(`delete-prompt-${promptSlug}-modal`)).toBeVisible();
    await page.getByTestId(`delete-prompt-${promptSlug}-confirm`).click();

    await expect(page.getByRole("row", { name: new RegExp(promptTitle) })).toHaveCount(0);

    await page.goto("/admin/categories");
    await page.getByTestId(`delete-category-${categorySlug}-trigger`).click();
    await page.getByTestId(`delete-category-${categorySlug}-confirm`).click();
    await expect(page.locator(`input[name="slug"][value="${categorySlug}"]`)).toHaveCount(0);

    await page.goto("/admin/tags");
    await page.getByTestId(`delete-tag-${tagSlug}-trigger`).click();
    await page.getByTestId(`delete-tag-${tagSlug}-confirm`).click();
    await expect(page.locator(`input[name="slug"][value="${tagSlug}"]`)).toHaveCount(0);

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Журнал действий" })).toBeVisible();
    await expect(page.getByText("prompt.create").first()).toBeVisible();
    await expect(page.getByText("prompt.delete").first()).toBeVisible();
  });
});

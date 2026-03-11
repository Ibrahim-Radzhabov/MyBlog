import { expect, test } from "@playwright/test";

const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.ADMIN_EMAIL
);

test.describe("public and auth flows", () => {
  test.skip(!hasSupabaseEnv, "Supabase env vars are required for SSR auth pages.");

  test("home links to catalog", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Публикуйте и управляйте");

    await page.getByRole("link", { name: "Открыть каталог" }).first().click();
    await expect(page).toHaveURL(/\/prompts/);
    await expect(page.getByRole("heading", { level: 1, name: "Каталог промптов" })).toBeVisible();
  });

  test("login page renders restriction message", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Вход администратора" })).toBeVisible();
    await expect(page.getByText("Публичная регистрация должна быть отключена")).toBeVisible();
  });

  test("guest cannot access admin area", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?error=auth_required/);
    await expect(page.getByRole("heading", { name: "Вход администратора" })).toBeVisible();
  });
});

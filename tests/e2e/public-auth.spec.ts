import { expect, test } from "@playwright/test";

const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.ADMIN_EMAIL
);

test.describe("public and auth flows", () => {
  test.skip(!hasSupabaseEnv, "Supabase env vars are required for SSR auth pages.");

  test("home links to catalog", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Publish, manage, and ship");

    await page.getByRole("link", { name: "Browse all prompts" }).first().click();
    await expect(page).toHaveURL(/\/prompts/);
    await expect(page.getByRole("heading", { level: 1, name: "Prompt catalog" })).toBeVisible();
  });

  test("login page renders restriction message", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Admin sign in" })).toBeVisible();
    await expect(page.getByText("Public sign-up must remain disabled")).toBeVisible();
  });

  test("guest cannot access admin area", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?error=auth_required/);
    await expect(page.getByRole("heading", { name: "Admin sign in" })).toBeVisible();
  });
});

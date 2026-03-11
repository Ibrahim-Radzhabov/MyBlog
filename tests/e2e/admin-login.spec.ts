import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

const canRunAdminLogin = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.ADMIN_EMAIL &&
    adminEmail &&
    adminPassword
);

test.describe("admin login flow", () => {
  test.skip(!canRunAdminLogin, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run auth submission checks.");

  test("admin can sign in and reach dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(adminEmail!);
    await page.getByLabel("Пароль").fill(adminPassword!);
    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Дашборд" })).toBeVisible();
  });
});

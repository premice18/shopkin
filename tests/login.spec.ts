import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("renders login form", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Connexion");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
  });

  test("shows validation error on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("shows error on invalid email format", async ({ page }) => {
    await page.locator('input[type="email"]').fill("not-an-email");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("has link to register page", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: /créez-en un/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute("href", "/auth/register");
  });

  test("has link to forgot password", async ({ page }) => {
    const forgotLink = page.getByRole("link", { name: /mot de passe oublié/i });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute("href", "/auth/forgot-password");
  });

  test("google sign-in button is present", async ({ page }) => {
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
  });

  test("redirects to auth/phone -> login", async ({ page }) => {
    await page.goto("/auth/phone");
    await page.waitForURL("/auth/login");
    expect(page.url()).toContain("/auth/login");
  });
});

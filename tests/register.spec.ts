import { test, expect } from "@playwright/test";

test.describe("Register page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/register");
  });

  test("renders registration form", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Créer un compte");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
    await expect(page.locator("#prenom")).toBeVisible();
    await expect(page.locator("#nom")).toBeVisible();
    await expect(page.locator("#commune")).toBeVisible();
  });

  test("shows validation error on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("validates email format", async ({ page }) => {
    await page.locator('input[type="email"]').fill("invalid");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.locator('[role="alert"]')).toContainText(/email/i);
  });

  test("validates password length", async ({ page }) => {
    await page.locator('input[type="email"]').fill("test@test.com");
    await page.locator("#username").fill("testuser");
    await page.locator("#password").fill("Aa1");
    await page.locator("#confirmPassword").fill("Aa1");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.locator('[role="alert"]')).toContainText(/8 caractères/i);
  });

  test("validates password match", async ({ page }) => {
    await page.locator('input[type="email"]').fill("test@test.com");
    await page.locator("#username").fill("testuser");
    await page.locator("#password").fill("StrongPass1");
    await page.locator("#confirmPassword").fill("DifferentPass1");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.locator('[role="alert"]')).toContainText(/ne correspondent pas/i);
  });

  test("password strength indicator updates", async ({ page }) => {
    const pw = page.locator("#password");
    await pw.fill("weak");
    await expect(page.locator("text=Faible")).toBeVisible();
    await pw.fill("MediumPass1");
    await expect(page.locator("text=Moyen")).toBeVisible();
  });

  test("has link to login page", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /connectez-vous/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/auth/login");
  });
});

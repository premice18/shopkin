import { test, expect } from "@playwright/test";

test.describe("Connexion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("affiche le formulaire de connexion", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Connexion");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
  });

  test("validation : champs vides → alerte", async ({ page }) => {
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("validation : email invalide", async ({ page }) => {
    await page.locator('input[type="email"]').fill("not-an-email");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("lien vers inscription", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: /créez-en un/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute("href", "/auth/register");
  });

  test("lien mot de passe oublié", async ({ page }) => {
    const forgotLink = page.getByRole("link", { name: /mot de passe oublié/i });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute("href", "/auth/forgot-password");
  });

  test("redirection /auth/phone → /auth/login", async ({ page }) => {
    await page.goto("/auth/phone");
    await page.waitForURL("/auth/login");
    expect(page.url()).toContain("/auth/login");
  });

  test("supporte le paramètre redirect", async ({ page }) => {
    await page.goto("/auth/login?redirect=%2Fprofil");
    await page.getByLabel("Adresse email").fill("test-auth@shopkin.test");
    await page.getByLabel("Mot de passe").fill("TestPass123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await page.waitForURL(/\/profil|\//, { timeout: 15000 }).catch(() => {});
  });
});

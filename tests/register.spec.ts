import { test, expect } from "@playwright/test";

test.describe("Inscription", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/register");
  });

  test("affiche le formulaire d'inscription", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Créer un compte");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
    await expect(page.locator("#prenom")).toBeVisible();
    await expect(page.locator("#nom")).toBeVisible();
    await expect(page.locator("#commune")).toBeVisible();
  });

  test("validation : champs vides → alerte", async ({ page }) => {
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("validation : format email invalide", async ({ page }) => {
    await page.locator('input[type="email"]').fill("invalid");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.locator('[role="alert"]')).toContainText(/email/i);
  });

  test("validation : mot de passe trop court", async ({ page }) => {
    await page.locator('input[type="email"]').fill("test@test.com");
    await page.locator("#username").fill("testuser");
    await page.locator("#password").fill("Aa1");
    await page.locator("#confirmPassword").fill("Aa1");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.locator('[role="alert"]')).toContainText(/8 caractères/i);
  });

  test("validation : mots de passe différents", async ({ page }) => {
    await page.locator('input[type="email"]').fill("test@test.com");
    await page.locator("#username").fill("testuser");
    await page.locator("#password").fill("StrongPass1");
    await page.locator("#confirmPassword").fill("DifferentPass1");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.locator('[role="alert"]')).toContainText(/ne correspondent pas/i);
  });

  test("indicateur de force du mot de passe", async ({ page }) => {
    const pw = page.locator("#password");
    await pw.fill("weak");
    await expect(page.locator("text=Faible")).toBeVisible();
    await pw.fill("MediumPass1");
    await expect(page.locator("text=Moyen")).toBeVisible();
  });

  test("affiche le lien vers la connexion", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /connectez-vous/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/auth/login");
  });
});

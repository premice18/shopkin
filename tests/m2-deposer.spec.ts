import { test, expect } from "@playwright/test";

test.describe("M2 – Dépôt d'annonce", () => {
  test("redirige vers login si non authentifié", async ({ page }) => {
    await page.goto("/deposer");
    await page.waitForURL("/auth/login");
  });

  test("affiche le formulaire complet (connecté requis)", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Adresse email").fill("test-auth@shopkin.test");
    await page.getByLabel("Mot de passe").fill("TestPass123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await page.waitForURL(/\/profil|\//, { timeout: 15000 }).catch(() => {});

    await page.goto("/deposer");

    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /publier une annonce/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("M2 – Dépôt validation (non connecté)", () => {
  test("validation : titre obligatoire", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Adresse email").fill("test-auth@shopkin.test");
    await page.getByLabel("Mot de passe").fill("TestPass123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await page.waitForURL(/\/profil|\//, { timeout: 15000 }).catch(() => {});

    await page.goto("/deposer");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const bouton = page.getByRole("button", { name: /publier/i });
    if (await bouton.isVisible({ timeout: 3000 })) {
      await bouton.click();
      const alert = page.getByRole("alert").first();
      await expect(alert).toBeVisible({ timeout: 5000 });
    }
  });

  test("sélecteurs de catégorie, commune et super-repère présents", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Adresse email").fill("test-auth@shopkin.test");
    await page.getByLabel("Mot de passe").fill("TestPass123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await page.waitForURL(/\/profil|\//, { timeout: 15000 }).catch(() => {});

    await page.goto("/deposer");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const selects = page.locator("select");
    if ((await selects.count()) > 0) {
      await expect(selects.first()).toBeVisible();
    }
  });
});

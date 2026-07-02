import { test, expect } from "@playwright/test";

test.describe("M1 – Profil", () => {
  test("redirige vers login si non authentifié", async ({ page }) => {
    await page.goto("/profil");
    await page.waitForURL("/auth/login");
    expect(page.url()).toContain("/auth/login");
  });

  test("redirige vers login si non authentifié – wallet", async ({ page }) => {
    await page.goto("/profil/wallet");
    await page.waitForURL("/auth/login");
  });

  test("redirige vers login si non authentifié – edit", async ({ page }) => {
    await page.goto("/profil/edit");
    await page.waitForURL("/auth/login");
  });
});

test.describe("M1 – Profil (connecté)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("page profil : titre tableau de bord visible", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Adresse email").fill("test-auth@shopkin.test");
    await page.getByLabel("Mot de passe").fill("TestPass123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await page.waitForURL(/\/profil|\//, { timeout: 15000 }).catch(() => {});

    await page.goto("/profil");
    await expect(page.getByText(/tableau de bord|profil/i)).toBeVisible({ timeout: 10000 });
  });

  test("affiche le bouton de déconnexion", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Adresse email").fill("test-auth@shopkin.test");
    await page.getByLabel("Mot de passe").fill("TestPass123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await page.waitForURL(/\/profil|\//, { timeout: 15000 }).catch(() => {});

    await page.goto("/profil");
    await expect(page.getByRole("button", { name: /déconnecter|se déconnecter/i })).toBeVisible({ timeout: 10000 });
  });
});

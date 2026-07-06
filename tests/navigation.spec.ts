import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("footer visible sur la page d'accueil", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("bottom nav visible sur mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const nav = page.locator('[role="navigation"], nav');
    await expect(nav).toBeVisible();
  });

  test("redirection /deposer → /auth/login si non connecté", async ({ page }) => {
    await page.goto("/deposer");
    await page.waitForURL("/auth/login");
    expect(page.url()).toContain("/auth/login");
  });

  test("redirection /profil → /auth/login si non connecté", async ({ page }) => {
    await page.goto("/profil");
    await page.waitForURL("/auth/login");
    expect(page.url()).toContain("/auth/login");
  });

  test("redirection /admin → /admin/login si non connecté", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("/admin/login");
    expect(page.url()).toContain("/admin/login");
  });

  test("redirection /admin/* préserve le paramètre redirect", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForURL(/\/admin\/login\?redirect=/);
    expect(page.url()).toContain("redirect=");
  });

  test("page /admin/login affiche le formulaire", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /administration/i })).toBeVisible();
    await expect(page.getByLabel(/email administrateur/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
  });

  test("page /admin/login : validation email vide", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.getByRole("alert")).toContainText(/email/i);
  });

  test("page /admin/login : validation mot de passe vide", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email administrateur/i).fill("admin@test.com");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.getByRole("alert")).toContainText(/mot de passe/i);
  });

  test("page /admin/login : lien vers connexion standard", async ({ page }) => {
    await page.goto("/admin/login");
    const link = page.getByRole("link", { name: /connexion utilisateur standard/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/auth/login");
  });

  test("page /admin/login : mauvais identifiants → message d'erreur", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email administrateur/i).fill("wrong@admin.com");
    await page.getByLabel(/mot de passe/i).fill("BadPass123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible({ timeout: 15000 });
    await expect(alert).toContainText(/incorrect/i);
  });
});

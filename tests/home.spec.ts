import { test, expect } from "@playwright/test";

test.describe("Page d'accueil", () => {
  test("affiche le catalogue", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(/ShopKin/);
  });

  test("affiche le champ de recherche", async ({ page }) => {
    await page.goto("/");
    const search = page.locator('input[type="search"], input[placeholder*="Recherche" i], input[placeholder*="search" i]');
    await expect(search).toBeVisible();
  });
});

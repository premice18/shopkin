import { test, expect } from "@playwright/test";

test.describe("Page d'accueil", () => {
  test("affiche le catalogue", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /annonces récentes/i })).toBeVisible();
    await expect(page).toHaveTitle(/ShopKin/);
  });

  test("affiche la barre de filtres", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /toutes/i })).toBeVisible();
    await expect(page.locator("select").filter({ has: page.locator("option", { hasText: /commune/i }) })).toBeVisible();
  });
});

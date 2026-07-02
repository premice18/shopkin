import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("renders the catalogue", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(/ShopKin/);
  });

  test("shows search input", async ({ page }) => {
    await page.goto("/");
    const search = page.locator('input[type="search"], input[placeholder*="Recherche" i], input[placeholder*="search" i]');
    await expect(search).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("footer is visible on home page", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("bottom nav is visible on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const nav = page.locator('[role="navigation"], nav');
    await expect(nav).toBeVisible();
  });

  test("product page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/deposer");
    await page.waitForURL("/auth/login");
    expect(page.url()).toContain("/auth/login");
  });

  test("profile page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/profil");
    await page.waitForURL("/auth/login");
    expect(page.url()).toContain("/auth/login");
  });
});

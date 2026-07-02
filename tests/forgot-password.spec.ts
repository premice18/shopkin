import { test, expect } from "@playwright/test";

test.describe("Forgot password page", () => {
  test("renders the form", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

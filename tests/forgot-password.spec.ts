import { test, expect } from "@playwright/test";

test.describe("Mot de passe oublié", () => {
  test("affiche le formulaire", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

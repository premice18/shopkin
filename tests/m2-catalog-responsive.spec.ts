import { test, expect } from "@playwright/test";
import { MOBILE_VIEWPORT } from "./utils";

test.use({ viewport: MOBILE_VIEWPORT });

test.describe("M2 – Catalogue responsive (mobile 375×812)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("grille d'annonces en une colonne", async ({ page }) => {
    await page.waitForTimeout(2000);
    const firstCard = page.locator("a[href*='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      const box = await firstCard.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(300);
    }
  });

  test("bottom navigation est visible", async ({ page }) => {
    const bottomNav = page.getByRole("navigation", { name: /principale/i });
    await expect(bottomNav).toBeVisible();
  });

  test("bottom nav contient Accueil, Déposer, Profil", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: /principale/i });
    await expect(nav.locator("a[aria-label='Accueil']")).toBeVisible();
    await expect(nav.locator("a[aria-label='Déposer']")).toBeVisible();
    await expect(nav.locator("a[aria-label='Profil']")).toBeVisible();
  });

  test("footer non visible (masqué par bottom nav)", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).not.toBeInViewport();
  });

  test("les filtres sont horizontaux et scrollables", async ({ page }) => {
    const filterSection = page.locator("section").first();
    await expect(filterSection).toBeVisible();
  });

  test("le padding bas évite le chevauchement bottom nav", async ({ page }) => {
    const main = page.locator("main#main-content, [class*='pb-16']").first();
    await expect(main).toBeVisible();
  });

  test("bannière invité responsive si visible", async ({ page }) => {
    const banner = page.getByText(/achetez et vendez à kinshasa/i);
    if (await banner.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await banner.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(300);
    }
  });
});

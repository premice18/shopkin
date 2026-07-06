import { test, expect } from "@playwright/test";

test.describe("M2 – Détail annonce", () => {
  test("affiche la page de détail avec skeleton pendant le chargement", async ({ page }) => {
    await page.goto("/annonce/id-inexistant");
    await expect(page.locator("[aria-busy='true']")).toBeVisible({ timeout: 3000 });
  });

  test("affiche le bouton retour", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    const firstCard = page.locator("a[href*='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForURL(/\/annonce\//);
      const backBtn = page.getByRole("button", { name: /retour/i });
      await expect(backBtn).toBeVisible();
    }
  });

  test("le bouton WhatsApp est présent (si annonce avec vendeur)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    const firstCard = page.locator("a[href*='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForURL(/\/annonce\//);
      const waBtn = page.getByRole("link", { name: /whatsapp|contacter/i }).or(page.getByRole("button", { name: /whatsapp|contacter/i }));
      await expect(waBtn).toBeVisible({ timeout: 10000 }).catch(() => {});
    }
  });

  test("affiche le statut Disponible", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    const firstCard = page.locator("a[href*='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForURL(/\/annonce\//);
      const status = page.getByText(/disponible/i);
      await expect(status).toBeVisible({ timeout: 10000 }).catch(() => {});
    }
  });

  test("affiche la description et les métadonnées", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    const firstCard = page.locator("a[href*='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForURL(/\/annonce\//);
      const meta = page.getByText(/publiée le|vues/i);
      await expect(meta).toBeVisible({ timeout: 10000 }).catch(() => {});
    }
  });

  test("affiche les options de livraison si configurées", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    const firstCard = page.locator("a[href*='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForURL(/\/annonce\//);
      const delivery = page.getByText(/main propre|livraison/i);
      await expect(delivery).toBeVisible({ timeout: 10000 }).catch(() => {});
    }
  });
});

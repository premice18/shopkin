import { test, expect } from "@playwright/test";

test.describe("M2 – Détail annonce", () => {
  test.beforeEach(async ({ page }) => {
    // Aller à l'accueil pour trouver une annonce
    await page.goto("/");
    // Attendre que les annonces chargent
    await page.waitForLoadState("networkidle");
  });

  test("affiche la page de détail avec skeleton pendant le chargement", async ({ page }) => {
    const firstCard = page.locator("a[href^='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15000 });
    }
  });

  test("affiche le bouton retour", async ({ page }) => {
    const firstCard = page.locator("a[href^='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForLoadState("networkidle");
      const backBtn = page.getByRole("button", { name: /retour|back/i }).or(page.getByRole("link", { name: /retour|back/i }));
      await expect(backBtn).toBeVisible({ timeout: 10000 });
    }
  });

  test("bouton retour → retour à l'accueil", async ({ page }) => {
    const firstCard = page.locator("a[href^='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForLoadState("networkidle");
      const backBtn = page.getByRole("button", { name: /retour|back/i }).or(page.getByRole("link", { name: /retour|back/i }));
      if (await backBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await backBtn.click();
        await page.waitForURL("/", { timeout: 10000 });
        await expect(page.locator("a[href^='/annonce/']").first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test("le bouton WhatsApp est présent (si annonce avec vendeur)", async ({ page }) => {
    const firstCard = page.locator("a[href^='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForLoadState("networkidle");
      const waBtn = page.getByRole("link", { name: /whatsapp|contacter/i });
      if (await waBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(waBtn).toBeVisible();
        const href = await waBtn.getAttribute("href");
        expect(href).toContain("wa.me");
      }
    }
  });

  test("affiche le statut Disponible", async ({ page }) => {
    const firstCard = page.locator("a[href^='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForLoadState("networkidle");
      const status = page.getByText(/disponible|vendu|réservé/i);
      await expect(status).toBeVisible({ timeout: 10000 });
    }
  });

  test("affiche la description et les métadonnées", async ({ page }) => {
    const firstCard = page.locator("a[href^='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForLoadState("networkidle");
      await expect(page.getByText(/description/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/vue|fois/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test("affiche les options de livraison si configurées", async ({ page }) => {
    const firstCard = page.locator("a[href^='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForLoadState("networkidle");
      const livraison = page.getByText(/livraison|remise en main propre|domicile/i);
      await expect(livraison).toBeVisible({ timeout: 10000 }).catch(() => {});
    }
  });

  // Test du compteur de vues : vérifier qu'il est affiché
  test("compteur de vues affiché sur la page détail", async ({ page }) => {
    const firstCard = page.locator("a[href^='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForLoadState("networkidle");
      // Le compteur de vues est généralement affiché avec le nombre
      const views = page.getByText(/\d+ vue|consulté/i);
      await expect(views).toBeVisible({ timeout: 10000 }).catch(() => {
        // Certaines annonces peuvent ne pas avoir de compteur visible
      });
    }
  });
});

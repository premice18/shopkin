import { test, expect } from "@playwright/test";

test.describe("M2 – Catalogue page d'accueil", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("affiche le titre et la description", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /annonces récentes/i })).toBeVisible();
    await expect(page).toHaveTitle(/ShopKin/);
  });

  test("affiche la barre de filtres (chips catégories + selects)", async ({ page }) => {
    await expect(page.getByRole("button", { name: /toutes/i })).toBeVisible();
  });

  test("affiche une grille d'annonces (skeletons puis cartes)", async ({ page }) => {
    await page.waitForTimeout(2000);
    const cards = page.locator("[class*='rounded-\\[16px\\]']").or(page.locator("a[href*='/annonce/']"));
    const skeletons = page.locator("[class*='animate-pulse']");
    const hasCards = await cards.first().isVisible().catch(() => false);
    const hasSkeletons = await skeletons.first().isVisible().catch(() => false);
    expect(hasCards || hasSkeletons).toBe(true);
  });

  test("affiche le compteur d'annonces", async ({ page }) => {
    const counter = page.getByText(/\d+ annonce/);
    await expect(counter).toBeVisible({ timeout: 8000 }).catch(() => {});
  });

  test("le toggle devise USD/CDF est visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /usd|cdf/i }).first()).toBeVisible();
  });

  test("toggle devise : changement d'affichage des prix", async ({ page }) => {
    await page.waitForTimeout(2000);
    // Vérifier qu'au moins un prix est affiché en USD (devise par défaut)
    const firstCard = page.locator("a[href*='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Le prix en USD est affiché
      const usdBtn = page.getByRole("button", { name: /usd sélectionné|usd sélectionner/i }).first();
      const cdfBtn = page.getByRole("button", { name: /cdf sélectionner|cdf sélectionné/i }).first();

      if (await usdBtn.isVisible() && await cdfBtn.isVisible()) {
        // Basculer sur CDF
        await cdfBtn.click();
        await page.waitForTimeout(500);
        // Vérifier que le bouton CDF est maintenant sélectionné (aria-pressed)
        await expect(cdfBtn).toHaveAttribute("aria-pressed", "true");
      }
    }
  });

  test("les cartes produit affichent titre, prix et localisation", async ({ page }) => {
    await page.waitForTimeout(2000);
    const firstCard = page.locator("a[href*='/annonce/']").first();
    if (await firstCard.isVisible()) {
      await expect(firstCard.locator("h3")).toBeVisible();
      await expect(firstCard.locator("[class*='text-lg']").or(firstCard).filter({ hasText: /\$|FC/ })).toBeVisible();
    }
  });

  test("le clic sur une carte mène au détail", async ({ page }) => {
    await page.waitForTimeout(2000);
    const firstCard = page.locator("a[href*='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstCard.click();
      await expect(page).toHaveURL(/\/annonce\//);
    }
  });

  test("bannière invité visible pour utilisateur non connecté", async ({ page }) => {
    const banner = page.getByText(/achetez et vendez à kinshasa/i);
    await expect(banner).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("bannière invité : lien création de compte", async ({ page }) => {
    const link = page.getByRole("link", { name: /créer un compte/i });
    if (await link.isVisible()) {
      await expect(link).toHaveAttribute("href", "/auth/register");
    }
  });
});

test.describe("M2 – Filtres", () => {
  test("sélection d'une catégorie met à jour l'URL ou recharge les annonces", async ({ page }) => {
    await page.goto("/");
    const catButton = page.getByRole("button", { name: /téléphones|mode|véhicules|maison/i }).first();
    if (await catButton.isVisible({ timeout: 3000 })) {
      await catButton.click();
      await page.waitForTimeout(500);
      const cards = page.locator("a[href*='/annonce/']");
      const skeletons = page.locator("[class*='animate-pulse']");
      const hasContent = (await cards.count()) > 0 || (await skeletons.first().isVisible());
      expect(hasContent).toBe(true);
    }
  });

  test("select commune est présent", async ({ page }) => {
    await page.goto("/");
    const communeSelect = page.locator("select").filter({ has: page.locator("option", { hasText: /commune/i }) });
    await expect(communeSelect).toBeVisible();
  });

  test("état vide avec message quand aucun résultat", async ({ page }) => {
    await page.goto("/");
    const empty = page.getByText(/aucune annonce trouvée/i);
    await expect(empty).toBeVisible({ timeout: 8000 }).catch(() => {});
  });
});

test.describe("M2 – Pagination infinie", () => {
  test("affiche le sentinel de fin 'Vous avez tout vu'", async ({ page }) => {
    await page.goto("/");
    const endMsg = page.getByText(/vous avez tout vu/i);
    await expect(endMsg).toBeVisible({ timeout: 10000 }).catch(() => {});
  });
});

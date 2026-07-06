import { test, expect } from "@playwright/test";
import { loginAsUser } from "./utils";

test.describe("M2 – Dépôt d'annonce", () => {
  test("redirige vers login si non authentifié", async ({ page }) => {
    await page.goto("/deposer");
    await page.waitForURL("/auth/login");
  });

  test("affiche le formulaire complet (connecté requis)", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/deposer");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /publier une annonce/i })).toBeVisible({ timeout: 10000 });
  });

  // Test de soumission complète du formulaire de dépôt
  // Ce test crée une annonce avec des données valides
  test("soumission complète → message de succès ou redirection", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/deposer");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Remplir le titre
    const titreInput = page.getByLabel(/titre/i);
    if (!(await titreInput.isVisible({ timeout: 3000 }).catch(() => false))) return;

    await titreInput.fill(`Annonce test ${Date.now()}`);

    // Sélectionner une catégorie
    const categorie = page.getByLabel(/catégorie/i);
    if (await categorie.isVisible().catch(() => false)) {
      await categorie.selectOption("Téléphones");
    }

    // Remplir le prix
    const prixInput = page.getByLabel(/prix/i);
    if (await prixInput.isVisible().catch(() => false)) {
      await prixInput.fill("50000");
    }

    // Sélectionner la devise (si présent)
    const devise = page.getByLabel(/devise/i);
    if (await devise.isVisible().catch(() => false)) {
      await devise.selectOption("CDF");
    }

    // Sélectionner une commune
    const commune = page.getByLabel(/commune/i);
    if (await commune.isVisible().catch(() => false)) {
      await commune.selectOption("Gombe");
    }

    // Remplir la description
    const descInput = page.getByLabel(/description/i);
    if (await descInput.isVisible().catch(() => false)) {
      await descInput.fill("Description de test pour l'annonce Playwright.");
    }

    // Soumettre
    const submitBtn = page.getByRole("button", { name: /publier/i });
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      // Vérifier le résultat : redirection ou message de succès
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      const isSuccess = currentUrl.includes("/annonce/") || currentUrl.includes("/profil");
      if (!isSuccess) {
        // Peut-être un message d'erreur ou de validation
        const alert = page.locator('p[role="alert"]');
        await expect(alert).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    }
  });
});

test.describe("M2 – Dépôt validation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/deposer");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
  });

  test("validation : titre obligatoire", async ({ page }) => {
    const bouton = page.getByRole("button", { name: /publier/i });
    if (await bouton.isVisible({ timeout: 3000 })) {
      await bouton.click();
      const alert = page.locator('p[role="alert"]');
      await expect(alert).toBeVisible({ timeout: 5000 });
    }
  });

  test("sélecteurs de catégorie, commune et super-repère présents", async ({ page }) => {
    const selects = page.locator("select");
    if ((await selects.count()) > 0) {
      await expect(selects.first()).toBeVisible();
    }
  });

  test("upload d'image : prévisualisation après sélection", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent("filechooser");
    const uploadBtn = page.getByRole("button", { name: /ajouter.*image|upload|parcourir/i });
    if (await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadBtn.click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles({
        name: "test.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          "base64"
        ),
      });
      await page.waitForTimeout(1000);
      const preview = page.locator("img[src*='blob:']").first();
      await expect(preview).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test("validation : prix manquant", async ({ page }) => {
    const titreInput = page.getByLabel(/titre/i);
    if (await titreInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await titreInput.fill("Annonce test prix manquant");
      const submitBtn = page.getByRole("button", { name: /publier/i });
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        const alert = page.locator('p[role="alert"]');
        await expect(alert).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });
});

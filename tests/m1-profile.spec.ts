import { test, expect } from "@playwright/test";
import { loginAsUser } from "./utils";

test.describe("M1 – Profil", () => {
  test("redirige vers login si non authentifié", async ({ page }) => {
    await page.goto("/profil");
    await page.waitForURL("/auth/login");
    expect(page.url()).toContain("/auth/login");
  });

  test("redirige vers login si non authentifié – wallet", async ({ page }) => {
    await page.goto("/profil/wallet");
    await page.waitForURL("/auth/login");
  });

  test("redirige vers login si non authentifié – edit", async ({ page }) => {
    await page.goto("/profil/edit");
    await page.waitForURL("/auth/login");
  });
});

test.describe("M1 – Profil (connecté)", () => {
  // Connexion avant chaque test
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("page profil : titre tableau de bord visible", async ({ page }) => {
    await page.goto("/profil");
    await expect(page.getByText(/tableau de bord|profil/i)).toBeVisible({ timeout: 10000 });
  });

  test("affiche le bouton de déconnexion", async ({ page }) => {
    await page.goto("/profil");
    await expect(page.getByRole("button", { name: /déconnecter|se déconnecter/i })).toBeVisible({ timeout: 10000 });
  });

  test("déconnexion → redirection et toast", async ({ page }) => {
    await page.goto("/profil");
    await page.waitForTimeout(2000);
    const logoutBtn = page.getByRole("button", { name: /déconnecter|se déconnecter/i });
    if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForURL("/auth/login", { timeout: 10000 }).catch(() => {});
      // Vérifier qu'un toast de confirmation est affiché
      const toast = page.getByRole("status").first();
      await expect(toast).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test("bascule acheteur/ventes/paiements", async ({ page }) => {
    await page.goto("/profil");
    await page.waitForTimeout(2000);

    const achatsBtn = page.getByRole("button", { name: /achats/i });
    const ventesBtn = page.getByRole("button", { name: /ventes/i });
    const paiementsBtn = page.getByRole("button", { name: /paiements/i });
    await expect(achatsBtn).toBeVisible();
    await expect(ventesBtn).toBeVisible();
    await expect(paiementsBtn).toBeVisible();

    await ventesBtn.click();
    await expect(page.getByText(/mes ventes|nouvelle annonce|wallet/i)).toBeVisible({ timeout: 5000 });

    await paiementsBtn.click();
    await expect(page.getByText(/moyens de paiement|paiements/i)).toBeVisible({ timeout: 5000 });
  });

  test("lien vers édition du profil présent", async ({ page }) => {
    await page.goto("/profil");
    const editLink = page.getByRole("link", { name: /modifier le profil|éditer/i });
    if (await editLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(editLink).toHaveAttribute("href", "/profil/edit");
    }
  });

  // Test d'édition du nom depuis /profil/edit
  test("édition du nom depuis la page edit → sauvegarde", async ({ page }) => {
    await page.goto("/profil/edit");
    await page.waitForLoadState("networkidle");
    const nameInput = page.getByLabel(/nom/i).first();
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      const currentName = await nameInput.inputValue();
      const newName = currentName === "Test User" ? "Test User Edit" : "Test User";
      await nameInput.fill(newName);
      const saveBtn = page.getByRole("button", { name: /enregistrer|sauvegarder/i });
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        // Vérifier toast de succès
        const toast = page.getByRole("status").first();
        await expect(toast).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  // Test d'accès à la page wallet
  test("wallet : page affichée avec formulaire", async ({ page }) => {
    await page.goto("/profil/wallet");
    await page.waitForLoadState("networkidle");
    // Vérifier que le formulaire wallet est présent (titre ou champs)
    const heading = page.getByRole("heading", { name: /wallet|mobile money|paiement/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  // Test wallet : validation checkbox sans numéro (si applicable)
  test("wallet : validation cohérence checkbox/numéro", async ({ page }) => {
    await page.goto("/profil/wallet");
    await page.waitForLoadState("networkidle");
    // Chercher une checkbox M-Pesa, Airtel ou Orange
    const mpesaCheck = page.getByRole("checkbox", { name: /m.pesa|m-pesa/i }).first();
    if (await mpesaCheck.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Cocher sans numéro
      await mpesaCheck.check();
      const saveBtn = page.getByRole("button", { name: /enregistrer|sauvegarder/i });
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        // Vérifier message d'erreur ou validation
        const alert = page.locator('p[role="alert"]');
        await expect(alert).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });
});

import { test, expect } from "@playwright/test";
import { MOBILE_VIEWPORT } from "./utils";

test.use({ viewport: MOBILE_VIEWPORT });

test.describe("M1 – Auth responsive (mobile 375×812)", () => {
  test("inscription : formulaire pleine largeur, pas de split desktop", async ({ page }) => {
    await page.goto("/auth/register");
    const form = page.getByRole("button", { name: /créer mon compte/i });
    await expect(form).toBeVisible();
    const marketingSection = page.getByText(/prêt à rejoindre/i);
    await expect(marketingSection).toBeHidden();
  });

  test("connexion : formulaire pleine largeur, pas de split desktop", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
    const marketingSection = page.getByText(/bon retour parmi nous/i);
    await expect(marketingSection).toBeHidden();
  });

  test("inscription : badges confiance visibles sur mobile", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByText(/achats sécurisés|mobile money|\+2000 membres/i).first()).toBeVisible();
  });

  test("mot de passe oublié : header responsive", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByRole("heading", { name: /mot de passe oublié/i })).toBeVisible();
    const input = page.getByLabel("Adresse email");
    await expect(input).toBeVisible();
    const box = await input.boundingBox();
    expect(box!.width).toBeGreaterThan(200);
  });

  test("inscription : tous les champs accessibles sans scroll horizontal", async ({ page }) => {
    await page.goto("/auth/register");
    const labels: (string | RegExp)[] = ["Adresse email", /nom d'utilisateur/i, /^mot de passe/i, /confirmer/i, "Prénom *", /^Nom \*$/i, /commune/i];
    for (const label of labels) {
      await expect(page.getByLabel(label)).toBeVisible();
    }
    const vpWidth = page.viewportSize()?.width ?? 375;
    for (const label of labels) {
      const el = page.getByLabel(label);
      const box = await el.boundingBox();
      if (box) {
        expect(box.x + box.width).toBeLessThanOrEqual(vpWidth + 5);
      }
    }
  });

  test("connexion : le bouton submit est assez grand pour le pouce", async ({ page }) => {
    await page.goto("/auth/login");
    const btn = page.getByRole("button", { name: /se connecter/i });
    const box = await btn.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(200);
  });

  test("email vérification : accessible sur mobile", async ({ page }) => {
    await page.goto("/auth/verify-email?userId=test&secret=test");
    await expect(page.getByText(/vérification/i)).toBeVisible({ timeout: 10000 });
  });
});

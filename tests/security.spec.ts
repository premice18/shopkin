import { test, expect } from "@playwright/test";

// Vérification de sécurité : aucun lien vers /admin sur les pages publiques
// et aucune exposition de l'interface d'administration

test.describe("Sécurité – Pas de lien admin sur les pages publiques", () => {
  test("header (page accueil) : aucun lien vers /admin", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Vérifier tous les liens de la page
    const allLinks = page.locator("a");
    const linkCount = await allLinks.count();
    for (let i = 0; i < linkCount; i++) {
      const href = await allLinks.nth(i).getAttribute("href");
      if (href && href.startsWith("/admin")) {
        // Trouver le texte du lien pour contexte
        const text = await allLinks.nth(i).textContent();
        test.info().annotations.push({
          type: "warning",
          description: `Lien vers /admin trouvé: "${text?.trim()}" → ${href}`,
        });
      }
    }
    // Vérifier qu'aucun lien ne pointe vers /admin
    const adminLinks = page.locator('a[href^="/admin"]');
    await expect(adminLinks).toHaveCount(0);
  });

  test("footer : aucun lien vers /admin", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Défiler en bas pour exposer le footer sur mobile
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footer = page.locator("footer");
    if (await footer.isVisible({ timeout: 3000 }).catch(() => false)) {
      const adminLinks = footer.locator('a[href^="/admin"]');
      await expect(adminLinks).toHaveCount(0);
    }
  });

  test("bottom nav (mobile) : aucun lien vers /admin", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Sélecteur BottomNav : lien "Accueil" typique du composant
    const bottomNavLinks = page.locator('nav a, [class*="bottom"] a, a[href="/"]');
    const botCount = await bottomNavLinks.count();
    if (botCount > 0) {
      for (let i = 0; i < botCount; i++) {
        const href = await bottomNavLinks.nth(i).getAttribute("href");
        if (href && href.startsWith("/admin")) {
          test.info().annotations.push({
            type: "warning",
            description: `Lien admin dans BottomNav: ${href}`,
          });
        }
      }
      const adminLinks = page.locator('nav a[href^="/admin"], [class*="bottom"] a[href^="/admin"]');
      await expect(adminLinks).toHaveCount(0);
    }
  });

  test("page profil (connecté) : aucun lien vers /admin", async ({ page }) => {
    // Se connecter d'abord
    await page.goto("/auth/login");
    await page.getByLabel("Adresse email").fill("test-auth@shopkin.test");
    await page.getByRole("textbox", { name: "Mot de passe" }).fill("TestPass123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await page.waitForURL(/\/profil|\//, { timeout: 15000 }).catch(() => {});

    await page.goto("/profil");
    await page.waitForLoadState("networkidle");
    const allLinks = page.locator("a");
    const linkCount = await allLinks.count();
    for (let i = 0; i < linkCount; i++) {
      const href = await allLinks.nth(i).getAttribute("href");
      if (href && href.startsWith("/admin")) {
        const text = await allLinks.nth(i).textContent();
        test.info().annotations.push({
          type: "warning",
          description: `Lien vers /admin trouvé dans profil: "${text?.trim()}" → ${href}`,
        });
      }
    }
    const adminLinks = page.locator('a[href^="/admin"]');
    await expect(adminLinks).toHaveCount(0);
  });

  test("page detail annonce : aucun lien vers /admin", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator("a[href^='/annonce/']").first();
    if (await firstCard.isVisible({ timeout: 10000 }).catch(() => false)) {
      await firstCard.click();
      await page.waitForLoadState("networkidle");

      const adminLinks = page.locator('a[href^="/admin"]');
      await expect(adminLinks).toHaveCount(0);
    }
  });
});

test.describe("Sécurité – Pas d'exposition de données admin", () => {
  test("/admin/* ne doit pas être indexé (meta robots)", async ({ page }) => {
    await page.goto("/admin/login");
    // Vérifier qu'il y a une balise meta noindex ou que la page est cohérente
    const metaRobots = page.locator('meta[name="robots"]');
    if (await metaRobots.count() > 0) {
      const content = await metaRobots.getAttribute("content");
      if (content) {
        expect(content.toLowerCase()).toContain("noindex");
      }
    }
  });

  test("aucun email admin ou endpoint sensible dans le HTML", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    // Vérifier qu'aucun email admin ou route API n'est exposé
    expect(html).not.toContain("admin@shopkin");
    expect(html).not.toContain("/api/admin/");
  });
});

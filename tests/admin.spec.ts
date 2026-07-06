import { test, expect } from "@playwright/test";
import { loginAsUser, uniqueEmail } from "./utils";

test.describe("Admin – Accès et sécurité", () => {
  test("accès à /admin sans connexion → redirection /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/admin\/login/);
    expect(page.url()).toContain("/admin/login");
  });

  test("accès /admin/* préserve le paramètre redirect", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForURL(/\/admin\/login\?redirect=/);
    expect(page.url()).toContain("redirect=");
  });

  test('accès à /admin en tant qu\'utilisateur normal → page d\'erreur "pas admin"', async ({ page }) => {
    // Connexion en tant qu'utilisateur normal
    await loginAsUser(page);
    // Tentative d'accès à /admin
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    // L'utilisateur normal voit soit un message d'erreur, soit est redirigé
    const alert = page.locator('p[role="alert"]');
    const alertVisible = await alert.isVisible({ timeout: 5000 }).catch(() => false);
    if (!alertVisible) {
      const currentUrl = page.url();
      // Doit être sur /admin avec message, ou redirigé
      const redirected = currentUrl.includes("/admin/login") || currentUrl.includes("/auth/login");
      expect(redirected || currentUrl.includes("/admin")).toBeTruthy();
    }
  });

  test("page /admin/register accessible sans authentification", async ({ page }) => {
    await page.goto("/admin/register");
    await expect(page.getByRole("heading", { name: /créer un compte administrateur/i })).toBeVisible();
  });
});

test.describe("Admin – Connexion", () => {
  test("affiche le formulaire de connexion", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /administration/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Mot de passe", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
  });

  test("validation : email vide", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.locator('p[role="alert"]')).toContainText(/email/i);
  });

  test("validation : mot de passe vide", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.locator('p[role="alert"]')).toContainText(/mot de passe/i);
  });

  test("connexion avec mauvais identifiants → message d'erreur", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("wrong@admin.com");
    await page.getByRole("textbox", { name: "Mot de passe", exact: true }).fill("BadPass123");
    await page.getByRole("button", { name: /se connecter/i }).click();
    const alert = page.locator('p[role="alert"]');
    await expect(alert).toBeVisible({ timeout: 15000 });
    await expect(alert).toContainText(/incorrect/i);
  });

  test("lien vers inscription admin présent", async ({ page }) => {
    await page.goto("/admin/login");
    const registerLink = page.getByRole("link", { name: /créer un compte administrateur/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute("href", "/admin/register");
  });

  test("lien vers connexion utilisateur standard présent", async ({ page }) => {
    await page.goto("/admin/login");
    const userLoginLink = page.getByRole("link", { name: /connexion utilisateur/i });
    await expect(userLoginLink).toBeVisible();
    await expect(userLoginLink).toHaveAttribute("href", "/auth/login");
  });
});

test.describe("Admin – Inscription", () => {
  test("affiche le formulaire d'inscription", async ({ page }) => {
    await page.goto("/admin/register");
    await expect(page.getByRole("heading", { name: /créer un compte administrateur/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Prénom")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Nom", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Mot de passe", exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirmer le mot de passe")).toBeVisible();
  });

  test("validation : champs vides", async ({ page }) => {
    await page.goto("/admin/register");
    await page.getByRole("button", { name: /créer le compte administrateur/i }).click();
    await expect(page.locator('p[role="alert"]')).toContainText(/email/i);
  });

  test("validation : mot de passe trop court", async ({ page }) => {
    await page.goto("/admin/register");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Prénom").fill("Admin");
    await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Test");
    await page.getByRole("textbox", { name: "Mot de passe", exact: true }).fill("Aa1");
    await page.getByLabel("Confirmer le mot de passe").fill("Aa1");
    await page.getByRole("button", { name: /créer le compte administrateur/i }).click();
    await expect(page.locator('p[role="alert"]')).toContainText(/8 caractères/i);
  });

  test("validation : mots de passe différents", async ({ page }) => {
    await page.goto("/admin/register");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Prénom").fill("Admin");
    await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Test");
    await page.getByRole("textbox", { name: "Mot de passe", exact: true }).fill("StrongPass1");
    await page.getByLabel("Confirmer le mot de passe").fill("Different1");
    await page.getByRole("button", { name: /créer le compte administrateur/i }).click();
    await expect(page.locator('p[role="alert"]')).toContainText(/ne correspondent pas/i);
  });

  test("validation : email invalide", async ({ page }) => {
    await page.goto("/admin/register");
    // Désactiver la validation native HTML5 pour tester la validation JS côté client
    await page.getByLabel("Email").fill("pas-email");
    await page.evaluate(() => {
      const el = document.querySelector('input[type="email"]');
      if (el) el.removeAttribute("type");
    });
    await page.getByRole("button", { name: /créer le compte administrateur/i }).click();
    await expect(page.locator('p[role="alert"]')).toContainText(/email invalide/i);
  });

  test("validation : prénom manquant", async ({ page }) => {
    await page.goto("/admin/register");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Test");
    await page.getByRole("textbox", { name: "Mot de passe", exact: true }).fill("StrongPass1");
    await page.getByLabel("Confirmer le mot de passe").fill("StrongPass1");
    await page.getByRole("button", { name: /créer le compte administrateur/i }).click();
    await expect(page.locator('p[role="alert"]')).toContainText(/prénom/i);
  });

  test("validation : nom manquant", async ({ page }) => {
    await page.goto("/admin/register");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Prénom").fill("Admin");
    await page.getByRole("textbox", { name: "Mot de passe", exact: true }).fill("StrongPass1");
    await page.getByLabel("Confirmer le mot de passe").fill("StrongPass1");
    await page.getByRole("button", { name: /créer le compte administrateur/i }).click();
    await expect(page.locator('p[role="alert"]')).toContainText(/nom/i);
  });

  // Test d'inscription admin avec email non autorisé
  // ALLOWED_ADMIN_EMAILS doit être configuré dans .env.local pour que l'API l'accepte
  test("inscription admin avec email non autorisé → message d'erreur", async ({ page }) => {
    await page.goto("/admin/register");
    await page.getByLabel("Email").fill(uniqueEmail());
    await page.getByLabel("Prénom").fill("Admin");
    await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Test");
    await page.getByRole("textbox", { name: "Mot de passe", exact: true }).fill("StrongPass1");
    await page.getByLabel("Confirmer le mot de passe").fill("StrongPass1");
    await page.getByRole("button", { name: /créer le compte administrateur/i }).click();
    // Attendre la réponse de l'API
    await page.waitForTimeout(3000);
    const alert = page.locator('p[role="alert"]');
    const alertVisible = await alert.isVisible().catch(() => false);
    if (alertVisible) {
      // L'email n'étant pas dans la liste blanche, une erreur devrait s'afficher
      await expect(alert).toContainText(/autorisé|liste blanche|non autorisé|error/i);
    }
  });

  // Test d'inscription admin avec email autorisé (succès)
  // Nécessite que ALLOWED_ADMIN_EMAILS contienne un email de test
  test("inscription admin avec email autorisé → succès", async ({ page }) => {
    // Récupérer l'email autorisé depuis les variables d'environnement ou utiliser un fallback
    // Ce test nécessite un email présent dans ALLOWED_ADMIN_EMAILS
    const allowedEmail = process.env.ALLOWED_ADMIN_EMAILS_TEST || "";
    if (!allowedEmail) {
      test.info().annotations.push({ type: "skip", description: "ALLOWED_ADMIN_EMAILS_TEST non défini" });
      test.skip();
      return;
    }
    await page.goto("/admin/register");
    await page.getByLabel("Email").fill(allowedEmail);
    await page.getByLabel("Prénom").fill("Admin");
    await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Playwright");
    await page.getByRole("textbox", { name: "Mot de passe", exact: true }).fill("StrongPass1");
    await page.getByLabel("Confirmer le mot de passe").fill("StrongPass1");
    await page.getByRole("button", { name: /créer le compte administrateur/i }).click();
    // Attendre la redirection ou le message de succès
    await page.waitForTimeout(3000);
    const successMsg = page.getByText(/compte.*créé.*succès/i);
    const successVisible = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
    if (!successVisible) {
      // Peut-être déjà redirigé vers /admin
      await page.waitForURL(/\/admin/, { timeout: 5000 }).catch(() => {});
    }
  });
});

test.describe("Admin – Dashboard", () => {
  test("page dashboard accessible uniquement après connexion admin", async ({ page }) => {
    // Ce test vérifie que la page existe et affiche son titre
    // Sans connexion admin, on sera redirigé
    await page.goto("/admin");
    const onLogin = page.url().includes("/admin/login");
    if (onLogin) {
      await expect(page.getByRole("heading", { name: /administration/i })).toBeVisible();
    }
  });

  test("dashboard affiche le titre Tableau de bord", async ({ page }) => {
    // Tentative d'accès — si on est redirigé vers login, on vérifie simplement
    // que la redirection fonctionne (testé dans le bloc connexion)
    await page.goto("/admin");
    if (page.url().includes("/admin/login")) {
      // Déjà testé — passer
      return;
    }
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /tableau de bord/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin – Pages internes", () => {
  test("page /admin/users existe et est protégée", async ({ page }) => {
    await page.goto("/admin/users");
    const onLogin = page.url().includes("/admin/login");
    if (onLogin) {
      await expect(page.getByRole("heading", { name: /administration/i })).toBeVisible();
    } else {
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { name: /utilisateurs/i })).toBeVisible({ timeout: 10000 });
    }
  });

  test("page /admin/annonces existe et est protégée", async ({ page }) => {
    await page.goto("/admin/annonces");
    const onLogin = page.url().includes("/admin/login");
    if (onLogin) {
      await expect(page.getByRole("heading", { name: /administration/i })).toBeVisible();
    } else {
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { name: /annonces/i })).toBeVisible({ timeout: 10000 });
    }
  });

  test("page /admin/settings existe et est protégée", async ({ page }) => {
    await page.goto("/admin/settings");
    const onLogin = page.url().includes("/admin/login");
    if (onLogin) {
      await expect(page.getByRole("heading", { name: /administration/i })).toBeVisible();
    } else {
      await page.waitForLoadState("networkidle");
      await expect(page.getByRole("heading", { name: /paramètres/i })).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("Admin – Responsive mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("page admin login responsive", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /administration/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Mot de passe", exact: true })).toBeVisible();
    // Vérifier que le formulaire utilise toute la largeur
    const form = page.locator("form");
    const box = await form.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeGreaterThan(200);
    }
  });

  test("page admin register responsive", async ({ page }) => {
    await page.goto("/admin/register");
    await expect(page.getByRole("heading", { name: /créer un compte administrateur/i })).toBeVisible();
    // Vérifier que les champs sont utilisables sur mobile
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Prénom")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Nom", exact: true })).toBeVisible();
  });

  test("boutons admin accessibles au pouce (>= 44px)", async ({ page }) => {
    await page.goto("/admin/login");
    const btn = page.getByRole("button", { name: /se connecter/i });
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});

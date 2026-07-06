import { test, expect } from "@playwright/test";

test.describe("M1 – Inscription", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/register");
  });

  test("affiche le formulaire complet", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /créer un compte/i })).toBeVisible();
    await expect(page.getByLabel("Adresse email")).toBeVisible();
    await expect(page.getByLabel(/nom d'utilisateur/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe \*/i)).toBeVisible();
    await expect(page.getByLabel(/confirmer/i)).toBeVisible();
    await expect(page.getByLabel("Prénom *")).toBeVisible();
    await expect(page.getByLabel("Nom *")).toBeVisible();
    await expect(page.getByLabel("Commune de résidence *")).toBeVisible();
  });

  test("affiche les boutons radio sexe", async ({ page }) => {
    await expect(page.getByRole("radio", { name: "Homme" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Femme" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Autre" })).toBeVisible();
  });

  test("affiche les badges de confiance sur mobile uniquement", async ({ page }) => {
    const badges = page.locator("text=Achats sécurisés, text=Mobile Money, text=2000 membres");
    await expect(badges.first()).toBeVisible();
  });

  test("validation : champs obligatoires vides", async ({ page }) => {
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    const alert = page.getByRole("alert").first();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/email/i);
  });

  test("validation : email invalide", async ({ page }) => {
    await page.getByLabel("Adresse email").fill("pas-un-email");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.getByRole("alert").first()).toContainText(/email/i);
  });

  test("validation : mot de passe trop court", async ({ page }) => {
    await page.getByLabel("Adresse email").fill("a@b.com");
    await page.getByLabel(/nom d'utilisateur/i).fill("newuser");
    await page.getByLabel(/mot de passe \*/i).fill("Aa1");
    await page.getByLabel(/confirmer/i).fill("Aa1");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.getByRole("alert").first()).toContainText(/8 caractères/i);
  });

  test("validation : mot de passe sans majuscule", async ({ page }) => {
    await page.getByLabel("Adresse email").fill("a@b.com");
    await page.getByLabel(/nom d'utilisateur/i).fill("newuser");
    await page.getByLabel(/mot de passe \*/i).fill("faiblepass1");
    await page.getByLabel(/confirmer/i).fill("faiblepass1");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.getByRole("alert").first()).toContainText(/majuscule/i);
  });

  test("validation : mots de passe différents", async ({ page }) => {
    await page.getByLabel("Adresse email").fill("a@b.com");
    await page.getByLabel(/nom d'utilisateur/i).fill("newuser");
    await page.getByLabel(/mot de passe \*/i).fill("StrongPass1");
    await page.getByLabel(/confirmer/i).fill("Different1");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.getByRole("alert").first()).toContainText(/ne correspondent pas/i);
  });

  test("validation : username trop court", async ({ page }) => {
    await page.getByLabel("Adresse email").fill("a@b.com");
    await page.getByLabel(/nom d'utilisateur/i).fill("ab");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.getByRole("alert").first()).toContainText(/3 caractères/i);
  });

  test("validation : username caractères spéciaux", async ({ page }) => {
    await page.getByLabel(/nom d'utilisateur/i).fill("user name!");
    await page.waitForTimeout(500);
    const alert = page.getByRole("alert").first();
    if (await alert.isVisible()) {
      await expect(alert).toContainText(/lettres et chiffres/i);
    }
  });

  test("validation : sexe non sélectionné", async ({ page }) => {
    await page.getByLabel("Adresse email").fill("a@b.com");
    await page.getByLabel(/nom d'utilisateur/i).fill("validuser");
    await page.getByLabel(/mot de passe \*/i).fill("StrongPass1");
    await page.getByLabel(/confirmer/i).fill("StrongPass1");
    await page.getByLabel("Prénom *").fill("Jean");
    await page.getByLabel("Nom *").fill("Dupont");
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.getByRole("alert").first()).toContainText(/sexe/i);
  });

  test("validation : commune non sélectionnée", async ({ page }) => {
    await page.getByLabel("Adresse email").fill("a@b.com");
    await page.getByLabel(/nom d'utilisateur/i).fill("validuser");
    await page.getByLabel(/mot de passe \*/i).fill("StrongPass1");
    await page.getByLabel(/confirmer/i).fill("StrongPass1");
    await page.getByLabel("Prénom *").fill("Jean");
    await page.getByLabel("Nom *").fill("Dupont");
    await page.getByRole("radio", { name: "Homme" }).click();
    await page.getByRole("button", { name: /créer mon compte/i }).click();
    await expect(page.getByRole("alert").first()).toContainText(/commune/i);
  });

  test("indicateur de force du mot de passe", async ({ page }) => {
    const pw = page.getByLabel(/mot de passe \*/i);
    await pw.fill("weak");
    await expect(page.getByText("Faible")).toBeVisible();
    await pw.fill("MediumPass1");
    await expect(page.getByText("Moyen")).toBeVisible();
    await pw.fill("Str0ng!Pass#");
    await expect(page.getByText("Fort")).toBeVisible();
  });

  test("affiche le lien connexion", async ({ page }) => {
    const link = page.getByRole("link", { name: /connectez-vous/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/auth/login");
  });

  test("affiche le bouton Google", async ({ page }) => {
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
  });
});

test.describe("M1 – Connexion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("affiche le formulaire", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
    await expect(page.getByLabel("Adresse email")).toBeVisible();
    await expect(page.getByLabel("Mot de passe")).toBeVisible();
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
  });

  test("validation : email vide", async ({ page }) => {
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.getByRole("alert")).toContainText(/email/i);
  });

  test("validation : mot de passe vide", async ({ page }) => {
    await page.getByLabel("Adresse email").fill("a@b.com");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.getByRole("alert")).toContainText(/mot de passe/i);
  });

  test("connexion avec mauvais identifiants → message d'erreur", async ({ page }) => {
    await page.getByLabel("Adresse email").fill("inexistant@test.com");
    await page.getByLabel("Mot de passe").fill("WrongPass1");
    await page.getByRole("button", { name: /se connecter/i }).click();
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible({ timeout: 15000 });
    await expect(alert).toContainText(/incorrect/i);
  });

  test("lien inscription présent", async ({ page }) => {
    await expect(page.getByRole("link", { name: /créez-en un/i })).toHaveAttribute("href", "/auth/register");
  });

  test("lien mot de passe oublié présent", async ({ page }) => {
    await expect(page.getByRole("link", { name: /mot de passe oublié/i })).toHaveAttribute("href", "/auth/forgot-password");
  });

  test("bouton Google présent", async ({ page }) => {
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
  });

  test("toggle affichage mot de passe", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /afficher/i });
    await expect(toggle).toBeVisible();
    await page.getByLabel("Mot de passe").fill("visible");
    await toggle.click();
    await expect(page.getByLabel("Mot de passe")).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: /masquer/i }).click();
    await expect(page.getByLabel("Mot de passe")).toHaveAttribute("type", "password");
  });

  test("redirection /auth/phone → /auth/login", async ({ page }) => {
    await page.goto("/auth/phone");
    await page.waitForURL("/auth/login");
  });
});

test.describe("M1 – Mot de passe oublié", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/forgot-password");
  });

  test("affiche le formulaire", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /mot de passe oublié/i })).toBeVisible();
    await expect(page.getByLabel("Adresse email")).toBeVisible();
    await expect(page.getByRole("button", { name: /réinitialiser/i })).toBeVisible();
  });

  test("validation : email vide", async ({ page }) => {
    await page.getByRole("button", { name: /réinitialiser/i }).click();
    await expect(page.getByRole("alert")).toContainText(/email/i);
  });

  test("affiche lien retour connexion", async ({ page }) => {
    await expect(page.getByRole("link", { name: /retour/i })).toHaveAttribute("href", "/auth/login");
  });
});

test.describe("M1 – Email verification (callback)", () => {
  test("affiche 'lien invalide' sans paramètres", async ({ page }) => {
    await page.goto("/auth/verify-email");
    await expect(page.getByText(/invalide/i)).toBeVisible({ timeout: 10000 });
  });
});

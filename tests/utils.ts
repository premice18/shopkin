import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const MOBILE_VIEWPORT = { width: 375, height: 812 };
export const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

// Compte de test existant (créé manuellement dans Appwrite pour l'environnement de test)
export const TEST_USER = { email: "test-auth@shopkin.test", password: "TestPass123" };

// Génère un email unique pour chaque test (timestamp)
export function uniqueEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@shopkin.test`;
}

export function uniqueUsername(): string {
  return `user${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

// Attend qu'un toast apparaisse et vérifie son texte
export async function waitForToast(page: Page, text?: string | RegExp) {
  const toast = page.getByRole("status").or(page.locator("[class*='toast']")).first();
  if (text) {
    await expect(toast).toContainText(text);
  }
  return toast;
}

// Remplit un champ input par son label (aria-label)
export async function fillInputByLabel(page: Page, label: string, value: string) {
  const input = page.getByLabel(label);
  await input.fill(value);
  return input;
}

// Sélectionne une option dans un select
export async function selectOption(page: Page, label: string, value: string) {
  const select = page.getByLabel(label);
  await select.selectOption(value);
}

// Connecte un utilisateur avec email/mot de passe via la page /auth/login
export async function loginAsUser(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto("/auth/login");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByRole("textbox", { name: "Mot de passe" }).fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await page.waitForURL(/\/profil|\//, { timeout: 15000 }).catch(() => {});
}

// Crée un compte admin en remplissant le formulaire /admin/register
// Note : l'email doit être dans ALLOWED_ADMIN_EMAILS pour que l'API l'accepte
export async function registerAdmin(
  page: Page,
  email: string,
  password: string,
  prenom: string,
  nom: string
) {
  await page.goto("/admin/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Prénom").fill(prenom);
  await page.getByRole("textbox", { name: "Nom", exact: true }).fill(nom);
  await page.getByRole("textbox", { name: "Mot de passe", exact: true }).fill(password);
  await page.getByLabel("Confirmer le mot de passe").fill(password);
  await page.getByRole("button", { name: /créer le compte administrateur/i }).click();
}

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const MOBILE_VIEWPORT = { width: 375, height: 812 };
export const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

export async function waitForToast(page: Page, text?: string | RegExp) {
  const toast = page.getByRole("status").or(page.locator("[class*='toast']")).first();
  if (text) {
    await expect(toast).toContainText(text);
  }
  return toast;
}

export async function fillInputByLabel(page: Page, label: string, value: string) {
  const input = page.getByLabel(label);
  await input.fill(value);
  return input;
}

export async function selectOption(page: Page, label: string, value: string) {
  const select = page.getByLabel(label);
  await select.selectOption(value);
}

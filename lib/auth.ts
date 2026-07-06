"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ID, OAuthProvider, Query } from "appwrite";
import { account, tablesDB } from "./appwrite";
import { DATABASE_ID, PROFILES_COLLECTION_ID } from "./constants";
import type { Models } from "appwrite";

export function useAuth() {
  const [user, setUser] = useState<Models.User<Record<string, unknown>> | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    account
      .get()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await account.deleteSession({ sessionId: "current" });
    setUser(null);
    clearAuthCookie();
    router.push("/auth/login");
  };

  return { user, loading, logout };
}

export async function signUp({
  email,
  password,
  username,
  whatsappNumber,
  prenom,
  nom,
  sexe,
  commune,
  dateNaissance,
}: {
  email: string;
  password: string;
  username: string;
  whatsappNumber?: string;
  prenom: string;
  nom: string;
  sexe: string;
  commune: string;
  dateNaissance?: string;
}) {
  const userId = ID.unique();
  const fullName = `${prenom.trim()} ${nom.trim()}`;

  // 1. Create Appwrite account
  await account.create({ userId, email, password, name: fullName });

  // 2. Create session
  await account.createEmailPasswordSession({ email, password });

  // 3. Create profile document
  await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: PROFILES_COLLECTION_ID,
    rowId: userId,
    data: {
      username: username.toLowerCase().trim(),
      email,
      email_verified: false,
      full_name: fullName,
      prenom: prenom.trim(),
      nom: nom.trim(),
      sexe,
      commune_defaut: commune,
      date_naissance: dateNaissance || "",
      whatsapp_number: whatsappNumber || "",
      profile_complete: true,
      has_password: true,
      m_pesa_registered: false,
      airtel_money_registered: false,
      orange_money_registered: false,
    },
  });

  setAuthCookie();
  return userId;
}

function setAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "shopkin_auth=true; path=/; max-age=86400; SameSite=Lax";
  }
}

function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "shopkin_auth=; path=/; max-age=0; SameSite=Lax";
  }
}

export async function signIn({ email, password }: { email: string; password: string }) {
  // Ensure no stale session before creating a new one
  await account.deleteSession({ sessionId: "current" }).catch(() => {});
  await account.createEmailPasswordSession({ email, password });
  setAuthCookie();
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const res = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: PROFILES_COLLECTION_ID,
    queries: [
      Query.equal("username", username.toLowerCase().trim()),
      Query.limit(1),
    ],
  });
  return res.rows.length === 0;
}

export function signInWithGoogle() {
  account.createOAuth2Session({
    provider: OAuthProvider.Google,
    success: `${window.location.origin}/auth/oauth-callback`,
    failure: `${window.location.origin}/auth/login?error=oauth_cancelled`,
  });
}

export async function sendVerificationEmail(): Promise<void> {
  const origin = window.location.origin;
  await account.createEmailVerification({ url: `${origin}/auth/verify-email` });
}

export async function verifyEmail(userId: string, secret: string): Promise<void> {
  await account.updateEmailVerification({ userId, secret });
}

export async function sendPasswordRecovery(email: string): Promise<void> {
  const origin = window.location.origin;
  await account.createRecovery({ email, url: `${origin}/auth/reset-password` });
}

export async function resetPassword(userId: string, secret: string, newPassword: string): Promise<void> {
  await account.updateRecovery({ userId, secret, password: newPassword });
}

export async function completeProfile({
  userId,
  username,
  prenom,
  nom,
  whatsappNumber,
  sexe,
  commune,
  dateNaissance,
}: {
  userId: string;
  username: string;
  prenom: string;
  nom: string;
  whatsappNumber?: string;
  sexe: string;
  commune: string;
  dateNaissance?: string;
}) {
  const fullName = `${prenom.trim()} ${nom.trim()}`;
  await tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: PROFILES_COLLECTION_ID,
    rowId: userId,
    data: {
      username: username.toLowerCase().trim(),
      full_name: fullName,
      prenom: prenom.trim(),
      nom: nom.trim(),
      sexe,
      commune_defaut: commune,
      date_naissance: dateNaissance || "",
      whatsapp_number: whatsappNumber || "",
      profile_complete: true,
    },
  });
}

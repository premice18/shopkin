"use client";

import { useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AppwriteException } from "appwrite";
import { Mail, Lock, LogIn, ShieldAlert } from "lucide-react";
import { signIn } from "@/lib/auth";
import { account } from "@/lib/appwrite";
import { getProfile } from "@/lib/profile";

// Messages d'erreur pour la connexion admin
const ERROR_MESSAGES: Record<string, string> = {
  user_invalid_credentials: "Email ou mot de passe incorrect.",
  general: "Erreur de connexion.",
};

const ERROR_CHECK_ADMIN = "Votre compte n'a pas les droits d'administration nécessaires.";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Connecte l'utilisateur puis vérifie le rôle admin avant de rediriger
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Veuillez entrer votre email."); return; }
    if (!password) { setError("Veuillez entrer votre mot de passe."); return; }

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });

      const currentUser = await account.get();
      const profile = await getProfile(currentUser.$id);
      const role = (profile as { role?: string } | null)?.role;

      if (role !== "admin") {
        setError(ERROR_CHECK_ADMIN);
        setLoading(false);
        return;
      }

      window.location.href = redirectTo;
    } catch (err: unknown) {
      if (err instanceof AppwriteException) {
        setError(ERROR_MESSAGES[err.type] || err.message || ERROR_MESSAGES.general);
      } else {
        setError(ERROR_MESSAGES.general);
      }
      setLoading(false);
    }
  }, [email, password, redirectTo]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface to-zinc-100 p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-zinc-100">
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-sm">
              <ShieldAlert className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-primary">Administration</h1>
              <p className="mt-1 text-sm text-muted">
                Connectez-vous avec un compte administrateur.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-sm font-medium text-primary">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 focus-within:border-primary transition-colors">
                <Mail className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="admin@shopkin.cd"
                  className="min-w-0 flex-1 text-sm text-muted outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-sm font-medium text-primary">
                Mot de passe
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 focus-within:border-primary transition-colors">
                <Lock className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Mot de passe"
                  className="min-w-0 flex-1 text-sm text-muted outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="text-center text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Vérification...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-2">
            <a href="/admin/register" className="text-sm text-muted transition hover:text-accent">
              Créer un compte administrateur
            </a>
            <a href="/auth/login" className="text-xs text-muted/60 transition hover:text-muted">
              Connexion utilisateur
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface to-zinc-100">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth";
import AuthHeader from "@/components/layout/AuthHeader";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !secret) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Lien de réinitialisation invalide ou expiré.");
    }
  }, [userId, secret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userId || !secret) { setError("Lien invalide."); return; }
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (!/[A-Z]/.test(password)) { setError("Le mot de passe doit contenir au moins une majuscule."); return; }
    if (!/[0-9]/.test(password)) { setError("Le mot de passe doit contenir au moins un chiffre."); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }

    setLoading(true);
    try {
      await resetPassword(userId, secret, password);
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-16">
      <AuthHeader />
      <div className="mx-auto mt-20 max-w-sm px-4">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mt-4 text-lg font-bold text-primary">Mot de passe réinitialisé !</h1>
              <p className="mt-2 text-sm text-muted">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              <p className="mt-4 text-xs text-muted">Redirection vers la connexion...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-primary">Nouveau mot de passe</h1>
                <p className="mt-1 text-sm text-muted">Choisissez un mot de passe sécurisé.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-primary">Nouveau mot de passe</label>
                <input
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 8 caractères"
                  className="rounded-xl border border-border px-4 py-3 text-sm"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-primary">Confirmer le mot de passe</label>
                <input
                  id="confirmPassword" type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className="rounded-xl border border-border px-4 py-3 text-sm"
                />
              </div>

              {error && <p className="text-center text-sm text-danger" role="alert">{error}</p>}

              <button type="submit" disabled={loading || !userId || !secret}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Réinitialisation...</>
                ) : "Réinitialiser le mot de passe"}
              </button>

              <Link href="/auth/login" className="text-center text-sm text-blue-600 font-semibold hover:underline">
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

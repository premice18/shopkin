"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordRecovery } from "@/lib/auth";
import { useToast } from "@/lib/contexts/ToastContext";
import AuthHeader from "@/components/layout/AuthHeader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Veuillez entrer votre email."); return; }

    setLoading(true);
    try {
      await sendPasswordRecovery(email.trim());
      setSent(true);
      success("Si un compte existe avec cet email, tu recevras un lien de réinitialisation.");
    } catch {
      setError("Erreur lors de l'envoi. Veuillez réessayer.");
      toastError("Erreur lors de l'envoi. Vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-16 flex flex-col">
      <AuthHeader />
      <div className="mx-auto mt-0 flex flex-1 max-w-sm items-center justify-center px-4 md:max-w-md lg:max-w-lg">
        <div className="flex w-full flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-center">

            <h1 className="text-2xl font-bold text-primary">Mot de passe oublié</h1>
            <p className="mt-1 text-sm text-muted">
              {sent
                ? "Si cet email existe, un lien de réinitialisation a été envoyé."
                : "Entrez votre email pour recevoir un lien de réinitialisation."}
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl bg-green-50 p-4 text-center text-sm text-green-700">
              Email envoyé ! Vérifiez votre boîte de réception.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-primary">Adresse email</label>
                <input
                  id="email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="exemple@email.com"
                  className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
                  autoFocus
                />
              </div>

              {error && <p className="text-center text-sm text-danger" role="alert">{error}</p>}

              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Envoi...</>
                ) : "Réinitialiser le mot de passe"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted">
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

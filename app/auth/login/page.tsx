"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppwriteException } from "appwrite";
import { signIn } from "@/lib/auth";
import { useToast } from "@/lib/contexts/ToastContext";
import Link from "next/link";
import AuthLayout from "@/components/layout/AuthLayout";

const ERROR_MESSAGES: Record<string, string> = {
  user_invalid_credentials: "Email ou mot de passe incorrect.",
  user_not_verified:
    "Votre adresse email n'a pas encore été vérifiée. Vérifiez votre boîte de réception ou renvoyez l'email de confirmation depuis votre profil.",
  general: "Une erreur est survenue. Veuillez réessayer.",
};

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success } = useToast();

  const displayError = error;

  // Permet de rediriger l'utilisateur vers la page d'origine après connexion
  // Utilisé par AdminGuard et le proxy pour les routes protégées
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Veuillez entrer votre email."); return; }
    if (!password) { setError("Veuillez entrer votre mot de passe."); return; }

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      success("Bon retour sur ShopKin !");
      await new Promise((r) => setTimeout(r, 600));
      router.push(redirectTo);
    } catch (err: unknown) {
      if (err instanceof AppwriteException) {
        setError(ERROR_MESSAGES[err.type] || err.message || ERROR_MESSAGES.general);
      } else {
        setError(ERROR_MESSAGES.general);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <div className="flex w-full flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Connexion</h1>
          <p className="mt-1 text-base text-muted">Connectez-vous à votre compte ShopKin.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-primary">Adresse email</label>
            <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3">
              <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                id="email" type="email" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="exemple@email.com"
                className="min-w-0 flex-1 text-sm text-muted outline-none"
                autoFocus
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-primary">Mot de passe</label>
            <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3">
              <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                id="password" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Entrez votre mot de passe"
                className="min-w-0 flex-1 text-sm text-muted outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="shrink-0 text-muted hover:text-primary" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {displayError && <p className="text-center text-sm text-danger" role="alert">{displayError}</p>}

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Connexion...</>
            ) : "Se connecter"}
          </button>

          <Link href="/auth/forgot-password" className="text-center text-sm text-muted underline transition hover:text-primary">
            Mot de passe oublié ?
          </Link>
        </form>

        <p className="text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <a href="/auth/register" className="text-blue-600 font-semibold hover:underline">Créez-en un</a>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <AuthLayout variant="login">
        <div className="flex w-full flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </AuthLayout>
    }>
      <LoginForm />
    </Suspense>
  );
}

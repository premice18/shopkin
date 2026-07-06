"use client";

import { useState } from "react";
import { Mail, Lock, User, ShieldAlert, CheckCircle, EyeOff, Eye, UserPlus } from "lucide-react";

// Page d'inscription dédiée aux administrateurs.
// Accessible uniquement via l'URL (aucun lien public).
// L'email doit figurer dans ALLOWED_ADMIN_EMAILS (vérifié côté serveur).
export default function AdminRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("L'email est obligatoire."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Email invalide."); return; }
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (!/[A-Z]/.test(password)) { setError("Le mot de passe doit contenir au moins une majuscule."); return; }
    if (!/[0-9]/.test(password)) { setError("Le mot de passe doit contenir au moins un chiffre."); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    if (!prenom.trim()) { setError("Le prénom est obligatoire."); return; }
    if (!nom.trim()) { setError("Le nom est obligatoire."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, prenom: prenom.trim(), nom: nom.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du compte.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/admin";
      }, 2000);
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface to-zinc-100 p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-zinc-100">
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-sm">
              <ShieldAlert className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-primary">
                Créer un compte administrateur
              </h1>
              <p className="mt-1 text-sm text-muted">
                L&apos;email doit être autorisé dans la liste blanche.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-reg-email"
                className="text-sm font-medium text-primary"
              >
                Email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 focus-within:border-primary transition-colors">
                <Mail
                  className="h-4 w-4 shrink-0 text-muted"
                  aria-hidden="true"
                />
                <input
                  id="admin-reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="admin@shopkin.cd"
                  className="min-w-0 flex-1 text-sm text-muted outline-none disabled:opacity-50"
                  autoFocus
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <label
                  htmlFor="admin-reg-prenom"
                  className="text-sm font-medium text-primary"
                >
                  Prénom
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 focus-within:border-primary transition-colors">
                  <User
                    className="h-4 w-4 shrink-0 text-muted"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-reg-prenom"
                    type="text"
                    value={prenom}
                    onChange={(e) => {
                      setPrenom(e.target.value);
                      setError("");
                    }}
                    placeholder="Jean"
                    className="min-w-0 flex-1 text-sm text-muted outline-none disabled:opacity-50"
                    disabled={loading || success}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label
                htmlFor="admin-reg-nom"
                className="text-sm font-medium text-primary"
              >
                Nom
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 focus-within:border-primary transition-colors">
                <User
                  className="h-4 w-4 shrink-0 text-muted"
                  aria-hidden="true"
                />
                <input
                  id="admin-reg-nom"
                  type="text"
                  value={nom}
                  onChange={(e) => {
                    setNom(e.target.value);
                    setError("");
                  }}
                  placeholder="Mpiana"
                  className="min-w-0 flex-1 text-sm text-muted outline-none disabled:opacity-50"
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-reg-password"
                className="text-sm font-medium text-primary"
              >
                Mot de passe
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 focus-within:border-primary transition-colors">
                <Lock
                  className="h-4 w-4 shrink-0 text-muted"
                  aria-hidden="true"
                />
                <input
                  id="admin-reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Min 8 car., 1 majuscule, 1 chiffre"
                  className="min-w-0 flex-1 text-sm text-muted outline-none disabled:opacity-50"
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-muted hover:text-primary"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-reg-confirm"
                className="text-sm font-medium text-primary"
              >
                Confirmer le mot de passe
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 focus-within:border-primary transition-colors">
                <Lock
                  className="h-4 w-4 shrink-0 text-muted"
                  aria-hidden="true"
                />
                <input
                  id="admin-reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Répétez le mot de passe"
                  className="min-w-0 flex-1 text-sm text-muted outline-none disabled:opacity-50"
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="shrink-0 text-muted hover:text-primary"
                  aria-label={showConfirm ? "Masquer" : "Afficher"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-center text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            {success && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
                <CheckCircle
                  className="mx-auto mb-1 h-5 w-5 text-green-600"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-green-800">
                  Compte administrateur créé avec succès !
                </p>
                <p className="mt-1 text-xs text-green-600">
                  Redirection vers l&apos;administration...
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Création en cours...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                  Compte créé
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Créer le compte administrateur
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Déjà un compte ?{" "}
            <a
              href="/admin/login"
              className="text-sm text-muted transition hover:text-accent"
            >
              Connectez-vous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

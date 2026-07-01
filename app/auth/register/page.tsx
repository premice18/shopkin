"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { signUp, signInWithGoogle, checkUsernameAvailability } from "@/lib/auth";
import AuthHeader from "@/components/layout/AuthHeader";

const communes = [
  "Gombe","Kinshasa","Lemba","Ngaliema","Kasa-Vubu",
  "Matete","Limete","Barumbu","Bandalungwa","Bumbu",
  "Kintambo","Kisenso","Lingwala","Makala","Maluku",
  "Masina","Mont Ngafula","Ndjili","Ngaba","Ngiri-Ngiri",
  "Nsele","Selembao",
];

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: "Faible", color: "bg-danger", width: "w-1/4" };
  if (score <= 4) return { label: "Moyen", color: "bg-yellow-500", width: "w-2/4" };
  if (score <= 5) return { label: "Fort", color: "bg-green-600", width: "w-3/4" };
  return { label: "Très fort", color: "bg-green-700", width: "w-full" };
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sexe, setSexe] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [commune, setCommune] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const checkUsername = useCallback((value: string) => {
    const v = value.toLowerCase().trim();
    if (v.length < 3) { setUsernameAvailable(null); return; }
    if (!/^[a-z0-9]+$/.test(v)) { setUsernameAvailable(false); return; }
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    usernameTimer.current = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const available = await checkUsernameAvailability(v);
        setUsernameAvailable(available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 400);
  }, []);

  const validate = (): string | null => {
    if (!email.trim()) return "L'email est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email invalide.";
    if (!username.trim()) return "Le nom d'utilisateur est obligatoire.";
    if (username.trim().length < 3) return "Le nom d'utilisateur doit contenir au moins 3 caractères.";
    if (!/^[a-zA-Z0-9]+$/.test(username.trim())) return "Lettres et chiffres uniquement.";
    if (usernameAvailable === false) return "Ce nom d'utilisateur est déjà pris.";
    if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (!/[A-Z]/.test(password)) return "Le mot de passe doit contenir au moins une majuscule.";
    if (!/[0-9]/.test(password)) return "Le mot de passe doit contenir au moins un chiffre.";
    if (password !== confirmPassword) return "Les mots de passe ne correspondent pas.";
    if (!prenom.trim()) return "Le prénom est obligatoire.";
    if (!nom.trim()) return "Le nom est obligatoire.";
    if (!sexe) return "Veuillez sélectionner votre sexe.";
    if (!commune) return "Veuillez sélectionner votre commune.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        username: username.trim(),
        prenom: prenom.trim(),
        nom: nom.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
        sexe,
        commune,
        dateNaissance: dateNaissance || undefined,
      });
      router.push("/profil");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'inscription.";
      if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("already exists")) {
        setError("Cet email est déjà utilisé.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-surface pt-16">
      <AuthHeader />
      <div className="mx-auto mt-16 flex max-w-sm items-start justify-center px-4 md:max-w-md lg:max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-5 rounded-2xl bg-white p-8 shadow-sm"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Créer un compte</h1>
          <p className="mt-1 text-sm text-muted">
            Rejoignez la marketplace de confiance des Kinois.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setGoogleLoading(true);
            signInWithGoogle();
          }}
          disabled={googleLoading}
          className="flex items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-primary shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          S&apos;inscrire avec Google
        </button>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-border" />
          <span className="text-xs text-muted">OU</span>
          <hr className="flex-1 border-border" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-primary">
            Adresse email *
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3">
            <svg
              className="h-4 w-4 shrink-0 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="exemple@email.com"
              className="min-w-0 flex-1 text-sm text-muted outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="username"
            className="text-sm font-medium text-primary"
          >
            Nom d&apos;utilisateur *
            <span className="ml-1 text-xs text-muted font-normal">
              (3-30 caractères, lettres et chiffres)
            </span>
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3">
            <svg
              className="h-4 w-4 shrink-0 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
                checkUsername(e.target.value);
              }}
              placeholder="john_mpiana"
              maxLength={30}
              className="min-w-0 flex-1 text-sm text-muted outline-none"
            />
            {usernameChecking && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
            {usernameAvailable === true && username.length >= 3 && (
              <svg
                className="h-4 w-4 shrink-0 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {usernameAvailable === false && (
              <span className="shrink-0 text-xs text-danger">Déjà pris</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-primary"
          >
            Mot de passe *
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3">
            <svg
              className="h-4 w-4 shrink-0 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Au moins 8 caractères"
              className="min-w-0 flex-1 text-sm text-muted outline-none"
            />
          </div>
          {password.length > 0 && (
            <div className="mt-1 space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`}
                />
              </div>
              <p className="text-xs text-muted">{strength.label}</p>
            </div>
          )}
          <div className="rounded-xl bg-surface p-3 text-xs text-muted space-y-1">
            <p
              className={
                password.length >= 8 ? "text-green-600 font-medium" : ""
              }
            >
              ✓ Au moins 8 caractères
            </p>
            <p
              className={
                /[A-Z]/.test(password) ? "text-green-600 font-medium" : ""
              }
            >
              ✓ Au moins une majuscule
            </p>
            <p
              className={
                /[a-z]/.test(password) ? "text-green-600 font-medium" : ""
              }
            >
              ✓ Au moins une minuscule
            </p>
            <p
              className={
                /[0-9]/.test(password) ? "text-green-600 font-medium" : ""
              }
            >
              ✓ Au moins un chiffre
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-primary"
          >
            Confirmer le mot de passe *
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            placeholder="Répétez le mot de passe"
            className={`rounded-xl border px-4 py-3 text-sm text-muted ${
              confirmPassword && confirmPassword !== password
                ? "border-danger"
                : "border-border"
            }`}
          />
        </div>

        <hr className="border-border" />

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label
              htmlFor="prenom"
              className="text-sm font-medium text-primary"
            >
              Prénom *
            </label>
            <input
              id="prenom"
              type="text"
              maxLength={100}
              value={prenom}
              onChange={(e) => {
                setPrenom(e.target.value);
                setError("");
              }}
              placeholder="Jean"
              className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="nom" className="text-sm font-medium text-primary">
            Nom *
          </label>
          <input
            id="nom"
            type="text"
            maxLength={100}
            value={nom}
            onChange={(e) => {
              setNom(e.target.value);
              setError("");
            }}
            placeholder="Mpiana"
            className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Sexe *</label>
          <div className="flex gap-3">
            {["Homme", "Femme", "Autre"].map((s) => (
              <label
                key={s}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
                  sexe === s
                    ? "border-primary bg-primary/5 text-primary font-semibold"
                    : "border-border text-muted hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="sexe"
                  value={s}
                  checked={sexe === s}
                  onChange={(e) => {
                    setSexe(e.target.value);
                    setError("");
                  }}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="dateNaissance"
            className="text-sm font-medium text-primary"
          >
            Date de naissance{" "}
            <span className="text-muted font-normal">(optionnel)</span>
          </label>
          <input
            id="dateNaissance"
            type="date"
            value={dateNaissance}
            onChange={(e) => setDateNaissance(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="commune" className="text-sm font-medium text-primary">
            Commune de résidence *
          </label>
          <select
            id="commune"
            value={commune}
            onChange={(e) => {
              setCommune(e.target.value);
              setError("");
            }}
            className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
          >
            <option value="">Sélectionnez une commune</option>
            {communes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-primary">
            Numéro WhatsApp{" "}
            <span className="text-muted font-normal">(optionnel)</span>
          </label>
          <div className="flex items-stretch gap-0">
            <span className="flex items-center rounded-l-xl border border-r-0 border-border bg-zinc-50 px-3 text-sm text-muted">
              +243
            </span>
            <input
              id="phone"
              type="tel"
              value={whatsappNumber}
              onChange={(e) =>
                setWhatsappNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder="XX XXX XXXX"
              className="min-w-0 flex-1 rounded-r-xl border border-border px-4 py-3 text-sm text-muted"
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
          className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-primary transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />{" "}
              Inscription...
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>

        <p className="text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <a
            href="/auth/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Connectez-vous
          </a>
        </p>
      </form>
    </div>
    </div>
  );
}

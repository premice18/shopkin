"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ID } from "appwrite";
import { account } from "@/lib/appwrite";
import AuthOtpStep from "@/components/auth/AuthOtpStep";

type Step = "form" | "otp" | "password";

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
  const [step, setStep] = useState<Step>("form");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [phoneFull, setPhoneFull] = useState("");
  const [userId, setUserId] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [sexe, setSexe] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [commune, setCommune] = useState("");
  const [acceptCgv, setAcceptCgv] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handlePhoneChange = (v: string) => {
    setPhoneDigits(v);
    setError("");
    if (v.length > 0 && v.length < 9) {
      setPhoneError("Minimum 9 chiffres");
    } else {
      setPhoneError("");
    }
  };

  const validate = (): string | null => {
    if (phoneDigits.length < 9) return "Le numéro doit contenir au moins 9 chiffres.";
    if (!prenom.trim()) return "Le prénom est obligatoire.";
    if (!nom.trim()) return "Le nom est obligatoire.";
    if (!sexe) return "Veuillez sélectionner votre sexe.";
    if (!commune) return "Veuillez sélectionner votre commune.";
    if (!acceptCgv) return "Veuillez accepter les conditions d'utilisation.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    const formatted = `+243${phoneDigits}`;

    try {
      const res = await fetch("/api/auth/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatted }),
      });
      const data = await res.json();

      if (data.exists) {
        router.push(`/auth/login?phone=${encodeURIComponent(phoneDigits)}`);
        return;
      }

      const uid = ID.unique();
      await account.createPhoneToken({ userId: uid, phone: formatted });
      setUserId(uid);
      setPhoneFull(formatted);
      setStep("otp");
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    setStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (password !== confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }

    setLoading(true);

    try {
      const { databases } = await import("@/lib/appwrite");
      const { DATABASE_ID, PROFILES_COLLECTION_ID } = await import("@/lib/constants");
      await databases.updateDocument(DATABASE_ID, PROFILES_COLLECTION_ID, userId, {
        prenom: prenom.trim(),
        nom: nom.trim(),
        full_name: `${prenom.trim()} ${nom.trim()}`,
        sexe,
        date_naissance: dateNaissance || "",
        commune_defaut: commune,
      });

      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, phone: phoneFull, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création du mot de passe");
      }

      router.push("/profil");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors de l'enregistrement.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  if (step === "otp") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <AuthOtpStep
          phoneFull={phoneFull}
          userId={userId}
          isRegistration={true}
          onSuccess={handleOtpSuccess}
          onBack={() => { setStep("form"); setError(""); }}
        />
      </div>
    );
  }

  if (step === "password") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <form onSubmit={handlePasswordSubmit} className="flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">
              Sécurisez votre compte
            </h1>
            <p className="mt-1 text-sm text-muted">
              Créez un mot de passe pour vous connecter plus tard sans SMS.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-primary">
              Mot de passe *
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Au moins 8 caractères"
              className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
              autoFocus
            />
            {password.length > 0 && (
              <div className="mt-1 space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                </div>
                <p className="text-xs text-muted">{strength.label}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-primary">
              Confirmer le mot de passe *
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              placeholder="Répétez le mot de passe"
              className={`rounded-xl border px-4 py-3 text-sm text-muted ${
                confirmPassword && confirmPassword !== password ? "border-danger" : "border-border"
              }`}
            />
          </div>

          <div className="rounded-xl bg-surface p-3 text-xs text-muted space-y-1" role="list">
            <p className={password.length >= 8 ? "text-green-600 font-medium" : ""} role="listitem">
              ✓ Au moins 8 caractères
            </p>
            <p className={/[A-Z]/.test(password) ? "text-green-600 font-medium" : ""} role="listitem">
              ✓ Au moins une majuscule
            </p>
            <p className={/[a-z]/.test(password) ? "text-green-600 font-medium" : ""} role="listitem">
              ✓ Au moins une minuscule
            </p>
            <p className={/[0-9]/.test(password) ? "text-green-600 font-medium" : ""} role="listitem">
              ✓ Au moins un chiffre
            </p>
          </div>

          {error && <p className="text-center text-sm text-danger" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-primary transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Finalisation...
              </>
            ) : (
              "Terminer l'inscription"
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">
            Créer un compte
          </h1>
          <p className="mt-1 text-sm text-muted">
            Rejoignez la marketplace de confiance des Kinois.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone-input" className="text-sm font-medium text-primary">
            Numéro de téléphone *
          </label>
          <div className="flex items-stretch gap-0">
            <span className="flex items-center rounded-l-xl border border-r-0 border-border bg-zinc-50 px-3 text-sm text-muted">
              +243
            </span>
            <input
              id="phone-input"
              type="tel"
              placeholder="XX XXX XXXX"
              value={phoneDigits}
              onChange={(e) => handlePhoneChange(e.target.value.replace(/\D/g, ""))}
              aria-invalid={!!phoneError || undefined}
              aria-describedby={phoneError ? "phone-error-reg" : undefined}
              className={`min-w-0 flex-1 rounded-r-xl border px-4 py-3 text-sm text-muted ${
                phoneError ? "border-danger" : "border-border"
              }`}
            />
          </div>
          {phoneError && (
            <p id="phone-error-reg" role="alert" className="text-sm text-danger">{phoneError}</p>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="prenom" className="text-sm font-medium text-primary">
              Prénom *
            </label>
            <input
              id="prenom"
              type="text"
              maxLength={100}
              value={prenom}
              onChange={(e) => { setPrenom(e.target.value); setError(""); }}
              placeholder="Jean"
              className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
            />
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
              onChange={(e) => { setNom(e.target.value); setError(""); }}
              placeholder="Mpiana"
              className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">
            Sexe *
          </label>
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
                  onChange={(e) => { setSexe(e.target.value); setError(""); }}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dateNaissance" className="text-sm font-medium text-primary">
            Date de naissance <span className="text-muted font-normal">(optionnel)</span>
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
            onChange={(e) => { setCommune(e.target.value); setError(""); }}
            className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
          >
            <option value="">Sélectionnez une commune</option>
            {communes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptCgv}
            onChange={(e) => { setAcceptCgv(e.target.checked); setError(""); }}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary"
          />
          <span className="text-sm text-muted leading-relaxed">
            J&apos;accepte les{" "}
            <a href="/cgu" className="text-blue-600 font-semibold hover:underline" target="_blank">
              conditions d&apos;utilisation
            </a>{" "}
            de ShopKin.
          </span>
        </label>

        {error && <p className="text-center text-sm text-danger" role="alert">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-primary transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Création du compte...
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>

        <p className="text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <a href="/auth/login" className="text-blue-600 font-semibold hover:underline">
            Connectez-vous
          </a>
        </p>
      </form>
    </div>
  );
}

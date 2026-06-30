"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import AuthOtpStep from "@/components/auth/AuthOtpStep";

type Tab = "phone" | "password";
type Step = "phone" | "otp";

function LoginForm() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") || "";
  const [tab, setTab] = useState<Tab>(initialPhone ? "phone" : "phone");
  const [step, setStep] = useState<Step>(initialPhone ? "otp" : "phone");
  const [phoneDigits, setPhoneDigits] = useState(initialPhone);
  const [phoneFull, setPhoneFull] = useState("");
  const [userId, setUserId] = useState("");
  const [existingName, setExistingName] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const router = useRouter();

  // --- OTP tab ---

  const validatePhone = (digits: string): string | null => {
    if (digits.length < 9) return "Le numéro doit contenir au moins 9 chiffres.";
    return null;
  };

  const handlePhoneChange = (v: string) => {
    setPhoneDigits(v);
    setError("");
    if (v.length > 0 && v.length < 9) {
      setPhoneError("Minimum 9 chiffres");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validationError = validatePhone(phoneDigits);
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

      if (!data.exists) {
        router.push(`/auth/register?phone=${encodeURIComponent(phoneDigits)}`);
        return;
      }

      await account.createPhoneToken({ userId: data.userId, phone: formatted });
      setUserId(data.userId);
      setPhoneFull(formatted);
      setExistingName(data.name || "");
      setStep("otp");
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    router.push("/profil");
  };

  // --- Password tab ---

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const phoneError = validatePhone(phoneDigits);
    if (phoneError) { setError(phoneError); return; }
    if (!loginPassword) { setError("Veuillez entrer votre mot de passe."); return; }

    setLoading(true);
    const formatted = `+243${phoneDigits}`;
    const syntheticEmail = `${formatted.replace("+", "")}@shopkin.app`;

    try {
      await account.createEmailPasswordSession({ email: syntheticEmail, password: loginPassword });
      router.push("/profil");
    } catch {
      setError("Numéro ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  // --- Shared ---

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setError("");
    setStep("phone");
    setLoginPassword("");
  };

  // --- Render OTP ---

  if (step === "otp") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <AuthOtpStep
          phoneFull={phoneFull}
          userId={userId}
          isRegistration={false}
          onSuccess={handleOtpSuccess}
          onBack={() => { setStep("phone"); setError(""); setPhoneDigits(""); }}
          existingName={existingName}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">
            Connexion
          </h1>
          <p className="mt-1 text-sm text-muted">
            Connectez-vous à votre compte ShopKin.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-surface p-1">
          <button
            type="button"
            onClick={() => switchTab("phone")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === "phone" ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary"
            }`}
          >
            Téléphone (SMS)
          </button>
          <button
            type="button"
            onClick={() => switchTab("password")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === "password" ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary"
            }`}
          >
            Mot de passe
          </button>
        </div>

        {tab === "phone" ? (
          <form onSubmit={handleSubmitPhone} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone-input" className="text-sm font-medium text-primary">
                Numéro de téléphone
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
                  aria-describedby={phoneError ? "phone-error" : undefined}
                  className={`min-w-0 flex-1 rounded-r-xl border px-4 py-3 text-sm text-muted ${
                    phoneError ? "border-danger" : "border-border"
                  }`}
                />
              </div>
              {phoneError && (
                <p id="phone-error" role="alert" className="text-sm text-danger">{phoneError}</p>
              )}
            </div>

            {error && <p className="text-center text-sm text-danger" role="alert">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Envoi...
                </>
              ) : (
                "Recevoir un code OTP"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone-input-pw" className="text-sm font-medium text-primary">
                Numéro de téléphone
              </label>
              <div className="flex items-stretch gap-0">
                <span className="flex items-center rounded-l-xl border border-r-0 border-border bg-zinc-50 px-3 text-sm text-muted">
                  +243
                </span>
                <input
                  id="phone-input-pw"
                  type="tel"
                  placeholder="XX XXX XXXX"
                  value={phoneDigits}
                  onChange={(e) => handlePhoneChange(e.target.value.replace(/\D/g, ""))}
                  aria-invalid={!!phoneError || undefined}
                  aria-describedby={phoneError ? "phone-error-pw" : undefined}
                  className={`min-w-0 flex-1 rounded-r-xl border px-4 py-3 text-sm text-muted ${
                    phoneError ? "border-danger" : "border-border"
                  }`}
                />
              </div>
              {phoneError && (
                <p id="phone-error-pw" role="alert" className="text-sm text-danger">{phoneError}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-primary">
                Mot de passe
              </label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => { setLoginPassword(e.target.value); setError(""); }}
                placeholder="Entrez votre mot de passe"
                className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
              />
            </div>

            {error && <p className="text-center text-sm text-danger" role="alert">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <a href="/auth/register" className="text-blue-600 font-semibold hover:underline">
            Créez-en un
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

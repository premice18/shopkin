"use client";

import { useState, useEffect, useRef } from "react";
import { account } from "@/lib/appwrite";
import { ensureProfile } from "@/lib/profile";

interface AuthOtpStepProps {
  phoneFull: string;
  userId: string;
  isRegistration: boolean;
  onSuccess: () => void;
  onBack: () => void;
  existingName?: string;
}

export default function AuthOtpStep({
  phoneFull,
  userId,
  isRegistration,
  onSuccess,
  onBack,
  existingName,
}: AuthOtpStepProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpBlocked, setOtpBlocked] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [shake, setShake] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      intervalRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await account.createSession({ userId, secret: otp });
      await ensureProfile(userId, phoneFull);
      onSuccess();
    } catch {
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);
      if (newAttempts >= 3) {
        setOtpBlocked(true);
        setError("Trop de tentatives. Veuillez renvoyer un nouveau code.");
      } else {
        setError("Code incorrect. Veuillez réessayer.");
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setLoading(true);
    setOtpAttempts(0);
    setOtpBlocked(false);
    setOtp("");

    try {
      await account.createPhoneToken({ userId, phone: phoneFull });
      setResendCooldown(30);
    } catch {
      setError("Échec d'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-center text-2xl font-bold text-primary">
        {isRegistration ? "Inscription" : "Connexion"}
      </h1>
      <p className="text-center text-sm text-muted">
        {isRegistration
          ? "Créez votre compte. Un code a été envoyé à votre numéro."
          : `Bon retour${existingName ? `, ${existingName}` : ""}. Entrez le code reçu par SMS.`}
      </p>

      <label htmlFor="otp-input" className="sr-only">Code OTP</label>
      <input
        id="otp-input"
        type="text"
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        placeholder="0000"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
        disabled={otpBlocked}
        aria-invalid={!!error}
        aria-describedby={error ? "otp-error" : undefined}
        className={`rounded-xl border px-4 py-3 text-center text-lg tracking-[0.5em] text-muted ${
          shake ? "animate-shake border-danger" : "border-border"
        }`}
        autoFocus
      />

      {error && <p id="otp-error" className="text-center text-sm text-danger" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={otp.length !== 4 || loading || otpBlocked}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {isRegistration ? "Inscription..." : "Connexion..."}
          </>
        ) : (
          (isRegistration ? "Créer mon compte" : "Se connecter")
        )}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resendCooldown > 0 || loading}
        className="text-sm text-muted underline transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
      >
        {resendCooldown > 0
          ? `Renvoyer l'OTP (${resendCooldown}s)`
          : "Renvoyer l'OTP"}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-muted underline hover:text-primary"
      >
        Modifier le numéro
      </button>
    </form>
  );
}

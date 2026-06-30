"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/profile";
import { useToast } from "@/lib/contexts/ToastContext";
import Link from "next/link";

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [mPesa, setMPesa] = useState("");
  const [airtelMoney, setAirtelMoney] = useState("");
  const [orangeMoney, setOrangeMoney] = useState("");
  const [mPesaRegistered, setMPesaRegistered] = useState(false);
  const [airtelRegistered, setAirtelRegistered] = useState(false);
  const [orangeRegistered, setOrangeRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/phone");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getProfile(user.$id)
        .then((p) => {
          if (p) {
            setFullName((p.full_name as string) || "");
            setMPesa((p.m_pesa_number as string) || "");
            setAirtelMoney((p.airtel_money_number as string) || "");
            setOrangeMoney((p.orange_money_number as string) || "");
            setMPesaRegistered((p.m_pesa_registered as boolean) || false);
            setAirtelRegistered((p.airtel_money_registered as boolean) || false);
            setOrangeRegistered((p.orange_money_registered as boolean) || false);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let valid = true;

    if (!fullName.trim()) {
      errors.fullName = "Le nom réel est obligatoire pour les transactions.";
      valid = false;
    }

    if (mPesaRegistered && !mPesa.trim()) {
      errors.mPesa = "Veuillez saisir un numéro M-Pesa ou décocher la case.";
      valid = false;
    }

    if (airtelRegistered && !airtelMoney.trim()) {
      errors.airtelMoney = "Veuillez saisir un numéro Airtel Money ou décocher la case.";
      valid = false;
    }

    if (orangeRegistered && !orangeMoney.trim()) {
      errors.orangeMoney = "Veuillez saisir un numéro Orange Money ou décocher la case.";
      valid = false;
    }

    setFieldErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) return;

    setSaving(true);

    try {
      await updateProfile(user.$id, {
        full_name: fullName.trim(),
        m_pesa_number: mPesa,
        airtel_money_number: airtelMoney,
        orange_money_number: orangeMoney,
        m_pesa_registered: mPesaRegistered,
        airtel_money_registered: airtelRegistered,
        orange_money_registered: orangeRegistered,
      });
      showToast("success", "Wallet mis à jour.");
    } catch {
      showToast("error", "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm">
          <div className="mx-auto h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-200" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-200" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center gap-4 bg-primary px-6 py-4">
        <Link href="/profil" className="text-white/70 hover:text-white" aria-label="Retour au profil">
          &larr;
        </Link>
        <h1 className="text-lg font-bold text-white">Configuration Wallet</h1>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Nom complet */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-primary">
              Nom réel
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setFieldErrors((prev) => ({ ...prev, fullName: "" })); }}
              aria-invalid={!!fieldErrors.fullName}
              aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
              className={`rounded-xl border px-4 py-3 text-sm text-muted ${
                fieldErrors.fullName ? "border-danger" : "border-border"
              }`}
            />
            {fieldErrors.fullName && (
              <p id="fullName-error" role="alert" className="text-sm text-danger">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* Wallet Mobile Money */}
          <fieldset className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <legend className="text-sm font-semibold text-primary">
              Numéros Mobile Money
            </legend>

            {/* M-Pesa */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <label htmlFor="mPesaRegistered" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="mPesaRegistered"
                    type="checkbox"
                    checked={mPesaRegistered}
                    onChange={(e) => setMPesaRegistered(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-muted">M-Pesa</span>
                </label>
              </div>
              {mPesaRegistered && (
                <>
                  <input
                    type="tel"
                    placeholder="+243 XXX XXX XXX"
                    value={mPesa}
                    onChange={(e) => { setMPesa(e.target.value); setFieldErrors((prev) => ({ ...prev, mPesa: "" })); }}
                    aria-invalid={!!fieldErrors.mPesa}
                    className={`rounded-xl border px-4 py-3 text-sm text-muted ${
                      fieldErrors.mPesa ? "border-danger" : "border-border"
                    }`}
                  />
                  {fieldErrors.mPesa && (
                    <p role="alert" className="text-sm text-danger">{fieldErrors.mPesa}</p>
                  )}
                </>
              )}
            </div>

            {/* Airtel Money */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <label htmlFor="airtelRegistered" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="airtelRegistered"
                    type="checkbox"
                    checked={airtelRegistered}
                    onChange={(e) => setAirtelRegistered(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-muted">Airtel Money</span>
                </label>
              </div>
              {airtelRegistered && (
                <>
                  <input
                    type="tel"
                    placeholder="+243 XXX XXX XXX"
                    value={airtelMoney}
                    onChange={(e) => { setAirtelMoney(e.target.value); setFieldErrors((prev) => ({ ...prev, airtelMoney: "" })); }}
                    aria-invalid={!!fieldErrors.airtelMoney}
                    className={`rounded-xl border px-4 py-3 text-sm text-muted ${
                      fieldErrors.airtelMoney ? "border-danger" : "border-border"
                    }`}
                  />
                  {fieldErrors.airtelMoney && (
                    <p role="alert" className="text-sm text-danger">{fieldErrors.airtelMoney}</p>
                  )}
                </>
              )}
            </div>

            {/* Orange Money */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <label htmlFor="orangeRegistered" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="orangeRegistered"
                    type="checkbox"
                    checked={orangeRegistered}
                    onChange={(e) => setOrangeRegistered(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-muted">Orange Money</span>
                </label>
              </div>
              {orangeRegistered && (
                <>
                  <input
                    type="tel"
                    placeholder="+243 XXX XXX XXX"
                    value={orangeMoney}
                    onChange={(e) => { setOrangeMoney(e.target.value); setFieldErrors((prev) => ({ ...prev, orangeMoney: "" })); }}
                    aria-invalid={!!fieldErrors.orangeMoney}
                    className={`rounded-xl border px-4 py-3 text-sm text-muted ${
                      fieldErrors.orangeMoney ? "border-danger" : "border-border"
                    }`}
                  />
                  {fieldErrors.orangeMoney && (
                    <p role="alert" className="text-sm text-danger">{fieldErrors.orangeMoney}</p>
                  )}
                </>
              )}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

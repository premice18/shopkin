"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Wallet, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/profile";
import { useToast } from "@/lib/contexts/ToastContext";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

// Configuration des opérateurs Mobile Money avec leurs couleurs de marque
const OPERATEURS = [
  { id: "m_pesa", nom: "M-Pesa", couleur: "bg-green-500", numero: "m_pesa_number", registered: "m_pesa_registered" as const },
  { id: "airtel_money", nom: "Airtel Money", couleur: "bg-red-500", numero: "airtel_money_number", registered: "airtel_money_registered" as const },
  { id: "orange_money", nom: "Orange Money", couleur: "bg-orange-500", numero: "orange_money_number", registered: "orange_money_registered" as const },
] as const;

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const { success, error } = useToast();
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
      router.push("/auth/login");
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
      errors.mPesa = "Saisis un numéro M-Pesa ou décoche la case.";
      valid = false;
    }
    if (airtelRegistered && !airtelMoney.trim()) {
      errors.airtelMoney = "Saisis un numéro Airtel Money ou décoche la case.";
      valid = false;
    }
    if (orangeRegistered && !orangeMoney.trim()) {
      errors.orangeMoney = "Saisis un numéro Orange Money ou décoche la case.";
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
      success("Préférences de paiement enregistrées.");
    } catch {
      error("Erreur lors de l'enregistrement. Réessaie.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/profil"
            className="flex items-center justify-center rounded-full p-1 text-white/70 transition hover:text-white"
            aria-label="Retour au profil"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Logo light />
          <span className="text-sm font-medium text-white/60">Configuration Wallet</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Carte : Nom réel */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <h1 className="text-lg font-bold text-primary">Wallet Mobile Money</h1>
                <p className="text-xs text-muted">Configure tes comptes pour recevoir des paiements</p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="text-sm font-medium text-primary">
                  Nom réel <span className="text-danger">*</span>
                </label>
                <p className="text-xs text-muted mb-1">
                  Le nom qui apparaîtra sur les instructions de paiement.
                </p>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setFieldErrors((prev) => ({ ...prev, fullName: "" })); }}
                  aria-invalid={!!fieldErrors.fullName}
                  className={`rounded-xl border px-4 py-3 text-sm text-muted outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${
                    fieldErrors.fullName ? "border-danger" : "border-border"
                  }`}
                  placeholder="Ex: Jean Dupont"
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-danger">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Opérateurs Mobile Money */}
          <div className="grid gap-4">
            {OPERATEURS.map((op) => {
              const numero = op.id === "m_pesa" ? mPesa : op.id === "airtel_money" ? airtelMoney : orangeMoney;
              const setNumero = op.id === "m_pesa" ? setMPesa : op.id === "airtel_money" ? setAirtelMoney : setOrangeMoney;
              const isRegistered = op.id === "m_pesa" ? mPesaRegistered : op.id === "airtel_money" ? airtelRegistered : orangeRegistered;
              const setIsRegistered = op.id === "m_pesa" ? setMPesaRegistered : op.id === "airtel_money" ? setAirtelRegistered : setOrangeRegistered;
              const errorKey = op.id === "m_pesa" ? "mPesa" : op.id === "airtel_money" ? "airtelMoney" : "orangeMoney";
              const errorMsg = fieldErrors[errorKey];

              return (
                <div key={op.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
                  {/* En-tête de l'opérateur avec checkbox */}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${op.couleur}`} />
                      <span className="font-semibold text-primary">{op.nom}</span>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={isRegistered}
                        onChange={(e) => setIsRegistered(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="h-6 w-11 rounded-full border border-border bg-zinc-100 transition peer-checked:bg-green-500 peer-checked:border-green-500" />
                      <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                    </label>
                  </div>

                  {/* Champ numéro (visible seulement si coché) */}
                  {isRegistered && (
                    <div className="border-t border-border px-6 py-4">
                      <label className="text-xs font-medium text-muted">Numéro {op.nom}</label>
                      <div className="mt-1 flex items-stretch">
                        <span className="flex items-center rounded-l-xl border border-r-0 border-border bg-zinc-50 px-3 text-sm text-muted">
                          +243
                        </span>
                        <input
                          type="tel"
                          placeholder="XX XXX XXXX"
                          value={numero}
                          onChange={(e) => { setNumero(e.target.value); setFieldErrors((prev) => ({ ...prev, [errorKey]: "" })); }}
                          aria-invalid={!!errorMsg}
                          className={`min-w-0 flex-1 rounded-r-xl border px-4 py-3 text-sm text-muted outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${
                            errorMsg ? "border-danger" : "border-border"
                          }`}
                        />
                      </div>
                      {errorMsg && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-danger">
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          {errorMsg}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bouton Enregistrer */}
          <div className="flex gap-3">
            <Link
              href="/profil"
              className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-medium text-muted transition hover:bg-zinc-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

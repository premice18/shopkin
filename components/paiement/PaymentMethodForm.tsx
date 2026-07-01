"use client";

import { useState, useEffect } from "react";
import type { PaymentMethodDocument, PaymentMethodType } from "@/lib/types";
import { MOBILE_MONEY_PROVIDERS, CARD_PROVIDERS } from "@/lib/payment-methods";

interface PaymentMethodFormProps {
  editingMethod: PaymentMethodDocument | null;
  existingPhones: string[];
  existingLastFours: string[];
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export interface FormData {
  type: PaymentMethodType;
  provider: string;
  label: string;
  phoneNumber: string;
  cardHolderName: string;
  cardLastFour: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  isDefault: boolean;
}

const currentYear = new Date().getFullYear();

export default function PaymentMethodForm({ editingMethod, existingPhones, existingLastFours, onSave, onCancel }: PaymentMethodFormProps) {
  const [type, setType] = useState<PaymentMethodType>("mobile_money");
  const [provider, setProvider] = useState("");
  const [label, setLabel] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardLastFour, setCardLastFour] = useState("");
  const [cardExpiryMonth, setCardExpiryMonth] = useState("");
  const [cardExpiryYear, setCardExpiryYear] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingMethod) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setType(editingMethod.type);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProvider(editingMethod.provider);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLabel(editingMethod.label || "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDefault(editingMethod.is_default || false);
      if (editingMethod.type === "mobile_money") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPhoneNumber(editingMethod.phone_number);
        setCardHolderName("");
        setCardLastFour("");
        setCardExpiryMonth("");
        setCardExpiryYear("");
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCardHolderName(editingMethod.card_holder_name || "");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCardLastFour(editingMethod.card_last_four || "");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCardExpiryMonth(String(editingMethod.card_expiry_month || ""));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCardExpiryYear(String(editingMethod.card_expiry_year || ""));
        setPhoneNumber("");
      }
    }
  }, [editingMethod]);

  const validate = (): string | null => {
    if (!provider) return "Veuillez sélectionner un opérateur ou réseau.";
    if (type === "mobile_money") {
      const cleaned = phoneNumber.replace(/\D/g, "");
      if (cleaned.length < 6) return "Le numéro doit contenir au moins 6 chiffres.";
      if (existingPhones.includes(cleaned) && (!editingMethod || editingMethod.phone_number !== cleaned)) {
        return "Ce numéro est déjà enregistré.";
      }
    } else {
      if (!cardHolderName.trim()) return "Le nom du titulaire est obligatoire.";
      if (!/^\d{4}$/.test(cardLastFour)) return "Les 4 derniers chiffres sont requis.";
      if (existingLastFours.includes(cardLastFour) && (!editingMethod || editingMethod.card_last_four !== cardLastFour)) {
        return "Cette carte est déjà enregistrée.";
      }
      const month = Number(cardExpiryMonth);
      const year = Number(cardExpiryYear);
      if (!month || month < 1 || month > 12) return "Mois d'expiration invalide (01-12).";
      if (!year || year < currentYear || year > currentYear + 20) return "Année d'expiration invalide.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({
        type,
        provider,
        label,
        phoneNumber: phoneNumber.replace(/\D/g, ""),
        cardHolderName: cardHolderName.trim(),
        cardLastFour,
        cardExpiryMonth,
        cardExpiryYear,
        isDefault,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p>
      )}

      {!editingMethod && (
        <div>
          <label className="mb-2 block text-sm font-medium text-primary">Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setType("mobile_money"); setProvider(""); }}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                type === "mobile_money"
                  ? "border-accent bg-accent text-primary"
                  : "border-border bg-white text-muted hover:border-accent"
              }`}
            >
              Mobile Money
            </button>
            <button
              type="button"
              onClick={() => { setType("card"); setProvider(""); }}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                type === "card"
                  ? "border-accent bg-accent text-primary"
                  : "border-border bg-white text-muted hover:border-accent"
              }`}
            >
              Carte bancaire
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-primary">
          {type === "mobile_money" ? "Opérateur" : "Réseau"}
        </label>
        <div className="flex flex-wrap gap-2">
          {(type === "mobile_money" ? MOBILE_MONEY_PROVIDERS : CARD_PROVIDERS).map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setProvider(p.value)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                provider === p.value
                  ? "border-accent bg-accent text-primary"
                  : "border-border bg-white text-muted hover:border-accent"
              }`}
            >
              <span className={`inline-block h-3 w-3 rounded-full ${p.color}`} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {type === "mobile_money" ? (
        <div>
          <label htmlFor="phoneNumber" className="mb-1.5 block text-sm font-medium text-primary">
            Numéro de téléphone <span className="text-danger">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">+243</span>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="81 XX XX XX"
              maxLength={9}
              required
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm"
            />
          </div>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="cardHolderName" className="mb-1.5 block text-sm font-medium text-primary">
              Nom du titulaire <span className="text-danger">*</span>
            </label>
            <input
              id="cardHolderName"
              type="text"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              placeholder="Jean M."
              maxLength={100}
              required
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="cardLastFour" className="mb-1.5 block text-sm font-medium text-primary">
              4 derniers chiffres <span className="text-danger">*</span>
            </label>
            <input
              id="cardLastFour"
              type="text"
              inputMode="numeric"
              value={cardLastFour}
              onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="4242"
              maxLength={4}
              required
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-mono"
            />
            <p className="mt-1 text-xs text-muted">Seuls les 4 derniers chiffres sont stockés. Aucun numéro complet n&apos;est enregistré.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="cardExpiryMonth" className="mb-1.5 block text-sm font-medium text-primary">
                Mois <span className="text-danger">*</span>
              </label>
              <input
                id="cardExpiryMonth"
                type="text"
                inputMode="numeric"
                value={cardExpiryMonth}
                onChange={(e) => setCardExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="MM"
                maxLength={2}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="cardExpiryYear" className="mb-1.5 block text-sm font-medium text-primary">
                Année <span className="text-danger">*</span>
              </label>
              <input
                id="cardExpiryYear"
                type="text"
                inputMode="numeric"
                value={cardExpiryYear}
                onChange={(e) => setCardExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="AAAA"
                maxLength={4}
                required
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label htmlFor="label" className="mb-1.5 block text-sm font-medium text-primary">
          Libellé <span className="text-muted font-normal">(optionnel)</span>
        </label>
        <input
          id="label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Compte perso Orange"
          maxLength={100}
          className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span className="text-sm text-muted">Définir comme moyen de paiement par défaut</span>
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted transition hover:bg-zinc-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {editingMethod ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}

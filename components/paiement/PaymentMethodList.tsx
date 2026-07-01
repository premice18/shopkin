"use client";

import type { PaymentMethodDocument } from "@/lib/types";
import { getProviderInfo, maskPhone, maskCard } from "@/lib/payment-methods";

interface PaymentMethodListProps {
  methods: PaymentMethodDocument[];
  onEdit: (method: PaymentMethodDocument) => void;
  onDelete: (method: PaymentMethodDocument) => void;
}

function ProviderIcon({ provider, className }: { provider: string; className?: string }) {
  const info = getProviderInfo(provider);
  const initials = info.label.slice(0, 2).toUpperCase();
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${info.color} ${className || ""}`}>
      {initials}
    </div>
  );
}

function PhoneDisplay({ phone }: { phone: string }) {
  const masked = maskPhone(phone);
  const visible = phone;
  return (
    <span className="font-mono text-sm text-muted" title={visible}>
      {masked}
    </span>
  );
}

function CardDisplay({ lastFour, holderName, expiryMonth, expiryYear }: {
  lastFour: string;
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
}) {
  return (
    <div className="text-sm text-muted">
      <span className="font-mono">{maskCard(lastFour)}</span>
      <br />
      <span>{holderName}</span>
      <span className="ml-2 text-xs">
        {String(expiryMonth).padStart(2, "0")}/{String(expiryYear).slice(-2)}
      </span>
    </div>
  );
}

export default function PaymentMethodList({ methods, onEdit, onDelete }: PaymentMethodListProps) {
  if (methods.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-muted">Aucun moyen de paiement enregistré.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const info = getProviderInfo(method.provider);
        return (
          <div
            key={method.$id}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <ProviderIcon provider={method.provider} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{info.label}</span>
                {method.label && (
                  <span className="truncate text-xs text-muted">— {method.label}</span>
                )}
                {method.is_default && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Par défaut
                  </span>
                )}
              </div>
              {method.type === "mobile_money" ? (
                <PhoneDisplay phone={method.phone_number} />
              ) : (
                <CardDisplay
                  lastFour={method.card_last_four}
                  holderName={method.card_holder_name}
                  expiryMonth={method.card_expiry_month}
                  expiryYear={method.card_expiry_year}
                />
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                onClick={() => onEdit(method)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-accent/20"
                aria-label={`Modifier ${info.label}`}
              >
                Modifier
              </button>
              <button
                onClick={() => onDelete(method)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10"
                aria-label={`Supprimer ${info.label}`}
              >
                Supprimer
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

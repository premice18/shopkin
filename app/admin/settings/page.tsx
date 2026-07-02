"use client";

import { useState, useEffect } from "react";
import { getAdminJWT } from "@/lib/admin";
import { useToast } from "@/lib/contexts/ToastContext";

export default function AdminSettingsPage() {
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    getAdminJWT()
      .then((jwt) =>
        fetch("/api/admin/settings", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
      )
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setRate(String((data.settings as { usd_cdf_rate?: number }).usd_cdf_rate || 2800));
        }
      })
      .catch(() => toastError("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [toastError]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = Number(rate);
    if (!rate || rateNum <= 0) {
      toastError("Veuillez entrer un taux valide");
      return;
    }

    setSaving(true);
    try {
      const jwt = await getAdminJWT();
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ usd_cdf_rate: rateNum }),
      });
      if (res.ok) {
        success("Taux de change mis à jour");
      } else {
        toastError("Erreur lors de l'enregistrement");
      }
    } catch {
      toastError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Paramètres</h1>
        <p className="mt-1 text-sm text-muted">Configuration globale de la plateforme</p>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSave} className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-lg font-bold text-primary">Taux de change USD/CDF</h2>
          <p className="mt-1 text-sm text-muted">
            Ce taux est utilisé pour afficher les prix en Francs Congolais sur le catalogue.
          </p>
          <div className="mt-4 flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="rate" className="text-sm font-medium text-primary">
                1 USD =
              </label>
              <input
                id="rate"
                type="number"
                min={1}
                step={1}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="2800"
              />
            </div>
            <span className="pb-2.5 text-sm text-muted">FC</span>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

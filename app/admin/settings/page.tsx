"use client";

import { useState, useEffect } from "react";
import { getAdminJWT } from "@/lib/admin";
import { useToast } from "@/lib/contexts/ToastContext";

interface Settings {
  usd_cdf_rate: number;
  max_images_per_annonce: number;
  platform_fee_percent: number;
  maintenance_mode: boolean;
  welcome_message: string;
  categories: string[];
}

const DEFAULT_SETTINGS: Settings = {
  usd_cdf_rate: 2800,
  max_images_per_annonce: 5,
  platform_fee_percent: 0,
  maintenance_mode: false,
  welcome_message: "Bienvenue sur ShopKin !",
  categories: ["Téléphones", "Électroménager", "Mode", "Véhicules", "Maison", "Enfants", "Autres"],
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();
  // Pour l'édition des catégories
  const [newCategory, setNewCategory] = useState("");

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
          const s = data.settings as Record<string, unknown>;
          setSettings({
            usd_cdf_rate: (s.usd_cdf_rate as number) || DEFAULT_SETTINGS.usd_cdf_rate,
            max_images_per_annonce: (s.max_images_per_annonce as number) ?? DEFAULT_SETTINGS.max_images_per_annonce,
            platform_fee_percent: (s.platform_fee_percent as number) ?? DEFAULT_SETTINGS.platform_fee_percent,
            maintenance_mode: (s.maintenance_mode as boolean) || DEFAULT_SETTINGS.maintenance_mode,
            welcome_message: (s.welcome_message as string) || DEFAULT_SETTINGS.welcome_message,
            categories: (s.categories as string[]) || DEFAULT_SETTINGS.categories,
          });
        }
      })
      .catch(() => toastError("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [toastError]);

  const updateField = (field: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const addCategory = () => {
    const cat = newCategory.trim();
    if (!cat || settings.categories.includes(cat)) return;
    updateField("categories", [...settings.categories, cat]);
    setNewCategory("");
  };

  const removeCategory = (index: number) => {
    const updated = settings.categories.filter((_, i) => i !== index);
    updateField("categories", updated);
  };

  const saveSettings = async (field: string, value: unknown) => {
    setSaving(true);
    try {
      const jwt = await getAdminJWT();
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        success("Paramètre mis à jour");
      } else {
        const data = await res.json();
        toastError(data.error || "Erreur lors de l'enregistrement");
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

      {/* Taux de change */}
      <div className="max-w-xl">
        <SettingsCard title="Taux de change USD/CDF" desc="Utilisé pour afficher les prix en Francs Congolais sur le catalogue.">
          <div className="mt-4 flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="rate" className="text-sm font-medium text-primary">1 USD =</label>
              <input
                id="rate"
                type="number"
                min={1}
                step={1}
                value={settings.usd_cdf_rate}
                onChange={(e) => updateField("usd_cdf_rate", Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="2800"
              />
            </div>
            <span className="pb-2.5 text-sm text-muted">FC</span>
            <button
              onClick={() => saveSettings("usd_cdf_rate", settings.usd_cdf_rate)}
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "..." : "Enregistrer"}
            </button>
          </div>
        </SettingsCard>
      </div>

      {/* Images max par annonce */}
      <div className="max-w-xl">
        <SettingsCard title="Images par annonce" desc="Nombre maximum d'images autorisé par annonce.">
          <div className="mt-4 flex items-end gap-3">
            <div className="w-32">
              <input
                id="maxImages"
                type="number"
                min={1}
                max={20}
                value={settings.max_images_per_annonce}
                onChange={(e) => updateField("max_images_per_annonce", Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={() => saveSettings("max_images_per_annonce", settings.max_images_per_annonce)}
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "..." : "Enregistrer"}
            </button>
          </div>
        </SettingsCard>
      </div>

      {/* Frais de plateforme */}
      <div className="max-w-xl">
        <SettingsCard title="Frais de plateforme" desc="Commission prélevée sur les transactions futures (en %). 0 = pas de commission.">
          <div className="mt-4 flex items-end gap-3">
            <div className="w-32">
              <input
                id="fee"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={settings.platform_fee_percent}
                onChange={(e) => updateField("platform_fee_percent", Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <span className="pb-2.5 text-sm text-muted">%</span>
            <button
              onClick={() => saveSettings("platform_fee_percent", settings.platform_fee_percent)}
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "..." : "Enregistrer"}
            </button>
          </div>
        </SettingsCard>
      </div>

      {/* Message de bienvenue */}
      <div className="max-w-xl">
        <SettingsCard title="Message de bienvenue" desc="Message affiché en haut du catalogue pour les visiteurs.">
          <div className="mt-4 flex items-end gap-3">
            <div className="flex-1">
              <input
                id="welcomeMsg"
                type="text"
                value={settings.welcome_message}
                onChange={(e) => updateField("welcome_message", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Bienvenue sur ShopKin !"
              />
            </div>
            <button
              onClick={() => saveSettings("welcome_message", settings.welcome_message)}
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "..." : "Enregistrer"}
            </button>
          </div>
        </SettingsCard>
      </div>

      {/* Mode maintenance */}
      <div className="max-w-xl">
        <SettingsCard title="Mode maintenance" desc="Activer pour afficher une page de maintenance aux visiteurs.">
          <div className="mt-4 flex items-center gap-4">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => {
                  const val = e.target.checked;
                  updateField("maintenance_mode", val);
                  saveSettings("maintenance_mode", val);
                }}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-accent peer-checked:after:translate-x-full" />
            </label>
            <span className={`text-sm font-medium ${settings.maintenance_mode ? "text-danger" : "text-muted"}`}>
              {settings.maintenance_mode ? "Activé" : "Désactivé"}
            </span>
          </div>
        </SettingsCard>
      </div>

      {/* Catégories */}
      <div className="max-w-xl">
        <SettingsCard title="Catégories d'annonces" desc="Gérez les catégories disponibles pour les annonces.">
          <div className="mt-4 flex flex-wrap gap-2">
            {settings.categories.map((cat, i) => (
              <span
                key={cat + i}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-sm"
              >
                {cat}
                <button
                  onClick={() => removeCategory(i)}
                  className="ml-1 text-muted hover:text-danger transition"
                  aria-label={`Supprimer ${cat}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }}
              className="flex-1 rounded-xl border border-border px-4 py-2 text-sm outline-none focus:border-primary"
              placeholder="Nouvelle catégorie"
            />
            <button
              onClick={() => {
                addCategory();
                saveSettings("categories", [...settings.categories]);
              }}
              disabled={saving || !newCategory.trim()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

// Composant interne pour uniformiser les cartes de paramètres
function SettingsCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h2 className="text-lg font-bold text-primary">{title}</h2>
      <p className="mt-1 text-sm text-muted">{desc}</p>
      {children}
    </div>
  );
}

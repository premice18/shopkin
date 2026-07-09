"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/profile";
import { useToast } from "@/lib/contexts/ToastContext";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

const communes = [
  "Gombe", "Kinshasa", "Lemba", "Ngaliema", "Kasa-Vubu",
  "Matete", "Limete", "Barumbu", "Bandalungwa", "Bumbu",
  "Kintambo", "Kisenso", "Lingwala", "Makala", "Maluku",
  "Masina", "Mont Ngafula", "Ndjili", "Ngaba", "Ngiri-Ngiri",
  "Nsele", "Selembao",
];

export default function EditProfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [sexe, setSexe] = useState("");
  const [commune, setCommune] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    getProfile(user.$id)
      .then((p) => {
        setPrenom((p?.prenom as string) || "");
        setNom((p?.nom as string) || "");
        setSexe((p?.sexe as string) || "");
        setCommune((p?.commune_defaut as string) || "");
        setDateNaissance((p?.date_naissance as string) || "");
        setWhatsappNumber((p?.whatsapp_number as string) || "");
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.$id, {
        prenom: prenom.trim(),
        nom: nom.trim(),
        full_name: `${prenom.trim()} ${nom.trim()}`,
        sexe,
        commune_defaut: commune,
        date_naissance: dateNaissance,
        whatsapp_number: whatsappNumber.replace(/\D/g, ""),
      });
      success("Profil mis à jour avec succès.");
      router.push("/profil");
    } catch {
      error("Erreur lors de la sauvegarde. Réessaie.");
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
          <Link href="/" aria-label="Accueil ShopKin"><Logo light /></Link>
          <span className="text-sm font-medium text-white/60">Modifier le profil</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          {/* En-tête du formulaire */}
          <div className="border-b border-border px-6 py-4">
            <h1 className="text-lg font-bold text-primary">Informations personnelles</h1>
            <p className="mt-1 text-sm text-muted">Mets à jour les informations de ton profil.</p>
          </div>

          <div className="space-y-5 p-6">
            {/* Prénom + Nom */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="prenom" className="text-sm font-medium text-primary">Prénom</label>
                <input
                  id="prenom"
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  maxLength={100}
                  className="rounded-xl border border-border px-4 py-3 text-sm text-muted outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  placeholder="Jean"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nom" className="text-sm font-medium text-primary">Nom</label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  maxLength={100}
                  className="rounded-xl border border-border px-4 py-3 text-sm text-muted outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  placeholder="Dupont"
                />
              </div>
            </div>

            {/* Sexe */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary">Sexe</label>
              <div className="flex gap-2">
                {["Homme", "Femme", "Autre"].map((s) => (
                  <label
                    key={s}
                    className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-medium transition ${
                      sexe === s
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sexe"
                      value={s}
                      checked={sexe === s}
                      onChange={(e) => setSexe(e.target.value)}
                      className="sr-only"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Commune */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="commune" className="text-sm font-medium text-primary">
                Commune de résidence
              </label>
              <select
                id="commune"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="rounded-xl border border-border px-4 py-3 text-sm text-muted outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Sélectionnez une commune</option>
                {communes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Date de naissance */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dateNaissance" className="text-sm font-medium text-primary">
                Date de naissance <span className="font-normal text-muted">(optionnel)</span>
              </label>
              <input
                id="dateNaissance"
                type="date"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="rounded-xl border border-border px-4 py-3 text-sm text-muted outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-primary">
                WhatsApp <span className="font-normal text-muted">(optionnel)</span>
              </label>
              <div className="flex items-stretch">
                <span className="flex items-center rounded-l-xl border border-r-0 border-border bg-zinc-50 px-3 text-sm text-muted">
                  +243
                </span>
                <input
                  id="phone"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="XX XXX XXXX"
                  className="min-w-0 flex-1 rounded-r-xl border border-border px-4 py-3 text-sm text-muted outline-none transition focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-2">
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
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

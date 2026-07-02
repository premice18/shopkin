"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/profile";
import { useToast } from "@/lib/contexts/ToastContext";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

const communes = [
  "Gombe","Kinshasa","Lemba","Ngaliema","Kasa-Vubu",
  "Matete","Limete","Barumbu","Bandalungwa","Bumbu",
  "Kintambo","Kisenso","Lingwala","Makala","Maluku",
  "Masina","Mont Ngafula","Ndjili","Ngaba","Ngiri-Ngiri",
  "Nsele","Selembao",
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
    if (!user) { router.push("/auth/login"); return; }
    getProfile(user.$id).then((p) => {
      setPrenom((p?.prenom as string) || "");
      setNom((p?.nom as string) || "");
      setSexe((p?.sexe as string) || "");
      setCommune((p?.commune_defaut as string) || "");
      setDateNaissance((p?.date_naissance as string) || "");
      setWhatsappNumber((p?.whatsapp_number as string) || "");
    }).finally(() => setLoading(false));
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
      success("💾 Profil mis à jour avec succès.");
      router.push("/profil");
    } catch {
      error("❌ Erreur lors de la sauvegarde. Réessaie.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3 lg:max-w-4xl">
          <Link href="/profil" className="text-white/70 hover:text-white" aria-label="Retour au profil">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <Link href="/" aria-label="Accueil ShopKin"><Logo className="[&>span]:!text-white" /></Link>
          <span className="text-sm font-semibold text-white/70">Modifier le profil</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-primary">Modifier mes informations</h1>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label htmlFor="prenom" className="text-sm font-medium text-primary">Prénom</label>
              <input
                id="prenom" type="text" value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                maxLength={100}
                className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label htmlFor="nom" className="text-sm font-medium text-primary">Nom</label>
              <input
                id="nom" type="text" value={nom}
                onChange={(e) => setNom(e.target.value)}
                maxLength={100}
                className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Sexe</label>
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
                    type="radio" name="sexe" value={s}
                    checked={sexe === s}
                    onChange={(e) => setSexe(e.target.value)}
                    className="sr-only"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="commune" className="text-sm font-medium text-primary">Commune de résidence</label>
            <select
              id="commune" value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
            >
              <option value="">Sélectionnez une commune</option>
              {communes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dateNaissance" className="text-sm font-medium text-primary">
              Date de naissance <span className="text-muted font-normal">(optionnel)</span>
            </label>
            <input
              id="dateNaissance" type="date" value={dateNaissance}
              onChange={(e) => setDateNaissance(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="rounded-xl border border-border px-4 py-3 text-sm text-muted"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-primary">
              WhatsApp <span className="text-muted font-normal">(optionnel)</span>
            </label>
            <div className="flex items-stretch gap-0">
              <span className="flex items-center rounded-l-xl border border-r-0 border-border bg-zinc-50 px-3 text-sm text-muted">
                +243
              </span>
              <input
                id="phone" type="tel" value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="XX XXX XXXX"
                className="min-w-0 flex-1 rounded-r-xl border border-border px-4 py-3 text-sm text-muted"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/profil"
              className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-medium text-muted transition hover:bg-zinc-50"
            >
              Annuler
            </Link>
            <button
              type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sauvegarde...
                </span>
              ) : "Enregistrer"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

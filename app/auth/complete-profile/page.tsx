"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, completeProfile, checkUsernameAvailability } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import AuthHeader from "@/components/layout/AuthHeader";

const communes = [
  "Gombe","Kinshasa","Lemba","Ngaliema","Kasa-Vubu",
  "Matete","Limete","Barumbu","Bandalungwa","Bumbu",
  "Kintambo","Kisenso","Lingwala","Makala","Maluku",
  "Masina","Mont Ngafula","Ndjili","Ngaba","Ngiri-Ngiri",
  "Nsele","Selembao",
];

export default function CompleteProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sexe, setSexe] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [commune, setCommune] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (!authLoading && user) {
      getProfile(user.$id).then((p) => {
        if (p?.profile_complete) {
          router.push("/profil");
          return;
        }
        setPrenom((p?.prenom as string) || "");
        setNom((p?.nom as string) || "");
        setWhatsappNumber((p?.whatsapp_number as string) || "");
      });
    }
  }, [user, authLoading, router]);

  const checkUsername = useCallback((value: string) => {
    const v = value.toLowerCase().trim();
    if (v.length < 3) { setUsernameAvailable(null); return; }
    if (!/^[a-z0-9]+$/.test(v)) { setUsernameAvailable(false); return; }
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
    usernameTimerRef.current = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const available = await checkUsernameAvailability(v);
        setUsernameAvailable(available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    }, 400);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) return;

    if (!username.trim() || username.trim().length < 3) {
      setError("Le nom d'utilisateur doit contenir au moins 3 caractères.");
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username.trim())) {
      setError("Lettres et chiffres uniquement.");
      return;
    }
    if (usernameAvailable === false) {
      setError("Ce nom d'utilisateur est déjà pris.");
      return;
    }
    if (!prenom.trim()) { setError("Le prénom est obligatoire."); return; }
    if (!nom.trim()) { setError("Le nom est obligatoire."); return; }
    if (!sexe) { setError("Veuillez sélectionner votre sexe."); return; }
    if (!whatsappNumber.trim()) { setError("Le numéro WhatsApp est obligatoire pour vendre sur ShopKin."); return; }
    if (!commune) { setError("Veuillez sélectionner votre commune."); return; }

    setLoading(true);
    try {
      await completeProfile({
        userId: user.$id,
        username: username.trim(),
        prenom: prenom.trim(),
        nom: nom.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
        sexe,
        commune,
        dateNaissance: dateNaissance || undefined,
      });
      router.push("/profil");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface pt-16 flex flex-col">
      <AuthHeader />
      <div className="mx-auto mt-0 flex flex-1 max-w-sm items-center justify-center px-4 md:max-w-md lg:max-w-lg">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5 rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Finalisez votre profil</h1>
          <p className="mt-1 text-sm text-muted">
            Plus que quelques informations pour profiter de ShopKin.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-sm font-medium text-primary">Nom d&apos;utilisateur *</label>
          <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3">
            <input
              id="username" type="text" value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); checkUsername(e.target.value); }}
              placeholder="john_mpiana"
              maxLength={30}
              className="min-w-0 flex-1 text-sm text-muted outline-none"
              autoFocus
            />
            {usernameChecking && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
            {usernameAvailable === true && username.length >= 3 && (
              <svg className="h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {usernameAvailable === false && <span className="shrink-0 text-xs text-danger">Déjà pris</span>}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="prenom" className="text-sm font-medium text-primary">Prénom *</label>
            <input id="prenom" type="text" value={prenom}
              onChange={(e) => { setPrenom(e.target.value); setError(""); }}
              placeholder="Jean" className="rounded-xl border border-border px-4 py-3 text-sm text-muted" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="nom" className="text-sm font-medium text-primary">Nom *</label>
            <input id="nom" type="text" value={nom}
              onChange={(e) => { setNom(e.target.value); setError(""); }}
              placeholder="Mpiana" className="rounded-xl border border-border px-4 py-3 text-sm text-muted" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="whatsapp" className="text-sm font-medium text-primary">Numéro WhatsApp *</label>
          <div className="flex items-stretch gap-0">
            <span className="flex items-center rounded-l-xl border border-r-0 border-border bg-zinc-50 px-3 text-sm text-muted">+243</span>
            <input id="whatsapp" type="tel" value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="XX XXX XXXX"
              className="min-w-0 flex-1 rounded-r-xl border border-border px-4 py-3 text-sm text-muted" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Sexe *</label>
          <div className="flex gap-3">
            {["Homme", "Femme", "Autre"].map((s) => (
              <label key={s} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
                sexe === s ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border text-muted hover:border-primary/40"
              }`}>
                <input type="radio" name="sexe" value={s} checked={sexe === s}
                  onChange={(e) => { setSexe(e.target.value); setError(""); }} className="sr-only" />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dateNaissance" className="text-sm font-medium text-primary">
            Date de naissance <span className="text-muted font-normal">(optionnel)</span>
          </label>
          <input id="dateNaissance" type="date" value={dateNaissance}
            onChange={(e) => setDateNaissance(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="rounded-xl border border-border px-4 py-3 text-sm text-muted" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="commune" className="text-sm font-medium text-primary">Commune de résidence *</label>
          <select id="commune" value={commune}
            onChange={(e) => { setCommune(e.target.value); setError(""); }}
            className="rounded-xl border border-border px-4 py-3 text-sm text-muted">
            <option value="">Sélectionnez une commune</option>
            {communes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {error && <p className="text-center text-sm text-danger" role="alert">{error}</p>}

        <button type="submit" disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-primary transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (
            <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> Enregistrement...</>
          ) : "Enregistrer"}
        </button>
      </form>
    </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { ID, Permission, Role } from "appwrite";
import { account, storage, tablesDB } from "@/lib/appwrite";
import { getProfile, updateProfile } from "@/lib/profile";
import { DATABASE_ID, AVATARS_BUCKET_ID, PROFILES_COLLECTION_ID } from "@/lib/constants";
import { getAvatarUrl } from "@/lib/images";
import { useToast } from "@/lib/contexts/ToastContext";
import { Camera, Save, Eye, EyeOff } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

export default function AdminProfilPage() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ $id: string; email: string } | null>(null);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  // Champs mot de passe
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    account
      .get()
      .then((u) => {
        if (cancelled) return;
        setUser({ $id: u.$id, email: u.email });
        return getProfile(u.$id);
      })
      .then((p) => {
        if (cancelled || !p) return;
        setPrenom((p.prenom as string) || "");
        setNom((p.nom as string) || "");
        setUsername((p.username as string) || "");
        setAvatarUrl(getAvatarUrl((p.avatar_url as string) || ""));
      })
      .catch(() => toastError("Erreur de chargement du profil"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toastError]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    try {
      const uploaded = await storage.createFile(AVATARS_BUCKET_ID, ID.unique(), file, [Permission.read(Role.any())]);
      setAvatarUrl(getAvatarUrl(uploaded.$id));
      await updateProfile(user.$id, { avatar_url: uploaded.$id });
      success("Avatar mis à jour !");
    } catch {
      toastError("Erreur lors de l'upload de l'avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      // Mise à jour du document profil
      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: PROFILES_COLLECTION_ID,
        rowId: user.$id,
        data: {
          prenom: prenom.trim(),
          nom: nom.trim(),
          full_name: `${prenom.trim()} ${nom.trim()}`,
          username: username.toLowerCase().trim(),
        },
      });

      // Mise à jour du mot de passe si fourni
      if (newPassword) {
        if (newPassword.length < 8) {
          toastError("Le mot de passe doit contenir au moins 8 caractères.");
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          toastError("Les mots de passe ne correspondent pas.");
          setSaving(false);
          return;
        }
        await account.updatePassword({ password: newPassword });
        setNewPassword("");
        setConfirmPassword("");
      }

      success("Profil administrateur mis à jour !");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la mise à jour.";
      toastError(msg);
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
        <h1 className="text-2xl font-bold text-primary">Mon Profil</h1>
        <p className="mt-1 text-sm text-muted">Modifier vos informations personnelles d&apos;administrateur</p>
      </div>

      <div className="max-w-xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-bold text-primary">Photo de profil</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative">
                <Avatar
                  src={avatarUrl}
                  alt={`${prenom} ${nom}`.trim() || "Admin"}
                  size={72}
                  fallbackName={`${prenom} ${nom}`.trim() || "A"}
                />
                {avatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted transition hover:bg-zinc-50">
                <Camera className="h-4 w-4" aria-hidden="true" />
                Changer la photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-bold text-primary">Informations personnelles</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="prenom" className="text-sm font-medium text-primary">Prénom</label>
                <input
                  id="prenom"
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                  maxLength={100}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nom" className="text-sm font-medium text-primary">Nom</label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                  maxLength={100}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-primary">
                Nom d&apos;utilisateur
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                maxLength={30}
              />
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-primary">Email</label>
              <p className="rounded-xl border border-border bg-zinc-50 px-4 py-2.5 text-sm text-muted">
                {user?.email || "—"}
              </p>
              <p className="text-xs text-muted/60">
                Pour changer d&apos;email, utilisez la page de connexion.
              </p>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-lg font-bold text-primary">Mot de passe</h2>
            <p className="mt-1 text-sm text-muted">Laissez vide pour ne pas modifier.</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="newPassword" className="text-sm font-medium text-primary">
                  Nouveau mot de passe
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="min-w-0 flex-1 text-sm outline-none"
                    placeholder="8 caractères min"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="shrink-0 text-muted hover:text-primary"
                    aria-label={showNewPassword ? "Masquer" : "Afficher"}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-primary">
                  Confirmer le mot de passe
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="min-w-0 flex-1 text-sm outline-none"
                    placeholder="Répétez le mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="shrink-0 text-muted hover:text-primary"
                    aria-label={showConfirm ? "Masquer" : "Afficher"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
}

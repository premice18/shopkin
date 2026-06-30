"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Query } from "appwrite";
import { useAuth } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/profile";
import { databases } from "@/lib/appwrite";
import { DATABASE_ID, ANNONCES_COLLECTION_ID } from "@/lib/constants";
import type { AnnonceDocument } from "@/lib/types";
import { useAppwrite, formaterPrix } from "@/lib/contexts/AppwriteContext";
import { useToast } from "@/lib/contexts/ToastContext";
import Modal from "@/components/ui/Modal";
import Link from "next/link";

type Mode = "achats" | "ventes";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export default function ProfilPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { usdCdfRate } = useAppwrite();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>("achats");
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [mesAnnonces, setMesAnnonces] = useState<AnnonceDocument[]>([]);
  const [annoncesLoaded, setAnnoncesLoaded] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/phone");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getProfile(user.$id).then((p) => {
        setProfile(p);
        setEditName((p?.full_name as string) || "");
      });
    }
  }, [user]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const fetchMesAnnonces = useCallback(async () => {
    if (!user) return;
    try {
      const res = await databases.listDocuments(DATABASE_ID, ANNONCES_COLLECTION_ID, [
        Query.equal("vendeur_id", user.$id),
        Query.orderDesc("$createdAt"),
      ]);
      setMesAnnonces(res.documents as unknown as AnnonceDocument[]);
    } catch {
      setMesAnnonces([]);
    } finally {
      setAnnoncesLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (mode === "ventes")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMesAnnonces();
  }, [mode, fetchMesAnnonces]);

  const handleEditStart = () => {
    setEditName((profile?.full_name as string) || "");
    setEditing(true);
  };

  const handleEditSave = async () => {
    if (!user || !editName.trim()) return;
    setEditLoading(true);
    try {
      await updateProfile(user.$id, { full_name: editName.trim() });
      setProfile((prev) => ({ ...prev, full_name: editName.trim() }));
      setEditing(false);
      showToast("success", "Nom mis à jour.");
    } catch {
      showToast("error", "Erreur lors de la mise à jour.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditing(false);
    setEditName((profile?.full_name as string) || "");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleEditSave();
    else if (e.key === "Escape") handleEditCancel();
  };

  const updateStatus = async (annonceId: string, status: string) => {
    setUpdatingId(annonceId);
    try {
      await databases.updateDocument(DATABASE_ID, ANNONCES_COLLECTION_ID, annonceId, { status });
      setMesAnnonces((prev) =>
        prev.map((a) => (a.$id === annonceId ? { ...a, status: status as AnnonceDocument["status"] } : a)),
      );
      showToast("success", "Statut mis à jour.");
    } catch {
      showToast("error", "Erreur lors de la mise à jour.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setUpdatingId(deleteConfirmId);
    setDeleteConfirmId(null);
    try {
      await databases.deleteDocument(DATABASE_ID, ANNONCES_COLLECTION_ID, deleteConfirmId);
      setMesAnnonces((prev) => prev.filter((a) => a.$id !== deleteConfirmId));
      showToast("success", "Annonce supprimée.");
    } catch {
      showToast("error", "Erreur lors de la suppression.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm">
          <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-zinc-200" />
          <div className="mx-auto h-4 w-1/2 animate-pulse rounded bg-zinc-200" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const fullName = (profile?.full_name as string) || "Nouvel utilisateur";

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-lg font-bold text-white">Tableau de bord</h1>
          <Link
            href="/deposer"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-primary transition hover:opacity-90"
          >
            + Publier
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {getInitials(fullName)}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleEditSave}
                  onKeyDown={handleKeyDown}
                  maxLength={100}
                  disabled={editLoading}
                  className="rounded-lg border border-border px-3 py-1.5 text-lg font-semibold text-primary"
                />
                {editLoading && (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-primary">{fullName}</h2>
                <button
                  onClick={handleEditStart}
                  className="text-muted transition hover:text-primary"
                  aria-label="Modifier le nom"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M11.5 1.5l3 3L5 14H2v-3l9.5-9.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex overflow-hidden rounded-xl bg-white shadow-sm">
          <button
            onClick={() => setMode("achats")}
            className={`flex-1 py-3 text-center text-sm font-semibold transition ${
              mode === "achats" ? "bg-accent text-primary" : "bg-white text-muted hover:bg-zinc-50"
            }`}
          >
            Mes Achats
          </button>
          <button
            onClick={() => setMode("ventes")}
            className={`flex-1 py-3 text-center text-sm font-semibold transition ${
              mode === "ventes" ? "bg-accent text-primary" : "bg-white text-muted hover:bg-zinc-50"
            }`}
          >
            Mes Ventes
          </button>
        </div>

        {mode === "achats" && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Mes Achats</h3>
            <p className="rounded-xl bg-white p-6 text-sm text-muted shadow-sm">
              Vous n&apos;avez pas encore effectué d&apos;achat.
            </p>
          </section>
        )}

        {mode === "ventes" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">Mes Ventes</h3>
              <div className="flex gap-2">
                <Link
                  href="/profil/wallet"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted transition hover:bg-white"
                >
                  Wallet
                </Link>
                <Link
                  href="/deposer"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Nouvelle annonce
                </Link>
              </div>
            </div>

            {!annoncesLoaded ? (
              <div className="space-y-3" aria-busy="true">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
                ))}
                <span className="sr-only">Chargement des annonces...</span>
              </div>
            ) : mesAnnonces.length === 0 ? (
              <p className="rounded-xl bg-white p-6 text-sm text-muted shadow-sm">
                Vous n&apos;avez pas encore publié d&apos;annonce.
              </p>
            ) : (
              <div className="space-y-3">
                {mesAnnonces.map((a) => (
                  <div
                    key={a.$id}
                    className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {a.images_storage_paths && a.images_storage_paths.length > 0 ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/annonces-images/files/${a.images_storage_paths[0]}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary/20">
                          {a.titre.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/annonce/${a.$id}`} className="font-heading text-sm font-semibold text-primary hover:underline line-clamp-1">
                        {a.titre}
                      </Link>
                      <p className="text-sm font-semibold text-primary">
                        {formaterPrix(a.prix, a.devise, usdCdfRate)}
                      </p>
                      <p className="text-xs text-muted">{a.views_count} vues</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <select
                        value={a.status}
                        onChange={(e) => updateStatus(a.$id, e.target.value)}
                        disabled={updatingId === a.$id}
                        className="rounded-lg border border-border px-2 py-1 text-xs"
                      >
                        <option value="disponible">Disponible</option>
                        <option value="réservé">Réservé</option>
                        <option value="vendu">Vendu</option>
                      </select>
                      <button
                        onClick={() => setDeleteConfirmId(a.$id)}
                        disabled={updatingId === a.$id}
                        className="rounded-lg px-2 py-1 text-xs text-danger transition hover:bg-danger/10 disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <button
          onClick={logout}
          className="w-full rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted transition hover:bg-white hover:text-danger"
        >
          Se déconnecter
        </button>
      </main>

      <Modal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Supprimer l'annonce"
      >
        <p>Cette action est irréversible. Voulez-vous vraiment supprimer cette annonce ?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted transition hover:bg-zinc-50"
          >
            Annuler
          </button>
          <button
            onClick={confirmDelete}
            className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}

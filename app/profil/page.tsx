"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Query, ID } from "appwrite";
import { useAuth, sendVerificationEmail } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/profile";
import { tablesDB, storage } from "@/lib/appwrite";
import { DATABASE_ID, ANNONCES_COLLECTION_ID, AVATARS_BUCKET_ID } from "@/lib/constants";
import type { AnnonceDocument, PaymentMethodDocument } from "@/lib/types";
import { useAppwrite, formaterPrix } from "@/lib/contexts/AppwriteContext";
import { useToast } from "@/lib/contexts/ToastContext";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import PaymentMethodList from "@/components/paiement/PaymentMethodList";
import PaymentMethodForm from "@/components/paiement/PaymentMethodForm";
import type { FormData as PaymentFormData } from "@/components/paiement/PaymentMethodForm";
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/lib/payment-methods";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

type Mode = "achats" | "ventes" | "paiements";

export default function ProfilPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { usdCdfRate } = useAppwrite();
  const { success, error } = useToast();
  const [mode, setMode] = useState<Mode>("achats");
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [mesAnnonces, setMesAnnonces] = useState<AnnonceDocument[]>([]);
  const [annoncesLoaded, setAnnoncesLoaded] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDocument[]>([]);
  const [paymentMethodsLoaded, setPaymentMethodsLoaded] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethodDocument | null>(null);
  const [deletePaymentConfirmId, setDeletePaymentConfirmId] = useState<string | null>(null);
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationCooldown, setVerificationCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getProfile(user.$id).then((p) => setProfile(p));
    }
  }, [user]);

  const fetchMesAnnonces = useCallback(async () => {
    if (!user) return;
    try {
      const res = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: ANNONCES_COLLECTION_ID,
        queries: [
          Query.equal("vendeur_id", user.$id),
          Query.orderDesc("$createdAt"),
        ],
      });
      setMesAnnonces(res.rows as unknown as AnnonceDocument[]);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    try {
      const uploaded = await storage.createFile(AVATARS_BUCKET_ID, ID.unique(), file);
      setProfile((prev) => ({ ...prev, avatar_url: uploaded.$id }));
      await updateProfile(user.$id, { avatar_url: uploaded.$id });
      success("📷 Photo de profil mise à jour !");
    } catch {
      error("❌ Erreur lors de l'upload. Vérifie le fichier et réessaie.");
    } finally {
      setAvatarUploading(false);
      if (fileInput) fileInput.value = "";
    }
  };

  const handleAvatarDelete = async () => {
    if (!user) return;
    const currentFileId = avatarUrl && !avatarUrl.startsWith("http") ? avatarUrl : null;
    setAvatarUploading(true);
    try {
      await updateProfile(user.$id, { avatar_url: "" });
      setProfile((prev) => ({ ...prev, avatar_url: "" }));
      if (currentFileId) {
        try { await storage.deleteFile(AVATARS_BUCKET_ID, currentFileId); } catch { /* ignore */ }
      }
      success("🗑️ Photo de profil supprimée.");
    } catch {
      error("❌ Erreur lors de la suppression. Réessaie.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const updateStatus = async (annonceId: string, status: string) => {
    setUpdatingId(annonceId);
    try {
      await tablesDB.updateRow({ databaseId: DATABASE_ID, tableId: ANNONCES_COLLECTION_ID, rowId: annonceId, data: { status } });
      setMesAnnonces((prev) =>
        prev.map((a) => (a.$id === annonceId ? { ...a, status: status as AnnonceDocument["status"] } : a)),
      );
      success("✅ Statut de l'annonce mis à jour.");
    } catch {
      error("❌ Erreur lors de la mise à jour. Réessaie.");
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchPaymentMethods = useCallback(async () => {
    if (!user) return;
    const methods = await getPaymentMethods(user.$id);
    setPaymentMethods(methods);
    setPaymentMethodsLoaded(true);
  }, [user]);

  useEffect(() => {
    if (mode === "paiements")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchPaymentMethods();
  }, [mode, fetchPaymentMethods]);

  const handlePaymentFormSave = async (data: PaymentFormData) => {
    if (!user) return;
    if (editingPaymentMethod) {
      await updatePaymentMethod(editingPaymentMethod.$id, {
        provider: data.provider as never,
        label: data.label,
        isDefault: data.isDefault,
        ...(data.type === "mobile_money"
          ? { phoneNumber: data.phoneNumber }
          : {
              cardHolderName: data.cardHolderName,
              cardLastFour: data.cardLastFour,
              cardExpiryMonth: Number(data.cardExpiryMonth),
              cardExpiryYear: Number(data.cardExpiryYear),
            }),
      } as never);
      success("💳 Moyen de paiement mis à jour.");
    } else {
      await createPaymentMethod({
        userId: user.$id,
        ...(data.type === "mobile_money"
          ? { provider: data.provider as "orange_money" | "m_pesa" | "airtel_money", phoneNumber: data.phoneNumber }
          : { provider: data.provider as "visa" | "mastercard" | "amex", cardHolderName: data.cardHolderName, cardLastFour: data.cardLastFour, cardExpiryMonth: Number(data.cardExpiryMonth), cardExpiryYear: Number(data.cardExpiryYear) }),
        label: data.label || undefined,
        isDefault: data.isDefault,
      } as never);
      success("🎉 Nouveau moyen de paiement enregistré !");
    }
    setShowPaymentForm(false);
    setEditingPaymentMethod(null);
    fetchPaymentMethods();
  };

  const handleEditPaymentMethod = (method: PaymentMethodDocument) => {
    setEditingPaymentMethod(method);
    setShowPaymentForm(true);
  };

  const confirmDeletePayment = async () => {
    if (!deletePaymentConfirmId) return;
    setUpdatingId(deletePaymentConfirmId);
    try {
      await deletePaymentMethod(deletePaymentConfirmId);
      setPaymentMethods((prev) => prev.filter((m) => m.$id !== deletePaymentConfirmId));
      success("🗑️ Moyen de paiement retiré.");
    } catch {
      error("❌ Erreur lors de la suppression. Réessaie.");
    } finally {
      setUpdatingId(null);
      setDeletePaymentConfirmId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setUpdatingId(deleteConfirmId);
    setDeleteConfirmId(null);
    try {
      await tablesDB.deleteRow({ databaseId: DATABASE_ID, tableId: ANNONCES_COLLECTION_ID, rowId: deleteConfirmId });
      setMesAnnonces((prev) => prev.filter((a) => a.$id !== deleteConfirmId));
      success("🗑️ Annonce supprimée avec succès.");
    } catch {
      error("❌ Erreur lors de la suppression. Réessaie.");
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

  const prenom = (profile?.prenom as string) || "";
  const nom = (profile?.nom as string) || "";
  const username = (profile?.username as string) || "";
  const email = (profile?.email as string) || user?.email || "";
  const emailVerified = (profile?.email_verified as boolean) || false;
  const whatsappNumber = (profile?.whatsapp_number as string) || "";
  const sexe = (profile?.sexe as string) || "";
  const communeDefaut = (profile?.commune_defaut as string) || "";
  const dateNaissance = (profile?.date_naissance as string) || "";
  const displayName = prenom || nom ? `${prenom} ${nom}`.trim() : username || "Nouvel utilisateur";
  const avatarUrl = (profile?.avatar_url as string) || "";
  const avatarSrc = avatarUrl.startsWith("http")
    ? avatarUrl
    : avatarUrl
      ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${AVATARS_BUCKET_ID}/files/${avatarUrl}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      : null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between lg:max-w-4xl">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Accueil ShopKin"><Logo light /></Link>
            <span className="hidden text-sm font-semibold text-white/70 sm:inline">Tableau de bord</span>
          </div>
          <Link
            href="/deposer"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-primary transition hover:opacity-90"
          >
            + Publier
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-2xl space-y-6 px-4 py-8 lg:max-w-4xl">
        {!emailVerified && email && (
          <div className="rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z" />
              </svg>
              <span>Votre adresse email n&apos;a pas encore été vérifiée.</span>
            </div>
            <button
              onClick={async () => {
                setVerificationSending(true);
                try {
                  await sendVerificationEmail();
                  success("✉️ Email de vérification envoyé ! Vérifie ta boîte mail (et les spams).");
                  setVerificationCooldown(30);
                  const timer = setInterval(() => {
                    setVerificationCooldown((prev) => {
                      if (prev <= 1) { clearInterval(timer); return 0; }
                      return prev - 1;
                    });
                  }, 1000);
                } catch {
                  error("❌ Erreur lors de l'envoi. Vérifie ta connexion et réessaie.");
                } finally {
                  setVerificationSending(false);
                }
              }}
              disabled={verificationSending || verificationCooldown > 0}
              className="mt-2 rounded-lg bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800 transition hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verificationSending ? "Envoi..." : verificationCooldown > 0 ? `Renvoyer (${verificationCooldown}s)` : "Renvoyer l'email de confirmation"}
            </button>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar src={avatarSrc} alt={displayName} size={64} fallbackName={displayName} />
            <button
                onClick={() => document.getElementById("avatar-upload")?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-accent text-primary shadow-sm transition hover:opacity-90 disabled:opacity-50"
              aria-label="Modifier la photo"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M11.5 1.5l3 3L5 14H2v-3l9.5-9.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
            <input
              id="avatar-upload"
              ref={(el) => { if (el) setFileInput(el); }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarUpload}
            />
            {avatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-primary">{displayName}</h2>
            <p className="mt-0.5 text-sm text-muted">@{username}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Informations</h3>
            <Link
              href="/profil/edit"
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-zinc-50 hover:text-primary"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M11.5 1.5l3 3L5 14H2v-3l9.5-9.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              Modifier
            </Link>
          </div>
          <div className="mt-3 space-y-3 text-base">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-muted">{email}</span>
              {emailVerified && <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">Vérifié</span>}
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-muted">{whatsappNumber ? `+243 ${whatsappNumber}` : "Non renseigné"}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              </svg>
              <span className="text-muted">{sexe || "Non renseigné"}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-muted">{communeDefaut || "Non renseignée"}</span>
            </div>
            {dateNaissance && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-muted">{dateNaissance}</span>
              </div>
            )}
            {avatarUrl && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleAvatarDelete}
                  disabled={avatarUploading}
                  className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs text-danger transition hover:bg-red-50 disabled:opacity-50"
                >
                  Supprimer la photo
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
            Achats
          </button>
          <button
            onClick={() => setMode("ventes")}
            className={`flex-1 py-3 text-center text-sm font-semibold transition ${
              mode === "ventes" ? "bg-accent text-primary" : "bg-white text-muted hover:bg-zinc-50"
            }`}
          >
            Ventes
          </button>
          <button
            onClick={() => setMode("paiements")}
            className={`flex-1 py-3 text-center text-sm font-semibold transition ${
              mode === "paiements" ? "bg-accent text-primary" : "bg-white text-muted hover:bg-zinc-50"
            }`}
          >
            Paiements
          </button>
        </div>

        {mode === "achats" && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Mes Achats</h3>
            <div className="rounded-xl bg-white p-6 text-center shadow-sm">
              <p className="text-base text-muted">Vous n&apos;avez pas encore effectué d&apos;achat.</p>
              <Link href="/" className="mt-3 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                Parcourir le catalogue
              </Link>
            </div>
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
              <div className="rounded-xl bg-white p-6 text-center shadow-sm">
                <p className="text-base text-muted">Vous n&apos;avez pas encore publié d&apos;annonce.</p>
                <Link href="/deposer" className="mt-3 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                  Publier ma première annonce
                </Link>
              </div>
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

        {mode === "paiements" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">Moyens de paiement</h3>
              <button
                onClick={() => { setEditingPaymentMethod(null); setShowPaymentForm(true); }}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                + Ajouter
              </button>
            </div>

            {!paymentMethodsLoaded ? (
              <div className="space-y-3" aria-busy="true">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
                ))}
                <span className="sr-only">Chargement...</span>
              </div>
            ) : (
              <PaymentMethodList
                methods={paymentMethods}
                onEdit={handleEditPaymentMethod}
                onDelete={(m) => setDeletePaymentConfirmId(m.$id)}
              />
            )}
          </section>
        )}

        <button
          onClick={() => {
            success("👋 À bientôt ! Tu as été déconnecté.");
            setTimeout(() => logout(), 400);
          }}
          className="w-full rounded-xl border border-danger/30 bg-white px-4 py-3 text-sm font-medium text-danger transition hover:bg-red-50"
        >
          Se déconnecter
        </button>
      </main>

      {/* Annonce delete modal */}
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

      {/* Payment method form modal */}
      <Modal
        open={showPaymentForm}
        onClose={() => { setShowPaymentForm(false); setEditingPaymentMethod(null); }}
        title={editingPaymentMethod ? "Modifier le moyen de paiement" : "Ajouter un moyen de paiement"}
      >
        <PaymentMethodForm
          editingMethod={editingPaymentMethod}
          existingPhones={paymentMethods.filter((m) => m.type === "mobile_money").map((m) => m.phone_number)}
          existingLastFours={paymentMethods.filter((m) => m.type === "card").map((m) => m.card_last_four)}
          onSave={handlePaymentFormSave}
          onCancel={() => { setShowPaymentForm(false); setEditingPaymentMethod(null); }}
        />
      </Modal>

      {/* Payment delete confirmation modal */}
      <Modal
        open={!!deletePaymentConfirmId}
        onClose={() => setDeletePaymentConfirmId(null)}
        title="Supprimer ce moyen de paiement ?"
      >
        <p>Cette action est irréversible. Voulez-vous vraiment supprimer ce moyen de paiement ?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDeletePaymentConfirmId(null)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted transition hover:bg-zinc-50"
          >
            Annuler
          </button>
          <button
            onClick={confirmDeletePayment}
            className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}

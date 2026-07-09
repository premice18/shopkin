"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Query, ID, Permission, Role } from "appwrite";
import {
  Package,
  Heart,
  CreditCard,
  Users,
  Settings,
  Pencil,
  Trash2,
  Plus,
  LogOut,
  Camera,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { useAuth, sendVerificationEmail } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/profile";
import { tablesDB, storage } from "@/lib/appwrite";
import { DATABASE_ID, ANNONCES_COLLECTION_ID, AVATARS_BUCKET_ID } from "@/lib/constants";
import { getAnnonceImagePreviewUrl, getAvatarUrl } from "@/lib/images";
import type { AnnonceDocument, PaymentMethodDocument } from "@/lib/types";
import { useAppwrite, formaterPrix } from "@/lib/contexts/AppwriteContext";
import { useToast } from "@/lib/contexts/ToastContext";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import PaymentMethodList from "@/components/paiement/PaymentMethodList";
import PaymentMethodForm from "@/components/paiement/PaymentMethodForm";
import type { FormData as PaymentFormData } from "@/components/paiement/PaymentMethodForm";
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/lib/payment-methods";
import { countFollowers, countFollowing, getFollowerIds, getFollowingIds } from "@/lib/follows";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

type Tab = "ventes" | "achats" | "paiements" | "abonnements" | "parametres";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "ventes", label: "Ventes", icon: Package },
  { id: "achats", label: "Achats", icon: Heart },
  { id: "paiements", label: "Paiements", icon: CreditCard },
  { id: "abonnements", label: "Abonnements", icon: Users },
  { id: "parametres", label: "Paramètres", icon: Settings },
];

export default function ProfilPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { usdCdfRate } = useAppwrite();
  const { success, error } = useToast();
  const [tab, setTab] = useState<Tab>("ventes");
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
  // État pour les abonnements
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followingList, setFollowingList] = useState<{ id: string; username: string; full_name: string; avatar_url: string }[]>([]);
  const [followerList, setFollowerList] = useState<{ id: string; username: string; full_name: string; avatar_url: string }[]>([]);
  const [followDataLoading, setFollowDataLoading] = useState(false);
  const [followTab, setFollowTab] = useState<"following" | "followers">("following");
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getProfile(user.$id).then((p) => setProfile(p));
      // Charge les compteurs d'abonnés/abonnements au chargement du profil
      Promise.all([
        countFollowers(user.$id),
        countFollowing(user.$id),
      ]).then(([followers, followings]) => {
        setFollowerCount(followers);
        setFollowingCount(followings);
      }).catch(() => {});
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

  // Charge les annonces à l'activation de l'onglet Ventes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab === "ventes") fetchMesAnnonces();
  }, [tab, fetchMesAnnonces]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    try {
      // Permission read("any") pour que l'avatar soit visible publiquement
      const uploaded = await storage.createFile(AVATARS_BUCKET_ID, ID.unique(), file, [Permission.read(Role.any())]);
      setProfile((prev) => ({ ...prev, avatar_url: uploaded.$id }));
      await updateProfile(user.$id, { avatar_url: uploaded.$id });
      success("Photo de profil mise à jour !");
    } catch {
      error("Erreur lors de l'upload. Vérifie le fichier et réessaie.");
    } finally {
      setAvatarUploading(false);
      if (fileInput) fileInput.value = "";
    }
  };

  const handleAvatarDelete = async () => {
    if (!user) return;
    const rawAvatar = (profile?.avatar_url as string) || "";
    const currentFileId = rawAvatar && !rawAvatar.startsWith("http") ? rawAvatar : null;
    setAvatarUploading(true);
    try {
      await updateProfile(user.$id, { avatar_url: "" });
      setProfile((prev) => ({ ...prev, avatar_url: "" }));
      if (currentFileId) {
        try { await storage.deleteFile(AVATARS_BUCKET_ID, currentFileId); } catch { /* fichier déjà supprimé */ }
      }
      success("Photo de profil supprimée.");
    } catch {
      error("Erreur lors de la suppression. Réessaie.");
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
      success("Statut de l'annonce mis à jour.");
    } catch {
      error("Erreur lors de la mise à jour. Réessaie.");
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab === "paiements") fetchPaymentMethods();
  }, [tab, fetchPaymentMethods]);

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
      success("Moyen de paiement mis à jour.");
    } else {
      await createPaymentMethod({
        userId: user.$id,
        ...(data.type === "mobile_money"
          ? { provider: data.provider as "orange_money" | "m_pesa" | "airtel_money", phoneNumber: data.phoneNumber }
          : { provider: data.provider as "visa" | "mastercard" | "amex", cardHolderName: data.cardHolderName, cardLastFour: data.cardLastFour, cardExpiryMonth: Number(data.cardExpiryMonth), cardExpiryYear: Number(data.cardExpiryYear) }),
        label: data.label || undefined,
        isDefault: data.isDefault,
      } as never);
      success("Nouveau moyen de paiement enregistré !");
    }
    setShowPaymentForm(false);
    setEditingPaymentMethod(null);
    fetchPaymentMethods();
  };

  const handleEditPaymentMethod = (method: PaymentMethodDocument) => {
    setEditingPaymentMethod(method);
    setShowPaymentForm(true);
  };

  // Récupère les profils des abonnés/abonnements
  const fetchFollowData = useCallback(async () => {
    if (!user) return;
    setFollowDataLoading(true);
    try {
      const [followingIds, followerIds] = await Promise.all([
        getFollowingIds(user.$id),
        getFollowerIds(user.$id),
      ]);
      const allIds = [...new Set([...followingIds.slice(0, 20), ...followerIds.slice(0, 20)])];
      const profiles: Record<string, { id: string; username: string; full_name: string; avatar_url: string }> = {};
      await Promise.all(
        allIds.map(async (id) => {
          try {
            const p = await tablesDB.getRow({
              databaseId: DATABASE_ID,
              tableId: "profiles",
              rowId: id,
            });
            profiles[id] = {
              id,
              username: (p.username as string) || "",
              full_name: (p.full_name as string) || `${(p.prenom as string) || ""} ${(p.nom as string) || ""}`.trim(),
              avatar_url: (p.avatar_url as string) || "",
            };
          } catch { /* profil introuvable */ }
        })
      );
      setFollowingList(followingIds.slice(0, 20).map((id) => profiles[id]).filter(Boolean));
      setFollowerList(followerIds.slice(0, 20).map((id) => profiles[id]).filter(Boolean));
    } catch {
      // Silencieux
    } finally {
      setFollowDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab === "abonnements") fetchFollowData();
  }, [tab, fetchFollowData]);

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setUpdatingId(deleteConfirmId);
    setDeleteConfirmId(null);
    try {
      await tablesDB.deleteRow({ databaseId: DATABASE_ID, tableId: ANNONCES_COLLECTION_ID, rowId: deleteConfirmId });
      setMesAnnonces((prev) => prev.filter((a) => a.$id !== deleteConfirmId));
      success("Annonce supprimée avec succès.");
    } catch {
      error("Erreur lors de la suppression. Réessaie.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDeletePayment = async () => {
    if (!deletePaymentConfirmId) return;
    setUpdatingId(deletePaymentConfirmId);
    try {
      await deletePaymentMethod(deletePaymentConfirmId);
      setPaymentMethods((prev) => prev.filter((m) => m.$id !== deletePaymentConfirmId));
      success("Moyen de paiement retiré.");
    } catch {
      error("Erreur lors de la suppression. Réessaie.");
    } finally {
      setUpdatingId(null);
      setDeletePaymentConfirmId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-zinc-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
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
  const createdAt = (profile?.$createdAt as string) || user?.$createdAt || "";
  const displayName = prenom || nom ? `${prenom} ${nom}`.trim() : username || "Nouvel utilisateur";
  const rawAvatar = (profile?.avatar_url as string) || "";
  const avatarSrc = getAvatarUrl(rawAvatar);

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "";

  // Compte le nombre d'annonces actives
  const activeAnnoncesCount = mesAnnonces.filter((a) => a.status === "disponible").length;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Accueil ShopKin"><Logo light /></Link>
            <span className="hidden text-sm font-medium text-white/60 sm:inline">Tableau de bord</span>
          </div>
          <Link
            href="/deposer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:opacity-90 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Publier</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        {/* Carte héros du profil */}
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Bande décorative en haut */}
          <div className="h-2 bg-gradient-to-r from-accent to-primary" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              {/* Avatar avec overlay de chargement et bouton d'upload */}
              <div className="group relative mx-auto shrink-0 sm:mx-0">
                <Avatar src={avatarSrc} alt={displayName} size={88} fallbackName={displayName} className="ring-2 ring-white shadow-md" />
                <button
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-accent text-primary shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-50"
                  aria-label="Modifier la photo de profil"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
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
                    <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>

              {/* Identité et stats */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <h1 className="text-xl font-bold text-primary">{displayName}</h1>
                  <Link
                    href="/profil/edit"
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-primary"
                  >
                    <Pencil className="h-3 w-3" aria-hidden="true" />
                    Modifier
                  </Link>
                </div>
                <p className="mt-0.5 text-sm text-muted">@{username}</p>
                {memberSince && (
                  <p className="mt-1 text-xs text-muted/60">Membre depuis {memberSince}</p>
                )}

                {/* Ligne de statistiques */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                    <Package className="h-3 w-3" aria-hidden="true" />
                    {activeAnnoncesCount} annonce{activeAnnoncesCount > 1 ? "s" : ""}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                    <Users className="h-3 w-3" aria-hidden="true" />
                    {followerCount} abonné{followerCount > 1 ? "s" : ""}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    {followingCount} abonnement{followingCount > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations de contact compactes */}
            <div className="mt-5 grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-2">
              <InfoRow icon={Mail} label="email" value={email} verified={emailVerified} />
              <InfoRow icon={Phone} label="téléphone" value={whatsappNumber ? `+243 ${whatsappNumber}` : ""} />
              <InfoRow icon={MapPin} label="commune" value={communeDefaut} />
              <InfoRow icon={User} label="sexe" value={sexe} />
              {dateNaissance && (
                <InfoRow
                  icon={Calendar}
                  label="date de naissance"
                  value={new Date(dateNaissance).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                />
              )}
            </div>

            {/* Supprimer la photo (visible seulement si avatar présent) */}
            {rawAvatar && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleAvatarDelete}
                  disabled={avatarUploading}
                  className="inline-flex items-center gap-1 text-xs text-danger transition hover:text-danger/80 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  Supprimer la photo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bandeau email non vérifié */}
        {!emailVerified && email && (
          <div className="mt-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Votre adresse email n&apos;a pas encore été vérifiée.</span>
              <button
                onClick={async () => {
                  setVerificationSending(true);
                  try {
                    await sendVerificationEmail();
                    success("Email de vérification envoyé ! Vérifie ta boîte mail (et les spams).");
                    setVerificationCooldown(30);
                    const timer = setInterval(() => {
                      setVerificationCooldown((prev) => {
                        if (prev <= 1) { clearInterval(timer); return 0; }
                        return prev - 1;
                      });
                    }, 1000);
                  } catch {
                    error("Erreur lors de l'envoi. Vérifie ta connexion et réessaie.");
                  } finally {
                    setVerificationSending(false);
                  }
                }}
                disabled={verificationSending || verificationCooldown > 0}
                className="ml-auto rounded-lg bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800 transition hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verificationSending ? "Envoi..." : verificationCooldown > 0 ? `Renvoyer (${verificationCooldown}s)` : "Renvoyer"}
              </button>
            </div>
          </div>
        )}

        {/* Barre d'onglets premium */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex overflow-x-auto scrollbar-hide" role="tablist">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                role="tab"
                aria-selected={tab === id}
                className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-3 py-3.5 text-sm font-semibold transition-all duration-200 min-w-[72px] ${
                  tab === id
                    ? "bg-accent/20 text-primary shadow-[inset_0_-2px_0_theme(colors.accent)]"
                    : "bg-white text-muted hover:bg-zinc-50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="mt-5">
          {/* ===== ONGLET VENTES ===== */}
          {tab === "ventes" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-primary">
                  Mes annonces
                  <span className="ml-1.5 text-sm font-normal text-muted">({mesAnnonces.length})</span>
                </h2>
                <Link
                  href="/deposer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.97]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Nouvelle
                </Link>
              </div>

              {!annoncesLoaded ? (
                <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
                  ))}
                </div>
              ) : mesAnnonces.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <Package className="mx-auto h-10 w-10 text-muted/30" aria-hidden="true" />
                  <p className="mt-3 text-sm text-muted">Vous n&apos;avez pas encore publié d&apos;annonce.</p>
                  <Link
                    href="/deposer"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.97]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Publier ma première annonce
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {mesAnnonces.map((a) => {
                    // Génère l'URL de la première image de l'annonce via preview (performant)
                    const imgUrl = getAnnonceImagePreviewUrl(a.images_storage_paths?.[0], 200, 200);
                    return (
                      <div
                        key={a.$id}
                        className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md"
                      >
                        {/* Miniature */}
                        <Link
                          href={`/annonce/${a.$id}`}
                          className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary/20">
                              {a.titre.charAt(0)}
                            </div>
                          )}
                        </Link>
                        {/* Infos */}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/annonce/${a.$id}`}
                            className="text-sm font-semibold text-primary transition hover:text-primary/80 line-clamp-1"
                          >
                            {a.titre}
                          </Link>
                          <p className="mt-0.5 text-sm font-bold text-primary">
                            {formaterPrix(a.prix, a.devise, usdCdfRate)}
                          </p>
                          <p className="text-xs text-muted">{a.views_count} vues</p>
                        </div>
                        {/* Actions */}
                        <div className="flex shrink-0 flex-col gap-1.5">
                          <select
                            value={a.status}
                            onChange={(e) => updateStatus(a.$id, e.target.value)}
                            disabled={updatingId === a.$id}
                            className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                              a.status === "disponible"
                                ? "border-green-300 text-green-700"
                                : a.status === "vendu"
                                ? "border-red-300 text-red-700"
                                : "border-yellow-300 text-yellow-700"
                            }`}
                          >
                            <option value="disponible">Disponible</option>
                            <option value="réservé">Réservé</option>
                            <option value="vendu">Vendu</option>
                          </select>
                          <button
                            onClick={() => setDeleteConfirmId(a.$id)}
                            disabled={updatingId === a.$id}
                            className="inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1 text-xs text-danger transition hover:bg-danger/10 disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ===== ONGLET ACHATS ===== */}
          {tab === "achats" && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-primary">Mes Achats</h2>
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <Heart className="mx-auto h-10 w-10 text-muted/30" aria-hidden="true" />
                <p className="mt-3 text-sm text-muted">Vous n&apos;avez pas encore effectué d&apos;achat.</p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.97]"
                >
                  Parcourir le catalogue
                </Link>
              </div>
            </section>
          )}

          {/* ===== ONGLET PAIEMENTS ===== */}
          {tab === "paiements" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-primary">Moyens de paiement</h2>
                <button
                  onClick={() => { setEditingPaymentMethod(null); setShowPaymentForm(true); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.97]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Ajouter
                </button>
              </div>

              {!paymentMethodsLoaded ? (
                <div className="grid gap-3" aria-busy="true">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
                  ))}
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

          {/* ===== ONGLET ABONNEMENTS ===== */}
          {tab === "abonnements" && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-primary">Abonnements</h2>
              <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm" role="tablist">
                <button
                  onClick={() => setFollowTab("following")}
                  role="tab"
                  aria-selected={followTab === "following"}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                    followTab === "following"
                      ? "bg-accent text-primary shadow-sm"
                      : "text-muted hover:bg-zinc-50"
                  }`}
                >
                  Abonnements ({followingCount})
                </button>
                <button
                  onClick={() => setFollowTab("followers")}
                  role="tab"
                  aria-selected={followTab === "followers"}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                    followTab === "followers"
                      ? "bg-accent text-primary shadow-sm"
                      : "text-muted hover:bg-zinc-50"
                  }`}
                >
                  Abonnés ({followerCount})
                </button>
              </div>

              {followDataLoading ? (
                <div className="grid gap-3" aria-busy="true">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-2">
                  {(followTab === "following" ? followingList : followerList).length === 0 ? (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                      <Users className="mx-auto h-10 w-10 text-muted/30" aria-hidden="true" />
                      <p className="mt-2 text-sm text-muted">
                        {followTab === "following"
                          ? "Vous ne suivez personne pour l'instant."
                          : "Vous n'avez pas encore d'abonnés."}
                      </p>
                    </div>
                  ) : (
                    (followTab === "following" ? followingList : followerList).map((p) => {
                      const avatarUrl = getAvatarUrl(p.avatar_url);
                      return (
                        <Link
                          key={p.id}
                          href={`/vendeur/${p.username}`}
                          className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md active:scale-[0.99]"
                        >
                          <Avatar
                            src={avatarUrl}
                            alt={p.full_name || p.username}
                            size={44}
                            fallbackName={p.full_name || p.username}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-primary truncate">{p.full_name || p.username}</p>
                            <p className="text-xs text-muted">@{p.username}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted/40" aria-hidden="true" />
                        </Link>
                      );
                    })
                  )}
                </div>
              )}
            </section>
          )}

          {/* ===== ONGLET PARAMÈTRES ===== */}
          {tab === "parametres" && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-primary">Paramètres</h2>

              <div className="grid gap-3">
                {/* Lien Wallet */}
                <Link
                  href="/profil/wallet"
                  className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5">
                    <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">Wallet Mobile Money</p>
                    <p className="text-xs text-muted">Gérer mes numéros de paiement</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted/40" aria-hidden="true" />
                </Link>

                {/* Lien Modifier le profil */}
                <Link
                  href="/profil/edit"
                  className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5">
                    <Pencil className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">Modifier le profil</p>
                    <p className="text-xs text-muted">Nom, commune, date de naissance</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted/40" aria-hidden="true" />
                </Link>

                {/* Déconnexion */}
                <button
                  onClick={() => {
                    success("À bientôt ! Tu as été déconnecté.");
                    setTimeout(() => logout(), 400);
                  }}
                  className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md hover:bg-red-50/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/5">
                    <LogOut className="h-5 w-5 text-danger" aria-hidden="true" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-danger">Se déconnecter</p>
                    <p className="text-xs text-muted">Mettre fin à la session</p>
                  </div>
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Modale de confirmation suppression annonce */}
      <Modal open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Supprimer l'annonce">
        <p className="text-sm text-muted">Cette action est irréversible. Voulez-vous vraiment supprimer cette annonce ?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted transition hover:bg-zinc-50"
          >
            Annuler
          </button>
          <button
            onClick={confirmDelete}
            className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      </Modal>

      {/* Modale formulaire moyen de paiement */}
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

      {/* Modale confirmation suppression paiement */}
      <Modal
        open={!!deletePaymentConfirmId}
        onClose={() => setDeletePaymentConfirmId(null)}
        title="Supprimer ce moyen de paiement ?"
      >
        <p className="text-sm text-muted">Cette action est irréversible. Voulez-vous vraiment supprimer ce moyen de paiement ?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDeletePaymentConfirmId(null)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted transition hover:bg-zinc-50"
          >
            Annuler
          </button>
          <button
            onClick={confirmDeletePayment}
            className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}

// Composant réutilisable pour afficher une ligne d'information avec icône
function InfoRow({ icon: Icon, label, value, verified }: { icon: React.ElementType; label: string; value: string; verified?: boolean }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
      <span className="text-muted truncate">{value || `Aucun ${label.toLowerCase()}`}</span>
      {verified && <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Vérifié</span>}
    </div>
  );
}

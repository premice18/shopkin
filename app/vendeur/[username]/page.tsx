"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import { Query } from "appwrite";
import { tablesDB } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth";
import { DATABASE_ID, ANNONCES_COLLECTION_ID } from "@/lib/constants";
import { isFollowing, followUser, unfollowUser, countFollowers, countFollowing } from "@/lib/follows";
import { useToast } from "@/lib/contexts/ToastContext";
import type { AnnonceDocument } from "@/lib/types";
import { getAvatarUrl } from "@/lib/images";
import Avatar from "@/components/ui/Avatar";
import Logo from "@/components/ui/Logo";
import ProductCard from "@/components/ui/ProductCard";
import type { Devise } from "@/components/layout/Header";

interface PublicProfile {
  id: string;
  username: string;
  prenom: string;
  nom: string;
  full_name: string;
  avatar_url: string;
  commune_defaut: string;
  sexe: string;
  date_inscription: string;
}

export default function VendeurPage() {
  const params = useParams<{ username: string }>();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [annonces, setAnnonces] = useState<AnnonceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [devise] = useState<Devise>("USD");
  // État de l'abonnement
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Vérifie si l'utilisateur connecté suit déjà ce vendeur
  const checkFollowStatus = useCallback(async (profileId: string) => {
    if (!user) return;
    setFollowing(await isFollowing(user.$id, profileId));
  }, [user]);

  // Récupère les compteurs
  const fetchCounts = useCallback(async (profileId: string) => {
    const [followers, followings] = await Promise.all([
      countFollowers(profileId),
      countFollowing(profileId),
    ]);
    setFollowerCount(followers);
    setFollowingCount(followings);
  }, []);

  useEffect(() => {
    if (!params.username) return;
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(params.username)}`);
        if (!res.ok) {
          if (res.status === 404 && !cancelled) { notFound(); }
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        const prof = data.profile as PublicProfile;
        setProfile(prof);

        // Récupère les annonces publiées par ce vendeur
        const annoncesRes = await tablesDB.listRows({
          databaseId: DATABASE_ID,
          tableId: ANNONCES_COLLECTION_ID,
          queries: [
            Query.equal("vendeur_id", prof.id),
            Query.equal("status", "disponible"),
            Query.orderDesc("$createdAt"),
            Query.limit(20),
          ],
        });
        if (!cancelled) {
          setAnnonces(annoncesRes.rows as unknown as AnnonceDocument[]);
        }

        // État abonnement et compteurs
        checkFollowStatus(prof.id);
        fetchCounts(prof.id);
      } catch {
        // Silencieux
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [params.username, checkFollowStatus, fetchCounts]);

  // Bascule follow/unfollow
  const handleToggleFollow = async () => {
    if (!user || !profile) {
      toastError("Connectez-vous pour suivre ce vendeur.");
      return;
    }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (following) {
        await unfollowUser(user.$id, profile.id);
        setFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
        success("Vous ne suivez plus ce vendeur.");
      } else {
        await followUser(user.$id, profile.id);
        setFollowing(true);
        setFollowerCount((c) => c + 1);
        success("Vous suivez désormais ce vendeur !");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'opération.";
      toastError(msg);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!profile) {
    notFound();
  }

  const prenom = profile.prenom || "";
  const nom = profile.nom || "";
  const displayName = profile.full_name || `${prenom} ${nom}`.trim() || profile.username;
  const avatarUrl = getAvatarUrl(profile.avatar_url);
  const dateInscription = profile.date_inscription
    ? new Date(profile.date_inscription).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const isOwnProfile = user?.$id === profile.id;

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4 lg:max-w-4xl">
          <Link href="/" className="text-white/70 hover:text-white transition" aria-label="Accueil">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Logo light />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 lg:max-w-4xl">
        {/* Carte profil vendeur */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Avatar src={avatarUrl} alt={displayName} size={72} fallbackName={displayName} />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-primary">{displayName}</h1>
              <p className="text-sm text-muted">@{profile.username}</p>
              {profile.commune_defaut && (
                <p className="mt-1 text-sm text-muted">{profile.commune_defaut}</p>
              )}
              {dateInscription && (
                <p className="text-xs text-muted/60">Membre depuis {dateInscription}</p>
              )}
            </div>
            {/* Bouton Suivre/Abonné, masqué si c'est notre propre profil */}
            {!isOwnProfile && user && (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                  following
                    ? "border border-border bg-white text-primary hover:bg-zinc-50"
                    : "bg-primary text-white hover:opacity-90"
                }`}
              >
                {followLoading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : following ? (
                  <UserCheck className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                )}
                {following ? "Abonné" : "Suivre"}
              </button>
            )}
          </div>

          {/* Compteurs abonnés / abonnements */}
          <div className="mt-4 flex items-center gap-6 border-t border-border pt-4">
            <div className="text-center">
              <p className="text-sm font-bold text-primary">{followerCount}</p>
              <p className="text-xs text-muted">
                {followerCount > 1 ? "abonnés" : "abonné"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-primary">{followingCount}</p>
              <p className="text-xs text-muted">abonnements</p>
            </div>
          </div>
        </div>

        {/* Annonces du vendeur */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-primary">
            Annonces ({annonces.length})
          </h2>
          {annonces.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-white p-8 text-center">
              <p className="text-muted">Ce vendeur n&apos;a pas encore publié d&apos;annonce.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {annonces.map((a) => (
                <ProductCard key={a.$id} annonce={a} devise={devise} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

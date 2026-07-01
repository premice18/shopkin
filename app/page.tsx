"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Query } from "appwrite";
import { databases } from "@/lib/appwrite";
import { DATABASE_ID, ANNONCES_COLLECTION_ID } from "@/lib/constants";
import type { AnnonceDocument } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import Header from "@/components/layout/Header";
import FilterBar from "@/components/layout/FilterBar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import type { Devise } from "@/components/layout/Header";

const PAGE_SIZE = 10;

export default function Home() {
  const [devise, setDevise] = useState<Devise>("USD");
  const { user, loading: authLoading } = useAuth();
  const [annonces, setAnnonces] = useState<AnnonceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const offsetRef = useRef(0);
  const [categorie, setCategorie] = useState("");
  const [commune, setCommune] = useState("");
  const [superRepere, setSuperRepere] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const buildQueries = useCallback(
    (offset: number) => {
      const q: string[] = [Query.equal("status", "disponible"), Query.limit(PAGE_SIZE), Query.offset(offset), Query.orderDesc("$createdAt")];
      if (categorie) q.push(Query.equal("categorie", categorie));
      if (commune) q.push(Query.equal("commune", commune));
      if (superRepere) q.push(Query.equal("super_repere", superRepere));
      return q;
    },
    [categorie, commune, superRepere],
  );

  const fetchAnnonces = useCallback(async () => {
    offsetRef.current = 0;
    try {
      const res = await databases.listDocuments(DATABASE_ID, ANNONCES_COLLECTION_ID, buildQueries(0));
      setAnnonces(res.documents as unknown as AnnonceDocument[]);
      setTotal(res.total);
      setHasMore(res.documents.length === PAGE_SIZE);
    } catch {
      setAnnonces([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [buildQueries]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const newOffset = offsetRef.current + PAGE_SIZE;
    try {
      const res = await databases.listDocuments(DATABASE_ID, ANNONCES_COLLECTION_ID, buildQueries(newOffset));
      const docs = res.documents as unknown as AnnonceDocument[];
      setAnnonces((prev) => [...prev, ...docs]);
      setHasMore(docs.length === PAGE_SIZE);
      offsetRef.current = newOffset;
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, buildQueries]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnnonces();
  }, [fetchAnnonces]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <Header devise={devise} onDeviseChange={setDevise} />
      <main id="main-content" className="flex-1 pt-16 pb-16 md:pb-0">
        <FilterBar
          categorie={categorie}
          commune={commune}
          superRepere={superRepere}
          onCategorieChange={(v) => { setCategorie(v); }}
          onCommuneChange={(v) => { setCommune(v); }}
          onSuperRepereChange={(v) => { setSuperRepere(v); }}
        />

        {!authLoading && !user && (
          <section className="border-b border-border bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="mx-auto max-w-7xl px-4 py-8 text-center md:py-10">
              <h2 className="font-heading text-xl font-bold text-primary md:text-2xl">
                Achetez et vendez à Kinshasa
              </h2>
              <p className="mt-2 text-sm text-muted">
                Rejoignez la marketplace de confiance des Kinois.
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-primary shadow-sm transition hover:opacity-90"
                >
                  Créer un compte
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-primary">
              Annonces récentes
            </h2>
            {!loading && (
              <span className="text-sm text-muted">{total} annonce{total > 1 ? "s" : ""}</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4" aria-busy="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-[16px] bg-white shadow-sm">
                  <div className="aspect-[4/3] animate-pulse bg-gray-200" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
              <span className="sr-only">Chargement des annonces...</span>
            </div>
          ) : annonces.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-16 w-16 opacity-30" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <p className="mt-4 text-sm">Aucune annonce trouvée</p>
              <p className="text-xs opacity-60">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                {annonces.map((a) => (
                  <ProductCard key={a.$id} annonce={a} devise={devise} />
                ))}
              </div>

              {hasMore && (
                <div ref={sentinelRef} className="mt-8 flex justify-center py-4">
                  {loadingMore && (
                    <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                </div>
              )}

              {!hasMore && annonces.length > 0 && (
                <p className="mt-8 text-center text-sm text-muted">— Vous avez tout vu ! —</p>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}

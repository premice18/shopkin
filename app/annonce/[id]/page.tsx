"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useParams, notFound, useRouter } from "next/navigation";
import { tablesDB } from "@/lib/appwrite";
import { DATABASE_ID, ANNONCES_COLLECTION_ID, PROFILES_COLLECTION_ID } from "@/lib/constants";
import type { AnnonceDocument } from "@/lib/types";
import { useAppwrite, formaterPrix } from "@/lib/contexts/AppwriteContext";
import Logo from "@/components/ui/Logo";

export default function AnnoncePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { usdCdfRate } = useAppwrite();
  const [annonce, setAnnonce] = useState<AnnonceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerPhone, setSellerPhone] = useState<string | null>(null);
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;
    tablesDB
      .getRow({ databaseId: DATABASE_ID, tableId: ANNONCES_COLLECTION_ID, rowId: params.id })
      .then((doc) => {
        if (cancelled) return;
        const a = doc as unknown as AnnonceDocument;
        setAnnonce(a);
        fetch("/api/increment-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ annonceId: params.id }),
        }).catch(() => {});
        return a.vendeur_id;
      })
      .then((vendeurId) => {
        if (!vendeurId || cancelled) return;
        return tablesDB.getRow({ databaseId: DATABASE_ID, tableId: PROFILES_COLLECTION_ID, rowId: vendeurId as string });
      })
      .then((profileDoc) => {
        if (cancelled || !profileDoc) return;
        const p = profileDoc as Record<string, unknown>;
        setSellerPhone((p.whatsapp_number as string) || null);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params.id]);

  const handleWhatsApp = () => {
    if (!annonce || !sellerPhone) return;
    setWhatsappLoading(true);
    const phoneClean = sellerPhone.replace(/[^0-9]/g, "");
    const text = `Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%28e%29%20par%20votre%20annonce%20%C2%AB${encodeURIComponent(annonce.titre)}%C2%BB.%20Est-elle%20toujours%20disponible%20%3F`;
    window.open(`https://wa.me/${phoneClean}?text=${text}`, "_blank", "noopener,noreferrer");
    setTimeout(() => setWhatsappLoading(false), 500);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pb-24 md:pb-8" aria-busy="true">
        <div className="sticky top-0 z-40 bg-white shadow-sm" role="presentation">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
            <span className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
            <span className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className="aspect-[4/3] w-full animate-pulse rounded-[16px] bg-gray-200 md:aspect-[16/9]" />
          <div className="mt-6 space-y-3">
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <span className="sr-only">Chargement en cours...</span>
      </div>
    );
  }

  if (!annonce) {
    notFound();
  }

  const imageUrl =
    annonce.images_storage_paths && annonce.images_storage_paths.length > 0
      ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/annonces-images/files/${annonce.images_storage_paths[0]}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      : null;

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center rounded-full p-1 text-muted hover:bg-surface transition-colors"
            aria-label="Retour"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <Logo className="text-lg" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-4 lg:grid lg:grid-cols-5 lg:gap-8">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-white shadow-sm md:aspect-[16/9] lg:col-span-3 lg:aspect-[4/3]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={annonce.titre}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="select-none text-8xl font-bold text-primary/10">
                {annonce.titre.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 lg:col-span-2 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-xl font-bold text-primary md:text-2xl">
                {annonce.titre}
              </h1>
              <p className="mt-1 text-2xl font-bold text-primary md:text-3xl">
                {formaterPrix(annonce.prix, annonce.devise, usdCdfRate)}
              </p>
              {annonce.devise === "USD" && (
                <p className="text-sm text-muted">
                  ~{formaterPrix(annonce.prix, "CDF", usdCdfRate)}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                annonce.status === "disponible"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {annonce.status}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted">
              {annonce.commune}
            </span>
            <span className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted">
              {annonce.super_repere}
            </span>
            {annonce.mode_livraison_vendeur && (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                Livraison possible
              </span>
            )}
            <span className="rounded-full border border-border bg-white px-3 py-1 text-xs text-muted">
              {annonce.categorie}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="font-heading text-base font-semibold text-primary">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-muted">
              {annonce.description}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="font-heading text-base font-semibold text-primary">
              Livraison
            </h2>
            <ul className="mt-2 space-y-1.5 text-base text-muted">
              {annonce.mode_main_propre && (
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700" aria-hidden="true">
                    <Check className="h-3 w-3" />
                  </span>
                  Remise en main propre possible
                </li>
              )}
              {annonce.mode_livraison_vendeur && (
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700" aria-hidden="true">
                    <Check className="h-3 w-3" />
                  </span>
                  Livraison à domicile disponible
                  {annonce.frais_livraison > 0 && (
                    <span className="text-muted">
                      ({annonce.frais_livraison.toLocaleString()} {annonce.devise === "CDF" ? "FC" : "$"})
                    </span>
                  )}
                </li>
              )}
            </ul>
          </div>

          <div className="mt-6">
            <p className="text-base text-muted">
              Publiée le{" "}
              {new Date(annonce.$createdAt).toLocaleDateString("fr-CD")} ·{" "}
              {annonce.views_count} vues
            </p>
          </div>

          <button
            onClick={handleWhatsApp}
            disabled={!sellerPhone || whatsappLoading}
            aria-label={`Contacter le vendeur sur WhatsApp à propos de ${annonce.titre}`}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-success px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {whatsappLoading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Ouverture...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contacter sur WhatsApp
              </>
            )}
          </button>
          {!sellerPhone && !loading && (
            <p className="mt-2 text-center text-xs text-muted">
              Le numéro du vendeur n&apos;est pas disponible.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

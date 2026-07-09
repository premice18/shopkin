"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, notFound, useRouter } from "next/navigation";
import { tablesDB } from "@/lib/appwrite";
import { DATABASE_ID, ANNONCES_COLLECTION_ID, PROFILES_COLLECTION_ID } from "@/lib/constants";
import type { AnnonceDocument } from "@/lib/types";
import { useAppwrite, formaterPrix } from "@/lib/contexts/AppwriteContext";
import { getAnnonceImageUrl, getAvatarUrl } from "@/lib/images";
import Logo from "@/components/ui/Logo";
import Avatar from "@/components/ui/Avatar";

export default function AnnoncePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { usdCdfRate } = useAppwrite();
  const [annonce, setAnnonce] = useState<AnnonceDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerPhone, setSellerPhone] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState("");
  const [sellerUsername, setSellerUsername] = useState("");
  const [sellerAvatar, setSellerAvatar] = useState<string | null>(null);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  // État pour la galerie multi-images : image courante
  const [currentImage, setCurrentImage] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

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
        setSellerName((p.prenom && p.nom ? `${p.prenom} ${p.nom}` : (p.full_name as string)) || "");
        setSellerUsername((p.username as string) || "");
        setSellerAvatar(getAvatarUrl((p.avatar_url as string) || ""));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params.id]);

  // Inclut le lien de l'annonce dans le message WhatsApp pour que l'acheteur
  // puisse voir la photo et les détails en un clic depuis la conversation
  const handleWhatsApp = () => {
    if (!annonce || !sellerPhone) return;
    setWhatsappLoading(true);
    const phoneClean = sellerPhone.replace(/[^0-9]/g, "");
    const url = `${window.location.origin}/annonce/${params.id}`;
    const message = `Bonjour, je suis intéressé(e) par votre annonce «${annonce.titre}». Est-elle toujours disponible ? ${url}`;
    const text = encodeURIComponent(message);
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

  // Galerie : construit les URLs de toutes les images de l'annonce (full quality pour la page détail)
  const imagesUrls: string[] =
    annonce.images_storage_paths && annonce.images_storage_paths.length > 0
      ? annonce.images_storage_paths.map((path) => getAnnonceImageUrl(path)).filter((url): url is string => url !== null)
      : [];

  const prevImage = () => setCurrentImage((p) => (p > 0 ? p - 1 : imagesUrls.length - 1));
  const nextImage = () => setCurrentImage((p) => (p < imagesUrls.length - 1 ? p + 1 : 0));

  const getDeliveryFeeDisplay = (): string => {
    if (!annonce.mode_livraison_vendeur || !annonce.frais_livraison) return "";
    const deviseFrais = annonce.devise_frais;
    if (deviseFrais === "CDF" || deviseFrais === "USD") {
      return formaterPrix(annonce.frais_livraison, deviseFrais, usdCdfRate);
    }
    return formaterPrix(annonce.frais_livraison, annonce.devise, usdCdfRate);
  };

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center rounded-full p-1 text-muted hover:bg-surface transition-colors"
            aria-label="Retour"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <Logo className="text-lg" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-4 lg:grid lg:grid-cols-5 lg:gap-8">
        {/* Galerie multi-images : carrousel avec navigation et miniatures */}
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-white shadow-sm md:aspect-[16/9] lg:aspect-[4/3]">
            {imagesUrls.length > 0 && !imgErrors[currentImage] ? (
              <>
                <img
                  src={imagesUrls[currentImage]}
                  alt={`${annonce.titre} — image ${currentImage + 1}`}
                  className="h-full w-full object-cover transition-opacity"
                  onError={() => setImgErrors((prev) => ({ ...prev, [currentImage]: true }))}
                />
                {imagesUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm hover:bg-white transition"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm hover:bg-white transition"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {imagesUrls.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`h-2 w-2 rounded-full transition ${
                            i === currentImage ? "bg-white shadow-sm" : "bg-white/50"
                          }`}
                          aria-label={`Image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="select-none text-8xl font-bold text-primary/10">
                  {annonce.titre.charAt(0)}
                </span>
              </div>
            )}
          </div>
          {imagesUrls.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {imagesUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === currentImage ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                <img src={url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </button>
            ))}
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

          {/* Vendeur : lien vers le profil public */}
          {sellerName && (
            <div className="mt-6 rounded-xl border border-border bg-white p-4">
              <Link
                href={`/vendeur/${sellerUsername || annonce.vendeur_id}`}
                className="flex items-center gap-3 transition hover:opacity-80"
              >
                <Avatar src={sellerAvatar} alt={sellerName} size={44} fallbackName={sellerName} />
                <div>
                  <p className="text-sm font-semibold text-primary">{sellerName}</p>
                  {sellerUsername && (
                    <p className="text-xs text-muted">@{sellerUsername}</p>
                  )}
                </div>
              </Link>
            </div>
          )}

          <div className="mt-4">
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
                      ({getDeliveryFeeDisplay()})
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

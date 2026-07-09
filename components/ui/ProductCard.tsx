"use client";

import Link from "next/link";
import { useState } from "react";
import type { AnnonceDocument } from "@/lib/types";
import { useAppwrite, formaterPrix } from "@/lib/contexts/AppwriteContext";
import { getAnnonceImagePreviewUrl } from "@/lib/images";

interface ProductCardProps {
  annonce: AnnonceDocument;
  devise: "USD" | "CDF";
}

export default function ProductCard({ annonce, devise }: ProductCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { usdCdfRate } = useAppwrite();

  const hasLivraison = annonce.mode_livraison_vendeur;
  // Utilise le preview (taille réduite) pour les cartes catalogue : plus rapide à charger
  const imageUrl = getAnnonceImagePreviewUrl(annonce.images_storage_paths?.[0], 300, 300);
  const showImage = imageUrl && !imgError;

  return (
    <Link
      href={`/annonce/${annonce.$id}`}
      className="group block overflow-hidden rounded-[16px] bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
        {showImage ? (
          <img
            src={imageUrl}
            alt={annonce.titre}
            loading="lazy"
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setLoaded(true)}
            onError={() => { setImgError(true); setLoaded(true); }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center"
            style={{ opacity: loaded ? 1 : 0 }}
          >
            <span className="select-none text-5xl font-bold text-primary/10">
              {annonce.titre.charAt(0)}
            </span>
          </div>
        )}
        {hasLivraison && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-primary shadow-sm">
            Livraison
          </span>
        )}
        {annonce.status !== "disponible" && (
          <span className="absolute right-2 top-2 rounded-full bg-danger px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            {annonce.status}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4">
        <h3 className="font-heading text-sm font-semibold leading-snug text-primary line-clamp-2">
          {annonce.titre}
        </h3>
        <p className="mt-1.5 text-lg font-bold text-primary">
          {formaterPrix(annonce.prix, devise, usdCdfRate)}
        </p>
        <p className="mt-1 text-xs text-muted">
          {annonce.commune}, {annonce.super_repere}
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{annonce.views_count}</span>
        </div>
      </div>
    </Link>
  );
}

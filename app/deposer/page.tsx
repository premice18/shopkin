"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ID } from "appwrite";
import { tablesDB, storage } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/contexts/ToastContext";
import { DATABASE_ID, ANNONCES_COLLECTION_ID, STORAGE_BUCKET_ID } from "@/lib/constants";
import { categories, communes, superReperes } from "@/lib/constants";

function compressImage(file: File, maxWidth = 1080): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas context not available")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
          } else {
            reject(new Error("Compression failed"));
          }
        },
        "image/webp",
        0.8,
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = URL.createObjectURL(file);
  });
}

export default function DeposerPage() {
  const { user, loading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [devise, setDevise] = useState<"USD" | "CDF">("USD");
  const [commune, setCommune] = useState("");
  const [superRepere, setSuperRepere] = useState("");
  const [modeLivraison, setModeLivraison] = useState(false);
  const [fraisLivraison, setFraisLivraison] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f)));
      setImages(compressed);
      setImagePreviews(compressed.map((f) => URL.createObjectURL(f)));
    } catch {
      setImages(files);
      setImagePreviews(files.map((f) => URL.createObjectURL(f)));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!titre.trim()) errs.titre = "Le titre est obligatoire";
    if (!categorie) errs.categorie = "Sélectionnez une catégorie";
    if (!description.trim()) errs.description = "La description est obligatoire";
    if (!prix || Number(prix) <= 0) errs.prix = "Le prix doit être supérieur à 0";
    if (!commune) errs.commune = "Sélectionnez une commune";
    if (!superRepere.trim()) errs.superRepere = "Le super-repère est obligatoire";
    if (modeLivraison && (!fraisLivraison || Number(fraisLivraison) < 0)) {
      errs.fraisLivraison = "Indiquez les frais de livraison";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;

    setUploading(true);
    setError("");

    try {
      const imagePaths: string[] = [];
      for (const file of images) {
        const uploaded = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), file);
        imagePaths.push(uploaded.$id);
      }

      const doc = await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: ANNONCES_COLLECTION_ID,
        rowId: ID.unique(),
        data: {
          vendeur_id: user.$id,
          titre: titre.trim(),
          categorie,
          description: description.trim(),
          prix: Number(prix),
          devise,
          commune,
          super_repere: superRepere.trim(),
          images_storage_paths: imagePaths,
          mode_main_propre: true,
          mode_livraison_vendeur: modeLivraison,
          frais_livraison: modeLivraison ? Number(fraisLivraison) : 0,
          requires_delivery_deposit: false,
          status: "disponible",
          views_count: 0,
        },
      });

      success("🎉 Annonce publiée avec succès !");
      await new Promise((r) => setTimeout(r, 600));
      router.push(`/annonce/${doc.$id}`);
    } catch {
      setError("Erreur lors de la publication. Veuillez réessayer.");
      toastError("❌ Erreur lors de la publication. Vérifie ta connexion et réessaie.");
    } finally {
      setUploading(false);
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

  const renderField = (id: string, label: string, error: string | undefined, children: React.ReactNode) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-primary">{label}</label>
      {children}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <header className="bg-primary px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4 lg:max-w-3xl">
          <button onClick={() => router.back()} className="text-white/70 hover:text-white" aria-label="Retour">
            &larr;
          </button>
          <h1 className="text-lg font-bold text-white">Publier une annonce</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 lg:max-w-3xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Titre */}
          {renderField("titre", "Titre", fieldErrors.titre,
            <input
              id="titre" type="text" maxLength={150} value={titre}
              onChange={(e) => { setTitre(e.target.value); setFieldErrors((p) => ({ ...p, titre: "" })); }}
              aria-invalid={!!fieldErrors.titre}
              aria-describedby={fieldErrors.titre ? "titre-error" : undefined}
              className={`rounded-xl border px-4 py-3 text-sm ${fieldErrors.titre ? "border-danger" : "border-border"}`}
              placeholder="Ex: iPhone 14 Pro Max 256GB"
            />
          )}

          {/* Catégorie */}
          {renderField("categorie", "Catégorie", fieldErrors.categorie,
            <select
              id="categorie" value={categorie}
              onChange={(e) => { setCategorie(e.target.value); setFieldErrors((p) => ({ ...p, categorie: "" })); }}
              aria-invalid={!!fieldErrors.categorie}
              className={`rounded-xl border px-4 py-3 text-sm ${fieldErrors.categorie ? "border-danger" : "border-border"}`}
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          )}

          {/* Description */}
          {renderField("description", "Description", fieldErrors.description,
            <textarea
              id="description" maxLength={10000} rows={5} value={description}
              onChange={(e) => { setDescription(e.target.value); setFieldErrors((p) => ({ ...p, description: "" })); }}
              aria-invalid={!!fieldErrors.description}
              className={`rounded-xl border px-4 py-3 text-sm resize-none ${fieldErrors.description ? "border-danger" : "border-border"}`}
              placeholder="Décrivez votre produit en détail..."
            />
          )}

          {/* Prix + Devise */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              {renderField("prix", "Prix", fieldErrors.prix,
                <input
                  id="prix" type="number" min={0} step="any" value={prix}
                  onChange={(e) => { setPrix(e.target.value); setFieldErrors((p) => ({ ...p, prix: "" })); }}
                  aria-invalid={!!fieldErrors.prix}
                  className={`rounded-xl border px-4 py-3 text-sm ${fieldErrors.prix ? "border-danger" : "border-border"}`}
                  placeholder="0"
                />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-primary">Devise</label>
              <div className="flex overflow-hidden rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setDevise("USD")}
                  className={`px-4 py-3 text-sm font-semibold transition ${
                    devise === "USD" ? "bg-accent text-primary" : "bg-white text-muted"
                  }`}
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => setDevise("CDF")}
                  className={`px-4 py-3 text-sm font-semibold transition ${
                    devise === "CDF" ? "bg-accent text-primary" : "bg-white text-muted"
                  }`}
                >
                  CDF
                </button>
              </div>
            </div>
          </div>

          {/* Commune */}
          {renderField("commune", "Commune", fieldErrors.commune,
            <select
              id="commune" value={commune}
              onChange={(e) => { setCommune(e.target.value); setFieldErrors((p) => ({ ...p, commune: "" })); }}
              aria-invalid={!!fieldErrors.commune}
              className={`rounded-xl border px-4 py-3 text-sm ${fieldErrors.commune ? "border-danger" : "border-border"}`}
            >
              <option value="">Sélectionnez une commune</option>
              {communes.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          )}

          {/* Super-repère */}
          {renderField("superRepere", "Super-repère", fieldErrors.superRepere,
            <select
              id="superRepere" value={superRepere}
              onChange={(e) => { setSuperRepere(e.target.value); setFieldErrors((p) => ({ ...p, superRepere: "" })); }}
              aria-invalid={!!fieldErrors.superRepere}
              className={`rounded-xl border px-4 py-3 text-sm ${fieldErrors.superRepere ? "border-danger" : "border-border"}`}
            >
              <option value="">Sélectionnez un super-repère</option>
              {superReperes.map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>
          )}

          {/* Livraison */}
          <fieldset className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <legend className="text-sm font-semibold text-primary">Livraison</legend>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={modeLivraison}
                onChange={(e) => setModeLivraison(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm text-muted">Je peux livrer</span>
            </label>
            {modeLivraison && (
              <div className="mt-3 flex flex-col gap-1">
                <label htmlFor="fraisLivraison" className="text-xs text-muted">
                  Frais de livraison
                </label>
                <input
                  id="fraisLivraison"
                  type="number"
                  min={0}
                  value={fraisLivraison}
                  onChange={(e) => { setFraisLivraison(e.target.value); setFieldErrors((p) => ({ ...p, fraisLivraison: "" })); }}
                  aria-invalid={!!fieldErrors.fraisLivraison}
                  className={`rounded-xl border px-4 py-2.5 text-sm ${fieldErrors.fraisLivraison ? "border-danger" : "border-border"}`}
                  placeholder="0"
                />
                {fieldErrors.fraisLivraison && <p role="alert" className="text-sm text-danger">{fieldErrors.fraisLivraison}</p>}
              </div>
            )}
          </fieldset>

          {/* Images */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-primary">Images (max 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="text-sm text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative">
                    <img src={preview} alt="" className="h-20 w-20 rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white"
                      aria-label={`Supprimer l'image ${i + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Publication...
              </>
            ) : (
              "Publier l'annonce"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

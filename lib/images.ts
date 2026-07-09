// Utilitaire centralisé pour la génération d'URLs d'images Appwrite
// Permet d'éviter la duplication du pattern de construction d'URL dans tout le code
// et de corriger les erreurs de permissions en un seul endroit
//
// IMPORTANT — Si les images ne s'affichent pas, vérifie dans la console Appwrite :
//   Storage → bucket `annonces-images` → Settings → Permissions Read → cocher "Any"
//   ET vérifier que "File Security" est activé (ON) pour que les permissions individuelles
//   des fichiers (Permission.read(Role.any())) soient respectées.

import { STORAGE_BUCKET_ID, AVATARS_BUCKET_ID } from "@/lib/constants";

/**
 * Construit une URL publique pour visualiser un fichier Appwrite.
 * Si fileId commence déjà par "http", le retourne tel quel (URL externe).
 */
export function getFileUrl(bucketId: string, fileId: string | null | undefined): string | null {
  if (!fileId) return null;
  if (fileId.startsWith("http")) return fileId;
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
}

/**
 * Construit une URL de prévisualisation avec dimensions (utile pour les listes / cartes).
 * L'API preview d'Appwrite redimensionne l'image côté serveur, réduisant le poids.
 */
export function getFilePreviewUrl(
  bucketId: string,
  fileId: string | null | undefined,
  width = 400,
  height = 400,
): string | null {
  if (!fileId) return null;
  if (fileId.startsWith("http")) return fileId;
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&width=${width}&height=${height}`;
}

// Raccourcis pour le bucket des annonces (utilisé aussi pour les avatars)
export function getAnnonceImageUrl(fileId: string | null | undefined): string | null {
  return getFileUrl(STORAGE_BUCKET_ID, fileId);
}

export function getAnnonceImagePreviewUrl(fileId: string | null | undefined, width = 300, height = 300): string | null {
  return getFilePreviewUrl(STORAGE_BUCKET_ID, fileId, width, height);
}

export function getAvatarUrl(fileId: string | null | undefined): string | null {
  return getFileUrl(AVATARS_BUCKET_ID, fileId);
}

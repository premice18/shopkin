export const DATABASE_ID = "shopkin";
export const PROFILES_COLLECTION_ID = "profiles";
export const ANNONCES_COLLECTION_ID = "annonces";
export const PARAMETRES_COLLECTION_ID = "parametres";
export const STORAGE_BUCKET_ID = "annonces-images";
export const AVATARS_BUCKET_ID = "annonces-images"; // même bucket que les annonces (limite Appwrite gratuit)
export const PAYMENT_METHODS_COLLECTION_ID = "payment_methods";

export const categories = [
  "Téléphones",
  "Électroménager",
  "Mode",
  "Véhicules",
  "Maison",
  "Enfants",
  "Autres",
] as const;

export const communes = [
  "Gombe", "Kinshasa", "Lemba", "Ngaliema", "Kasa-Vubu",
  "Matete", "Limete", "Barumbu", "Bandalungwa", "Bumbu",
  "Kintambo", "Kisenso", "Lingwala", "Makala", "Maluku",
  "Masina", "Mont Ngafula", "Ndjili", "Ngaba", "Ngiri-Ngiri",
  "Nsele", "Selembao",
] as const;

export const superReperes = [
  "Rond-point Moulaert", "Marché Central", "UPN",
  "Ngiri-Ngiri rond-point", "Gare Centrale", "Place des Évolués",
  "Rond-point Victoire", "Palais de la Nation", "Stade des Martyrs",
  "Aéroport de Ndjili",
] as const;

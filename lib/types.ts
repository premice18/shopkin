import type { Models } from "appwrite";

export interface AnnonceDocument extends Models.Document {
  vendeur_id: string;
  titre: string;
  description: string;
  categorie: string;
  prix: number;
  devise: "USD" | "CDF";
  commune: string;
  super_repere: string;
  images_storage_paths: string[];
  mode_main_propre: boolean;
  mode_livraison_vendeur: boolean;
  frais_livraison: number;
  requires_delivery_deposit: boolean;
  status: "disponible" | "réservé" | "vendu";
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileDocument extends Models.Document {
  full_name: string;
  prenom: string;
  nom: string;
  avatar_url: string;
  whatsapp_number: string;
  commune_defaut: string;
  sexe: string;
  date_naissance: string;
  has_password: boolean;
  m_pesa_registered: boolean;
  airtel_money_registered: boolean;
  orange_money_registered: boolean;
  created_at: string;
}

export interface ParametresDocument extends Models.Document {
  usd_cdf_rate: number;
  updated_at: string;
}

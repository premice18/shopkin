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
  devise_frais?: "USD" | "CDF";
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
  role: "user" | "admin";
  suspended: boolean;
  created_at: string;
}

export interface ParametresDocument extends Models.Document {
  usd_cdf_rate: number;
  updated_at: string;
}

export type PaymentMethodType = "mobile_money" | "card";
export type MobileMoneyProvider = "orange_money" | "m_pesa" | "airtel_money";
export type CardProvider = "visa" | "mastercard" | "amex";

export interface PaymentMethodDocument extends Models.Document {
  user_id: string;
  type: PaymentMethodType;
  provider: MobileMoneyProvider | CardProvider;
  label: string;
  phone_number: string;
  card_holder_name: string;
  card_last_four: string;
  card_expiry_month: number;
  card_expiry_year: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

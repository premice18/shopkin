import { databases } from "./appwrite";

const DATABASE_ID = "shopkin";
const PROFILES_COLLECTION_ID = "profiles";

export async function ensureProfile(
  userId: string,
  phone: string,
): Promise<Record<string, unknown>> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, PROFILES_COLLECTION_ID, userId);
    return doc;
  } catch {
    const doc = await databases.createDocument(
      DATABASE_ID,
      PROFILES_COLLECTION_ID,
      userId,
      {
        full_name: "Nouvel utilisateur",
        prenom: "",
        nom: "",
        whatsapp_number: phone,
        commune_defaut: "",
        sexe: "",
        date_naissance: "",
        has_password: false,
        m_pesa_registered: false,
        airtel_money_registered: false,
        orange_money_registered: false,
      },
    );
    return doc;
  }
}

export async function getProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, PROFILES_COLLECTION_ID, userId);
    return doc;
  } catch {
    return null;
  }
}

export async function updateProfile(
  userId: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const doc = await databases.updateDocument(DATABASE_ID, PROFILES_COLLECTION_ID, userId, data);
  return doc;
}

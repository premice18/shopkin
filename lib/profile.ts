import { databases } from "./appwrite";

const DATABASE_ID = "shopkin";
const PROFILES_COLLECTION_ID = "profiles";

export async function ensureProfile(
  userId: string,
  email: string,
  username: string,
): Promise<Record<string, unknown>> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, PROFILES_COLLECTION_ID, userId);
    return doc;
  } catch {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        userId,
        {
          username: username.toLowerCase().trim(),
          email,
          email_verified: false,
          full_name: "",
          prenom: "",
          nom: "",
          avatar_url: "",
          whatsapp_number: "",
          commune_defaut: "",
          sexe: "",
          date_naissance: "",
          google_id: "",
          profile_complete: false,
          has_password: false,
          m_pesa_registered: false,
          airtel_money_registered: false,
          orange_money_registered: false,
        },
      );
      return doc;
    } catch (createErr: unknown) {
      const msg = createErr instanceof Error ? createErr.message : String(createErr);
      throw new Error(`Échec création profil : ${msg}`);
    }
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

import { tablesDB } from "./appwrite";

const DATABASE_ID = "shopkin";
const PROFILES_COLLECTION_ID = "profiles";

export async function ensureProfile(
  userId: string,
  email: string,
  username: string,
): Promise<Record<string, unknown>> {
  try {
    const doc = await tablesDB.getRow({ databaseId: DATABASE_ID, tableId: PROFILES_COLLECTION_ID, rowId: userId });
    return doc;
  } catch {
    try {
      const doc = await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: PROFILES_COLLECTION_ID,
        rowId: userId,
        data: {
          username: username.toLowerCase().trim(),
          email,
          email_verified: false,
          role: "user",
          full_name: "",
          prenom: "",
          nom: "",
          avatar_url: "",
          whatsapp_number: "",
          commune_defaut: "",
          sexe: "",
          date_naissance: "",
          profile_complete: false,
          has_password: false,
          m_pesa_registered: false,
          airtel_money_registered: false,
          orange_money_registered: false,
        },
      });
      return doc;
    } catch (createErr: unknown) {
      const msg = createErr instanceof Error ? createErr.message : String(createErr);
      throw new Error(`Échec création profil : ${msg}`);
    }
  }
}

export async function getProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const doc = await tablesDB.getRow({ databaseId: DATABASE_ID, tableId: PROFILES_COLLECTION_ID, rowId: userId });
    return doc;
  } catch {
    return null;
  }
}

export async function updateProfile(
  userId: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const doc = await tablesDB.updateRow({ databaseId: DATABASE_ID, tableId: PROFILES_COLLECTION_ID, rowId: userId, data });
  return doc;
}

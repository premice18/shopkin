import { Client, Account } from "appwrite";
import { serverTablesDB } from "./appwrite-server";
import { DATABASE_ID, PROFILES_COLLECTION_ID } from "./constants";

export async function verifyAdmin(
  jwt: string | null
): Promise<{ userId: string; error: null } | { userId: null; error: string; status: number }> {
  if (!jwt) {
    return { userId: null, error: "Token manquant", status: 401 };
  }

  try {
    const jwtClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setJWT(jwt);

    const jwtAccount = new Account(jwtClient);
    const user = await jwtAccount.get();
    const userId = user.$id;

    const profile = await serverTablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: PROFILES_COLLECTION_ID,
      rowId: userId,
    });

    if ((profile as { role?: string }).role !== "admin") {
      return { userId: null, error: "Accès non autorisé", status: 403 };
    }

    return { userId, error: null };
  } catch {
    return { userId: null, error: "Token invalide ou expiré", status: 401 };
  }
}

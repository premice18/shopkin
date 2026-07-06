import { NextRequest, NextResponse } from "next/server";
import { AppwriteException } from "appwrite";
import { verifyAdmin } from "@/lib/admin-server";
import { serverTablesDB } from "@/lib/appwrite-server";
import { DATABASE_ID, PARAMETRES_COLLECTION_ID } from "@/lib/constants";

const GLOBAL_DOC_ID = "global";

// Valeurs par défaut utilisées si le document global n'existe pas encore
const DEFAULT_SETTINGS: Record<string, unknown> = {
  usd_cdf_rate: 2800,
  max_images_per_annonce: 5,
  platform_fee_percent: 0,
  maintenance_mode: false,
  welcome_message: "Bienvenue sur ShopKin !",
  categories: ["Téléphones", "Électroménager", "Mode", "Véhicules", "Maison", "Enfants", "Autres"],
};

// Tente de récupérer le document global ; s'il n'existe pas, le crée avec les valeurs par défaut.
// On distingue l'erreur "document_not_found" des autres erreurs pour ne créer le document
// que lorsque c'est réellement nécessaire (évite de masquer une vraie erreur Appwrite
// comme une permission manquante ou une collection inexistante).
async function getOrCreateSettings(): Promise<Record<string, unknown>> {
  try {
    return await serverTablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: PARAMETRES_COLLECTION_ID,
      rowId: GLOBAL_DOC_ID,
    });
  } catch (err) {
    // Si le document n'existe tout simplement pas, on le crée avec les valeurs par défaut
    if (err instanceof AppwriteException && (err.type === "document_not_found" || err.code === 404)) {
      return await serverTablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: PARAMETRES_COLLECTION_ID,
        rowId: GLOBAL_DOC_ID,
        data: DEFAULT_SETTINGS,
      });
    }
    // Pour toute autre erreur, on la propage (permission manquante, mauvaise config, etc.)
    throw err;
  }
}

export async function GET(request: NextRequest) {
  const jwt = request.headers.get("authorization")?.replace("Bearer ", "") || null;
  const auth = await verifyAdmin(jwt);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const doc = await getOrCreateSettings();
    return NextResponse.json({ settings: doc });
  } catch (err: unknown) {
    // On détaille au maximum l'erreur Appwrite pour faciliter le diagnostic côté serveur
    const msg = err instanceof AppwriteException
      ? `Appwrite [${err.type}] (${err.code}) : ${err.message}`
      : err instanceof Error
        ? err.message
        : "Erreur inconnue";
    console.error("[GET /api/admin/settings]", msg);
    return NextResponse.json({ error: `Erreur lors de la récupération des paramètres : ${msg}` }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const jwt = request.headers.get("authorization")?.replace("Bearer ", "") || null;
  const auth = await verifyAdmin(jwt);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.usd_cdf_rate === "number" && body.usd_cdf_rate > 0) {
      updates.usd_cdf_rate = body.usd_cdf_rate;
    }

    if (typeof body.max_images_per_annonce === "number" && body.max_images_per_annonce >= 1 && body.max_images_per_annonce <= 20) {
      updates.max_images_per_annonce = body.max_images_per_annonce;
    }

    if (typeof body.platform_fee_percent === "number" && body.platform_fee_percent >= 0 && body.platform_fee_percent <= 100) {
      updates.platform_fee_percent = body.platform_fee_percent;
    }

    if (typeof body.maintenance_mode === "boolean") {
      updates.maintenance_mode = body.maintenance_mode;
    }

    if (typeof body.welcome_message === "string" && body.welcome_message.trim().length > 0) {
      updates.welcome_message = body.welcome_message.trim();
    }

    if (Array.isArray(body.categories) && body.categories.length > 0) {
      updates.categories = body.categories.map((c: string) => c.trim()).filter(Boolean);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Aucune modification valide" }, { status: 400 });
    }

    // S'assurer que le document global existe avant la mise à jour
    await getOrCreateSettings();

    const updated = await serverTablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: PARAMETRES_COLLECTION_ID,
      rowId: GLOBAL_DOC_ID,
      data: updates,
    });

    return NextResponse.json({ settings: updated, message: "Paramètre(s) mis à jour avec succès." });
  } catch (err: unknown) {
    // On détaille au maximum l'erreur Appwrite pour faciliter le diagnostic côté serveur
    const msg = err instanceof AppwriteException
      ? `Appwrite [${err.type}] (${err.code}) : ${err.message}`
      : err instanceof Error
        ? err.message
        : "Erreur inconnue";
    console.error("[PATCH /api/admin/settings]", msg);
    return NextResponse.json({ error: `Erreur lors de la mise à jour des paramètres : ${msg}` }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Query } from "appwrite";
import { serverTablesDB } from "@/lib/appwrite-server";
import { DATABASE_ID, PROFILES_COLLECTION_ID } from "@/lib/constants";

// API publique : renvoie les informations publiques d'un vendeur à partir de son username
// Ne retourne PAS les données sensibles (email, téléphone, moyens de paiement)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Username requis" }, { status: 400 });
  }

  try {
    const res = await serverTablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: PROFILES_COLLECTION_ID,
      queries: [Query.equal("username", username.toLowerCase().trim()), Query.limit(1)],
    });

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Vendeur introuvable" }, { status: 404 });
    }

    const p = res.rows[0] as Record<string, unknown>;
    // On ne renvoie que les champs publics
    return NextResponse.json({
      profile: {
        id: p.$id,
        username: p.username,
        prenom: p.prenom,
        nom: p.nom,
        full_name: p.full_name || `${p.prenom || ""} ${p.nom || ""}`.trim(),
        avatar_url: p.avatar_url,
        commune_defaut: p.commune_defaut,
        sexe: p.sexe,
        date_inscription: p.$createdAt,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération du profil" }, { status: 500 });
  }
}

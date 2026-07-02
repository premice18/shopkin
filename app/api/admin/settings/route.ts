import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-server";
import { serverTablesDB } from "@/lib/appwrite-server";
import { DATABASE_ID, PARAMETRES_COLLECTION_ID } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const jwt = request.headers.get("authorization")?.replace("Bearer ", "") || null;
  const auth = await verifyAdmin(jwt);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const doc = await serverTablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: PARAMETRES_COLLECTION_ID,
      rowId: "global",
    });

    return NextResponse.json({ settings: doc });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération des paramètres" }, { status: 500 });
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

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Aucune modification valide" }, { status: 400 });
    }

    const updated = await serverTablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: PARAMETRES_COLLECTION_ID,
      rowId: "global",
      data: updates,
    });

    return NextResponse.json({ settings: updated });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour des paramètres" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Query } from "appwrite";
import { verifyAdmin } from "@/lib/admin-server";
import { serverTablesDB } from "@/lib/appwrite-server";
import { DATABASE_ID, ANNONCES_COLLECTION_ID } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const jwt = request.headers.get("authorization")?.replace("Bearer ", "") || null;
  const auth = await verifyAdmin(jwt);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const categorie = searchParams.get("categorie") || "";
    const search = searchParams.get("search") || "";

    const queries: string[] = [Query.orderDesc("$createdAt"), Query.limit(100)];

    if (status && ["disponible", "réservé", "vendu"].includes(status)) {
      queries.push(Query.equal("status", status));
    }
    if (categorie) {
      queries.push(Query.equal("categorie", categorie));
    }
    if (search) {
      queries.push(Query.contains("titre", search));
    }

    const res = await serverTablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ANNONCES_COLLECTION_ID,
      queries,
    });

    return NextResponse.json({ annonces: res.rows, total: res.total || 0 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération des annonces" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const jwt = request.headers.get("authorization")?.replace("Bearer ", "") || null;
  const auth = await verifyAdmin(jwt);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { annonceId } = await request.json();
    if (!annonceId) {
      return NextResponse.json({ error: "annonceId requis" }, { status: 400 });
    }

    await serverTablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: ANNONCES_COLLECTION_ID,
      rowId: annonceId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

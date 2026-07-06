import { NextRequest, NextResponse } from "next/server";
import { Query } from "appwrite";
import { verifyAdmin } from "@/lib/admin-server";
import { serverTablesDB } from "@/lib/appwrite-server";
import { DATABASE_ID, PROFILES_COLLECTION_ID, ANNONCES_COLLECTION_ID } from "@/lib/constants";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const jwt = request.headers.get("authorization")?.replace("Bearer ", "") || null;
  const auth = await verifyAdmin(jwt);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const profile = await serverTablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: PROFILES_COLLECTION_ID,
      rowId: id,
    });

    const annoncesRes = await serverTablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ANNONCES_COLLECTION_ID,
      queries: [Query.equal("vendeur_id", id), Query.orderDesc("$createdAt"), Query.limit(50)],
    });

    return NextResponse.json({ user: profile, annonces: annoncesRes.rows });
  } catch {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const jwt = request.headers.get("authorization")?.replace("Bearer ", "") || null;
  const auth = await verifyAdmin(jwt);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.role && (body.role === "user" || body.role === "admin")) {
      updates.role = body.role;
    }
    if (typeof body.suspended === "boolean") {
      updates.suspended = body.suspended;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Aucune modification valide" }, { status: 400 });
    }

    const updated = await serverTablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: PROFILES_COLLECTION_ID,
      rowId: id,
      data: updates,
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const jwt = request.headers.get("authorization")?.replace("Bearer ", "") || null;
  const auth = await verifyAdmin(jwt);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;

    const annoncesRes = await serverTablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ANNONCES_COLLECTION_ID,
      queries: [Query.equal("vendeur_id", id), Query.limit(100)],
    });

    await Promise.all([
      ...annoncesRes.rows.map((a: { $id: string }) =>
        serverTablesDB.deleteRow({
          databaseId: DATABASE_ID,
          tableId: ANNONCES_COLLECTION_ID,
          rowId: a.$id,
        }).catch(() => {})
      ),
      serverTablesDB.deleteRow({
        databaseId: DATABASE_ID,
        tableId: PROFILES_COLLECTION_ID,
        rowId: id,
      }).catch(() => {}),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

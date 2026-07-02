import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-server";
import { serverTablesDB } from "@/lib/appwrite-server";
import { DATABASE_ID, ANNONCES_COLLECTION_ID } from "@/lib/constants";

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

    if (body.status && ["disponible", "réservé", "vendu"].includes(body.status)) {
      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Aucune modification valide" }, { status: 400 });
    }

    const updated = await serverTablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: ANNONCES_COLLECTION_ID,
      rowId: id,
      data: updates,
    });

    return NextResponse.json({ annonce: updated });
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
    await serverTablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: ANNONCES_COLLECTION_ID,
      rowId: id,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

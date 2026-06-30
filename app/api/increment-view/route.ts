import { NextRequest, NextResponse } from "next/server";
import { serverDatabases } from "@/lib/appwrite-server";
import { DATABASE_ID, ANNONCES_COLLECTION_ID } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const { annonceId } = await request.json();
    if (!annonceId) {
      return NextResponse.json({ error: "annonceId required" }, { status: 400 });
    }

    const doc = await serverDatabases.getDocument(DATABASE_ID, ANNONCES_COLLECTION_ID, annonceId);
    const currentViews = (doc.views_count as number) || 0;

    await serverDatabases.updateDocument(DATABASE_ID, ANNONCES_COLLECTION_ID, annonceId, {
      views_count: currentViews + 1,
    });

    return NextResponse.json({ success: true, views: currentViews + 1 });
  } catch {
    return NextResponse.json({ error: "Failed to increment views" }, { status: 500 });
  }
}

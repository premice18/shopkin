import { NextRequest, NextResponse } from "next/server";
import { serverDatabases } from "@/lib/appwrite-server";
import { DATABASE_ID, PROFILES_COLLECTION_ID } from "@/lib/constants";
import { Query } from "appwrite";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "phone required" }, { status: 400 });
    }

    const res = await serverDatabases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID, [
      Query.equal("whatsapp_number", phone),
      Query.limit(1),
    ]);

    if (res.documents.length > 0) {
      const doc = res.documents[0];
      return NextResponse.json({
        exists: true,
        userId: doc.$id,
        name: (doc.full_name as string) || undefined,
        hasPassword: (doc.has_password as boolean) || false,
      });
    }

    return NextResponse.json({ exists: false });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

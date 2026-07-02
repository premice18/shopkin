import { NextRequest, NextResponse } from "next/server";
import { Query } from "appwrite";
import { verifyAdmin } from "@/lib/admin-server";
import { serverTablesDB } from "@/lib/appwrite-server";
import { DATABASE_ID, PROFILES_COLLECTION_ID } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const jwt = request.headers.get("authorization")?.replace("Bearer ", "") || null;
  const auth = await verifyAdmin(jwt);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const queries: string[] = [Query.orderDesc("$createdAt"), Query.limit(100)];

    if (role && (role === "user" || role === "admin")) {
      queries.push(Query.equal("role", role));
    }

    if (search) {
      queries.push(Query.or([
        Query.contains("full_name", search),
        Query.contains("email", search),
        Query.contains("username", search),
      ]));
    }

    const res = await serverTablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: PROFILES_COLLECTION_ID,
      queries,
    });

    return NextResponse.json({ users: res.rows, total: res.total || 0 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération des utilisateurs" }, { status: 500 });
  }
}

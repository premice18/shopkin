import { NextRequest, NextResponse } from "next/server";
import { Query } from "appwrite";
import { verifyAdmin } from "@/lib/admin-server";
import { serverTablesDB } from "@/lib/appwrite-server";
import { DATABASE_ID, PROFILES_COLLECTION_ID, ANNONCES_COLLECTION_ID } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const jwt = request.headers.get("authorization")?.replace("Bearer ", "") || null;
  const auth = await verifyAdmin(jwt);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const [profilesRes, activesRes, venduesRes] = await Promise.all([
      serverTablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: PROFILES_COLLECTION_ID,
        queries: [Query.limit(1)],
      }),
      serverTablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: ANNONCES_COLLECTION_ID,
        queries: [Query.equal("status", "disponible"), Query.limit(1)],
      }),
      serverTablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: ANNONCES_COLLECTION_ID,
        queries: [Query.equal("status", "vendu"), Query.limit(1)],
      }),
    ]);

    const totalUsers = profilesRes.total || 0;
    const activeAnnonces = activesRes.total || 0;
    const soldAnnonces = venduesRes.total || 0;

    let volumeTotal = 0;
    if (soldAnnonces > 0) {
      const allSold = await serverTablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: ANNONCES_COLLECTION_ID,
        queries: [Query.equal("status", "vendu"), Query.limit(1000)],
      });
      for (const a of allSold.rows) {
        volumeTotal += Number((a as { prix?: number }).prix || 0);
      }
    }

    const recentAnnonces = await serverTablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: ANNONCES_COLLECTION_ID,
      queries: [Query.orderDesc("$createdAt"), Query.limit(5)],
    });

    const recentUsers = await serverTablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: PROFILES_COLLECTION_ID,
      queries: [Query.orderDesc("$createdAt"), Query.limit(5)],
    });

    return NextResponse.json({
      stats: { totalUsers, activeAnnonces, soldAnnonces, volumeTotal },
      recentAnnonces: recentAnnonces.rows,
      recentUsers: recentUsers.rows,
    });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la récupération des statistiques" }, { status: 500 });
  }
}

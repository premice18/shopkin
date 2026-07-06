import { ID, Permission, Role, Query } from "appwrite";
import { tablesDB } from "@/lib/appwrite";
import { DATABASE_ID, FOLLOWS_COLLECTION_ID } from "@/lib/constants";

// Vérifie si l'utilisateur `followerId` suit déjà `followedId`
export async function isFollowing(followerId: string, followedId: string): Promise<boolean> {
  try {
    const res = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: FOLLOWS_COLLECTION_ID,
      queries: [
        Query.equal("follower_id", followerId),
        Query.equal("followed_id", followedId),
        Query.limit(1),
      ],
    });
    return res.rows.length > 0;
  } catch {
    return false;
  }
}

// Récupère le nombre d'abonnés (followers) d'un utilisateur
export async function countFollowers(userId: string): Promise<number> {
  try {
    const res = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: FOLLOWS_COLLECTION_ID,
      queries: [Query.equal("followed_id", userId), Query.limit(1)],
    });
    return res.total || 0;
  } catch {
    return 0;
  }
}

// Récupère le nombre d'abonnements (following) d'un utilisateur
export async function countFollowing(userId: string): Promise<number> {
  try {
    const res = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: FOLLOWS_COLLECTION_ID,
      queries: [Query.equal("follower_id", userId), Query.limit(1)],
    });
    return res.total || 0;
  } catch {
    return 0;
  }
}

// Récupère la liste des IDs d'utilisateurs suivis par `userId`
export async function getFollowingIds(userId: string): Promise<string[]> {
  try {
    const res = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: FOLLOWS_COLLECTION_ID,
      queries: [Query.equal("follower_id", userId)],
    });
    return res.rows.map((r: Record<string, unknown>) => r.followed_id as string);
  } catch {
    return [];
  }
}

// Récupère la liste des IDs des abonnés de `userId`
export async function getFollowerIds(userId: string): Promise<string[]> {
  try {
    const res = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: FOLLOWS_COLLECTION_ID,
      queries: [Query.equal("followed_id", userId)],
    });
    return res.rows.map((r: Record<string, unknown>) => r.follower_id as string);
  } catch {
    return [];
  }
}

// Suivre un utilisateur (créer un document follows)
export async function followUser(followerId: string, followedId: string): Promise<void> {
  // Empêche de se suivre soi-même
  if (followerId === followedId) {
    throw new Error("Vous ne pouvez pas vous abonner à vous-même.");
  }

  await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: FOLLOWS_COLLECTION_ID,
    rowId: ID.unique(),
    data: {
      follower_id: followerId,
      followed_id: followedId,
    },
    permissions: [
      Permission.read(Role.any()),
      Permission.delete(Role.user(followerId)),
    ],
  });
}

// Ne plus suivre un utilisateur (supprimer le document follows correspondant)
export async function unfollowUser(followerId: string, followedId: string): Promise<void> {
  try {
    // Chercher l'ID du document correspondant
    const res = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: FOLLOWS_COLLECTION_ID,
      queries: [
        Query.equal("follower_id", followerId),
        Query.equal("followed_id", followedId),
        Query.limit(1),
      ],
    });

    if (res.rows.length === 0) {
      throw new Error("Abonnement introuvable.");
    }

    const docId = res.rows[0].$id as string;

    await tablesDB.deleteRow({
      databaseId: DATABASE_ID,
      tableId: FOLLOWS_COLLECTION_ID,
      rowId: docId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Impossible de se désabonner : ${msg}`);
  }
}

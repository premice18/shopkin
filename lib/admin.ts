"use client";

import { useState, useEffect } from "react";
import { account } from "./appwrite";
import { getProfile } from "./profile";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    account
      .get()
      .then((user) => getProfile(user.$id))
      .then((profile) => {
        if (!cancelled) {
          setIsAdmin((profile as { role?: string } | null)?.role === "admin");
        }
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { isAdmin, loading };
}

export async function getAdminJWT(): Promise<string> {
  const { jwt } = await account.createJWT();
  return jwt;
}

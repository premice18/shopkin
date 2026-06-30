"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { account } from "./appwrite";
import type { Models } from "appwrite";

export function useAuth() {
  const [user, setUser] = useState<Models.User<Record<string, unknown>> | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    account
      .get()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
    router.push("/auth/login");
  };

  return { user, loading, logout };
}

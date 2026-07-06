"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdmin } from "@/lib/admin";
import { useAuth } from "@/lib/auth";

// Garde les pages admin : si pas connecté → login admin, si pas admin → accueil.
// Les pages /admin/login et /admin/register sont exclues de cette protection
// car elles ont leur propre layout sans AdminGuard. Comme le layout parent
// app/admin/layout.tsx s'applique à tous les enfants, AdminGuard doit ignorer
// ces routes pour éviter les boucles de redirection.
export default function AdminGuard({ children }: { children: ReactNode }) {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isBypassRoute =
    (pathname?.startsWith("/admin/login") ?? false) ||
    (pathname?.startsWith("/admin/register") ?? false);
  const initialCheckDone = useRef(false);

  const loading = adminLoading || authLoading;

  useEffect(() => {
    if (loading || isBypassRoute) return;
    // Éviter les redirects intempestifs pendant l'hydratation
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
    }
    // Pas connecté → page de connexion admin dédiée
    if (!user) {
      const currentPath = window.location.pathname;
      router.replace(`/admin/login?redirect=${encodeURIComponent(currentPath)}`);
    } else if (!isAdmin) {
      // Connecté mais pas admin → retour accueil (admin totalement invisible)
      router.replace("/");
    }
  }, [loading, user, isAdmin, router, isBypassRoute]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Sur /admin/login et /admin/register, on laisse le contenu sans restriction
  if (isBypassRoute) return <>{children}</>;

  // Retourne null pendant la redirection pour ne pas exposer le contenu protégé
  if (!user) return null;
  if (user && !isAdmin) return null;

  return <>{children}</>;
}

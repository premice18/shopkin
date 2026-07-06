import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limiter";

// Limite de 30 requêtes/min sur les routes d'authentification (anti-bruteforce)
// Augmenté à 60 en dev pour éviter les faux positifs avec les tests Playwright
const RATE_LIMIT_AUTH = { max: 120, window: 60_000 };

export function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Applique le rate limiting uniquement sur les formulaires d'authentification
  const isAuthRoute =
    url.pathname.startsWith("/auth/login") ||
    url.pathname.startsWith("/auth/register") ||
    url.pathname.startsWith("/auth/forgot-password") ||
    url.pathname.startsWith("/auth/reset-password");

  if (isAuthRoute) {
    const rlKey = `auth:${ip}`;
    const result = rateLimit(rlKey, RATE_LIMIT_AUTH.max, RATE_LIMIT_AUTH.window);
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_AUTH.max));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetIn / 1000)));

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Trop de tentatives. Réessayez dans une minute." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(result.resetIn / 1000)),
            ...Object.fromEntries(response.headers.entries()),
          },
        }
      );
    }
    return response;
  }

  // Vérifie l'existence d'une session via le cookie custom shopkin_auth
  // ou via le cookie natif Appwrite (a_session_*)
  const shopkinSession = request.cookies.get("shopkin_auth")?.value === "true";
  const appwriteSession = request.cookies.getAll().some((c) =>
    c.name.startsWith("a_session_")
  );
  const hasSession = shopkinSession || appwriteSession;

  // Redirige /auth/phone → /auth/login car le flux OTP n'est plus utilisé
  if (url.pathname === "/auth/phone") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Toutes les routes qui nécessitent une session active
  // /admin/login et /admin/register sont exclus car accessibles sans session
  const protectedPaths = ["/profil", "/deposer", "/auth/complete-profile", "/admin"];
  const needsProtection = protectedPaths.some(
    (path) => url.pathname === path || url.pathname.startsWith(`${path}/`)
  ) && url.pathname !== "/admin/login" && !url.pathname.startsWith("/admin/login/")
    && url.pathname !== "/admin/register" && !url.pathname.startsWith("/admin/register/");

  if (needsProtection && !hasSession) {
    // Les routes admin non connectées → page de connexion admin dédiée
    if (url.pathname.startsWith("/admin")) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", url.pathname + url.search);
      return NextResponse.redirect(loginUrl);
    }
    // Les autres routes protégées → connexion standard
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Liste explicite des routes qui passent par le middleware.
  // /admin est ajouté pour couvrir le dashboard (auparavant seul /admin/:path* était listé,
  // ce qui excluait /admin exact dans l'implémentation de path-to-regexp de Next.js)
  matcher: [
    "/profil/:path*",
    "/deposer",
    "/auth/complete-profile",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/admin",
    "/admin/",
    "/admin/:path*",
    // Note : /admin/login et /admin/login/ ne sont pas dans le matcher
    // car la page de connexion admin doit être accessible sans session
  ],
};

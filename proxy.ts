import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limiter";

const RATE_LIMIT_AUTH = { max: 10, window: 60_000 };

export function proxy(request: NextRequest) {
  const url = new URL(request.url);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

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

  const hasSession = request.cookies.get("shopkin_auth")?.value === "true";

  const protectedPaths = ["/profil", "/deposer", "/auth/complete-profile", "/admin"];
  const needsProtection = protectedPaths.some(
    (path) => url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  if (url.pathname === "/auth/phone") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (needsProtection && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profil/:path*",
    "/deposer",
    "/auth/complete-profile",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/admin",
    "/admin/:path*",
  ],
};

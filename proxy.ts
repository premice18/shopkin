import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.get("shopkin_auth")?.value === "true";

  const protectedPaths = ["/profil", "/deposer", "/auth/complete-profile"];

  const url = new URL(request.url);
  const needsProtection = protectedPaths.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));
  // Redirect /auth/phone to /auth/login
  if (url.pathname === "/auth/phone") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (needsProtection && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profil/:path*", "/deposer", "/auth/complete-profile"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("a_session_"));

  const protectedPaths = ["/profil", "/deposer"];

  const url = new URL(request.url);
  const needsProtection = protectedPaths.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));

  if (needsProtection && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profil/:path*", "/deposer"],
};

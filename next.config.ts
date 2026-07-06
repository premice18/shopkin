import type { NextConfig } from "next";

const cspDirectives: Record<string, string> = {
  "default-src": "'self'",
  "script-src": "'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src": "'self' 'unsafe-inline'",
  "img-src": "'self' data: blob:",
  "font-src": "'self' https://fonts.gstatic.com",
  "connect-src":
    "'self' https://fra.cloud.appwrite.io https://cloud.appwrite.io",
  "frame-src": "'none'",
  "frame-ancestors": "'none'",
  "base-uri": "'self'",
  "form-action": "'self'",
};

const csp = Object.entries(cspDirectives)
  .map(([key, value]) => `${key} ${value}`)
  .join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const res = await fetch(`${ENDPOINT}/users/${userId}`, {
      headers: {
        "X-Appwrite-Project": PROJECT_ID,
        "X-Appwrite-Key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ avatarUrl: null });
    }

    const user = await res.json();
    const identities: { provider: string; providerUid: string; providerAccessToken?: string }[] = user.identities || [];

    const googleIdentity = identities.find((i) => i.provider === "google");
    if (!googleIdentity) {
      return NextResponse.json({ avatarUrl: null });
    }

    // Try to get avatar from Google's userinfo API using the access token
    if (googleIdentity.providerAccessToken) {
      try {
        const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${googleIdentity.providerAccessToken}` },
        });
        if (infoRes.ok) {
          const info = await infoRes.json();
          if (info.picture) {
            return NextResponse.json({ avatarUrl: info.picture });
          }
        }
      } catch {
        // Fall through to fallback
      }
    }

    // Fallback: construct from Google ID
    if (googleIdentity.providerUid) {
      return NextResponse.json({
        avatarUrl: `https://lh3.googleusercontent.com/a/${googleIdentity.providerUid}`,
      });
    }

    return NextResponse.json({ avatarUrl: null });
  } catch {
    return NextResponse.json({ avatarUrl: null });
  }
}

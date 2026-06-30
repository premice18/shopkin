import { NextRequest, NextResponse } from "next/server";
import { serverDatabases } from "@/lib/appwrite-server";
import { DATABASE_ID, PROFILES_COLLECTION_ID } from "@/lib/constants";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;

async function api(path: string, options: RequestInit = {}) {
  const url = `${ENDPOINT.replace(/\/v1$/, "")}/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": PROJECT_ID,
      "X-Appwrite-Key": API_KEY,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, phone, password } = await request.json();
    if (!userId || !phone || !password) {
      return NextResponse.json({ error: "userId, phone, password required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
    }

    // Construct synthetic email from phone number
    const syntheticEmail = `${phone.replace("+", "")}@shopkin.app`;

    // Set email on the Appwrite user (admin API)
    await api(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ email: syntheticEmail }),
    });

    // Set password on the Appwrite user (admin API)
    await api(`/users/${userId}/password`, {
      method: "PATCH",
      body: JSON.stringify({ password }),
    });

    // Update profile: mark has_password
    await serverDatabases.updateDocument(DATABASE_ID, PROFILES_COLLECTION_ID, userId, {
      has_password: true,
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

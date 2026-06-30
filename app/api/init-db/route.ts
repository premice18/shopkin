import { NextResponse } from "next/server";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DB_ID = "shopkin";

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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET() {
  const results: string[] = [];
  const errors: string[] = [];

  // 1. Create database
  try {
    await api("/databases", {
      method: "POST",
      body: JSON.stringify({ databaseId: DB_ID, name: "shopkin" }),
    });
    results.push("Database 'shopkin' created");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("already exists")) {
      results.push("Database 'shopkin' already exists");
    } else {
      errors.push(`Database: ${msg}`);
    }
  }

  // 2. Create collections & attributes
  const collections = [
    {
      id: "profiles",
      name: "profiles",
      permissions: [
        `read("any")`,
        `update("user:\${user_id}")`,
        `delete("user:\${user_id}")`,
      ],
      attributes: [
        { key: "full_name", type: "string", size: 100, required: true },
        { key: "prenom", type: "string", size: 100, required: false },
        { key: "nom", type: "string", size: 100, required: false },
        { key: "avatar_url", type: "string", size: 255, required: false },
        { key: "whatsapp_number", type: "string", size: 20, required: true },
        { key: "commune_defaut", type: "string", size: 50, required: false },
        { key: "sexe", type: "string", size: 10, required: false },
        { key: "date_naissance", type: "string", size: 10, required: false },
        { key: "has_password", type: "boolean", required: false, default: false },
        { key: "m_pesa_registered", type: "boolean", required: true, default: false },
        { key: "airtel_money_registered", type: "boolean", required: true, default: false },
        { key: "orange_money_registered", type: "boolean", required: true, default: false },
      ],
    },
    {
      id: "annonces",
      name: "annonces",
      permissions: [
        `read("any")`,
        `create("any")`,
        `update("any")`,
        `delete("any")`,
      ],
      attributes: [
        { key: "vendeur_id", type: "string", size: 36, required: true },
        { key: "titre", type: "string", size: 150, required: true },
        { key: "description", type: "string", size: 10000, required: true },
        { key: "categorie", type: "string", size: 50, required: true },
        { key: "prix", type: "double", required: true },
        { key: "devise", type: "string", size: 3, required: false, default: "USD" },
        { key: "commune", type: "string", size: 50, required: true },
        { key: "super_repere", type: "string", size: 150, required: true },
        { key: "mode_main_propre", type: "boolean", required: false, default: true },
        { key: "mode_livraison_vendeur", type: "boolean", required: false, default: false },
        { key: "frais_livraison", type: "double", required: false, default: 0 },
        { key: "requires_delivery_deposit", type: "boolean", required: false, default: false },
        { key: "status", type: "string", size: 20, required: false, default: "disponible" },
        { key: "views_count", type: "integer", required: false, default: 0 },
      ],
    },
    {
      id: "parametres",
      name: "parametres",
      permissions: [`read("any")`],
      attributes: [
        { key: "usd_cdf_rate", type: "double", required: true, default: 2800 },
      ],
    },
  ];

  for (const col of collections) {
    try {
      await api(`/databases/${DB_ID}/collections`, {
        method: "POST",
        body: JSON.stringify({
          collectionId: col.id,
          name: col.name,
          permissions: col.permissions,
          documentSecurity: true,
        }),
      });
      results.push(`Collection '${col.name}' created`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes("already exists")) {
        results.push(`Collection '${col.name}' already exists`);
      } else {
        errors.push(`Collection '${col.name}': ${msg}`);
        continue;
      }
    }

    // Create attributes
    for (const attr of col.attributes) {
      // Need a small delay between attribute creations
      await sleep(300);
      try {
        let body: Record<string, unknown> = {
          key: attr.key,
          required: attr.required,
        };

        switch (attr.type) {
          case "string":
            body = { ...body, type: "string", size: attr.size, default: attr.default };
            break;
          case "boolean":
            body = { ...body, type: "boolean", default: attr.default ?? null };
            break;
          case "double":
            body = { ...body, type: "double", default: attr.default ?? null };
            break;
          case "integer":
            body = { ...body, type: "integer", default: attr.default ?? 0 };
            break;
        }

        await api(`/databases/${DB_ID}/collections/${col.id}/attributes/${attr.type}`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        results.push(`  Attribute '${attr.key}' created`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.toLowerCase().includes("already exists")) {
          results.push(`  Attribute '${attr.key}' already exists`);
        } else {
          errors.push(`  Attribute '${attr.key}': ${msg}`);
        }
      }
    }
  }

  // 3. Create default parametres document
  try {
    await api(`/databases/${DB_ID}/collections/parametres/documents`, {
      method: "POST",
      body: JSON.stringify({
        documentId: "global",
        data: { usd_cdf_rate: 2800 },
      }),
    });
    results.push("Document 'global' created with rate 2800");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("already exists")) {
      results.push("Document 'global' already exists");
    } else {
      errors.push(`Document 'global': ${msg}`);
    }
  }

  // 4. Create storage bucket
  try {
    await api("/storage/buckets", {
      method: "POST",
      body: JSON.stringify({
        bucketId: "annonces-images",
        name: "Annonces Images",
        permissions: [`read("any")`, `create("any")`, `write("any")`],
        fileSecurity: true,
        maximumFileSize: 10485760,
        allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
        enabled: true,
      }),
    });
    results.push("Storage bucket 'annonces-images' created");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("already exists")) {
      results.push("Storage bucket 'annonces-images' already exists");
    } else {
      errors.push(`Storage bucket: ${msg}`);
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    results,
    errors: errors.length > 0 ? errors : undefined,
    warning:
      "Supprimez cette route après exécution (app/api/init-db/) pour des raisons de sécurité.",
  });
}

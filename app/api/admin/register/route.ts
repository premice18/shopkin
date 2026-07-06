import { NextRequest, NextResponse } from "next/server";
import { Client, Users, ID } from "node-appwrite";
import { serverTablesDB } from "@/lib/appwrite-server";
import { DATABASE_ID, PROFILES_COLLECTION_ID } from "@/lib/constants";
import { isEmailAllowedForAdmin } from "@/lib/admin-whitelist";

// Crée un compte administrateur côté serveur après validation de l'email
// contre la liste blanche ALLOWED_ADMIN_EMAILS
export async function POST(request: NextRequest) {
  try {
    const { email, password, prenom, nom } = await request.json();

    // Validation des champs obligatoires
    if (!email || !password || !prenom || !nom) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    // Validation du format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide." },
        { status: 400 }
      );
    }

    // Validation du mot de passe (minimum 8 caractères, une majuscule, un chiffre)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins une majuscule." },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins un chiffre." },
        { status: 400 }
      );
    }

    // Vérification de la liste blanche côté serveur
    if (!isEmailAllowedForAdmin(email)) {
      return NextResponse.json(
        {
          error:
            "Cet email n'est pas autorisé à créer un compte administrateur.",
        },
        { status: 403 }
      );
    }

    // Création du compte Appwrite via l'Admin API
    const usersClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const users = new Users(usersClient);
    const fullName = `${prenom.trim()} ${nom.trim()}`;
    const user = await users.create({
      userId: ID.unique(),
      email,
      password,
      name: fullName,
    });

    // Création du profil avec le rôle admin directement
    // (contourne le mécanisme de whitelist qui serait déclenché après)
    await serverTablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: PROFILES_COLLECTION_ID,
      rowId: user.$id,
      data: {
        username: email.split("@")[0].toLowerCase(),
        email,
        email_verified: false,
        role: "admin",
        full_name: fullName,
        prenom: prenom.trim(),
        nom: nom.trim(),
        has_password: true,
        profile_complete: true,
        whatsapp_number: "",
        sexe: "",
        commune_defaut: "",
        date_naissance: "",
        m_pesa_registered: false,
        airtel_money_registered: false,
        orange_money_registered: false,
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.$id,
      message:
        "Compte administrateur créé avec succès. Connectez-vous avec votre email et mot de passe.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    // Si l'email existe déjà, message clair
    if (
      message.toLowerCase().includes("already exists") ||
      message.toLowerCase().includes("duplicate")
    ) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

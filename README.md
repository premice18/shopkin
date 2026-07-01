# ShopKin — Marketplace de Kinshasa

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Appwrite](https://img.shields.io/badge/Appwrite-26-F02E65?style=flat-square&logo=appwrite)](https://appwrite.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps)

ShopKin est une application web progressive (PWA) minimaliste pour acheter et vendre a Kinshasa, Republique Democratique du Congo. Pas de paiement integre, pas de messagerie interne — tout passe par WhatsApp et Mobile Money.

---

## Fonctionnalites

### Authentification et Profil
- Email/mot de passe + Google OAuth
- Verification d'email avec lien magique
- Reinitialisation du mot de passe
- Profil avec avatar (upload + Google), nom, username, WhatsApp
- Moyens de paiement prives (Mobile Money + cartes bancaires)

### Catalogue et Recherche
- Grille responsive 1/2/3/4 colonnes
- Pagination infinie par IntersectionObserver
- Filtres par categorie, commune, super-repere
- Toggle devise USD/CDF en temps reel

### Depot d'annonces
- Formulaire complet avec upload d'images compressees
- Categorie, commune, super-repere, prix, livraison
- Dashboard vendeur : statut, modification, suppression

### Communication
- Contact vendeur via WhatsApp (lien profond pre-rempli)
- Aucun numero affiche en clair

### Mobile-first
- BottomNav avec 3 entrees (Accueil, Deposser, Profil)
- Design 320px a 1440px, safe-area pour notched devices
- Scroll horizontal masque avec gradient

---

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Langage | [TypeScript](https://www.typescriptlang.org) strict |
| Styles | [Tailwind CSS v4](https://tailwindcss.com) |
| Backend | [Appwrite](https://appwrite.io) v26 Cloud |
| Auth | Email/Password + Google OAuth |
| DB | Appwrite Database (profiles, annonces, parametres, payment_methods) |
| Storage | Appwrite Storage (images annonces + avatars) |
| Proxy | Next.js `proxy.ts` (renommage Next.js 16 de `middleware.ts`) |

---

## Demarrage rapide

```bash
# Cloner le depot
git clone https://github.com/anomalyco/shopkin.git
cd shopkin

# Installer les dependances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
```

```env
# .env.local
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6a43ef85001796c9d66e
APPWRITE_API_KEY=<votre_api_key>
```

```bash
# Initialiser la base de donnees (une seule fois)
curl -X GET http://localhost:3000/api/init-db

# Lancer le serveur de developpement
npm run dev
```

---

## Structure du projet

```
app/
├── annonce/[id]/          # Detail annonce
├── auth/                  # Authentification (login, register, forgot-password,
│                          #   reset-password, verify-email, complete-profile,
│                          #   oauth-callback)
├── deposer/               # Depot d'annonce
├── profil/                # Profil + wallet + paiements
├── api/                   # API routes (init-db, increment-view, google-avatar)
├── globals.css            # Tokens Tailwind + animations
├── layout.tsx             # Root layout
└── page.tsx               # Accueil / catalogue
components/
├── layout/                # Header, Footer, FilterBar, BottomNav, AuthHeader
├── paiement/              # PaymentMethodList, PaymentMethodForm
└── ui/                    # Avatar, Logo, Modal, ProductCard, ErrorBoundary
lib/
├── appwrite.ts            # Client SDK
├── auth.ts                # useAuth, signUp, signIn, verifyEmail, resetPassword
├── constants.ts           # IDs, listes (categories, communes)
├── contexts/              # AppwriteProvider (taux change), ToastProvider, OfflineProvider
├── payment-methods.ts     # CRUD moyens de paiement
├── profile.ts             # getProfile, updateProfile, ensureProfile
└── types.ts               # Interfaces TypeScript
proxy.ts                   # Middleware Next.js (protection routes)
appwrite.config.json       # Configuration CLI Appwrite (tables, indexes, bucket)
```

---

## Collections Appwrite

| Collection | Usage | Permission |
|-----------|-------|------------|
| `profiles` | Profils utilisateurs | read("any"), update/delete(user) |
| `annonces` | Annonces publiees | create/read/update/delete("any") |
| `parametres` | Taux de change USD/CDF | read("any") |
| `payment_methods` | Moyens de paiement prives | read/update/delete(user) |

---

## Securite

- **Moyens de paiement** : permissions document-level, seuls les 4 derniers chiffres des cartes sont stockes (conforme PCI)
- **Numeros** : masques a l'affichage (`+243 81****12`)
- **OTP telephone** : desactive (migration vers email/mdp)
- **Session** : cookie `a_session_*`, protege par le proxy

---

## Commandes

```bash
npm run dev      # Developpement
npm run build    # Production build
npm run start    # Serveur de production
npm run lint     # ESLint (flat config v9)
```

---

## Licence

MIT

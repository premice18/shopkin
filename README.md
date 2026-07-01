# ShopKin — Marketplace de Kinshasa

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Appwrite](https://img.shields.io/badge/Appwrite-26-F02E65?style=flat-square&logo=appwrite)](https://appwrite.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

**ShopKin** est une application web progressive (PWA) minimaliste pour acheter et vendre à Kinshasa, République Démocratique du Congo. Pas de paiement intégré, pas de messagerie interne — tout passe par WhatsApp et Mobile Money.

</div>

## ✨ Fonctionnalités

### 🔐 Authentification & Profil
- Email/mot de passe + **Google OAuth**
- Vérification d'email avec lien magique
- Réinitialisation du mot de passe
- Profil avec avatar (upload + Google), nom, username, WhatsApp
- Moyens de paiement privés (Mobile Money + cartes bancaires)

### 🏪 Catalogue & Recherche
- Grille responsive 1/2/3/4 colonnes
- Pagination infinie par IntersectionObserver
- Filtres par catégorie, commune, super-repère
- Toggle devise USD/CDF en temps réel

### 📦 Dépôt d'annonces
- Formulaire complet avec upload d'images compressées
- Catégorie, commune, super-repère, prix, livraison
- Dashboard vendeur : statut, modification, suppression

### 💬 Communication
- Contact vendeur via WhatsApp (lien profond pré-rempli)
- Aucun numéro affiché en clair

### 📱 Mobile-first
- BottomNav avec 3 entrées (Accueil, Déposer, Profil)
- Design 320px → 1440px, safe-area pour notched devices
- Scroll horizontal masqué avec gradient

## 🏗 Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Langage | [TypeScript](https://www.typescriptlang.org) strict |
| Styles | [Tailwind CSS v4](https://tailwindcss.com) |
| Backend | [Appwrite](https://appwrite.io) v26 Cloud |
| Auth | Email/Password + Google OAuth |
| DB | Appwrite Database (collections : profiles, annonces, parametres, payment\_methods) |
| Storage | Appwrite Storage (images annonces + avatars) |
| Proxy | Next.js `proxy.ts` (renamed from `middleware.ts`) |

## 🚀 Démarrage rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/anomalyco/shopkin.git
cd shopkin

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
```

```env
# .env.local
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6a43ef85001796c9d66e
APPWRITE_API_KEY=<votre_api_key>
```

```bash
# 4. Initialiser la base de données (une seule fois)
curl -X GET http://localhost:3000/api/init-db

# 5. Lancer le serveur de développement
npm run dev
```

## 📂 Structure du projet

```
src/
├── app/
│   ├── annonce/[id]/        # Détail annonce
│   ├── auth/                # Authentification (login, register, forgot-password, reset-password, verify-email, complete-profile, oauth-callback)
│   ├── deposer/             # Dépôt d'annonce
│   ├── profil/              # Profil + wallet + paiements
│   ├── api/                 # API routes (init-db, increment-view, google-avatar)
│   ├── globals.css          # Tokens Tailwind + animations
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Accueil / catalogue
├── components/
│   ├── layout/              # Header, Footer, FilterBar, BottomNav, AuthHeader
│   ├── paiement/            # PaymentMethodList, PaymentMethodForm
│   └── ui/                  # Avatar, Logo, Modal, ProductCard, ErrorBoundary
├── lib/
│   ├── appwrite.ts          # Client SDK
│   ├── auth.ts              # useAuth, signUp, signIn, verifyEmail, resetPassword…
│   ├── constants.ts         # IDs, listes (catégories, communes…)
│   ├── contexts/            # AppwriteProvider (taux change), ToastProvider, OfflineProvider
│   ├── payment-methods.ts   # CRUD moyens de paiement
│   ├── profile.ts           # getProfile, updateProfile, ensureProfile
│   └── types.ts             # Interfaces TypeScript
├── proxy.ts                 # Middleware Next.js (protection routes)
└── appwrite.config.json     # Configuration CLI Appwrite (tables, indexes, bucket)
```

## 📋 Collections Appwrite

| Collection | Usage | Permission |
|-----------|-------|------------|
| `profiles` | Profils utilisateurs | read("any"), update/delete(user) |
| `annonces` | Annonces publiées | create/read/update/delete("any") |
| `parametres` | Taux de change USD/CDF | read("any") |
| `payment_methods` | Moyens de paiement privés | read/update/delete(user) |

## 🔒 Sécurité

- **Moyens de paiement** : permissions document-level, seuls les 4 derniers chiffres des cartes sont stockés (conforme PCI)
- **Numéros** : masqués à l'affichage (`+243 81****12`)
- **OTP téléphone** : désactivé (migration vers email/mdp)
- **Session** : cookie `a_session_*`, protégé par le proxy

## 🧪 Commandes

```bash
npm run dev      # Développement
npm run build    # Production build
npm run start    # Serveur de production
npm run lint     # ESLint (flat config v9)
```

## 📄 Licence

MIT — fait avec ❤️ pour Kinshasa.

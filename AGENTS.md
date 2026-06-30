<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project

ShopKin is a minimal PWA marketplace for Kinshasa (DRC). Single-package Next.js 16 app with Appwrite v26 backend.

**Routable pages:**

| Path | Component |
|------|-----------|
| `/` | `app/page.tsx` — Catalogue dynamique + filtres + pagination infinie |
| `/auth/login` | Connexion OTP (phone → 4-digit code) |
| `/auth/register` | Inscription OTP + formulaire profil (nom, commune) |
| `/auth/phone` | Redirige vers `/auth/login` |
| `/profil` | Buyer/seller dashboard switch, gestion annonces vendeur |
| `/profil/wallet` | Mobile Money wallet config form |
| `/annonce/[id]` | Détail annonce dynamique avec incrémentation vues |
| `/deposer` | Formulaire de dépôt d'annonce avec upload images |

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint (flat config, v9) |

No test framework or Prettier configured.

## Profiles collection attributes

| Attribut | Type | Taille | Requis |
|----------|------|--------|--------|
| `full_name` | string | 100 | oui |
| `prenom` | string | 100 | non (mais requis formulaire) |
| `nom` | string | 100 | non (mais requis formulaire) |
| `avatar_url` | string | 255 | non |
| `whatsapp_number` | string | 20 | oui |
| `commune_defaut` | string | 50 | non |
| `sexe` | string | 10 | non (mais requis formulaire) |
| `date_naissance` | string | 10 | non |
| `has_password` | boolean | — | non, defaut false |
| `m_pesa_registered` | boolean | — | oui, defaut false |
| `airtel_money_registered` | boolean | — | oui, defaut false |
| `orange_money_registered` | boolean | — | oui, defaut false |

## Appwrite integration

**Required env vars** (`.env.local`):

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6a43ef85001796c9d66e
APPWRITE_API_KEY=<your_api_key>     # for init-db and server operations
```

**Client**: `lib/appwrite.ts` exports `account`, `databases`, `storage`, `functions`.

**Database** ID: `shopkin`. Collections: `profiles`, `annonces`, `parametres`. Full schemas in `project_info.md`.

**Storage bucket**: `annonces-images` — for annonce image uploads.

**Server client**: `lib/appwrite-server.ts` exports `serverDatabases` (uses `setDevKey` with `APPWRITE_API_KEY`).

**Phone Auth flow** (Appwrite v26 API):

```
createPhoneToken({ userId: ID.unique(), phone })  → sends SMS OTP
createSession({ userId, secret })                  → verifies OTP, creates session
```

Profile auto-created on first login via `ensureProfile()` in `lib/profile.ts`.

**Session cookie**: Named `a_session_{projectId}`. The proxy (`proxy.ts`) checks for any `a_session_*` cookie to protect `/profil/*` and `/deposer`.

**Init DB**: Run `GET /api/init-db` once after setting `APPWRITE_API_KEY` to create database, collections, attributes, bucket, and default parameter document. Delete the route after use.

**AppwriteProvider** (`lib/contexts/AppwriteContext.tsx`): Wraps the app, fetches `usd_cdf_rate` from `parametres` collection and exposes it via `useAppwrite()` along with `formaterPrix()` helper.

## Project tracker

`project_info.md` contains the module roadmap, design tokens, Appwrite collection schemas, and done/todo lists. Consult it before making changes.

## Config quirks

- **Tailwind v4** — Uses `@import "tailwindcss"` in CSS, not `@tailwind` directives
- **Tailwind custom tokens** — Defined in `app/globals.css` `@theme` block. Available classes: `bg-primary`, `text-accent`, `bg-surface`, `text-success`, `text-danger`, `text-muted`, `border-border`
- **ESLint** — Flat config in `eslint.config.mjs`. Enables `react-hooks/set-state-in-effect` — data fetching in effects must use `// eslint-disable-next-line react-hooks/set-state-in-effect`
- **TypeScript** — `strict: true`, `moduleResolution: "bundler"`
- **`next-env.d.ts`** — Auto-generated, do not edit
- **Proxy** — Next.js 16 renamed `middleware.ts` to `proxy.ts`. Same exports (`proxy`/`config`)
- **Path alias**: `@/*` maps to repo root (`./*`)
- **App Router only** — No `src/` directory, pages in `app/` directly
- **`navigator.onLine` initial state** uses `useState(() => ...)` lazy initializer with `typeof window !== "undefined"` guard for SSR safety

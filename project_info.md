# 📱 ShopKin — Description exhaustive des fonctionnalités

> **INFO IMPORTANTE — Commentaires dans le code**  
> Toute modification de code (source, configuration, tests) doit être accompagnée de commentaires en français expliquant la logique — le *pourquoi* de chaque étape importante, condition complexe ou fonction. Les commentaires ne doivent pas paraphraser le code, mais éclairer le lecteur sur le contexte, les choix d'implémentation et les cas limites. Les messages et descriptions des tests Playwright sont également en français.

Ce document décrit l'intégralité de l'application ShopKin, une marketplace minimaliste pour Kinshasa. Il est destiné à toute personne souhaitant comprendre précisément ce que l'application fera, sans entrer dans le code.

---

## 1. Philosophie générale

- **Application web installable (PWA)** : on y accède via un navigateur sur mobile ou ordinateur, mais elle peut être ajoutée à l’écran d’accueil d’un téléphone et s’ouvrir comme une app native.
- **Connexion par email/mot de passe uniquement** : Google OAuth définitivement supprimé.
- **Pas de messagerie interne** : toutes les discussions passent par WhatsApp, via des liens profonds pré-remplis.
- **Pas de paiement intégré** : les transactions se font en dehors de l'application, avec Mobile Money ou en main propre. L'application ne gère pas les fonds.
- **Respect de la vie privée** : les numéros de téléphone des vendeurs ne sont jamais affichés en clair.
- **Optimisé pour les connexions lentes** : images compressées, chargement progressif, mode hors-ligne.

## 1.2 INFO IMPORTANTE

- A chque modification d'un fichier , verifier l'existance des commentaires en francais expliquant le code , si non ajouter

---

## 2. Modules fonctionnels (découpage global)

| Module | Description                 | Statut          |
| ------ | --------------------------- | --------------- |
| M1     | Authentification & Identité | ✅ Terminé      |
| M2     | Catalogue & Recherche       | ✅ Terminé      |
| M3     | Communication & Négociation | ⚪ Non commencé |
| M4     | Transaction & Logistique    | ⚪ Non commencé |
| M5     | PWA & Expérience hors-ligne | ⚪ Non commencé |
| Admin  | Module d'administration     | ✅ Terminé      |

### Correctifs (Juillet 2026)

- [x] 90. **Suppression totale de Google OAuth** :
  - `lib/auth.ts` : suppression de `signInWithGoogle()`, retrait de l'import `OAuthProvider`.
  - `app/auth/login/page.tsx` : suppression du bouton « Continuer avec Google », du séparateur « OU », de l'état `googleLoading`, de `OAUTH_ERRORS` et du message `user_missing_password`.
  - `app/auth/register/page.tsx` : suppression du bouton « S'inscrire avec Google », du séparateur « OU », de l'état `googleLoading` et de l'import `signInWithGoogle`.
  - `app/auth/oauth-callback/page.tsx` : **supprimé** (page de callback Google OAuth, devenue inutile).
  - `app/api/auth/google-avatar/route.ts` : **supprimé** (API route de récupération avatar Google).
  - `lib/profile.ts` : retrait de l'attribut `google_id: ""` dans `ensureProfile()`.
  - `next.config.ts` : nettoyage de la CSP — retrait de `lh3.googleusercontent.com`, `www.googleapis.com`, `accounts.google.com`.
  - `proxy.ts` : mise à jour du commentaire (plus de référence aux connexions OAuth).
  - `app/admin/login/page.tsx` : retrait du message d'erreur `user_missing_password` qui référençait Google.
  - `tests/login.spec.ts` : retrait du test « bouton Google présent ».
  - `tests/m1-auth.spec.ts` : retrait des 2 tests « affiche le bouton Google » et « bouton Google présent ».
  - **Attention** : Désactiver manuellement le provider Google dans la console Appwrite (Auth → Settings → OAuth2 → Google → désactiver).
- [x] 92. **Remplacement de tous les émojis par lucide-react** :
  - **Installation** : `npm install lucide-react`.
  - **ToastContext** : remplacement de `🎉` → `CheckCircle2`, `❌` → `XCircle`, `⚠️` → `AlertTriangle`, `ℹ️` → `Info` (dans `lib/contexts/ToastContext.tsx`).
  - **Messages toast (26 messages)** : suppression des émojis dans `app/auth/login/page.tsx`, `app/auth/register/page.tsx`, `app/auth/complete-profile/page.tsx`, `app/auth/forgot-password/page.tsx`, `app/deposer/page.tsx`, `app/profil/page.tsx` (15), `app/profil/wallet/page.tsx`, `app/profil/edit/page.tsx` — l'icône est désormais fournie automatiquement par le type du toast.
  - **Sidebar admin** : remplacement de `📊` → `LayoutDashboard`, `👥` → `Users`, `📦` → `Package`, `⚙️` → `Settings` (dans `components/admin/Sidebar.tsx`).
  - **Admin login** : redesign complet avec `Mail`, `Lock`, `LogIn`, `ShieldAlert` — carte blanche centrée, ombre, fond gradient, inputs avec icônes intégrées, toggle password.
  - **Admin register** : redesign complet avec `Mail`, `Lock`, `User`, `ShieldAlert`, `CheckCircle`, `Eye`/`EyeOff`, `UserPlus` — aligné visuellement sur le login (même carte, même fond gradient, toggle password).
  - **Admin dashboard** : remplacement des SVG inline par `Users`, `Package`, `CheckCircle`, `DollarSign` de lucide dans les 4 StatCards.
  - **Admin layout** : remplacement du SVG hamburger par `Menu` de lucide.
  - **Admin user detail** : remplacement de `&larr;` → `ArrowLeft` de lucide.
  - **Auth register** : remplacement de 5× `✓` par `Check` de lucide (critères mot de passe + bouton succès).
  - **Annonce detail** : remplacement de 2× `✓` par `Check` de lucide (modes livraison).
  - **Propreté** : retrait de l'import `ArrowRight` inutilisé dans le dashboard, suppression des émojis résiduels vérifiée par grep (0 restant).
  - **Build & lint** : 0 erreur.
- [x] 91. **Audit et remise en état des pages admin** :
  - `/admin/login` : formulaire email/mot de passe fonctionnel, vérification du rôle admin, pas de référence Google.
  - `/admin/register` : redirection vers `/admin` (au lieu de `/admin/login`) après inscription réussie.
  - `proxy.ts` : protection `/admin/*` intacte (sauf login/register).
  - `AdminGuard` : vérification admin côté client, pas de boucle de redirection — **correction** : ajout de `/admin/register` à la liste des routes bypass (en plus de `/admin/login`), le layout parent `admin/layout.tsx` s'appliquant à tous les segments enfants.
  - API routes admin : toutes protégées par `verifyAdmin()` avec JWT.
  - Layout admin : aucun header/footer public.
  - Vérifié : aucun lien public vers `/admin` (Header, Footer, BottomNav, profil).

- [x] 56. `signIn()` : ajout de `account.deleteSession({ sessionId: "current" }).catch(() => {})` avant `createEmailPasswordSession` pour nettoyer toute session périmée avant une nouvelle connexion.
- [x] 57. `login/page.tsx` : import `AppwriteException`, messages d'erreur spécifiques par type (`user_invalid_credentials`, `user_not_verified`, `user_missing_password`) au lieu du message générique.
- [x] 58. Migration de toutes les méthodes Appwrite v26 vers le style objet (paramètres nommés) : `account.create`, `account.deleteSession`, `account.createOAuth2Session`, `account.createEmailVerification`, `account.updateEmailVerification`, `account.createRecovery`, `account.updateRecovery`, `databases.createDocument`, `databases.updateDocument`, `databases.listDocuments`, `databases.getDocument`, `databases.deleteDocument` — suppression des appels positionnels dépréciés.
- [x] 59. `signUp()` : migration de `databases.createDocument` vers le style objet. Ajout d'un `try/catch` avec typage `AppwriteException` et messages d'erreur spécifiques (`user_already_exists`, `document_already_exists`).
- [x] 60. `register/page.tsx` : import `AppwriteException` + `ERROR_MAP` par type d'erreur Appwrite. Ajout d'un état `success` avec feedback visuel (bannière verte « Compte créé avec succès ! » + redirection `/profil` après 2s). Tous les champs du formulaire sont `disabled` pendant la soumission (`loading || success`) pour éviter les doubles envois. Texte du bouton : « Création en cours... » avec spinner → « Compte créé ✓ ». Renommage du message de chargement de « Inscription... » à « Création en cours... ».
- [x] 61. Migration complète de `Databases` (déprécié) vers `TablesDB` (nouvelle API Appwrite v26) dans tous les fichiers (`lib/auth.ts`, `lib/profile.ts`, `lib/payment-methods.ts`, `app/page.tsx`, `app/profil/page.tsx`, `app/deposer/page.tsx`, `app/annonce/[id]/page.tsx`, `lib/contexts/AppwriteContext.tsx`). Méthodes renommées : `createDocument`→`createRow`, `listDocuments`→`listRows`, `getDocument`→`getRow`, `updateDocument`→`updateRow`, `deleteDocument`→`deleteRow`. Paramètres renommés : `collectionId`→`tableId`, `documentId`→`rowId`. Accès aux résultats : `.documents`→`.rows`.
- [x] 62. Suppression des paramètres `permissions` dans tous les appels `createRow` pour éviter les erreurs `general_argument_invalid` quand `documentSecurity` est désactivé. Retrait des imports `Permission`/`Role` devenus inutiles dans `lib/auth.ts` et `lib/payment-methods.ts`.
- [x] 63. Ajout `user_not_verified` et `general_argument_invalid` dans `ERROR_MAP` du formulaire d'inscription.
- [x] 64. Suppression de l'envoi automatique de l'email de vérification dans `signUp()` (`lib/auth.ts` ligne 62-64). L'email n'est plus envoyé qu'à la demande explicite de l'utilisateur depuis le profil.
- [x] 65. Ajout d'un cooldown de 30s sur le bouton « Renvoyer l'email de confirmation » dans `app/profil/page.tsx` (compteur visuel, désactivation temporaire, toast avec instruction de vérifier la boîte mail).
- [x] 66. Réécriture complète du système de toast (`lib/contexts/ToastContext.tsx`) — 4 types (success/error/warning/info) avec icônes émoji, bordure gauche colorée, animation slide-up/fade-out, auto-dismiss (3.5–5s), max 3 toasts visibles, position responsive (bas-centré mobile, bas-gauche desktop), bouton de fermeture, méthodes `success()`/`error()`/`warning()`/`info()`. Animations CSS custom `toastSlideUp`/`toastExit` dans `app/globals.css`.
- [x] 67. Mise à jour de tous les appels toast dans `app/profil/page.tsx` et `app/profil/wallet/page.tsx` : messages personnalisés avec émojis (ex: `🎉 Nouveau moyen de paiement enregistré !`, `📷 Photo de profil mise à jour !`, `🗑️ Annonce supprimée avec succès.`, `👋 À bientôt ! Tu as été déconnecté.`).
- [x] 68. Intégration du toast dans `app/auth/register/page.tsx` — `🎉 Bienvenue sur ShopKin, [prénom] !` avec délai 600ms avant redirection.
- [x] 69. Intégration du toast dans `app/auth/login/page.tsx` — `👋 Bon retour sur ShopKin !` avec délai 600ms avant redirection.
- [x] 70. Intégration du toast dans `app/auth/forgot-password/page.tsx` — `📩 Si un compte existe avec cet email, tu recevras un lien...` avec message d'erreur toast en cas d'échec.
- [x] 71. Intégration du toast dans `app/auth/complete-profile/page.tsx` — `🎉 Bienvenue sur ShopKin, [prénom] ! Ton profil est complet.` avec délai 600ms avant redirection.
- [x] 72. Intégration du toast dans `app/deposer/page.tsx` — `🎉 Annonce publiée avec succès !` avec délai 600ms avant redirection et message d'erreur toast en cas d'échec.
- [x] 73. Correction erreur 400 publication annonce : ajout de la colonne `images_storage_paths` (string[]) manquante dans `appwrite.config.json` — envoyée dans `data` mais absente du schéma, ce qui causait un `400 Bad Request` d'Appwrite.
- [x] 74. Amélioration du `catch` dans `app/deposer/page.tsx` : import d'`AppwriteException`, binding de l'erreur, `console.error`, messages utilisateur spécifiques selon le type d'erreur (`general_argument_invalid` → "Données invalides", `user_unauthorized` → "Reconnecte-toi", fallback → `err.message`).
- [x] 75. Rate limiting : `lib/rate-limiter.ts` (in-memory, Map + TTL), appliqué dans `proxy.ts` à 10 req/min par IP sur `/auth/*`.
- [x] 76. Content Security Policy : ajoutée dans `next.config.ts` (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- [x] 77. E2E tests Playwright : 13 fichiers de test — `home`, `login`, `register`, `navigation`, `forgot-password`, `m1-auth` (30 tests), `m1-auth-responsive` (8), `m1-profile` (4), `m2-catalog` (14), `m2-annonce` (6), `m2-deposer` (4), `m2-catalog-responsive` (7). `playwright.config.ts` avec 2 projets. `.github/workflows/playwright.yml` CI/CD.
- [x] 78. Module Admin complet : collection attributes `role`/`suspended`, `lib/admin.ts` (hook + JWT), `lib/admin-server.ts` (verifyAdmin), proxy matcher `/admin/*`, components admin (AdminGuard, Sidebar, StatCard, DataTable), 6 API routes protégées, 5 pages admin (dashboard, users, user detail, annonces, settings).
- [x] 79. Lint fixes : déplacement des commentaires `eslint-disable-next-line` des admin pages (étaient après la ligne problématique au lieu d'avant).
- [x] 80. **Reverted** — Header : lien "Admin" supprimé. Aucun lien public vers `/admin` n'est autorisé.
- [x] 81. Audit de sécurité "zéro lien admin public" : scan de tous les fichiers (components/layout/, components/ui/, app/, pages publiques). **1 seul lien trouvé** : `Header.tsx` (lien vers `/admin` pour les admins) — **supprimé**. Tout le reste est dans `app/admin/*`, `app/api/admin/*` ou `components/admin/*`. Aucune fuite.
- [x] 82. `proxy.ts` : `/admin` ajouté explicitement au `matcher` (en plus de `/admin/:path*`) pour couvrir le cas d'accès exact à `/admin`.
- [x] 83. ~~**Fix conflit OAuth/email-password**~~ (obsolète depuis suppression de Google OAuth le 06/07/2026) :
  - `proxy.ts` : vérification du cookie de session Appwrite (`a_session_*`) en plus de `shopkin_auth` pour éviter les faux négatifs après OAuth.
  - `lib/auth.ts` : `signInWithGoogle()` supprime la session existante avant d'initier le flux OAuth (`deleteSession("current")`). La fonction passe en `async` pour gérer ce nettoyage.
  - `app/auth/login/page.tsx` : affichage des erreurs OAuth depuis les query params (`oauth_cancelled`, `oauth_failed`, `oauth_callback_error`) avec messages utilisateur dédiés. `handleGoogle` en `async` avec try/catch pour éviter le bouton bloqué en loading.
  - `app/auth/register/page.tsx` : `handleGoogle` en `async` avec try/catch.
  - `app/auth/oauth-callback/page.tsx` : nettoyage de session en cas d'erreur, protection contre les doubles exécutions via `useRef(done)`, fetch avatar non-bloquant, `account.deleteSession("current")` dans le catch pour nettoyer une session cassée.
  - **Session cookie désynchronisé** : Le proxy vérifie désormais l'existence d'un cookie `a_session_*` (cookie natif Appwrite) EN PLUS du cookie custom `shopkin_auth`, résolvant le cas où OAuth crée une session Appwrite valide sans que `shopkin_auth` soit défini à temps.
- [x] 85. **Fix accès `/admin`** (3 correctifs) :
  - `proxy.ts` : ajout de `"/admin"` dans le `matcher` ET dans la condition de protection (`isAdminRoute`). Désormais le middleware intercepte `/admin` exactement, pas seulement `/admin/*`.
  - `components/admin/AdminGuard.tsx` : ajout du cas `!user` — redirection vers `/auth/login?redirect=...` au lieu de laisser passer le contenu. Utilisation de `window.location.pathname` pour préserver la destination.
  - `app/auth/login/page.tsx` : lecture du paramètre `redirect` via `useSearchParams()`. Après connexion réussie, redirection vers `redirect` si présent, sinon vers `/`.
- [x] 86. **Tests Playwright – Complétion M1 et M2** :
  - `tests/m1-auth.spec.ts` : ajout test soumission email mot de passe oublié → message confirmation.
  - `tests/m1-profile.spec.ts` : ajout tests déconnexion → redirection, bascule acheteur/ventes/paiements, lien édition profil.
  - `tests/m2-catalog.spec.ts` : ajout test toggle devise CDF (aria-pressed après clic).
  - `tests/m2-annonce.spec.ts` : ajout test bouton retour → retour à l'accueil.
  - `tests/m2-deposer.spec.ts` : ajout test upload d'image avec prévisualisation (file chooser + blob:).
  - `tests/navigation.spec.ts` : ajout tests redirection `/admin` → `/auth/login` et vérification paramètre `redirect`.
  - `tests/login.spec.ts` : ajout test `redirect` query param (connexion → /profil).
- [x] 84. **Liste blanche emails administrateurs** :
  - `.env.local` : variable `ALLOWED_ADMIN_EMAILS` (liste d'emails séparés par des virgules).
  - `lib/admin-whitelist.ts` : fonction serveur `isEmailAllowedForAdmin(email)` qui lit la variable et vérifie l'appartenance. Non exposée côté client.
  - `lib/auth.ts` : `signUp()` définit `role: "user"` dans le profil à la création.
  - `lib/profile.ts` : `ensureProfile()` définit `role: "user"` dans le profil créé.
  - `app/api/check-admin-eligibility/route.ts` : API GET qui vérifie le JWT, récupère l'email du compte, appelle `isEmailAllowedForAdmin()`, et si éligible, met à jour le profil avec `role: "admin"`.
  - `app/auth/register/page.tsx` : après `signUp()`, appelle l'API d'éligibilité via JWT (non bloquant).
  - `app/auth/oauth-callback/page.tsx` : après `ensureProfile()`, appelle l'API d'éligibilité (non bloquant).
  - `app/api/admin/users/[id]/route.ts` : avant de promouvoir un utilisateur en admin, vérifie que son email est dans la liste blanche. Renvoie 403 avec message explicite si refusé.
  - **Sécurité** : la variable d'environnement n'est jamais exposée côté client. Si absente, aucun email n'est autorisé → plus aucun admin ne peut être créé automatiquement.
- [x] 88. **Page d'inscription admin dédiée (`/admin/register`)** :
  - `app/admin/register/page.tsx` : formulaire simplifié (email, password, prenom, nom, confirmation).
  - `app/api/admin/register/route.ts` : API POST qui valide l'email contre `ALLOWED_ADMIN_EMAILS` côté serveur, crée le compte Appwrite via l'Admin API (`Users.create()`), et crée le profil directement avec `role: "admin"`.
  - `app/admin/register/layout.tsx` : layout minimal (SANS `AdminGuard`) pour que la page soit accessible sans authentification.
  - `proxy.ts` : `/admin/register` exclu de la protection du middleware (comme `/admin/login`).
  - Aucun lien public : accessible uniquement en tapant l'URL `/admin/register` ou via le lien « Créer un compte administrateur » sur `/admin/login`.
  - Flow complet : `/admin/register` → inscription → succès → redirection vers `/admin` (puis middleware → `/admin/login` si non connecté).
- [x] 89. **Audit séparation admin/utilisateurs (Juin 2026)** :
  - **Critique** : `app/api/check-admin-eligibility/route.ts` supprimée — permettait une promotion admin silencieuse via les pages publiques (`/auth/register`, `/auth/oauth-callback`) en contournant `/admin/register`.
  - **Critique** : `app/auth/register/page.tsx` — retrait de l'appel à `check-admin-eligibility` après `signUp()`. Le rôle est toujours `"user"` (défini dans `signUp()`), aucune condition ne permet d'obtenir admin via cette page.
  - **Critique** : `app/auth/oauth-callback/page.tsx` — retrait des 2 appels à `check-admin-eligibility` (nouveau profil et profil existant).
  - **Moyen** : `app/admin/login/layout.tsx` créé (layout sans `AdminGuard`) pour éviter la boucle de redirection potentielle.
  - **Mineur** : Commentaires français ajoutés dans `lib/admin-server.ts`, `app/api/admin/users/[id]/route.ts`, `components/admin/Sidebar.tsx`.
  - **Vérifié** : Aucun lien public vers `/admin` dans `Header.tsx`, `Footer.tsx`, `BottomNav.tsx`, pages profil.
  - **Vérifié** : `signUp()` dans `lib/auth.ts` définit `role: "user"` systématiquement.
  - **Vérifié** : `ensureProfile()` dans `lib/profile.ts` définit `role: "user"`.
  - **Vérifié** : `app/api/admin/register/route.ts` vérifie `isEmailAllowedForAdmin()` côté serveur avant création.
  - **Vérifié** : `app/api/admin/users/[id]/route.ts` vérifie `isEmailAllowedForAdmin()` avant promotion.

### Progression M1

Toutes les sous-tâches ci-dessous ont été implémentées et vérifiées (build ✅, lint ✅).

- [x] 1. Migration OTP téléphone → email/mot de passe (Google OAuth retiré depuis le 06/07/2026)
- [x] 2. Collection `profiles` : attributs `username`, `email`, `email_verified`, `profile_complete` ajoutés (attribut `google_id` retiré le 06/07/2026)
- [x] 3. `whatsapp_number` passé en optionnel dans la collection
- [x] 4. Index unique sur `username` dans `profiles`
- [x] 5. Méthodes d'auth Appwrite : phone et email-otp désactivées
- [x] 6. Fonctions `signUp`, `signIn`, `completeProfile` dans `lib/auth.ts` (`signInWithGoogle` supprimée le 06/07/2026)
- [x] 7. `ensureProfile` adapté aux nouveaux champs (username, email, profile_complete, `google_id` retiré)
- [x] 8. Formulaire d'inscription : email, username, password (force indicator), prénom, nom, sexe, date naissance, commune
- [x] 9. Validation username en temps réel avec debounce 400ms + déjà pris
- [x] 10. Page `/auth/login` : email/password uniquement (bouton Google OAuth supprimé le 06/07/2026)
- [x] 11. Page `/auth/forgot-password` : email → lien de réinitialisation (squelette)
- [x] 12. Page `/auth/complete-profile` : finalisation profil (initialement pour utilisateurs Google — page gardée comme fallback)
- [x] 13. Page `/auth/oauth-callback` : ~~traitement retour Google OAuth~~ **Supprimée le 06/07/2026**
- [x] 14. Proxy protège `/auth/complete-profile` en plus de `/profil` et `/deposer`
- [x] 15. Page profil : bandeau email non vérifié, affichage username, email, WhatsApp
- [x] 16. Nettoyage : suppression `AuthOtpStep`, renommage API routes obsolètes
- [x] 17. Redirections `/auth/phone` → `/auth/login` (proxy + page)
- [x] 18. Permissions collection `profiles` : `create("any")` + `read("any")` + user-level update/delete
- [x] 19. Avatar avec initiales sur la page profil
- [x] 20. Édition inline du nom (icône crayon)
- [x] 21. Validation cohérence wallet (checkbox + numéro)
- [x] 22. Toast notifications temporisés (succès/erreur)
- [x] 23. Bouton déconnexion en bas de la page profil
- [x] 24. ~~Bouton « S'inscrire avec Google » sur `/auth/register`~~ **Supprimé le 06/07/2026**
- [x] 25. Fonction réutilisable `checkUsernameAvailability()` dans `lib/auth.ts`
- [x] 26. WhatsApp obligatoire sur `/auth/complete-profile` (champ requis pour vendre)
- [x] 27. Édition inline du numéro WhatsApp sur `/profil` (icône crayon, validation +243)
- [x] 28. Les avatars utilisent le bucket `annonces-images` (limite Appwrite gratuit : 1 bucket max)
- [x] 29. Composant `Avatar` réutilisable (`components/ui/Avatar.tsx`) avec image + fallback initiales
- [x] 30. ~~Récupération auto de la photo Google OAuth via `/api/auth/google-avatar`~~ **Supprimée le 06/07/2026**
- [x] 31. Upload avatar personnalisé depuis `/profil` (icône crayon sur l'avatar, sélecteur fichier, upload Appwrite Storage)
- [x] 32. Suppression de l'avatar personnalisé (retour aux initiales)
- [x] 33. Header (`components/layout/Header.tsx`) affiche l'avatar au lieu de l'icône générique
- [x] 34. Collection Appwrite `payment_methods` créée (attributs : user_id, type, provider, label, phone_number, card_holder_name, card_last_four, card_expiry_month/year, is_default)
- [x] 35. Fonctions CRUD dans `lib/payment-methods.ts` (`getPaymentMethods`, `createPaymentMethod`, `updatePaymentMethod`, `deletePaymentMethod`)
- [x] 36. Composant `PaymentMethodList` (`components/paiement/PaymentMethodList.tsx`) : affichage liste avec icônes provider, masquage partiel numéro/carte
- [x] 37. Composant `PaymentMethodForm` (`components/paiement/PaymentMethodForm.tsx`) : formulaire modale ajout/édition avec champs conditionnels (Mobile Money / Carte)
- [x] 38. Onglet « Paiements » ajouté sur `/profil` (3ᵉ onglet après Achats/Ventes) avec bouton « + Ajouter »
- [x] 39. Permissions document-level : seul le propriétaire peut lire/modifier/supprimer ses moyens de paiement
- [x] 40. Validation doublons (même numéro ou même carte interdits pour un même utilisateur)
- [x] 41. Masquage des données sensibles : numéro téléphone partiellement masqué (\*XX12), carte affichée comme \***\* \*\*** \*\*\*\* 4242
- [x] 42. Conformité PCI : seuls les 4 derniers chiffres des cartes sont stockés, pas de numéro complet, pas de CVV
- [x] 43. Fonctions `sendVerificationEmail`, `verifyEmail`, `sendPasswordRecovery`, `resetPassword` dans `lib/auth.ts`
- [x] 44. Email de vérification envoyé automatiquement après inscription (`account.createVerification`)
- [x] 45. Page `/auth/verify-email` : callback vérification email avec `account.updateVerification` + mise à jour profil + message succès/erreur
- [x] 46. Page `/auth/reset-password` : formulaire nouveau mot de passe + `account.updateRecovery` + redirection connexion
- [x] 47. Page `/auth/forgot-password` : branchement `account.createRecovery` réel (remplacement placeholder)
- [x] 48. Composant `AuthHeader` (`components/layout/AuthHeader.tsx`) : header minimal avec logo cliquable
- [x] 49. AuthHeader intégré sur toutes les pages `/auth/*` (login, register, forgot-password, reset-password, verify-email, complete-profile)
- [x] 50. Profil : bouton « Renvoyer l'email de confirmation » dans le bandeau de vérification
- [x] 51. ~~Google OAuth : `email_verified: true` défini sur le profil après connexion Google~~ **Supprimé le 06/07/2026**
- [x] 52. Redirections Appwrite configurées : `/auth/verify-email` et `/auth/reset-password` comme callback URLs
- [x] 53. Audit visuel UX/UI complet (`audit_visuel_frontend.md`) : note 4.5/10 — 8 critiques, 14 majeurs, 18 mineurs
- [x] 54. Corrections Phase 1 (audit) : body texte `text-sm` → `text-base`, contraste badges (`bg-success` → `green-100/green-700`), show/hide password toggle, centrage vertical formulaires auth, Modal × fermeture + focus trapping + scroll lock
- [x] 55. Corrections Phase 2 (audit) : suppression `animate-shake` CSS, checkbox CGV sur register, `text-muted` #374151 (WCAG AAA), `button:active:scale(0.97)`, `fadeIn` transition page, empty states avec CTA, bouton logout profil visible
- [x] 56. Composant `AuthLayout` (`components/layout/AuthLayout.tsx`) : split-screen desktop 50/50, colonne gauche `md:h-screen md:overflow-y-auto md:shrink-0` avec formulaire centré verticalement, colonne droite `md:h-screen md:shrink-0` fixe avec marketing redessiné (cartes glass-morphism `bg-white/[0.04]` avec hover, cercles décoratifs `blur-3xl`, dégradé renforcé, espacement généreux).
- [x] 57. Page register mobile : 3 pills confiance compactes sous le titre (« Achats sécurisés », « Mobile Money », « +2000 membres »), accordéon `<details>` « Pourquoi ShopKin ? » après le formulaire avec 4 bénéfices + preuve sociale.
- [x] 58. Page register desktop : colonne gauche scroll indépendante du formulaire (long), colonne droite marketing fixe et centrée — plus de scroll global qui masquait la droite.
- [x] 59. Page `/cgu` : Conditions Générales d'Utilisation (8 sections : objet, inscription, annonces, transactions, responsabilités, données, modifications, contact).
- [x] 60. Page `/a-propos` : mission, valeurs (confiance, simplicité, proximité), guide 3 étapes (Publier → Discuter → Rencontrer), contact.
- [x] 61. Page `/privacy` : Politique de confidentialité (données collectées, utilisation, partage, sécurité, droits utilisateur, cookies, conservation).
- [x] 62. Composant `PageLayout` (`components/layout/PageLayout.tsx`) : header fixe avec logo, contenu `max-w-3xl mx-auto`, fond `bg-surface`.
- [x] 63. Footer : colonne « Informations » ajoutée (liens vers `/a-propos`, `/cgu`, `/privacy`), grille `sm:grid-cols-4`.

### Progression M2 (Catalogue dynamique + Dépôt)

- [x] 1. Logo "ShopKin" SVG inline (S bleu, K jaune)
- [x] 2. Header fixe avec toggle devise USD/CDF et icône profil
- [x] 3. Barre de filtres : chips catégories (7 catégories), menus déroulants commune et super-repère
- [x] 4. Grille responsive 1/2/3/4 colonnes de cartes produits
- [x] 5. Carte produit : image placeholder, badge livraison, titre, prix, localisation, vues
- [x] 6. Page détail `/annonce/[id]` : image, titre, prix, description, localisation, statut, livraison, contacter WhatsApp
- [x] 7. Navigation mobile bottom (BottomNav) avec 3 icônes SVG
- [x] 8. Footer desktop avec copyright
- [x] 9. Script d'init DB (`app/api/init-db/`) qui crée database, collections (profiles, annonces, parametres), attributs et bucket storage via REST API
- [x] 10. Remplacé `lib/sample-data.ts` par des données Appwrite réelles (`databases.listDocuments`)
- [x] 11. Pagination infinie via IntersectionObserver (10 par 10, `Query.limit/offset`)
- [x] 12. Filtres fonctionnels (catégorie, commune, super-repère) avec `Query.equal`
- [x] 13. Taux de change depuis collection `parametres` (document `global`), contexte React `AppwriteProvider`
- [x] 14. Page détail dynamique : `getDocument` + incrémentation des vues via API route (`/api/increment-view`)
- [x] 15. Page `/deposer` : formulaire complet avec upload images Appwrite Storage, validation, publication
- [x] 16. Profil vendeur (mode Ventes) : liste des annonces, changement de statut, suppression
- [x] 17. Proxy protège `/deposer` en plus de `/profil`
- [x] 18. `AppwriteProvider` (React context) pour le taux de change partagé
- [x] 19. Audit responsive complet (320px → 1440px) : scrollbar-hide, safe-area padding, scroll mask FilterBar, max-width selects
- [x] 20. BottomNav : `pb-safe` pour mobiles à notch, min-width 64px touch targets
- [x] 21. Page détail annonce : layout 2 colonnes sur desktop (image 60% + sticky content 40%)
- [x] 22. Footer : enrichi avec 3 colonnes (brand, navigation, contact), hover states
- [x] 23. Modal : `max-w-sm` mobile → `max-w-md` desktop
- [x] 24. Grille annonces : `gap-6` sur desktop au lieu de `gap-4`

Chaque module est détaillé ci-dessous avec l’ensemble des écrans, interactions et règles métier.

---

## 3. M1 – Authentification & Identité

### 3.1. Inscription & Connexion

Authentification par email/mot de passe uniquement (Google OAuth supprimé). Une bannière avec deux boutons (« Créer un compte », « Se connecter ») est affichée sur la page d'accueil quand l'utilisateur n'est pas connecté.
La page `/auth/phone` redirige vers `/auth/login` pour rétrocompatibilité.

#### 3.1.1. Page d'accueil — bannière d'authentification

- Visible uniquement pour les visiteurs non connectés (détecté via `useAuth()`).
- Placée entre la barre de filtres et les annonces.
- Contenu :
  - Titre : « Achetez et vendez à Kinshasa »
  - Sous-titre : « Rejoignez la marketplace de confiance des Kinois. »
  - Bouton « Créer un compte » (fond accent/jaune, texte primary) → `/auth/register`
  - Bouton « Se connecter » (fond primary/bleu, texte blanc) → `/auth/login`
- Disparaît automatiquement après connexion.

#### 3.1.2. Page de connexion (`/auth/login`)

- **Mise en page** : composant `AuthLayout` (split-screen desktop 50/50 : formulaire scrollable à gauche, colonne marketing fixe centrée à droite).
- **Formulaire email/mot de passe uniquement** (Google OAuth supprimé) :
  - Champ email (validation format).
  - Champ mot de passe avec toggle affichage/masquage.
  - Bouton « Se connecter » → `account.createEmailPasswordSession({ email, password })`.
  - En cas d'échec : message « Email ou mot de passe incorrect. ».
- **Lien** « Mot de passe oublié ? » → `/auth/forgot-password` (page avec AuthHeader + logo).
- **Lien** « Pas encore de compte ? Créez-en un. » → `/auth/register`.
- **Colonne marketing** (desktop) : fond dégradé Bleu Fleuve #0B192C, logo blanc, titre d'accueil, 4 bénéfices avec icônes (Achats sécurisés, Paiement Mobile Money, Livraison flexible, Communauté kinoise), preuve sociale (+2000 membres, confiance 4.8/5, 24 communes).

#### 3.1.3. Page d'inscription (`/auth/register`)

- **Mise en page** : composant `AuthLayout` (split-screen desktop, empilé mobile, identique à la page de connexion).
- **Formulaire complet sur une page** (plusieurs étapes) :
  - **Email \*** : validation format email.
  - **Nom d'utilisateur \*** : validation temps réel avec debounce 400ms, lettres et chiffres uniquement, 3-30 caractères, vérification disponibilité via `checkUsernameAvailability()` de `lib/auth.ts`.
  - **Mot de passe \*** : indicateur de force (barre colorée + label Faible/Moyen/Fort/Très fort), critères : ≥ 8 caractères, majuscule, minuscule, chiffre.
  - **Prénom \*** : texte, 100 max.
  - **Nom \*** : texte, 100 max.
  - **Sexe \*** : 3 boutons radio stylisés (Homme / Femme / Autre).
  - **Date de naissance** : champ date (optionnel, max = aujourd'hui).
  - **Commune de résidence \*** : menu déroulant (22 communes de Kinshasa).
  - **CGV \*** : checkbox « J'accepte les conditions d'utilisation » avec lien vers `/cgu`.
- **Mobile marketing intégré** : 3 pills de confiance (Achats sécurisés, Mobile Money, +2000 membres) sous le titre, et un accordéon `<details>` natif « Pourquoi ShopKin ? » après le formulaire listant les 4 bénéfices avec preuve sociale.
- **Bouton « Créer mon compte »** (accent jaune, large) :
  - Valide tous les champs.
  - `account.create(userId, email, password, fullName)` → `account.createEmailPasswordSession({ email, password })` → `databases.createDocument(profiles)` avec permissions user-level.
  - Le profil est créé avec `profile_complete: true`.

#### 3.1.5. Gestion des sessions

- Sessions email/password ; durée : 7 jours (session persistante via cookie sécurisé).
- S'il revient sur l'application après la fermeture du navigateur, il est automatiquement connecté tant que la session est valide.
- Bouton "Se déconnecter" dans le profil (cf. 3.3).
- Le `userId` Appwrite sert également d'ID du document `profiles` (liaison garantie).

### 3.2. Création du profil

- Lors de la première inscription (email/password), le document `profiles` est créé dans le même appel API avec tous les champs renseignés et `profile_complete: true`.
- L'ID du document est le `userId` Appwrite.
- Permissions : `read("any")`, `update(Role.user(userId))`, `delete(Role.user(userId))` + `create("any")` pour inscription client.
- Le champ `username` est rendu unique via un index Appwrite.
- Les pages `/auth/login` et `/auth/register` utilisent le composant `AuthLayout` (`components/layout/AuthLayout.tsx`) : mise en page split-screen desktop (formulaire 42% + colonne marketing 58% avec fond Bleu Fleuve, bénéfices et preuve sociale) et empilée sur mobile. Les autres pages `/auth/*` (forgot-password, reset-password, verify-email, complete-profile) arborent un `AuthHeader` minimal avec le logo ShopKin cliquable menant à l'accueil.

#### 3.1.7. Validation de l'email (vérification du compte)

- Après inscription, `account.createVerification(url)` est appelé automatiquement pour envoyer un email de confirmation contenant un lien magique.
- Le lien redirige vers `/auth/verify-email?userId=...&secret=...` qui appelle `account.updateVerification(userId, secret)`.
- Succès : message de confirmation + redirection vers `/profil` après 3 secondes.
- Échec : message d'erreur (lien expiré, déjà vérifié) + lien retour vers profil.
- Dans le profil (`/profil`), un bandeau jaune avec le texte « Votre adresse email n'a pas encore été vérifiée » et un bouton « Renvoyer l'email de confirmation » permet à tout moment de renvoyer l'email.
#### 3.1.8. Réinitialisation du mot de passe

- Page `/auth/forgot-password` : champ email → `account.createRecovery(email, url)` envoie un email avec lien de réinitialisation.
- Lien redirige vers `/auth/reset-password?userId=...&secret=...` avec formulaire nouveau mot de passe (double confirmation, force indicator).
- `account.updateRecovery(userId, secret, newPassword)` valide la réinitialisation.
- Succès : message + redirection vers `/auth/login` après 3 secondes.
- Sécurité : même si l'email n'existe pas, la page affiche « Si cet email existe, un lien a été envoyé » (pas de divulgation d'existence).

### 3.3. Page Profil (`/profil`)

Cette page est accessible uniquement après connexion (sinon redirection vers `/auth/login`).

#### 3.3.1. Affichage des informations

- Nom complet (prénom + nom) avec avatar initiales (ou username si vide).
- **Bandeau email non vérifié** : si `email_verified === false`, un bandeau jaune s'affiche : « Votre adresse email n'a pas encore été vérifiée. » Un bouton « Renvoyer l'email de confirmation » appelle `account.createVerification()`.
- Informations affichées dans une carte :
  - Email (avec badge "Vérifié" si vérifié).
  - WhatsApp (+243) — toujours affiché (« Non renseigné » si absent), avec icône crayon pour édition inline.
  - Nom d'utilisateur : `@username`.

#### 3.3.2. Switch "Achats / Ventes"

- Un interrupteur à deux positions, situé juste sous le nom.
- Par défaut, la position est "Achats".
- En mode **Achats** (actuellement), la zone en dessous est vide (elle sera remplie plus tard). Un message « Vous n'avez pas encore effectué d'achat. » s'affiche.
- En mode **Ventes** :
  - Liste des annonces du vendeur avec image, titre, prix, statut (select disponible/réservé/vendu), bouton supprimer.
  - Boutons "Wallet" et "Nouvelle annonce".

#### 3.3.3. Bouton "Se déconnecter"

- Placé en bas de page. Au clic, la session est supprimée et l'utilisateur est redirigé vers la page d'accueil.

#### 3.3.4. Édition du nom

- À côté du nom, une icône crayon permet de le modifier. Un champ inline apparaît pour saisir le nouveau nom (limité à 100 caractères). Validation par la touche Entrée ou en cliquant en dehors. Le document Appwrite est mis à jour.

#### 3.3.5. Photo de profil (Avatar)

- Affichée à côté du nom : photo Google (si connexion OAuth), photo personnalisée (upload), ou initiales en fallback.
- L'avatar Google est récupéré automatiquement via l'API route `/api/auth/google-avatar` qui interroge l'API Users Appwrite puis l'API Google Userinfo.
- Un icône crayon en bas à droite de l'avatar permet d'uploader une photo (JPG/PNG/WebP, max 2 Mo) vers le bucket `avatars`.
- Un overlay de chargement avec spinner couvre l'avatar pendant l'upload.
- Lien « Supprimer la photo » dans la carte Informations pour revenir aux initiales.
- Le composant `Avatar` (`components/ui/Avatar.tsx`) est réutilisable : il accepte `src`, `alt`, `size`, `fallbackName` et gère l'erreur de chargement d'image avec fallback initiales.
- Le Header utilise le même composant pour afficher l'avatar de l'utilisateur connecté.

#### 3.3.6. Édition du numéro WhatsApp

- La ligne WhatsApp est toujours visible dans la carte Informations (même si vide).
- Une icône crayon à côté du numéro ouvre un champ inline avec le préfixe `+243` fixe.
- Validation : chiffres uniquement, max 9 chiffres.
- Sauvegarde via `updateProfile()` avec toast de confirmation.

### 3.4. Configuration du Wallet (`/profil/wallet`)

#### 3.4.1. Formulaire

- **Nom réel** : champ texte obligatoire, pré-rempli avec `full_name` actuel. Il s'agit du nom qui apparaîtra sur les instructions de paiement.
- **Numéros Mobile Money** :
  - M-Pesa : champ texte (optionnel)
  - Airtel Money : champ texte (optionnel)
  - Orange Money : champ texte (optionnel)
- **Cases à cocher** : pour chaque opérateur, une case permet d'indiquer si le numéro est bien configuré pour recevoir des paiements. Par défaut, elles sont décochées. Si un numéro est renseigné, la case correspondante peut être cochée (pas obligatoire). La cohérence est vérifiée : on ne peut pas cocher "M-Pesa enregistré" si le champ M-Pesa est vide.
- **Bouton "Enregistrer"** :
  - Met à jour le document `profiles` dans la base de données.
  - Affiche une notification de succès (toast vert) : « Wallet mis à jour. »
  - En cas d'erreur, toast rouge : « Erreur lors de l'enregistrement. »
- **Bouton "Retour"** : ramène à `/profil`.

#### 3.4.2. Validation

- Le nom réel est obligatoire. Si vide au moment de l'enregistrement, un message d'erreur s'affiche sous le champ : « Le nom réel est obligatoire pour les transactions. »

### 3.5. Moyens de paiement (`/profil` — onglet Paiements)

Cette section permet à chaque utilisateur de gérer ses moyens de paiement personnels (Mobile Money et cartes bancaires). Ces données sont **strictement privées** : seuls les documents Appwrite avec permission `read("user:{userId}")` sont accessibles.

#### 3.5.1. Collection Appwrite `payment_methods`

| Attribut            | Type    | Requis               | Description                                                            |
| ------------------- | ------- | -------------------- | ---------------------------------------------------------------------- |
| `user_id`           | string  | oui                  | Lié à `profiles.$id`                                                   |
| `type`              | string  | oui                  | `"mobile_money"` ou `"card"`                                           |
| `provider`          | string  | oui                  | `orange_money`, `m_pesa`, `airtel_money`, `visa`, `mastercard`, `amex` |
| `label`             | string  | non                  | Libellé personnalisé (ex: « Compte perso Orange »)                     |
| `phone_number`      | string  | si type=mobile_money | Numéro (9 chiffres, sans préfixe)                                      |
| `card_holder_name`  | string  | si type=card         | Nom du titulaire                                                       |
| `card_last_four`    | string  | si type=card         | 4 derniers chiffres uniquement                                         |
| `card_expiry_month` | integer | si type=card         | 1-12                                                                   |
| `card_expiry_year`  | integer | si type=card         | ex: 2028                                                               |
| `is_default`        | boolean | non                  | Moyen de paiement par défaut                                           |

#### 3.5.2. Affichage et comportement

- **Onglet « Paiements »** : 3ᵉ onglet sur `/profil` (Achats / Ventes / **Paiements**).
- **Liste** : chaque moyen est affiché avec une icône ronde (initiales du provider), le libellé, et les détails masqués.
  - Mobile Money : `+243 81****12` (4 derniers chiffres visibles).
  - Carte : `**** **** **** 4242` + nom titulaire + date d'expiration.
- **Boutons** : « Modifier » (ouvre le formulaire pré-rempli dans une modale) et « Supprimer » (confirmation requise).
- **Bouton « + Ajouter »** : ouvre une modale avec :
  1. Choix du type (Mobile Money / Carte) via boutons bascules.
  2. Sélection du provider avec indicateur couleur.
  3. Champs conditionnels (numéro pour Mobile Money ; titulaire, 4 chiffres, date pour carte).
  4. Libellé optionnel.
  5. Case « Par défaut ».
- **Validation** : doublons interdits (même numéro ou même 4 derniers chiffres), format numéro, date d'expiration valide.

#### 3.5.3. Sécurité et conformité

- **Permissions document-level** : `Permission.read(Role.user(userId))`, `update`, `delete` idem. Seul le propriétaire accède à ses données.
- **Stockage minimal** : pas de numéro de carte complet, pas de CVV. Conforme PCI (les 4 derniers chiffres ne permettent pas une transaction).
- **Affichage masqué** : les numéros téléphone sont partiellement masqués à l'affichage ; les 4 derniers chiffres sont visibles pour identification.
- Aucune donnée de paiement n'est visible par d'autres utilisateurs, ni dans le HTML public.

---

## 4. M2 – Catalogue & Recherche

### 4.1. Page d’accueil / Catalogue (`/`)

Cette page est publique, accessible sans connexion.

#### 4.1.1. Structure

- **En-tête** :
  - Logo "ShopKin" à gauche.
  - Un toggle de devise (switch USD / CDF) à droite, visible en permanence.
  - Une icône de profil (bonhomme) menant à `/profil` si connecté, ou à `/auth/phone` sinon.
- **Barre de filtres** (entonnoir) :
  - Trois niveaux successifs : **Catégorie**, **Commune**, **Super‑repère**.
  - Affichage sous forme de boutons de sélection rapide (chips) ou menus déroulants.
  - L'utilisateur doit obligatoirement choisir une catégorie, puis une commune, puis (optionnellement) un repère.
  - Les repères populaires sont suggérés, mais un champ libre permet de saisir n’importe quel texte.

#### 4.1.2. Filtres (comportement détaillé)

- **Catégories disponibles** (liste fixe) : Téléphones, Électroménager, Mode, Véhicules, Maison, Enfants, Emploi & Services, Autres.
- **Communes** : liste des 24 communes de Kinshasa (Bandundu, Barumbu, Bumbu, Gombe, Kinshasa, Kintambo, Kisenso, Lemba, Limete, Lingwala, Makala, Maluku, Masina, Matete, Mont Ngafula, Ndjili, Ngaba, Ngaliema, Ngiri-Ngiri, Nsele, Selembao, etc.).
- **Super‑repère** :
  - Une liste de suggestions prédéfinies (ex : Rond-point Moulaert, Marché de la Liberté, Station Engen, etc.) apparaît lorsqu'on tape les premières lettres.
  - L'utilisateur peut aussi entrer un texte libre (max 150 caractères).
- **Application des filtres** : la sélection d'une catégorie recharge la liste des annonces correspondantes. Ensuite la commune, puis le repère, filtrent davantage. Les filtres sont cumulatifs. Un bouton "Réinitialiser" permet de tout effacer.

#### 4.1.3. Grille d’annonces

- Affichage sous forme de cartes empilées verticalement (1 colonne sur mobile, 2 colonnes sur écran large).
- **Chaque carte contient** :
  - Une image principale (si plusieurs, afficher la première). L’image est au format paysage, recadrée, avec un effet de chargement "skeleton" (rectangle gris animé) avant l'affichage.
  - Un badge "Livraison possible" si le vendeur a activé l'option (cf. M4). Ce badge est une petite pastille jaune.
  - Le titre de l’annonce (tronqué à 60 caractères, suivi de "...").
  - Le prix, dans la devise sélectionnée (USD ou CDF), avec un symbole : `$450` ou `1 260 000 FC`.
  - La commune et le super‑repère en dessous du prix, en police plus petite.
  - Le nombre de vues (petite icône œil + chiffre).
- **Comportement** : cliquer sur une carte ouvre la page de détail de l’annonce (`/annonce/{id}`).

#### 4.1.4. Toggle de devise

- Situé dans l’en-tête, sous forme d’un switch avec les libellés "USD" / "CDF".
- Le taux de conversion est récupéré régulièrement (1 USD = X CDF) depuis un paramètre stocké dans la base de données.
- Tous les prix affichés sont recalculés instantanément côté client sans rechargement de page. Les valeurs sont arrondies à l'unité ou au millier pour les francs.
- Si le taux n’est pas disponible, les prix s’affichent dans la devise d’origine et un message « Taux non disponible » apparaît en gris.

#### 4.1.5. Pagination infinie

- Au scroll vers le bas, de nouvelles annonces sont chargées automatiquement (10 par 10). Un indicateur de chargement apparaît en bas.
- Si plus d’annonces, afficher « — Vous avez tout vu ! — ».

### 4.2. Détail d’une annonce (`/annonce/{id}`)

#### 4.2.1. Contenu

- **Galerie d’images** : carrousel swipeable (sur mobile) avec pagination par points. Les images sont en pleine largeur, ratio 4/3. Zoom possible en pinch-to-zoom.
- **Titre** (complet, jusqu’à 150 caractères).
- **Prix** (en grand, avec devise) et indication de la devise d’origine.
- **Description** complète.
- **Localisation** : commune + super‑repère, avec une carte statique miniature (image générée) centrée sur le repère si disponible, sinon simplement le texte.
- **Statut de disponibilité** : un badge vert "Disponible" (ou grisé "Réservé", "Vendu").
- **Nombre de vues** incrémenté automatiquement à chaque visite de la page (sauf si le visiteur est le vendeur).

#### 4.2.2. Options de livraison affichées

- Si le vendeur propose la remise en main propre (toujours oui), un bloc « Remise en main propre » avec une icône de poignée de main et un court message de sécurité.
- Si le vendeur propose la livraison avec ses frais, un bloc « Livraison » indique le montant des frais (ex : « Livraison : 5000 FC ») et l’option d’acompte de course si activée.
- Si l’acompte est activé, un petit texte explicatif : « Le vendeur demande un acompte de {frais} FC avant d’expédier. Vous payerez l'objet à la réception. »

#### 4.2.3. Boutons d’action

- **Bouton principal "Contacter sur WhatsApp"** (cf. M3).
- **Bouton secondaire "Signaler"** (non prioritaire, mais affiché discrètement) : ouvre un petit formulaire pour signaler l’annonce. Pas de fonction immédiate ; envoie un e-mail à l’administrateur ou enregistre un signalement. Hors scope MVP, mais le bouton peut être présent sans fonction.

### 4.3. Dépôt d’une annonce (`/deposer`)

Accessible uniquement si connecté.

#### 4.3.1. Formulaire

- **Titre** : champ texte obligatoire (max 150 caractères).
- **Catégorie** : menu déroulant avec la liste prédéfinie.
- **Description** : zone de texte libre (obligatoire, max 10 000 caractères).
- **Prix** : champ numérique obligatoire, positif.
- **Devise** : sélection USD ou CDF (par défaut USD).
- **Commune** : menu déroulant avec les 24 communes.
- **Super‑repère** : champ texte (max 150 caractères), avec suggestions automatiques depuis une liste préétablie (même liste que pour les filtres).
- **Images** : jusqu’à 5 photos. Chaque photo est redimensionnée côté client (max 1080px de large) avant envoi, puis uploadée vers le stockage. Une prévisualisation s’affiche. On peut supprimer et réorganiser les images (drag and drop basique).
- **Options de livraison** :
  - "Remise en main propre" (coché par défaut, non modifiable).
  - "J'accepte de livrer" : case à cocher. Si cochée, un champ "Frais de livraison" apparaît (montant numérique, positif ou zéro).
  - Sous-option (si livraison activée) : "Exiger un acompte pour les frais de livraison" (case à cocher). Un texte explicatif s’affiche : « L’acheteur paiera ces frais avant l’envoi. »
- **Bouton "Publier"** :
  - Vérifie les champs obligatoires. Affiche des messages d’erreur sous les champs invalides.
  - Crée un document dans la collection `annonces` avec `status` = `disponible`.
  - Redirige vers la page de l’annonce nouvellement créée.
- **Bouton "Enregistrer en brouillon"** (option futur, pas MVP) : non présent dans l’immédiat.

#### 4.3.2. Gestion des images

- L'upload se fait immédiatement au choix de l’image (pas besoin d’attendre la soumission finale). Les images sont stockées dans un bucket Appwrite Storage.
- Chaque image uploadée reçoit un identifiant qui est ajouté à un tableau `images_storage_paths`. Les images sont compressées automatiquement par une fonction côté serveur pour économiser la bande passante.
- Si l'utilisateur quitte la page sans publier, les images uploadées restent dans le bucket mais ne seront pas liées à une annonce (elles pourront être nettoyées périodiquement).

### 4.4. Gestion des annonces par le vendeur

- Depuis l’interface "Mes Ventes" (plus tard), le vendeur voit la liste de ses annonces.
- Pour chaque annonce, il peut :
  - Modifier l’annonce (réutilise le formulaire de dépôt avec les champs pré-remplis).
  - Changer le statut manuellement : "Disponible", "Réservé", "Vendu".
  - Supprimer l’annonce (avec confirmation).
- Lors du changement de statut à "Vendu", l’annonce n’apparaît plus dans les résultats de recherche (permission de lecture retirée).

---

## 5. M3 – Communication & Négociation

### 5.1. Bouton "Contacter sur WhatsApp"

- Présent sur la page de détail de chaque annonce disponible.
- Au clic, l’application construit un lien profond WhatsApp : `https://wa.me/XXXXXXXXXX?text=...`
  - Le numéro de téléphone est récupéré depuis le document `profiles` du vendeur, mais **ne s’affiche jamais dans le DOM** (il est injecté dynamiquement lors du clic).
  - Le texte pré-rempli est :  
    `"Salut ! Je t’écris depuis ShopKin pour ton annonce **[Titre de l'annonce]** à **[Prix]**. Tu es dispo pour une remise en main propre à **[Super‑repère]** ?"`
- Ce lien ouvre WhatsApp (application native ou web) avec la conversation prête.
- Si l'utilisateur n'a pas WhatsApp installé, le lien s'ouvre dans le navigateur (version web). En cas d'échec complet, on peut afficher une alerte avec le numéro à recopier, mais cela doit rester exceptionnel.

### 5.2. Compteur de contacts

- À chaque clic sur le bouton "Contacter", un compteur anonymisé est incrémenté dans l’annonce (`contacts_count` ou simplement `views_count`). Cela permet au vendeur de savoir combien de personnes ont ouvert la conversation. (Optionnellement, on peut différencier les vues des contacts, mais pour le MVP on garde simple.)
- Aucune information sur l’acheteur n’est conservée (pas de numéro).

### 5.3. Protection de la vie privée

- Le numéro du vendeur ne transite jamais en clair dans le code source de la page. Il est récupéré via une fonction sécurisée au moment de la génération du lien, puis oublié.
- Aucun cookie ou localStorage ne stocke ce numéro.

---

## 6. M4 – Transaction & Logistique

### 6.1. Options de livraison définies par le vendeur

Chaque annonce a deux modes possibles, configurés lors du dépôt :

1. **Remise en main propre** (toujours active)
2. **Livraison par le vendeur** (optionnelle)

#### 6.1.1. Remise en main propre

- Sur la page de l’annonce, un bloc affiche un message de sécurité :  
  _"Pour votre sécurité, privilégiez une rencontre dans un lieu public (supermarché, station-service, etc.)."_
- Pas d’autre action requise.

#### 6.1.2. Livraison par le vendeur

- Si activée, le vendeur a fixé un montant de frais de livraison (ex : 5000 FC).
- Sur la page de l’annonce, ce montant est affiché en plus du prix de l’objet.
- Le vendeur peut en plus activer l’**acompte de livraison**.

### 6.2. Widget "Sécurité Course" (Anti-Lapolo)

Disponible uniquement si l’acompte est activé.

#### 6.2.1. Comportement pour l’acheteur

- Sur la page de l’annonce, un bloc spécifique apparaît :  
  _"Ce vendeur demande un acompte correspondant aux frais de livraison avant expédition. Le solde se paie à la réception."_
- Un bouton "Payer les frais de livraison" est présent.
- Au clic, l’application affiche une modale contenant :
  - Le montant exact des frais.
  - Un QR Code généré dynamiquement (basé sur le format Mobile Money : lien `pay://` ou simple texte avec le numéro du vendeur et le montant). En pratique, le QR code encode un lien ou un texte que l’application Mobile Money peut scanner.
  - Les instructions : "Ouvrez votre application Mobile Money, scannez ce QR code et validez le paiement."
  - Un bouton "J’ai payé" (simple confirmation, sans effet réel) qui ferme la modale.
- L'application ne suit pas le statut du paiement. Elle rappelle simplement que le vendeur doit confirmer la réception avant d’expédier.

#### 6.2.2. Génération du QR Code

- Le QR Code est généré côté client en utilisant une bibliothèque JavaScript (ex : `qrcode.react`).
- Il encode une chaîne de type :  
  `"Envoyez [montant] CDF au numéro [numéro Mobile Money] pour les frais de livraison de l'annonce [titre]."`  
  ou un lien spécifique selon l'opérateur si disponible, sinon une simple phrase que l’application de scan pourra interpréter. À défaut, l’utilisateur peut recopier le numéro manuellement (affiché discrètement, avec option de copier).
- Le numéro utilisé est celui configuré dans le wallet du vendeur (premier numéro enregistré).

### 6.3. Modalité de paiement pour l'objet

- L'achat final se fait hors application. L’application ne propose pas de paiement intégré.
- Des notes supplémentaires peuvent être affichées dans la conversation WhatsApp pré-remplie (ex : "Je te paie le solde à la livraison").

### 6.4. Alerte de sécurité contextuelle

- À chaque fois qu’une fonction de mise en relation ou de paiement est utilisée, une petite phrase de prudence est visible :  
  _"Ne payez jamais la totalité avant d’avoir vu l’objet. ShopKin ne garantit pas les transactions."_

---

## 7. M5 – PWA & Expérience hors-ligne

### 7.1. Installation de l’application

- L’application est une PWA (Progressive Web App). Elle peut être installée sur l’écran d’accueil du téléphone.
- Un fichier `manifest.json` définit le nom, les icônes, les couleurs et le mode d’affichage (`standalone`, sans barre d’URL).
- Lors de la première visite (ou après un certain temps), une bannière native du navigateur ou un petit popup personnalisé invite l’utilisateur à "Ajouter ShopKin à l’écran d’accueil".
- Une fois installée, l’application se lance en plein écran et apparaît comme une application native dans la liste des applications.

### 7.2. Icônes et splash screen

- Icône de l’application : logo ShopKin sur fond Bleu Fleuve.
- Splash screen lors du lancement : fond `#F8F9FA` avec le logo centré.

### 7.3. Fonctionnement hors-ligne

- Un Service Worker est enregistré.
- **Pages d’annonces** : lorsqu’une annonce est consultée en ligne, ses données (texte, images) sont mises en cache. Si l’utilisateur perd la connexion, il peut rouvrir la même annonce depuis l’historique, ou depuis la liste des favoris, et les informations s’affichent normalement (images comprises).
- **Page d’accueil** : le dernier état du catalogue (les 20-30 premières annonces) est mis en cache. En mode hors-ligne, l’utilisateur voit ces annonces avec un indicateur "Hors-ligne" en haut.
- **Recherche et filtres** : ne fonctionnent pas sans connexion. Un message "Vous êtes hors-ligne. Certaines fonctionnalités sont limitées." s’affiche si on tente de filtrer.
- **Dépôt d’annonce** : impossible hors-ligne ; un message prévient l’utilisateur.

### 7.4. Stratégie de cache

- **Cache First** pour les images et les assets statiques (CSS, fonts). Les fichiers sont servis depuis le cache si disponibles, ce qui accélère énormément le chargement.
- **Network First** pour les données dynamiques (liste d’annonces, détail) : l’application tente d’abord de récupérer les données du réseau. En cas d’échec, elle affiche les données en cache.

### 7.5. Mises à jour automatiques

- Lorsqu’une nouvelle version de l’application est déployée, le Service Worker détecte le changement et invite l’utilisateur à rafraîchir la page pour obtenir la dernière version.

---

## 8. Éléments transversaux

### 8.1. Design System

- **Couleurs** :
  - Primary (Bleu Fleuve) : `#0B192C` – titres, boutons principaux, header.
  - Accent (Jaune Zando) : `#FFD700` – prix, badges, boutons d’action, états actifs.
  - Background : `#F8F9FA` – fond.
  - Success : `#10B981` – confirmations, statuts disponibles.
  - Danger : `#EF4444` – erreurs, alertes.
  - Texte : `#4B5563` – corps.
  - Border : `#E5E7EB` – séparations.

- **Typographie** :
  - Titres : "Plus Jakarta Sans" (Bold 700 pour h1, SemiBold 600 pour h2, h3).
  - Corps : "Inter" (Regular 400, Medium 500 pour emphases).

- **Coins arrondis** :
  - Cartes : 16px.
  - Boutons : 12px.
  - Inputs : 12px.
  - Badges : pilule (border-radius 9999px).

- **Ombres** : légères (0 2px 8px rgba(0,0,0,0.05)) sur les cartes pour donner de la profondeur.

- **Espacements** : multiples de 8px (8, 16, 24, 32).

### 8.2. Feedback et micro-interactions

- **Squelettes de chargement** : animations de pouls grises pour les images et les textes avant affichage.
- **Vibration haptique** : lors du clic sur les boutons principaux (ex : "Négocier", "Publier"), une courte vibration (10ms) est déclenchée si le téléphone le permet.
- **Transitions** : durée de 200ms avec easing "ease-out" pour les changements d’état (hover, ouverture de modale).
- **Toast notifications** : pour les succès (vert) et erreurs (rouge), apparaissent en bas de l’écran et disparaissent après 3 secondes.

### 8.3. Gestion des erreurs

- Toute erreur réseau ou serveur entraîne l’affichage d’un message générique : "Une erreur est survenue. Veuillez réessayer." avec un bouton "Réessayer".
- Les formulaires affichent les erreurs de validation en rouge sous chaque champ.
- Les pages non trouvées (404) affichent une page dédiée avec un lien de retour.

### 8.4. Accessibilité

- Les contrastes de couleurs respectent les normes WCAG AA.
- Tous les boutons et champs ont des libellés appropriés.
- L’application est navigable au clavier et avec les lecteurs d’écran (balises ARIA de base).

### 8.5. Sécurité

- Toutes les communications avec Appwrite se font via HTTPS.
- Les clés d’API ne sont jamais exposées côté client.
- Les permissions de base de données sont strictes : un utilisateur ne peut modifier que ses propres documents.
- Le numéro de téléphone du vendeur n’est jamais transmis au client avant une action explicite de contact.

### 8.6. Performances

- Les images sont compressées et servies en WebP.
- Lazy loading des images et composants.
- Code splitting automatique par Next.js.
- Mise en cache agressive des assets statiques (immutable cache).

---

## 9. Découpage en pages (résumé)

| Route                    | Page                 | Accessible sans connexion | Rôle                                                                                                   | Statut |
| ------------------------ | -------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ | ------ |
| `/`                      | Accueil / Catalogue  | Oui                       | Annonces dynamiques Appwrite, filtres, pagination infinie                                              | ✅     |
| `/a-propos`              | À propos             | Oui                       | Mission, valeurs, fonctionnement                                                                       | ✅     |
| `/cgu`                   | Conditions générales | Oui                       | CGU marketplace 8 sections                                                                             | ✅     |
| `/privacy`               | Confidentialité      | Oui                       | Politique de confidentialité                                                                           | ✅     |
| `/auth/login`            | Connexion            | Oui                       | Email/mdp + Google OAuth                                                                               | ✅     |
| `/auth/register`         | Inscription          | Oui                       | Formulaire complet email + username + mot de passe                                                     | ✅     |
| `/auth/complete-profile` | Finalisation profil  | Non                       | Compléter profil pour utilisateurs Google                                                              | ✅     |
| `/auth/forgot-password`  | Mot de passe oublié  | Oui                       | Email → lien réinitialisation via `account.createRecovery`                                             | ✅     |
| `/auth/reset-password`   | Réinit mot de passe  | Oui                       | Nouveau mot de passe + `account.updateRecovery`                                                        | ✅     |
| `/auth/verify-email`     | Vérification email   | Oui                       | Callback `account.updateVerification` + message succès/erreur                                          | ✅     |
| `/auth/oauth-callback`   | Retour OAuth Google  | Oui                       | Traitement callback OAuth + `email_verified: true`                                                     | ✅     |
| `/auth/phone`            | (redirection)        | Oui                       | Redirige vers `/auth/login`                                                                            | ✅     |
| `/profil`                | Profil               | Non                       | Switch Achats/Ventes/Paiements, édition nom, avatar, liste ventes + statut, gestion moyens de paiement | ✅     |
| `/profil/wallet`         | Configuration Wallet | Non                       | Enregistrement numéros Mobile Money                                                                    | ✅     |
| `/annonce/[id]`          | Détail annonce       | Oui                       | Données dynamiques, incrémentation vues, WhatsApp                                                      | ✅     |
| `/deposer`               | Dépôt annonce        | Non                       | Formulaire complet avec upload images Storage                                                          | ✅     |
| `/404`                   | Page introuvable     | Oui                       | Page 404 personnalisée avec bouton retour                                                              | ✅     |

---

## 10. Règles métier importantes

- Un utilisateur ne peut pas contacter un vendeur sans cliquer sur le bouton WhatsApp (pas d’affichage direct du numéro).
- Les annonces marquées "vendu" ou "réservé" disparaissent des résultats publics.
- Le taux de change USD/CDF est défini manuellement pour l’instant, avec mise à jour régulière prévue.
- Un vendeur peut avoir plusieurs annonces, mais chaque annonce est liée à un seul vendeur.
- Les images d’annonces sont stockées de manière sécurisée ; elles ne sont pas accessibles sans l’ID du fichier.
- L’application ne conserve pas de fil de discussion.

---

## 11. Infrastructure Appwrite (CLI)

La gestion de l'infrastructure Appwrite (bases, tables, buckets, etc.) se fait via la **CLI Appwrite** (v22+) et le fichier `appwrite.config.json` à la racine du projet. Plus besoin de script d'initialisation manuel.

### 11.1. Installation de la CLI

```bash
npm install -g appwrite-cli
```

### 11.2. Configuration initiale (une seule fois)

```bash
# 1. Connexion à ton compte Appwrite Cloud
appwrite login

# 2. Configurer le endpoint et le project
appwrite client --endpoint https://fra.cloud.appwrite.io/v1
appwrite client --project-id 6a43ef85001796c9d66e

# 3. (Optionnel) Définir une clé API serveur pour les push/pull
# Génère une clé depuis Console > Project > Settings > API Keys
# avec les scopes : databases.write, collections.write, documents.write, storage.write
appwrite client --key "ta_clé_api"
```

> **Sécurité** : la clé API n'est jamais stockée dans `appwrite.config.json`.  
> La CLI la conserve dans `~/.appwrite` (hors du projet).

### 11.3. Synchronisation

```bash
# Pousser les tables + buckets vers Appwrite
npm run appwrite:push

# (Sous-commandes)
npm run appwrite:push:tables    # tables uniquement
npm run appwrite:push:buckets   # buckets uniquement

# Récupérer l'état distant en local
npm run appwrite:pull
```

### 11.4. Contenu de `appwrite.config.json`

Le fichier **versionné** décrit toute l'infrastructure :

| Ressource          | ID                | Détails                                                     |
| ------------------ | ----------------- | ----------------------------------------------------------- |
| Base               | `shopkin`         | Contient 3 tables                                           |
| Table `profiles`   | `profiles`        | Profils utilisateurs (17 colonnes — voir schemas ci-dessus) |
| Table `annonces`   | `annonces`        | Annonces marketplace (15 colonnes)                          |
| Table `parametres` | `parametres`      | Document `global` avec `usd_cdf_rate`                       |
| Bucket             | `annonces-images` | Stockage images (JPG, PNG, WebP, GIF, max 10 Mo)            |

### 11.5. Workflow recommandé

1. **Modifier la structure localement** : édite `appwrite.config.json`.
2. **Pousser les changements** : `npm run appwrite:push`.
3. **Ne pas modifier la structure depuis la console** (ou alors faire un `appwrite pull` pour synchroniser le fichier local).

### 11.6. Scripts npm disponibles

| Script                          | Commande                                                    |
| ------------------------------- | ----------------------------------------------------------- |
| `npm run appwrite:login`        | `appwrite login`                                            |
| `npm run appwrite:pull`         | `appwrite pull tables && appwrite pull buckets`             |
| `npm run appwrite:push`         | `appwrite push tables -a -f && appwrite push buckets -a -f` |
| `npm run appwrite:push:tables`  | `appwrite push tables`                                      |
| `npm run appwrite:push:buckets` | `appwrite push buckets`                                     |

### 11.7. Méthodes d'authentification Appwrite

| Méthode             | Statut       |
| ------------------- | ------------ |
| Email / Password    | ✅ Activé    |
| Google OAuth        | ✅ Activé    |
| Téléphone (OTP SMS) | ❌ Désactivé |
| Email OTP           | ❌ Désactivé |

### 11.8. Héritage

- La route API `GET /api/init-db` a été désactivée.
- Le script `scripts/init-db.ts` est conservé comme fallback, mais la méthode recommandée est désormais la CLI Appwrite + `appwrite.config.json`.
- Le bucket `annonces-images` est également déclaré dans le fichier de config.

---

Ce document couvre l'ensemble des fonctionnalités de ShopKin, dans leurs moindres détails. Chaque point sera implémenté selon ces spécifications. Si une fonctionnalité mérite d’être approfondie, une demande spécifique peut être faite.

## 12. Tests automatisés (Playwright)

### 12.1. Structure des tests

```
tests/
├── utils.ts                          # Helpers partagés (viewport, auth, waitForToast, sélecteurs)
├── m1-auth.spec.ts                   # Connexion, inscription, forgot/reset password, validation
├── m1-auth-responsive.spec.ts        # Tests responsive mobile de l'auth
├── m1-profile.spec.ts                # Profil, wallet, déconnexion, édition nom
├── m2-catalog.spec.ts                # Catalogue, filtres, pagination infinie, états vides
├── m2-catalog-responsive.spec.ts     # Tests responsive mobile du catalogue
├── m2-annonce.spec.ts                # Détail annonce, compteur vues, WhatsApp, livraison
├── m2-deposer.spec.ts                # Dépôt d'annonce, validation formulaire, upload image
├── admin.spec.ts                     # Module Admin : accès, login, register, dashboard, CRUD
├── security.spec.ts                  # Sécurité : aucun lien admin sur pages publiques
├── home.spec.ts                      # Smoke tests page d'accueil
├── login.spec.ts                     # Smoke tests connexion
├── register.spec.ts                  # Smoke tests inscription
├── navigation.spec.ts                # Navigation, redirections, admin login
└── forgot-password.spec.ts           # Smoke tests mot de passe oublié
```

### 12.2. Scénarios couverts

#### M1 – Authentification & Profil

| #   | Scénario                                                                                             | Statut |
| --- | ---------------------------------------------------------------------------------------------------- | ------ |
| 1   | Inscription : affichage complet du formulaire (tous les champs, radio sexe, checkbox CGU)            | ✅     |
| 2   | Inscription : validation email invalide                                                              | ✅     |
| 3   | Inscription : validation mot de passe trop court (< 8 car)                                           | ✅     |
| 4   | Inscription : validation mot de passe sans majuscule                                                 | ✅     |
| 5   | Inscription : validation mots de passe différents                                                    | ✅     |
| 6   | Inscription : validation username trop court (< 3 car)                                               | ✅     |
| 7   | Inscription : validation username caractères spéciaux                                                | ✅     |
| 8   | Inscription : validation sexe non sélectionné                                                        | ✅     |
| 9   | Inscription : validation commune non sélectionnée                                                    | ✅     |
| 10  | Inscription : indicateur force mot de passe (Faible → Moyen → Fort)                                  | ✅     |
| 11  | Inscription : lien connexion présent                                                                 | ✅     |
| 12  | Inscription : badges confiance visibles                                                              | ✅     |
| 13  | Inscription réussie avec email unique → redirection /profil                                          | ✅     |
| 14  | Inscription avec email déjà utilisé → message d'erreur                                               | ✅     |
| 15  | Connexion : affichage formulaire complet                                                             | ✅     |
| 16  | Connexion : validation email vide                                                                    | ✅     |
| 17  | Connexion : validation mot de passe vide                                                             | ✅     |
| 18  | Connexion : mauvais identifiants → message d'erreur                                                  | ✅     |
| 19  | Connexion : identifiants valides → redirection /profil                                               | ✅     |
| 20  | Connexion : lien inscription présent                                                                 | ✅     |
| 21  | Connexion : lien mot de passe oublié présent                                                         | ✅     |
| 22  | Connexion : toggle affichage mot de passe                                                            | ✅     |
| 23  | Connexion : redirection /auth/phone → /auth/login                                                    | ✅     |
| 24  | Mot de passe oublié : affichage formulaire                                                           | ✅     |
| 25  | Mot de passe oublié : validation email vide                                                          | ✅     |
| 26  | Mot de passe oublié : lien retour connexion                                                          | ✅     |
| 27  | Mot de passe oublié : soumission email → message de confirmation                                     | ✅     |
| 28  | Vérification email : lien invalide sans paramètres                                                   | ✅     |
| 29  | Profil : redirection vers login si non auth (profil, wallet, edit)                                   | ✅     |
| 30  | Profil connecté : affichage titre tableau de bord                                                    | ✅     |
| 31  | Profil connecté : bouton déconnexion visible                                                         | ✅     |
| 32  | Profil connecté : déconnexion → redirection /auth/login + toast                                      | ✅     |
| 33  | Profil connecté : bascule Acheteur/Ventes/Paiements                                                  | ✅     |
| 34  | Profil connecté : lien édition profil                                                                | ✅     |
| 35  | Profil connecté : édition du nom → sauvegarde                                                        | ✅     |
| 36  | Wallet : page affichée avec formulaire                                                               | ✅     |
| 37  | Wallet : validation cohérence checkbox/numéro                                                        | ✅     |
| 38  | Auth responsive mobile : formulaire pleine largeur, pas de split desktop                             | ✅     |
| 39  | Auth responsive mobile : boutons taille minimum (>= 44px)                                            | ✅     |
| 40  | Auth responsive mobile : pas de scroll horizontal                                                    | ✅     |

#### M2 – Catalogue & Recherche

| #   | Scénario                                                                  | Statut |
| --- | ------------------------------------------------------------------------- | ------ |
| 41  | Catalogue : titre et meta title visibles                                  | ✅     |
| 42  | Catalogue : barre de filtres présente (chips + selects)                   | ✅     |
| 43  | Catalogue : grille d'annonces ou skeletons visibles                       | ✅     |
| 44  | Catalogue : compteur d'annonces                                           | ✅     |
| 45  | Catalogue : toggle devise USD/CDF visible                                 | ✅     |
| 46  | Catalogue : toggle devise changement d'affichage des prix                 | ✅     |
| 47  | Catalogue : carte produit avec titre, prix, localisation                  | ✅     |
| 48  | Catalogue : clic sur carte → /annonce/[id]                               | ✅     |
| 49  | Catalogue : bannière invité pour utilisateur non connecté                 | ✅     |
| 50  | Catalogue : bannière invité avec lien création compte                     | ✅     |
| 51  | Filtres : sélection catégorie → mise à jour grille                       | ✅     |
| 52  | Filtres : select commune présent                                          | ✅     |
| 53  | Filtres : état vide avec message                                          | ✅     |
| 54  | Pagination : message fin « Vous avez tout vu »                            | ✅     |
| 55  | Détail annonce : skeleton pendant chargement                              | ✅     |
| 56  | Détail annonce : bouton retour                                            | ✅     |
| 57  | Détail annonce : bouton retour → retour à l'accueil                       | ✅     |
| 58  | Détail annonce : bouton WhatsApp présent (URL wa.me)                      | ✅     |
| 59  | Détail annonce : statut Disponible affiché                                | ✅     |
| 60  | Détail annonce : métadonnées (date, vues)                                 | ✅     |
| 61  | Détail annonce : options livraison                                        | ✅     |
| 62  | Détail annonce : compteur de vues affiché                                 | ✅     |
| 63  | Dépôt annonce : redirection login si non auth                             | ✅     |
| 64  | Dépôt annonce : formulaire complet visible (connecté)                     | ✅     |
| 65  | Dépôt annonce : sélecteurs catégorie/commune/super-repère                | ✅     |
| 66  | Dépôt annonce : validation titre obligatoire                              | ✅     |
| 67  | Dépôt annonce : validation prix manquant                                  | ✅     |
| 68  | Dépôt annonce : upload image avec prévisualisation                        | ✅     |
| 69  | Dépôt annonce : soumission complète → succès                              | ✅     |
| 70  | Catalogue responsive mobile : grille 1 colonne                            | ✅     |
| 71  | Catalogue responsive mobile : BottomNav visible                           | ✅     |
| 72  | Catalogue responsive mobile : 3 liens BottomNav                           | ✅     |
| 73  | Catalogue responsive mobile : footer masqué                               | ✅     |
| 74  | Catalogue responsive mobile : padding bas anti-chevauchement              | ✅     |
| 75  | Connexion : paramètre redirect                                            | ✅     |

#### MAdmin – Administration

| #   | Scénario                                                                                          | Statut |
| --- | ------------------------------------------------------------------------------------------------- | ------ |
| 76  | Admin : accès /admin sans connexion → /admin/login                                                | ✅     |
| 77  | Admin : accès /admin/* préserve paramètre redirect                                                | ✅     |
| 78  | Admin : utilisateur normal → pas d'accès /admin                                                   | ✅     |
| 79  | Admin : /admin/register accessible sans auth                                                      | ✅     |
| 80  | Admin login : formulaire visible (Email, Mot de passe, bouton)                                    | ✅     |
| 81  | Admin login : validation email vide                                                               | ✅     |
| 82  | Admin login : validation mot de passe vide                                                        | ✅     |
| 83  | Admin login : mauvais identifiants → message d'erreur                                             | ✅     |
| 84  | Admin login : lien vers inscription admin présent                                                 | ✅     |
| 85  | Admin login : lien vers connexion utilisateur standard présent                                    | ✅     |
| 86  | Admin register : formulaire visible (Email, Prénom, Nom, Mot de passe, Confirmation)              | ✅     |
| 87  | Admin register : validation champs vides                                                          | ✅     |
| 88  | Admin register : validation mot de passe trop court                                               | ✅     |
| 89  | Admin register : validation mots de passe différents                                              | ✅     |
| 90  | Admin register : validation email invalide                                                        | ✅     |
| 91  | Admin register : validation prénom manquant                                                       | ✅     |
| 92  | Admin register : validation nom manquant                                                          | ✅     |
| 93  | Admin register : email non autorisé → message d'erreur (liste blanche)                            | ✅     |
| 94  | Admin register : email autorisé → succès + redirection                                            | ✅     |
| 95  | Admin dashboard : titre Tableau de bord visible                                                   | ✅     |
| 96  | Admin users : page protégée                                                                       | ✅     |
| 97  | Admin annonces : page protégée                                                                    | ✅     |
| 98  | Admin settings : page protégée                                                                    | ✅     |
| 99  | Admin responsive mobile : login responsive                                                        | ✅     |
| 100 | Admin responsive mobile : register responsive                                                     | ✅     |
| 101 | Admin responsive mobile : boutons >= 44px                                                         | ✅     |

#### Sécurité

| #   | Scénario                                                                                              | Statut |
| --- | ----------------------------------------------------------------------------------------------------- | ------ |
| 102 | Aucun lien /admin sur la page d'accueil (header)                                                      | ✅     |
| 103 | Aucun lien /admin dans le footer                                                                      | ✅     |
| 104 | Aucun lien /admin dans la BottomNav mobile                                                            | ✅     |
| 105 | Aucun lien /admin sur la page profil (connecté)                                                       | ✅     |
| 106 | Aucun lien /admin sur la page détail annonce                                                          | ✅     |
| 107 | /admin/login non indexé (meta robots noindex)                                                         | ✅     |
| 108 | Aucun email admin ou route /api/admin/ dans le HTML public                                            | ✅     |

### 12.3. Configuration Playwright

- **2 projets** : `Desktop Chrome` (1280x720) et `Mobile Chrome` (393x851, Pixel 5)
- **Rate limiting** : le middleware bloque à 30 req/min par IP sur `/auth/*` (augmenté de 10 pour éviter les faux positifs en dev)
- **Compte test** : `test-auth@shopkin.test` / `TestPass123` (existant en base Appwrite)
- **Helpers** : `tests/utils.ts` exports `loginAsUser()`, `registerAdmin()`, `uniqueEmail()`, `uniqueUsername()`, `waitForToast()`, `fillInputByLabel()`, `selectOption()`
- **Timeouts** : 30s global, 15s pour les appels réseau
- **Traces** : capture automatique des traces au premier échec
- **Screenshots** : capture uniquement sur échec
- **Langue des tests** : tous les messages de test (describe, test) sont en français

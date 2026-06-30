# ðŸ“± ShopKin â€” Description exhaustive des fonctionnalitÃ©s

Ce document dÃ©crit l'intÃ©gralitÃ© de l'application ShopKin, une marketplace minimaliste pour Kinshasa. Il est destinÃ© Ã  toute personne souhaitant comprendre prÃ©cisÃ©ment ce que l'application fera, sans entrer dans le code.

---

## 1. Philosophie gÃ©nÃ©rale

- **Application web installable (PWA)** : on y accÃ¨de via un navigateur sur mobile ou ordinateur, mais elle peut Ãªtre ajoutÃ©e Ã  lâ€™Ã©cran dâ€™accueil dâ€™un tÃ©lÃ©phone et sâ€™ouvrir comme une app native.
- **Connexion sans mot de passe** : on se connecte uniquement avec son numÃ©ro de tÃ©lÃ©phone, via un code reÃ§u par SMS (ou WhatsApp).
- **Pas de messagerie interne** : toutes les discussions passent par WhatsApp, via des liens profonds prÃ©-remplis.
- **Pas de paiement intÃ©grÃ©** : les transactions se font en dehors de lâ€™application, avec Mobile Money ou en main propre. Lâ€™application ne gÃ¨re pas les fonds.
- **Respect de la vie privÃ©e** : les numÃ©ros de tÃ©lÃ©phone des vendeurs ne sont jamais affichÃ©s en clair.
- **OptimisÃ© pour les connexions lentes** : images compressÃ©es, chargement progressif, mode hors-ligne.

---

## 2. Modules fonctionnels (dÃ©coupage global)

| Module | Description                  | Statut                              |
| ------ | ---------------------------- | ----------------------------------- |
| M1     | Authentification & IdentitÃ© | âœ… TerminÃ©                        |
| M2     | Catalogue & Recherche        | ðŸ”¶ En cours (dynamique + dÃ©pÃ´t) |
| M3     | Communication & NÃ©gociation | âšª Non commencÃ©                   |
| M4     | Transaction & Logistique     | âšª Non commencÃ©                   |
| M5     | PWA & ExpÃ©rience hors-ligne | âšª Non commencÃ©                   |

### Progression M1

Toutes les sous-tÃ¢ches ci-dessous ont Ã©tÃ© implÃ©mentÃ©es et vÃ©rifiÃ©es (build âœ…, lint âœ…).

- [x] 1. +243 prÃ©-rempli et non modifiable
- [x] 2. Validation longueur numÃ©ro (>=9 chiffres) + message d'erreur
- [x] 3. Indicateur de chargement (spinner) sur les boutons
- [x] 4. Bouton Â« Renvoyer OTP Â» avec dÃ©lai de 30 secondes
- [x] 5. Animation secousse si OTP incorrect
- [x] 6. Compteur de tentatives OTP (3 Ã©checs â†’ invalidation)
- [x] 7. Squelettes de chargement (loading.tsx)
- [x] 8. Avatar avec initiales sur la page profil
- [x] 9. Ã‰dition inline du nom (icÃ´ne crayon)
- [x] 10. Validation cohÃ©rence wallet (checkbox + numÃ©ro)
- [x] 11. Toast notifications temporisÃ©s (succÃ¨s/erreur)
- [x] 12. Bouton dÃ©connexion en bas de la page profil
- [x] 13. API endpoint `/api/auth/check-phone` (vÃ©rifie si un numÃ©ro a dÃ©jÃ  un compte)
- [x] 14. DÃ©tection automatique inscription vs connexion sur `/auth/phone`
- [x] 15. Message "Bienvenue {nom}" pour les utilisateurs existants
- [x] 16. Message "CrÃ©ation de compte" pour les nouveaux utilisateurs
- [x] 17. Utilisation du userId existant pour la connexion (Ã©vite les profils orphelins)
- [x] 18. Page `/auth/login` dÃ©diÃ©e Ã  la connexion des utilisateurs existants
- [x] 19. Page `/auth/register` dÃ©diÃ©e Ã  l'inscription avec formulaire de profil (nom + commune)
- [x] 20. Composant partagÃ© `AuthOtpStep` pour la vÃ©rification OTP
- [x] 21. Boutons "CrÃ©er un compte" et "Se connecter" sur la page d'accueil
- [x] 22. Redirection intelligente inscription â†” connexion (numÃ©ro dÃ©jÃ  utilisÃ© â†’ login, inconnu â†’ register)
- [x] 23. Redirection `/auth/phone` â†’ `/auth/login` (rÃ©trocompatibilitÃ©)
- [x] 24. Redirection proxy et `useAuth` â†’ `/auth/login` au lieu de `/auth/phone`
- [x] 25. Nouveaux attributs `prenom`, `nom`, `sexe`, `date_naissance` dans collection `profiles`
- [x] 26. Formulaire d'inscription complet : prÃ©nom, nom, sexe (radio), date naissance, commune, CGV checkbox â€” tout visible sur la mÃªme page
- [x] 27. Validation de tous les champs avant envoi OTP
- [x] 28. Sauvegarde des donnÃ©es profil aprÃ¨s OTP (full_name = prenom + nom)
- [x] 29. Bouton Â« CrÃ©er un compte Â» en accent (jaune), Â« Se connecter Â» en primary (bleu) sur la page d'accueil
- [x] 30. Attribut `has_password` (boolean) dans collection `profiles`
- [x] 31. Endpoint serveur `POST /api/auth/set-password` : dÃ©finit email synthÃ©tique + mot de passe via REST API admin
- [x] 32. Ã‰tape 3 d'inscription : crÃ©ation du mot de passe avec force indicator + double saisie
- [x] 33. Page connexion avec deux onglets : Â« TÃ©lÃ©phone (SMS) Â» et Â« Mot de passe Â»
- [x] 34. Connexion par mot de passe : utilise `account.createEmailPasswordSession` avec email synthÃ©tique
- [x] 35. `check-phone` retourne `hasPassword` pour informer le client

### Progression M2 (Catalogue dynamique + DÃ©pÃ´t)

- [x] 1. Logo "ShopKin" SVG inline (S bleu, K jaune)
- [x] 2. Header fixe avec toggle devise USD/CDF et icÃ´ne profil
- [x] 3. Barre de filtres : chips catÃ©gories (7 catÃ©gories), menus dÃ©roulants commune et super-repÃ¨re
- [x] 4. Grille responsive 1/2/3/4 colonnes de cartes produits
- [x] 5. Carte produit : image placeholder, badge livraison, titre, prix, localisation, vues
- [x] 6. Page dÃ©tail `/annonce/[id]` : image, titre, prix, description, localisation, statut, livraison, contacter WhatsApp
- [x] 7. Navigation mobile bottom (BottomNav) avec 3 icÃ´nes SVG
- [x] 8. Footer desktop avec copyright
- [x] 9. Script d'init DB (`app/api/init-db/`) qui crÃ©e database, collections (profiles, annonces, parametres), attributs et bucket storage via REST API
- [x] 10. RemplacÃ© `lib/sample-data.ts` par des donnÃ©es Appwrite rÃ©elles (`databases.listDocuments`)
- [x] 11. Pagination infinie via IntersectionObserver (10 par 10, `Query.limit/offset`)
- [x] 12. Filtres fonctionnels (catÃ©gorie, commune, super-repÃ¨re) avec `Query.equal`
- [x] 13. Taux de change depuis collection `parametres` (document `global`), contexte React `AppwriteProvider`
- [x] 14. Page dÃ©tail dynamique : `getDocument` + incrÃ©mentation des vues via API route (`/api/increment-view`)
- [x] 15. Page `/deposer` : formulaire complet avec upload images Appwrite Storage, validation, publication
- [x] 16. Profil vendeur (mode Ventes) : liste des annonces, changement de statut, suppression
- [x] 17. Proxy protÃ¨ge `/deposer` en plus de `/profil`
- [x] 18. `AppwriteProvider` (React context) pour le taux de change partagÃ©

Chaque module est dÃ©taillÃ© ci-dessous avec lâ€™ensemble des Ã©crans, interactions et rÃ¨gles mÃ©tier.

---

## 3. M1 â€“ Authentification & IdentitÃ©

### 3.1. Inscription & Connexion

Deux pages distinctes (`/auth/login`, `/auth/register`) partagent un composant OTP commun (`AuthOtpStep`). Une banniÃ¨re avec deux boutons (Â« CrÃ©er un compte Â», Â« Se connecter Â») est affichÃ©e sur la page d'accueil quand l'utilisateur n'est pas connectÃ©.
La page `/auth/phone` redirige vers `/auth/login` pour rÃ©trocompatibilitÃ©.

#### 3.1.1. Page d'accueil â€” banniÃ¨re d'authentification

- Visible uniquement pour les visiteurs non connectÃ©s (dÃ©tectÃ© via `useAuth()`).
- PlacÃ©e entre la barre de filtres et les annonces.
- Contenu :
  - Titre : Â« Achetez et vendez Ã  Kinshasa Â»
  - Sous-titre : Â« Rejoignez la marketplace de confiance des Kinois. Â»
  - Bouton Â« CrÃ©er un compte Â» (fond accent/jaune, texte primary) â†’ `/auth/register`
  - Bouton Â« Se connecter Â» (fond primary/bleu, texte blanc) â†’ `/auth/login`
- DisparaÃ®t automatiquement aprÃ¨s connexion.

#### 3.1.2. Page de connexion (`/auth/login`)

- **Deux onglets** avec switch visuel : Â« TÃ©lÃ©phone (SMS) Â» et Â« Mot de passe Â».
- **Onglet TÃ©lÃ©phone** : flow OTP inchangÃ©.
  - Champ +243, validation 9 chiffres, bouton Â« Recevoir un code OTP Â».
  - `POST /api/auth/check-phone` â†’ si inconnu, redirige vers register.
  - OTP via `createPhoneToken` â†’ composant `AuthOtpStep` â†’ session â†’ `/profil`.
- **Onglet Mot de passe** : connexion par identifiant (tÃ©lÃ©phone) + mot de passe.
  - Champ tÃ©lÃ©phone (+243) + champ mot de passe.
  - Bouton Â« Se connecter Â» â†’ construit l'email synthÃ©tique (`243XXXXXXXXX@shopkin.app`) â†’ `account.createEmailPasswordSession({ email, password })`.
  - En cas d'Ã©chec : message Â« NumÃ©ro ou mot de passe incorrect. Â»
- **Lien** Â« Pas encore de compte ? CrÃ©ez-en un. Â» sous les deux onglets.

#### 3.1.3. Page d'inscription (`/auth/register`)

- **Trois Ã©tapes** : formulaire â†’ OTP â†’ mot de passe â†’ sauvegarde finale.
- **Ã‰tape 1 â€” Formulaire complet** :
  - **TÃ©lÃ©phone** : indicatif `+243` fixe, champ numÃ©rique uniquement.
  - **PrÃ©nom \*** : texte, 100 max.
  - **Nom \*** : texte, 100 max.
  - **Sexe \*** : 3 boutons radio stylisÃ©s (Homme / Femme / Autre).
  - **Date de naissance** : champ date (optionnel, max = aujourd'hui).
  - **Commune de rÃ©sidence \*** : menu dÃ©roulant (22 communes de Kinshasa).
  - **CGV \*** : checkbox Â« J'accepte les conditions d'utilisation Â» avec lien vers `/cgu`.
- **Bouton Â« CrÃ©er mon compte Â»** (accent jaune, large) :
  - Valide tous les champs.
  - `POST /api/auth/check-phone` â†’ si existe â†’ redirige login ; si nouveau â†’ `createPhoneToken` â†’ OTP.
- **Ã‰tape 2 â€” OTP** : composant `AuthOtpStep` (titre Â« Inscription Â», mÃªmes rÃ¨gles).
- **Ã‰tape 3 â€” Mot de passe** (nouveau) :
  - Titre : Â« SÃ©curisez votre compte Â», message : crÃ©ez un mot de passe.
  - Deux champs : Â« Mot de passe Â» et Â« Confirmer le mot de passe Â».
  - Indicateur de force visuel (barre colorÃ©e + label Faible/Moyen/Fort/TrÃ¨s fort).
  - Liste des critÃ¨res avec feedback visuel (vert si satisfait) : â‰¥ 8 caractÃ¨res, une majuscule, une minuscule, un chiffre.
  - Validation : 8 caractÃ¨res minimum, confirmation identique.
  - Au submit : sauvegarde profil (`updateDocument` avec prÃ©nom, nom, sexe, date_naissance, commune) â†’ `POST /api/auth/set-password` qui dÃ©finit l'email synthÃ©tique (`243XXXXXXXXX@shopkin.app`) et le mot de passe via REST API Appwrite (admin) â†’ redirige vers `/profil`.

#### 3.1.4. Composant partagÃ© `AuthOtpStep`

- `components/auth/AuthOtpStep.tsx`
- Props : `phoneFull`, `userId`, `isRegistration`, `onSuccess`, `onBack`, `existingName?`.
- GÃ¨re : saisie OTP, `createSession`, `ensureProfile`, renvoi avec cooldown, compteur 3 tentatives, animation shake, messages d'erreur.
- UtilisÃ© par les deux pages (`/auth/login` et `/auth/register`).

#### 3.1.5. Gestion des sessions

- AprÃ¨s une connexion rÃ©ussie, lâ€™utilisateur reste connectÃ© pendant 7 jours (session persistante via cookie sÃ©curisÃ©).
- Sâ€™il revient sur lâ€™application aprÃ¨s la fermeture du navigateur, il est automatiquement connectÃ© (pas de nouvelle saisie OTP) tant que la session est valide.
- Bouton "Se dÃ©connecter" dans le profil (cf. 3.3).
- **userId persistant** : contrairement Ã  `ID.unique()` qui crÃ©erait un nouvel utilisateur Appwrite Ã  chaque connexion, le systÃ¨me dÃ©tecte les comptes existants via `POST /api/auth/check-phone` et rÃ©utilise le mÃªme `userId`. Cela garantit que le profil, les annonces et lâ€™historique restent rattachÃ©s Ã  la mÃªme personne.

### 3.2. CrÃ©ation du profil (inscription)

- Lors de la premiÃ¨re connexion (inscription), un document `profiles` est crÃ©Ã© automatiquement via `ensureProfile()` :
  - L'ID du document est le `userId` Appwrite (garantit la liaison entre le compte et le profil).
  - `full_name` : "Nouvel utilisateur" (l'utilisateur peut le modifier ensuite sur `/profil`).
  - `whatsapp_number` : le numÃ©ro utilisÃ© pour la connexion (unique).
  - `commune_defaut` : vide.
  - `m_pesa_registered`, `airtel_money_registered`, `orange_money_registered` : `false`.
- Cette crÃ©ation est instantanÃ©e et invisible pour l'utilisateur.
- **Cas utilisateur existant** : `ensureProfile()` dÃ©tecte que le document existe dÃ©jÃ  (via l'ID du document) et le retourne sans le modifier. Toutes les donnÃ©es (nom, commune, wallet) sont conservÃ©es.

### 3.3. Page Profil (`/profil`)

Cette page est accessible uniquement aprÃ¨s connexion (sinon redirection vers `/auth/phone`).

#### 3.3.1. Affichage du nom

- Le nom complet (issu de `full_name`) est affichÃ© en haut, avec un avatar par dÃ©faut (initiales dans un cercle) ou une photo si `avatar_url` est renseignÃ©.

#### 3.3.2. Switch "Achats / Ventes"

- Un interrupteur Ã  deux positions, situÃ© juste sous le nom.
- Par dÃ©faut, la position est "Achats".
- En mode **Achats** (actuellement), la zone en dessous est vide (elle sera remplie plus tard avec la liste des annonces favorites et des contacts rÃ©cents, cf. modules suivants). Un message Â« Vous nâ€™avez pas encore dâ€™activitÃ©. Â» peut sâ€™afficher.
- En mode **Ventes** :
  - Un compteur du nombre dâ€™annonces actives postÃ©es par lâ€™utilisateur sâ€™affiche (0 pour lâ€™instant, ou rÃ©cupÃ©rÃ© plus tard).
  - Un bouton "GÃ©rer mes annonces" (qui renverra vers la liste des annonces de lâ€™utilisateur, fonctionnalitÃ© Ã  venir).
  - Un bouton "Configurer mon wallet" qui mÃ¨ne Ã  la page `/profil/wallet`.

#### 3.3.3. Bouton "Se dÃ©connecter"

- PlacÃ© en bas de page. Au clic, la session est supprimÃ©e et lâ€™utilisateur est redirigÃ© vers la page dâ€™accueil.

#### 3.3.4. Ã‰dition du nom

- Ã€ cÃ´tÃ© du nom, une icÃ´ne crayon permet de le modifier. Un champ inline apparaÃ®t pour saisir le nouveau nom (limitÃ© Ã  100 caractÃ¨res). Validation par la touche EntrÃ©e ou en cliquant en dehors. Le document Appwrite est mis Ã  jour.

### 3.4. Configuration du Wallet (`/profil/wallet`)

#### 3.4.1. Formulaire

- **Nom rÃ©el** : champ texte obligatoire, prÃ©-rempli avec `full_name` actuel. Il s'agit du nom qui apparaÃ®tra sur les instructions de paiement.
- **NumÃ©ros Mobile Money** :
  - M-Pesa : champ texte (optionnel)
  - Airtel Money : champ texte (optionnel)
  - Orange Money : champ texte (optionnel)
- **Cases Ã  cocher** : pour chaque opÃ©rateur, une case permet d'indiquer si le numÃ©ro est bien configurÃ© pour recevoir des paiements. Par dÃ©faut, elles sont dÃ©cochÃ©es. Si un numÃ©ro est renseignÃ©, la case correspondante peut Ãªtre cochÃ©e (pas obligatoire). La cohÃ©rence est vÃ©rifiÃ©e : on ne peut pas cocher "M-Pesa enregistrÃ©" si le champ M-Pesa est vide.
- **Bouton "Enregistrer"** :
  - Met Ã  jour le document `profiles` dans la base de donnÃ©es.
  - Affiche une notification de succÃ¨s (toast vert) : Â« Wallet mis Ã  jour. Â»
  - En cas d'erreur, toast rouge : Â« Erreur lors de l'enregistrement. Â»
- **Bouton "Retour"** : ramÃ¨ne Ã  `/profil`.

#### 3.4.2. Validation

- Le nom rÃ©el est obligatoire. Si vide au moment de l'enregistrement, un message d'erreur s'affiche sous le champ : Â« Le nom rÃ©el est obligatoire pour les transactions. Â»

---

## 4. M2 â€“ Catalogue & Recherche

### 4.1. Page dâ€™accueil / Catalogue (`/`)

Cette page est publique, accessible sans connexion.

#### 4.1.1. Structure

- **En-tÃªte** :
  - Logo "ShopKin" Ã  gauche.
  - Un toggle de devise (switch USD / CDF) Ã  droite, visible en permanence.
  - Une icÃ´ne de profil (bonhomme) menant Ã  `/profil` si connectÃ©, ou Ã  `/auth/phone` sinon.
- **Barre de filtres** (entonnoir) :
  - Trois niveaux successifs : **CatÃ©gorie**, **Commune**, **Superâ€‘repÃ¨re**.
  - Affichage sous forme de boutons de sÃ©lection rapide (chips) ou menus dÃ©roulants.
  - L'utilisateur doit obligatoirement choisir une catÃ©gorie, puis une commune, puis (optionnellement) un repÃ¨re.
  - Les repÃ¨res populaires sont suggÃ©rÃ©s, mais un champ libre permet de saisir nâ€™importe quel texte.

#### 4.1.2. Filtres (comportement dÃ©taillÃ©)

- **CatÃ©gories disponibles** (liste fixe) : TÃ©lÃ©phones, Ã‰lectromÃ©nager, Mode, VÃ©hicules, Maison, Enfants, Emploi & Services, Autres.
- **Communes** : liste des 24 communes de Kinshasa (Bandundu, Barumbu, Bumbu, Gombe, Kinshasa, Kintambo, Kisenso, Lemba, Limete, Lingwala, Makala, Maluku, Masina, Matete, Mont Ngafula, Ndjili, Ngaba, Ngaliema, Ngiri-Ngiri, Nsele, Selembao, etc.).
- **Superâ€‘repÃ¨re** :
  - Une liste de suggestions prÃ©dÃ©finies (ex : Rond-point Moulaert, MarchÃ© de la LibertÃ©, Station Engen, etc.) apparaÃ®t lorsqu'on tape les premiÃ¨res lettres.
  - L'utilisateur peut aussi entrer un texte libre (max 150 caractÃ¨res).
- **Application des filtres** : la sÃ©lection d'une catÃ©gorie recharge la liste des annonces correspondantes. Ensuite la commune, puis le repÃ¨re, filtrent davantage. Les filtres sont cumulatifs. Un bouton "RÃ©initialiser" permet de tout effacer.

#### 4.1.3. Grille dâ€™annonces

- Affichage sous forme de cartes empilÃ©es verticalement (1 colonne sur mobile, 2 colonnes sur Ã©cran large).
- **Chaque carte contient** :
  - Une image principale (si plusieurs, afficher la premiÃ¨re). Lâ€™image est au format paysage, recadrÃ©e, avec un effet de chargement "skeleton" (rectangle gris animÃ©) avant l'affichage.
  - Un badge "Livraison possible" si le vendeur a activÃ© l'option (cf. M4). Ce badge est une petite pastille jaune.
  - Le titre de lâ€™annonce (tronquÃ© Ã  60 caractÃ¨res, suivi de "...").
  - Le prix, dans la devise sÃ©lectionnÃ©e (USD ou CDF), avec un symbole : `$450` ou `1 260 000 FC`.
  - La commune et le superâ€‘repÃ¨re en dessous du prix, en police plus petite.
  - Le nombre de vues (petite icÃ´ne Å“il + chiffre).
- **Comportement** : cliquer sur une carte ouvre la page de dÃ©tail de lâ€™annonce (`/annonce/{id}`).

#### 4.1.4. Toggle de devise

- SituÃ© dans lâ€™en-tÃªte, sous forme dâ€™un switch avec les libellÃ©s "USD" / "CDF".
- Le taux de conversion est rÃ©cupÃ©rÃ© rÃ©guliÃ¨rement (1 USD = X CDF) depuis un paramÃ¨tre stockÃ© dans la base de donnÃ©es.
- Tous les prix affichÃ©s sont recalculÃ©s instantanÃ©ment cÃ´tÃ© client sans rechargement de page. Les valeurs sont arrondies Ã  l'unitÃ© ou au millier pour les francs.
- Si le taux nâ€™est pas disponible, les prix sâ€™affichent dans la devise dâ€™origine et un message Â« Taux non disponible Â» apparaÃ®t en gris.

#### 4.1.5. Pagination infinie

- Au scroll vers le bas, de nouvelles annonces sont chargÃ©es automatiquement (10 par 10). Un indicateur de chargement apparaÃ®t en bas.
- Si plus dâ€™annonces, afficher Â« â€” Vous avez tout vu ! â€” Â».

### 4.2. DÃ©tail dâ€™une annonce (`/annonce/{id}`)

#### 4.2.1. Contenu

- **Galerie dâ€™images** : carrousel swipeable (sur mobile) avec pagination par points. Les images sont en pleine largeur, ratio 4/3. Zoom possible en pinch-to-zoom.
- **Titre** (complet, jusquâ€™Ã  150 caractÃ¨res).
- **Prix** (en grand, avec devise) et indication de la devise dâ€™origine.
- **Description** complÃ¨te.
- **Localisation** : commune + superâ€‘repÃ¨re, avec une carte statique miniature (image gÃ©nÃ©rÃ©e) centrÃ©e sur le repÃ¨re si disponible, sinon simplement le texte.
- **Statut de disponibilitÃ©** : un badge vert "Disponible" (ou grisÃ© "RÃ©servÃ©", "Vendu").
- **Nombre de vues** incrÃ©mentÃ© automatiquement Ã  chaque visite de la page (sauf si le visiteur est le vendeur).

#### 4.2.2. Options de livraison affichÃ©es

- Si le vendeur propose la remise en main propre (toujours oui), un bloc Â« Remise en main propre Â» avec une icÃ´ne de poignÃ©e de main et un court message de sÃ©curitÃ©.
- Si le vendeur propose la livraison avec ses frais, un bloc Â« Livraison Â» indique le montant des frais (ex : Â« Livraison : 5000 FC Â») et lâ€™option dâ€™acompte de course si activÃ©e.
- Si lâ€™acompte est activÃ©, un petit texte explicatif : Â« Le vendeur demande un acompte de {frais} FC avant dâ€™expÃ©dier. Vous payerez l'objet Ã  la rÃ©ception. Â»

#### 4.2.3. Boutons dâ€™action

- **Bouton principal "Contacter sur WhatsApp"** (cf. M3).
- **Bouton secondaire "Signaler"** (non prioritaire, mais affichÃ© discrÃ¨tement) : ouvre un petit formulaire pour signaler lâ€™annonce. Pas de fonction immÃ©diate ; envoie un e-mail Ã  lâ€™administrateur ou enregistre un signalement. Hors scope MVP, mais le bouton peut Ãªtre prÃ©sent sans fonction.

### 4.3. DÃ©pÃ´t dâ€™une annonce (`/deposer`)

Accessible uniquement si connectÃ©.

#### 4.3.1. Formulaire

- **Titre** : champ texte obligatoire (max 150 caractÃ¨res).
- **CatÃ©gorie** : menu dÃ©roulant avec la liste prÃ©dÃ©finie.
- **Description** : zone de texte libre (obligatoire, max 10 000 caractÃ¨res).
- **Prix** : champ numÃ©rique obligatoire, positif.
- **Devise** : sÃ©lection USD ou CDF (par dÃ©faut USD).
- **Commune** : menu dÃ©roulant avec les 24 communes.
- **Superâ€‘repÃ¨re** : champ texte (max 150 caractÃ¨res), avec suggestions automatiques depuis une liste prÃ©Ã©tablie (mÃªme liste que pour les filtres).
- **Images** : jusquâ€™Ã  5 photos. Chaque photo est redimensionnÃ©e cÃ´tÃ© client (max 1080px de large) avant envoi, puis uploadÃ©e vers le stockage. Une prÃ©visualisation sâ€™affiche. On peut supprimer et rÃ©organiser les images (drag and drop basique).
- **Options de livraison** :
  - "Remise en main propre" (cochÃ© par dÃ©faut, non modifiable).
  - "J'accepte de livrer" : case Ã  cocher. Si cochÃ©e, un champ "Frais de livraison" apparaÃ®t (montant numÃ©rique, positif ou zÃ©ro).
  - Sous-option (si livraison activÃ©e) : "Exiger un acompte pour les frais de livraison" (case Ã  cocher). Un texte explicatif sâ€™affiche : Â« Lâ€™acheteur paiera ces frais avant lâ€™envoi. Â»
- **Bouton "Publier"** :
  - VÃ©rifie les champs obligatoires. Affiche des messages dâ€™erreur sous les champs invalides.
  - CrÃ©e un document dans la collection `annonces` avec `status` = `disponible`.
  - Redirige vers la page de lâ€™annonce nouvellement crÃ©Ã©e.
- **Bouton "Enregistrer en brouillon"** (option futur, pas MVP) : non prÃ©sent dans lâ€™immÃ©diat.

#### 4.3.2. Gestion des images

- L'upload se fait immÃ©diatement au choix de lâ€™image (pas besoin dâ€™attendre la soumission finale). Les images sont stockÃ©es dans un bucket Appwrite Storage.
- Chaque image uploadÃ©e reÃ§oit un identifiant qui est ajoutÃ© Ã  un tableau `images_storage_paths`. Les images sont compressÃ©es automatiquement par une fonction cÃ´tÃ© serveur pour Ã©conomiser la bande passante.
- Si l'utilisateur quitte la page sans publier, les images uploadÃ©es restent dans le bucket mais ne seront pas liÃ©es Ã  une annonce (elles pourront Ãªtre nettoyÃ©es pÃ©riodiquement).

### 4.4. Gestion des annonces par le vendeur

- Depuis lâ€™interface "Mes Ventes" (plus tard), le vendeur voit la liste de ses annonces.
- Pour chaque annonce, il peut :
  - Modifier lâ€™annonce (rÃ©utilise le formulaire de dÃ©pÃ´t avec les champs prÃ©-remplis).
  - Changer le statut manuellement : "Disponible", "RÃ©servÃ©", "Vendu".
  - Supprimer lâ€™annonce (avec confirmation).
- Lors du changement de statut Ã  "Vendu", lâ€™annonce nâ€™apparaÃ®t plus dans les rÃ©sultats de recherche (permission de lecture retirÃ©e).

---

## 5. M3 â€“ Communication & NÃ©gociation

### 5.1. Bouton "Contacter sur WhatsApp"

- PrÃ©sent sur la page de dÃ©tail de chaque annonce disponible.
- Au clic, lâ€™application construit un lien profond WhatsApp : `https://wa.me/XXXXXXXXXX?text=...`
  - Le numÃ©ro de tÃ©lÃ©phone est rÃ©cupÃ©rÃ© depuis le document `profiles` du vendeur, mais **ne sâ€™affiche jamais dans le DOM** (il est injectÃ© dynamiquement lors du clic).
  - Le texte prÃ©-rempli est :  
    `"Salut ! Je tâ€™Ã©cris depuis ShopKin pour ton annonce **[Titre de l'annonce]** Ã  **[Prix]**. Tu es dispo pour une remise en main propre Ã  **[Superâ€‘repÃ¨re]** ?"`
- Ce lien ouvre WhatsApp (application native ou web) avec la conversation prÃªte.
- Si l'utilisateur n'a pas WhatsApp installÃ©, le lien s'ouvre dans le navigateur (version web). En cas d'Ã©chec complet, on peut afficher une alerte avec le numÃ©ro Ã  recopier, mais cela doit rester exceptionnel.

### 5.2. Compteur de contacts

- Ã€ chaque clic sur le bouton "Contacter", un compteur anonymisÃ© est incrÃ©mentÃ© dans lâ€™annonce (`contacts_count` ou simplement `views_count`). Cela permet au vendeur de savoir combien de personnes ont ouvert la conversation. (Optionnellement, on peut diffÃ©rencier les vues des contacts, mais pour le MVP on garde simple.)
- Aucune information sur lâ€™acheteur nâ€™est conservÃ©e (pas de numÃ©ro).

### 5.3. Protection de la vie privÃ©e

- Le numÃ©ro du vendeur ne transite jamais en clair dans le code source de la page. Il est rÃ©cupÃ©rÃ© via une fonction sÃ©curisÃ©e au moment de la gÃ©nÃ©ration du lien, puis oubliÃ©.
- Aucun cookie ou localStorage ne stocke ce numÃ©ro.

---

## 6. M4 â€“ Transaction & Logistique

### 6.1. Options de livraison dÃ©finies par le vendeur

Chaque annonce a deux modes possibles, configurÃ©s lors du dÃ©pÃ´t :

1. **Remise en main propre** (toujours active)
2. **Livraison par le vendeur** (optionnelle)

#### 6.1.1. Remise en main propre

- Sur la page de lâ€™annonce, un bloc affiche un message de sÃ©curitÃ© :  
  _"Pour votre sÃ©curitÃ©, privilÃ©giez une rencontre dans un lieu public (supermarchÃ©, station-service, etc.)."_
- Pas dâ€™autre action requise.

#### 6.1.2. Livraison par le vendeur

- Si activÃ©e, le vendeur a fixÃ© un montant de frais de livraison (ex : 5000 FC).
- Sur la page de lâ€™annonce, ce montant est affichÃ© en plus du prix de lâ€™objet.
- Le vendeur peut en plus activer lâ€™**acompte de livraison**.

### 6.2. Widget "SÃ©curitÃ© Course" (Anti-Lapolo)

Disponible uniquement si lâ€™acompte est activÃ©.

#### 6.2.1. Comportement pour lâ€™acheteur

- Sur la page de lâ€™annonce, un bloc spÃ©cifique apparaÃ®t :  
  _"Ce vendeur demande un acompte correspondant aux frais de livraison avant expÃ©dition. Le solde se paie Ã  la rÃ©ception."_
- Un bouton "Payer les frais de livraison" est prÃ©sent.
- Au clic, lâ€™application affiche une modale contenant :
  - Le montant exact des frais.
  - Un QR Code gÃ©nÃ©rÃ© dynamiquement (basÃ© sur le format Mobile Money : lien `pay://` ou simple texte avec le numÃ©ro du vendeur et le montant). En pratique, le QR code encode un lien ou un texte que lâ€™application Mobile Money peut scanner.
  - Les instructions : "Ouvrez votre application Mobile Money, scannez ce QR code et validez le paiement."
  - Un bouton "Jâ€™ai payÃ©" (simple confirmation, sans effet rÃ©el) qui ferme la modale.
- L'application ne suit pas le statut du paiement. Elle rappelle simplement que le vendeur doit confirmer la rÃ©ception avant dâ€™expÃ©dier.

#### 6.2.2. GÃ©nÃ©ration du QR Code

- Le QR Code est gÃ©nÃ©rÃ© cÃ´tÃ© client en utilisant une bibliothÃ¨que JavaScript (ex : `qrcode.react`).
- Il encode une chaÃ®ne de type :  
  `"Envoyez [montant] CDF au numÃ©ro [numÃ©ro Mobile Money] pour les frais de livraison de l'annonce [titre]."`  
  ou un lien spÃ©cifique selon l'opÃ©rateur si disponible, sinon une simple phrase que lâ€™application de scan pourra interprÃ©ter. Ã€ dÃ©faut, lâ€™utilisateur peut recopier le numÃ©ro manuellement (affichÃ© discrÃ¨tement, avec option de copier).
- Le numÃ©ro utilisÃ© est celui configurÃ© dans le wallet du vendeur (premier numÃ©ro enregistrÃ©).

### 6.3. ModalitÃ© de paiement pour l'objet

- L'achat final se fait hors application. Lâ€™application ne propose pas de paiement intÃ©grÃ©.
- Des notes supplÃ©mentaires peuvent Ãªtre affichÃ©es dans la conversation WhatsApp prÃ©-remplie (ex : "Je te paie le solde Ã  la livraison").

### 6.4. Alerte de sÃ©curitÃ© contextuelle

- Ã€ chaque fois quâ€™une fonction de mise en relation ou de paiement est utilisÃ©e, une petite phrase de prudence est visible :  
  _"Ne payez jamais la totalitÃ© avant dâ€™avoir vu lâ€™objet. ShopKin ne garantit pas les transactions."_

---

## 7. M5 â€“ PWA & ExpÃ©rience hors-ligne

### 7.1. Installation de lâ€™application

- Lâ€™application est une PWA (Progressive Web App). Elle peut Ãªtre installÃ©e sur lâ€™Ã©cran dâ€™accueil du tÃ©lÃ©phone.
- Un fichier `manifest.json` dÃ©finit le nom, les icÃ´nes, les couleurs et le mode dâ€™affichage (`standalone`, sans barre dâ€™URL).
- Lors de la premiÃ¨re visite (ou aprÃ¨s un certain temps), une banniÃ¨re native du navigateur ou un petit popup personnalisÃ© invite lâ€™utilisateur Ã  "Ajouter ShopKin Ã  lâ€™Ã©cran dâ€™accueil".
- Une fois installÃ©e, lâ€™application se lance en plein Ã©cran et apparaÃ®t comme une application native dans la liste des applications.

### 7.2. IcÃ´nes et splash screen

- IcÃ´ne de lâ€™application : logo ShopKin sur fond Bleu Fleuve.
- Splash screen lors du lancement : fond `#F8F9FA` avec le logo centrÃ©.

### 7.3. Fonctionnement hors-ligne

- Un Service Worker est enregistrÃ©.
- **Pages dâ€™annonces** : lorsquâ€™une annonce est consultÃ©e en ligne, ses donnÃ©es (texte, images) sont mises en cache. Si lâ€™utilisateur perd la connexion, il peut rouvrir la mÃªme annonce depuis lâ€™historique, ou depuis la liste des favoris, et les informations sâ€™affichent normalement (images comprises).
- **Page dâ€™accueil** : le dernier Ã©tat du catalogue (les 20-30 premiÃ¨res annonces) est mis en cache. En mode hors-ligne, lâ€™utilisateur voit ces annonces avec un indicateur "Hors-ligne" en haut.
- **Recherche et filtres** : ne fonctionnent pas sans connexion. Un message "Vous Ãªtes hors-ligne. Certaines fonctionnalitÃ©s sont limitÃ©es." sâ€™affiche si on tente de filtrer.
- **DÃ©pÃ´t dâ€™annonce** : impossible hors-ligne ; un message prÃ©vient lâ€™utilisateur.

### 7.4. StratÃ©gie de cache

- **Cache First** pour les images et les assets statiques (CSS, fonts). Les fichiers sont servis depuis le cache si disponibles, ce qui accÃ©lÃ¨re Ã©normÃ©ment le chargement.
- **Network First** pour les donnÃ©es dynamiques (liste dâ€™annonces, dÃ©tail) : lâ€™application tente dâ€™abord de rÃ©cupÃ©rer les donnÃ©es du rÃ©seau. En cas dâ€™Ã©chec, elle affiche les donnÃ©es en cache.

### 7.5. Mises Ã  jour automatiques

- Lorsquâ€™une nouvelle version de lâ€™application est dÃ©ployÃ©e, le Service Worker dÃ©tecte le changement et invite lâ€™utilisateur Ã  rafraÃ®chir la page pour obtenir la derniÃ¨re version.

---

## 8. Ã‰lÃ©ments transversaux

### 8.1. Design System

- **Couleurs** :
  - Primary (Bleu Fleuve) : `#0B192C` â€“ titres, boutons principaux, header.
  - Accent (Jaune Zando) : `#FFD700` â€“ prix, badges, boutons dâ€™action, Ã©tats actifs.
  - Background : `#F8F9FA` â€“ fond.
  - Success : `#10B981` â€“ confirmations, statuts disponibles.
  - Danger : `#EF4444` â€“ erreurs, alertes.
  - Texte : `#4B5563` â€“ corps.
  - Border : `#E5E7EB` â€“ sÃ©parations.

- **Typographie** :
  - Titres : "Plus Jakarta Sans" (Bold 700 pour h1, SemiBold 600 pour h2, h3).
  - Corps : "Inter" (Regular 400, Medium 500 pour emphases).

- **Coins arrondis** :
  - Cartes : 16px.
  - Boutons : 12px.
  - Inputs : 12px.
  - Badges : pilule (border-radius 9999px).

- **Ombres** : lÃ©gÃ¨res (0 2px 8px rgba(0,0,0,0.05)) sur les cartes pour donner de la profondeur.

- **Espacements** : multiples de 8px (8, 16, 24, 32).

### 8.2. Feedback et micro-interactions

- **Squelettes de chargement** : animations de pouls grises pour les images et les textes avant affichage.
- **Vibration haptique** : lors du clic sur les boutons principaux (ex : "NÃ©gocier", "Publier"), une courte vibration (10ms) est dÃ©clenchÃ©e si le tÃ©lÃ©phone le permet.
- **Transitions** : durÃ©e de 200ms avec easing "ease-out" pour les changements dâ€™Ã©tat (hover, ouverture de modale).
- **Toast notifications** : pour les succÃ¨s (vert) et erreurs (rouge), apparaissent en bas de lâ€™Ã©cran et disparaissent aprÃ¨s 3 secondes.

### 8.3. Gestion des erreurs

- Toute erreur rÃ©seau ou serveur entraÃ®ne lâ€™affichage dâ€™un message gÃ©nÃ©rique : "Une erreur est survenue. Veuillez rÃ©essayer." avec un bouton "RÃ©essayer".
- Les formulaires affichent les erreurs de validation en rouge sous chaque champ.
- Les pages non trouvÃ©es (404) affichent une page dÃ©diÃ©e avec un lien de retour.

### 8.4. AccessibilitÃ©

- Les contrastes de couleurs respectent les normes WCAG AA.
- Tous les boutons et champs ont des libellÃ©s appropriÃ©s.
- Lâ€™application est navigable au clavier et avec les lecteurs dâ€™Ã©cran (balises ARIA de base).

### 8.5. SÃ©curitÃ©

- Toutes les communications avec Appwrite se font via HTTPS.
- Les clÃ©s dâ€™API ne sont jamais exposÃ©es cÃ´tÃ© client.
- Les permissions de base de donnÃ©es sont strictes : un utilisateur ne peut modifier que ses propres documents.
- Le numÃ©ro de tÃ©lÃ©phone du vendeur nâ€™est jamais transmis au client avant une action explicite de contact.

### 8.6. Performances

- Les images sont compressÃ©es et servies en WebP.
- Lazy loading des images et composants.
- Code splitting automatique par Next.js.
- Mise en cache agressive des assets statiques (immutable cache).

---

## 9. DÃ©coupage en pages (rÃ©sumÃ©)

| Route                   | Page                  | Accessible sans connexion | RÃ´le                                                             | Statut |
| ----------------------- | --------------------- | ------------------------- | ----------------------------------------------------------------- | ------ |
| `/`                     | Accueil / Catalogue   | Oui                       | Annonces dynamiques Appwrite, filtres, pagination infinie         | âœ…    |
| `/auth/phone`           | Connexion OTP         | Oui                       | Saisie numÃ©ro + vÃ©rification OTP                                | âœ…    |
| `/profil`               | Profil                | Non                       | Switch Achats/Ventes, Ã©dition nom, avatar, liste ventes + statut | âœ…    |
| `/profil/wallet`        | Configuration Wallet  | Non                       | Enregistrement numÃ©ros Mobile Money                              | âœ…    |
| `/annonce/[id]`         | DÃ©tail annonce       | Oui                       | DonnÃ©es dynamiques, incrÃ©mentation vues, WhatsApp               | âœ…    |
| `/deposer`              | DÃ©pÃ´t annonce       | Non                       | Formulaire complet avec upload images Storage                     | âœ…    |
| `/mes-annonces` (futur) | Liste de mes annonces | Non                       | Gestion des annonces (modification, suppression)                  | âŒ     |
| `/404`                  | Page introuvable      | Oui                       | Page 404 personnalisÃ©e avec bouton retour                        | âœ…    |

---

## 10. RÃ¨gles mÃ©tier importantes

- Un utilisateur ne peut pas contacter un vendeur sans cliquer sur le bouton WhatsApp (pas dâ€™affichage direct du numÃ©ro).
- Les annonces marquÃ©es "vendu" ou "rÃ©servÃ©" disparaissent des rÃ©sultats publics.
- Le taux de change USD/CDF est dÃ©fini manuellement pour lâ€™instant, avec mise Ã  jour rÃ©guliÃ¨re prÃ©vue.
- Un vendeur peut avoir plusieurs annonces, mais chaque annonce est liÃ©e Ã  un seul vendeur.
- Les images dâ€™annonces sont stockÃ©es de maniÃ¨re sÃ©curisÃ©e ; elles ne sont pas accessibles sans lâ€™ID du fichier.
- Lâ€™application ne conserve pas de fil de discussion.

---

Ce document couvre l'ensemble des fonctionnalitÃ©s de ShopKin, dans leurs moindres dÃ©tails. Chaque point sera implÃ©mentÃ© selon ces spÃ©cifications. Si une fonctionnalitÃ© mÃ©rite dâ€™Ãªtre approfondie, une demande spÃ©cifique peut Ãªtre faite.

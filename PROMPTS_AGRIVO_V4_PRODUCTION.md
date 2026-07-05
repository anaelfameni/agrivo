# PROMPTS AGRIVO V4 — De la démo Vibeathon au SaaS crédible

> Playbook de prompts **ultra-optimisés**, à lancer **un par un** dans Claude Code, depuis le dossier
> `C:\Users\Anael FAMENI\.claude\projects\Agrivo` (pour l'auto-chargement de `CLAUDE.md`).
> Compagnon : **`AGRIVO_V4_PLAN_ET_MANUEL.md`** (décisions, 7 denrées, direction artistique, manuel).
>
> **Règle d'or** : après chaque prompt, vérifie le **GATE** (build vert + captures 1440/390 sans
> débordement + aucun terme interdit) **avant** de lancer le suivant.
> **Ordre** : P1 → P2 → **P3 (accueil ⭐)** → P4 → P5 → P6 → P7. *(P3 ne dépend que de P1.)*

---

## SOCLE COMMUN (déjà rappelé dans chaque prompt — pour info)

- **Préambule obligatoire** : relire `CLAUDE.md` en entier ; il prime en cas de doute.
- **Skills à activer AVANT d'écrire du code** : `ui-ux-pro-max` (chaque écran) · `motion-framer` (chaque
  animation) · `taste-design` (raffinement visuel) · `react-components` (architecture). **Ne pas utiliser**
  `shadcn-ui` / `stitch-design` / `stitch-loop` / `remotion` (projet = composants **custom framer-motion,
  sans Radix**).
- **Gouvernance de contenu** (bannie à vie) : « garantie », « valeur à risque », « seul acteur », tout %
  de précision inventé, jargon startup, « gratuit » présenté comme un plan, « partenaire Lono ». **Statuts
  figés** : *Conforme* / *Anomalie détectée* / *Données insuffisantes*. **Aucun logo** de partenaire
  fabriqué. **Pas de tiret cadratin** visible dans l'UI. **Images art-dirigées** uniquement (jamais de
  photo de personne).
- **GATE de sortie** : `npx tsc --noEmit` ✓ · `npx next build` ✓ · captures **CDP desktop 1440 + mobile
  390** (méthode CDP/Edge décrite dans `CLAUDE.md`, vérifier `scrollWidth == innerWidth`, 0 débordement) ·
  `grep -ri` des termes interdits = néant.
- **Auto-mise à jour** : compléter le **Journal de build** de `CLAUDE.md` + finir la réponse par
  « ✅ CLAUDE.md mis à jour — <ce qui a changé> ».

---

## ▼ PROMPT P1 — Audit + fondation « 7 denrées RDUE » + purge du langage démo

Relis `CLAUDE.md` en entier avant d'agir (il prime sur tes souvenirs). Active et suis les skills
`ui-ux-pro-max` et `react-components` avant d'écrire du code. Respecte toute la gouvernance de contenu du
projet (statuts figés, mots bannis, pas de tiret cadratin, aucun logo fabriqué).

Contexte : AGRIVO doit devenir un **vrai SaaS crédible** (fini l'impression de démo). Cette étape 1 pose
les fondations et nettoie, **sans refonte visuelle** (elle vient en P3). Ne casse rien d'existant.

Fais, dans l'ordre :

1. **Audit complet → écris `AUDIT.md`** à la racine. Recense avec chemin + n° de ligne :
   - les **liens morts / faux boutons** (tu sais déjà que les 2 CTA du hero pointent vers `#produit`, une
     ancre inexistante — confirme et liste tout autre) ;
   - tout **texte orienté démo/interne** affiché dans l'UI (ex. `app/page.tsx` : « Chiffres à revérifier
     avant le pitch », « Ouvrez la démonstration… », footer « version de démonstration … Vibeathon » ;
     `components/landing/hero.tsx` : « Voir la démo ») ;
   - les **pages manquantes** pour un vrai SaaS (`/connexion`, `/inscription`, `/contact`,
     `/confidentialite`, `/cgu`, `/mentions-legales`, `/aide`) ;
   - l'**inventaire des données mockées** et des **composants inutilisés** éventuels.
   Classe chaque item : *à corriger en P1* / *traité plus tard (P2–P7)*. Ne casse pas le `MOCK_MODE`
   backend (légitime), ne touche qu'au **langage** visible.

2. **Recherche en ligne** (WebSearch/WebFetch) la liste officielle des **7 matières premières du RDUE**
   (Règlement UE 2023/1115, Annexe I) et de ses **produits dérivés**. Confirme : bovins, cacao, café,
   palmier à huile, hévéa/caoutchouc, soja, bois. Note les dérivés (chocolat, cuir, meubles, papier &
   imprimés, pneus, huile de palme dérivée, charbon…) pour usage en P3/P4. *(Si la recherche échoue —
   limite de session — utilise le tableau de `AGRIVO_V4_PLAN_ET_MANUEL.md` et signale-le.)*

3. **Crée `config/filieres.ts`** = **source de vérité unique** des 7 denrées. Exporte :
   - un type `FiliereId = "cacao" | "cafe" | "hevea" | "palmier" | "bovins" | "soja" | "bois"` ;
   - un tableau `FILIERES` d'objets `{ id, label, eudr, statut: "production" | "couverte", couleur, icone
     (nom lucide-react), image: "/filieres/<id>.jpg", position (accroche courte) }` conforme au tableau
     de `AGRIVO_V4_PLAN_ET_MANUEL.md` §2 ;
   - un helper `getFiliere(id)`. Aucune valeur non-composant exportée depuis un fichier `"use client"`
     (respecte la frontière RSC décrite dans `CLAUDE.md`) — ce fichier est un **module pur** (pas de
     `"use client"`).

4. **Étends le modèle de données** : ouvre `data/mock-parcelles.ts`, repère le type/union `filiere`
   (aujourd'hui 4 valeurs) et **aligne-le sur `FiliereId`** (7 valeurs). **Ne casse pas** les 45 parcelles
   existantes ni le générateur déterministe (les 3 nouvelles denrées peuvent rester sans parcelle pour
   l'instant, ou tu ajoutes 2-3 lignes déterministes cohérentes bovins/soja/bois — au choix, sans
   modifier les ids/certificats existants p01–p14).

5. **Corrige l'ancre morte** : ajoute `id="produit"` à une section cible réelle de `app/page.tsx` (ex.
   `GoldenPathSection`) pour que « Commencer la vérification » ne soit plus un lien mort. *(Le
   remplacement complet des CTA démo se fait en P2.)*

6. **Purge du langage démo côté UI** (garde l'honnêteté, retire le « projet d'école ») :
   - `app/page.tsx` `ChiffresSection` : remplace « Source : Conseil Café-Cacao. Chiffres à revérifier
     avant le pitch. » par « Source : Conseil Café-Cacao. » ;
   - `CtaFooter` : réécris le paragraphe « Ouvrez la démonstration… » en promesse produit réelle (sans le
     mot « démonstration ») ; footer : « Agrivo © 2026. Tous droits réservés. » (retire « version de
     démonstration … Vibeathon »). *(Les vrais liens légaux du footer viennent en P5.)*

**GATE** : `npx tsc --noEmit` ✓ · `npx next build` ✓ · captures CDP 1440 + 390 (0 débordement) · `grep -ri`
« valeur à risque | garantie | version de démonstration | avant le pitch | tiret cadratin » = néant.
Puis mets à jour le **Journal de build** de `CLAUDE.md` (nouvelle règle : **multi-filières 4 → 7 denrées
RDUE**, source `config/filieres.ts`) et termine par « ✅ CLAUDE.md mis à jour — … ».

---

## ▼ PROMPT P2 — Authentification réelle + parcours client + CTA réels

Relis `CLAUDE.md` en entier avant d'agir. Active et suis `ui-ux-pro-max`, `motion-framer`,
`react-components`. Respecte la gouvernance (statuts figés, mots bannis, pas de tiret cadratin). Ne casse
pas le HERO ni le splash.

Objectif : donner l'expérience d'un **vrai SaaS** — pages connexion/inscription, session, routes
protégées, déconnexion — tout en gardant une **entrée démo en 1 clic** pour le jury. Données en
localStorage (pas de backend cette étape), mais l'expérience doit être identique à un vrai produit.

Fais :

1. **`components/auth-provider.tsx`** (client, contexte React) : état `{ user: { email, nom, organisation }
   | null, loading }`, méthodes `login(email, password)`, `signup(data)`, `logout()`, `isAuthenticated`.
   Persistance **localStorage** (clé `agrivo:session`), hydratation SSR-safe (pas de flash). Constante du
   **compte de démonstration** : `client@test.com` / `123client123` (organisation « Coopérative Agricole
   de Soubré »). Enveloppe l'app dans `app/layout.tsx` (à côté de `LanguageProvider`).

2. **Pages `/connexion` et `/inscription`** (`app/connexion/page.tsx`, `app/inscription/page.tsx`) au
   niveau de qualité Stripe/Linear : `SiteHeader` variant `solid`, carte centrée sur fond de marque,
   champs labellisés, **validation** (email valide, mot de passe ≥ 8, champs requis), **états d'erreur**
   inline + **feedback** de chargement, animations d'entrée `motion-framer` sobres (respect
   `prefers-reduced-motion`). Sur `/connexion`, un **encart « Compte de démonstration »** avec un bouton
   proéminent **« Entrer avec le compte de démonstration »** qui pré-remplit et connecte en **1 clic**
   (identifiants aussi affichés en clair). Lien croisé connexion ↔ inscription.

3. **Protection des routes `/app/*`** : dans `app/app/layout.tsx`, ajoute une garde **côté client** (le
   localStorage n'est pas lisible en middleware) qui, si `!isAuthenticated`, redirige vers
   `/connexion?redirect=<route demandée>` (affiche un court écran de chargement le temps de l'hydratation
   pour éviter tout flash de contenu protégé). **Redirection intelligente** : après connexion, revenir sur
   la route demandée, sinon `/app/dashboard`.

4. **Déconnexion** : bouton dans la topbar `/app` (via `components/app/app-space-switch.tsx` ou la topbar
   du layout) → `logout()` → redirige vers `/`. Ajoute l'e-mail/organisation de l'utilisateur dans la
   topbar.

5. **`SiteHeader` conscient de la session** (`components/site-header.tsx`) : déconnecté → boutons
   « Connexion » + « Créer un compte » ; connecté → « Tableau de bord » + menu avatar (initiales,
   organisation, « Se déconnecter »).

6. **Remplace tous les CTA démo par un vrai parcours** :
   - `components/landing/hero.tsx` : le CTA secondaire **« Voir la démo »** devient **« Accéder au tableau
     de bord »** (→ `/app/dashboard`, protégé donc passe par connexion si besoin) ; le CTA primaire
     « Commencer la vérification » pointe vers `/app/verifier` (→ connexion si non connecté).
   - `app/page.tsx` `CtaFooter` : « Voir la démo en direct » → **« Créer un compte »** (→ `/inscription`) ;
     garde un lien secondaire « Comprendre la méthode » (`/methodologie`).

**GATE** : `tsc` ✓ · `build` ✓ · captures 1440 + 390 des pages `/connexion`, `/inscription`, et d'une
route `/app/*` **avant** (redirection) et **après** connexion (0 débordement). Vérifie le flux complet :
1 clic démo → `/app/dashboard` ; déconnexion → `/`. Puis Journal de build `CLAUDE.md` + « ✅ CLAUDE.md
mis à jour — … ».

---

## ▼ PROMPT P3 — ⭐ Refonte visuelle de la page d'accueil (7 denrées, images, motion premium)

Relis `CLAUDE.md` en entier avant d'agir. Active et suis **`ui-ux-pro-max` + `motion-framer` +
`taste-design`** — passe par leur raisonnement AVANT d'écrire chaque section. Respecte la gouvernance et la
direction artistique de `AGRIVO_V4_PLAN_ET_MANUEL.md` §3.

**NE TOUCHE PAS** (ordre d'Anael) : l'écran de bienvenue (`components/splash-screen.tsx`), la **structure
du HERO** et surtout l'**aperçu de dashboard flottant animé** (`HeroMockup` dans
`components/landing/hero.tsx` : float + parallax + tilt) — garde-les tels quels.

Objectif : que la page d'accueil (`app/page.tsx` + `components/landing/hero.tsx`) ressemble à un **produit
SaaS commercialisé haut de gamme**. Travaille section par section :

1. **Bloc « votre conformité RDUE » du hero** (`hero.tsx`, ~l.154-214) — *raffinement, pas refonte* :
   améliore la hiérarchie typographique et le spacing du couple titre/sous-titre, soigne la paire de CTA
   (déjà mis à jour en P2), et transforme la **ligne de confiance** (« Cacao · Café · Hévéa · Palmier · … »)
   en **chips élégantes** générées depuis `config/filieres.ts` (les 7 denrées, avec une pastille de couleur
   par denrée), suivies de « Aligné sur le SNT ivoirien » et « Whisp (FAO) + IA générative ». Garde le fond
   mesh/grille/grain et le verbe rotatif.

2. **Cohérence des tailles de cartes** (corrige « tableaux pas de la même taille ») : audite toutes les
   sections de `app/page.tsx` et **normalise** hauteurs (`h-full` + `flex-col` partout), rythme de grille,
   rayons (`rounded-2xl`) et paddings. En particulier, uniformise Problème / Deux IA / Personas / Modèle /
   Verdicts pour un rendu millimétré.

3. **`FilieresSection` : 4 → 7 denrées + images** (`app/page.tsx` ~l.236-273) :
   - alimente la section depuis `config/filieres.ts` (map sur `FILIERES`) ;
   - **refonds la grille** pour 7-8 tuiles homogènes : `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, avec
     une **8e tuile « Produits dérivés »** (chocolat, cuir, meubles, papier, pneus…) pour équilibrer la
     dernière ligne ; toutes les tuiles **même ratio** (`aspect-[4/5]`) ;
   - chaque tuile = **image art-dirigée** (`next/image`, `/filieres/<id>.jpg`) en couche, **au-dessus du
     dégradé radial actuel conservé en fallback** (si l'image manque, la tuile reste belle), overlay
     `forest-950/60` + grain pour la lisibilité, label + accroche + **badge statut** (« En production » /
     « Couverte ») ; garde l'effet `Tilt` ;
   - mets à jour le titre/chapô : « Un moteur multi-filières pour **les 7 matières premières du RDUE** ».

4. **Nouvelle section « Cartographie satellite »** (légère, insérée après `FilieresSection`) : un cadre
   produit montrant une **image satellite fixe** (`/textures/satellite-parcelles.jpg`) sur laquelle un
   **polygone de parcelle se dessine en SVG** (réutilise la logique `ParcelPolygon`/`stroke-dashoffset` du
   projet), avec badge *Conforme*, coordonnées GPS (`num`) et superficie. **Aucun Leaflet** ici (perf).
   Titre orienté preuve : « La preuve, pas la promesse : chaque parcelle vérifiée par satellite. »

5. **Animations & effets premium — TOUTES les sections SAUF le HERO** (via `motion-framer`,
   `prefers-reduced-motion` respecté) : parallaxe douce au scroll sur les fonds, **révélations d'images**
   au `whileInView`, chorégraphies staggerées plus riches (stagger 60-90 ms), micro-interactions au survol
   (lift + glow déjà amorcés), compteurs `StatNumber` conservés. **Fonds de section en imagerie traitée**
   là où c'est pertinent (ex. `TriptyqueSection` / `ChiffresSection` / `CtaFooter` : `/textures/
   aerial-canopy.jpg` en duotone forêt sous l'overlay sombre existant). Reste sobre : le budget créatif
   fort reste la séquence de vérification, pas l'accueil.

6. **Copywriting ciblé (accueil uniquement)** : améliore les titres/chapôs perfectibles (plus concrets,
   orientés bénéfice), **sans** toucher aux formulations figées (statuts, modèle éco), sans toucher au
   HERO ni au splash.

**GATE** : `tsc` ✓ · `build` ✓ · captures CDP **1440 ET 390** de toute la page (0 débordement,
`scrollWidth == innerWidth == 390`), les 7-8 tuiles denrées alignées, la section cartographie nette,
images en lazy hors hero. `grep` termes interdits = néant. Puis Journal de build `CLAUDE.md` (refonte
accueil V4, 7 denrées, section cartographie) + « ✅ CLAUDE.md mis à jour — … ».

---

## ▼ PROMPT P4 — Consolidation du dashboard (vrai SaaS)

Relis `CLAUDE.md` en entier. Active et suis `ui-ux-pro-max`, `motion-framer`, `react-components`.
Respecte la gouvernance. Ne régresse pas les espaces existants.

Contexte : l'espace `/app` a déjà un dashboard **coopérative** et un dashboard **exportateur** riches
(Sessions 5-7). Cette étape **complète** l'architecture d'information pour qu'elle ressemble à un vrai SaaS,
sans tout reconstruire.

Fais :

1. **Navigation latérale cohérente** dans `app/app/layout.tsx` : une **sidebar** (repliable sur mobile,
   état actif via `usePathname`) reliant **Vue d'ensemble** (`/app/dashboard`), **Producteurs**
   (`/app/producteurs`), **Parcelles** (`/app/parcelles`), **Exportateur** (`/app/exportateur`),
   **Paramètres** (`/app/parametres`). Intègre proprement le `app-space-switch` (Coopérative ↔ Exportateur)
   existant et la déconnexion (P2).

2. **`/app/producteurs`** (nouveau) : gestion des producteurs dérivée de `data/mock-parcelles.ts` — **liste
   dense** (nom, n° carte, filière, région, statut, superficie), **recherche** live, **filtres** (filière
   sur les 7, statut, région), **ajout d'un producteur** (formulaire validé, ajout en mémoire/session +
   toast de succès). Réutilise `EmptyState`, `StatusBadge`, `StatNumber`.

3. **`/app/parcelles`** (nouveau ou consolidé) : liste des parcelles + accès au détail existant
   `/app/parcelle/[id]` ; filtres par filière (7) et statut ; réutilise la carte portefeuille existante
   (`components/exportateur/portfolio-map.tsx`) si pertinent, sinon lien vers l'onglet cartographie
   exportateur.

4. **`/app/parametres`** (nouveau) : onglets **Profil** (nom, e-mail, organisation — pré-remplis depuis la
   session), **Organisation** (coopérative, région, filières couvertes), **Sécurité** (changement de mot de
   passe simulé + validation, « appareils connectés » factices cohérents). Sauvegarde en session + toast.

5. **Propage les 7 denrées** partout où une filière est listée/filtrée (labels, couleurs, icônes) via
   `config/filieres.ts`. **États** vides/erreur/chargement cohérents sur toutes les nouvelles vues.

**GATE** : `tsc` ✓ · `build` ✓ · captures 1440 + 390 des nouvelles routes (0 débordement), navigation
latérale OK mobile. `grep` termes interdits = néant. Puis Journal de build `CLAUDE.md` + « ✅ CLAUDE.md mis
à jour — … ».

---

## ▼ PROMPT P5 — Pages de crédibilité & légales

Relis `CLAUDE.md` en entier. Active et suis `ui-ux-pro-max`, `taste-design`. Respecte la gouvernance
(honnêteté : ne jamais inventer de faits juridiques ; marque clairement les mentions à compléter).

Contexte réglementaire du projet (voir `CLAUDE.md`) : AGRIVO = **sous-traitant technologique B2B SaaS**,
option BCEAO A (aucun agrément financier), conformité **ARTCI** (loi n°2013-450 : déclaration, consentement,
souveraineté des données). Utilise ce cadre pour un contenu **crédible et honnête**.

Fais :

1. **`/contact`** : page pro avec formulaire (nom, e-mail, organisation, message ; validation ; état de
   succès simulé + toast ; note discrète « nous répondons sous 48 h »), coordonnées, et une carte de
   contact commercial vs support.

2. **`/confidentialite`** (politique de confidentialité), **`/cgu`** (conditions d'utilisation),
   **`/mentions-legales`** : contenu FR **structuré et réel** adapté à AGRIVO (traitement des données,
   consentement ARTCI, souveraineté des données, rôle de sous-traitant, pas de conseil financier). Marque
   entre crochets `[À compléter : raison sociale, RCCM, siège]` les éléments d'entreprise réels à fournir.
   Mise en page « document » lisible (sommaire ancré, `max-w-3xl`, typographie soignée).

3. **`/aide`** (centre d'aide) : catégories (Démarrer, Vérifier une parcelle, Certificats, Micro-crédit,
   Compte & sécurité), **recherche** dans les articles, cartes cliquables, liens vers `/faq` et
   `/methodologie`. Enrichis `/faq` si besoin (cohérence).

4. **Footer complet** (`components/site-footer.tsx` + le footer inline de `CtaFooter` dans `app/page.tsx`) :
   colonnes **Produit** (Méthodologie, Tarifs, Cartographie) · **Ressources** (FAQ, Centre d'aide,
   À propos) · **Légal** (Confidentialité, CGU, Mentions légales) · **Contact**. Logo + baseline + ©.

5. **Bandeau consentement cookies** léger (accepter / refuser, mémorisé en localStorage), sobre, non
   bloquant, respect `prefers-reduced-motion`.

**GATE** : `tsc` ✓ · `build` ✓ · captures 1440 + 390 de chaque nouvelle page + footer (0 débordement) ·
liens du footer tous valides (aucun 404). `grep` termes interdits = néant. Puis Journal de build
`CLAUDE.md` + « ✅ CLAUDE.md mis à jour — … ».

---

## ▼ PROMPT P6 — Passe UX premium (niveau Stripe / Linear / Notion / Vercel)

Relis `CLAUDE.md` en entier. Active et suis `ui-ux-pro-max`, `motion-framer`, `taste-design`. Respecte la
gouvernance. **Aucune régression** visuelle des écrans validés.

Objectif : une couche de finition transverse qui élève tout le produit.

Fais :

1. **États systématiques** : vérifie que **chaque** liste/vue a des états **vide** (`EmptyState`),
   **chargement** (crée un `components/ui/skeleton.tsx` réutilisable + applique-le aux vues qui chargent
   des données), **erreur** (`ErrorState`). Ajoute un **système de toasts** réutilisable
   (`components/ui/toast.tsx` + hook `useToast`, custom framer, `aria-live`) et branche-le sur les actions
   (connexion, ajout producteur, export, enregistrement paramètres).

2. **Formulaires** : validation, messages d'erreur inline, focus management, désactivation pendant l'envoi,
   confirmations pour actions destructrices (crée un `components/ui/confirm-dialog.tsx` custom, pilotable au
   clavier, `role="dialog"`, focus-trap).

3. **Error boundaries** : `app/error.tsx` global on-brand + `app/app/error.tsx` pour l'espace produit
   (réutilise `ErrorState`). `not-found.tsx` existe déjà — vérifie sa cohérence.

4. **Responsive & a11y** : balayage **375 / 768 / 1280**, corrige tout débordement ; généralise
   `focus-visible` (anneau de marque), contrastes AA, navigation clavier, `prefers-reduced-motion` sur
   toute nouvelle animation. Doubles tous les statuts d'un texte (jamais la couleur seule).

**GATE** : `tsc` ✓ · `build` ✓ · captures 1440 + 768 + 390 des écrans clés (0 débordement) · un test
clavier de la palette/dialogues/toasts. `grep` termes interdits = néant. Puis Journal de build `CLAUDE.md`
+ « ✅ CLAUDE.md mis à jour — … ».

---

## ▼ PROMPT P7 — Qualité du code, refactor & rapport de livraison

Relis `CLAUDE.md` en entier. Active et suis `react-components`, `ui-ux-pro-max`. Respecte la frontière
RSC / `"use client"` décrite dans `CLAUDE.md` (ne jamais exporter une valeur non-composant depuis un
fichier client consommé par un composant serveur).

Fais :

1. **Refactor sans régression visuelle** : `app/page.tsx` duplique `Eyebrow`, les variants `container`/
   `rise` et des coquilles de section. Extrait des **primitives partagées** :
   `components/landing/section.tsx` (`<Section>`, `<SectionHeading eyebrow title chapo>`), `<Eyebrow>`, et
   un `<Card>` générique. Réécris les sections pour les réutiliser. **Aucun changement de rendu** (compare
   les captures avant/après).

2. **Typage & propreté** : élimine les `any`, complète les types, supprime imports/exports morts (utilise
   l'audit P1). Garde ESLint vert (flat config).

3. **Performance** : `next/image` partout (dimensions + `sizes`), confirme le lazy de Leaflet
   (`dynamic ssr:false`) et le code-split du PDF (`@react-pdf/renderer` à la demande), vérifie qu'aucune
   image lourde n'entre dans le bundle initial.

4. **Rapport final → `LIVRABLE_AGRIVO_V4.md`** : (a) améliorations réalisées ; (b) architecture finale
   (arbre des routes + composants clés) ; (c) fonctionnalités **ajoutées** / **supprimées** ; (d) **dette
   technique restante** ; (e) **recommandations pour la vraie production** (backend + base type Supabase,
   clés Whisp/Gemini réelles + désactivation `MOCK_MODE`, paiements Mobile Money, i18n validée par locuteur
   natif, re-vérification des chiffres marché, RGPD/ARTCI en conditions réelles).

**GATE** : `tsc` ✓ · `build` ✓ · `eslint` ✓ · captures de contrôle 1440 + 390 (aucune régression vs P3-P6)
· `grep` termes interdits = néant. Puis Journal de build `CLAUDE.md` (clôture V4) + « ✅ CLAUDE.md mis à
jour — … ».

---

### Rappel final
- Un prompt à la fois, **GATE vert obligatoire** avant le suivant.
- Images à déposer dans `public/filieres/` et `public/textures/` (voir manuel §3-4) — sinon les fallbacks
  dégradés s'affichent proprement.
- Le HERO, l'aperçu de dashboard animé et le splash restent **intacts** sur toute la V4.

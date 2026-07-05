# AGRIVO — Prompts 2 à 6 (+1 bonus) pour vibecoder le site complet
### Version 3 · Direction « Forêt & Données » (SEULS le hero + l'écran de bienvenue s'inspirent de Nanti ; tout le reste = AGRIVO original) · Stack Next 16 / React 19 / Tailwind v4 / Framer Motion 12
### Pour Anael uniquement · À exécuter dans Claude Code (Opus 4.8 Max), **un prompt à la fois** · **À valider avant de lancer**

> **Statut :** le **Prompt 1 est déjà exécuté** — c'est l'état actuel du site (écran de bienvenue animé + landing avec hero + aperçu de dashboard, dans la nouvelle direction artistique). Ce document rédige les **prompts 2 à 6** dans cette même direction, les enrichit, et ajoute un **prompt 7 bonus**. Objectif unique : **gagner le Vibeathon du 11 juillet 2026** avec un produit qui semble déjà shippé.

---

## 0 · Comment utiliser ce document

- **Ordre strict**, un prompt à la fois. Avant de lancer le suivant : `npm run build` vert + un coup d'œil navigateur (`npm run dev`).
- **Chaque prompt commence par : « Relis intégralement `CLAUDE.md` avant toute action. »** C'est la règle n°1 du projet.
- Chaque prompt **répète le socle** (design system + règles de contenu) — volontaire, pour qu'aucune session ne dérive même si le contexte ne se transmet pas.
- **Ne rien reconstruire** de ce qui existe : réutiliser les composants déjà là (voir « Inventaire » ci-dessous).
- À la fin de chaque prompt : **passe d'auto-critique** + **vérification** (`npx tsc --noEmit`, `npm run build`, capture visuelle Edge headless — méthode en Annexe C).

### Tableau récapitulatif

| # | Prompt | Livrable à la fin |
|---|--------|-------------------|
| 2 | Site vitrine complet | Accueil enrichi, méthodologie, à propos, tarifs, FAQ, comparatif concurrence, timeline RDUE, sélecteur de langue, 404 |
| 3 | Dashboard coopérative & consentement ARTCI | L'écran d'Amadou + le modèle de données + l'écran de consentement (pont vers le parcours) |
| 4 | Le parcours héros (golden path) | Scan → carte → **verdict animé** → certificat PDF → crédit, avec explicabilité + lecture vocale. **Le moment signature.** |
| 5 | Dashboard exportateur, assistant IA & alertes | Vue B2B dense, carte↔tableau liés, export GeoJSON, palette de commandes ⌘K, chat IA, centre d'alertes |
| 6 | PWA, guide de démo présentateur & polish final | Mode présentateur (Ctrl+Shift+D), PWA installable, accessibilité, QA responsive, filet de sécurité pitch |
| 7 (bonus) | Vérification publique de certificat & durcissement pitch | Page publique de vérification d'un certificat (crédibilité acheteur UE) + perf/SEO + script vidéo de secours |

### Inventaire de l'existant (à réutiliser, NE PAS reconstruire)

```
app/layout.tsx            polices (Newsreader/Geist/Geist Mono) + anti-flash splash-mask + <SplashScreen>
app/globals.css           Tailwind v4 @theme (palette + effets) — SOURCE DES TOKENS
app/page.tsx              landing : <SiteHeader overlay> + <Hero> + sections AGRIVO (problème, golden path,
                          triptyque, 2 IA, filières, chiffres, calendrier RDUE, personas, modèle, verdicts, équipe) + footer
components/site-header.tsx / site-footer.tsx   en-tête (overlay/solid) + pied partagés
components/language-provider.tsx + components/ui/language-switcher.tsx + lib/i18n.ts   FR/Dioula/Baoulé
components/landing/reveal.tsx  <Reveal> + <ScrollRevealText> ; components/ui/{empty-state,error-state,term}.tsx
app/not-found.tsx         404 on-brand
components/splash-screen.tsx   écran de bienvenue (particules, halo, countdown, bouton magnétique, rideau)
components/page-reveal.tsx     montée du contenu après le splash (relais agrivo:enter)
components/landing/hero.tsx    hero 55/45 + tableau de bord flottant (tilt/parallax/float)
components/ui/logo.tsx         logo AGRIVO (pin + feuille) + AGRIVO_PIN_PATH / AGRIVO_LEAF_PATH / AGRIVO_VEIN_PATH
components/ui/motion-primitives.tsx   <Magnetic> <CursorGlow> <Tilt> (vanilla rAF, respectent reduced-motion + tactile)
components/ui/stat-number.tsx  <StatNumber> compteur animé au scroll (whileInView, une fois)
config/brand.ts           BRAND_NAME = "Agrivo", BRAND_TAGLINE
```

---

## ⚙️ SOCLE À RESPECTER DANS CHAQUE PROMPT (design system + règles de contenu)

> Ce bloc est reproduit en tête de chaque prompt ci-dessous. Il est la référence absolue.

**🚫 NANTI EST OUBLIÉ.** SEULS **le HERO** et **l'écran de BIENVENUE (splash)** reprennent le *design*
inspiré de Nanti. **Tout le reste** (accueil, dashboards, pages, textes, données) est **100 % AGRIVO**,
**original** (jamais un patron Nanti), contenu tiré du PDF `AGRIVO_Document_reference_v4.pdf`.
**Concepts NANTI bannis :** « **valeur à risque** » / « **montant à risque** » (n'existe **pas** dans
AGRIVO), terminologie « **cockpit** » (dire « tableau de bord »), toute section calquée sur Nanti
(avant/après cliché, « zéro boîte noire »).

**KPIs dashboard AGRIVO (les 4 officiels) :** producteurs audités · taux de conformité · superficie
cartographiée · volume validé (tonnes). **Jamais « valeur à risque ».**

**Modèle économique AGRIVO :** (1) abonnement coopérative **120 000 FCFA/mois** ; (2) API exportateur
**1 500 000 FCFA/mois** ; (3) **commission sur chaque micro-crédit facilité**, versée par l'**IMF
partenaire**. ⚠️ Le micro-crédit est un **prêt** (50 000–250 000 FCFA) que le producteur **rembourse** ;
ce qui est gratuit, c'est le **service AGRIVO**. **Ne jamais écrire « micro-crédit gratuit » comme un plan.**

**Stack (ne jamais dévier) :** Next.js **16.2.9** (App Router, Turbopack), React **19.2.4**, TypeScript strict, **Tailwind v4** (thème dans `app/globals.css` via `@theme`, **pas de `tailwind.config`**, `@tailwindcss/postcss`), **Framer Motion 12**, **lucide-react 1.x**, ESLint flat config. Déploiement Vercel. **React Server Components par défaut** — `"use client"` uniquement quand hooks/événements/motion.

**Palette « Forêt & Données » (tokens Tailwind v4, déjà dans `globals.css`) :**
`forest-950 #0a1f14` (fond immersif) · `forest-900 #0c2519` · `forest-800 #12372a` · `forest-700 #1b4a39` · `green-signal #16a34a` (= **Conforme**, CTA, liens) · `amber-cacao #c8861d` / `amber-soft #e0a64b` (accents valeur/crédit, = **Données insuffisantes** ; **jamais en texte de paragraphe sur fond clair**) · `red-block #b4231e` (= **Anomalie détectée**) · `ivory #f7f3ea` (**fond clair dominant du site**) · `ivory-deep #efe8d8` · `stone-*` (texte secondaire). Le blanc et `forest-950` pour le texte selon le fond.

**Typographie :** `.font-display` = **Newsreader** (serif éditoriale, italique par défaut — gros titres et chiffres-clés) · **Geist** (sans, corps) · `.num` = **Geist Mono** tabulaire (chiffres, n° de certificat, coordonnées GPS, réf. DDR) · `.eyebrow` (petites majuscules, tracking large). Jamais plus de 3 poids visibles par écran.

**Effets & motion (déjà dans `globals.css` + `motion-primitives.tsx`) :** `grain`, `glow-radial`, `glow-pulse`, `liquid-glass` / `liquid-glass-strong`, `divide-fluid` (séparateur dégradé), `mesh-a/b/c` (orbes lents), `text-gradient-gold`, `shimmer`. Primitives `<Magnetic>` (CTA), `<CursorGlow>` (hero), `<Tilt>` (cartes), `<StatNumber>` (compteurs), `<PageReveal>`. **Révélations au scroll** : fade + translation 12px + léger blur→net (whileInView, `viewport={{ once:true, margin:"-10% 0px" }}`). **Micro-interactions** rapides (150–250 ms). **prefers-reduced-motion** respecté partout (fallback fondu). Le **budget créatif d'animation le plus lourd est réservé au parcours de vérification (Prompt 4)** — ne pas le diluer ailleurs.

**Motif signature :** le **logo AGRIVO** est un **repère de géolocalisation (pin) portant une feuille Or** = « la culture géolocalisée ». Le pin et la feuille (constantes `AGRIVO_PIN_PATH` / `AGRIVO_LEAF_PATH`) servent aussi de motif discret : filigranes de section (opacité 4–6 %), icône d'état de chargement, marqueurs de carte. Jamais dans les boutons/champs (coins classiques arrondis).

**Imagerie :** **aucune photo stock** (surtout pas de cliché « fermier africain souriant »). Personas (Kouassi, Amadou, Marc, Yao) = **avatars géométriques à initiales** sur dégradé de marque. Visuels narratifs = compositions data/géométriques (cartes stylisées, graphiques, pin/feuille), jamais de photo. **Aucun logo d'entreprise réelle** affiché comme preuve sociale (Cargill, Barry Callebaut, Olam, Touton, SIFCA, Finafrica…) — ces noms n'existent qu'en **texte descriptif**.

**Règles de contenu (bannies à vie, partout, y compris commentaires et données mockées) :**
- ❌ « **garantie** » de conformité → « **évaluation** ».
- ❌ « **seul acteur** » → « **la seule solution qui combine conformité, santé des sols et inclusion financière** ».
- ❌ Tout **pourcentage de précision inventé** (jamais « 99,7 % » ni équivalent, nulle part).
- ❌ Jargon startup vide (disruptif, révolutionnaire, game-changer).
- ❌ « **Partenaire Lono** » → formulation **unique** autorisée : « **Score de résilience des sols — méthodologie inspirée de standards reconnus type Kubeko** ».
- ❌ **Finafrica** présenté comme contact déjà pris → « **contact identifié et validé sur son modèle** ».
- ❌ **Tiret cadratin « — »** dans le **texte visible** de l'UI (OK dans le code/commentaires). Utiliser « · », virgule, ou reformuler.
- **Statuts figés** (toujours ces mots exacts) : **Conforme** · **Anomalie détectée** · **Données insuffisantes**. Phrases figées : Conforme = « Aucune déforestation détectée après le 31 décembre 2020. » / Anomalie = « Une perte de couverture forestière a été identifiée sur cette zone. » / Insuffisant = « Présence de nuages ou données satellites insuffisantes pour statuer. »

**Multi-filières (IMPORTANT) :** AGRIVO n'est **pas que le cacao**. Il couvre **cacao, café, hévéa, palmier à huile** (filières RDUE ivoiriennes). La démo se concentre sur le cacao (filière la plus documentée), mais chaque écran doit rendre ce périmètre visible (filières nommées, portefeuille multi-filières).

**Deux IA, jamais confondues :** **Whisp** (FAO Open Foris, « What is in that plot? », open-source, *convergence de preuves*, date pivot **31 déc. 2020**, disponible en **API HTTP**) = **détection** géospatiale (pas un modèle maison ; précédent réel : pilote Kenya, 6 000+ parcelles, Long Miles Coffee / ITC). **Gemini** (Google) = **langage/vision/raisonnement** (OCR carte, rapport en langage naturel, explication de verdict, assistant exportateur). Phrase jury : « Nous combinons l'outil de référence de la FAO pour la détection, et une IA générative pour rendre la conformité compréhensible et actionnable par tous. »

**Réglementaire (faits vérifiés — voir Annexe B) :** RDUE applicable **30 décembre 2026** (grands/moyens opérateurs), **30 juin 2027** (PME) — confirmé par la révision ciblée du **18 déc. 2025** (Règlement UE 2025/2650) ; **Côte d'Ivoire = « risque standard »** → **diligence raisonnée complète + géolocalisation obligatoire** (nuance forte : le Ghana est « faible risque », pas la CI — donc pour le cacao ivoirien la géolocalisation reste obligatoire). Carte producteur obligatoire dès le **1er sept. 2026**. **GeoJSON RFC 7946**, 6 décimales. Dépôt sur **TRACES NT** (portail UE). **ARTCI** (données perso, loi 2013-450, consentement, souveraineté). **BCEAO** : AGRIVO = sous-traitant technologique B2B (Option A, aucun agrément).

**Skills obligatoires à chaque session :** `ui-ux-pro-max` (raisonnement design avant tout composant), `motion-framer` / Framer Motion (toutes les animations), `superpowers` (scaffolding propre + brainstorming si zone d'ombre), + tout skill design/accessibilité/frontend pertinent détecté.

**Piège d'architecture à ne jamais commettre :** ne **jamais** exporter une valeur non-composant (fonction cva, constante) depuis un fichier `"use client"` si un composant **serveur** la consomme → référence client non appelable → crash prerender `(0 , X.d) is not a function`. Mettre ces valeurs dans un module **sans** `"use client"`.

**Gate de fin de session (obligatoire) :** `npx tsc --noEmit` vert **puis** `npm run build` vert (0 erreur) **puis** capture visuelle (Annexe C) sur desktop **et** 375 px. Corriger avant de dire « terminé ».

---
---

## PROMPT 2/6 — Site vitrine complet

```
Relis intégralement CLAUDE.md avant toute action.

RÔLE
Tu es l'ingénieur produit et designer principal d'AGRIVO. Tu construis le site vitrine complet, dans la
direction artistique « Forêt & Données » déjà en place (écran de bienvenue + landing hero). Niveau de
finition : produit shippé par une équipe design senior. Le site doit convaincre un jury de hackathon
(Vibeathon, 11 juillet 2026) que c'est déjà une startup, pas un projet d'école.

SKILLS OBLIGATOIRES : active et exploite pleinement `ui-ux-pro-max`, le skill Framer Motion
(`motion-framer`), `superpowers`, et tout autre skill design/accessibilité/frontend pertinent. Ne conçois
aucune section sans passer par le raisonnement de `ui-ux-pro-max`.

NE RECONSTRUIS RIEN. Réutilise : Hero, motion-primitives (Magnetic/CursorGlow/Tilt), StatNumber, Logo,
PageReveal, globals.css (@theme), config/brand.ts. Étends `globals.css` en cohérence si un token manque.

[COLLE ICI LE SOCLE — stack, palette, typo, effets, règles de contenu, multi-filières, deux IA,
réglementaire, pièges. Voir la section « SOCLE » du document.]

CE QUE TU CONSTRUIS

1. ENRICHIR `app/page.tsx` (accueil) — au-delà du hero + « comment ça marche » déjà présents, ajoute,
   en alternant fonds `ivory` (clair, dominant) et `forest-950` (immersif, rare), séparés par `divide-fluid` :
   a. SECTION PROBLÈME — 3 cartes (RDUE bloquant · coût de certification 20-40 M FCFA/an · exclusion du
      crédit, 95% des exploitants). Chiffres animés via <StatNumber>. Cartes en Tilt léger.
   b. SECTION MARCHÉ + TRIPTYQUE — nomme explicitement le différenciateur « conformité + santé des sols
      + inclusion financière ». Graphique comparatif coût méthode classique vs abonnement AGRIVO
      (Recharts, tooltip stylé charte : fond neutral, texte Geist — jamais le tooltip par défaut).
   c. SECTION FILIÈRES — cacao · café · hévéa · palmier à huile, en cartes Tilt (compositions
      géométriques, pas de photo), avec la position mondiale de la CI par filière.
   d. SECTION GOLDEN PATH — les 5 étapes du parcours (sélection → scan carte → cartographie → verdict
      Whisp → micro-crédit) en stepper animé (ligne de liaison qui se trace, étapes révélées en cascade).
   e. TIMELINE RDUE — J-countdown live (calcul vers le 30 déc. 2026) + 3 jalons (SNT juin 2026, carte
      obligatoire 1 sep. 2026, RDUE 30 déc. 2026). Reprends le style de la timeline premium.
   f. SECTION DEUX IA (Whisp = détection FAO · Gemini = langage, jamais confondues) et PERSONAS (Amadou,
      Marc, Yao) en cartes premium avec avatars géométriques à initiales.
   g. MODÈLE ÉCONOMIQUE — 3 cartes (abonnement coopérative 120 000 FCFA/mois · API exportateur
      1 500 000 FCFA/mois · commission sur chaque micro-crédit facilité, versée par l'IMF partenaire).
      ⚠️ Ne jamais écrire « micro-crédit gratuit » : c'est un prêt que le producteur rembourse ; c'est le
      SERVICE AGRIVO qui est gratuit pour lui.
   h. ÉQUIPE — cartes avec avatars géométriques à initiales (Anael, Christ, Gaddiel, Domy, Fatim), pas
      de photo.
   i. CTA FINAL + FOOTER enrichi (liens vers toutes les pages, source RDUE officielle, mentions).
   Applique une **révélation de titre scroll-linked** (les mots du gros titre de section s'illuminent au
   scroll, façon Linear/Vercel) sur AU MOINS un titre majeur — c'est une signature 2026.

2. `/methodologie` — Honnêteté technique. Orchestration de données satellites publiques (Copernicus,
   convergence de preuves façon FAO/Whisp), les 3 états de résultat et pourquoi « Données insuffisantes »
   existe, rôle exact de l'IA générative (assistance à la lecture/explication, JAMAIS la détection).
   Paragraphes en max-w-2xl/3xl. Tooltips (Radix) sur chaque terme technique (RDUE, DDR, TRACES NT, GeoJSON).

3. `/a-propos` — Vision, mission, le moat (triptyque), roadmap synthétique (pilote → conformité →
   lancement → expansion), équipe. Section « Ce qui arrive ensuite » avec 2-3 cartes « Roadmap » discrètes
   (monitoring continu, matching coopérative↔IMF) — vision produit sans prétendre que c'est construit.

4. `/tarifs` — Reprends la grille premium (4 plans, toggle mensuel/annuel -20%, plan « le plus choisi »
   mis en avant sur forest-950), contexte ROI (1 conteneur bloqué = 30-100× l'abonnement annuel), et un
   **tableau comparatif** vs alternatives (Excel/WhatsApp, Koltiva, Farmerline/Mergdata, AGRIVO) — le
   différenciateur n'est jamais « SaaS vs service » (Mergdata est une vraie plateforme), c'est le triptyque.

5. `/faq` — Accordéon (Radix, stylé charte) 8-10 Q/R : report RDUE (non, confirmé déc. 2025), EUDR en une
   phrase, AGRIVO ne signe PAS la DDS (l'importateur UE la signe sur TRACES NT), protection des données
   (local + IA sur demande), critères personnalisables, multi-filières, fiabilité de la détection (SANS
   citer de pourcentage), fonctionnement du crédit.

6. SÉLECTEUR DE LANGUE (pilier inclusion, PAS un détail) — `components/ui/language-switcher.tsx` +
   `lib/i18n.ts` : Français (défaut) · Dioula · Baoulé. Dictionnaire d'au moins : les 3 statuts, les
   libellés des boutons du parcours, le message d'accueil. Sélecteur discret dans la navbar, entièrement
   accessible au clavier (flèches, Échap, focus rendu). Chaînes Dioula/Baoulé PROVISOIRES avec commentaire
   « à valider par un locuteur natif avant le pitch » (cohérent avec « honnête sur nos limites »).

7. NAVBAR PARTAGÉE + composants d'état — extrais la navbar de `app/page.tsx` en `components/site-header.tsx`
   (logo + nav + LanguageSwitcher + CTA « Voir la démo » → /app/dashboard, route du Prompt 3), utilisée sur
   toutes les pages vitrine. Crée `components/ui/empty-state.tsx` et `components/ui/error-state.tsx`
   (icône pin/feuille discrète, message clair, action de récupération) — toute vue de données des prompts
   suivants devra les utiliser.

EXIGENCES : mobile-first rigoureux (vérifie à 375 px) ; explications au survol des termes techniques ;
révélations au scroll une seule fois ; aucun texte/logo interdit ; ne casse jamais l'écran de bienvenue
ni le hero. Termine par une passe d'auto-critique (cohérence couleurs/espacement, absence d'interdits,
qualité des animations) puis le GATE (tsc + build + capture desktop & 375 px).
```

---
---

## PROMPT 3/6 — Dashboard coopérative & écran de consentement ARTCI

```
Relis intégralement CLAUDE.md avant toute action.

RÔLE
Tu construis l'écran que voit Amadou (gérant de coopérative) chaque fois qu'il ouvre AGRIVO, AVANT de
vérifier la moindre parcelle, puis l'écran de consentement ARTCI qui fait le pont vers le parcours de
vérification. C'est l'écran que la structure initiale du projet avait oublié : sans lui, le parcours du
Prompt 4 commencerait au milieu de nulle part.

SKILLS OBLIGATOIRES : `ui-ux-pro-max`, `motion-framer`, `superpowers`, + tout skill pertinent.

NE RECONSTRUIS RIEN (Logo, StatNumber, Magnetic/Tilt, EmptyState/ErrorState, LanguageSwitcher, SiteHeader).

[COLLE ICI LE SOCLE.]

MODÈLE DE DONNÉES (créé ici, réutilisé par les prompts 4 et 5) — `data/mock-parcelles.ts`, interface
+ au moins 12 parcelles (≥4 conformes, ≥3 anomalies, ≥3 données insuffisantes), coordonnées plausibles
région de Soubré (~6°05'N 6°35'O) ET quelques parcelles café (Man), hévéa (Aboisso), palmier (Dabou)
pour rendre le multi-filières concret. Producteurs nommés (univers Kouassi/Amadou). Interface :

  interface Parcelle {
    id; producteurNom; numeroCartePro; cooperative; region;
    superficieHa; filiere: "cacao"|"cafe"|"hevea"|"palmier";
    geojson: GeoJSON.Polygon | GeoJSON.Point;
    statut: "conforme"|"anomalie"|"insuffisant";
    dateVerification; datePivotAnalyse; // "2020-12-31"
    sourcesDonnees: string[]; numeroCertificat; referenceDDR?;
    propositionCredit?: { montantFcfa; statut: "proposee"|"acceptee"|"versee" };
    alerteActive?: boolean;
  }

Mets les types purs et les helpers dans un module SANS "use client" (réutilisable côté serveur).

PAGE `/app/dashboard` (layout `app/app/layout.tsx` : fond ivory, sidebar/topbar sobre, cohérent
charte, la navbar site n'apparaît pas ici) :
1. En-tête personnalisé « Bonjour Amadou · Coopérative Agricole de Soubré · <date> ».
2. 3-4 KPI en cartes avec <StatNumber> (parcelles vérifiées ce mois, taux de conformité, propositions de
   crédit envoyées, alertes actives).
3. Barre de recherche producteur (filtre live par nom/numéro de carte). Si 0 résultat → <EmptyState>.
4. Liste des dernières vérifications (lignes compactes : StatusBadge, producteur, filière, superficie,
   date). Clic → `/app/parcelle/[id]`.
5. Bouton proéminent « Nouvelle vérification » (le CTA le plus visible) → mène vers l'écran de consentement
   (ci-dessous), PAS directement au parcours.
6. Section Alertes — liste/badge (icône cloche + compteur) des parcelles `alerteActive`, message court par
   alerte (ex. « Nouvelle anomalie détectée sur la parcelle de <producteur> »). Icône = variante
   status-anomalie du pin/feuille, pas un composant de notif générique.

`/app/parcelle/[id]` — vue détaillée d'une parcelle déjà vérifiée : carte (react-leaflet OU placeholder
stylé si tu préfères la construire pleinement au Prompt 4), StatusBadge, infos producteur, bouton certificat
(peut être non fonctionnel ici), section crédit si `propositionCredit`.

ÉCRAN DE CONSENTEMENT (pont vers le Prompt 4) — titre clair (« Avant de continuer »), explication honnête
et brève que la vérification traite des données personnelles et de localisation du producteur, conformément
à la loi ivoirienne n°2013-450 sous contrôle de l'ARTCI, texte « Le producteur a donné son consentement
éclairé pour ce traitement », checkbox à cocher avant que « Continuer » ne devienne actif. Soigne-le
visuellement (c'est une PREUVE montrée en direct qu'AGRIVO est conçu conforme dès le départ, pas un
formulaire administratif). Validation → route `/app/verifier` (construite au Prompt 4 ; le lien peut exister).

EXIGENCES : gère les cas vides (EmptyState) et recherche sans résultat ; mobile-first (Amadou sur un
smartphone d'entrée de gamme au bord du champ, cibles ≥44px) ; retour cohérent. GATE final (tsc + build +
capture desktop & 375 px). Auto-critique sur la fluidité dashboard → consentement.
```

---
---

## PROMPT 4/6 — Le parcours héros : golden path de vérification (LE moment signature)

```
Relis intégralement CLAUDE.md avant toute action.

RÔLE
Tu construis LA partie la plus importante du projet : le parcours démontré en direct devant le jury. C'est
ici que se concentre l'ESSENTIEL du budget créatif d'animation. L'animation du verdict (étape 3) est le
moment que le jury doit retenir de toute la présentation. Prends ton temps, rejoue-la mentalement.

SKILLS OBLIGATOIRES : `ui-ux-pro-max` (flow multi-étapes), `motion-framer` (CRITIQUE ici), `superpowers`,
+ tout skill pertinent.

NE RECONSTRUIS RIEN. Le modèle `data/mock-parcelles.ts` existe (Prompt 3) — réutilise-le. Réutilise Logo,
motion-primitives, StatusBadge, EmptyState/ErrorState, le pin/feuille comme motif d'analyse.

[COLLE ICI LE SOCLE — insiste sur : jamais de pourcentage de précision inventé (même en commentaire/mock) ;
badge sols = « Score de résilience des sols — méthodologie inspirée de standards reconnus type Kubeko ».]

DEUX IA (stubs, pas de clé API) : `lib/ai/whisp.ts` (détection) et `lib/ai/gemini.ts` (OCR/explications/chat).
Fonctions stub structurées + mock réaliste + `// TODO: brancher la vraie clé API`. AUCUN appel réseau ne
part du client : tout passe par des routes API Next.js (`app/api/whisp/verify`, `app/api/gemini/scan`,
`app/api/gemini/explain`), même mockées.

MOCK_MODE (sécurisation absolue de la démo) : dans `app/api/whisp/verify`, si les coordonnées correspondent
au jeu de démo, court-circuite tout appel réseau et renvoie le résultat pré-enregistré en < 1 s (délai
simulé 1200-1800 ms pour une sensation d'appel réel + état de chargement soigné : le pin/feuille en
pulsation « analyse en cours »). Ne jamais dépendre d'un appel live non testé devant le jury. Toggle
MOCK_MODE forcé ON.

PARCOURS — route `/app/verifier`, état client (aucun rechargement entre étapes), transitions
AnimatePresence entre étapes :

Étape 1 — Confirmation : arrivée depuis le consentement (Prompt 3). Récap coopérative. CTA « Commencer le scan ».

Étape 2 — Scan de la carte producteur : zone caméra (accès caméra navigateur si possible, sinon mock
élégant avec cadre de visée animé). « Scanner » → `scannerCarteProducteur()` (stub Gemini Vision) → délai
simulé + chargement → extraction nom/numéro/localité → formulaire pré-rempli éditable. Fallback propre si
la caméra est inaccessible.

Étape 3 — Cartographie & analyse (LE MOMENT SIGNATURE) : carte satellite plein écran (react-leaflet, fond
satellite/topographique), polygone GeoJSON de la parcelle, sommets marqués et légèrement interactifs au
survol, infos à côté. Bouton « Lancer l'analyse ». Séquence, dans cet ordre précis (Framer Motion,
timeline soignée, ~2,5-3 s au total, respect reduced-motion) :
  1. Le contour de la parcelle se dessine trait par trait (stroke-draw, ~600 ms).
  2. Pulsation neutre « analyse en cours » + un léger balayage satellite (~800 ms).
  3. Remplissage de la couleur du verdict avec un scale-bounce discret (~300 ms).
  4. StatusBadge + phrase figée du verdict (via `genererExplicationVerdict()`), une phrase exacte selon le
     statut (voir socle).
  5. Badge « Score de résilience des sols » (texte exact), CLIQUABLE → popover avec explication générée
     (stub Gemini `expliquerScoreSols()`, 1-2 phrases : un producteur qui recycle ses cabosses via
     compostage actif obtient un score plus élevé). C'est ton XAI (répond à la non-discrimination
     algorithmique exigée par l'ARTCI).
  6. Icône « Écouter l'explication » → Web Speech API (SpeechSynthesis, natif, sans clé) lit le verdict en
     français. Accessibilité + inclusion réelles et démontrables.
  Bouton discret « revoir l'analyse » pour rejouer la séquence pendant les répétitions.

Étape 4 — Certificat : si conforme ou anomalie, génération PDF en direct (@react-pdf/renderer), animation
de génération soignée, aperçu + téléchargement. PDF : n° de certificat unique, date/heure, producteur,
n° de carte, coopérative, filière, coordonnées WGS-84 (6 décimales), superficie, statut, date pivot,
sources de données, mention « prêt pour soumission TRACES NT », mention de consentement, avertissement
« évaluation technique, ne se substitue pas à la responsabilité légale de l'opérateur ». (Ce n° de
certificat servira au Prompt 7, vérification publique.)

Étape 5 — Inclusion financière : uniquement si conforme. Slider 50 000-250 000 FCFA, « Proposer au
producteur » → simulation Mobile Money avec animation de succès (le pin/feuille peut réapparaître rempli
d'Or Récolte : « le vert prouve, l'or récompense »).

Fin de parcours : bouton retour au dashboard coopérative, qui reflète la nouvelle vérification dans sa
liste (mise à jour d'état côté client suffit).

EXIGENCES : mobile-first rigoureux (démontré sur un vrai téléphone 375 px projeté) ; reduced-motion ;
routes API même mockées ; jamais d'appel client direct. GATE final. Auto-critique SPÉCIFIQUE sur la
séquence de l'étape 3 (rejoue-la mentalement plusieurs fois, vérifie la fluidité et l'absence d'accroc).
```

---
---

## PROMPT 5/6 — Dashboard exportateur, assistant IA & alertes

```
Relis intégralement CLAUDE.md avant toute action.

RÔLE
Tu construis la vue B2B destinée aux exportateurs (Marc, directeur durabilité), avec un bonus IA soigné :
un assistant conversationnel qui interroge le portefeuille en langage naturel — le meilleur rapport
effort/impact de toute la roadmap IA.

SKILLS OBLIGATOIRES : `ui-ux-pro-max` (densité sans sacrifier l'élégance), `motion-framer`, `superpowers`.

NE RECONSTRUIS RIEN. Réutilise/étends `data/mock-parcelles.ts` (porte-le à 40-50 parcelles, multi-filières,
cohérentes avec les personas/régions). Réutilise StatNumber, StatusBadge, EmptyState/ErrorState, Tilt.

[COLLE ICI LE SOCLE.]

PAGE `/app/exportateur` — 3 onglets (Tabs Radix stylés charte, transitions fluides) :

Onglet 1 — Analytique & cartographie : 4 KPI <StatNumber> (producteurs audités, taux de conformité,
superficie cartographiée, volume validé en tonnes). Table dense et triable (producteur, coopérative,
filière, superficie, StatusBadge, date), filtre par statut/filière, recherche (EmptyState si vide). Carte
Leaflet du portefeuille avec **interaction liée** : cliquer un polygone surligne + scrolle la ligne du
tableau ; survoler une ligne met en surbrillance le polygone. Bouton « Exporter GeoJSON » qui télécharge un
vrai `.geojson` valide **RFC 7946** construit à partir des parcelles filtrées. **Palette de commandes ⌘K /
Ctrl+K** (cmdk ou Command Radix) pour rechercher une parcelle/un producteur depuis n'importe où — détail
premium qui distingue un vrai outil.

Onglet 2 — Assistant conversationnel (LE BONUS) : chat épuré à l'identité AGRIVO (pas un chat générique).
Stub `interrogerPortefeuille(question, parcelles)` dans `lib/ai/gemini.ts` qui raisonne RÉELLEMENT sur les
données (« quelles parcelles non conformes » → liste vraiment les parcelles au statut anomalie). 3-4
questions suggérées cliquables (« Quelles parcelles présentent un risque dans la région de Soubré ? »,
« Résume les anomalies détectées ce mois-ci », « Superficie moyenne des parcelles non conformes ? »,
« Combien de producteurs éligibles au micro-crédit ? »). Anime l'apparition des réponses (frappe
progressive légère ou fade fluide) — le moment le plus « IA vivante » de la session.

Onglet 3 — Configuration, alertes & logs : clés API en placeholders masqués (WHISP_API_KEY, GEMINI_API_KEY),
toggle visuel MOCK_MODE (forcé ON + explication), journal de « requêtes réseau » simulées qui s'anime en
temps réel (« 🟢 Whisp API · réponse en 847 ms ») pour la preuve de vie technique en Q&A. **Centre
d'alertes** cohérent avec le dashboard coopérative (Prompt 3) à l'échelle exportateur : parcelles
`alerteActive` groupées par coopérative, compteur global visible depuis les 3 onglets (cloche dans le
header de la page).

EXIGENCES : communique « destiné aux grands opérateurs, milliers de parcelles » (densité assumée) ; liens
croisés cohérents avec les autres vues. GATE final. Auto-critique sur la qualité perçue de l'assistant et
la fluidité carte↔tableau.
```

---
---

## PROMPT 6/6 — PWA, guide de démo présentateur & polish final

```
Relis intégralement CLAUDE.md avant toute action.

RÔLE
Tu termines AGRIVO : tu transformes ce qui existe en produit présentable et SÉCURISÉ devant un jury, avec
un vrai outil de pilotage pour Anael pendant le pitch.

SKILLS OBLIGATOIRES : `ui-ux-pro-max` (polish + cohérence globale), `motion-framer`, `superpowers`.

[COLLE ICI LE SOCLE — dernière vérification : applique-le partout où il manquerait.]

PARTIE 1 — GUIDE DE DÉMO PRÉSENTATEUR (la pièce la plus importante de cette session)
Mode présentateur invisible pour le jury, activable par Anael via Ctrl+Shift+D. Panneau latéral fin
(fixed, bord droit, fond forest-950 semi-transparent, ne recouvre jamais le contenu principal) :
1. Étape actuelle détectée automatiquement selon la route/l'état (« Dashboard coopérative »,
   « Vérification · Étape 3/5 »).
2. Une ligne de rappel de ce qu'il faut dire à voix haute pour chaque écran majeur (dashboard, consentement,
   scan, carte, verdict, certificat, crédit) — rédige ces phrases, courtes et percutantes, ton charte.
3. Chronomètre (démarre à l'activation).
4. Boutons de saut rapide vers n'importe quelle étape du golden path (dashboard, consentement, 5 étapes).
5. Bouton « Forcer un résultat » à l'étape 3 (choisir manuellement le verdict, indépendamment de la parcelle).
6. Bouton « Réinitialiser la démo » (remet tout l'état à l'initial en un clic).
7. Mode « Répétition chronométrée » (compte à rebours configurable, ex. 5 min, affiché en grand).
8. Check-list « avant de monter sur scène » (5-6 items à cocher : MOCK_MODE ON ✓ / wifi de secours testé ✓ /
   vidéo de secours hors-ligne accessible ✓ / volume micro testé ✓ / batterie téléphone ✓).
Élégant mais utilitaire (le jury ne le voit jamais), parfaitement lisible d'un coup d'œil. Aucune étape
n'avance jamais automatiquement : Anael garde le contrôle manuel.

PARTIE 2 — PWA COMPLÈTE : `manifest.json` (nom = BRAND_NAME, icônes 192/512 basées sur le logo pin/feuille
en green-signal sur fond ivory, theme_color #0a1f14 ou #14512b, background_color #f7f3ea, display standalone) ;
service worker basique (cache du shell, network-first pour les données mockées) ; vérifie l'installabilité.

PARTIE 3 — ACCESSIBILITÉ (passe complète) : contraste AA partout (AAA sur les badges de statut), focus
clavier visible partout, aria-label sur chaque icône seule cliquable, cibles ≥44px sur mobile (surtout le
golden path), les 3 statuts toujours doublés d'un texte (jamais la couleur seule), LanguageSwitcher +
lecture vocale du verdict fonctionnels au clavier.

PARTIE 4 — QA RESPONSIVE : repasse chaque page (5 sessions) à 375 / 768 / 1280 px. Le golden path
impeccable à 375 px.

PARTIE 5 — ÉTATS D'ERREUR/CHARGEMENT : chaque vue de données dynamiques (recherche dashboard, tableau
exportateur, chat) utilise EmptyState/ErrorState, jamais d'écran blanc silencieux.

PARTIE 6 — CHECKLIST D'AUTO-CRITIQUE FINALE : cohérence couleurs/espacement partout ; aucun texte interdit,
aucun logo réel, aucune photo stock ; séquence étape 3 fluide ; README à jour (structure, lancement, tokens,
activation du guide de démo, où brancher les vraies clés Whisp/Gemini) ; toutes les pages accessibles depuis
une navigation cohérente ; LanguageSwitcher fonctionnel sur les chaînes clés. GATE final (tsc + build +
capture desktop & 375 px). Termine en me donnant un résumé + tout point qui, selon ton jugement, mériterait
encore un ajustement avant le jury.
```

---
---

## PROMPT 7 (BONUS) — Vérification publique de certificat & durcissement pitch

```
Relis intégralement CLAUDE.md avant toute action.

RÔLE
Tu ajoutes la brique qui inspire le plus confiance à un acheteur européen ET tu durcis le produit pour le
pitch. Optionnel mais fort en crédibilité jury.

SKILLS OBLIGATOIRES : `ui-ux-pro-max`, `motion-framer`, `superpowers`.

[COLLE ICI LE SOCLE.]

1. PAGE PUBLIQUE `/verifier-certificat` (+ `/verifier-certificat/[numero]`) — accessible sans connexion :
   un acheteur UE saisit (ou scanne le QR du PDF du Prompt 4) un numéro de certificat et voit une fiche de
   vérification : parcelle, filière, statut, date pivot, sources de données, coordonnées, « prêt pour
   TRACES NT », horodatage. Si le numéro est inconnu → EmptyState honnête. Le PDF du Prompt 4 doit inclure
   un QR pointant vers cette page. C'est la preuve d'authenticité qui rassure l'acheteur.

2. PARTAGE ACHETEUR — depuis le dashboard exportateur, un lien partageable en lecture seule d'un dossier
   de due diligence (page `/dossier/[token]`), cohérent charte, avec bouton « Imprimer / PDF ».

3. DURCISSEMENT PITCH : page `/demo` (ou section) qui explique le scénario de démo en 60 secondes ;
   vérifie que « Réinitialiser la démo » (Prompt 6) remet TOUT à zéro ; ajoute un bandeau discret
   « Données de démonstration » sur les vues du tableau de bord.

4. PERFORMANCE & SEO : métadonnées (title/description/OpenGraph) par page, favicon basé sur le logo,
   `sitemap.ts` + `robots.ts`, lazy-load des cartes Leaflet (dynamic import, ssr:false), vérifie qu'aucune
   police/asset lourd ne bloque le premier paint. Vise un Lighthouse propre.

5. SCRIPT VIDÉO DE SECOURS : rédige dans le README un script minute-par-minute de la vidéo de secours
   (golden path complet) à enregistrer et garder hors-ligne sur deux appareils.

GATE final (tsc + build + capture). Résumé + points d'ajustement restants.
```

---

## Annexe A — Angles morts & fonctionnalités ajoutés (avec justification)

Par rapport à une simple traduction des prompts d'origine, cette v3 ajoute/renforce, pour se rapprocher de la version finale et maximiser les points jury :

- **Sélecteur de langue FR/Dioula/Baoulé** (Prompt 2) — pilier d'inclusion de la marque, différenciateur fort, absent du site post-pivot. Chaînes locales marquées « provisoires » (honnêteté).
- **Révélation de titre scroll-linked** (Prompt 2) — signature visuelle 2026 (Linear/Vercel), validée par la veille design ; concentre l'effet sur 1 titre pour ne pas diluer.
- **Timeline RDUE J-countdown + tableau comparatif concurrence** (Prompt 2) — répond directement à « et si le jury connaît Koltiva/Farmerline ? » via le triptyque.
- **Consentement ARTCI soigné** (Prompt 3) — preuve « conçu conforme dès le départ », montrée en direct.
- **Modèle de données multi-filières** (Prompt 3) — rend le périmètre cacao/café/hévéa/palmier concret partout.
- **XAI (explication du score de sols + du verdict) + lecture vocale Web Speech** (Prompt 4) — crédibilité algorithmique (ARTCI) + inclusion, gratuits (sans clé API).
- **MOCK_MODE + routes API** (Prompt 4) — sécurise la démo live (le risque n°1 d'un pitch).
- **Carte↔tableau liés, export GeoJSON RFC 7946 réel, palette de commandes ⌘K** (Prompt 5) — signaux « vrai outil pro ».
- **Assistant conversationnel qui raisonne sur les vraies données mockées** (Prompt 5) — le moment « IA vivante », meilleur effort/impact.
- **Guide de démo présentateur enrichi** (Prompt 6) — reset total, répétition chronométrée, check-list scène, forçage de verdict : filet de sécurité complet.
- **NOUVEAU — Vérification publique de certificat + QR + partage acheteur** (Prompt 7) — la brique de confiance côté acheteur UE, rarement vue en hackathon, très différenciante.
- **NOUVEAU — Perf/SEO/OpenGraph + script vidéo de secours** (Prompt 7) — polish « produit shippé » + plan B si le live plante.

**Décisions laissées à Anael avant de lancer :** (a) garder ou non le sélecteur de langue (coût vs bénéfice inclusion) ; (b) profondeur du dashboard coopérative vs exportateur selon le temps ; (c) exécuter le Prompt 7 bonus si le temps le permet.

## Annexe B — Faits vérifiés (recherche du 3 juillet 2026)

- **RDUE / échéances :** application **30 décembre 2026** (grands et moyens opérateurs), **30 juin 2027** (micro/petites entreprises) ; révision ciblée adoptée par le Parlement (11 déc. 2025) et le Conseil (18 déc. 2025), **Règlement (UE) 2025/2650** — l'échéance ne bouge plus.
- **Classification pays :** **Côte d'Ivoire = « risque standard »** (avec le Brésil, l'Indonésie… ~50 pays). Seuls 4 pays « haut risque » (Biélorussie, Corée du Nord, Myanmar, Russie, pour cause de sanctions). ~140 pays « faible risque » — **dont le Ghana**. **Conséquence clé (argument pitch) :** standard et haut risque = **diligence raisonnée complète + géolocalisation obligatoire** ; seule la catégorie « faible risque » a une diligence simplifiée. Donc, pour le **cacao ivoirien, la géolocalisation reste obligatoire** (contrairement au Ghana voisin).
- **Whisp :** « What is in that plot? », **API open-source de la FAO (Open Foris)**, approche **convergence de preuves**, date pivot **31 déc. 2020** ; disponible en **API HTTP**, plugin QGIS, Whisp Dashboard, Whisp Map (EarthMap) ; porté par la **Forest Data Partnership / Team Europe** ; précédent citable : pilote Kenya (6 000+ parcelles, Long Miles Coffee / ITC).
- **Sources :** Conseil de l'UE (consilium.europa.eu, 18/12/2025) · Parlement européen (europarl.europa.eu, 11/12/2025) · Commission — Environnement (environment.ec.europa.eu) · FAO Open Foris / Forest Data Partnership (openforis.org, fao.org) · ITC (intracen.org).

## Annexe C — Pièges techniques connus & méthode de vérification visuelle

**Pièges (Next 16 / React 19 / Tailwind v4 / Framer Motion 12) :**
- **Frontière RSC :** ne jamais exporter fonction/constante depuis un `"use client"` consommé par un composant serveur (crash prerender `(0 , X.d) is not a function`). Les mettre dans un module sans `"use client"`.
- **Tailwind v4 :** thème dans `globals.css` via `@theme` (pas de `tailwind.config`) ; la palette par défaut (stone, etc.) reste disponible ; PostCSS = `@tailwindcss/postcss`.
- **Polices `next/font/google` :** téléchargées au build ; sur réseau instable `fonts.gstatic.com` peut renvoyer un `ECONNRESET` (next réessaie) ; warning « font override values » bénin.
- **ESLint flat (eslint 9) :** `react/no-unescaped-entities` désactivé pour les apostrophes françaises ; garder du code sans variables inutilisées / sans `any`.
- **Espacement des mots animés :** entre deux `<motion.span className="inline-block">`, mettre un **vrai nœud texte** `{" "}` (pas d'espace en fin de span, il est rogné) ; contraindre le conteneur (`w-full max-w-2xl`) pour que les titres wrappent sous 400 px.
- **Écran de bienvenue :** s'affiche sur `/` à chaque arrivée (relais `agrivo:enter` → `PageReveal`) ; masque anti-flash injecté dans `<head>`.

**Vérification visuelle (à refaire après chaque changement d'UI) :**
1. `npm run build` puis `npm start` (ou `npm run dev`).
2. Splash figé : `msedge --headless=new --force-prefers-reduced-motion --window-size=1440,900 --screenshot=out.png http://localhost:3000/`.
3. Hero (après renvoi du splash) et vues du tableau de bord : script CDP `scratchpad/cdp-shot.mjs` (Node `fetch`/`WebSocket` natifs) — clic sur l'overlay pour renvoyer le splash puis capture. Toujours contrôler **desktop 1440** ET **375 px**.

---

*Document rédigé le 3 juillet 2026 pour l'équipe AGRIVO · Vibeathon · à valider par Anael avant exécution, un prompt à la fois.*

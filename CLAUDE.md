# CLAUDE.md — Mémoire de travail AGRIVO

> **À lire au début de CHAQUE prompt.** Ce fichier est la source de vérité unique du projet.
> Il condense la charte de marque, les règles de contenu, les faits produit et l'avancement.
> En cas de doute, ce fichier prime sur mes souvenirs. Il reflète l'état au dernier prompt traité.

> 🟢 **ÉTAT ACTUEL — v1.18.1+, 11 juillet 2026 (CE BLOC FAIT FOI sur toute mention contraire
> plus bas, qui relève de l'historique de construction).**
> - **Modèle économique** : Coopérative **100 000 FCFA/mois** (≈ 1 200 FCFA/producteur/an) ·
>   **Exportateur Essentiel 500 000** · **Exportateur Pro 1 000 000 FCFA/mois**. **AUCUN crédit,
>   prêt ni financement — jamais** (pivot Valorisation : primes + acheteurs premium).
> - **Comptes démo** : coop `coop@test.com`/`123TestCoop123` · exportateur
>   `export@test.com`/`123TestExport123` · admin `admin@agrivo.com`/`123admin123`.
> - **Espaces multi-pages** : coop (Vue d'ensemble · Producteurs · Parcelles · Certificats ·
>   Paramètres) ; exportateur (Tableau de bord · Coopératives, avec ajout + carte des sièges ·
>   Producteurs · Parcelles · Dossiers & rapports · Assistant IA). **API REST**
>   `GET /api/exporteur/portefeuille` (GeoJSON TRACES NT). Page publique `/status`.
> - **Détection satellite : RÉELLE ET ACTIVE (v1.20)** — `WHISP_API_KEY` posée (local + Vercel
>   prod) : analyse EN DIRECT par l'API officielle Whisp v3 (FAO/Earth Engine) aux paramètres du
>   site officiel (`unitType ha`, `nationalCodes ["ci"]` = carte cacao BNETD, `externalIdColumn`
>   agrivoId), verdict par filière (pcrop/acrop/timber, pire-des-trois pour bovins), panneau
>   11 indicateurs + jeton à l'étape analyse, ~8-30 s (maxDuration 60). Scénarios `sc-*`/force =
>   toujours déterministes ; repli garanti. IA générative Gemini réelle via `GEMINI_API_KEY`
>   (OCR, assistant 39 faits, mémos, dossiers). ⚠️ Rotation des 2 clés APRÈS le jury.
> - **Guide interactif (v1.21)** : la visite « spotlight » se rejoue à **CHAQUE connexion des
>   comptes démo** (login démo → `reinitialiserTour()` de `lib/tour.ts` efface les drapeaux
>   `agrivo:tour:v2:*`) ; comptes inscrits = une seule fois ; bouton « ? » = relance manuelle.
> - **App mobile de Christ** : dossier `Desktop/Agrivo (2)/Agrivo` (Flutter) analysé et corrigé le
>   11/07 — voir `ANALYSE_ET_CHANGEMENTS.md` dans ce dossier ; Christ doit recompiler l'APK.
> - **Qualité** : 110 tests Vitest, CI verte, tags jusqu'à v1.21.0, prod `agrivo-io.vercel.app`
>   (réassigner l'alias à chaque deploy). Polices réelles : Space Grotesk / Geist / Geist Mono.
> - Interface **FR/EN uniquement** (dioula/baoulé retirés). Statuts verbatim, « évaluation »
>   jamais « garantie », zéro % inventé. Docs de construction archivés dans `docs/archives/`.

---

## 🎯 BUT ULTIME (ne jamais l'oublier)

**Gagner la compétition Vibeathon — présentation devant jury le 11 juillet 2026.**

Chaque décision (design, code, texte, animation) se juge à une seule aune : *est-ce que ça augmente
nos chances de gagner ?* Un jury 2026 note **autant le polish visuel que la technique** — mais un
design qui **distrait du message fait perdre des points**. Sobre, crédible, « déjà une startup », jamais
« projet d'école ». Mon rôle sur ce projet : **ingénieur produit + designer principal** d'AGRIVO.

> ⚠️ Le dossier `C:\Users\Anael FAMENI\Desktop\agrivo` **n'existe pas** — l'ignorer totalement.
> Le seul projet est ici : `C:\Users\Anael FAMENI\.claude\projects\Agrivo`.

---

## 🚫 OUBLIER NANTI (règle stricte — Anael)

**Nanti est OUBLIÉ.** SEULS **le HERO** et **l'écran de BIENVENUE (splash)** reprennent le *design visuel*
inspiré de Nanti. **TOUT LE RESTE** (reste de l'accueil, dashboards, pages, textes, données) est **100 %
AGRIVO**, conçu de façon **originale** (pas de patron Nanti), contenu tiré du PDF
`AGRIVO_Document_reference_v4.pdf` (racine du projet). **Aucune section, aucun texte, aucun chiffre ne
doit venir de Nanti.**

**Concepts NANTI bannis partout dans AGRIVO :**
- ❌ « **Valeur à risque** » / « **Montant à risque** » (concept Nanti — n'a **jamais** existé dans AGRIVO).
- ❌ Terminologie « cockpit » (dire « tableau de bord »).
- ❌ Sections calquées sur Nanti (avant/après cliché, « zéro boîte noire / décomposition de la valeur à risque »).

**Faits AGRIVO de référence (PDF v4) — utiliser, ne rien inventer :**
- **KPIs dashboard (les 4 officiels)** : **producteurs audités · taux de conformité · superficie
  cartographiée · volume validé (tonnes)**. Jamais « valeur à risque ».
- **Modèle économique — 3 sources de revenu AGRIVO** :
  1. **Abonnement coopérative — 120 000 FCFA/mois** (vérifications illimitées, certificats PDF, hors connexion, support).
  2. **API exportateur — 1 500 000 FCFA/mois** (API REST, export batch, déclarations TRACES NT, SLA).
  3. ~~Commission micro-crédit~~ **RETIRÉ (Session 17, pivot Valorisation)** : le modèle = abonnement coop + API exportateur uniquement.
  - ⚠️ Le **micro-crédit n'est PAS « gratuit »** : c'est un **prêt (50 000–250 000 FCFA) que le producteur
    rembourse**. Ce qui est gratuit = le **service AGRIVO** pour le producteur (aucun frais à AGRIVO). Ne
    JAMAIS présenter « Micro-crédit : Gratuit » comme un plan tarifaire.
  - ⚠️ Honnêteté marge : Whisp/Copernicus gratuits en base, mais imagerie haute résolution + quotas Google
    Earth Engine commerciaux = coûts de licence à absorber.
- **Golden path (6 étapes, depuis Session 12)** : sélection coopérative → scan carte producteur
  (QR d'abord si présent, sinon OCR Gemini Vision ; anti-doublon matricule ; photo conservée comme
  preuve) → **cartographie GPS de la parcelle** (point central < 4 ha / tour de champ ≥ 4 ha, règle
  RDUE ; contrôles d'intégrité : chevauchement, superficie plausible, signal GPS authentique,
  doublon) → verdict Whisp (3 états) + explication + badge sols + certificat PDF (GeoJSON RFC 7946) →
  **valorisation** (dossier de conformité de la coop : primes, acheteurs premium, partage exportateur).
- **Personas** : Amadou (gérant coop, Soubré, 600 producteurs) · Marc (dir. durabilité, Abidjan) · Yao
  (productrice café, Man, 2 ha) · Kouassi (producteur cacao, Soubré, 15 ans).
- **Chiffres marché (Conseil Café-Cacao)** : 3 M ha géolocalisés · 900 K cartes pro · 160 K+ t tracées
  (oct. 2025–mars 2026) · 450 M€ UE · 1,1 M+ producteurs cacao enrôlés. (⚠️ non revérifiés, manier avec soin)
- **Deux IA** : Whisp (FAO, détection satellite ; pilote Kenya 6 000+ parcelles) · Gemini (langage/vision).
  **Score sols** : « méthodologie inspirée de standards reconnus type Kubeko » (jamais « partenaire Lono »).

---

## 🔁 RÈGLE D'AUTO-MISE À JOUR (imposée par Anael)

À **chaque prompt pertinent** (nouvelle décision, nouveau composant/page, changement de token, de
règle, d'architecture, franchissement d'étape) :
1. Mettre à jour ce `CLAUDE.md` — au minimum la section **📓 Journal de build**, plus toute section
   concernée (tokens, structure, décisions).
2. **Le signaler dans la réponse** par une ligne claire : **« ✅ CLAUDE.md mis à jour — <ce qui a changé> »**.

Pour un prompt **trivial** (question courte, micro-correction, discussion sans impact durable) :
ne PAS toucher au fichier et ne rien signaler. Juger au cas par cas — la mise à jour doit rester utile,
pas mécanique.

---

## 🎨 DIRECTION VISUELLE — PIVOT (Session 2, 2026-07-03) : réplique de Nanti

**Décision d'Anael :** le design d'AGRIVO doit **répliquer exactement** celui du projet **Nanti**
(`C:\Users\Anael FAMENI\.claude\projects\Nanti`) — mêmes **polices, effets, animations, fonds animés**,
même **page de bienvenue** et même **hero (avec aperçu de dashboard)**. Cela **remplace la charte
visuelle d'origine** ci-dessous (couleurs Canopée/Or, filigrane polygone) : ces tokens ne sont plus la
référence VISUELLE. En revanche **les RÈGLES DE CONTENU restent valides** (mots bannis, statuts figés,
aucun logo fabriqué, formulations Lono/Finafrica).

- **Stack alignée sur Nanti** : Next.js **16.2.9** (App Router, Turbopack), React **19.2.4**,
  **Tailwind v4** (`@theme` dans `app/globals.css`, `@tailwindcss/postcss`, **pas de** `tailwind.config`),
  **framer-motion 12**, **lucide-react 1.x**, ESLint flat config.
- **Palette « Forêt & Données »** : `forest-950 #0a1f14` (fond sombre), `green-signal #16a34a` (Conforme),
  `amber-cacao #c8861d` / `amber-soft #e0a64b` (accents / Données insuffisantes), `red-block #b4231e`
  (Anomalie), `ivory #f7f3ea` (fond clair), `stone-*`.
- **Polices (Session 9, 2e passe)** : **TITRES = `Space Grotesk`** (`--font-space-grotesk`), corps =
  `Geist`, chiffres = `Geist Mono`. ⚠️ **Newsreader ET Fraunces retirés** (décision Anael : « je ne veux
  plus voir cette police, elle ressemble à l'IA »). Les DEUX classes `.font-display` et `.font-premium`
  pointent sur `--font-display` = Space Grotesk (droit, jamais italique ; l'italique a été retiré de la
  classe CSS ET des inline hero/splash). Space Grotesk max = **700** (hero passé de 800→700). Swap de
  police = 1 ligne dans `globals.css` + l'import next/font dans `app/layout.tsx`.
- **Effets/anim** (`globals.css` + `components/ui/motion-primitives.tsx`) : mesh gradients animés, grain,
  grille masquée, `glow-pulse`, `liquid-glass`, `divide-fluid`, `Magnetic` / `CursorGlow` / `Tilt`,
  particules canvas qui fuient le curseur (splash), countdown auto-accéléré, bouton magnétique, rideau de
  sortie (slide-up) + `PageReveal`.
- **Logo AGRIVO** (`components/ui/logo.tsx`) : un **repère de géolocalisation (pin) portant une feuille
  inclinée Or** — « la culture géolocalisée ». En volume : **dégradés** (vert clair→forêt, or clair→cacao),
  **reflet glossy** sur le bord du pin, nervure claire. Lisible dès 16 px. Animation splash : tracé
  (pin→feuille→nervure) + remplissage dégradé + **reflet scintillant qui balaie** + **éclat qui twinkle**
  au sommet de la feuille. Constantes : `AGRIVO_PIN_PATH` / `AGRIVO_LEAF_PATH` / `AGRIVO_VEIN_PATH` /
  `AGRIVO_GLOSS_PATH` / `AGRIVO_SPARKLE`. **Règle a11y** : en reduced-motion, le `initial` = état final
  visible (sinon le logo restait invisible).
- **Flux** : `/` = landing (navbar + `Hero` + section « comment ça marche » + footer) ; `<SplashScreen>`
  se superpose à **chaque** arrivée sur `/` (anti-flash via script dans `<head>`), relais `agrivo:enter` → `PageReveal`.
- **Conventions Nanti reprises** : **pas de tiret cadratin « — »** dans le texte visible de l'UI ;
  le dashboard du hero est un **APERÇU** (pas la version finale, à retravailler ensuite).
- **Multi-filières (IMPORTANT — Anael) — V4 : 7 denrées RDUE** : AGRIVO couvre les **7 matières premières
  du RDUE** (Règl. UE 2023/1115) : **cacao, café, hévéa, palmier à huile** (ivoiriennes, « en production »)
  + **bovins, soja, bois** (« couvertes par le moteur »). **Source de vérité unique : `config/filieres.ts`**
  (id, label, eudr, statut, couleur, icône lucide, image `/filieres/<id>.jpg`, position). **Ne plus coder de
  filière en dur** : tout dérive de `FILIERES`. La démo reste centrée cacao ; hero + dashboards rendent les
  7 visibles.
- **Écran de bienvenue (copywriting figé)** : LINE1 = « **Bienvenue dans Agrivo** » (mots espacés via
  vrais nœuds texte). LINE2 = « **De la parcelle vérifiée à la prime négociée.** » (pivot Session 17) — **tout blanc**,
  **sans** mentionner « Agrivo ». Mots révélés au fil du countdown + au survol.
- **Vérif. visuelle** : Edge headless (`msedge --headless=new --screenshot`, + `--force-prefers-reduced-motion`
  pour figer le splash) et un script CDP (`scratchpad/cdp-shot.mjs`, Node fetch/WebSocket natifs) pour
  capturer le hero après avoir renvoyé le splash. Reproduire ce contrôle visuel après chaque changement d'UI.

---

## 🌿 IDENTITÉ & PROMESSE

- **Promesse :** AGRIVO rend la conformité agricole **simple, prouvable et abordable** — et transforme
  une contrainte européenne en **opportunité commerciale** pour les coopératives (primes de durabilité,
  acheteurs premium — **jamais de crédit**, pivot Session 17).
- **3 verbes qui justifient tout :** simplifier (le producteur comprend) · prouver (l'exportateur a
  confiance) · inclure (le petit exploitant gagne).
- **Personnalité :** *Ancré · Clair · Crédible.* Un partenaire qui a « les pieds dans la boue du champ
  et la tête dans la réglementation européenne ». Ni bureaucrate distant, ni vendeur de rêve.
- **Nom / tagline :** `BRAND_NAME = "Agrivo"` · `BRAND_TAGLINE = "La conformité agricole, simplifiée."`
  (toujours via `config/brand.ts`, jamais en dur).
- **Le sujet réel du produit = la vérification d'une parcelle géolocalisée.** Rien n'est décoratif :
  tout se justifie par ce que le produit fait. → d'où le **motif signature : le polygone de parcelle**.

---

## 🎨 SYSTÈME DE DESIGN (référence absolue)

### Couleurs (tokens Tailwind)
| Token | Hex | Usage |
|---|---|---|
| `primary-900` Vert Canopée | `#14512B` | titres, boutons primaires, header/footer, texte de marque |
| `primary-600` Vert Cacaoyer | `#2D7A4B` | liens, hover, icônes actives, boutons secondaires |
| `primary-100` Vert Mousse | `#E4EDE3` | fonds de badges, sections alternées |
| `secondary-600` Or Récolte | `#D4A843` | accents valeur/crédit, CTA secondaires — **JAMAIS en texte de paragraphe** |
| `secondary-100` Or clair | `#F3E6C8` | fonds badges « opportunité » |
| `status-conforme` | `#2D8558` | verdict Conforme (toujours + texte/icône) |
| `status-anomalie` | `#C62828` | verdict Anomalie détectée |
| `status-insuffisant` | `#C9A66B` | Données insuffisantes — **fond de badge only**, texte foncé dessus |
| `neutral-bg` Papier | `#F2F5EF` | **fond par défaut de tout le site** (papier sauge) |
| `neutral-card` | `#FBFCFA` | fond des cards |
| `neutral-ink` | `#142019` | texte principal |
| `neutral-muted` | `#4A564E` | texte secondaire |
| `neutral-border` | `#D8E0D3` | bordures 1px |
| `neutral-dark` | `#0B341A` | **moments immersifs rares uniquement** (page d'entrée, hero) — nulle part ailleurs |

🔴 **Jamais :** dégradé arc-en-ciel « startup IA » · rouge/vert saturés type feu tricolore · Or Récolte en
texte de paragraphe · gris froid sans tonalité verte.

### Typographie (3 rôles, 3 familles — max 3 poids visibles par écran)
- **Display / titres :** `Newsreader` (serif, évoque le certificat officiel) — **gros titres & chiffres clés only**.
- **Interface / corps :** `Inter` — tout le reste.
- **Données / technique :** `IBM Plex Mono` — n° de certificat (`AGV-2026-0417`), coords GPS, réf DDR.

### Espacement / grille
- Échelle **4/8/12/16/24/32/48/64/96 px** uniquement (jamais d'arbitraire).
- Rythme vertical entre sections : **96–128 px desktop / 56–72 px mobile**.
- Conteneur `max-w-7xl` centré · padding `px-6` (mobile) → `px-8` (tablette) → `px-12` (desktop).
- Paragraphes longs limités à `max-w-2xl`/`max-w-3xl`.

### Ombres (douces, 3 niveaux) · Rayons · Icônes
- `shadow-sm` 0 1px 2px rgba(20,32,25,.04) · `shadow-md` 0 4px 12px /.08 (hover card) · `shadow-lg` 0 12px 32px /.12 (modales).
- Rayons : **`sm` 8px** (boutons/inputs/badges) · **`md` 12px** (cards) · **`lg` 20px** (grands panneaux).
- **lucide-react** exclusivement, `stroke-width 1.75`, tailles **16/20/24** px (jamais arbitraire).

### Motif signature — `<ParcelPolygon>`
- Polygone irrégulier 5–7 sommets, tracé organique (réf : `100,15 175,60 190,140 120,190 45,175 15,95 55,40` sur viewBox 200×200).
- Variantes : `draw` (contour qui se dessine, stroke-dashoffset / pathLength) · `pulse` (chargement).
- Emplois : badges de statut, indicateurs de chargement, filigranes de section (opacité 4–6 %, dérive lente ~20 s), séparateurs.
- **Jamais** pour boutons ni champs (ceux-ci gardent coins classiques radius-sm/md).

### Motion (Framer Motion partout)
- **Budget créatif concentré sur UN moment** : la séquence de vérification (prompt 4). Ailleurs = **rapide & discret (150–250 ms)**.
- Chargement page : apparition séquentielle, stagger 60–80 ms. Révélation scroll : fade + translation 12 px, `whileInView`, une seule fois.
- `AnimatedCounter` au scroll pour **toute** statistique. Hover card : shadow-sm→md + déplacement 2 px.
- **`prefers-reduced-motion` respecté partout** (fallback fondu). Zéro particule, zéro confetti, zéro parallaxe superposée.

---

## ✍️ RÈGLES DE CONTENU (bannies à vie — appliquer dans TOUT texte généré)

- ❌ « **garantie** » de conformité → dire « **évaluation** ».
- ❌ « **seul acteur** du marché » → « **la seule solution qui combine conformité, santé des sols et inclusion financière** ».
- ❌ Tout **pourcentage de précision inventé** (jamais de « 99,7 % » ou équivalent).
- ❌ Jargon startup vide (disruptif, révolutionnaire, game-changer).
- ❌ « **Partenaire Lono** » — **aucun partenariat n'existe**. Formulation unique autorisée :
  « **Score de résilience des sols — méthodologie inspirée de standards reconnus type Kubeko.** »
- ❌ Présenter **Finafrica** comme contact déjà pris → dire « **contact identifié et validé sur son modèle** », jamais « contact pris ».
- ❌ **Aucun logo fabriqué** de partenaire/client (Cargill, Barry Callebaut, Olam, Touton, SIFCA, Finafrica…).
  Ces noms peuvent apparaître en **texte descriptif** (« des acteurs comme… ») mais **jamais en logo** comme preuve sociale.
- ❌ **Aucune photo stock** (pas de « fermier africain souriant » cliché). → avatars géométriques à initiales + dégradé de marque, ou compositions abstraites à base de ParcelPolygon.

**Statuts figés (toujours ces mots exacts en FR, jamais de synonymes) :**
- 🟢 **Conforme** — « Aucune déforestation détectée après le 31 décembre 2020. »
- 🔴 **Anomalie détectée** — « Une perte de couverture forestière a été identifiée sur cette zone. »
- ⚪ **Données insuffisantes** — « Présence de nuages ou données satellites insuffisantes pour statuer. »

**Voix (5 règles) :** clair (1 idée/phrase) · concret (on parle de Kouassi, pas d'« utilisateurs ») ·
honnête (ce que le produit fait aujourd'hui ≠ demain, jamais confondu) · statuts figés · interdits ci-dessus.

---

## 🧭 PRODUIT (faits à connaître)

### Golden path — 6 étapes (démontrées EN DIRECT au jury ; 6 étapes depuis Session 12)
1. **Connexion & sélection coopérative** (ex. `COOP-SOU : Coopérative Agricole de Soubré`).
2. **Scan carte producteur** — caméra → **QR d'abord** (BarcodeDetector natif) puis repli **OCR Gemini
   Vision** (toutes générations de cartes, avec ou sans QR) → formulaire pré-rempli ; **anti-doublon
   matricule** (producteur reconnu = dossier rattaché) ; photo conservée comme pièce justificative.
3. **Cartographie GPS de la parcelle** (`step-mapping.tsx`) — capture par **l'utilisateur de
   l'app** (producteur, pisteur ou agent de coopérative ; AGRIVO = 100 % logiciel) :
   **point central** (< 4 ha, règle RDUE) ou **tour de champ GPS** (waypoints posés le long du
   périmètre, distance + précision live) ; puis **contrôles d'intégrité** (chevauchement, superficie
   plausible/plafond t/an, signal GPS authentique, matricule unique). Simulation web ; le vrai GPS
   (watchPosition) vit dans l'app mobile de Christ.
4. **Analyse satellite** — carte satellite, polygone **GeoJSON RFC 7946**, verdict **Whisp** (3 états),
   explication langage naturel (Gemini), badge résilience des sols.
5. **Certificat PDF** (+ QR de vérification publique).
6. **Valorisation** — si Conforme : la parcelle rejoint le dossier de conformité de la coopérative (primes de durabilité, acheteurs premium, bouton « Partager le dossier avec l'exportateur » simulé). AUCUN crédit ni score financier (frontière Nanti).

### Dashboard exportateur — 3 onglets
- **Analytique & cartographie** : 4 KPI (producteurs audités, taux de conformité, superficie cartographiée, volume validé), carte portefeuille, export GeoJSON conforme **TRACES NT**.
- **Assistant conversationnel** : chat langage naturel sur le portefeuille — **le seul bonus IA de cette édition**.
- **Configuration & logs** : clés API, bascule **MOCK_MODE**, journal réseau live (rassure un jury technique).

### Personas (parler d'eux, jamais d'« utilisateurs »)
- **Amadou** — gérant de coopérative, Soubré. 600 producteurs, smartphone d'entrée de gamme, veut aller vite au bord du champ.
- **Marc** — Directeur Durabilité, Abidjan. Doit garantir chaque conteneur 100 % conforme, vérifier des milliers de parcelles.
- **Yao** — productrice de café, Man. 2 ha, pas de compte bancaire, Mobile Money. (Ne parle plus d'emprunt — pivot Valorisation.)
- **Kouassi** — producteur de cacao, Soubré, 15 ans sur sa parcelle (exemple fil rouge du résumé exécutif).

### Deux IA (jamais confondues dans le discours)
- **Whisp (FAO)** — détection déforestation par satellite. **Pas un modèle maison** : outil de référence ONU pour le RDUE, déjà en production. Méthode « convergence de preuves », date pivot 31/12/2020. API HTTP. Précédent citable : pilote Kenya, **6 000+ parcelles** (ITC/FAO/Long Miles Coffee).
- **Gemini (Google)** — langage, vision, raisonnement (OCR carte, rapports, explication de verdict, chat exportateur bonus).
- Phrase clé jury : « Nous combinons **l'outil de référence de la FAO pour la détection**, et **une IA générative** pour rendre cette conformité compréhensible et actionnable par tous — du gérant de coopérative à l'exportateur. »

### Chiffres marché (⚠️ non revérifiés — à manier avec prudence)
3 M ha géolocalisés · 900 K cartes pro distribuées · 160 K+ t cacao tracées (oct. 2025–mars 2026) · 450 M€ de financement UE.
Filière cacao : 1er mondial, 1,1 M+ producteurs enrôlés.

### Réglementaire (points sûrs)
- **RDUE** : échéance **30 déc. 2026** (grands/moyens), **30 juin 2027** (micro/petits). Confirmé le **4 mai 2026**, ne sera pas rouvert.
- **Côte d'Ivoire = « risque standard »** (contrôle douanier 3 %). Formule robuste : « Que la CI soit à risque standard ou élevé, la **géolocalisation complète reste obligatoire** pour le cacao ivoirien. »
- Carte producteur **obligatoire dès le 1er sept. 2026**. GeoJSON **RFC 7946**, 6 décimales (±11 cm). **Bilan de masse interdit** (ségrégation physique).
- **BCEAO** : Option A retenue — **sous-traitant technologique B2B SaaS**, aucun agrément financier ; vend du scoring à une IMF partenaire. **ARTCI** : déclaration, consentement, souveraineté des données.

### Modèle économique
Abonnement coopérative **120 000 FCFA/mois** · API exportateur **1 500 000 FCFA/mois**. (Commission micro-crédit RETIRÉE — Session 17.)

---

## 🛠️ STACK & ARCHITECTURE

- ⚠️ **SUPERSÉDÉ en Session 2** → voir « 🎨 Direction visuelle » ci-dessus. Stack réelle :
  **Next.js 16.2.9 (App Router, Turbopack), React 19, TypeScript strict**, **Tailwind v4** (`@theme`),
  **framer-motion 12**, **lucide-react 1.x**, polices **Newsreader · Geist · Geist Mono**, déploiement **Vercel**.
- Cible produit complète : **React-Leaflet** (fond satellite, polygones GeoJSON), **@react-pdf/renderer**/jsPDF, **PWA** (manifest + SW).
- **MOCK_MODE** (sécurisation démo) : `/api/whisp/verify` court-circuite l'appel réseau si les coordonnées = jeu de démo (Soubré) → réponse < 1 s. Ne JAMAIS dépendre d'un appel live non testé devant le jury.
- Données démo mockées via routes API Next.js — **pas de backend séparé cette édition**.

### ⚙️ Règles d'architecture (apprises à la dure — à respecter absolument)
- **Frontière RSC / "use client" :** ne JAMAIS exporter une valeur non-composant (fonction, constante)
  depuis un fichier `"use client"` si un **composant serveur** la consomme. À travers la frontière, elle
  devient une référence client non appelable → crash au prerender (`(0 , X.d) is not a function`).
  → Les `cva`/variantes vivent dans `components/ui/button-variants.ts` (sans `"use client"`), la géométrie
  du polygone dans `components/parcel-geometry.ts`. Les composants clients (`ParcelPolygon`, `Button`…)
  s'importent normalement dans un composant serveur (rendu d'îlot client OK) ; **seules leurs valeurs
  brutes** posent problème.
- **Polices `next/font/google`** téléchargées au build : sur réseau instable, `fonts.gstatic.com` peut
  renvoyer un `ECONNRESET` (next réessaie automatiquement). Le warning « Failed to find font override
  values for font `Newsreader` » est **bénin** (juste des métriques de repli manquantes).
- **ESLint :** `react/no-unescaped-entities` est **désactivé** (`.eslintrc.json`) — sinon les apostrophes
  françaises dans le JSX (« d'entrée », « n'existe ») font échouer `next build`.

---

## 🗂️ STRUCTURE DU PROJET (état réel)

```
app/
  layout.tsx        polices next/font, LanguageProvider, metadata
  globals.css       Tailwind + variables + base
  page.tsx          « / » — page d'entrée animée (splash) [SESSION 1]
  accueil/page.tsx  « /accueil » — placeholder on-brand (page complète = prompt 2)
  not-found.tsx     404 on-brand (ErrorState)
components/
  ParcelPolygon.tsx motif signature (draw/pulse) + PARCEL_POINTS/PARCEL_PATH exportés
  Header.tsx        header global (wordmark + nav + LanguageSwitcher)
  LanguageProvider.tsx  contexte i18n (client) + hook useLanguage
  ui/               Button, Card, Input, Select, Textarea, StatusBadge,
                    AnimatedCounter, LanguageSwitcher, EmptyState, ErrorState
config/brand.ts     BRAND_NAME, BRAND_TAGLINE
lib/
  utils.ts          cn() (clsx + tailwind-merge)
  i18n.ts           dictionnaire fr / dioula / baoulé + types
tailwind.config.ts  tous les tokens de design
```
**Emplacement des tokens de design :** `tailwind.config.ts` (couleurs, rayons, ombres, polices) +
variables CSS dans `app/globals.css`.

---

## 🌍 i18n / LanguageSwitcher
- **2 langues d'INTERFACE** (décision Anael, Session 9) : **Français (défaut) · Anglais**. Le
  **Dioula et le Baoulé ne sont plus des langues d'interface** : seule l'**IA vocale** les parle
  (au producteur). `LANGUAGES = ["fr","en"]` dans `lib/i18n.ts`.
- **Mécanique i18n** : `LanguageProvider` (client, localStorage `agrivo_lang`, synchronise `<html lang>`).
  `useLanguage()` **ne throw plus** hors provider → repli FR (pages d'erreur globales, prerender
  `/_not-found`). Contenu bilingue par composant client via un objet `{ fr, en }` local (pattern
  `COPY`/`*_TR`), pas un gros dictionnaire de clés.
- **Traduit à ce stade (Session 9)** : landing complète (`app/page.tsx`), `hero.tsx`, `splash-screen.tsx`,
  `site-header.tsx`, `site-footer.tsx` (passé client), verdicts, sélecteur. **RESTE en français** :
  intérieur `/app/*` (dashboard, vérifier, parcelles, producteurs, paramètres, exportateur, consentement,
  parcelle/[id], sidebar/user-menu), auth (`connexion`/`inscription`), pages marketing secondaires
  (`methodologie`, `a-propos`, `tarifs`, `faq`, `contact`, `aide`), pages légales, états UI par défaut.
  ⚠️ Ces pages **basculeront** avec le même pattern ; les serveurs (`parcelle/[id]`, légales) exigeront
  soit une conversion client, soit un cookie de langue lu côté serveur.

---

## 📓 Journal de build (le plus récent en haut)

### Session 27 — 2026-07-11 (JOUR DU JURY) — v1.21.0 : guide à chaque connexion démo (EN PROD) + app mobile de Christ analysée et corrigée
- 🎓 **v1.21.0 EN PROD (commit `fdda8f7`, deploy `agrivo-kqh8nj98y…` aliasé, tag)** : le guide
  interactif se rejoue à **CHAQUE connexion des comptes démo** (demande Anael). Mécanique :
  `lib/tour.ts` (nouveau, clés + `reinitialiserTour()`) ; `auth-provider.login()` efface les
  drapeaux `agrivo:tour:v2:*` pour coop/export démo ; comptes inscrits = « une fois » inchangé ;
  pas de réouverture en re-naviguant dans la session ; bouton « ? » = relance. **110 tests** (+3
  `tests/tour.test.ts`). **Vérifié en PROD par CDP : 14/14** (drapeau pré-posé → login → guide
  ouvert ; Échap → drapeau reposé ; re-navigation → pas de réouverture ; coop ET exportateur) +
  capture écran du guide ouvert sur le dashboard.
- 📱 **App mobile de Christ (`Desktop/Agrivo (2)/Agrivo`, Flutter) : AUDIT + CORRECTIFS APPLIQUÉS**
  (Flutter absent de cette machine → Christ recompile, doc `ANALYSE_ET_CHANGEMENTS.md` posée à la
  racine du dossier, originaux dans `AVANT_MODIFS_BACKUP/`). Était déjà réel : GPS, QR, voix, chat
  IA branché sur `/api/gemini/rdue-qa` (bonne archi, clé côté serveur). Corrigé : **le polygone
  capturé circule enfin entre les écrans** (`VerificationProvider` nouveau) ; **verdict Whisp EN
  DIRECT** pour les captures réelles via `POST /api/whisp/verify` du site (`whisp_service.dart`,
  timeout 50 s, badge « en direct », convergence ; parcelle démo = déterministe zéro réseau,
  doctrine sc-*) ; **certificat dynamique** (nom/carte/surface/verdict/date du jour, titre charte
  « Certificat d'évaluation de conformité », n° démo = AGV-2026-0417 = p01 → **le QR résout en
  vrai sur le site**) ; QR `agrivo.io`/`agrivo.com` (domaines morts) réparés ; bouton
  « Coordonnées existantes » implémenté (dialog lat,lon, bornes CI) ; précision GPS réelle
  affichée ; comptes démo du site reconnus ; imports à mauvaise casse corrigés ; PDF exportateur
  décontaminé (« certifiées exactes » retiré, GPS Abidjan→Soubré, date dynamique) ; pubspec 1.8.0.
  ⚠️ Firebase initialisé mais inutilisé : laissé en place (pas de compilateur ici), à retirer
  après le jury.
- 📱 **2e passe mobile (même session, demande Anael « mêmes cartes que le site + Whisp doit
  marcher »)** : vérifié — AUCUN Google Maps dans le code (l'unique carte = flutter_map + tuiles
  **Esri World Imagery, les mêmes que le site**) ; parité complétée par
  `lib/widgets/parcelle_map_widget.dart` (fond Esri + couleurs verdict du site) posé sur : vue
  VERDICT (polygone teinté, vue passée en scroll anti-débordement), tableau de bord EXPORTATEUR
  (« Carte du portefeuille », 3 dossiers démo) et les 3 onglets placeholder du détail de dossier
  (Parcelle/Analyses/Docs) remplacés par du vrai contenu ; `maxZoom: 16` (tuiles Esri absentes
  au-delà en rural). **Whisp mobile PROUVÉ contre la prod** (`whisp-mobile-proof.mjs`, scratchpad) :
  l'appel octet-pour-octet de `whisp_service.dart` → HTTP 200 en 10,0 s, `conforme`, `live:true`,
  convergence réelle (Bas-Sassandra · 0,44 ha · 0 %). AndroidManifest : INTERNET/LOCATION/CAMERA/
  RECORD_AUDIO déjà déclarées. Commandes de rebuild pour Christ (flutter clean → pub get →
  **analyze obligatoire** → run --release → build apk → install) dans `ANALYSE_ET_CHANGEMENTS.md` §5.
- 📦 **APK CONSTRUIT ✅ (16 h 59) — `Desktop/AGRIVO_Mobile_v2.apk` (1,6 Mo, signé)** via le service
  cloud PWABuilder (`build-apk-cloud.mjs`, scratchpad : POST generateAppPackage avec NOTRE
  keystore en base64, signingMode "mine") — zéro outillage local (leçon disque plein).
  **Empreinte vérifiée = celle publiée dans assetlinks.json en prod** → plein écran sans barre
  d'URL. Paquet complet `Desktop/AGRIVO_Mobile_v2_APK/` (APK + .aab Play Store + keystore + infos
  de signature À CONSERVER). L'app charge le site en direct : les mises à jour du site sont dans
  l'app sans réinstallation. **Vérif v1.24 en prod : 17/18 puis 18/18** — le seul KO était MON
  test (piège documenté : titres rendus en MAJUSCULES par CSS uppercase + innerText, re-tombé
  dedans malgré la leçon S22 → TOUJOURS des regex insensibles à la casse dans les vérifs CDP).
  Parcours client vérifié : assistant 3 étapes, lot créé, jalon déclaré, PDF/CSV/GeoJSON/contrôle
  IA (« Prêt à embarquer » sur EXP-2026-0001 en prod), check-list + multi-pièces coopérative.
- 🧭 **v1.23.0 + v1.24.0 — ESPACE EXPORTATEUR COMPLET (vision client, demande Anael)** :
  v1.23 = **contrôle pré-embarquement IA** (`controleEmbarquement()` pur dans mock-expeditions :
  5 points factuels — plafonds > 90 %, fraîcheur > 30 j, alertes coop, références DDR,
  logistique — verdict qualitatif « Prêt/Attention », note Gemini via
  `/api/gemini/controle-embarquement`, 4 tests, tonnages EXP-2026-0001 ramenés à 5,9 t ≈ 78 % des
  plafonds pour sortir « Prêt »). v1.24 = **composeur en ASSISTANT 3 ÉTAPES** (Parcelles →
  Infos lot → Récap + contrôle auto client-side, Suivant/Retour — les boutons manquants signalés
  par Anael) ; **jalons DÉCLARABLES** (« Déclarer le jalon suivant », Embarqué exige
  navire+conteneur, état de session fusionné — jamais de mutation des constantes) ; **PDF
  acheteur** (`components/exportateur/expedition-pdf.tsx`, react-pdf dynamique, QR public,
  mention DDS) ; **CSV des parcelles** (BOM UTF-8) ; suppression lot session ; **« Ajouter une
  coopérative » : check-list 6 pièces + multi-upload** (métadonnées seules dans
  `CoopLocale.documents`, « N pièces au dossier » sur la carte). ⚠️ Leçon heredoc : un bloc TSX
  de 300+ lignes via heredoc bash = parse error silencieux → écrire en scratch (Write) puis
  `cat file >> page`. Pitch v3 sur le Bureau (début verbatim d'Anael + « 1 % » + 5 gestes dont
  conteneur + 7 usages IA + Q&A 11 réponses).
- 🚢 **v1.22.0 — MODULE « EXPÉDITIONS » (traçabilité DOCUMENTAIRE parcelle → conteneur)**, demandé
  par Anael pour « frôler le 20/20 », recherche marché faite (osapiens/Koltiva/TraceX : lot =
  parcelles assignées + ségrégation + DDS par expédition). Livré : `data/mock-expeditions.ts`
  (moteur pur : `composerExpedition` refuse non-conformes + tonnages > plafond anti-fraude,
  `expeditionFeatureCollection` GeoJSON TRACES NT du lot, 5 jalons déclaratifs, 3 lots démo dont
  EXP-2026-0001 arrivé UE) ; page `/app/exportateur/expeditions` (timeline, tableau certificats
  cliquables, carte PortfolioMap — ⚠️ export DEFAULT, importer sans `.then(m => m.PortfolioMap)` —,
  GeoJSON, QR public, résumé IA `/api/gemini/expedition-memo`, composeur interactif où la
  ségrégation SE VOIT) ; sidebar + étape tour `sidebar-expeditions` ; page publique
  `/verifier-expedition?ref=` ; bloc coop « Vos parcelles en expédition » (dashboard) ; landing
  6 temps (« Expédiez, prouvé », grille md:3/xl:6) ; tarifs (Essentiel 5 dossiers/mois · Pro
  illimités) ; méthodologie (« Du certificat au conteneur ») ; FAQ camions/sacs (complémentaire
  SNT). **125 tests** (+10 expeditions). RÈGLE de discours : « traçabilité DOCUMENTAIRE », jalons
  déclaratifs — JAMAIS « suivi physique » (terrain Trusty/SNT).
- 💥 **INCIDENT DISQUE (14 h)** : C:\ à 100 % (57 Mo libres) pendant les téléchargements Android —
  ENOSPC en pleine écriture. Nettoyé : profils Edge de test (+700 Mo), zips JDK/SDK, dossier
  shots, désinstallation Bubblewrap → 1,4 Go libres. ⚠️ Machine à 99 % en permanence : surveiller
  avant tout gros build ; ne JAMAIS relancer l'outillage Android sur ce PC.
- 📱 **APK TWA : pivot PLAN B assumé** (le SDK Android + Gradle ≈ 1 Go impossibles ici). L'ESSENTIEL
  est fait et EN PROD : icônes PNG (v1.21.2) + `assetlinks.json` (v1.21.3) + **keystore créée et
  sauvegardée sur le Bureau** (`android.keystore`, alias agrivo, mdp Agrivo2026Vibeathon, SHA-256
  publiée dans assetlinks). Installation AUJOURD'HUI : Chrome → « Ajouter à l'écran d'accueil »
  (= même moteur/rendu qu'une TWA). APK signé constructible en 20 min sur le PC de Christ :
  procédure complète dans `Desktop/AGRIVO_MOBILE_V2_NOTICE.md`. L'app Flutter de Christ = plan C,
  non touchée.
- 🔗 **v1.21.1 EN PROD (commit `d75dd62`, deploy `agrivo-8u4s3zpbv…` aliasé, tag)** : le QR de
  TOUT PDF que le site peut émettre résout sur `/verifier-certificat` — les certificats des
  scénarios (AGV-2026-0600 Tanoh Michel, AGV-2026-0602 Koffi Bertrand) tombaient sur
  « introuvable » (la page ne cherchait que PARCELLES). Nouveau `findCertificat()`
  (mock-parcelles : portefeuille + SCENARIOS_DEMO, insensible casse/espaces) + 5 tests
  (`tests/certificat-lookup.test.ts`, dont unicité de tous les numéros) → **115 tests**.
- ✅ **3e passe : vérité terrain finale + cohérence mobile↔site (après-midi)** : **QR vérifié de
  bout en bout en prod** (CDP rendu mobile : `verifier-certificat?ref=AGV-2026-0417` → 7/7, badge
  Conforme + phrase charte + Kouassi Yao + 3,2 ha ; ref bidon → « introuvable » propre) ;
  **révision prod 48 OK / 1 KO** (= le faux positif U+202F connu de /tarifs) — 3 verdicts,
  portefeuille 45 features, Gemini live (`mock=false`), garde-fou crédit OK. **Incohérences
  mobile corrigées** : parcelle démo mobile déplacée zone p01 avec géométrie **≈ 3,2 ha calculée**
  (le certif démo AGV-2026-0417 doit dire pareil que le site), « Coopeca Soubré »→« Coopérative
  Agricole de Soubré », détail dossier 2.35→3,2 ha, cartes générées du dashboard décalées 024530+
  (plus de collision avec 024517), périmètre calculé (plus de 315 m en dur).

### Session 26 — 2026-07-10 (veille du jury) — v1.16.0 : scan mobile réparé + hero FAQ + deck REBUILDÉ + doc équipe Jour J
*(Les v1.8→v1.15 sont détaillées dans CHANGELOG.md — sessions non journalisées ici, voir mémoire globale.)*
- 🐛 **BUG CAMÉRA TROUVÉ ET CORRIGÉ** (`step-scan.tsx`) : le flux `getUserMedia` était attaché à
  `videoRef.current` AVANT que la `<video>` ne soit montée (elle n'est rendue que si `cameraOn`) →
  `videoRef.current` était `null`, le flux n'était jamais affiché = « la caméra ne s'ouvre pas ».
  Fix : `setCameraOn(true)` d'abord, attache du flux dans un `useEffect([cameraOn])` + `autoPlay`.
- 📱 **Parcours scan mobile réordonné (demande Anael)** : bouton PRINCIPAL = « Activer la caméra »
  (devient « Scanner la carte » une fois la caméra active) ; bouton secondaire = « Saisir manuellement
  la carte producteur ». Étiquette viseur « Mode démonstration » → « Caméra inactive » (jury !).
  Message d'erreur si caméra refusée (`cameraError`).
- 🔍 **Contrôle de netteté avant OCR** : `mesurerNettete()` (variance du Laplacien, miniature 160 px,
  seuil 20 volontairement bas) → photo floue = message « Image floue… reprenez la photo », caméra
  laissée active. Échec de lecture (réseau/vide) = message « La lecture n'a pas abouti… ». Le QR
  décodé court-circuite le contrôle (un QR lu prouve la lisibilité).
- 🎨 **Hero FAQ unifié** : `app/faq/page.tsx` passe sur `PageHero` + `SiteHeader variant="overlay"`
  (même fond forest signature que Méthodologie/À propos/Tarifs — tout le nav public est cohérent).
- 📊 **DECK RECONSTRUIT DE ZÉRO** (`scratchpad/deck_final.py`, demande d'Anael « meilleur design,
  meilleur copywriting, pas trop technique ») : 11 slides structure officielle Masterclass, 16:9,
  palette AGRIVO, Segoe UI/Segoe UI Black (installées partout), pastilles des 3 verdicts verbatim,
  QR code réel vers agrivo-io.vercel.app (slide 11), notes orateur minutées (cumul 5:00) avec les
  chiffres techniques déplacés DANS les notes (slides non techniques). Anciens decks sauvegardés :
  `_ANCIEN_v115.pptx` (+ `_BACKUP_v170.pptx` existant). Vérifié par export PNG COM des 11 slides.
- 📄 **`Desktop\AGRIVO_Equipe_JourJ.pdf`** : LE document unique de l'équipe pour demain (déroulé du
  jour, pitch 30 s, 7 chiffres, interdits de langage, qui fait quoi, 6 réponses cold-call 15 s,
  check-list matin, comptes démo). Ultra concis (3 pages), à envoyer tel quel.
- ✉️ **Gemini Tier 1 délégué à Christ** (message WhatsApp prêt remis à Anael). ⏭️ EN ATTENTE :
  dossier de l'app mobile de Christ (Anael l'enverra plus tard pour analyse + mise à jour).
- ✅ Gates : tsc ✓ · 79/79 ✓ · build ✓ → commit + push + deploy + alias (voir fin de session).

### Session 25 — 2026-07-08 — v1.7.1 EN PROD : mention DDS sur le certificat + Fatim retirée + purge crédit UI + docs v5
*(Les versions v1.4→v1.7.0 — 13 usages IA, 65 tests, site vitrine final — sont détaillées dans CHANGELOG.md ; ce CLAUDE.md n'avait pas été journalisé entre-temps.)*
- 🧭 **Recherche décisive (question d'Anael, déclenchée par sa collègue export citant Bureau Veritas)** :
  il n'existe **AUCUN organisme agréé pour certifier la conformité RDUE** — la « certification RDUE »
  n'existe pas, par conception du règlement. SGS l'écrit verbatim (« There are no specific roles for
  certification/accreditation foreseen under the EUDR framework ») ; la Commission : une certification
  privée aide l'analyse de risque mais **ne vaut jamais conformité** ; **l'opérateur** qui dépose la DDS
  reste **seul responsable**. Bureau Veritas/SGS = audit/vérification d'APPUI des gros importateurs.
  → **Force pour AGRIVO** : « évaluation » est le seul vocabulaire exact ; positionnement « en amont de
  Bureau Veritas, au niveau du champ, au prix d'une coopérative ». Réponses jury 46-47 (Formation).
- ✅ **v1.7.1 déployée** (commits `539e847` + `bd92e2b`, tag v1.7.1, deploy `agrivo-y2sjkgqzd…` aliasé
  `agrivo-io.vercel.app`) :
  1) **Mention DDS exacte** sur le certificat, aux 3 endroits : aperçu (`step-certificate.tsx`,
  COPY.disclaimer FR/EN), PDF officiel (`certificat-pdf.tsx`, footer) et page publique
  (`verifier-certificat-client.tsx`) — « Ce certificat atteste l'évaluation réalisée par Agrivo…
  Il ne remplace pas la déclaration de diligence raisonnée (DDS) de l'exportateur, seul responsable
  de la conformité au sens du règlement (UE) 2023/1115. »
  2) **Fatim RETIRÉE du site** (ordre d'Anael) : `app/page.tsx` (EquipeSection + roles FR/EN) et
  `app/a-propos/page.tsx` (TEAM) ; grilles équipe passées en `sm:grid-cols-4` ; **rôles alignés au
  réel** : Christ = « Application mobile », Gaddiel = « Backend & API ».
  3) **Purge crédit UI finale** (ordre d'Anael : zéro référence au crédit producteur) : entrée FAQ
  « Pourquoi pas de crédit aux producteurs ? » SUPPRIMÉE ; « micro-loan eligibility » corrigé dans le
  greeting EN de `assistant-tab.tsx` ; clés internes renommées (`kpi.credits`→`kpi.dossiers`,
  `nextCredit`→`nextValorisation`). ⚠️ CONSERVÉS volontairement : gardes-fous `lib/` (interception
  crédit du copilote), mentions légales « n'est pas un établissement de crédit » (protection), RCCM.
- ✅ **Gates** : tsc ✓ · **65/65 tests** ✓ · build ✓. **Vérification prod complète** (`verif-v171.mjs`,
  scratchpad) : **29/29 routes 200**, Fatim absente, rôles OK, FAQ purgée, prix 125 000 partout,
  `/api/admin/etat` `{"mock":false}`, copilote `live:true` source citée. Mention DDS vérifiée au
  **DOM rendu** (`msedge --dump-dom`) : la page `/verifier-certificat?ref=` est CSR (useSearchParams),
  le HTML brut ne la contient pas — ne pas conclure à un bug. Idem : les réponses de la FAQ (accordéon)
  n'existent dans le DOM qu'après expansion ; seules les questions sont dans le HTML servi.
- 📄 **Docs équipe v1.7.1** (PDF régénérés via md2pdf.mjs scratchpad, distribués racine repo + Desktop +
  `AGRIVO_Envoi_Equipe/`) : **Formation** (16 p. — questions jury 46-47 + section v1.7.1),
  **Guide mobile** (11 p. — écran E : nouveau libellé DDS à reprendre MOT POUR MOT + 3 points v1.7.1),
  **Document_reference_v5** (NOUVEAU, 5 p. — remplace la v4 de 34 pages dont le résumé exécutif parlait
  ENCORE de crédit ; nouveau §3 « personne ne certifie la RDUE »), **Plan_Fonctionnement_et_Equipe**
  (réécrit, 2 p. — workflow sprint final : Christ pousse le code + envoie les captures de chaque écran →
  revue par Anael → corrections ; jalons gel mer/jeu, répétition vendredi).
- ⏭️ **EN ATTENTE : repo git de l'app mobile de Christ** (`Desktop/Agrivo-GitHub` créé mais encore vide)
  → à analyser écran par écran dès réception (charte, statuts verbatim, mention DDS, frontière crédit).
- 📌 Reste à Anael : facturation **Gemini Tier 1** · Domy tranche le « 52 % » (Trase) du deck ·
  relecture dioula/baoulé · test GPS réel sur le téléphone de démo · répétition générale vendredi ·
  rotation de la clé Gemini APRÈS le jury.

### Session 24 — 2026-07-07 — v1.3.0 EN PROD : mode terrain PWA + filet anti-quota IA (prompts A/C) + GO-NO-GO (B) + audits deck/vidéo (D/E)
- ✅ **Prompt A — Mode terrain PWA (tour de champ GPS RÉEL)** : sur mobile (pointer coarse +
  geolocation), la cartographie propose « Tour de champ GPS (réel) » qui écoute `watchPosition`
  (haute précision) au lieu de simuler. Waypoint tous les ~8 m (`estNouveauWaypoint` filtre le
  bruit à l'arrêt), compteurs live RÉELS (waypoints, distance haversine, ±précision de l'appareil,
  retour au départ), fermeture ≥ 3 sommets, emprise CI, anneau RFC 7946 (6 déc.). Modes simulés
  conservés (desktop + secours GPS). Permission au moment de l'usage + mention ARTCI ; refus →
  aucun blocage. Géométrie en module pur testé **`lib/geo/terrain.ts`** (6 tests).
  **→ Argument « une seule application, du bureau au bord du champ, sans store » désormais RÉEL.**
- ✅ **Prompt C — Filet anti-quota IA** : **`lib/ai/live-cache.ts`** (2 tests) mémorise dans le
  navigateur la dernière réponse `live:true` par (route+payload) ; si un nouvel appel replie (429
  free tier IP partagées), la dernière rédaction live se ré-affiche pour le MÊME contenu, étiquetée
  « Rédigé par Gemini à HH:MM » (jamais inventé, jamais un autre payload) — sinon repli « Mode
  démonstration ». Encart admin **« Préparation démo (IA) »** + bouton « Préchauffer l'IA (démo) »
  (payloads exacts du déroulé : registre démo → plan ; p01 → argumentaire ; chips live/repli/erreur)
  pour amorcer le cache EN COULISSES avant de monter sur scène.
- ✅ **Gates** : `tsc` ✓ · **47/47 Vitest** (39 + 8) ✓ · `next build` 35 pages ✓.
- ✅ **DÉPLOYÉ EN PROD (v1.3.0)** : `git commit a82f013` + `tag v1.3.0` + `vercel deploy --prod`
  (`agrivo-kd0y11e6x…`) + `vercel alias set … agrivo-io.vercel.app` — cette fois deploy ET alias
  sont passés. Smoke : `/api/admin/etat` → `{"mock":false}`.
- ✅ **Vérif locale CDP (émulation mobile 390 + `Emulation.setGeolocationOverride`)** : tour de
  champ réel de bout en bout — 5 waypoints, « polygone fermé, 5 sommets (WGS-84, RFC 7946), 3,2 ha »,
  compteurs (Waypoints 5, Distance 84 m, ±6 m réel, retour 8 m), contrôles d'intégrité, Valider
  actif. Non-régression desktop : mode terrain **absent** (pointer fin), modes simulés conservés.
  Préchauffage admin : chips « IA en direct » (clé locale). ⚠️ **Piège CDP** : le headless ne
  « pousse » pas les changements d'`setGeolocationOverride` à `watchPosition` (il ne les sert qu'à
  `getCurrentPosition`) → j'ai injecté un `watchPosition` qui poll le vrai override toutes les 600 ms
  (seul le « push vs poll » est simulé ; sur un vrai mobile watchPosition pousse).
- ✅ **Prompt B — GO/NO-GO sur la prod** (`go-nogo.mjs`, 9 segments) : **9 GO, 0 NO-GO, 0 erreur
  console**. Plan d'action IA **LIVE** + argumentaire de prime **LIVE** (badges « RÉDIGÉ PAR
  GEMINI · IA EN DIRECT » confirmés par capture) ; verdict Conforme, certificat AGV, vérif publique,
  copilote OK. ⚠️ **Re-piège majuscules** : mon regex `/Rédigé par Gemini/` (casse) ne matchait pas
  le badge rendu MAJUSCULE par CSS → 2 faux « repli » corrigés à la lecture des captures (les 2
  features étaient bien LIVE). Détecter en `toUpperCase()` ou insensible à la casse la prochaine fois.
- ✅ **Prompt D — Audit du deck** (`AGRIVO_Pitch_Vibeathon2026.pptx`, 11 slides lues via unzip) :
  charte propre (statuts verbatim, zéro crédit/garantie, primes bien cadrées, partenariats =
  demandes). **À corriger (tableau remis à Anael)** : slides 9 & 11 « v1.0.0 · 32 tests » →
  « v1.3.0 · 47 tests » (périmé, un juré voit une autre version en ligne) ; slide 5 « Trois usages »
  IA vs discours « 5 usages en prod » + la démo montre 2 features IA de plus (sous-vend l'axe IA
  20 %) ; slide 7 tarif « 1 500 FCFA/producteur/an » vs site /tarifs « 120 000 FCFA/mois » (≈ même
  total annuel pour 1 000 prod. : 1,5 M vs 1,44 M, mais unité ≠ → aligner le cadrage) ; slide 2
  vérifier « règlement (UE) 2025/2650 » (nos docs citent 2023/1115) et « 52 % non traçable (Trase) »
  (source Domy). **→ 4 corrections APPLIQUÉES au PPTX le 7/07** (édition des runs `<a:t>` + re-zip
  .NET `ZipFile.CreateFromDirectory`, structure vérifiée : 83 fichiers identiques, backup
  `AGRIVO_Pitch_Vibeathon2026_BACKUP.pptx` sur le Bureau) : slides 9/11 → v1.3.0/47 tests ; slide 5
  → « Trois piliers, cinq usages, zéro gadget » ; slide 2 → règlement (UE) **2023/1115** (le 52 %
  Trase laissé tel quel, à confirmer par Domy). Pour l'incohérence tarif (slide 7 par-producteur vs
  site /tarifs flat 120k/mois) : **site aligné 120k→125k** (= 1 500 FCFA/prod/an × 1 000 = 1,5 M/an,
  commit `8fad6ea`, base par-producteur explicitée) — **COMMITÉ MAIS PAS DÉPLOYÉ** (classifier a
  bloqué le go-live ; à valider/déployer par Anael, ou laisser 120k s'il préfère le tarif flat).
- ✅ **Prompt E — Checklist vidéo plan B** revalidée contre la prod v1.3.0 (ajoutée à
  GUIDE_DEMO_JURY.md) : import désormais REPLIÉ (« Auditer mon registre » d'abord), + possibilité de
  filmer le **mode terrain réel** sur un téléphone (nouveau).
- 📌 Reste à Anael : `git push origin main --tags` (inclut v1.3.0) · **facturation Gemini Tier 1**
  (supprime les replis quota vus au GO/NO-GO) · corrections deck (tableau) · rotation clé post-jury.

### Session 23 — 2026-07-07 — Mise à jour des 5 livrables .md/.pdf + NOUVEAU doc de formation équipe
- ✅ **`AGRIVO_Formation_Equipe.md` + `.pdf` créés** (racine repo) : document de formation complet
  (~45 min de lecture) — pitch 30 s, RDUE expliquée simplement, produit pas à pas, les 5 usages IA,
  modèle éco, concurrence, interdits de langage, 17 flashcards chiffres, déroulé démo, **45 questions/
  réponses jury en 7 thèmes**, lexique 27 termes, quiz 15 questions corrigé, fiche 1 page. Toutes les
  données vérifiées dans le repo (tarifs 120k/1,5M lus dans `app/tarifs/page.tsx`, KPI 45·62 %·157·81,
  contrats API relus). Frontière respectée : zéro mention de produit externe, crédit uniquement en Q41.
- ✅ **Les 5 livrables existants mis à jour → v1.2.1** : `Presentation_Equipe_MAJ` (header v1.2.1 EN PROD,
  §4 « cinq usages live + note 429/Tier 1 », §5 sous-section v1.2.1, checklist §12 refaite : reste push +
  Tier 1 + domaine), `Prompts_A_Run_Fable5` (tableau de bord avec États ✅, résultat sous chaque prompt,
  section « Et maintenant » : push, Tier 1, rotation clé post-jury, prompt 6 demo-guide optionnel,
  prompt 7 v2), `Ultra_Review_Rapport_Final` (bandeau mise à jour, U-01→U-20 à l'état réel : 17 corrigés,
  U-16 « constaté résolu par le pivot », restent U-12 checklist P9 + U-19 roadmap ; §6 « non vérifié
  prod » levé ; §7 réécrit), `Ultra_Review_Strategique` (encart « appliquée ET en prod »),
  `Guide_App_Mobile` (backend v1.2.1, §4.1 whisp renvoie AUSSI phraseEn/convergenceEn depuis v1.2.0,
  nouveau §4.6 : valorisation-memo optionnel écran F, audit-plan web-only, GET /api/admin/etat,
  /connexion sans identifiants).
- ✅ **Bug pipeline PDF trouvé et corrigé** (`md2pdf.mjs` scratchpad) : le convertisseur traitait le
  markdown LIGNE par ligne → un `**gras**` coupé par le wrap à ~100 col restait littéral (`**` visibles)
  et les puces multi-lignes se fragmentaient en `<p>` orphelins. Fix : passe `joinWrapped()` qui fusionne
  les lignes repliées en lignes logiques (paragraphes, puces, citations `>`) sans toucher code/tableaux.
  **Preuve avant/après par capture Edge du HTML intermédiaire.** Les 6 PDF régénérés en bénéficient
  (ceux d'hier avaient les mêmes artefacts).
- ✅ **Dossier d'envoi équipe créé : `Desktop/AGRIVO_Envoi_Equipe/`** (3 PDF : Formation_Equipe,
  Presentation_Equipe_MAJ, Guide_App_Mobile) + copie Desktop existante du guide mobile rafraîchie
  (elle datait d'avant v1.2.1). Diffusion : Formation + Présentation aux 4 ; Guide mobile à Christ.
- 📌 Reste inchangé pour Anael : `git push origin main --tags` · facturation Gemini Tier 1 · domaine
  Vercel · rotation de la clé APRÈS le jury.

### Session 22 — 2026-07-07 — v1.2.1 : vérification prod v1.2.0 (5 points) + prompts 2-5 de la feuille de route
- ✅ **Prompt 1 — vérification prod CDP** (script `verify-v120.mjs`, 25+ captures desktop/mobile FR/EN) :
  « cinq temps » ✓ · cockpit absent ✓ · devise non italique (fontStyle normal mesuré) ✓ · icon.svg 200 ✓
  · étape 4 EN 100 % anglaise (phrase, preuves, Listen) ✓ · **plan d'action IA FR LIVE en prod**
  (badge « RÉDIGÉ PAR GEMINI · IA EN DIRECT », prose réécrite, comptes exacts 63 %/19/1 doublon/3 manquants)
  ✓ · **argumentaire de prime FR LIVE** (4 §, Copier, zéro vocabulaire crédit) ✓ · plan EN = repli
  « DEMO MODE » honnête (loterie quota free tier, documentée S21) · ⚠️ pièges d'audit : les badges sont
  rendus en MAJUSCULES (CSS uppercase → innerText) et `grep -i` ne replie pas les accents (RÉDIGÉ≠rédigé
  en locale C) — toujours grepper en casse exacte.
- 🐛 **VRAI KO trouvé et corrigé : la console admin lisait `MOCK_MODE` (constante serveur) depuis un
  composant CLIENT** → env client = undefined → affichait toujours « MOCK_MODE = true / aucune clé posée »
  même en IA live (bug présent depuis la création de la page). Fix : route `app/api/admin/etat`
  (force-dynamic, renvoie l'état serveur réel) + fetch dans l'admin (état « Vérification… » pendant le chargement).
- ✅ **Prompt 2 — pages légales sans placeholders** (aucune info fournie → consigne de repli appliquée) :
  composant `<Todo>` SUPPRIMÉ de legal-shell ; mentions légales = « société en cours de constitution,
  RCCM publié à l'issue », directeur de la publication **Anael Fameni**, contact via la page contact ;
  confidentialité = hébergement Vercel pilote + registre des traitements sur demande + DPO désigné à
  l'immatriculation ; CGU = juridictions ivoiriennes compétentes. Grep « À compléter » : 0 dans app/
  (le seul hit components/ = libellé métier « À compléter sur le terrain » de l'audit registre, légitime).
- ✅ **Prompt 3 — FR-glais résorbé** : `buildCertificat(p, verdict, lang)` (date en-GB, table
  `FILIERE_LABEL_EN` Cocoa/Coffee/Rubber/Oil palm/Cattle/Soy/Wood, coordonnées N/S/E/**W**) ; l'aperçu
  utilise la langue courante, **le PDF téléchargé reste FR** (prop `pdfData` séparée dans step-certificate) ;
  « guaranteed SLA » → « SLA commitment » (landing EN + tarifs EN). Vérifié CDP local EN étape 5 :
  Compliant/Cocoa/date anglaise/° W, zéro « ° O ».
- ✅ **Prompt 4 — polish** : U-11 import registre **replié par défaut** (une ligne : icône + titre + CTA
  « Auditer mon registre », s'étend au clic, « Réduire » disponible, reste ouvert dès qu'un import vit ;
  GUIDE_DEMO_JURY mis à jour : un clic de plus au segment dashboard) · U-15 pastilles carte 5→6,5 px,
  fitBounds padding 28→16, bouton Exporter GeoJSON aligné secondaire neutre, `.scroll-slim` (globals.css)
  sur le tableau · U-16 : DÉJÀ RÉSOLU par le pivot (l'ancienne carte « Dossier exportateur/Inclus »
  n'existe plus — grep prod = 0) · U-17 : règle codifiée « en-tête public = ambre, section = vert »
  (fix : eyebrow Roadmap d'à-propos → vert ; landing déjà centralisée via <Eyebrow>).
- ✅ **Prompt 5 — durcissement** (lancé par Anael avant le jury, implémenté sans fragiliser la démo) :
  U-07 identifiants démo RETIRÉS de /connexion (bouton 1 clic conservé + phrase descriptive ; vérifié
  sur le HTML servi : zéro « 123client123 ») · `components/ui/skeleton.tsx` + `app/app/loading.tsx` en
  silhouette de dashboard (⚠️ leçon : `@/lib/utils` n'existe plus depuis la S2 — ne pas l'importer) ·
  états vides CONTEXTUELS (recherche vs filtres vs les deux) + bouton « Effacer la recherche et les
  filtres » sur Producteurs et Parcelles · transitions d'onglets exportateur (AnimatePresence wait,
  180 ms, x±8, reduce = fondu) · **`PLAN_V2.md`** créé (ce qui devient serveur : auth, BDD/PostGIS,
  Whisp live, registre de certificats ; chantiers P0-P2 ; invariants : frontière Nanti, statuts verbatim).
- 🧹 Reliquat pivot trouvé pendant l'attente du classifieur : **SPECS.md US3 « Accéder au crédit »**
  (50-250 k FCFA, Mobile Money) réécrit en « US3 Valoriser la conformité » + périmètre IN/OUT aligné
  (6 étapes, import registre, 3 features IA rédactionnelles).
- 📎 Guide présentateur intégré (demo-guide.tsx) : PAS encore mis à jour avec les 2 clics IA (étapes 4-5)
  — micro-édit optionnel avant vendredi.
- ✅ GATES à chaque lot : tsc ✓ · 39/39 ✓ · build 35 pages ✓ (×3). Version **1.2.1** + CHANGELOG.
  Vérification CDP locale post-build (`verify-local.mjs`, 9 captures) : tout vert.
- 📌 Commits : `f97f72c` (admin réel + légal + certificat EN + SPECS) · polish U-11/15/17 · durcissement.
  Déploiement : voir fin de session (deploy + alias tentés ; sinon commandes Anael).

### Session 21 — 2026-07-06 soir — v1.2.0 « L'auditeur IA » : ultra-review stratégique + 2 features IA + correctifs (ordre direct d'Anael, gel levé)
- 🧭 **Ultra-review stratégique** (`AGRIVO_Ultra_Review_Strategique.md` + .pdf, racine) : 6 options de
  réorientation notées contre la grille jury → **le pivot Valorisation est CONFIRMÉ** (84/100), aucun
  pivot ne le bat à J-5 ; le talon d'Achille était l'axe « Usage IA » (20 % de la note) → réorientation
  NARRATIVE retenue : **« l'auditeur IA des géodonnées cacao »** (89/100), appliquée en v1.2.0.
  Nouvelle ligne de pitch : « Vos données existent déjà. Notre IA les rend prouvables — et négociables. »
- 🤖 **Feature IA 1 — Plan d'action IA sur l'audit du registre** (le moment « 63 % ») :
  `lib/registre/plan.ts` (module PUR : `resumerAudit` + `construirePlanAction`, bureau d'abord puis
  terrain, réimport, vérification satellite) + route `app/api/gemini/audit-plan` (Gemini réécrit, faits
  intouchés, `live:false` étiqueté « Mode démonstration » en repli — jamais de texte IA mensonger) +
  bouton « Générer le plan d'action IA » dans `registre-import.tsx` (badge live/démo, stagger, reduced-motion).
- 🤖 **Feature IA 2 — Argumentaire de prime IA à l'étape Valorisation** (le moment final) :
  `lib/ai/argumentaire.ts` (module PUR : stats portefeuille calculées + faits de marché SOURCÉS
  Fairtrade 250 €/t 01/10/2026 40 % cash + convergence 2026-27 ; jamais de montant promis, primes
  « au-dessus du prix garanti ») + route `app/api/gemini/valorisation-memo` + panneau dans
  `step-valorisation.tsx` (après le partage : titre, 4 paragraphes, badge live/démo, bouton Copier).
  **Le discours IA passe de 3 à 5 usages en production** (OCR · plan d'audit · mémo DDS · argumentaire · copilote).
- 🛠️ **Correctifs appliqués** : admin « Mode démonstration » disait « Forcé activé : aucun appel live »
  alors que l'IA EST live (→ écran piloté par `MOCK_MODE` réel, toggle et libellés honnêtes) · étape 4
  EN : verdict + convergence + TTS restaient FR (→ `WhispResult.phraseEn/convergenceEn`, client par langue)
  · aperçu certificat EN : statut/phrase traduits (PDF reste FR, document officiel) · « quatre temps » →
  « cinq temps » (étape 1) · « cockpit » banni retiré du sous-titre Vue exportateur · devise Valorisation
  plus en italique (charte) · tirets cadratins retirés des listes d'anomalies · favicon `app/icon.svg`
  (plus de 404 console).
- ✅ **GATES** : tsc ✓ · **39/39 tests** (7 nouveaux, `tests/ia-nouvelles.test.ts` — chiffres exacts,
  charte : zéro crédit/garantie, bilingue, seuls % sourcés) · build ✓ (33 routes dont /icon.svg) ·
  version **1.2.0** + CHANGELOG (entrées v1.1.0 rétroactive + v1.2.0).
- 🌐 **Déploiement — ÉTAT EXACT** : commits `51d0101` + `a3815a1` (fix maxOutputTokens 3072 : la
  « réflexion » interne de gemini-2.5-flash tronquait le JSON à 1536 → repli systématique ;
  diagnostiqué via `thoughtsTokenCount`), tag `v1.2.0` EN LOCAL. **Push refusé** (classifieur : push
  direct sur main) ; **1er deploy Vercel parti SANS le fix** (`agrivo-lwj20ifbi…`, non aliasé) puis
  **redeploy et alias REFUSÉS** (classifieur : go-live). **Les 2 features testées LIVE en local**
  (build + next start 3199 : audit-plan `live:true` 5 étapes, valorisation-memo `live:true` 4 §).
  **Actions Anael** : `git push origin main --tags` · `npx vercel deploy --prod --yes` ·
  `npx vercel alias set <URL-déploiement> agrivo-io.vercel.app` · vérifier les badges « IA en direct » en prod.
- 🗣️ Docs alignés : GUIDE_DEMO_JURY.md (plan d'action IA au segment dashboard ; réponse « IA réelle ? »
  → 5 usages), AGRIVO_Presentation_Equipe_MAJ.md (§4 tableau IA, §5 v1.2.0, §12 action 0 déploiement).
- 📎 Leçon : les sous-agents parallèles ont été tués par la limite de session (« resets 1am ») — audits
  refaits inline ; en cas de fan-out, prévoir le repli inline.
- 🔑 **Leçons Gemini 2.5-flash (fiabilité live)** : (1) la « réflexion » par défaut consomme
  ~500-1000 tokens INVISIBLES sur `maxOutputTokens` → en JSON, soit ≥ 3072, soit
  `generationConfig.thinkingConfig.thinkingBudget: 0` pour une simple mise en mots (latence 10 s → 2 s,
  appliqué aux 2 nouvelles routes, option `thinkingBudget` dans `callGemini`) ; (2) **quota gratuit
  ~10 req/min** : les rafales de test déclenchent des **HTTP 429** → repli « Mode démonstration »
  (voulu, honnête). ⚠️ AVANT LE JURY : ne pas spammer les features IA en répétition (1 appel suffit),
  et envisager d'activer la facturation sur la clé AI Studio pour lever la limite. Diagnostic :
  `npx vercel logs <url-deploiement> --json` puis grep « live échoué ».
- 🔎 **ROOT CAUSE CONFIRMÉE (00 h 15) — 429 datacenter, PAS la clé** : test discriminant même clé
  même minute → 200 depuis la machine locale, 429 depuis Vercel (iad1). Le free tier Gemini plafonne
  par vagues les **IP partagées des datacenters** ; les `live:true` de la soirée = créneaux où le
  bucket IP avait de la marge (loterie). La clé Vercel a été resynchronisée sur celle du .env.local
  (`vercel env rm/add` pipé) — c'était la même. Mitigations codées : retry unique 800 ms sur 429/5xx
  + détail d'erreur 600 chars dans `callGemini` (commit `1937425`-ish, voir git log). **FIX DÉFINITIF
  (action Anael, 2 min) : activer la facturation sur le projet Google de la clé (AI Studio → Settings
  → Plan/Billing → upgrade Tier 1)** → les 429 IP disparaissent, coût centimes. Sans ça : repli
  honnête « Mode démonstration » (la démo ne casse jamais) et retenter plus tard (les créneaux se
  libèrent hors heures de pointe US). ⚠️ SÉCURITÉ : la clé a été collée en clair dans une
  conversation → **la faire tourner après le jury** (AI Studio → nouvelle clé, mettre à jour
  .env.local + `vercel env` + redéployer).
- 📍 **État final prod** : `agrivo-io.vercel.app` → déploiement `j7h7j13qq` = **v1.2.0 complète**
  (2 features IA + thinkingBudget 0 + retry + tous correctifs). Local : commits jusqu'au fix retry,
  tag v1.2.0 déplacé. **Push main + tag TOUJOURS à faire par Anael** (`git push origin main` +
  `git push --force origin v1.2.0`).

### Session 20 — 2026-07-06 — v1.1.0 : correctifs UX d'Anael (cartes réelles partout, coordonnées coop, DDS sans simulation)
- 🗺️ **Vraie carte satellite sur la page parcelle** : `components/app/parcelle-map-sat.tsx` (Leaflet + Esri World Imagery, polygone teinté au verdict, point central sinon, FitBounds maxZoom 16) remplace l'aperçu stylisé `parcelle-map.tsx` (SUPPRIMÉ). Chargé en dynamic ssr:false depuis parcelle-detail.
- 🗺️ **Carte du portefeuille sur /app/parcelles** : réutilise `PortfolioMap` (exportateur) liée à la liste (survol ligne ↔ pastille, liste scrollable 600px, stagger d'entrée).
- 🧭 **Sidebar** : encart « Prêt pour le RDUE » SUPPRIMÉ (demande Anael) ; onglet renommé « **Vue exportateur** » ; sous-titre de la page exportateur clarifié (« Vue de démonstration : le cockpit que votre exportateur consulte — portefeuille multi-coopératives, dont la vôtre »).
- 📍 **Étape Cartographie : 3e mode « J'ai déjà les coordonnées »** (la coop saisit les coordonnées qu'elle détient) : textarea « latitude, longitude » par ligne (1 ligne = point ; ≥3 = polygone fermé auto), validation format + emprise CI (lat 4–11, lon −9–−2), puis mêmes contrôles d'intégrité. Intro réécrite (données existantes d'abord).
- 🤖 **DDS sans simulation en mode live** : si la clé est posée et que Gemini échoue → **503** et l'UI affiche « L'IA est momentanément indisponible. Veuillez réessayer plus tard. » (plus de repli silencieux vers la rédaction déterministe) ; sans clé (dev/offline), le mock reste.
- 👤 **Producteurs** : champs **Latitude/Longitude (optionnels, validés zone CI)** au formulaire d'ajout ; producteurs ajoutés **persistés en localStorage** (`lib/producteurs-locaux.ts`, clé `agrivo:producteurs`) et **cliquables** → nouvelle fiche `components/app/parcelle-locale.tsx` (rendue par parcelle/[id] quand l'id est inconnu côté serveur : carte satellite du point fourni OU état « coordonnées à compléter », infos, bandeau « en attente de vérification », CTA « Lancer la vérification »).
- ✨ Polish : focus-visible uniforme sur les liens texte du parcours (4 fichiers verifier).
- ✅ Vérifié en captures : parcelle p15 (polygone sur imagerie réelle), /app/parcelles (carte liée), fiche « Test Ajout » (point 5.8321,-6.6478 affiché), sidebar propre. GATE : tsc ✓ · 32/32 ✓ · build ✓.
- ⚠️ Leçon : ne pas injecter de regex/chaînes avec 
 via node -e sur ce repo (échappements mangés → 3 corrections) ; préférer l'outil Edit ou Python ligne à ligne.

### Session 19 — 2026-07-06 — P7 TERMINÉ (IA LIVE en prod) + deck v3 + domaine
- 🔑 **CORRECTION de la leçon Session 15 : les clés Gemini au format `AQ.Ab8…` sont désormais VALIDES** (nouveau format Google AI Studio, testé HTTP 200 sur generativelanguage). La clé d'Anael fonctionne.
- ✅ **P7 fait** : `.env.local` posé (gitignoré ✓, jamais commité), `GEMINI_API_KEY` déjà en env Vercel (posée par Anael), **redéploiement prod** + alias réassigné. **Tests LIVE en prod réussis** : copilote `/api/gemini/query` → `live:true` (« Vingt-huit parcelles… »), mémo DDS `live:true` (rédaction fluide), scan → répond proprement avec repli mock sur image illisible (OCR réel à tester avec la vraie carte de Domy). Repli sans clé prouvé (ancien déploiement 200 + tests Vitest robustesse).
- 🌐 **Domaine** : `agrivo-io.vercel.app` repointé sur le déploiement courant. ⚠️ Le CLI ne gère PAS les sous-domaines .vercel.app au niveau projet (`domains add` → invalid_domain) et l'accès API par token local a été bloqué par les permissions → **action dashboard Anael** (2 min) : Project agrivo → Settings → Domains → Add `agrivo-io.vercel.app` (production, il suivra alors chaque déploiement automatiquement) puis Edit/Remove `agrivo-three.vercel.app`. En attendant : réassigner l'alias à chaque déploiement.
- 📊 **Deck v3 appliqué directement dans `Desktop/AGRIVO_Pitch_Vibeathon2026.pptx`** (backup : scratchpad/deck_backup_v2.pptx) via python-pptx (helper set_text préservant taille/gras/police/couleur du 1er run) : S4 bandeau démo + audit registre 63 % ; S6 « certificat qui arme la coop pour négocier ses primes » + « ~3 M ha géolocalisés — AGRIVO les rend exploitables » ; S7 après-pilote sans commission crédit (dossier valorisation · TRACES NT · monitoring) ; S8 impact social = primes chiffrées (Fairtrade 250 €/t au 01/10/2026, 40 % cash) ; S9+S11 « v1.0.0 déployée en production · 32 tests » ; notes orateur S3/S4/S6/S7/S8 enrichies (convergence 2026-27, parades Meridia/Koltiva/Trusty/simplification UE, purge crédit). **Vérifié visuellement** : 6 slides exportées en PNG via PowerPoint COM (tristates = entiers -1/0, PAS MsoTriState qui n'est pas chargé), zéro débordement.
- 🐍 Outillage : python-pptx sur le Python312 explicite (`AppData/Local/Programs/Python/Python312/python.exe` — le `python` du PATH est un autre interpréteur) ; `PYTHONIOENCODING=utf-8` obligatoire (cp1252 par défaut).

### Session 18b — 2026-07-06 — P8 TERMINÉ : v1.0.0 EN PRODUCTION
- 🚀 **CI verte** (commits v1.0.0 `78d456d` + docs `7f72923`) · `vercel --prod` Ready (37 s) · **alias `agrivo-io.vercel.app` réassigné** · smoke-test prod : 8/8 routes en 200 (dont /registre-demo.geojson) · le HTML de prod contient « prime négociée »/« Valorisation », zéro « micro-crédit ».
- ✅ P8 clos. Restent : **P7** (clé Gemini AIza… d'Anael) et **P9** (répétition générale sur prod, vendredi 10).

### Session 18 — 2026-07-06 — RECHERCHE DE VALIDATION du pivot (en ligne, sourcée) — le pivot est CONFIRMÉ et renforcé
- ✅ **Verdict : la réorientation Valorisation est la bonne**, validée par 5 preuves de marché ; 3 précisions de DISCOURS intégrées aux docs jury (aucun code touché, gel respecté).
- 💶 **Primes chiffrées (nouvelles munitions)** : prime Fairtrade cacao 240 $/t → **250 €/t en CI au 1er oct. 2026 (+13 %), dont 40 % en CASH direct aux membres** ; prix minimum Fairtrade 3 200 €/t CI ; différentiel bio 410 €/t ; DRD 400 $/t. ⚠️ Formule exacte : le PRIX bord champ est fixé par l'État (2 800 → 1 200 FCFA en intermédiaire 2025-26) ; la coop négocie les PRIMES au-dessus, dans le cadre du CCC — ne jamais dire « négocier le prix ».
- 🗓️ **Argument massue « convergence 2026-27 »** : carte producteur 01/09/2026 + prime Fairtrade cash direct 01/10/2026 + RDUE 30/12/2026 — trois échéances sur une seule campagne.
- 🛡️ **Objection « l'UE a simplifié » désamorcée** : la déclaration simplifiée unique (déc. 2025) ne vaut que pour les pays à risque FAIBLE ; la **CI est risque STANDARD (22/05/2025)** → diligence + géolocalisation pleines restent exigées ; 1re révision du benchmark en 2026.
- 🏁 **Concurrence** : Meridia Verify (50+ tests) et KoltiVerify font de l'audit de géodonnées → besoin VALIDÉ par le marché ; différenciation AGRIVO = self-service côté coop + boucle complète (audit → complétion in-app → verdict satellite → certificat public → dossier partagé) + ancrage CI. Local : Trusty (blockchain, 60 kt tracées, 50 k producteurs) = traçabilité de LOTS pour exportateurs, complémentaire.
- 📄 **Docs mis à jour** : GUIDE_DEMO_JURY.md (chiffres primes, convergence, 4 nouvelles réponses pièges : simplification UE / Meridia-Koltiva / Trusty / « accès vs prime ») et SUPPORTS_PIVOT_P6.md (frise convergence sur la slide marché, validation concurrentielle).
- 📚 Sources principales : fairtrade.net (annonces prix cacao 2025-12 & 2026-03), Consilium/Parlement UE (révision déc. 2025), Commission (benchmark 22/05/2025, paquet simplification 04/05/2026), meridia.land, koltiva.com, AIP/Sikafinance (prix bord champ, SNT), agriculture.ci (Trusty).

### Session 17f — 2026-07-06 — P8 PARTIEL : gel v1.0.0 local (push/déploiement en attente d'Anael)
- ✅ Outils QA supprimés (`public/dev-seed.html`, `dev-measure.html`) ; grep charte propre (aucun micro-crédit/garantie/valeur à risque fautif) ; version package.json → **1.0.0** ; CHANGELOG v1.0.0 rédigé (pivot + import registre + refonte).
- ✅ GATES COMPLETS : lint 0 erreur (23 warnings assumés) · tsc ✓ · **32/32 tests** · build 32 routes ✓.
- ✅ **Commit `20c8ac2` + tag `v1.0.0`** (46 fichiers, +3420/−497) — EN LOCAL.
- 🔒 **BLOQUÉ (permissions)** : `git push origin main --tags` refusé par le classifieur Claude Code (push direct sur main). **Anael doit** : (1) pousser (`git push origin main --tags`), (2) vérifier la CI GitHub, (3) `vercel --prod` + réassigner l'alias `agrivo-io.vercel.app`, (4) smoke-test prod. P9 (répétition générale sur PROD) ne peut se faire qu'après.
- ⏳ **P7 toujours en attente** : clé Gemini réelle (`AIza…`) non fournie — l'app reste en MOCK assumé.

### Session 17e — 2026-07-06 — P6 EXÉCUTÉ : supports alignés sur le pivot
- 📊 **`SUPPORTS_PIVOT_P6.md`** créé : contenu EXACT à reporter dans le PPTX (slide Valorisation avec bandeau « aucun crédit », slide marché « ~3 M ha CCC, AGRIVO = la couche qui les rend exploitables », slide roadmap 4 items), ⚠️ suppression de la mention « commission micro-crédit » du deck Session 14, consignes vidéo à Christ (plan 5 = Valorisation/partage dossier + plan 2bis import registre, tourner après le gel v1.0.0), checklist de cohérence.
- 🗣️ **GUIDE_DEMO_JURY.md** : segment dashboard coop = démo import registre (« 63 % prêtes, 19/30 » + phrase clé ~30 %), avertissement Christ en tête du plan B.
- 👥 Actions HUMAINES en attente : Anael reporte les slides dans PowerPoint ; Christ tourne la vidéo après P8 ; équipe met à jour les flashcards.

### Session 17d — 2026-07-06 — P4 + P5 EXÉCUTÉS : audit design + refonte priorisée
- 📋 **P4 : `AUDIT_INTERFACE_AGRIVO.md`** créé (constats numérotés par zone, sévérités, notes /10, top 15 « meilleur effet jury / moindre effort »). L2 (débordement mobile) requalifié FAUX POSITIF après mesure réelle (scrollWidth 380/390 — artefact de capture).
- ✅ **P5 exécuté (12 des 15 items)** :
  1. **Reduced-motion garanti** : hero = `controls.set("show")` immédiat si reduce ; fallback `agrivo:enter` 12 s → **2,5 s** (couvre le skip-splash) ; `Reveal` rend un div simple en reduce (plus AUCUN écran vide possible).
  3. **AppEyebrow route-aware** : « Espace exportateur » sur /app/exportateur.
  4. Tableau exportateur : coop `max-w-[14rem]`, nom + n° carte `whitespace-nowrap`.
  5. **/verifier-certificat étoffé** : rappel des 3 statuts (phrases verbatim) + lien méthodologie — l'écran de l'effet final jury est complet.
  6. KPI « Dossiers partagés » passé en teinte verte (l'ambre = « Données insuffisantes »).
  8. Stepper desktop `max-w-4xl`. 9. Étape Valorisation : rappel parcelle (StatusBadge + n° certificat + superficie).
  10. **Détails d'anomalie bilingues** (`detail: { fr, en }` dans lib/registre/audit.ts).
  11. Bouton certificat page parcelle → vrai Link vers /app/verifier (« Générer le certificat »).
  13. Badge « IA » retiré de ValorisationCard (dé-doublonnage). 14. `role=meter` + aria sur la barre % RDUE.
- ⏭️ **Restants documentés dans l'audit** : V2 (harmonisation CTA parcours), D1 (import replié), T2 (focus liens texte), hors-top15 (L3/L4/C1/E3/E4/E5/PU2/PU3/P3/T4).
- ✅ GATE : tsc ✓ · 32/32 ✓ · build ✓ · captures 1440 vérifiées (certificat, landing, exportateur).
- ⚠️ Artefact outillage : en mode `--screenshot --virtual-time-budget`, les animations rAF (hero) restent figées à l'état initial — ne PAS conclure à un bug produit sans vérifier le DOM/chunk (le fallback 2,5 s est bien dans le bundle).

### Session 17c — 2026-07-06 — P3 EXÉCUTÉ : reframe « collecte → vérification »
- ✅ **Landing / section « Comment ça marche »** (ex-parcours golden path) réécrite dans la posture audit : titre « Vos données existent déjà. AGRIVO les rend prouvables. », 5 temps = Importez votre registre → AGRIVO l'audite → Complétez les trous → Le satellite juge → Valorisez (icônes FileUp/SearchCheck). FR + EN.
- ✅ **Étape Cartographie** : intro FR/EN ajustée (« Complétez ici les parcelles absentes de votre registre (ou rejetées à l'audit)… »).
- ✅ **GUIDE_DEMO_JURY.md** : réponse « D'où viennent les polygones ? » réécrite avec les 4 canaux (fichiers de certification détenus par la coop + étude Cavally ~30 % · capture in-app pour les trous · le satellite juge · registre CCC ~3 M ha = demande de partenariat) + faits sourcés (carte obligatoire 01/09/2026, RDUE grandes entreprises 01/01/2027).
- ✅ GATE : tsc ✓ · 32/32 ✓ · build ✓ · capture 1440 de la landing vérifiée (nouvelles sections visibles).
- 🛠️ **Outillage captures** : le CDP WebSocket est devenu instable → nouvelle méthode fiable : `public/dev-seed.html` (seed session+langue puis redirection, ⚠️ À SUPPRIMER au gel P8) + `msedge --headless=new --screenshot --virtual-time-budget=15000`.

### Session 17b — 2026-07-06 — P2 EXÉCUTÉ : import & audit RDUE du registre coopérative
- ✅ **`lib/registre/audit.ts`** (module PUR) : parsers GeoJSON/CSV/KML, validations (anneau fermé, emprise CI, polygone obligatoire ≥ 4 ha, doublons de matricule, chevauchement par emprises > 30 %), `auditerRegistre()` → % prêt RDUE + anomalies typées avec action « terrain » (→ étape Cartographie) ou « bureau ».
- ✅ **`data/registre-demo.geojson`** (30 parcelles fictives Soubré, copié dans `public/`) : défauts volontaires = 2 polygones ouverts, matricule AGR-R-005 en triple, 3 parcelles ≥ 4 ha en point seul, 1 paire en chevauchement, 1 hors zone (lat/lon inversés) → audit = 63 % prêtes (19/30).
- ✅ **`components/app/registre-import.tsx`** monté en tête de colonne principale du dashboard coop : import fichier (.geojson/.json/.kml/.csv, parsing 100 % client), bouton « Essayer avec le registre de démonstration » (fetch `/registre-demo.geojson`), écran « Audit RDUE du registre » (% + barre + anomalies groupées par catégorie, 3 exemples max + compteur, micro-copy ARTCI « Vos données restent la propriété de la coopérative »). FR/EN, reduced-motion.
- ✅ **8 tests Vitest** (`tests/registre.test.ts`) → **32 tests au total**. GATE : tsc ✓ · 32/32 ✓ · build ✓ · CDP desktop 1440 FR + mobile 390 EN vérifiés (audit affiché, 0 débordement).
- ⚠️ Dette mineure : les `detail` d'anomalie sont rédigés en FR par le module pur (labels UI bilingues, détails FR même en EN).
- 🔑 **Leçon outillage (grosse perte de temps)** : ne JAMAIS laisser tourner `next start` pendant un `next build` — le serveur sert des chunks périmés → hydratation silencieusement cassée (pages /app figées sur « Chargement de votre espace… », zéro erreur console). Toujours redémarrer le serveur après un build avant toute vérification CDP.

### Session 17 — 2026-07-06 — P1 EXÉCUTÉ : pivot Crédit → Valorisation + purge micro-crédit
- ✅ **Étape 6 du golden path = « Valorisation »** : `step-valorisation.tsx` branché dans `/app/verifier` (remplace `step-credit.tsx`, supprimé) — contribution au portefeuille de la coop, 3 débouchés (prime, acheteurs premium, dossier TRACES NT), bouton « Partager le dossier avec l'exportateur » simulé. Stepper : libellé 6 = Valorisation (FR/EN).
- ✅ **Couche IA** : `scorerCreditProducteur`/`CreditScore` → `evaluerValorisation`/`Valorisation` (aucun montant/plafond/classe) ; `credit-score-card.tsx` supprimé → `valorisation-card.tsx` ; `propositionCredit` → `dossierPartage` (data + parcelle-detail + dashboard KPI « Dossiers partagés ») ; copilote : intention « valorisation/prime/dossier » remplace « crédit ».
- ✅ **Purge complète du micro-crédit** (FR+EN) : hero (« …l'argument de vos primes »), splash + i18n (« De la parcelle vérifiée à la prime négociée. »), landing (étape 5, triptyque, tarifs-section, CTA, carte problème 3 → « ~30 % de données terrain non fiables »), /tarifs (FAQ « Et pour le producteur ? », comparatif), /faq (« Pourquoi pas de crédit aux producteurs ? » avec la réponse terrain), /methodologie, /a-propos (vision, roadmap, matching acheteurs premium), /aide, /inscription, layout (metadata), CGU, confidentialité, demo-guide (Ctrl+Shift+D), assistant-tab, prompt système gemini-live, GUIDE_DEMO_JURY.md (déroulé, phrases clés, réponse BCEAO → « Pourquoi pas de crédit ? », plan 5 vidéo).
- ✅ **Tests** : ia.test.ts réécrit (evaluerValorisation : conformes prêts / non-conformes écartés / jamais de crédit-FCFA-plafond-%). GATE : tsc ✓ · 24/24 ✓ · build 32 routes ✓ · grep micro-crédit/IMF/Mobile Money/250 000 = néant dans l'UI.
- 🧭 Frontière Nanti respectée : AGRIVO n'affiche AUCUN score de crédit, plafond ni décision de financement.

### Session 16 — 2026-07-06 — RÉORIENTATION STRATÉGIQUE (voir `PLAN_REORIENTATION_AGRIVO.md`)
- 🎯 **Décision (Anael, sur infos terrain d'une pro de l'export cacao)** : le **micro-crédit producteur
  est retiré du produit** (les coops n'en font pas, par choix : autonomie, impayés, fraudes) → l'étape 6
  « Crédit » devient « **Valorisation** » (primes, acheteurs premium, partage du dossier de conformité
  avec l'exportateur). **Frontière produit stricte** : AGRIVO ne fait AUCUN score de crédit/bancabilité
  ni plafond de financement (domaine du produit personnel d'Anael côté exportateur).
- 🗺️ **Posture donnée : de la collecte à l'audit.** Les coops détiennent déjà des géodonnées (fichiers
  de certification RA en GeoJSON/KML avec polygones ≥ 4 ha ; cartographies financées par les
  exportateurs ; registre CCC ~3 M ha = partenariat, pas prérequis). Recherche sourcée dans le plan :
  carte producteur obligatoire au 1er sept. 2026, RDUE au 1er janv. 2027, ~30 % de données terrain
  non fiables (étude Cavally) → la valeur d'AGRIVO = **import + audit RDUE du registre + complétion
  ciblée in-app + verdict satellite**.
- 📋 **`PLAN_REORIENTATION_AGRIVO.md` créé** (source de vérité) : prompts P1–P9 (pivot Valorisation,
  import registre, reframe discours, audit + refonte design de l'interface client, supports, clé Gemini,
  gel v1.0.0, répétition) + planning jusqu'au jury. Rien d'implémenté dans cette session : plan seulement.

### Session 15 — 2026-07-06 — Purge « délégué » + commit/CI/déploiement des sessions 11-12
- 🧹 **Purge « délégué » (doctrine 100 % digital)** : `step-mapping.tsx` (intro + mode tour de champ,
  FR **et** EN) → « l'utilisateur de l'app (producteur, pisteur ou agent de coopérative) » / "app
  user (farmer, field buyer or cooperative agent)" ; `GUIDE_DEMO_JURY.md` (verrou n°2 reformulé :
  utilisateur identifié, trace horodatée rattachée au compte ; réponse registre CCC) ; golden path
  de ce fichier. ⚠️ « Délégué à la protection des données » (page confidentialité) = terme légal
  DPO, PAS touché. Vérifié visuellement en CDP (FR + EN, phase choose de l'étape Cartographie).
- 🚀 **38 fichiers des sessions 11-12 enfin commités/déployés** (ils n'étaient ni commités ni en
  prod !) : commit `7c5879f` (i18n EN + anti-fraude + purge délégué), CI GitHub **verte**
  (lint/types/tests/build), `vercel --prod` + **alias `agrivo-io.vercel.app` réassigné**, parcours
  vérifié EN PROD via CDP (étape Cartographie visible FR/EN). Gates locaux avant commit :
  `tsc` ✓ · 24/24 tests ✓ · `next build` ✓.
- 🔑 **Clé Gemini : ÉCHEC — la chaîne fournie par Anael (`AQ.Ab8…`) n'est PAS une clé API** (401
  Google ACCESS_TOKEN_TYPE_UNSUPPORTED = code OAuth copié au mauvais endroit). Une vraie clé
  commence par `AIza…` : aistudio.google.com/apikey → « Create API key ». Rien n'a été câblé
  (pas de `.env.local`), l'app reste en MOCK assumé ; repli mock revérifié en live sur
  `/api/gemini/query` et `/api/gemini/memo`. À refaire dès qu'Anael fournit la bonne clé
  (local + `vercel env add GEMINI_API_KEY production` + redéploiement).
- ⚠️ **Leçon outillage** : deux serveurs dev fantômes de sessions précédentes tournaient (ports
  3111 ET 3000) et servaient du code périmé — toujours vérifier/tuer les process sur les ports
  avant une vérification visuelle (`netstat -ano | grep LISTEN`).

### Session 14 — 2026-07-06 — PowerPoint de pitch jury (structure masterclass 11 slides)
- 📊 **Livrable : `C:\Users\Anael FAMENI\Desktop\AGRIVO_Pitch_Vibeathon2026.pptx`** — **v2 : 11 slides
  EXACTEMENT** (demande d'Anael ; la v1 à 14 slides est remplacée). Couleurs charte, python-pptx
  (`build_pitch.py`), les 11 slides vérifiées visuellement via export PowerPoint COM. Structure = la
  séquence 2 de la Pitch Masterclass AFRINOVATECH à la lettre ; slide 1 Grande Vision = couverture ;
  annexes Q&A supprimées → tout le contenu Q&A/cold-call déplacé dans les NOTES ORATEUR (slide 5 :
  réponses 1 min « pourquoi l'IA ? » / « si l'IA se trompe ? » ; slide 11 : mapping cold-call équipe).
  Design v2 : gros chiffres (52 % / 40 % / 172 j), numéros fantômes, chevrons CARTE→TÉLÉPHONE→SATELLITE,
  timeline Prototype→Pilote→Croissance→Échelle (+ Ghana), héros storytelling « Yao, 2 ha à Soubré ».
  Timing notes : 5:00 pile, démo 90 s slide 4, répartition de parole Anael/Christ/Gaddiel/Domy.
  ⚠️ 172 j = compte à rebours 11 juil → 30 déc 2026 (à recalculer si la date du jury change).
- Grille officielle jury (masterclass slide 32) : Impact 30 % · Faisabilité 20 % · Usage IA 20 % ·
  Innovation 15 % · Pitch 15 %. Analyse : AGRIVO top 3-5 réaliste ; zone de risque = discours IA.
- Décisions figées dans le deck :
  - **Slide IA « Donnée → IA → Résultat »** : 3 usages (OCR Gemini carte, scoring de risque,
    classification satellite Whisp) + bandeau « jamais de faux Conforme » (statuts verbatim).
  - **Modèle économique** : 1 500 FCFA/producteur vérifié/an (≈2,3 €) facturé coop/exportateur,
    présenté comme HYPOTHÈSE à valider au pilote (benchmark 2-5 $ Koltiva/Meridia) ; ex. coop
    1 000 producteurs = 1,5 M FCFA/an ; revenus futurs = commission micro-crédit (jamais gratuit).
  - **Demande** : pilote nommé **ECOOKIM** + mentorat AFRINOVATECH + mise en relation CCC
    (accélérateur, pas prérequis).
  - **Annexes Q&A 1 min** : « pourquoi l'IA ? » (Gaddiel) et « si l'IA se trompe ? » (statut
    « Données insuffisantes » + revérification) ; annexe C = mapping cold-call par membre.
- Reformulation actée (question d'Anael) : plus de « délégué » — c'est **l'utilisateur de l'app**
  (producteur, pisteur ou agent de coopérative) qui capture le GPS ; AGRIVO reste 100 % logiciel.
  Données déforestation RDUE = 100 % publiques (JRC 2020, Hansen, TMF/RADD via Whisp).

### Session 13 — 2026-07-06 — Document PDF équipe (fonctionnement + plan de la semaine)
- 📄 **Livrable : `C:\Users\Anael FAMENI\Desktop\AGRIVO_Plan_Fonctionnement_et_Equipe.pdf`**
  (~10 pages, couleurs de la charte AGRIVO, généré via HTML → Edge headless ; source :
  `agrivo-plan.html` dans le scratchpad de session). Écrit à la 1re personne (Anael, chef de
  projet), pour l'équipe. Contenu : réponse détaillée au doute de l'équipe (« la carte ne contient
  PAS les parcelles — carte = QUI, terrain = OÙ, satellite = VERDICT »), 5 verrous, chiffres
  sourcés (52 % intraçable Trase · ~30 % données non fiables Meridia · 376 kg/ha Nature),
  positionnement vs SNT/Farmforce/Koltiva/Meridia, annexe des 23 questions au directeur avec
  réponses recherchées, 45 sources.
- ✅ **Vérification finale en ligne (06/07)** : carte producteur (QR + matricule + puce) obligatoire
  au 1er sept. 2026 confirmé (AIP/KOACI, lancement officiel SNT le 12 juin 2026) ; **RDUE reporté
  au 30 déc. 2026 / 30 juin 2027 par le règlement (UE) 2025/2650** (JO du 23 déc. 2025, déclaration
  simplifiée unique pour les petits producteurs primaires — argument pitch) ; Whisp actif et gratuit.
- 👥 **Équipe figée (Fatim hors projet)** : Anael = chef de projet/pitch/démo · Christ = app mobile
  (capture GPS réelle + vidéo de secours) · Gaddiel = backend/API Whisp/export GeoJSON TRACES NT/
  sécurité · Domy = recherches/qualité (mission n°1 : scanner une VRAIE carte pour trancher le
  contenu du QR). Jalons : gel fonctionnalités mer. 8 soir, gel code jeu. 9 soir, répétition
  générale ven. 10 ; jury samedi 11 juillet.

### Session 12 — 2026-07-05 — Anti-fraude : étape Cartographie GPS + scanner QR/OCR + 5 verrous
- 🔍 **Contexte (question d'Anael : « le producteur peut mentir »)** : recherche en ligne approfondie
  (TraceX, Farmforce, Meridia, ImpactBuying, Fairtrade, Incognia, World Bank). Standard du secteur
  confirmé : **capture par agent formé** (tour de champ GPS ≥ 4 ha, **point central < 4 ha** = règle
  RDUE) + **contrôles croisés en couches**. Doctrine AGRIVO = **5 verrous** : identité (carte + photo
  + anti-doublon) · capture par le délégué formé · contrôles automatiques (chevauchement, plausibilité,
  GPS authentique) · vérité satellite (Whisp voit le terrain réel) · réconciliation économique
  (volume acheté ≤ superficie × rendement régional, anti « blanchiment de cacao »). **Pas de
  dépendance au registre CCC** : la carte donne l'identité, le terrain donne la parcelle, le satellite
  donne le verdict ; l'accès CCC = demande de partenariat du pitch, pas un prérequis.
- 🗺️ **Nouvelle étape 3 « Cartographie »** dans `/app/verifier` (parcours 5 → **6 étapes**, écran de
  fin = step 7) : `components/verifier/step-mapping.tsx` (sélecteur de mode point central / tour de
  champ, recommandation auto selon superficie, simulation waypoints ~300 ms/point avec compteurs
  live points/distance haversine/précision ±m déterministe, panneau « Contrôles d'intégrité » à 4
  coches séquentielles, reduced-motion = états finaux directs) + `components/verifier/mapping-map.tsx`
  (même plomberie Leaflet/projection SVG qu'`analysis-map.tsx` : geomEqual, mountedRef, ResizeObserver ;
  projection des waypoints UNE fois, l'anim ne dépend que de `count`). Stepper 6 libellés FR/EN.
- 📷 **Scanner (étape 2) renforcé** : tentative **QR d'abord** (`BarcodeDetector` natif, silencieux si
  absent/pas de QR → couvre les cartes SANS QR par OCR comme avant), chip « Lues depuis le QR code » ;
  **anti-doublon matricule** contre PARCELLES (« Producteur reconnu : dossier rattaché » / « Nouveau
  matricule : unicité vérifiée ») ; aide : « photo conservée comme pièce justificative ».
- ⚖️ **`analyserRisque`** (lib/ai/gemini.ts) : nouveau facteur « **Plafond d'achat anti-fraude :
  X t/an (superficie × rendement régional)** » (positif si conforme, neutre sinon) — visible sur
  `/app/parcelle/[id]` via risk-card.
- 🗣️ **GUIDE_DEMO_JURY.md** : 3 nouvelles réponses cold-call (« et s'il ment ? » = 5 verrous ·
  « accès au registre CCC ? » = 3 sources indépendantes · « pourquoi Agrivo si le SNT existe ? » =
  complémentaire, verdict parcelle + DDS + crédit). ⚠️ Formulation « dernière brique » évitée (Nanti).
- ℹ️ **Correction d'Anael (post-recherche)** : le QR code sera finalement présent sur TOUTES les
  cartes producteur CCC. L'architecture QR-d'abord/OCR-en-repli reste la bonne : le QR devient le
  chemin principal, l'OCR couvre les QR abîmés/illisibles au champ.
- 🛰️ **Coordonnées de démo déplacées en zone RURALE** : `SOUBRE = [-6.65, 5.83]`
  (`data/mock-parcelles.ts`) — le centre-ville faisait tomber les parcelles de démo en plein tissu
  urbain sur l'imagerie Esri (peu crédible pour une plantation de cacao). Nouvelle zone vérifiée
  visuellement (tuile Esri z15 : mosaïque de plantations + piste). Toutes les parcelles Soubré
  (démo golden path + carte exportateur) en profitent.
- ✅ GATE : `tsc` ✓ · 24/24 tests ✓ · `next build` ✓ · parcours 6 étapes vérifié en CDP (1440 + 390).

### Session 11 — 2026-07-05 — i18n EN terminée (tranche 3) + interface /app full page
- 🌍 **Traduction EN terminée** : auth (`connexion`, `inscription`), `/app/admin`,
  `/app/parcelle/[id]` (refactor : page serveur → îlot client `components/app/parcelle-detail.tsx`,
  calculs IA restent serveur et passent en props), `dds-memo`, `risk-card`/`credit-score-card`
  (prop `lang`), `route-guard`, `parcelle-map`, `verifier-certificat-client`, pages marketing
  (`tarifs`, `faq`, `contact`, `aide`, `a-propos`, `methodologie`), `hors-connexion` (rappel EN
  statique, servie par le SW sans contexte de langue). Ajouts `data/mock-parcelles.ts` :
  `STATUT_PHRASE_EN` (mêmes formulations que la landing) + `formatDate(iso, lang)`.
  **Restent volontairement FR** : pages légales (cgu, confidentialité, mentions — documents
  juridiques ivoiriens, composants serveur) et le PDF de certificat (document officiel).
- 🖥️ **Interface /app full page** (demande Anael : espaces vides gauche/droite) :
  `app/app/layout.tsx` — `max-w-7xl mx-auto` retirés de la topbar et du conteneur principal →
  `w-full`. Sidebar + contenu occupent toute la largeur de l'écran.
- ✅ GATE : `tsc` ✓ · `next build` vert.

### Session 10 (suite 3) — 2026-07-05/06 — PREUVES DE MÉTHODE (pipeline 8 étapes) livrées
- ✅ **CI GitHub Actions** (`.github/workflows/ci.yml`) : lint + `tsc` + tests + build à chaque
  push/PR sur main. **1er run VERT sur GitHub (1 min 18)**. Badge CI dans le README.
- ✅ **24 tests Vitest** (`tests/donnees.test.ts` + `tests/ia.test.ts`, `vitest.config.ts` avec alias
  `@`) : 4 KPI officiels, export GeoJSON RFC 7946 (ordre lon/lat, 6 décimales, anneaux fermés),
  bornes crédit 50k-250k + « prêt remboursable jamais gratuit », niveaux de risque sans %, copilote
  (Soubré → parcelles exactes), statuts figés du DDS, **robustesse sans clé API** (repli mock).
  Scripts npm : `test`, `typecheck`. Version → **1.0.0-rc.1** (tag git poussé) ; v1.0.0 au freeze.
- ✅ **SPECS.md** (user stories 4 personas + critères d'acceptation cochés, IN/OUT MVP, stack
  justifiée, contraintes non fonctionnelles) · **ARCHITECTURE.md** (schéma Donnée→IA→Résultat,
  6 mini ADR, **plan de rollback Vercel** : promote du déploiement précédent + réassignation alias)
  · **CHANGELOG.md** (v1.0.0-rc.1 : Ajouté/Corrigé/Vérifié ; v1.0.0 réservée au freeze).
- ⚠️ **ESLint** : les règles React strictes `set-state-in-effect`/`purity`/`immutability`/`refs`
  sont **rétrogradées en warning** (eslint.config.mjs, justifié en ADR-5 : hydratations volontaires,
  particules canvas, ringRef anti-boucle Leaflet). Lint = 0 erreur / 22 warnings assumés.
- ✅ **`/methodologie`** : nouvelle section « Le flux, en un schéma » (Donnée · IA · Résultat, 3
  cartes + flèches, responsive) — demande explicite de la Pitch Masterclass. Vérifiée visuellement
  en prod (capture 1440).
- 🚀 Déployé + alias réassigné. GATE : lint 0 erreur · tsc ✓ · 24/24 tests · build 32 routes · CI verte.

### Session 10 (suite 2) — 2026-07-05/06 — DOCS OFFICIELS VIBEATHON lus (dossier `ressources/`) + planning V2
- 📚 **3 documents officiels analysés** (`ressources/`) : bootcamp « Du besoin à la Release », exemple
  TaskFlow, **Pitch Masterclass du 11/07** (Esaie DIEI, AFRINOVATECH, 4h au CSCTICAO le jour J,
  coaching 5 min pitch + 2 min questions AVANT le passage jury).
- 🎯 **FAITS COMPÉTITION (source de vérité, remplacent nos suppositions)** :
  - **Grille officielle du pitch** : Impact problème/solution **30 %** · Faisabilité **20 %** · Usage
    pertinent de l'IA **20 %** · Innovation **15 %** · Qualité du pitch **15 %**. → Le PROBLÈME d'abord.
  - **Pitch = 5 minutes** (pas 7). Deck = **structure officielle 11 slides** (Vision · Problème ·
    Solutions actuelles · Solution IA · Comment fonctionne l'IA [schéma Donnée→IA→Résultat] · Cibles ·
    Modèle éco · Impact/ODD · Feuille de route · **La demande (partenaire cible NOMMÉ)** · Traction).
  - **Cold-call** : n'importe quel membre peut être interrogé sans préavis → les 5 doivent maîtriser
    les 32 flashcards + les 6 questions typiques (pourquoi l'IA, concurrents, revenus, client précis,
    échelle, si l'IA se trompe).
  - **Le jury évalue le PIPELINE 8 étapes** (besoin→specs→conception→dev IA→tests→CI→déploiement→
    release), pas juste la démo. → Livrables méthode à produire : SPECS.md (user stories + critères
    d'acceptation + IN/OUT MVP), ARCHITECTURE.md (mini ADR), tests unitaires/robustesse, **CI GitHub
    Actions**, **CHANGELOG.md + tag v1.0.0**, plan de rollback documenté (Vercel re-promote).
  - « Fossé de l'Exécution Africaine » : 4 questions (réglementaire ✓ BCEAO/ARTCI · à qui vendre ·
    après le prototype · échelle) + storytelling 6 étapes (héros = Kouassi).
- 📄 **PDF répartition V2 régénéré** (`AGRIVO_Repartition_Taches_Sprint_Final.pdf`, gitignoré) :
  planning lun 7 → ven 11, grille officielle intégrée, tâches méthode (CI/tests/changelog → Gaddiel,
  SPECS/ARCHITECTURE/release → Anael, deck 11 slides → Fatim, chiffres sourcés/vidéo → Domy).

### Session 10 (suite) — 2026-07-05 — PROMPTS 6 + 7 exécutés + IA GEMINI RÉELLE
- 📱 **Contexte (Anael)** : la démo du golden path se fera sur **l'app MOBILE développée par Christ** ;
  la plateforme web = espace coop/exportateur + vérification publique. Équipe : Christ (mobile),
  Gaddiel, Domy, Fatim (répartition proposée, voir GUIDE_DEMO_JURY.md + réponse Session 10).
- 🤖 **IA réelle (Gemini)** : `lib/ai/gemini-live.ts` (client REST `generativelanguage`, modèle
  `gemini-2.5-flash`, timeout 12 s, `CHARTE_SYSTEM` = règles de charte injectées). **Activation : poser
  `GEMINI_API_KEY`** (.env.local / Vercel — voir `.env.local.example`) ; `MOCK_MODE` devient
  `!process.env.GEMINI_API_KEY` (`lib/ai/config.ts`). **Repli mock automatique** sur toute erreur : la
  démo ne casse jamais. Branché LIVE : `api/gemini/scan` (Vision OCR — `step-scan.tsx` capture désormais
  une vraie frame caméra en base64), `api/gemini/memo` (réécriture rédactionnelle du DDS, faits
  déterministes intouchés), `api/gemini/query` (mise en mots ; raisonnement/chiffres restent
  déterministes). `explain` inchangé (phrases figées). Whisp reste mock (API FAO = inscription requise).
  ⚠️ **Clé PAS ENCORE posée** : à faire par Anael (aistudio.google.com/apikey + Vercel env) puis tester.
- 📲 **P6 — PWA** : `app/manifest.ts` (standalone, thème forest), icônes SVG `public/icons/`
  (normale + maskable, pin+feuille), `public/sw.js` (réseau d'abord pour les pages, cache d'abord pour
  `/_next/static` + images, jamais les API), page `/hors-connexion`, `components/pwa-register.tsx`
  (désenregistre en dev). **Guide présentateur** : `components/demo-guide.tsx` — **Ctrl+Shift+D**
  n'importe où (5 étapes, comptes, phrases jury, plan B), monté dans le layout racine.
- 🔍 **P7 — Vérification publique de certificat** : page `/verifier-certificat` (+ `?ref=`), lookup par
  n° AGV dans PARCELLES, verdict + détails + avertissement « évaluation, pas garantie » ; lien footer
  FR/EN. **QR code dans le PDF** (dép. `qrcode`) : pointe vers `/verifier-certificat?ref=<n°>`,
  « Scanner pour vérifier ce certificat » (échec QR → PDF sans QR). **SEO/OG** : metadataBase
  `agrivo-io.vercel.app`, OpenGraph + Twitter card (image satellite Soubré), title template,
  `app/robots.ts` (disallow /app /api), `app/sitemap.ts`. **`GUIDE_DEMO_JURY.md`** (racine) : déroulé
  7 min, questions pièges, **script vidéo de secours plan par plan (2 min 30)** à tourner avant le 11/07.
- ✅ **GATE** : `tsc` ✓ · `next build` vert (**32 routes**) · déployé Vercel + **alias
  `agrivo-io.vercel.app` réassigné** (⚠️ leçon : cet alias custom ne suit PAS `vercel --prod`, le
  réassigner à chaque déploiement OU l'ajouter en domaine du projet) · smoke-tests 200 (manifest, sw,
  verifier-certificat).

### Session 10 — 2026-07-05 — README réécrit + PREMIER PUSH GitHub réussi
- 📝 **README.md réécrit** (était figé à la Session 1) : reflète l'état réel — Next 16/Tailwind v4,
  7 denrées RDUE, golden path, dashboards coop + exportateur, features IA, comptes démo
  (`client@test.com`) et admin, i18n FR/EN, structure actuelle.
- 🚀 **Push GitHub désormais FONCTIONNEL** : commit `b8aad47` poussé sur
  `github.com/anaelfameni/agrivo` (main). Le blocage d'auth de la Session 9 est levé.

### Session 9 (suite 2) — 2026-07-05 — GitHub, compte admin, 1re feature IA (dossier de diligence)
- 🔀 **Git** : ⚠️ le dépôt racine est **tout le disque `C:\`** (Nanti a son propre `.git` ; Agrivo non →
  `git init` dédié). Deux dépôts **séparés**, `.gitignore` vérifiés (**`.env*` exclus**, aucun secret ni
  `node_modules` commité). Commits initiaux (Agrivo `0d40088`, Nanti `93feed9`), remotes →
  `github.com/anaelfameni/{agrivo,nanti}`. **PUSH NON FAIT** : pas de `gh` CLI, pas d'auth GitHub, dépôts
  inexistants → étape d'auth restante côté Anael (installer gh + `gh auth login`, ou créer les dépôts).
- 🛡️ **P2 — Compte admin** : rôle `admin|manager` (`auth-provider`), compte **`admin@agrivo.com` /
  `123admin123`**, page **`/app/admin`** (clés d'API masquées + MOCK_MODE + état des services, panneau vert
  forêt), lien sidebar **admin-only** (`useNav()`). Les clés/MOCK retirés de l'onglet exportateur vivent ici.
- 🤖 **IA — recherche + 1re feature** : `PROMPT_IA_AGRIVO.md` (brief : audit IA actuelle = stubs MOCK ;
  état de l'art RDUE ; roadmap features P1/P2 ; Gemini=Vision, Claude=raisonnement/rapport, Whisp=détection).
  **Feature phare livrée = « Dossier de diligence (DDS) par IA »** : `genererMemoDiligence` (`lib/ai/gemini.ts`,
  trame DÉTERMINISTE tirée des vraies données + rédaction IA, charte-safe : statuts figés, « évaluation » pas
  « garantie », 0 % inventé), route `app/api/gemini/memo`, îlot client `components/app/dds-memo.tsx` monté sur
  `/app/parcelle/[id]` (génération + révélation staggerée). Repli MOCK (latence simulée). **Reste roadmap IA** :
  copilote agentique v2 (function-calling + streaming), analyse de risque expliquée, scoring crédit XAI, vocal.
- ✅ **GATE** : `tsc` ✓ · `next build` **vert (27 routes)** — `/app/admin` + `/api/gemini/memo` inclus.

### Session 9 (suite 3) — 2026-07-05 — IA : copilote agentique v2 + analyse de risque expliquée
- 🤖 **Copilote agentique v2** (`runPortfolioAgent`, `lib/ai/gemini.ts`) : expose la **trace des outils
  réellement exécutés** sur le portefeuille (scanPortefeuille, filtreRégion, filtreFilière, agrégation)
  — structure prête pour du **function-calling** LLM réel. Route `api/gemini/query` bascule dessus.
  UI `assistant-tab.tsx` : chips « Outils exécutés » sous chaque réponse ; sous-titre « Copilote agentique ».
- ⚖️ **Analyse de risque RDUE expliquée** (`analyserRisque`, XAI, aide à la décision) : niveau qualitatif
  **Faible/Modéré/Élevé/Bloquant** (jamais de % inventé) + facteurs pondérés (+/–/neutre) + recommandation.
  Composant PUR serveur `components/app/risk-card.tsx`, monté sur `/app/parcelle/[id]` (calcul serveur).
- 🧾 Charte respectée (statuts figés, « évaluation » pas « garantie », honnête mock vs prod).
- 💳 **Scoring de crédit explicable** (`scorerCreditProducteur`, XAI, inclusion financière) : éligibilité
  conditionnée à la conformité, **classe A/B/C** + **plafond recommandé** borné 50k–250k FCFA + signaux
  (conformité, sols, capacité, historique) + explication. Composant PUR `components/app/credit-score-card.tsx`,
  monté sur `/app/parcelle/[id]`. Aide à la décision (validation humaine), prêt remboursable (jamais gratuit).
- 🛰️ **Résumé de changement satellite** (`resumerChangementSatellite`, narration IA) : évolution du couvert
  depuis la date pivot en langage clair + mini-timeline d'observations (qualitatif). Intégré DANS la carte
  verdict de `/app/parcelle/[id]` (bloc « Lecture satellite · IA »), pas une carte de plus (densité maîtrisée).
- **Reste roadmap IA** : **assistant vocal dioula/baoulé** → nécessite un vrai TTS pour ces langues (Web
  Speech API ne les couvre pas) ; à ne PAS simuler (honnêteté). **Hors IA** : traduction EN `/app` + pages
  secondaires ; push GitHub (bloqué sur auth Anael).
- ✅ **5 features IA livrées** cette session (DDS memo, copilote agentique v2, analyse de risque, scoring
  crédit, résumé satellite). GATE : `tsc` ✓ · `next build` **vert**. `/app/parcelle/[id]` = cockpit IA.

### Session 9 (suite) — 2026-07-05 — Refonte design interface client + police Space Grotesk
- 🅰️ **Police finale = `Space Grotesk`** pour TOUS les titres (Newsreader + **Fraunces** retirés — Anael :
  « ça ressemble à l'IA »). `.font-display` ET `.font-premium` → `--font-display` = Space Grotesk, droit.
  (skill `ui-ux-pro-max` : pairing « Tech Startup / caractère distinctif », s'accorde au mono des chiffres.)
- 🟢 **Le vert (green-signal) réaffirmé partout dans `/app`** + montée en gamme (skills `ui-ux-pro-max`
  + `motion-framer`). Nouveaux utilitaires `globals.css` : `.app-aurora` (fond de marque non plat),
  `.card-premium` (survol = lift + halo vert), `.panel-forest`, `.btn-green`, `.chip-green`, `.bar-fill`,
  `.sweep-green` (tous coupés en reduced-motion).
- 🧭 **Shell** (`app/app/layout.tsx`) : aurore de marque fixe, ligne verte sous la topbar, eyebrow
  « Espace coopérative ». **Sidebar** (`app-sidebar.tsx`) : indicateur actif vert qui **glisse** (framer
  `layoutId`) + puce d'icône verte pleine ; encart « Prêt pour le RDUE » ; mobile = pill verte glissante.
- 📊 **Dashboard** : bandeau **hero vert forêt** (`panel-forest`), KPI `card-premium` (puce dégradée, halo
  au survol, **barre de conformité animée** `bar-fill`), liste en entrée staggerée, survols verts.
- 🎛️ **Producteurs / Parcelles / Paramètres / Consentement / Vérifier / Parcelle[id]** : `card-premium`,
  **filtres/pills verts** (avant : `bg-forest-950`), survols verts, `btn-green`, chips verts, KPI accent vert.
- ✅ **GATE** : `next build` vert (25 routes) · `tsc` ✓. **Reste FR** (traduction EN différée par Anael).

### Session 9 — 2026-07-05 — Corrections Anael (bug carte, police, FR/EN, UI) + début traduction EN
- 🐞 **Fix « Maximum update depth exceeded »** (`components/verifier/analysis-map.tsx`) : `bounds` était
  recréé à chaque rendu → l'effet ResizeObserver se ré-observait → `setGeom` en boucle. Corrigé :
  `ringKey` (clé stable dérivée du contenu), `bounds`/`latlngs` mémoïsés, `compute` stable (`ringRef`),
  `setGeom` **bail** si la projection est inchangée (`geomEqual`). `tsc` + `build` verts.
- 🎨 **Police site-wide** : `--font-display` → **Geist** (plus de Newsreader/serif italique). Italique
  retiré du titre hero + splash. `.font-premium` (Fraunces) conservée.
- 🌍 **Sélecteur langues → FR / EN** (retiré Dioula/Baoulé de l'interface ; ils restent pour l'IA vocale).
  `lib/i18n.ts` (LANGUAGES fr/en), `LanguageProvider` synchronise `<html lang>`, `useLanguage()` a un
  **repli FR** hors provider. **Traduit** : landing complète, hero, splash, header, footer (passé client),
  verdicts. **Reste FR** : `/app/*`, auth, pages secondaires + légales (voir section i18n).
- 🧩 **Splash + CookieConsent déplacés DANS `<LanguageProvider>`** (sinon crash prerender `/_not-found`).
- 🖥️ **Carte non scannable sur le web** (`step-scan.tsx`) : détection `pointer: coarse`. Sur desktop →
  « Saisir manuellement » (scan caméra + OCR réservé au mobile).
- ⚙️ **Onglet Exportateur** : sections **Clés d'API + MOCK_MODE retirées** (`config-tab.tsx`) → destinées
  au futur **compte admin**. Journal réseau + centre d'alertes conservés.
- 🔙 **Bouton « Site »** (topbar `/app`) → arrive **directement sur l'accueil** sans réafficher l'écran de
  bienvenue (`BackToSiteLink` pose `agrivo_skip_splash`, lu+effacé par `SplashScreen`).
- 📐 **Cartes « Problème » à hauteur égale** (la carte « 95 % » était plus courte) : bug dans `<Tilt>` —
  le wrapper `perspective` retombait à la hauteur du contenu. Corrigé : la className du caller vit sur le
  conteneur extérieur, l'élément incliné remplit en `h-full`.
- ✨ **Sections « Le différenciateur » + « Cartographie satellite »** : **fond animé du HERO** (`HeroBg` :
  mesh + grille + grain) + **halo curseur** (`CursorGlow`).
- ✅ **GATE** : `next build` vert (25 routes, `/_not-found` inclus).

### Session 8 (suite 7) — 2026-07-05 — V4 · P6 + P7 (frontières d'erreur, nettoyage, rapport) — CLÔTURE V4
- ✅ **P6** : `app/error.tsx` + `app/app/error.tsx` (frontières d'erreur on-brand via `ErrorState`),
  `app/app/loading.tsx` (état de chargement). Le reste de la passe UX (états vides, toasts, focus-visible,
  reduced-motion, responsive 390/768/1440) était déjà en place tout au long de P1-P5.
- ✅ **P7** : suppression de l'orphelin `components/app/app-space-switch.tsx` ; **`LIVRABLE_AGRIVO_V4.md`**
  (améliorations, architecture, features ajoutées/supprimées, dette technique, recommandations prod).
- ✅ **GATE final** : `tsc` ✓ · `next build` ✓ (25 routes).
- 🏁 **Chantier V4 clos** : P1 → P7 exécutés + images. Compte démo `client@test.com` / `123client123`.
  Dette technique & chemin vers la vraie prod détaillés dans `LIVRABLE_AGRIVO_V4.md`.

### Session 8 (suite 6) — 2026-07-05 — V4 · P5 (crédibilité & pages légales)
- ✅ **Coquille légale** `components/legal/legal-shell.tsx` (`LegalShell` + `LegalSection` + `Todo`) → pages
  **`/confidentialite`** (ARTCI, loi 2013-450, rôle sous-traitant), **`/cgu`** (évaluation ≠ garantie, micro-crédit
  remboursable, droit ivoirien), **`/mentions-legales`** (éléments d'entreprise `[À compléter]`, hébergeur Vercel,
  statut non-BCEAO).
- ✅ **`/contact`** : formulaire validé (nom/email/organisation/message) + état de succès + cartes Commercial/Support.
- ✅ **`/aide`** : centre d'aide (recherche + 5 catégories d'articles → parcours / faq / méthodologie).
- ✅ **Footer complet** (`components/site-footer.tsx`) : colonnes Produit / Ressources / Légal.
- ✅ **Bandeau cookies** `components/cookie-consent.tsx` (accepter/refuser, localStorage), monté dans `app/layout.tsx`.
- ✅ **GATE** : `tsc` ✓ · `next build` ✓ (25 routes) · captures 1440 : contact / aide / confidentialité OK,
  0 débordement, bandeau cookies visible.

### Session 8 (suite 5) — 2026-07-04 — V4 · P4 (consolidation dashboard)
- ✅ **Navigation latérale** : `components/app/app-sidebar.tsx` (`AppSidebar` desktop + `AppMobileNav` mobile) —
  Vue d'ensemble / Producteurs / Parcelles / Exportateur / Paramètres, actif via `usePathname`. Remplace
  `AppSpaceSwitch` dans `app/app/layout.tsx` (restructuré : sidebar + main). `app-space-switch.tsx` orphelin (nettoyage P7).
- ✅ **`/app/producteurs`** : liste des 45 producteurs (dérivée de `PARCELLES`), recherche, **filtres 7 filières
  + statuts** (pastilles couleur depuis `config/filieres`), **ajout producteur** (formulaire validé, session + toast).
- ✅ **`/app/parcelles`** : KPIs (`portfolioStats`), filtres filière/statut, recherche, liste → `/app/parcelle/[id]`.
- ✅ **`/app/parametres`** : onglets **Profil** (pré-rempli via `useAuth`) / **Organisation** (coop, région,
  filières couvertes) / **Sécurité** (changement mdp validé + appareils connectés), toasts.
- ✅ **GATE** : `tsc` ✓ · `next build` ✓ (20 routes) · captures CDP 1440 + 390 (auth seedée) : sidebar OK
  desktop, barre horizontale OK mobile, 0 débordement, filtres 7 denrées visibles, `/app/parametres` pré-rempli.
- 🔑 Réglage : « Agrivo » du hero **remis en vert** (le doré n'était finalement pas voulu ; bouton reste doré).

### Session 8 (suite 4) — 2026-07-04 — V4 · P3++ (retour arrière « expansion » + ajustements Anael)
- ↩️ **Expansion sombre ANNULÉE** (retour Anael : « ce n'est pas ce que je voulais »). L'accueil revient au
  **thème clair alternant** (sections ivory + sections sombres Triptyque / Cartographie / Chiffres / CTA).
  `<GlobalBg/>` supprimé, **fond propre du hero restauré** (`hero.tsx`). **Conservés** : police `Fraunces`
  (`.font-premium`), section `Fonctionnalités` (remplace « Deux IA »), cartes Problème **hauteur égale**,
  tuile dérivés **photo**, titre cartographie « Chaque parcelle, prouvée depuis le ciel », ligne de balayage,
  « **Agrivo** » + bouton « Accéder au tableau de bord » en **or**.
- 🛰️ **Image satellite changée** — l'ancienne persistait à cause du **cache `next/image`** (même URL). Nouveau
  fichier **`/textures/sat-soubre-rural.jpg`** = vraie **parcelle agricole rurale près de Soubré (CI)** (ArcGIS
  World Imagery, vue de haut : rivière + parcelles + forêt). `satellite-parcelles.jpg` supprimé. *(Leçon :
  remplacer un asset servi par next/image = changer le nom de fichier, sinon la version optimisée est cachée.)*
- 🎚️ **CTA final** : masque vert du fond aérien remis à **opacity 0,22** (au lieu de 0,32).
- ✅ **GATE** : `tsc` ✓ · `next build` ✓ (cache `.next/cache/images` purgé) · captures CDP 1440 + 390 :
  0 débordement, hero or + fond restauré, Problème clair à cartes égales, cartographie nouvelle image CI.

### Session 8 (suite 3) — 2026-07-04 — V4 · P3+ (accueil immersif « dark » — ANNULÉ en suite 4)
- ✅ **Fond animé GLOBAL** : le fond du hero (mesh + grille + grain) est extrait dans `<GlobalBg/>` (fixe) et
  couvre **toute la page** (expansion continue) ; hero rendu transparent. Toutes les sections passées en
  **thème sombre** (verre `bg-white/[0.04]` + `border-white/10`, texte blanc). Le CTA final garde son fond aérien.
- ✅ **Police premium** : `Fraunces` (`--font-fraunces`, classe `.font-premium`, `app/layout.tsx` + `globals.css`)
  sur **tous les titres de sections hors hero** (le hero garde Newsreader italic).
- ✅ **Hero** : « **Agrivo** » en **or** (`amber-soft`) ; bouton « Accéder au tableau de bord » en **or** plein.
- ✅ **Section « Deux IA » supprimée** (jugée trop interne) → remplacée par **`FonctionnalitesSection`** (grille
  produit : vérif. satellite, certificat TRACES NT, export GeoJSON, micro-crédit, multilingue, hors-ligne).
  Whisp/Gemini restent cités (golden path + `/methodologie`).
- ✅ **Problème** : cartes **hauteur égale** (`h-full` sur item + `Tilt`) — corrige les tailles inégales.
- ✅ **Cartographie** : vraie image **satellite top-down de Soubré (CI)** (ArcGIS World Imagery) + **nouveau
  titre** « Chaque parcelle, prouvée depuis le ciel. » + **ligne de balayage** animée.
- ✅ **Filières** : tuile « Produits dérivés » dotée d'une **photo** (`/filieres/derives.jpg`).
- ✅ **CTA final** : fond aérien conservé mais **plus visible** (opacity image 0.18 → 0.32, masque vert allégé).
- ✅ **Motion** partout sauf hero (halos au survol, lifts spring, scan-line, stagger) ; `reduced-motion` respecté.
- ✅ **GATE** : `tsc` ✓ · `next build` ✓ (17 routes, Fraunces OK) · captures **CDP 1440 + 390** : 0 débordement,
  hero or, cartes égales, satellite CI top-down, tuile dérivés photo, thème sombre cohérent.

### Session 8 (suite 2) — 2026-07-04 — V4 · P3 (refonte visuelle accueil : 7 denrées, images, cartographie)
- ✅ **Images art-dirigées** (9, libres de droits Wikimedia Commons ; crédits/attribution → `IMAGES_CREDITS.md`) :
  7 denrées dans `public/filieres/` + 2 fonds `public/textures/` (satellite, canopée). Sourcées puis **vérifiées
  visuellement** une à une (ex. soja re-sourcé pour retirer panneau/marque).
- ✅ **`FilieresSection` 4 → 7 denrées + tuile « Produits dérivés »** (`app/page.tsx`) : pilotée par
  `config/filieres.ts`, `next/image` (repli dégradé de marque conservé), **ratio uniforme `aspect-[4/5]`**
  (corrige les « tailles inégales »), badge statut (En production / Couverte), grille
  `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`.
- ✅ **Nouvelle section « Cartographie satellite »** (légère, sans Leaflet) : image satellite + **polygone SVG
  qui se dessine** (`motion.path` pathLength ; reduced-motion → état final), badge Conforme + coords GPS + superficie.
- ✅ **Hero** : ligne de confiance → **chips des 7 denrées** (pastille couleur) + méta (SNT, Whisp/Gemini).
  Structure du hero + aperçu de dashboard flottant **inchangés**.
- ✅ **CtaFooter** : fond aérien traité (canopée duotone sous overlay forest).
- ✅ **GATE** : `tsc` ✓ · `next build` ✓ (17 routes) · **captures CDP desktop 1440 + mobile 390** :
  `scrollWidth == innerWidth` (0 débordement), 7 tuiles + dérivés alignés, cartographie nette, chips hero OK.
  Splash / HERO / aperçu dashboard préservés. Script capture réutilisable : `scratchpad/cdp-shot.mjs`.

### Session 8 (suite) — 2026-07-04 — V4 · P2 (authentification réelle + parcours client)
- ✅ **`components/auth-provider.tsx`** : session localStorage (`agrivo:session`), `login`/`signup`/`logout`,
  `useAuth`, **compte démo** `client@test.com` / `123client123` (Amadou · Coop. de Soubré). Hydratation
  SSR-safe (état initial = non connecté → aucun mismatch). Enveloppé dans `app/layout.tsx` (sous `LanguageProvider`).
- ✅ **Pages `/connexion` + `/inscription`** (client, on-brand, validation + erreurs inline + latence « vrai
  SaaS »). Connexion : encart **« Entrer avec le compte de démonstration »** (1 clic). Anti open-redirect
  (`?redirect=` chemins internes uniquement).
- ✅ **Routes `/app/*` protégées** : `components/app/route-guard.tsx` (redirige vers `/connexion?redirect=…`,
  écran de chargement on-brand) enveloppe le layout `/app`. **Déconnexion** : `components/app/user-menu.tsx`
  (avatar initiales + panneau, Échap/clic-extérieur) dans la topbar `/app`.
- ✅ **CTA démo supprimés** : `SiteHeader` conscient de la session (déconnecté → Connexion + Créer un compte ;
  connecté → Tableau de bord) ; hero « Voir la démo » → « Accéder au tableau de bord », « Commencer la
  vérification » → `/app/verifier` ; `CtaFooter` « Voir la démo en direct » → « Créer un compte ».
- ✅ **GATE** : `tsc` ✓ · `next build` ✓ (17 routes ; `/connexion` + `/inscription` statiques). Vérif visuelle
  CDP différée au P3 (jalon visuel).

### Session 8 — 2026-07-04 — CHANTIER V4 « SaaS crédible » · P1 (audit + fondation 7 denrées + purge démo)
- ✅ **Objectif V4** (Anael) : transformer AGRIVO de démo Vibeathon en **produit SaaS crédible** (auth réelle,
  dashboard pro, pages légales, **7 denrées RDUE**, images art-dirigées, motion premium hors HERO). Playbook :
  `PROMPTS_AGRIVO_V4_PRODUCTION.md` + `AGRIVO_V4_PLAN_ET_MANUEL.md` (racine). **HERO + splash + aperçu de
  dashboard flottant = intouchés** sur toute la V4.
- ✅ **`AUDIT.md`** créé (liens morts, langage démo, pages manquantes, données mockées, incohérences visuelles).
- ✅ **`config/filieres.ts`** = **SSOT des 7 denrées RDUE** (+ `PRODUITS_DERIVES`). `data/mock-parcelles.ts` :
  `type Filiere = FiliereId`, `FILIERE_LABEL` ré-exporté depuis la SSOT, `RENDEMENT_T_HA` étendu
  (bovins/soja/bois). Module pur, aucun `"use client"` (frontière RSC respectée).
- ✅ **Purge langage démo (UI)** : retiré « Chiffres à revérifier avant le pitch », « Ouvrez la
  démonstration… », footer « version de démonstration … Vibeathon » → « Agrivo © 2026. Tous droits réservés. ».
  Ancre morte `#produit` corrigée (`id="produit"` + `scroll-mt-24` sur `GoldenPathSection`).
- ✅ **GATE** : `tsc --noEmit` ✓ · `next build` ✓ (15 routes). Reste V4 : CTA « Voir la démo » + auth → P2 ;
  refonte visuelle accueil + 7 tuiles images → P3 ; dashboard → P4 ; pages légales → P5 ; UX → P6 ; refactor → P7.

### Session 7 — 2026-07-04 — PROMPT 5 exécuté (dashboard exportateur, assistant IA & alertes)
- ✅ **Modèle de données étendu** (`data/mock-parcelles.ts`) : **14 → 45 parcelles** multi-coopératives / multi-filières (générateur **déterministe** : ids/cartes/certificats séquentiels, DDR pour les conformes ; 9 coopératives : Soubré, Méagui, Gagnoa, Duékoué, San Pédro, Daloa, Man, Aboisso, Dabou). Nouveaux helpers PURS : `portfolioStats` (les **4 KPI officiels** : producteurs audités · taux de conformité · superficie · volume validé), `volumeTonnes`/`volumeValideTonnes` (rendement indicatif t/ha, conformes uniquement), `exporterFeatureCollection` (**GeoJSON RFC 7946**, WGS-84 lon/lat, **6 décimales**), `alertesParCoop`, `cooperatives`, `fmtTonnes`. Les 14 parcelles d'origine (p01-p14, réf. AGV-2026-0417…) **inchangées** (compat. Prompts 3/4).
- ✅ **Assistant qui raisonne** (`lib/ai/gemini.ts`) : `interrogerPortefeuille(question, parcelles)` — **raisonne réellement** sur les données (normalisation sans accents, filtres **région/filière/statut/« ce mois-ci »**, agrégats : anomalies, superficie moyenne, éligibilité micro-crédit, volume, résumé). Renvoie texte + métrique + parcelles citées. `QUESTIONS_SUGGEREES`. **Route** `app/api/gemini/query` (MOCK_MODE, latence simulée, **aucun appel réseau côté client**). Vérifié : « risque région de Soubré » → **exactement** Amenan Kouamé, Bakary Traoré, Djédjé Serge.
- ✅ **Page `/app/exportateur`** (persona **Marc**) : **3 onglets custom** (indicateur animé `layoutId`, respecte reduced-motion), **header** persona + **cloche compteur global (6 alertes)** visible des 3 onglets + bouton **⌘K**.
  - **Onglet 1 · Analytique & cartographie** (`components/exportateur/analytics-tab.tsx`) : 4 KPI `StatNumber` (45 · 62 % · 157 ha · 81 t), **tableau dense triable** (`aria-sort`) + filtres statut/filière + recherche (`EmptyState`), **carte Leaflet satellite LIÉE** (`portfolio-map.tsx`, Esri World Imagery, `dynamic ssr:false`) : pastilles de statut visibles à tout zoom + polygones, **survol ligne↔pastille**, **clic → sélection + zoom-to-parcelle + scroll de la ligne**, **export GeoJSON RFC 7946 réel** (téléchargement `.geojson`), **palette ⌘K** (`command-palette.tsx`, actions + parcelles, **navigation clavier** flèches/Entrée/Échap).
  - **Onglet 2 · Assistant IA** (`assistant-tab.tsx`) : chat **à l'identité AGRIVO** (pin/feuille, « raisonne sur vos données · Gemini »), **frappe progressive** mot à mot (reduced-motion → texte complet), questions suggérées, **métrique** + **puces de parcelles cliquables → carte** (`aria-live`).
  - **Onglet 3 · Configuration & alertes** (`config-tab.tsx`) : clés API **masquées** (WHISP/GEMINI, note « injectées serveur »), **toggle MOCK_MODE** (forcé ON + explication), **journal réseau live** (heartbeat Whisp/Gemini/Copernicus/TRACES NT + **événements cross-onglets** : les requêtes de l'assistant et les exports y apparaissent, `AnimatePresence`), **centre d'alertes groupé par coopérative** (cohérent avec le dashboard coop).
- ✅ **Navigation croisée** : `components/app/app-space-switch.tsx` (bascule **Coopérative ↔ Exportateur**, route-aware via `usePathname`) remplace l'eyebrow statique du layout `/app`. Layout `/app` élargi **max-w-6xl → 7xl** (densité B2B ; le dashboard coop en profite, non régressé).
- ✅ **A11y** : `StatNumber` respecte désormais **reduced-motion** (affiche la valeur finale, plus de compteur animé) — amélioration **globale** (tous les dashboards). Statuts toujours doublés d'un texte, `aria-sort`, palette/chat pilotables au clavier, légende carte + tableau = source accessible (jamais la couleur seule).
- ✅ **Décisions** : pas de Radix/cmdk/Recharts (composants **custom framer**, cohérent Session 3) ; carte **côte-à-côte en `xl` seulement** (les 6 colonnes tiennent dans la coquille 7xl) ; **progressive disclosure** des colonnes (mobile = producteur + statut).
- ✅ **GATE vert** : `tsc --noEmit` ✓, `next build` ✓ (`/app/exportateur` **statique**, `/api/gemini/query` dynamique). Captures **CDP** desktop 1440 + **mobile 390** (`scrollWidth == innerWidth == 390`, **0 débordement**) des **3 onglets + palette ⌘K + dashboard coop** (non régressé). Aucun terme/logo/photo interdit (grep « valeur à risque »/« garantie »/« gratuit »/tiret cadratin visible = néant).

### Session 6 — 2026-07-03 — PROMPT 4 exécuté (golden path : LE moment signature)
- ✅ **Couche IA (stubs, aucune clé)** : `lib/ai/config.ts` (`MOCK_MODE=true` forcé, latence simulée 1200-1800 ms, `isDemoCoords`), `lib/ai/whisp.ts` (détection FAO — verdict + phrase figée + convergence de preuves qualitative, **jamais de % inventé**), `lib/ai/gemini.ts` (OCR carte `scannerCarteProducteur`, `genererExplicationVerdict` = phrase figée, `expliquerScoreSols` XAI « compostage → score plus élevé, méthodologie inspirée type Kubeko »). **Routes API** : `app/api/whisp/verify`, `app/api/gemini/scan`, `app/api/gemini/explain`. MOCK_MODE court-circuite tout réseau ; **aucun appel ne part du client** (tout via fetch → route serveur).
- ✅ **Parcours `/app/verifier`** (machine à états client, `AnimatePresence`, aucun rechargement) : Étape 1 Confirmation (récap coop, consentement) → Étape 2 Scan (viseur caméra `getUserMedia` **ou** mock élégant + cadre de visée, OCR stub → **formulaire pré-rempli éditable**) → **Étape 3 Analyse (SIGNATURE)** → Étape 4 Certificat (si conforme/anomalie) → Étape 5 Crédit (si conforme) → écran de fin adaptatif. Branchement selon verdict ; `insuffisant` saute certificat/crédit.
- ✅ **Étape 3 — `components/verifier/analysis-map.tsx`** : carte **satellite réelle** (react-leaflet + tuiles Esri World Imagery, `dynamic ssr:false`), surcouche SVG projetée par Leaflet (`latLngToContainerPoint`) : **contour qui se dessine → balayage satellite + pin/feuille pulsant → remplissage du verdict (scale-bounce)** → StatusBadge + phrase figée + faisceau de preuves + **badge « Score de résilience des sols » cliquable** (popover XAI) + **« Écouter » (Web Speech API, fr-FR)** + « Revoir l'analyse ». Timeline ~2,5 s, `reduced-motion` respecté.
- ✅ **Étape 4 — certificat** : aperçu HTML on-brand + **vrai PDF** (`@react-pdf/renderer`, `lib/certificat-data.ts` + `components/verifier/certificat-pdf.tsx`, importé **à la demande** au clic → hors SSR/bundle initial). Champs complets : n° cert, date/heure, producteur, carte, coop, filière, **coords WGS-84 6 décimales (RFC 7946)**, superficie, statut, date pivot, sources, mention TRACES NT + consentement + avertissement légal. Téléchargement vérifié (`certificat-agrivo-AGV-2026-0417.pdf`).
- ✅ **Étape 5 — inclusion financière** : slider 50 000–250 000 FCFA + « Proposer au producteur » → simulation Mobile Money + animation succès (pin+feuille Or, « le vert prouve, l'or récompense »). Prêt remboursable (jamais « gratuit »). Fin → `sessionStorage` → **bandeau « Vérification enregistrée » sur le dashboard**.
- 🐞 **Auto-critique étape 3 (3 défauts trouvés & corrigés via capture réelle CDP)** : (1) surcouche SVG **cachée derrière les tuiles** (z-index manquant → `z-[500]`) — le polygone ne s'affichait pas ; (2) couleurs `var()` en **attribut SVG** non fiables (Safari) + trop faible contraste sur satellite → **HEX explicite + halo sombre + vignette** (aussi corrigé dans `parcelle-map.tsx`) ; (3) **exceptions Leaflet `_leaflet_pos`** au démontage d'étape → `compute`/ResizeObserver protégés (`mountedRef` + try/catch). Revérifié : **0 exception**, polygone net desktop **et** 390 px.
- ✅ **GATE vert** : `tsc` ✓, `build` ✓ (routes API + `/app/verifier`), parcours complet piloté en CDP desktop 1440 **et** mobile 390 (chaque étape), PDF généré, aucun terme/logo/photo interdits.

### Session 5 — 2026-07-03 — PROMPT 3 exécuté (dashboard coopérative + consentement ARTCI)
- ✅ **Espace applicatif `/app`** créé : `app/app/layout.tsx` (coquille sobre — topbar Logo + « Espace coopérative » + LanguageSwitcher + lien « Site », fond ivory, PAS la navbar du site ; `min-h-dvh`). La navbar vitrine n'apparaît jamais ici.
- ✅ **`/app/dashboard`** (l'écran d'Amadou, client) : en-tête « Bonjour Amadou · Coopérative Agricole de Soubré · <date live côté client> », **4 KPI `StatNumber`** (parcelles vérifiées 10 · taux de conformité 40 % · propositions de crédit 3 · alertes actives 2), **recherche live** producteur/n° carte (→ `EmptyState` si 0), **liste des dernières vérifications** (rows compactes : StatusBadge + n° carte + filière + superficie + date → `/app/parcelle/[id]`), **CTA proéminent « Nouvelle vérification »** (Magnetic, vert) → `/app/consentement` (PAS direct au parcours), **rail Alertes** (compteur rouge, `PinMark` rouge pulsant, alertes en tête sur mobile via `order-1`).
- ✅ **`/app/parcelle/[id]`** (serveur, `await params` Next 16) : `<ParcelleMap>` (placeholder « satellite » stylé — polygone GeoJSON qui se dessine, teinte du verdict, sommets, coords GPS ; carte Leaflet complète = Prompt 4), verdict (phrase figée + date pivot + sources), infos producteur (filière/région/superficie/date/n° cert/DDR), section crédit **si `propositionCredit`** (prêt remboursable, pas « gratuit »), bouton certificat (non fonctionnel ici). `notFound()` si id inconnu.
- ✅ **`/app/consentement`** (client) : écran ARTCI soigné (bandeau forest + bouclier, « Avant de continuer », 3 points honnêtes loi n°2013-450, déclaration de consentement, **checkbox obligatoire** → « Continuer » actif → `/app/verifier`). Preuve « conçu conforme dès le départ ».
- ✅ **Composants réutilisables** (prompts 4-5) : `components/ui/status-badge.tsx` (statuts figés, icône + texte, texte foncé sur teinte → contraste AAA, module PUR) ; `components/ui/pin-mark.tsx` (glyphe pin+feuille monochrome, variante alerte rouge + `pulse`, module PUR). `data/mock-parcelles.ts` **préexistant réutilisé tel quel** (14 parcelles, 6 conformes/4 anomalies/4 insuffisant, multi-filières Soubré/Man/Aboisso/Dabou).
- ✅ **GATE vert** : `tsc --noEmit` ✓, `next build` ✓ (routes `/app/dashboard`, `/app/consentement` statiques ; `/app/parcelle/[id]` dynamique). Captures Edge/CDP desktop 1440 **et** mobile 390/375 (device emulation) : **0 overflow horizontal**, KPIs animés OK, 3 statuts lisibles (couleur + icône + texte), aucun terme/logo/photo interdits.

### Session 4 — 2026-07-03 — OUBLIER NANTI + refonte accueil AGRIVO
- ✅ Règle stricte ajoutée (voir « 🚫 OUBLIER NANTI ») : seuls hero + bienvenue = design Nanti ; le reste = AGRIVO original, contenu du PDF v4.
- ✅ **Purge « valeur à risque »** (concept Nanti) : retiré du KPI hero (→ « Superficie »), et de l'accueil.
- ✅ **Logo** : animation revue « pro » — sparkle/twinkle supprimés (trop dessin animé) ; à la place **lueur verte qui respire** + **reflet spéculaire doux** qui glisse (Framer Motion, `splash-glow` radial + `splash-sheen`).
- ✅ **Accueil `/` refondu AGRIVO** (sections originales + motion premium : variants + staggerChildren, whileInView, hover lifts, Magnetic) : Problème · **Golden path 5 étapes** (stepper, ligne qui se trace) · Triptyque immersif · **Deux IA (Whisp + Gemini)** · Filières · **Marché en chiffres** · Calendrier RDUE · **Personas (Amadou/Marc/Yao)** · **Modèle éco corrigé** · Verdicts (i18n) · Équipe. Supprimé : « zéro boîte noire / valeur à risque », « avant/après ».
- ✅ **Modèle économique corrigé** (accueil + `/tarifs`) : 3 sources (abonnement coop 120k · API exportateur 1,5M · **commission** sur micro-crédit versée par l'IMF). **Le micro-crédit n'est PAS gratuit** = un prêt remboursé ; c'est le SERVICE AGRIVO qui est gratuit pour le producteur.
- ✅ `StatNumber` : ajout `prefix`/`suffix`.
- ✅ **`PROMPTS_AGRIVO_V3.md` mis à jour** : règle « oublier Nanti » + KPIs officiels + modèle éco dans le socle (donc dans chaque prompt 3-7) ; « cockpit » → « tableau de bord » ; prompt 2 réaligné.

### Session 3 — 2026-07-03 — PROMPT 2 exécuté (site vitrine)
- ✅ **Fondations** : `lib/i18n.ts` (fr/dioula/baoulé, provisoire), `components/language-provider.tsx` (+ layout enveloppé), `components/ui/language-switcher.tsx` (accessible, `tone` clair/sombre), `components/ui/empty-state.tsx`, `error-state.tsx`, `components/ui/term.tsx` (popover glossaire), `components/landing/reveal.tsx` (`Reveal` + `ScrollRevealText` scroll-linked), `components/site-header.tsx` (variant overlay/solid + menu mobile), `components/site-footer.tsx`.
- ✅ **Accueil `/` enrichi** : Problème (StatNumber), Triptyque immersif (titre **scroll-linked**), Filières (cacao/café/hévéa/palmier, cartes Tilt), Transparence (barres comparatives), Timeline RDUE (J-countdown + 3 jalons), Avant/Après, Modèle éco, **Verdicts (démo i18n live)**, Équipe (avatars géométriques), CTA + footer. Navbar remplacée par `<SiteHeader variant="overlay">`.
- ✅ **Pages** : `/methodologie` (2 IA, convergence de preuves, 3 états, tooltips glossaire), `/a-propos` (moat, roadmap, « ce qui arrive ensuite », équipe), `/tarifs` (toggle mensuel/annuel, 2 plans + micro-crédit, **comparatif honnête** Koltiva/Farmerline/Agrivo), `/faq` (accordéon custom, 9 Q/R).
- ✅ **Décisions d'implémentation** : pas de Recharts/Radix (composants custom framer-motion, plus légers) ; pages intérieures = `SiteHeader` variant `solid` (clair) ; landing garde son propre hero. Métadonnées par page reportées au Prompt 7.
- ⚠️ **Outillage** : le tool `PowerShell` a disparu en cours de session → bascule sur **Bash** (Git Bash) pour build/tsc ; Edge headless toujours dispo pour captures.

### Session 2c — 2026-07-03 — Prompts v3 + règle de lecture CLAUDE.md
- ✅ Rédigé **`PROMPTS_AGRIVO_V3.md`** (racine) : prompts 2 à 6 réécrits dans la nouvelle direction artistique + **prompt 7 bonus** (vérification publique de certificat), socle design/contenu factorisé, angles morts & features ajoutés (langue FR/Dioula/Baoulé, scroll-linked reveal, XAI + lecture vocale, MOCK_MODE, carte↔tableau, ⌘K, guide de démo présentateur, QR certificat), faits EUDR/Whisp vérifiés + sources, pièges Next 16/Tailwind v4/RSC. **À VALIDER par Anael avant de lancer, un prompt à la fois.**
- ✅ Règle **« relire CLAUDE.md à chaque prompt »** : native dans Claude Code si lancé **depuis le dossier `.claude/projects/Agrivo`** (le CLAUDE.md s'auto-charge) ; renforcée par la 1re ligne de chaque prompt du doc v3. (Pas de hook ajouté : l'auto-chargement suffit et évite la duplication de contexte.)

### Session 2b — 2026-07-03 — Raffinements (logo, copy, multi-filières)
- ✅ **Nouveau logo** « culture géolocalisée » (pin + feuille Or) — 6 candidats comparés en aperçu HTML, choix du pin + feuille inclinée (le plus lisible dès 28 px). Ancien logo (parcelle + coche) abandonné.
- ✅ **Copy bienvenue** : espaces entre mots corrigés (nœuds texte réels), LINE2 remplacée par « De la parcelle vérifiée au crédit du producteur. » (blanc, sans « Agrivo »).
- ✅ **Hero/Dashboard readaptés AGRIVO + multi-filières** : verbes rotatifs (vérifie/prouve/certifie/simplifie), sous-titre « toutes vos filières », dashboard = 4 filières (cacao/café/hévéa/palmier) sur 4 régions.
- ✅ **Fix responsive 375 px** : conteneur splash `w-full max-w-2xl` (les titres débordaient/coupés sous 400 px).
- ✅ Build Next 16 vert, vérifié visuellement (Edge headless + CDP).

### Session 2 — 2026-07-03 — PIVOT design : réplique de Nanti
- ✅ **Migration stack** : Next 14→**16.2.9**, React 18→**19.2.4**, Tailwind v3→**v4** (`@theme`), fm 11→**12**, lucide 0.x→**1.x**. Suppression `tailwind.config.ts`, `.eslintrc.json`, `next.config.mjs`, anciens composants (Button/Card/Input/StatusBadge/i18n/ParcelPolygon/Header…).
- ✅ `app/globals.css` v4 (palette Forêt & Données + effets), `postcss` v4, `eslint.config.mjs` flat (+ no-unescaped-entities off), `next.config.ts` (turbopack root), `tsconfig` react-jsx.
- ✅ **Écran de bienvenue** `components/splash-screen.tsx` : particules canvas fuyant le curseur + liens réseau, halo curseur, countdown auto-accéléré au clic (ripples), mots révélés/floutés, bouton **magnétique**, rideau de sortie (slide-up), **logo AGRIVO** animé (stroke-draw + coche). Event `agrivo:enter`.
- ✅ **Hero** `components/landing/hero.tsx` : split 55/45, **verbe rotatif** (vérifie/certifie/finance/trace), badge **J-RDUE**, fond **mesh+grille+grain**, **dashboard flottant** (tilt/parallax/float) : KPIs Conformes/Anomalies/Valeur à risque + 4 lignes coop + échéance RDUE.
- ✅ `components/ui/logo.tsx` (nouveau logo « parcelle vérifiée »), `motion-primitives` (Magnetic/CursorGlow/Tilt), `stat-number`, `page-reveal`.
- ✅ `app/layout.tsx` (fonts + anti-flash splash-mask + `<SplashScreen>`), `app/page.tsx` (landing : navbar + Hero + « comment ça marche » + footer), `not-found` restylé.
- ⚠️ **Piège** : un `rm -rf components/ui` lancé en arrière-plan a supprimé `logo.tsx` écrit trop tôt (race). Recréé. **Leçon : ne jamais écrire un fichier dans un dossier en cours de suppression asynchrone — attendre la fin du `rm`.**

### Session 1 — 2026-07-03 — Fondations + page d'entrée
- ✅ Écrit ce `CLAUDE.md` (mémoire + règle d'auto-mise à jour).
- ✅ Scaffold Next.js 14 (App Router, TS strict) + Tailwind (thème AGRIVO complet) + Framer Motion + lucide + next/font.
- ✅ `config/brand.ts`, `lib/utils.ts` (cn), `lib/i18n.ts` (fr/dioula/baoulé) + `LanguageProvider`.
- ✅ `<ParcelPolygon>` (draw/pulse) + points/chemin exportés.
- ✅ `components/ui/` : Button · Card · Input · Select · Textarea · StatusBadge · AnimatedCounter · LanguageSwitcher · EmptyState · ErrorState. + `Header`.
- ✅ `/` page d'entrée animée (séquence orchestrée, sortie AnimatePresence, une fois/session via sessionStorage, reduced-motion, responsive 375px).
- ✅ `/accueil` placeholder on-brand + `not-found` · README.md.

### À venir (prochaines sessions)
- **Prompt 6** : PWA (manifest + service worker), **guide de démo présentateur** (Ctrl+Shift+D), accessibilité (passe complète), QA responsive 375/768/1280, checklist finale.
- **Prompt 7 (bonus)** : **vérification publique de certificat** (`/verifier-certificat` + QR dans le PDF), partage acheteur, perf/SEO/OpenGraph, script vidéo de secours.
- (Prompts 1→5 exécutés : splash + hero, site vitrine, dashboard coop + consentement ARTCI, golden path, **dashboard exportateur + assistant IA + alertes**.)

---

## 🧩 Skills à activer à chaque session de build
`ui-ux-pro-max` (conception de chaque écran/composant) · `motion-framer` / Framer Motion (toutes les
animations) · plus tout skill design/frontend/accessibilité pertinent détecté. Passer par le raisonnement
de ces skills **avant** d'écrire un composant.

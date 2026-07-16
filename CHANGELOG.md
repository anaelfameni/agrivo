# CHANGELOG — AGRIVO

Versioning sémantique (MAJOR.MINOR.PATCH). Chaque release liste ce qui est ajouté, corrigé et
vérifié, conformément à l'étape 8 du pipeline « Du besoin à la Release ».

## v2.7.0 — 2026-07-15 — Traçabilité Vague 1 : sceau à 5 critères, registre de possession, sentinelle de volume, scan de documents IA

### Ajouté
- **5ᵉ critère du sceau AGRIVO : « chaîne de possession continue »** (`data/mock-marketplace.ts`,
  `CritereCode` étendu) : le sceau exige désormais un journal de possession amont complet
  (achat bord champ → transport sous connaissement → réception magasin → pesée) ET zéro
  anomalie bloquante de la sentinelle de volume. Rendu automatique dans `sceau-agrivo.tsx`
  et `lot-pdf.tsx` (déjà génériques au nombre de critères).
- **Journal de possession du lot** (`data/mock-expeditions.ts`) : nouveau modèle amont
  `PossessionCode`/`JalonPossession`/`POSSESSION_ORDRE`/`possessionComplete()`, DISTINCT des
  jalons logistiques aval (`JALONS_ORDRE` inchangé, tests d'ordre canonique préservés).
  Champ `journalPossession` sur `Expedition` et `MarketLot`. Seeds : expéditions et lots
  vendables enrichis d'une chaîne complète ; EXP-2026-0007 volontairement incomplet
  (connaissement manquant + pesée absente) = double démonstration honnête du verrou.
- **Sentinelle de volume** (`lib/sentinelle/volume.ts`, module pur calqué sur
  `lib/registre/audit.ts`) : 3 anomalies calculées, bilingues, bloquantes (dépassement du
  plafond agronomique, écart de pesée > 8 %, connaissement dupliqué) +
  `connaissementsDupliquesMarche()` (audit croisé entre lots). Alimente le 5ᵉ critère et
  le champ `alertesVolume` de chaque lot.
- **Frise « Registre de possession »** (`components/marketplace/journal-lot.tsx`) : rail
  vertical animé (stagger, spring, reduced-motion), maillons manquants en pointillé ambre
  « À documenter », alertes sentinelle en rouge. Sur la fiche publique du lot (section
  dédiée) et dans « Mes lots » (dépliable « Journal du lot » avec badge d'alertes).
- **Scan universel de documents IA** : route `app/api/gemini/scan-document` (connaissement,
  bordereau d'achat, ticket de pesée ; Gemini Vision, charte anti-invention, repli démo sans
  clé) + module pur `lib/ai/scan-document.ts` (validation stricte : date ISO, tonnage borné,
  jamais de champ inventé) + composant `scan-document.tsx` (photo/upload → formulaire
  pré-rempli éditable → jalon ajouté au journal de session).
- **Compteur de coût d'onboarding** (`lib/mesure/onboarding.ts` + panneau
  `onboarding-stats.tsx` sur le dashboard coop) : durée réelle des parcours de vérification
  complétés (moyenne/médiane, mesures implausibles écartées), pour remplacer le coût
  d'enrôlement supposé par une donnée de pilote. Invisible tant qu'aucune mesure.

### Durci
- **Gating de vente unifié sur `estVendable()`** (source de vérité unique) : la carte de
  « Mes lots » n'a plus de réimplémentation locale ; gardes explicites dans `toggle()`
  (publier/retirer), dans la réservation et le PDF de réservation de `lot-detail.tsx`, et
  DANS `telechargerLotPdf()` (refuse un bon de réservation pour un lot non vendable,
  retourne un booléen testé).

### Corrigé
- Terminologie « cockpit » purgée du code (clés COPY → `mesLots`, commentaire JSDoc) et des
  descriptions d'état de CLAUDE.md ; placeholders « — » des seeds remplacés (« À vendre »,
  « À confirmer ») ; tiret cadratin retiré du point « alertes-coop » du contrôle
  pré-embarquement (texte rendu) ; erreur eslint préexistante de dépendance `useMemo`
  (`JSON.stringify` extrait en `choixKey`, expeditions/page.tsx).

### Vérifié
- `tsc` ✓ · `eslint` 0 erreur · `next build` ✓ · **169 tests** verts (148 + 21 : sentinelle,
  journal de possession, scan-document, mesure d'onboarding, 5ᵉ critère, garde PDF) ·
  smoke SSR.

## v2.6.0 — 2026-07-13 — AGRIVO Market : ruban opaque, chart héros avec axes + courbe lissée, cockpit « Mes lots » refondu

### Changé
- **Ruban d'activité du bas OPAQUE** (`bg-forest-950`, plus de backdrop-blur/transparence),
  fondus latéraux pleins.
- **Chart du héros amélioré** : **courbe lissée uniforme** (Catmull-Rom → Bézier cubique,
  `smoothPath` dans `Sparkline`, prop `smooth`), **axe des ordonnées** (3 niveaux de prix :
  max · milieu · min, labels HTML alignés sur les lignes de grille `yTicks`, constantes
  partagées `SPARK_TOP`/`SPARK_BAND`) et **axe des abscisses** (début · milieu · fin de plage,
  `fmtDate` exporté). Chips « Plus haut / Plus bas » retirés (l'axe Y les remplace). Point
  terminal pulsant, tilt et pilule glissante conservés.
- **Cockpit exportateur « Mes lots » refondu** (`/app/exportateur/marketplace`) : en-tête
  canonique de l'app (`.eyebrow` + `font-display`), CTA `.btn-green`, **bandeau KPI
  `.panel-forest`** (4 compteurs `StatNumber` recalculés en direct : lots en ligne, valeur
  publiée, commission estimée, scellés), **filtres à pilule glissante** (Tous/Publiés/Retirés/
  Réservés avec compteurs, `layoutId`), cartes **`.card-premium`** staggerées avec liseré
  couleur filière, chip d'état (« En ligne » pulsant / « Retiré » / « Réservé » / « En
  prépa. »), **confirmation de retrait inline avec Annuler** (AnimatePresence), état vide par
  filtre, `estVendable` du module réutilisé. Tiret cadratin restant purgé.

### Vérifié
- `tsc` ✓ · `eslint` 0 erreur · `next build` ✓ · **148 tests** verts · smoke SSR.

## v2.5.0 — 2026-07-13 — AGRIVO Market : polish signature (terminal, header glass, sections wow) + vedettes fusionnées

### Changé
- **Terminal cacao du héros refait** : prix « rolling » (glisse vers la nouvelle valeur au
  changement de plage), pastille de variation colorée, sparkline avec **point terminal pulsant**
  + grille fine, chips **Plus haut / Plus bas**, toggle à **pilule glissante** (layoutId + spring),
  **inclinaison 3D au curseur** (springs, coupée tactile/reduced-motion).
- **Header : UN SEUL état LIQUID GLASS** (`.liquid-glass-light`, nouveau tier clair dans
  globals.css : ivoire translucide + blur 20 px saturé + highlight), identique en haut de page et
  au défilement (fin de l'état transparent jugé « bizarre »).
- **Section confiance interactive** : **séquence du scellage** (3 verrous qui s'allument en
  cascade, segments qui se remplissent, badge « Scellé » qui claque en spring), piliers en cartes
  **Tilt** avec balayage lumineux au survol et icône qui s'allume, chips référentiels en hover lift.
- **Timeline « parcours d'un lot » en SOMBRE signature** : même fond animé que le héros
  (`HeroBg`), cartes glass, ligne lumineuse (glow) qui se dessine au scroll, nœuds qui s'allument
  en vert plein avec halo.
- **Carte des origines AGRANDIE** : pleine largeur (`h-520/560`), en-tête centré, panneau glass
  superposé (stats animées + chips des régions), stats sous la carte en mobile.
- **Réordonnancement** : le **catalogue passe juste sous le héros** ; **« Lots scellés en
  vedette » fusionnée dans le catalogue** (épinglées en tête en vue neutre, badge ambre
  « À la une » partout, mention « À la une en tête ») ; `featured-lots.tsx` supprimé.
- **Doc stratégie** : `AGRIVO DOCUMENTS/AGRIVO_Marketplace_Concurrence_et_Unicite.md` (paysage
  3 familles, unicité, roadmap features, sources) pour la levée Insatta.

### Vérifié
- `tsc` ✓ · `eslint` 0 erreur · `next build` ✓ · **148 tests** verts · smoke SSR.

## v2.4.0 — 2026-07-13 — AGRIVO Market : refonte « signature hybride » (héros de l'accueil, glass, bento, timeline)

Refonte totale demandée par Anael (« vraiment basique ») : décisions verrouillées par
AskUserQuestion (thème hybride, terminal glass, cartes photo, tous les ajouts).

### Changé
- **Héros = EXACTEMENT le fond animé de l'accueil du site** (`HeroBg` réutilisé : 3 orbes mesh
  animés + grille masquée + grain) sur `/marketplace`, **chaque page de lot** et `/vendre`.
  Dans le héros : **mot rotatif** (« vérifié / scellé / tracé / prouvé »), glow curseur
  (`CursorGlow`), recherche en version **glass**, chips micro-preuves, indicateur de scroll.
- **Terminal cacao glass** (`cocoa-terminal.tsx`) à droite du héros : prix géant, variation
  colorée sur la plage, **sparkline fluide** (fin du ratio 3:1 écrasé,
  `preserveAspectRatio="none"` + hauteur fixe), toggle 1J/1S/1M/1A, conversion FCFA/t (FX 605
  affiché), flottaison douce. Toujours « différé », jamais « temps réel ».
- **Section sombre « Marché en direct »** (`market-live.tsx`, ancre `#marche`) : le grand
  graphique ICE interactif en **variante glass sombre** (`CocoaChart tone="dark"`) + panneau
  « ce que ça change pour un lot » (prime/décote de chaque lot cacao vs ICE).
- **Bandeau stats bento** (`market-stats.tsx`) sous le héros : tuiles compartimentées animées
  (lots scellés, tonnes, coops, régions) + tuile spot cacao convertie en FCFA/kg.
- **Cartes de lots photo immersive** : macro de la filière en tête (`next/image`, zoom lent au
  survol), badges glass (filière + sceau) sur la photo, régions sur voile sombre, stats en clair.
- **Timeline animée « Le parcours d'un lot »** (`journey-timeline.tsx`) : ligne qui se dessine au
  scroll, 4 étapes alternées qui s'allument (Sourcing → Sceau → Réservation → Embarquement).
- **Header scroll-aware** : transparent sur le héros sombre au sommet, ivoire flouté au scroll.
- **Ruban d'activité sombre glass** (collant en bas) et **CTA final « membres fondateurs » sombre**
  (orbes mesh + formulaire glass) pour fermer la page sur la signature.
- **Barre de filtres du catalogue collante** sous l'en-tête ; page `/vendre` passée au héros
  signature ; derniers artefacts de ponctuation purgés (virgules collées).

### Vérifié
- `tsc` ✓ · `eslint` 0 erreur · `next build` ✓ · **148 tests** verts · smoke SSR (héros mesh,
  terminal, #marche, cartes photo, timeline, ticker sombre, pages lot/vendre).

## v2.3.0 — 2026-07-13 — AGRIVO Market : héros vert, pleine largeur, ruban collant & finition premium

Passe de finition demandée par Anael sur la vitrine.

### Changé
- **Héros vert** (fond forest-950 + image macro de cacao `filieres/cacao-v2.webp` + halo/grain),
  texte blanc, sur DEUX colonnes : à gauche titre + recherche + statistiques ; **à droite l'aperçu du
  cours du cacao** (le graphique ICE déplacé dans le héros). La section « Le marché en direct »
  autonome est supprimée (le graphique vit dans le héros).
- **Chaque page de lot** reçoit le **même héros vert** (bandeau) pour le titre/sceau/méta.
- **Pleine largeur** : conteneurs élargis (`max-w-[1760px]`, gouttières généreuses) ; catalogue en
  **4 colonnes** sur très grand écran.
- **Ruban d'activité collant en bas** (sticky) : toujours visible pendant le défilement, il se range
  sous le pied de page tout en bas.
- **Fusion** des sections « Match · Trust · Transact » (double verrou) et « prouvée par la méthode »
  en **une seule section confiance** (`trust-section.tsx`, remplace `trust-strip.tsx`).
- **Section « Parcourir par filière » supprimée** (`filiere-browser.tsx` retiré).
- **Cartes de lots premium** : bandeau d'origine coloré par filière, sceau en pastille pleine,
  hiérarchie prix/valeur, hover-lift renforcé, bouton d'action révélé au survol.
- **Suppression des tirets cadratins « — »** dans tout le texte visible (rendu « trop IA »),
  remplacés par des virgules / « · ».
- Animations enrichies (entrées en cascade, hover-lift, apparition du héros), toujours sous
  `prefers-reduced-motion`.

### Vérifié
- `tsc` ✓ · `eslint` 0 erreur · `next build` ✓ · **148 tests** verts · smoke SSR.

## v2.2.0 — 2026-07-13 — AGRIVO Market : refonte pro « B2B clair », cours cacao ICE live & animations

Refonte visuelle et fonctionnelle profonde de la marketplace (demande Anael : « trop basique »,
la rendre « totalement professionnelle, belle, animée »). Skills employés : `/ui-ux-pro-max`
(pattern Marketplace : recherche-héros → filières → lots vedettes → confiance) + `/motion-framer`.

### Changé
- **Thème B2B clair** : bascule de toute l'expérience `/marketplace` du sombre au **fond ivoire/blanc,
  accents verts** (layout, header, footer, cartes, catalogue, fiche lot, page vendre). Suppression des
  deux eyebrows « Place de marché · matières premières RDUE » et « Espace vendeur · exportateur ».
- **Accueil recomposé (recherche en héros)** : barre de recherche proéminente (la recherche est le
  CTA, `market-search.tsx`) + **ruban de cours cacao** ; compteurs animés (`StatNumber`) ; puis
  navigateur par filière, lots vedettes, graphique de marché, catalogue, confiance, origines, FAQ,
  fondateurs. Recherche du héros pilotant le catalogue (défilement + filtre).

### Ajouté
- **Cours cacao ICE US (New York) réel & différé** : `lib/market/cocoa.ts` (module pur —
  `normaliseCocoa`, `snapshotFallback`, `primeVsIce`) + route cache `app/api/market/cocoa`
  (Yahoo `CC=F`, revalidate 300 s, repli « dernier cours connu »). Composants `cocoa-price.tsx` :
  **`CocoaChart`** (graphique SVG custom animé — tracé `pathLength`, aire dégradée, plages
  1J/1S/1M/1A, tooltip au survol, skeleton, source libellée) + **`CocoaTicker`** (ruban héros) +
  **`VsIceChip`** (prime/décote d'un lot vs cours ICE, hypothèse FX affichée). Jamais « temps réel ».
- **Sections d'accueil animées** : `filiere-browser.tsx` (7 filières RDUE + compteur de lots),
  `featured-lots.tsx` (lots vedettes en cascade), `trust-strip.tsx` (Whisp·FAO, carte CCC, RDUE,
  Sentinel-2 — méthodes/régulateurs, **aucun faux témoignage**), `origins-map.tsx` (carte Leaflet
  des origines), `activity-ticker.tsx` (ruban défilant **illustratif**), `market-faq.tsx` (accordéon
  `AnimatePresence`), `founding-signup.tsx` (capture email locale + animation de succès).
- **Catalogue** : **tri** (pertinence/prix/tonnage), entrée en **cascade** (stagger), puce
  **« vs ICE »** sur les prix, recherche contrôlée depuis le héros.
- **Motion** (skill `/motion-framer`) : reveals staggerés, hover-lift, tracé de graphique, ruban et
  ticker en boucle — le tout `transform/opacity` et **sous `prefers-reduced-motion`**.

### Vérifié
- **148 tests Vitest** verts (+6 `tests/cocoa.test.ts` : normalisation Yahoo, repli, prime/décote).
- `tsc --noEmit` propre ; `eslint` **0 erreur** ; `next build` OK.
- Route `curl /api/market/cocoa?range=1mo` → JSON normalisé (ou repli `stale:true`).

### Frontière (inchangée)
- Cours **réel mais différé + source libellée** ; ticker **illustratif** ; le % « vs ICE » est
  **calculé** (hypothèse FX affichée), jamais inventé. Commerce jamais financement ; le producteur ne
  paie jamais.

## v2.1.0 — 2026-07-13 — AGRIVO Market : vitrine publique autonome (place de marché pro)

Refonte de la marketplace en **produit à part entière**, visuellement détaché de l'app cliente
(décisions Anael : marque dédiée « AGRIVO Market », direction premium sombre & éditorial, entrée
acheteur-first, vitrine publique avec actions gatées, rôles séparés vitrine ↔ cockpit). Inspiration :
Agri Marketplace, Koltiva, SourceTrace, TraceX (principe « Match → Trust → Transact »).

### Ajouté
- **Chrome dédié** : `app/marketplace/layout.tsx` + `components/marketplace/market-header.tsx` /
  `market-footer.tsx` (marque « AGRIVO Market », fond forêt profond, nav Parcourir/Vendre, lien
  discret vers agrivo.io) — détaché du `SiteHeader` du site vitrine et de l'espace applicatif.
- **Accueil acheteur-first** `/marketplace` : hero éditorial + bandeau de crédibilité (lots scellés,
  tonnes, coops, régions) + **catalogue vivant filtrable** (`market-catalog.tsx` : filière · région ·
  sceau · recherche) de `lot-card.tsx` — la confiance avant le prix.
- **Fiche lot publique** `/marketplace/lot/[ref]` (`lot-detail.tsx`) : sceau + 4 critères détaillés,
  **mini-carte des parcelles** (réutilise `PortfolioMap`/Leaflet), **dossier de confiance** (tableau
  producteur · carte · certificat · DDR · superficie · statut), **contrôle d'intégrité pré-embarquement**,
  origine & logistique, carte transaction (prix · valeur · commission estimée), **PDF fiche lot +
  bon de réservation avec QR** (`lot-pdf.tsx`), et **réservation gatée** (parcours public, action →
  connexion). SSG des 6 lots.
- **Landing vendeur** `/marketplace/vendre` : pourquoi/comment publier, take-rate transparent, CTA cockpit.
- **Rôles séparés** : `/app/exportateur/marketplace` recentré en cockpit **« Mes lots »** (publier /
  retirer / suivre + lien vers chaque fiche publique) ; la découverte/réservation vit sur la vitrine.
- **Catalogue enrichi** : `mock-marketplace.ts` gagne 4 lots marketplace (EXP-2026-0004..0007) dérivés
  d'autres parcelles conformes du portefeuille (Méagui, San-Pédro, Daloa vérifiés ; Gagnoa
  volontairement « en préparation » via le verrou d'intégrité) + `findMarketLot`, `findMarketExpedition`,
  `parcellesDuLot`, `MARKET_LOT_REFS`. Le lot café réservé (Nordic Roasters AB) est désormais scellé.

### Vérifié
- **142 tests Vitest** verts (4 nouveaux : catalogue vivant, lot réservé/en préparation, `findMarketLot`).
- `tsc --noEmit` propre ; `eslint` 0 erreur ; `next build` OK (6 fiches lot en SSG).
- Smoke test SSR (`next start`) : `/marketplace`, `/marketplace/vendre` et les 3 états de fiche lot
  (vérifié / en préparation gaté / réservé avec acheteur) rendent correctement.

### Frontière (inchangée)
- AGRIVO Market fait le **commerce** des fèves conformes — jamais le financement/crédit (frontière
  Nanti). La commission porte sur la transaction, **jamais sur le producteur**.

## v2.0.0 — 2026-07-13 — Marketplace du cacao conforme + sceau AGRIVO (double verrou)

Repositionnement stratégique v2 (phase investisseur) : la traçabilité est le produit, la conformité
son livrable, et la **marketplace des lots vérifiés** l'endgame. Client = l'exportateur.

### Ajouté
- **Marketplace MVP fonctionnel** : `data/mock-marketplace.ts` (module pur — `evaluerSceau`,
  `estProducteurCarte`, `takeRate`, `lotsMarche`, dérivé des expéditions déjà tracées) ;
  page publique `/marketplace` (positionnement + double verrou + membres fondateurs) ;
  module `/app/marketplace` (vue **Offre** vendeur : publier/retirer un lot vérifié + take-rate
  estimé ; vue **Demande** acheteur : parcourir, réserver, lien de vérification publique) ;
  composant `components/marketplace/sceau-agrivo.tsx` (badge + détail des 4 critères).
- **Sceau AGRIVO = double verrou anti-fraude** (calculé, jamais affirmé) : ① ségrégation (toutes
  parcelles « Conforme ») ② **carte producteur** (tous les producteurs cartés — ancre d'identité de
  l'État) ③ intégrité (contrôle pré-embarquement « Prêt », réutilise `controleEmbarquement()`)
  ④ références DDR. Gate carte **souple** : un producteur non carté n'est pas supprimé, il exclut
  le lot du sceau jusqu'à régularisation.
- **Take-rate marketplace 1-3 %** ajouté comme 3ᵉ couche de revenu (`/tarifs`) — jamais de frais au
  producteur, jamais de crédit (frontière Nanti maintenue).
- **Repositionnement contenu** : section Marketplace sur l'accueil ; section « double verrou » sur
  `/methodologie` ; entrée Marketplace dans la nav publique et la sidebar exportateur.

### Vérifié
- **138 tests Vitest** (+9 `tests/marketplace.test.ts` : carte CCC, sceau 4 critères + jamais de
  faux sceau, take-rate borné 1-3 %, lots dérivés/vendables) · `tsc` ✓ · `next build` ✓.

## v1.24.0 — 2026-07-11 — Espace exportateur complet (vision client) : assistant d'expédition 3 étapes, jalons déclarables, documents

### Ajouté
- **Composeur d'expédition = assistant en 3 étapes avec Suivant/Retour** (demande Anael : il
  manquait les boutons « Suivant ») : ① Parcelles & tonnages (ségrégation visible, plafonds
  bornés) → ② Informations du lot (acheteur, pays, ports, navire/conteneur optionnels) →
  ③ Récapitulatif + **contrôle pré-embarquement automatique** (moteur pur côté client) → création
  → le dossier s'ouvre directement.
- **Jalons DÉCLARABLES** : bouton « Déclarer le jalon suivant » sur la timeline (composé → départ
  coopérative → reçu port → embarqué → arrivé UE). Le passage à « Embarqué » exige navire + n° de
  conteneur (mini-formulaire). État de session — les données de démo ne sont jamais mutées.
- **« Dossier d'expédition (PDF) »** : le document acheteur imprimable (@react-pdf/renderer à la
  demande) — parcelles d'origine, tonnages/plafonds, jalons datés, QR de vérification publique,
  mention DDS verbatim. FR/EN.
- **« Liste des parcelles (CSV) »** : export tableur du lot (producteur;carte;certificat;
  coopérative;région;ha;tonnes;référence DDR), BOM UTF-8 pour Excel.
- **Suppression d'un lot de session** (les dossiers de démonstration restent intouchables).
- **« Ajouter une coopérative » : check-list documentaire + pièces multi-fichiers** (demande
  Anael) : encart « Ce dont AGRIVO a besoin pour bien analyser une coopérative » (6 pièces :
  registre, agrément/statuts, liste des producteurs, certificats de durabilité, modèle de carte,
  consentements ARTCI) + section « Pièces du dossier » multi-upload — les fichiers restent sur le
  poste, seules les métadonnées sont conservées ; « N pièces au dossier » affiché sur la carte
  coopérative.

## v1.23.0 — 2026-07-11 — Contrôle pré-embarquement (IA) : le screening du lot avant départ

### Ajouté
- **« Contrôle pré-embarquement (IA) »** sur chaque dossier d'expédition — le 7ᵉ usage IA en
  production. **5 points de contrôle factuels** recalculés côté serveur
  (`controleEmbarquement()`, pur et testé) : plafonds anti-fraude (> 90 % signalé), fraîcheur des
  vérifications satellites (> 30 j à la composition), alertes actives dans les coopératives
  contributrices (contexte, sans effet sur le lot — ségrégation), références DDR, logistique
  (navire/conteneur avant « Embarqué »). Verdict QUALITATIF « Prêt à embarquer » /
  « Points d'attention » — jamais de score inventé, jamais de faux « prêt ». Note de synthèse
  rédigée par Gemini (live, repli déterministe étiqueté) via `POST /api/gemini/controle-embarquement`.
- Tonnages du lot démo EXP-2026-0001 ramenés à ~78-80 % des plafonds (5,9 t) : le lot du jury
  sort « Prêt à embarquer » ; EXP-2026-0003 (en composition) montre les points d'attention.

### Vérifié
- 4 nouveaux tests (5 points toujours rendus et bilingues, seuil 90 %, lot démo sous les
  plafonds, point logistique du lot en composition). **Vérification v1.22 complète au préalable :
  révision prod 48 OK/1 faux positif connu + 17/17 contrôles CDP in-app (résumé IA « en direct »
  confirmé à l'écran, ségrégation visible, bloc coop, EN).**

## v1.22.0 — 2026-07-11 — Module « Expéditions » : traçabilité documentaire parcelle → conteneur

### Ajouté
- **`data/mock-expeditions.ts`** (moteur PUR) : lots d'expédition avec **ségrégation stricte**
  (seules des parcelles « Conforme » peuvent composer un lot — le bilan de masse est interdit par
  le RDUE) et **réconciliation des volumes** (tonnage ≤ superficie × rendement régional, le verrou
  anti-fraude existant appliqué au lot) ; 5 jalons documentaires (composé → départ coopérative →
  reçu port → embarqué → arrivé UE·DDS) ; GeoJSON TRACES NT du lot (parcelles d'origine enrichies
  de la référence d'expédition) ; 3 expéditions de démonstration (EXP-2026-0001 arrivée UE,
  0002 embarquée, 0003 en composition).
- **Page « Expéditions » (espace exportateur)** : liste + détail (timeline 5 jalons, tableau des
  parcelles avec certificats cliquables et plafonds, carte satellite du lot, export GeoJSON, QR de
  vérification publique, résumé exécutif IA) + **composeur interactif** où la ségrégation SE VOIT
  (parcelles non conformes refusées à l'écran, tonnages bornés en direct). Entrée sidebar + étape
  du guide interactif.
- **Page publique `/verifier-expedition`** (`?ref=EXP-…`) : le QR du dossier conteneur résout
  publiquement — parcelles d'origine, tonnage, jalons, rappel « évaluation, pas garantie ».
- **API `POST /api/gemini/expedition-memo`** : résumé exécutif du dossier d'expédition (faits
  recalculés côté serveur, réécriture Gemini live, repli déterministe étiqueté).
- **Coopérative** : bloc « Vos parcelles en expédition » (dashboard, lecture seule) — la coop voit
  où va son cacao.
- **Site public** : « Comment ça marche » passe à 6 temps (« Expédiez, prouvé ») ; tarifs
  (Essentiel : 5 dossiers/mois · Pro : illimités) ; méthodologie (« Du certificat au conteneur ») ;
  FAQ (« Suivez-vous les camions et les sacs ? » — non-revendication honnête, complémentaire SNT).

### Vérifié
- 10 nouveaux tests (`tests/expeditions.test.ts`) : ségrégation, plafonds, lots démo irréprochables,
  GeoJSON du lot, jalons ordonnés, recherche publique, unicité des références, vue coopérative.

## v1.21.1 — 2026-07-11 — Le QR de TOUT PDF émis résout sur la vérification publique

### Corrigé
- **Les certificats des parcelles de scénario résolvent désormais sur `/verifier-certificat`**
  (AGV-2026-0600 « Tanoh Michel », AGV-2026-0602 « Koffi Bertrand ») : le parcours de vérification
  peut émettre leur PDF, mais la page publique ne cherchait que dans le portefeuille — le QR
  imprimé tombait sur « Certificat introuvable ». Nouveau helper `findCertificat()`
  (portefeuille + scénarios, insensible à la casse) partagé par la page publique.

### Vérifié
- 5 nouveaux tests (`tests/certificat-lookup.test.ts`) : TOUS les numéros émis par le site
  résolvent (45 parcelles + scénarios), unicité des numéros, casse/espaces, inconnus → introuvable.

## v1.21.0 — 2026-07-11 — Guide interactif rejoué à CHAQUE connexion des comptes démo

### Modifié
- **Le guide interactif (visite « spotlight ») s'ouvre désormais à TOUTES les connexions des
  comptes de démonstration** (`coop@test.com`, `export@test.com`), plus seulement à la première :
  la connexion démo efface les drapeaux « visite vue » (`agrivo:tour:v2:*`). Dans une même session,
  le guide ne se rouvre pas à chaque retour au tableau de bord (anti-agacement) ; le bouton « ? »
  reste la relance manuelle. Les comptes créés par inscription gardent le comportement « une fois ».
- Clés et réinitialisation du guide extraites dans **`lib/tour.ts`** (partagé entre
  `onboarding-tour` et `auth-provider`, évite tout import circulaire).

### Vérifié
- 3 nouveaux tests (`tests/tour.test.ts`) : mapping rôle→clé, réinitialisation qui n'efface que les
  drapeaux du guide, robustesse sans stockage. Gates complets (tsc · Vitest · build).

## v1.20.1 — 2026-07-11 — Grille tarifaire structurée (analyse de marché) : paliers, sponsoring, Enterprise

### Ajouté
- **/tarifs — structure alignée sur le marché** (analyse comparative Koltiva/Meridia ~2-5 $/producteur/an,
  plateformes RDUE européennes sur devis) sans changer les trois prix de lancement :
  - Coopérative : **« Jusqu'à 1 000 producteurs · +50 000 FCFA/mois par tranche de 1 000 »** (fin du
    forfait unique mal calibré aux extrêmes) ;
  - **Sponsoring exportateur** (le flux d'argent réel de la filière) : Essentiel inclut l'abonnement
    d'1 coopérative de son réseau, Pro en inclut 3 (+100 000/mois par coopérative supplémentaire) ;
  - bandeau **« Tarifs de lancement — premières coopératives et premiers exportateurs partenaires »** ;
  - bandeau **Enterprise sur devis** (multi-pays, SSO, intégrations SI, volumes) → /contact.

## v1.20.0 — 2026-07-11 — Analyse Whisp EN DIRECT aux paramètres officiels (clé posée), panneau détaillé v3, ROI tarifs

### Ajouté
- **Détection satellite RÉELLE ACTIVE** : `WHISP_API_KEY` posée (local + Vercel production). Chaque
  vérification hors scénario est désormais analysée EN DIRECT par l'API officielle Whisp v3
  (FAO Open Foris / Google Earth Engine), **avec les mêmes paramètres que whisp.openforis.org** :
  `analysisOptions { unitType: "ha", nationalCodes: ["ci"], externalIdColumn: "agrivoId" }` —
  les données nationales Côte d'Ivoire (carte cacao BNETD) sont incluses et l'id AGRIVO de la
  parcelle est tracé de bout en bout (`external_id`). Validé par appels réels (HTTP 200 ≈ 8 s).
- **Parseur du modèle officiel v3** (`lib/ai/whisp-live.ts`) : les **11 indicateurs**
  `Ind_01…Ind_11`, les **3 catégories de risque** (`risk_pcrop`/`risk_acrop`/`risk_timber`), la
  surface, la localisation GAUL, les couvertures par jeu de données (GFC, BNETD, FDaP, ETH, TMF,
  RADD…), la version Whisp et le jeton d'analyse. **Verdict par filière** : cultures pérennes →
  pcrop, soja → acrop, bois → timber, bovins/inconnu → le pire des trois (jamais de faux
  « Conforme »). File d'attente gérée (202 → sondage `/api/status/{token}`), budget 52 s,
  `maxDuration 60` sur la route.
- **Panneau « Analyse Whisp officielle · v3 · Google Earth Engine »** à l'étape d'analyse
  (analyses live uniquement — zéro pourcentage inventé en repli) : 4 indicateurs cœur + les 11
  repliables, 3 catégories de risque (celle de la filière surlignée), couvertures en % réels,
  version + horodatage + jeton (traçabilité auditable). Convergence de preuves reconstruite sur
  les vraies valeurs (localisation confirmée, perturbation post-2020 en %).
- **/status** : le ping automatique du moteur passe sur une parcelle de scénario (préserve le
  quota Earth Engine) + nouvelle carte « API Whisp (FAO) · appel en direct » à la demande
  (bouton, verdict + latence réelle affichés).
- **/tarifs — la valeur en face de chaque prix** : ligne ROI par plan (« l'équivalent d'un kilo
  de cacao par producteur et par an » · « moins qu'un poste de chargé de conformité » · « une
  fraction de la valeur d'un seul conteneur »), analyse satellite FAO en direct affichée sur le
  plan Coopérative, SLA relié à l'état public des services, mention « sans engagement + données
  propriété de la coopérative (loi n° 2013-450, ARTCI) ».

### Corrigé
- Les CTA « Nous contacter » des plans exportateur pointaient vers le dashboard coopérative →
  ils mènent au formulaire de contact ; « Commencer » (Coopérative) conserve l'accès démo.
- Attente honnête à l'analyse : au-delà de 4 s, le libellé annonce « Analyse satellite en direct
  (Google Earth Engine)… jusqu'à ~30 s ».

### Vérifié
- `tsc` ✓ · **107 tests Vitest** ✓ (dont fixture RÉELLE de l'API du 11/07/2026) · `next build` ✓ ·
  2 appels réels validés (external_id restitué, colonne BNETD présente, risques low) ·
  vérité terrain prod post-deploy (verdicts live des parcelles de démo).

## v1.19.0 — 2026-07-11 — Détection Whisp réelle (activable), performance images, page /status, repo assaini

### Ajouté
- **Intégration RÉELLE de l'API Whisp (FAO Open Foris)** — `lib/ai/whisp-live.ts` : dès que
  `WHISP_API_KEY` est posée (compte gratuit sur whisp.openforis.org), la route
  `/api/whisp/verify` envoie l'anneau du polygone à l'API officielle et le verdict vient de sa
  catégorie de risque (mapping défensif : faible → Conforme, élevé → Anomalie détectée, ambigu →
  Données insuffisantes). Badge « Détection satellite FAO · en direct » sur l'analyse. Les
  parcelles de scénario (`sc-*`) et verdicts forcés restent déterministes : la démonstration ne
  dépend jamais du réseau. Repli garanti sans clé/échec/timeout (comportement historique).
  5 nouveaux tests (`tests/whisp-live.test.ts`).
- **Page publique `/status`** : chaque service vérifié EN DIRECT depuis le navigateur du visiteur
  (moteur de verdicts, assistant IA, API REST exportateur, vérification publique) — socle de
  l'engagement de disponibilité (SLA) de l'offre Pro. Lien dans le pied de page.
- **Score de résilience des sols** : désormais dérivé de façon stable du dossier (3 profils
  Élevé/Moyen/À renforcer avec explications distinctes) — plus jamais une valeur constante.

### Performance
- **Images de la landing : 6,6 Mo → 1,6 Mo (-76 %)** — les 8 visuels de filières + la canopée
  convertis en WebP (≤ 1600 px), anciens JPG retirés. Chargement mobile nettement plus rapide.

### Assaini (lisibilité du dépôt pour l'évaluation IA)
- **Racine du dépôt réduite à 8 documents de référence** (README, CHANGELOG, SPECS,
  ARCHITECTURE, PLAN_V2, GUIDE_DEMO_JURY, CLAUDE, IMAGES_CREDITS) ; ~25 journaux de construction
  déplacés dans `docs/archives/` (README d'archives explicite).
- **ARCHITECTURE.md** : schéma sans scoring crédit (pivot Valorisation), routes à jour (API REST
  exportateur, rdue-qa…), ADR-1/ADR-6 reformulés (activation par clé, chemin V2), versioning réel.
- **GUIDE_DEMO_JURY.md** : bandeau « état actuel » (v1.18+, 92 tests, comptes à jour, pitch pur
  sans démo), comptes démo corrigés. **SPECS.md** et **CLAUDE.md** : bandeaux d'état actuel.

### Vérifié
- `tsc` ✓ · 97 tests Vitest ✓ · `next build` ✓ · révision prod complète re-jouée.

## v1.18.1 — 2026-07-11 — Offre Pro tangible (API REST + rapport consolidé), purge « démo », README v1.18

### Ajouté (justification concrète des offres exportateur 500 000 / 1 000 000 FCFA)
- **API REST d'export en masse — réelle et démontrable** : `GET /api/exporteur/portefeuille`
  (+ filtre `?statut=conforme|anomalie|insuffisant`) renvoie le portefeuille en GeoJSON RFC 7946
  au format TRACES NT. Lien cliquable dans le Dossier acheteur (« API REST · offre Pro »).
- **Rapport consolidé EUDR téléchargeable** (Dossier acheteur) : en-tête daté, indicateurs, résumé
  exécutif s'il a été généré, liste complète des parcelles avec n° de certificat.
- **Copier le résumé exécutif** en un clic (presse-papiers, confirmation visuelle).

### Corrigé / présentation
- Mentions « démonstration » retirées des écrans produit non autorisés : sous-titre de l'espace
  exportateur, message « parcelle introuvable » (fiches locales) — les boutons de démo assumés
  (connexion 1 clic, « Remplir un exemple (démo) », registre/scénarios de démonstration, console
  admin) sont conservés tels quels.
- **README aligné v1.18** (lu par l'IA de pré-sélection) : comptes démo à jour, espaces coopérative
  (page Certificats) et exportateur multi-pages détaillés, tarifs Essentiel/Pro, 39 faits assistant,
  API REST.

### Vérifié
- `tsc` ✓ · tests Vitest ✓ · `next build` ✓ · smoke prod complet (pages + API).

## v1.18.0 — 2026-07-10 — Intégration v0 : espaces multi-pages, guide spotlight, tarification Essentiel/Pro

### Ajouté (issu des améliorations v0, portées sur la v1.17)
- **Espace exportateur multi-pages** : le menu latéral gagne des pages dédiées — Coopératives
  (avec « Ajouter une coopérative » + **carte des sièges**), Producteurs consolidés, Parcelles,
  **Dossiers & rapports** (dossier acheteur + alertes) et Assistant IA. Le tableau de bord à
  onglets reste la page d'accueil de l'espace.
- **Espace coopérative** : nouvelle page **Certificats** dans le menu latéral.
- **Explication de verdict enrichie** (`verdict-explication.tsx` + `lib/verdict-explanations.ts`)
  sur l'analyse et la fiche parcelle : causes réelles et marche à suivre par verdict.
- **Transitions de page** (`app/app/template.tsx`) + raffinements landing et dashboard.
- **Guide interactif version spotlight** (celle validée par Anael) : surligne les vrais éléments
  de la page, ancres `data-tour` dans la sidebar et les dashboards.
- **Base assistant enrichie** : nouveaux faits (offres exportateur Essentiel/Pro, verdicts
  expliqués, ajouter une coopérative, dossier acheteur, équipe) + **scoring amélioré** (mots-clés
  courts appariés en mot entier). Fusionné AVEC le small-talk et le guidage v1.15-1.17 conservés.

### Modifié
- **Tarification (référence v0)** : Coopérative **100 000** · **Exportateur Essentiel 500 000** ·
  **Exportateur Pro 1 000 000 FCFA/mois** (page Tarifs 3 colonnes, fait assistant, badge de
  l'espace exportateur).

### Conservé (v1.15 → v1.17, non régressé)
- OCR caméra réel (jamais de résultat démo), assistant court, hero d'accueil d'un seul bloc,
  scan mobile (caméra + netteté), hero FAQ, comptes démo `coop@test.com` / `export@test.com`.

## v1.17.0 — 2026-07-10 — OCR réel, assistant resserré, deux paliers exportateur, comptes démo

### Corrigé
- **OCR caméra : plus jamais de résultat de démonstration lors d'un vrai scan.** La route
  `/api/gemini/scan` retombait systématiquement sur le mock « Kouassi Yao » quand Gemini échouait
  ou lisait une image vide. Désormais, en production (clé posée) : lecture RÉELLE de la photo ; si
  la carte est illisible (floue, vide, autre document) ou si l'appel échoue → champs vides →
  l'application redemande une photo nette ou propose la saisie manuelle. Le résultat pré-enregistré
  ne sert plus qu'en développement local sans clé. Prompt Vision durci (« n'invente jamais un nom »).

### Modifié
- **Assistant IA — réponses courtes et plus utiles.** 1 à 3 phrases maximum (au lieu de 3-4),
  `maxOutputTokens` 600 → 320. Il peut reformuler et combiner librement les faits de la base
  (qualité conversationnelle) tout en gardant l'interdiction d'inventer un chiffre/date et le refus
  poli du hors-sujet.
- **Deux paliers exportateur (tarifs justifiés par des fonctionnalités réelles).**
  « Exportateur · Suivi » à **500 000 FCFA/mois** (portefeuille multi-coopératives, cartographie,
  4 KPI + tableau, centre d'alertes, dossier acheteur, assistant IA) et « Exportateur · API &
  intégration » **dès 1 000 000 FCFA/mois** (API REST, export en masse, TRACES NT, multi-utilisateurs,
  SLA). Chaque ligne correspond à un onglet réel du tableau de bord exportateur.
- **Comptes de démonstration** : coopérative `coop@test.com` / `123TestCoop123`, exportateur
  `export@test.com` / `123TestExport123` (les boutons « 1 clic » utilisent ces constantes).

### Vérifié
- Conformité au **Guide des compétiteurs VIBEATHON CI 2026** (grille jury 20/25/20/15/20, IA
  Execution 25 % + Technical Excellence 20 %) : priorité au produit réellement opérationnel.
- Langues : interface FR/EN uniquement (dioula/baoulé déjà absents du site — confirmé).
- `tsc` ✓ · tests Vitest ✓ · `next build` ✓ · déployé + alias `agrivo-io.vercel.app`.

## v1.16.1 — 2026-07-10 — Hero d'accueil : apparition d'un seul bloc (fin du délai fond-puis-éléments)

### Corrigé
- **Le hero de l'accueil apparaît désormais d'un seul bloc.** Avant, le fond (mesh gradient)
  était peint immédiatement tandis que le contenu restait invisible jusqu'à l'événement
  `agrivo:enter` (ou un fallback de 2,5 s), puis entrait en cascade (délais 0,15 → 1,1 s) →
  on voyait le fond seul, puis les éléments un par un.
- **Correctif** : (1) l'entrée se déclenche **dès le montage** (pendant que le splash recouvre
  encore la page), plus à `agrivo:enter` ni au fallback ; au lever du splash, fond et contenu
  sont déjà en place. (2) Tous les éléments partagent **le même fondu, sans décalage** (délai 0),
  au lieu d'une cascade. Fondu unifié bref (~0,55 s) en arrivée directe ; `reduced-motion` reste
  visible immédiatement.

### Vérifié
- `tsc` ✓ · tests Vitest ✓ · `next build` ✓ · déployé + alias `agrivo-io.vercel.app`.

## v1.16.0 — 2026-07-10 — Scan mobile réparé (caméra + netteté), hero FAQ unifié (veille du jury)

### Corrigé
- **Caméra du scan (mobile) — bug réel corrigé** : le flux vidéo était attaché AVANT le montage de
  l'élément `<video>` (rendu conditionnel) → écran noir systématique au clic « Activer la caméra ».
  Le flux est désormais attaché par un effet après montage, et la vidéo est en `autoPlay`.
- **Parcours mobile clarifié** : bouton principal « Activer la caméra » (puis « Scanner la carte »
  une fois la caméra active), bouton secondaire « Saisir manuellement la carte producteur ».
  Message explicite si l'accès caméra est refusé.

### Ajouté
- **Contrôle de netteté avant OCR** (variance du Laplacien sur miniature) : une photo franchement
  floue n'est pas envoyée — message « Image floue : … reprenez la photo », caméra laissée active
  pour reprendre immédiatement. Message dédié si la lecture échoue (réseau/illisible).
- **Hero FAQ unifié** : la page FAQ reprend le hero sombre signature (`PageHero`) comme
  Méthodologie, À propos et Tarifs — l'ensemble des pages de navigation est désormais cohérent.

### Vérifié
- `tsc` ✓ · tests Vitest ✓ · `next build` ✓ · déployé + alias `agrivo-io.vercel.app`.

## v1.15.0 — 2026-07-10 — Assistant conversationnel fiabilisé, guidage in-app, README aligné (J-1 jury)

### Ajouté
- **Small-talk déterministe de l'assistant** : « bonjour », « merci », « ça va ? », « au revoir »
  reçoivent une réponse chaleureuse **instantanée et identique en live comme en repli** (aucun quota
  IA consommé) ; un salut suivi d'une vraie question passe au circuit normal.
- **4 faits de guidage in-app** dans la base de connaissances (33 faits au total) : relancer le
  guide interactif (bouton « ? »), importer/exporter le registre, ajouter un producteur, modifier
  profil/mot de passe/langue — l'assistant guide écran par écran même sans IA live.

### Corrigé / cohérence
- **README réécrit intégralement** : il décrivait encore le micro-crédit (retiré au pivot
  Valorisation), « Gemini Vision », MOCK_MODE et 24 tests — désormais aligné sur le produit réel
  (v1.15, deux espaces, 3 verdicts verbatim, tarifs B2B, usages IA actuels, comptes démo, prod).

### Vérifié
- `tsc` ✓ · tests Vitest ✓ (small-talk + guidage couverts) · `next build` ✓.
- Prod re-testée après déploiement (assistant : saluts, guidage, garde-fou finance, hors-sujet).

## v1.14.0 — 2026-07-09 — Guide interactif d'accueil, Assistant AGRIVO complet, dashboards enrichis

### Ajouté
- **Guide interactif d'accueil** : pop-up animé (icônes en ressort, étapes glissées, points de
  progression, clavier, reduced-motion) qui s'ouvre à la **première connexion** sur le tableau de bord —
  **7 étapes coopérative** (dashboard, vérification min. 4 sommets, 3 verdicts, certificat QR, import de
  registre, assistant) et **6 étapes exportateur** (portefeuille lié table↔carte, masque zones sensibles,
  assistant portefeuille, dossier acheteur, alertes). Relançable à tout moment via le **bouton « ? »**
  de la topbar. Drapeau localStorage par rôle.
- **Assistant AGRIVO complet (29 faits)** : sait **se présenter**, guider dans le site, et couvre aussi
  méthodologie, propriété des données/ARTCI, mode hors connexion, langues, vérification publique QR ;
  les demandes complexes ou hors base sont **orientées vers support@agrivo.ci** (règle ajoutée au prompt
  système + repli). Suggestions et accueil du widget mis à jour (auto-présentation).
- **Dashboard coopérative** : bouton **« Exporter (GeoJSON) »** du registre (RFC 7946, prêt TRACES NT)
  + carte **« À re-vérifier »** (parcelles en Données insuffisantes → nouveau passage satellite).
- **Dashboard exportateur** : bandeau **« Répartition des statuts »** (3 statuts verbatim) dans l'analytique.

### Corrigé / cohérence
- Emails placeholder de la page Contact (`@agrivo.example`) → **commercial@agrivo.ci / support@agrivo.ci** ;
  support@agrivo.ci ajouté au pied de page du site.
- Guide présentateur (Ctrl+Shift+D) : mention MOCK_MODE retirée + note « le guide interactif s'ouvre à la
  1re connexion démo ».
- Appariement de l'assistant affiné (« sans internet » → fait hors-connexion).

### Vérifié
- `tsc` ✓ · **76/76 tests** ✓ · `next build` ✓ · ESLint 0.
- **Assistant : 10/10 questions** (présentation, prix, compte, verdicts, CI, masque, support, hors
  connexion, garde-fou crédit, hors-sujet) — dont **6 en IA live**.
- **Parcours UI (Edge/CDP, logué coop démo) : 8/8** — guide interactif (ouverture auto → Suivant →
  Passer → fermé) + 3 exemples + 2 saisies manuelles + garde min. 4 + polygone fermé.

## v1.13.0 — 2026-07-09 — Assistant AGRIVO intelligent, IA « live » assumée, polygone fermé, retrait dioula/baoulé

### Corrigé
- **Polygone non fermé** à la cartographie : le contour s'affiche désormais **fermé** (plus de 3 segments
  ouverts) — `step-mapping` passe `closed` en permanence (le mode « tour de champ » n'existe plus).

### Changé
- **Assistant AGRIVO (ex-Copilote RDUE)** : base de connaissances élargie de 10 à **22 faits** — en plus
  du RDUE, tout AGRIVO (prix 100 000/1 000 000, deux espaces, parcours, 3 verdicts, masque zones sensibles,
  comptes démo, valorisation) + chiffres sourcés (bord champ 1 200 vs revenu vital 1 758 FCFA = +47 %,
  30–40 % du cacao sur terres protégées, simplification −75 %, Ghana faible risque). La route répond
  désormais à **toute** question à partir de la base (fini l'abandon « reformulez votre question ») ;
  garde-fou finance conservé (frontière Nanti).
- **IA « live » assumée** : la clé Gemini est active (prod `mock:false`). Le repli (quota) est une
  **réponse groundée**, plus jamais étiquetée « démonstration » (badges relabelisés « Réponse vérifiée » /
  « Diagnostic vérifié » ; log réseau sans « MOCK_MODE »).
- **Recherche vérifiée (~70 sources)** : faits d'AGRIVO confirmés à jour (échéances, CI risque standard,
  DDS 1er opérateur, Whisp/FAO). FAQ enrichie d'une entrée valorisation sourcée.

### Retiré
- **Dioula / Baoulé** : fonction de traduction du verdict retirée (`step-analysis`), carte d'accueil
  reformulée, préchauffage admin nettoyé, route `traduire-verdict` supprimée. **FR/EN + lecture vocale conservés.**

### Vérifié
- `tsc` ✓ · **74/74 tests** (dont base de l'assistant) ✓ · `next build` ✓ · ESLint 0.
- **Assistant : 6/6 réponses pertinentes** (prix, création de compte, verdicts, CI, masque, garde-fou crédit).
- **Parcours UI (Edge/CDP, logué coop démo) : 7/7** — 3 exemples + 2 saisies manuelles (dans/hors aire
  protégée) + garde min. 4 sommets + **polygone fermé**.

## v1.12.0 — 2026-07-09 — Parcelle ≥ 4 sommets + superficie calculée + masque « zones sensibles » + détection géométrique

### Changé
- **Parcelle = minimum 4 sommets** (Point A/B/C/D…, ajout illimité, retrait bloqué sous 4). La **superficie
  est CALCULÉE** à partir des sommets (`aireHa`, shoelace équirectangulaire), plus de « point unique ».

### Ajouté
- **Détection géométrique réelle** pour la saisie manuelle : croisement parcelle × aires protégées
  (`polygonesSeChevauchent`) → **Anomalie détectée** (recouvre une aire protégée), **Conforme** (hors zone),
  **Données insuffisantes** (polygone dégénéré). Les 3 exemples démo gardent leur verdict pré-défini.
  Modules purs `lib/geo/terrain.ts` (aireHa, pointInPolygon, polygonesSeChevauchent) + `lib/geo/evaluation.ts`.
- **Masque « zones sensibles »** (aires protégées / forêts classées, tracés **indicatifs**, sources WDPA /
  Ministère — **jamais « zones autorisées »**, inexistant) : couche rouge activable par **bouton on/off** +
  légende sur les **3 cartes** (portefeuille coop & exportateur, cartographie, analyse).
  `data/zones-sensibles.ts` + `components/map/zones-sensibles-layer.tsx`.

### Vérifié (test réel refait)
- `tsc` ✓ · **69/69 tests** Vitest (4 nouveaux : aire, croisement) ✓ · `next build` ✓ · ESLint 0.
- **Parcours UI bout-en-bout, logué coop démo** (Edge/CDP) : **6/6** — 3 exemples (Conforme / Données
  insuffisantes / Anomalie) + **saisie manuelle DANS une aire protégée → Anomalie**, **hors zone → Conforme**,
  + garde **min. 4 sommets**.

## v1.11.0 — 2026-07-09 — Saisie « Point A–D » + 3 scénarios de démo (Conforme/Insuffisant/Anomalie)

### Ajouté
- **Étape Cartographie** : saisie des coordonnées **sommet par sommet** au format officiel
  **Sommet · Latitude (Y) · Longitude (X)** (tableau éditable Point A/B/C…, ajout/retrait de sommet).
- **3 exemples analysés (démo)** en un clic, chacun produisant un verdict verbatim : ① **Conforme**
  (zone stable), ② **Données insuffisantes** (couverture nuageuse), ③ **Anomalie détectée** (perte de
  couvert). Implémentés via `SCENARIOS_DEMO` (3 parcelles fictives réalistes, zone Soubré/Nawa) — hors
  portefeuille coop/exportateur. Le verdict découle de `parcelle.statut` (aucun forçage) ; les
  enchaînements existants s'appliquent (conforme → certificat → valorisation ; anomalie → certificat →
  fin ; insuffisant → fin sans certificat).
- Le bouton démo du scan (`CI-CCC-024600`) atterrit directement sur le scénario Conforme
  (`findParcelleByCarte`).

### Vérifié (test réel)
- Moteur `/api/whisp/verify` sur les 3 scénarios : **3/3** verdicts corrects (phrases verbatim).
- **Parcours UI bout-en-bout, logué en compte démo coopérative** (Edge headless/CDP) : **3/3** —
  scan → cartographie → choix scénario → analyse → verdict attendu affiché.
- `tsc` ✓ · 65/65 tests Vitest ✓ · `next build` ✓ · ESLint (0 erreur).

## v1.10.0 — 2026-07-09 — Refonte des deux dashboards + header

### Changé
- **Header /app** : la **Déconnexion** est désormais un bouton visible **à côté du nom** (fini le menu
  déroulant) ; le lien « Site » devient **« Retour à la page d'accueil »**. Les boutons de déconnexion
  ajoutés dans les dashboards (v1.8/1.9) sont retirés (un seul point de déconnexion, dans le header).
- **Périmètre coopérative corrigé** : les pages **Producteurs** et **Parcelles** de l'espace coop
  n'affichent plus que **la coopérative de l'utilisateur** (via `parcellesForCoop()`), au lieu des ~45
  parcelles de toutes les coops. L'espace exportateur garde le **portefeuille complet** — ce qui distingue
  réellement les deux espaces.
- **Statuts verbatim** sur les filtres du dashboard exportateur (« Anomalie détectée », « Données
  insuffisantes »).

### Ajouté
- **Dashboard coopérative** : bloc **« Répartition des statuts »** (barre + légende) sous les KPI —
  Conforme / Anomalie détectée / Données insuffisantes, aux couleurs de la charte.

### Retiré
- **« Vue exportateur »** de la navigation coopérative ; `/app/exportateur` est réservé à l'exportateur
  (et l'admin) — un compte coopérative y est redirigé vers son tableau de bord.

### Vérifié
- `tsc` ✓ · 65/65 tests Vitest ✓ · `next build` ✓ · ESLint (0 erreur).

## v1.9.0 — 2026-07-09 — Deux espaces distincts : Coopérative & Exportateur

### Ajouté
- **Rôles** `coop | exporter | admin` (auth). **Deux comptes démo « 1 clic »** sur `/connexion` :
  **Démo Coopérative** (`client@test.com / 123client123`, Amadou · Coop. de Soubré) et **Démo
  Exportateur** (`export@agrivo.com / 123export123`, Marc · Cacao Export CI). Chaque compte atterrit
  sur SON tableau de bord (coop → `/app/dashboard`, exportateur → `/app/exportateur`).
- **Choix du profil à l'inscription** : bascule **Coopérative / Exportateur** (bullets, placeholders,
  sous-titre adaptés) ; le compte créé atterrit sur le bon espace.

### Changé
- **Navigation par rôle** : l'exportateur a sa propre nav (Tableau de bord + Paramètres) ; la coop
  garde sa nav complète (dont « Vue exportateur ») ; l'admin voit l'espace coop + Admin.
- **RouteGuard** : l'exportateur est confiné à `/app/exportateur` + `/app/parametres` (aucune fuite
  vers l'espace coopérative, pas de « Bonjour Amadou »). Eyebrow topbar role-aware.
- **Dashboard exportateur** personnalisé au compte connecté (prénom réel, note « votre portefeuille »).

### Vérifié
- `tsc` ✓ · 65/65 tests Vitest ✓ · `next build` ✓ · ESLint (0 erreur).

## v1.8.0 — 2026-07-09 — Cible B2B (coop + exportateur), prix ajustés, méthodologie discrète

### Changé
- **Prix** : abonnement coopérative **125 000 → 100 000 FCFA/mois** (plus abordable, base ≈ 1 200
  FCFA/producteur/an) ; API exportateur **1 500 000 → « à partir de 1 000 000 FCFA/mois »** (ratio
  1:10 lisible, prix d'entrée pilote, sans se brader). Répercuté accueil + `/tarifs`.
- **Tableau de bord coopérative** : salutation personnalisée **« Bonjour <prénom du compte connecté> »**
  (le compte de démo reste « Amadou ») ; chip abonnement 100 000 FCFA/mois ; **bouton Déconnexion** visible.
- **Vue exportateur** : chip « API exportateur · à partir de 1 000 000 FCFA/mois » + **bouton Déconnexion**.
- **Aperçu du portefeuille (hero d'accueil)** : recadré en **portefeuille exportateur** (santé des coops :
  « À jour / À surveiller / Action requise ») — distinct des 3 verdicts de parcelle ; chiffres cohérents.
- **Méthodologie** : page réécrite côté client, orientée « aligné sur le règlement (UE) 2023/1115 »
  (bonne date pivot, bon format, bon livrable), sans exposer le « comment » technique.
- **Certificat** : intitulé unifié **« Certificat d'évaluation de conformité »** (aperçu, PDF, accueil, À propos).
- **Fond animé du hero** ajouté aux sections « Convergence de preuves » (méthodologie) et « Ce qui arrive
  ensuite » (À propos).
- **Équipe valorisée** : Anael = **Fondateur & chef de projet · Produit & plateforme web** ; titres
  d'ingénierie pour Christ (mobile), Gaddiel (backend & API), Domy (conformité & réglementaire).

### Retiré
- Mentions techniques **« Gemini Vision » / « Gemini » / « Whisp »** de tout le **texte visible**
  (scan, analyse, logs exportateur, FAQ, aide, admin, pages légales) → « lecture automatique », « IA »,
  « moteur satellite (FAO) ». Le code interne (routes `/api/gemini`, types `WhispResult`) est inchangé.
- Étape cartographie : options **« Tour de champ GPS » / « Point central »** supprimées — Agrivo ne
  collecte pas la donnée terrain ; la **coopérative fournit ses coordonnées** (pré-remplies en démo,
  zone de Soubré). Bouton **« Remplir un exemple (démo) »** ajouté au scan et à la cartographie.

### Vérifié
- `tsc` ✓ · 65/65 tests Vitest ✓ · `next build` ✓ · ESLint (0 erreur).

## v1.7.1 — 2026-07-08 — Positionnement certificat (DDS) + équipe à jour

### Changé
- **Avertissement du certificat renforcé** (aperçu à l'écran, PDF téléchargé et page publique
  `/verifier-certificat`) : le certificat « atteste l'évaluation réalisée par Agrivo » et « ne
  remplace pas la déclaration de diligence raisonnée (DDS) de l'exportateur, seul responsable de
  la conformité au sens du règlement (UE) 2023/1115 ». Motif : aucun organisme n'est agréé pour
  « certifier » la conformité RDUE — positionnement d'évaluation assumé et juridiquement exact.
- **Équipe** : Fatim retirée du site (accueil + À propos) ; rôles affichés alignés sur l'équipe
  réelle (Christ = application mobile, Gaddiel = backend & API) ; grilles équipe en 4 colonnes.

### Retiré
- Entrée FAQ « Pourquoi pas de crédit aux producteurs ? » (le site public n'introduit plus le
  sujet du crédit) ; « micro-loan eligibility » purgé du message d'accueil EN de l'assistant
  exportateur (résidu d'avant le pivot Valorisation).

### Interne
- Clés de copy renommées (`kpi.credits` → `kpi.dossiers`, `nextCredit` → `nextValorisation`) :
  grep « credit/crédit » sans occurrence UI dans `app/` + `components/`.

### Vérifié
- `tsc` ✓ · 65/65 tests Vitest ✓ · `next build` ✓.

## v1.7.0 — 2026-07-07 — Version finale du site vitrine (pro, client-facing)

### Changé
- **Navigation** : nouvel onglet « Accueil » avant « Méthodologie » (desktop + mobile). Toute
  navigation interne vers l'accueil (onglet, logo) saute l'écran de bienvenue : il ne s'affiche
  plus que sur un rafraîchissement ou une arrivée directe par l'URL.
- **Heros unifiés** : Méthodologie, À propos et Tarifs reprennent le fond signature du hero de
  l'accueil (mesh gradients + grille + grain, composants `hero-bg.tsx` / `page-hero.tsx`).
- **Dé-technicisation client** de toutes les pages publiques : plus de GeoJSON/WGS-84/RFC 7946/
  « API Whisp »/« MVP »/« démo » dans le texte vitrine — reformulés en langage client
  (« contour précis de la parcelle », « format géographique officiel », « déclaration
  européenne »). Le schéma « Donnée, IA, Résultat » de la méthodologie est réécrit.
- **Corrections wording** : « en cinq temps » → « en 5 étapes » ; l'étape « Le satellite juge »
  accorde correctement « expliqué et certifié » ; « Trois états de résultat… une force, pas une
  faiblesse » (ton interne) → « Trois verdicts possibles, toujours expliqués » ; FAQ sans le mot
  « jury » ; contact sans note interne « à remplacer » ; « SLA garanti » → « engagement de
  disponibilité (SLA) ».
- **Charte** : la persona Yao ne parle plus d'emprunt (« emprunter 150 000 FCFA » retiré) ;
  prix EN corrigé 120 000 → 125 000 (résidu) ; badge hero « SNT » explicité.
- **Design des cartes de l'accueil** : traitement premium unifié (lift au survol, halo, barre
  d'accent en dégradé, icônes sur fond dégradé annelé, guillemet décoratif sur les personas,
  avatars annelés) sur Fonctionnalités, Personas, Modèle, Verdicts, Équipe.
- **IA** : le Copilote RDUE propose des questions de suivi (déterministes, jamais déjà posées) ;
  le popover « Score des sols » affiche un message honnête en cas d'erreur réseau au lieu d'un
  « génération… » éternel.

## v1.6.0 — 2026-07-07 — Enjeu national sourcé + préchauffe TOTALE (démo increvable)

### Ajouté
- **Section « Enjeu national » (landing)** : au-delà des chiffres marché du Conseil Café-Cacao,
  une bande d'impact SOURCÉE frappe à l'échelle du pays — 1ᵉʳ producteur mondial (~45 % de
  l'offre), plus de 6 M de personnes vivant du cacao, 66 % du cacao ivoirien exporté vers l'UE
  (le débouché n°1, directement visé par le RDUE). Chiffres cités (USDA FAS 2025, Trase) :
  renforce l'axe Impact ET respecte la charte « aucun % inventé ».
- **Préchauffe démo TOTALE + verdict pré-vol (admin)** : le bouton de préparation réchauffe
  désormais LES SIX routes IA de rédaction (plan d'action, argumentaire, copilote RDUE, revue
  registre, dossier acheteur, verdict langue locale) — plus seulement 2 — avec les payloads du
  déroulé, et confirme que chacune répond en direct. Un bandeau pré-vol synthétise « Démo prête :
  N/6 en direct » (ou signale une erreur réseau), en tenant compte du MOCK_MODE réel. Attaque
  frontalement le risque n°1 du jour J : l'incident IA en plein pitch.

## v1.5.0 — 2026-07-07 — Trois usages IA premium : revue registre, dossier acheteur, terrain multimodal

### Ajouté
- **Revue IA du registre** (dashboard coop) : couche de vigilance FINE au-delà de l'audit
  géométrique. Module pur `lib/registre/revue.ts` détecte des signaux faibles (≥ 3 superficies
  strictement identiques, noms quasi-dupliqués par distance d'édition, superficies atypiques,
  matricules consécutifs géographiquement dispersés). 100 % déterministe côté client (les
  géodonnées ne quittent pas le navigateur) ; `/api/gemini/registre-revue` ne fait que reformuler
  les motifs (même nombre, même ordre, aucun chiffre changé). Charte : « points à vérifier »,
  JAMAIS « Anomalie détectée ». 7 tests.
- **Dossier acheteur EUDR** (onglet exportateur) : consolide les parcelles Conformes en un dossier
  prêt pour l'acheteur européen — faits déterministes (nb Conformes, hectares vérifiés, coops,
  filières), résumé exécutif rédigé par `/api/gemini/dossier-acheteur`, export GeoJSON joint
  (RFC 7946). « Évaluation, non garantie » ; l'opérateur reste responsable ; zéro finance.
- **Diagnostic visuel de parcelle** (Gemini Vision, étape d'analyse) : photo terrain →
  `/api/gemini/parcelle-photo` décrit des observations qualitatives (culture, canopée, ombrage,
  agroforesterie). Additif : n'établit PAS le verdict (exclusivité Whisp), étiqueté comme tel.
- **Verdict expliqué en langue locale** (Dioula / Baoulé, étape d'analyse) :
  `/api/gemini/traduire-verdict` traduit l'EXPLICATION (jamais le statut, qui reste figé en
  français). Repli honnête : si l'IA est indisponible, on rend le texte original sans fabriquer
  de fausse traduction.
- Cinq routes IA de plus (8 → 13 usages IA au total), toutes avec repli déterministe : la démo
  ne dépend jamais d'un appel live. 65 tests Vitest (58 + 7).

## v1.4.0 — 2026-07-07 — Copilote de conformité RDUE (8ᵉ usage IA) + honnêteté hébergement

### Ajouté
- Copilote de conformité RDUE : assistant conversationnel flottant (dashboard coopérative + FAQ)
  qui répond aux questions du gérant sur le règlement (UE) 2023/1115 — échéances, risque pays,
  géolocalisation, dépôt de la déclaration, sanctions, date de coupure 2020. Chaque réponse est
  GROUNDÉE sur une base de faits curée et SOURCÉE (`lib/ai/rdue-faits.ts`, 10 faits vérifiés :
  révision (UE) 2025/2650 de déc. 2025, benchmarking pays du 22 mai 2025). Gemini ne fait que la
  mise en mots ; il ne peut ni inventer un chiffre, ni sortir des faits, ni parler de crédit.
- Route `/api/gemini/rdue-qa` : garde-fou charte déterministe AVANT tout appel IA (toute question
  de crédit/financement est renvoyée à la frontière Nanti), grounding des faits injecté au prompt,
  repli déterministe sourcé si Gemini est indisponible. Badge honnête « IA en direct » / « Base
  RDUE vérifiée ». Widget bilingue FR/EN, questions d'amorce, citation de la source par réponse.
- 58 tests Vitest au total (47 + 11) : appariement des faits, garde-fou finance, hors-sujet,
  bilingue, complétude de la base — le repli fonctionne même sans clé Gemini.

### Corrigé
- FAQ, protection des données : la mention « hébergement souverain » (qui contredisait la page
  Confidentialité, hébergée sur Vercel pendant le pilote) est remplacée par une formulation
  honnête et défendable — registre des traitements, chiffrement des échanges, hébergement Vercel
  au pilote, hébergement régional prévu en production. Aligne la FAQ sur la posture réelle.

## v1.3.0 — 2026-07-07 — Mode terrain PWA (tour de champ GPS réel) + filet anti-quota IA

### Ajouté
- Cartographie, mode « Tour de champ GPS (réel) » sur mobile : là où le web simulait la marche,
  la PWA écoute désormais la géolocalisation réelle de l'appareil (`watchPosition`, haute
  précision). Un waypoint se pose tous les ~8 m (filtre du bruit GPS à l'arrêt), compteurs live
  réels (waypoints, distance parcourue, précision ±m de l'appareil, distance de retour au départ),
  fermeture du polygone dès 3 sommets, validation de l'emprise Côte d'Ivoire, anneau fermé au
  standard GeoJSON RFC 7946 (6 décimales). Une seule application, du bureau du gérant au bord du
  champ, sans passer par un store. Les modes simulés (point central, tour de champ, « j'ai déjà
  les coordonnées ») restent inchangés sur desktop et en secours. Permission demandée au moment
  de l'usage avec la mention ARTCI ; refus → aucun blocage, les autres modes restent disponibles.
- Géométrie du terrain extraite en module pur testé (`lib/geo/terrain.ts` : haversine, distance
  cumulée, seuil de waypoint, arrondi RFC 7946, fermeture d'anneau, emprise CI) — 6 tests.
- Filet anti-quota de démonstration pour les 2 features IA signatures (`lib/ai/live-cache.ts`,
  2 tests) : une réponse générée EN DIRECT est mémorisée dans le navigateur ; si Gemini plafonne
  (429 du free tier depuis les IP partagées Vercel) lors d'un nouvel appel, la dernière rédaction
  live se ré-affiche pour le MÊME contenu, étiquetée « Rédigé par Gemini à HH:MM » (jamais un
  texte inventé, jamais un autre contenu). Le repli « Mode démonstration » reste le dernier filet.
- Admin, encart « Préparation démo (IA) » : bouton « Préchauffer l'IA (démo) » qui appelle les 2
  routes signatures avec les payloads exacts du déroulé et affiche l'état par feature (IA en
  direct / repli / erreur) — à cliquer en coulisses avant de monter sur scène pour amorcer le cache.
- 47 tests Vitest au total (39 + 8).

## v1.2.1 — 2026-07-07 — Vérification prod + résorption de l'ultra-review (prompts 1 à 5)

### Corrigé
- Console admin : l'écran lisait une constante serveur depuis le client et affichait toujours
  « MOCK_MODE = true » même en IA live ; il interroge désormais l'état RÉEL via /api/admin/etat.
- Pages légales sans placeholders : les « [À compléter : …] » (RCCM, DPO, directeur de la
  publication…) sont remplacés par des formulations honnêtes d'avant-immatriculation ;
  directeur de la publication : Anael Fameni.
- Aperçu du certificat en anglais : date en-GB, filières traduites (Cocoa, Coffee…), coordonnées
  N/S/E/W ; le PDF téléchargé reste le document officiel en français. « Guaranteed SLA » →
  « SLA commitment » (landing EN + tarifs EN).
- SPECS.md aligné sur le pivot (US3 « Accéder au crédit » → « Valoriser la conformité »).

### Amélioré
- Import du registre : démarre replié (une ligne) et s'étend au clic — la colonne du dashboard
  respire ; guide démo mis à jour (un clic de plus).
- Vue exportateur : pastilles de la carte plus lisibles, cadrage initial resserré, bouton
  « Exporter GeoJSON » aligné sur la hiérarchie des CTA, barre de défilement discrète du tableau,
  transitions d'onglets (180 ms, fondu + léger slide, reduced-motion respecté).
- Identifiants du compte démo retirés de l'écran de connexion (le bouton un-clic reste).
- Squelettes de chargement de l'espace /app (silhouette du dashboard) ; états vides contextuels
  (recherche vs filtres) avec bouton de réinitialisation sur Producteurs et Parcelles.
- Eyebrows de sections uniformisés (règle : en-tête de page publique = ambre, section = vert).
- PLAN_V2.md : chemin vers la production réelle (auth serveur, base de données, Whisp live,
  registre de certificats) — post-jury.

## v1.2.0 — 2026-07-06 — « L'auditeur IA » : deux nouvelles features IA sur les moments signatures

### Ajouté
- Plan d'action IA sur l'audit du registre (dashboard coopérative) : après l'audit, Gemini
  transforme les anomalies détectées (comptes exacts, actions bureau/terrain) en plan de
  travail priorisé pour le gérant ; trame déterministe testée, repli démonstration étiqueté
  honnêtement (route /api/gemini/audit-plan, module pur lib/registre/plan.ts).
- Argumentaire de prime IA à l'étape Valorisation : Gemini rédige le brief de négociation de
  la coopérative (portefeuille prouvé, superficie vérifiée, faits de marché sourcés — jamais
  de montant promis), avec bouton copier (route /api/gemini/valorisation-memo, module pur
  lib/ai/argumentaire.ts). Le discours IA passe de 3 à 5 usages en production.
- 7 tests Vitest sur les deux trames déterministes (39 tests au total).
- Favicon (app/icon.svg) : plus de 404 favicon.ico dans la console.

### Corrigé
- Admin : l'encart « Mode démonstration » affirmait « Forcé activé : aucun appel réseau live »
  alors que l'IA est LIVE en production depuis la pose de la clé ; l'écran reflète désormais
  l'état réel (piloté par GEMINI_API_KEY) et liste les usages live.
- Étape Analyse en anglais : la phrase de verdict, le faisceau de preuves et la lecture vocale
  restaient en français ; l'API Whisp renvoie désormais les deux langues et le client choisit.
- Aperçu du certificat en anglais : statut et phrase désormais traduits (le PDF, document
  officiel, reste volontairement en français).
- Étape 1 du parcours : « en quatre temps » contredisait le stepper à 6 étapes (désormais
  « cinq temps : scan, cartographie, analyse, certificat, valorisation »).
- Charte : « cockpit » retiré du sous-titre de la Vue exportateur (« tableau de bord ») ;
  devise de l'étape Valorisation plus jamais en italique ; tirets cadratins retirés des
  listes d'anomalies.

## v1.1.0 — 2026-07-06 — Correctifs UX (cartes réelles partout, coordonnées coop, DDS honnête)

- Vraie carte satellite sur la page parcelle et carte du portefeuille sur /app/parcelles.
- Étape Cartographie : 3e mode « J'ai déjà les coordonnées » (validation zone CI).
- Producteurs : latitude/longitude au formulaire, fiches persistées et cliquables.
- Sidebar « Vue exportateur » clarifiée ; DDS live sans repli silencieux (message d'indisponibilité).

## v1.0.0 — 2026-07-06 — Release de compétition (gel du code)

### Changé (réorientation stratégique — PLAN_REORIENTATION_AGRIVO.md)
- Le micro-crédit producteur est retiré du produit : l'étape 6 du parcours devient
  « Valorisation » (contribution au dossier de conformité de la coopérative, primes de
  durabilité, accès acheteurs premium, partage du dossier avec l'exportateur).
- Purge complète du discours crédit (FR + EN) : hero, splash, landing, tarifs, FAQ,
  méthodologie, à-propos, aide, inscription, CGU, confidentialité, métadonnées, guide de démo.
  Nouvelle promesse : « De la parcelle vérifiée à la prime négociée. »
- Couche IA : evaluerValorisation (XAI commerciale, aucun montant/plafond) remplace le
  scoring de crédit ; le copilote répond sur la valorisation, plus sur l'éligibilité au crédit.
- Posture donnée « de la collecte à l'audit » : section « Comment ça marche » réécrite
  (Importez votre registre → AGRIVO l'audite → Complétez les trous → Le satellite juge → Valorisez).

### Ajouté
- Import & audit RDUE du registre de la coopérative (dashboard) : fichiers .geojson/.json/
  .kml/.csv parsés 100 % côté client, audit (polygones ouverts, doublons, polygone manquant
  à partir de 4 ha, chevauchements, hors zone), % prêt RDUE, actions « terrain » ou « bureau »,
  fichier de démonstration à défauts volontaires (30 parcelles, 63 % prêtes).
- /verifier-certificat : rappel des trois statuts possibles et lien méthodologie.
- 8 tests Vitest sur le module d'audit du registre (32 tests au total).

### Corrigé
- Reduced-motion : le hero et les sections de la landing ne peuvent plus rester invisibles
  (état initial = état final ; fallback d'entrée 2,5 s).
- Cockpit exportateur : eyebrow « Espace exportateur » (route-aware), colonnes du tableau.
- KPI « Dossiers partagés » en teinte verte ; détails d'anomalie bilingues ; accessibilité
  (role=meter sur la jauge d'audit).

## v1.0.0-rc.1 — 2026-07-06 (release candidate)

### Ajouté
- Intelligence artificielle réelle (Gemini) : OCR de la carte producteur, rédaction du mémo de
  diligence, copilote portefeuille, avec repli mock automatique en cas d'échec ou de clé absente.
- Vérification publique de certificat : page /verifier-certificat et QR code imprimé dans
  chaque certificat PDF.
- PWA : manifeste, icônes, service worker prudent, page hors connexion.
- Guide présentateur intégré (Ctrl+Shift+D) : déroulé de démonstration, comptes, phrases clés.
- SEO : métadonnées OpenGraph, robots.txt, sitemap.xml.
- Preuves de méthode : SPECS.md (user stories et critères d'acceptation), ARCHITECTURE.md
  (mini ADR et plan de rollback), pipeline CI GitHub Actions (lint, types, tests, build),
  24 tests Vitest sur les fonctions critiques.
- Schéma « Donnée, IA, Résultat » sur la page méthodologie.

### Corrigé
- Repli sur le résultat pré-enregistré si l'API IA ne répond pas (robustesse de démonstration).
- Alias de production agrivo-io.vercel.app réassigné au déploiement courant.

### Vérifié
- 24 tests passants : 4 KPI officiels, export GeoJSON RFC 7946 (ordre lon/lat, 6 décimales,
  anneaux fermés), bornes du scoring de crédit (50 000 à 250 000 FCFA), niveaux de risque,
  raisonnement du copilote, statuts figés de la charte, comportement sans clé API.
- Build de production : 32 routes, TypeScript strict sans erreur, lint sans erreur.

## v0.9 — Sessions 1 à 9 (juillet 2026)

Fondations, splash et hero, site vitrine, dashboard coopérative et consentement ARTCI, golden
path de vérification (carte satellite, certificat PDF, micro-crédit), dashboard exportateur
(analytique, assistant, alertes), authentification, 7 filières RDUE, pages légales, refonte
design (Space Grotesk, vert signal), 5 features IA explicables, interface FR/EN (vitrine).

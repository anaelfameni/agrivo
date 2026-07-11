# AUDIT UX/UI — Interface client AGRIVO (P4, 2026-07-06)

> Audit mené sur build de production locale (Next 16, port 3111), captures Edge headless
> (`--force-prefers-reduced-motion`, desktop 1440 & mobile 390, FR + EN via `dev-seed.html`).
> Zones : landing, connexion, /app/verifier (6 étapes), dashboard coopérative, dashboard
> exportateur, page parcelle, pages publiques (verifier-certificat, tarifs, méthodologie).
> **Aucune correction appliquée dans ce prompt** — exécution priorisée en P5.

Sévérités : **CRITIQUE** (casse la démo ou l'accessibilité) · **HAUTE** (nuit à la crédibilité
« produit fini ») · **MOYENNE** (polish) · **BASSE** (nice-to-have).

---

## 1. Landing `/` — note : 7,5/10

- **L1 · CRITIQUE — Hero quasi vide en `prefers-reduced-motion`.** En reduced-motion, le hero
  n'affiche que les chips de filières : titre, sous-titre, CTA et aperçu de dashboard restent
  invisibles (états `initial` d'animation jamais résolus). Un juré avec cette préférence système
  (ou un projecteur/OS qui la force) voit un écran vert vide. Règle déjà appliquée au logo
  (« initial = état final visible ») à généraliser au hero. Desktop ET mobile.
- **L2 · ~~CRITIQUE~~ FAUX POSITIF (vérifié en P5)** — mesure réelle : scrollWidth = 380 ≤ 390, aucun débordement ; le rognage observé était un artefact du screenshot Edge headless (scrollbar). ~~Débordement horizontal en mobile 390.~~ Titres et cartes de la section
  « Pourquoi c'est urgent » sont rognés au bord droit (« …sur l'exportateur comme s », textes de
  cartes coupés). Vérifier `scrollWidth == innerWidth` ; suspects : la rangée de chips du hero
  (« Palmier à huile » coupé) et un conteneur sans `min-w-0`/`flex-wrap`.
- **L3 · MOYENNE — Rangée de chips des 7 filières fragile en 390** : wrap inélégant (2 lignes
  déséquilibrées), méta-ligne « Les 7 matières premières… » serrée.
- **L4 · MOYENNE — Section « Comment ça marche » : 5 colonnes denses en tablette** (`md:grid-cols-5`
  dès 768 px) ; les corps de texte de ~4 lignes rendent les colonnes très étroites.
- **L5 · BASSE — Bandeau cookies recouvre le footer à chaque capture/session** ; prévoir marge de
  respiration ou position moins envahissante pendant la démo (le fermer avant le jury).

## 2. Connexion `/connexion` — note : 8,5/10

- **C1 · MOYENNE — Grande zone vide sous le formulaire** (page très haute, footer absent) : le
  bloc est bien conçu mais flotte dans ~50 % d'espace mort en 1440.
- **C2 · BASSE — L'encart démo affiche les identifiants en clair** (`client@test.com · 123client123`)
  — assumé pour le jury, mais à masquer d'un clic pour les captures marketing.

## 3. Parcours `/app/verifier` — note : 8/10

- **V1 · HAUTE — Étape 1 : la carte « Consentement enregistré » est seule au centre, stepper très
  large** : les 6 puces s'étirent sur 1160 px avec de longs connecteurs vides ; en 390 le stepper
  passe en scroll horizontal peu perceptible (pas d'indice visuel de défilement).
- **V2 · MOYENNE — Cohérence des CTA** : « Commencer le scan » est un bouton plein vert dégradé,
  mais les étapes suivantes mélangent `btn-green`, boutons `forest-950` pleins et liens texte
  « Retour » ; harmoniser la hiérarchie (primaire vert, secondaire outline, tertiaire texte).
- **V3 · MOYENNE — Étape 6 Valorisation : la carte n'affiche pas la parcelle en cours** (nom +
  superficie seulement dans le texte) ; un rappel visuel (chip statut + n° certificat) ancrerait
  le moment final de la démo.
- **V4 · BASSE — Le texte d'intro de l'étape 1 fait 4 lignes** ; scinder (2 phrases max + liste).

## 4. Dashboard coopérative `/app/dashboard` — note : 8,5/10

- **D1 · HAUTE — Hiérarchie de la colonne principale surchargée depuis P2** : Import registre +
  recherche + liste empilés sans respiration ; l'import (nouvelle killer feature) mérite un état
  replié plus compact ou une mise en avant distincte de la liste.
- **D2 · MOYENNE — KPI « Dossiers partagés » garde la teinte ambre héritée du KPI crédit** ; l'ambre
  signale ailleurs les statuts « Données insuffisantes » — passer en vert/neutre pour éviter la
  confusion sémantique.
- **D3 · MOYENNE — Résultat d'audit : les libellés de détail d'anomalie restent en FR quand
  l'interface est en EN** (générés par le module pur) ; à bilinguiser (catégorie + action le sont déjà).
- **D4 · BASSE — La barre « % prêtes pour la RDUE » n'annonce pas sa valeur aux lecteurs d'écran**
  (div décorative) ; ajouter `role="meter"`/`aria-valuenow`.

## 5. Dashboard exportateur `/app/exportateur` — note : 7/10

- **E1 · CRITIQUE — Incohérence d'espace : l'eyebrow topbar affiche « ESPACE COOPÉRATIVE » et la
  sidebar reste celle de la coop alors qu'on est dans le cockpit exportateur (persona Marc), avec
  l'avatar « Amadou »**. Un juré attentif verra le conflit de personas. Minimum : eyebrow/route-aware
  (« Espace exportateur ») ; idéalement marquer la vue « démo côté exportateur ».
- **E2 · HAUTE — Tableau : colonnes tronquées à 1440** (« Coopérative … » systématiquement coupé,
  n° de carte cassé sur 2 lignes) alors que la carte à droite a de l'air ; revoir la répartition
  (min-widths, `truncate` + title, densité de ligne).
- **E3 · MOYENNE — Carte : pastilles de statut minuscules au zoom pays** ; l'agrégat « 45 PARCELLES »
  est bien, mais un léger `zoom-to-fit` sur les clusters au chargement rendrait la carte lisible
  sans interaction.
- **E4 · MOYENNE — La scrollbar interne du tableau apparaît en overlay disgracieux** (barre grise
  flottante en bas de la carte tableau).
- **E5 · BASSE — Bouton « Exporter GeoJSON » : seul bouton outline vert de la zone**, hiérarchie à
  aligner sur le reste.

## 6. Page parcelle `/app/parcelle/[id]` — note : 9/10

- **P1 · MOYENNE — Trois blocs « IA » empilés à droite + risque + lecture satellite à gauche : la
  densité de badges « IA » (×3) dilue l'argument** ; un seul badge par zone suffirait.
- **P2 · BASSE — Bouton « Télécharger le certificat » inactif** (tooltip « généré dans le parcours »)
  — un bouton qui ne fait rien en démo est un risque de clic jury ; le griser explicitement ou le
  faire naviguer vers le parcours.
- **P3 · BASSE — Le placeholder carte « ZONE ANALYSÉE » (fond quadrillé sombre) jure légèrement**
  avec l'esthétique satellite réelle du reste de l'app.

## 7. Pages publiques (certificat, tarifs, méthodologie, FAQ, à-propos) — note : 8/10

- **PU1 · HAUTE — `/verifier-certificat` : ~60 % d'espace vide sous le résultat en 1440** ; c'est
  l'écran final de la démo jury (scan QR) — il doit paraître complet (rappel des 3 statuts
  possibles, lien méthodologie, visuel certificat).
- **PU2 · MOYENNE — `/tarifs` : la carte « Dossier exportateur / Inclus » (ex-commission) est plus
  courte que les 2 plans payants** ; équilibrer les hauteurs et clarifier que ce n'est pas un plan.
- **PU3 · BASSE — Cohérence des eyebrows** : casse et couleurs varient entre pages publiques
  (vert/ambre) sans logique évidente.

## 8. Transverse — note : 8/10

- **T1 · CRITIQUE — Reduced-motion incomplet au-delà du hero** : plusieurs sections `whileInView`
  restent invisibles tant que l'observer n'a pas tourné ; en reduced-motion l'état initial doit être
  l'état final (pattern logo à généraliser : Reveal/rise/container).
- **T2 · MOYENNE — Focus visible inégal** : les liens texte (« Retour », liens footer) n'ont pas
  toujours d'anneau de focus ; boutons OK.
- **T3 · MOYENNE — `dev-seed.html` (outil QA) est servi en public/** — à supprimer au gel v1.0.0 (P8).
- **T4 · BASSE — Le composant cookies apparaît dans TOUTES les captures y compris /app** ; accepter
  une fois dans le storage de la machine de démo (check-list P9).

---

## TOP 15 « meilleur effet jury / moindre effort » (ordre d'exécution P5)

1. **T1/L1 — Reduced-motion : état initial = état final** sur hero + sections `whileInView`
   (landing, /app). Effet : plus AUCUN écran vide possible devant le jury. Effort : faible (pattern connu).
2. **L2 — RETIRÉ (faux positif vérifié : scrollWidth 380/390, artefact de capture).**
3. **E1 — Eyebrow/contexte route-aware « Espace exportateur »** (+ masquer l'encart coop de la
   sidebar sur cette route). Effort : faible, crédibilité forte.
4. **E2 — Tableau exportateur : largeurs de colonnes + truncate propre + `title`**. Effort : moyen.
5. **PU1 — Étoffer `/verifier-certificat`** (rappel 3 statuts + lien méthodologie + cadre certificat).
   C'est l'écran de l'« effet final » jury. Effort : moyen.
6. **D2 — KPI « Dossiers partagés » : teinte verte** (sémantique statuts préservée). Effort : trivial.
7. **D1 — Import registre : état replié compact** (une ligne : icône + titre + CTA) qui s'étend à
   l'usage. Effort : moyen.
8. **V1 — Stepper : resserrer (max-w) + indice de scroll mobile**. Effort : faible.
9. **V3 — Étape Valorisation : rappel parcelle (chip statut + n° certificat + superficie)**.
   Effort : faible.
10. **D3 — Bilinguiser les détails d'anomalie de l'audit registre** (catégorie détail → clés FR/EN
    dans le module). Effort : moyen.
11. **P2 — Bouton certificat de la page parcelle : état désactivé explicite** (`disabled` + aide)
    ou lien vers le parcours. Effort : trivial.
12. **V2 — Harmoniser la hiérarchie des CTA du parcours** (primaire/secondaire/tertiaire). Effort : moyen.
13. **P1 — Un seul badge « IA » par carte sur la page parcelle** (supprimer les doublons visuels).
    Effort : trivial.
14. **D4 — `role="meter"` + `aria-valuenow` sur la barre % RDUE** (+ `aria-live` du résultat d'audit).
    Effort : trivial.
15. **T2 — Focus visible sur les liens texte** (`focus-visible:ring` uniforme). Effort : faible.

**Hors top 15 (à faire si temps restant)** : L3, L4, C1, V4, E3, E4, E5, PU2, PU3, P3, T4.
**Rappels de gel** : T3 (`dev-seed.html` à supprimer en P8).

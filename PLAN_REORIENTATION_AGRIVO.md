# PLAN DE RÉORIENTATION AGRIVO — v1 (2026-07-06)

> Source de vérité pour la réorientation de la proposition de valeur avant le jury du **samedi 11 juillet 2026**.
> Déclencheur : deux informations terrain obtenues auprès d'une professionnelle de l'export cacao (6+ ans) :
> **(1)** les coopératives n'accordent aucun préfinancement/microcrédit aux producteurs, par choix structurel
> (autonomie, historique d'impayés et de fraudes) ; **(2)** les coopératives connaissent déjà la géolocalisation
> de leurs producteurs affiliés avant l'achat.

---

## 1. Décision stratégique

### 1.1 Le micro-crédit producteur est retiré du produit
L'étape 6 « Crédit » (prêt 50 000–250 000 FCFA via IMF, slider Mobile Money) répond à un besoin qui
n'existe pas côté coopérative et expose le pitch à une objection fatale d'un juré connaisseur du secteur.
Elle est **remplacée** par une étape « **Valorisation** » : la parcelle vérifiée alimente le **score de
conformité du portefeuille de la coopérative**, que la coop fait valoir pour négocier **primes de durabilité,
accès aux acheteurs premium et partage du dossier de conformité** avec son exportateur.

### 1.2 Démarcation ferme avec le produit exportateur d'Anael (Nanti)
Le scoring de **solidité/bancabilité des coopératives pour le préfinancement** est le cœur du produit
personnel d'Anael côté exportateur. **AGRIVO ne construit PAS de score de crédit, de plafond de
préfinancement ni de décision de financement.** Frontière retenue :

| | AGRIVO (Vibeathon) | Nanti (produit personnel) |
|---|---|---|
| Client | **Coopérative** (+ vérif publique acheteur) | **Exportateur** |
| Cœur | Vérification parcelle par parcelle (Whisp), certificat, DDS | Readiness EUDR du portefeuille, valeur à risque, **Score de solidité + préfinancement** |
| Brique financière | Aucune. La conformité ouvre **primes et marchés**, pas du crédit | Score ISC → classe A-E → plafond → mémo de crédit |
| Articulation | La coop **exporte son dossier de conformité** vers son exportateur | L'exportateur **consomme** ce type de dossier |

Les deux produits deviennent complémentaires (amont/aval) au lieu de se cannibaliser. Dans le pitch AGRIVO,
ne jamais présenter de fonctionnalité de crédit ou de scoring financier.

### 1.3 AGRIVO change de posture sur la donnée : de la collecte à l'audit
Les coops ont déjà des données de géolocalisation (voir §2). AGRIVO se positionne en **couche
d'intelligence et de vérification au-dessus de données existantes** : import, audit de qualité RDUE,
vérification satellite, complétion ciblée des trous seulement. La capture GPS in-app (étape Cartographie,
5 verrous anti-fraude) reste, mais comme **chemin de complétion**, pas comme point de départ obligatoire.

---

## 2. Comment AGRIVO accède aux polygones et waypoints (recherche vérifiée, juillet 2026)

Rappel de l'exigence RDUE : géolocalisation de **chaque parcelle** ; **point GPS (6 décimales) accepté
sous 4 ha, polygone obligatoire à partir de 4 ha**, au format **GeoJSON WGS84**, joint à la DDS soumise
via **TRACES**. Application aux grandes/moyennes entreprises : **1er janvier 2027**.

### Canal A — Import des fichiers que la coopérative détient déjà (immédiat, aucun partenariat requis)
- Les coops **certifiées Rainforest Alliance** ont l'obligation, depuis l'alignement RA-EUDR, de collecter
  la géolocalisation de toutes les parcelles avec **polygone ≥ 4 ha**, et de téléverser des fichiers
  **.json / .geojson / .kml / .kmz** sur la plateforme RA. Ces fichiers appartiennent au groupe certifié :
  **la coop les possède** et peut les charger dans AGRIVO.
- Les **exportateurs financent des campagnes de cartographie** chez leurs coops fournisseuses (constaté
  sur le terrain : « les exportateurs disposent d'outils qui leur permettent de vérifier leur localisation à
  distance », aucun coût pour le planteur). Ces livrables (CSV de points, KML de polygones) existent dans
  les coops.
- **Pourquoi un audit est indispensable** (et c'est notre valeur) : l'étude Meridia/Rabo Foundation dans le
  Cavally a trouvé qu'**environ 30 % des données de parcelles collectées sur le terrain n'étaient pas assez
  fiables pour la RDUE** (polygones ouverts, chevauchements, points aberrants, superficies incohérentes).
  Avoir des fichiers ≠ être conforme.

### Canal B — La carte du producteur et le SNT du Conseil Café-Cacao (partenariat, moyen terme)
- Le recensement RPCCV du CCC a enrôlé **plus d'1,1 million de producteurs**, distribué **~900 000 cartes**
  et géolocalisé **~3 millions d'hectares** de plantations. La carte (identité + matricule + QR + puce
  bancaire) devient **obligatoire pour toute transaction café-cacao au 1er septembre 2026** (ouverture de
  la campagne 2026-2027) ; le SNT a été lancé le 12 juin 2026 et plus de 160 000 t ont déjà été
  commercialisées en traçabilité complète.
- Le **QR de la carte donne l'identité et le matricule** (déjà exploité par notre étape Scan). L'accès au
  **registre des parcelles géolocalisées du CCC** (les ~3 M ha) n'est pas public : c'est notre **demande de
  partenariat** (position déjà tenue dans GUIDE_DEMO_JURY.md), pas un prérequis. Argument jury : l'État a
  déjà payé la collecte ; AGRIVO est la couche qui la rend exploitable pour la RDUE au niveau coopérative.

### Canal C — Capture in-app pour les trous (existant : étape Cartographie + 5 verrous)
Pour les parcelles absentes des fichiers, les polygones manquants ≥ 4 ha (souvent seuls des points
centraux existent) et les données rejetées par l'audit : capture guidée par **l'utilisateur de l'app**
(producteur, pisteur ou agent de coopérative), règle RDUE point/polygone, contrôles d'intégrité,
puis vérification satellite. Rien à changer au code : c'est déjà construit.

### Canal D — Le satellite comme juge, jamais comme source de la géométrie déclarée
Whisp/imagerie vérifie **ce qu'il y a dans** le polygone déclaré (déforestation post-2020, chevauchement
aires protégées). Les datasets de détection cacao (télédétection) servent au contrôle de vraisemblance,
pas à générer la géométrie légale de la DDS, qui doit venir de la déclaration de l'opérateur.

**Séquence produit : A d'abord (import + audit), C pour compléter, D pour juger, B en roadmap partenariat.**

---

## 3. Proposition de valeur reformulée

> **AGRIVO transforme les données de parcelles que les coopératives possèdent déjà en conformité RDUE
> prouvable : audit du registre existant, vérification satellite parcelle par parcelle, certificat vérifiable
> et dossier de diligence prêt pour l'export — et fait de cette conformité un argument commercial
> (primes, acheteurs premium) plutôt qu'un coût.**

Hero court : **« De la parcelle vérifiée à la prime négociée. »**

## 4. Fonctionnalités : garder / modifier / supprimer / ajouter

| Élément | Décision | Justification |
|---|---|---|
| Étapes 1–5 (Confirmation, Scan, Cartographie, Analyse Whisp, Certificat) + 5 verrous + QR public | **Garder** | Cœur de la couche de vérification, inchangé. |
| Étape 3 Cartographie | **Modifier (discours)** | Présentée comme complétion de données existantes, pas collecte from scratch. |
| Étape 6 Crédit (`step-credit.tsx`, `credit-score-card.tsx`) | **Remplacer → « Valorisation »** | Prime/acheteurs/partage du dossier ; supprime l'objection sectorielle. Pas de score financier (frontière Nanti). |
| Hero « ouvrez l'accès au crédit du producteur » | **Remplacer** | Nouvelle promesse §3. |
| Tarifs : ligne « commission micro-crédit » + FAQ micro-crédit | **Supprimer/réécrire** | Modèle : abonnement coop + API exportateur. |
| Mémo DDS + export TRACES NT + copilote | **Promouvoir** | La réduction de coût mesurable (certification manuelle : 20–40 M FCFA/an) devient l'argument n°2. |
| Alertes dashboard | **Reformuler** | « Monitoring continu du risque » (discours ; ingénierie récurrente = roadmap). |
| **Import du registre coop** (GeoJSON/KML/CSV → audit qualité → « X % prêt RDUE, Y parcelles à compléter ») | **Ajouter (MVP mock)** | Matérialise l'info 2 + l'étude des ~30 % non fiables. La démo qui parle aux coops. |
| Diagnostics agronomiques, carbone/biodiversité, monitoring satellite récurrent réel | **Roadmap post-hackathon** | Slide « Et après », zéro code avant le 11. |

---

## 5. LES PROMPTS À RUN (dans l'ordre)

> Chaque prompt se colle tel quel dans une session Claude Code ouverte dans le projet Agrivo.
> Gates systématiques : `tsc --noEmit` + Vitest + `next build` verts, vérification visuelle CDP FR + EN,
> respect de la charte (pas de « garantie », statuts verbatim, pas de % inventé).

### P1 — Pivot « Crédit → Valorisation » (aujourd'hui, lundi 7)
```
Exécute le pivot Valorisation décrit dans PLAN_REORIENTATION_AGRIVO.md (§1.1, §4) :
1) Remplace l'étape 6 « Crédit » du golden path par « Valorisation » : la parcelle vérifiée alimente le
   score de conformité du portefeuille de la coopérative ; montre (a) la contribution de la parcelle au
   portefeuille, (b) les débouchés : prime de durabilité négociable, accès acheteurs premium, partage du
   dossier de conformité avec l'exportateur (bouton « Partager le dossier » simulé). AUCUN montant de
   prêt, AUCUN score de crédit, AUCUN plafond de financement — c'est une frontière produit stricte.
2) Purge le micro-crédit partout : hero (nouvelle promesse « De la parcelle vérifiée à la prime
   négociée »), page tarifs (supprime la ligne commission micro-crédit et la FAQ « Et le micro-crédit ? »,
   modèle = abonnement coop + API exportateur), FAQ, méthodologie, à-propos, splash, footer,
   GUIDE_DEMO_JURY.md (déroulé, phrases clés, réponse BCEAO devient obsolète — remplace-la par
   « Pourquoi pas de crédit aux producteurs ? » avec la réponse terrain : les coops visent l'autonomie
   des producteurs, le préfinancement individuel a historiquement produit impayés et fraudes ; AGRIVO
   valorise la conformité par les primes, pas par la dette), lib/i18n.ts, tests.
3) FR + EN partout. Gates verts, parcours complet vérifié en CDP (6 étapes), grep final :
   plus aucun « micro-crédit / micro-credit / IMF / Mobile Money / 250 000 » orphelin dans l'UI.
4) CLAUDE.md : golden path mis à jour + journal de session.
```

### P2 — Import & audit du registre coopérative (mardi 8, matin)
```
Implémente la fonctionnalité « Importer le registre de la coopérative » décrite dans
PLAN_REORIENTATION_AGRIVO.md (§2 canal A, §4) sur le dashboard coopérative :
1) Bouton « Importer mon registre » → accepte .geojson/.json/.kml/.csv (parsing client-side ; pour la
   démo, un fichier d'exemple data/registre-demo.geojson de ~30 parcelles avec défauts volontaires :
   polygones ouverts, doublons de matricule, parcelle ≥ 4 ha avec seulement un point central,
   chevauchement, coordonnées hors zone).
2) Écran de résultat « Audit RDUE du registre » : % de parcelles prêtes pour la RDUE, et la liste des
   anomalies par catégorie (géométrie invalide · polygone manquant ≥ 4 ha · doublon · chevauchement ·
   hors zone) avec pour chacune l'action : « à compléter sur le terrain » (renvoie vers l'étape
   Cartographie) ou « à corriger au bureau ». Statuts verbatim charte uniquement.
3) Les parcelles valides rejoignent le portefeuille (mock) et deviennent vérifiables par Whisp comme
   les autres. Micro-copy : « Vos données restent la propriété de la coopérative » (ARTCI).
4) FR + EN, reduced-motion, mobile 390px. Gates verts + CDP. Ajoute 2-3 tests Vitest sur le module
   d'audit (fonctions pures de validation de géométrie). CLAUDE.md à jour.
```

### P3 — Reframe « collecte → vérification » dans tout le discours (mardi 8, après-midi)
```
Aligne tout le discours d'AGRIVO sur la posture « couche d'audit et de vérification de données
existantes » (PLAN_REORIENTATION_AGRIVO.md §1.3, §2) :
1) Landing : section « Comment ça marche » réordonnée : 1. Importez votre registre existant (certification,
   cartographies exportateur) — 2. AGRIVO l'audite et le vérifie par satellite — 3. Complétez uniquement
   les parcelles manquantes — 4. Exportez certificats et dossier DDS.
2) Étape Cartographie : intro ajustée (« complétez les parcelles absentes de votre registre »).
3) GUIDE_DEMO_JURY.md : nouvelle réponse « D'où viennent les polygones ? » avec les 4 canaux (fichiers
   de certification détenus par la coop ; capture in-app pour les trous ; le satellite juge ; le registre
   CCC ~3 M ha = demande de partenariat). Ajoute les faits sourcés : carte producteur obligatoire au
   1er sept. 2026, RDUE au 1er janv. 2027, ~30 % de données terrain non fiables (étude Cavally) — sans
   inventer d'autres chiffres.
4) FR + EN, gates verts, CLAUDE.md à jour.
```

### P4 — Audit design de l'interface client (mercredi 9, matin)
```
Fais un audit UX/UI complet et impitoyable de l'interface client d'AGRIVO (landing, connexion,
/app/verifier les 6 étapes, dashboard coopérative, dashboard exportateur, page parcelle, pages
publiques verifier-certificat/tarifs/méthodologie), en desktop 1440 et mobile 390, FR et EN,
avec captures CDP à l'appui. Évalue : hiérarchie visuelle, cohérence du design system (couleurs,
typo, espacements, rayons, ombres), lisibilité des data-viz, états vides/chargement/erreur,
accessibilité (contrastes, focus, reduced-motion), qualité perçue « produit fini » vs « démo hackathon ».
Livrable : AUDIT_INTERFACE_AGRIVO.md à la racine — constats numérotés par zone avec sévérité
(CRITIQUE/HAUTE/MOYENNE/BASSE), note sur 10 par zone, et un top 15 priorisé « meilleur effet jury
pour le moindre effort ». N'applique AUCUNE correction dans ce prompt.
```

### P5 — Exécution de la refonte design priorisée (mercredi 9, après-midi — avant le gel)
```
Exécute le top 15 d'AUDIT_INTERFACE_AGRIVO.md (et tous les CRITIQUE restants), dans l'esprit du
design system existant — on raffine, on ne redesigne pas à 3 jours du jury. Interdits : nouvelle
palette, nouvelles polices, refonte de layout majeure. Autorisés : hiérarchie, espacements, contrastes,
micro-interactions framer-motion sobres (reduced-motion respecté), polissage des cartes/tableaux/états
vides, cohérence FR/EN. Vérification visuelle CDP desktop+mobile sur chaque zone touchée avant/après.
Gates verts. CLAUDE.md à jour.
```

### P6 — Deck, guide et vidéo alignés sur le pivot (mercredi 9, soir — GEL FONCTIONNALITÉS)
```
Aligne les supports sur la réorientation (PLAN_REORIENTATION_AGRIVO.md §3) :
1) Deck : réécris la slide crédit/impact en slide « Valorisation » (primes, acheteurs premium, dossier
   partagé exportateur) + la slide marché avec le fait « ~3 M ha déjà géolocalisés par le CCC, AGRIVO
   est la couche qui les rend exploitables pour la RDUE » + slide roadmap (monitoring continu,
   diagnostics agro, carbone). Donne-moi le contenu exact à reporter dans PowerPoint.
2) GUIDE_DEMO_JURY.md : déroulé 7 min mis à jour (l'effet final reste le scan QR du jury ; l'étape 6
   démontrée = Valorisation ; ajouter la démo « import registre » au segment dashboard coopérative).
3) Script vidéo plan B : réécris le plan 5 (ex-slider micro-crédit) → import registre + valorisation.
   ⚠️ À transmettre à Christ AVANT tournage.
4) Vérifie la cohérence tarifaire deck ↔ site après suppression de la commission micro-crédit.
```

### P7 — Clé Gemini réelle (dès que la clé AIza… est disponible)
```
Voici ma vraie clé Gemini : AIza[...]. Pose-la en .env.local et sur Vercel
(vercel env add GEMINI_API_KEY production), redéploie, réassigne l'alias agrivo-io.vercel.app,
puis teste en RÉEL : OCR de carte (étape Scan), mémo DDS, copilote exportateur. Vérifie ensuite
que le repli mock fonctionne toujours si la clé est retirée. Ne commite jamais la clé.
```

### P8 — Gel du code v1.0.0 (jeudi 10, soir)
```
Gel du code AGRIVO pour le jury : gates complets (tsc, 24+ tests, build), parcours CDP intégral
FR+EN desktop+mobile sur les 6 étapes + import registre + dashboards + vérif certificat publique,
grep charte (garantie/pourcentages/statuts/micro-crédit), CHANGELOG.md, commit, tag v1.0.0, push,
CI verte, déploiement Vercel, alias agrivo-io.vercel.app réassigné, smoke-test complet EN PROD.
Après ce prompt : plus AUCUN changement de code avant le passage du jury.
```

### P9 — Répétition générale technique (vendredi 11 juillet… non : vendredi 10)
```
Répétition générale sur https://agrivo-io.vercel.app (PROD, pas localhost) : déroule le
GUIDE_DEMO_JURY.md étape par étape en te chronométrant sur 7 minutes, vérifie chaque écran du
déroulé (FR), le scan QR du certificat depuis un téléphone, le mode hors-ligne/mock, et produis
la check-list matérielle du jour J (onglets à pré-ouvrir, compte connecté, batterie, partage de
connexion, vidéo plan B en local ET sur clé USB).
```

## 6. Planning jusqu'au jury

| Jour | Prompts | Humains |
|---|---|---|
| **Lun 7** | P1 (pivot Valorisation) | Prévenir Christ : plan 5 vidéo change (ne pas tourner avant P6) |
| **Mar 8** | P2 (import registre) + P3 (discours) | Anael : obtenir la clé Gemini AIza… ; Domy : vraie carte à scanner |
| **Mer 9** | P4 (audit design) + P5 (refonte) + P6 (supports) → **gel fonctionnalités le soir** | Anael : reporter la slide dans le deck ; Christ : tourner la vidéo |
| **Jeu 10** | P7 (clé Gemini si reçue) + P8 (**gel code v1.0.0**) | Équipe : flashcards questions pièges |
| **Ven 10*** | P9 (répétition générale sur PROD) | Répétition pitch complète, chrono |
| **Sam 11** | — (aucun code) | Jury au CSCTICAO |

\* vendredi 10 juillet.

## 7. Sources de la recherche (vérifiées 2026-07-06)

- [AIP — lancement du SNT et carte producteur obligatoire](https://www.aip.ci/aip-filiere-cafe-cacao-la-cote-divoire-lance-son-systeme-national-de-tracabilite-et-rend-la-carte-du-producteur-obligatoire/)
- [KOACI — 1,1 M producteurs enrôlés, 900 000 cartes, traçabilité intégrale](https://www.koaci.com/article/2026/06/12/cote-divoire/societe/cote-divoire-11-million-de-producteurs-enroles-900-000-cartes-distribuees-la-filiere-cacao-entre-dans-lere-de-la-tracabilite-integrale_197505.html)
- [Presse Côte d'Ivoire — carte obligatoire au 1er septembre 2026](https://www.pressecotedivoire.fr/24742-cafe-cacao-la-carte-du-producteur-devient-obligatoire-des-le-1er-septembre-2026)
- [Mongabay — la RDUE bouleverse la filière cacao ivoirienne](https://fr.mongabay.com/2026/04/cote-divoire-quand-le-reglement-europeen-sur-la-deforestation-bouleverse-la-filiere-cacao/) (les exportateurs financent la géolocalisation)
- [Abidjan.net — recensement : ~3 M ha géolocalisés](https://news.abidjan.net/articles/727188/secteur-cafe-cacao-mise-en-place-du-systeme-national-de-tracabilite-plus-dun-million-de-producteurs-desormais-recenses)
- [Rainforest Alliance — alignement EUDR : polygones ≥ 4 ha, formats acceptés](https://knowledge.rainforest-alliance.org/docs/eudr-and-the-rainforest-alliance-certification-program-upgrading-our-approach) et [support EUDR farm-to-retailer](https://www.rainforest-alliance.org/business/certification/how-the-rainforest-alliance-supports-eudr-compliance-from-farm-to-retailer/)
- [Global Traceability — FAQ géolocalisation RDUE (point < 4 ha, polygone ≥ 4 ha, 6 décimales)](https://www.global-traceability.com/en/faqs-explained-eudr-traceability-geolocation-4th-ed/)
- [LiveEO — guide de collecte de géolocalisation RDUE (GeoJSON WGS84, TRACES)](https://www.live-eo.com/blog/eudr-geolocation-guide)
- [Mongabay — méthode hybride de cartographie ; étude Meridia/Rabo : ~30 % de données terrain non fiables (Cavally)](https://news.mongabay.com/short-article/2025/05/hybrid-mapping-method-key-to-eudr-cocoa-compliance-study-finds/)
- [EFI — Preparedness check de la Côte d'Ivoire pour la RDUE](https://efi.int/sites/default/files/files/flegtredd/Sustainable-cocoa-programme/Cocoa%20insights/EUDR%20preparedness%20check%20CIV_EN.pdf)

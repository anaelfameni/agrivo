# CHANGELOG — AGRIVO

Versioning sémantique (MAJOR.MINOR.PATCH). Chaque release liste ce qui est ajouté, corrigé et
vérifié, conformément à l'étape 8 du pipeline « Du besoin à la Release ».

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

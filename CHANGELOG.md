# CHANGELOG — AGRIVO

Versioning sémantique (MAJOR.MINOR.PATCH). Chaque release liste ce qui est ajouté, corrigé et
vérifié, conformément à l'étape 8 du pipeline « Du besoin à la Release ».

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

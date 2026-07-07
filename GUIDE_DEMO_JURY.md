# GUIDE DE DÉMO — Vibeathon, 11 juillet 2026

> Anti-sèche intégrée à l'app : **Ctrl+Shift+D** sur n'importe quelle page ouvre le guide présentateur.
> La démo du parcours producteur se fait sur **l'app mobile de Christ** ; la plateforme web sert la
> partie coopérative/exportateur et la vérification publique.

## Comptes
- Coopérative (Amadou) : `client@test.com` / `123client123` — bouton « Entrer avec le compte de démonstration ».
- Admin : `admin@agrivo.com` / `123admin123` (clés d'API, MOCK_MODE, état des services).

## Déroulé recommandé (7 minutes)
1. **Splash + landing (30 s)** — la promesse : « De la parcelle vérifiée à la prime négociée. »
2. **Mobile (Christ) : golden path (3 min)** — consentement ARTCI → scan carte (QR + Gemini Vision) →
   cartographie GPS (point central < 4 ha / tour de champ ≥ 4 ha) + contrôles d'intégrité →
   verdict Whisp → certificat PDF → valorisation (dossier partagé avec l'exportateur).
   **Depuis v1.3.0, ce parcours tourne aussi sur la PWA web installée sur un téléphone** : à l'étape
   Cartographie, le mode **« Tour de champ GPS (réel) »** apparaît sur mobile et écoute la VRAIE
   géolocalisation (waypoints qui se posent en marchant, distance et précision live, fermeture du
   polygone). Argument à dire : « une seule application, du bureau du gérant au bord du champ, sans
   passer par un store — sur les téléphones qu'ont déjà les agents. »
3. **Web : dashboard coopérative (1 min 15)** — 4 KPI officiels (dont « Dossiers partagés »), alertes,
   dernière vérification remontée, puis **démo « Importer mon registre »** : clic sur « Auditer mon
   registre » (la carte se déplie) puis « Essayer avec le registre de démonstration » → « 63 % prêtes
   pour la RDUE, 19 parcelles sur 30 » + anomalies par
   catégorie (à compléter sur le terrain / à corriger au bureau). Phrase clé : « Les coopératives ont
   déjà des fichiers ; environ 30 % de ces données ne sont pas fiables pour la RDUE. AGRIVO les
   transforme en conformité prouvable. » **Puis clic « Générer le plan d'action IA » (v1.2.0, Gemini
   LIVE)** : « L'IA ne détecte pas seulement les problèmes, elle organise la mise en conformité :
   bureau d'abord, terrain ensuite. »
4. **Web : dashboard exportateur (1,5 min)** — carte du portefeuille, export GeoJSON TRACES NT,
   copilote IA (question : « Quelles parcelles présentent un risque dans la région de Soubré ? »).
5. **Effet final (1 min)** — le jury **scanne le QR du certificat PDF** avec son propre téléphone →
   `/verifier-certificat` confirme le statut. « N'importe quel acheteur peut vérifier nos certificats. »

## Phrases clés
- « Nous combinons l'outil de référence de la FAO pour la détection (Whisp) et une IA générative
  pour rendre la conformité compréhensible et actionnable par tous. »
- « C'est une évaluation, pas une garantie : l'opérateur reste responsable de sa déclaration. »
- « La conformité prouvée est un argument commercial : primes de durabilité négociables, accès aux
  acheteurs premium, dossier partagé avec l'exportateur. Le service Agrivo est gratuit pour le producteur. »
- **Chiffres primes (vérifiés juillet 2026, à citer si on nous pousse)** : prime Fairtrade cacao **240 $/t
  aujourd'hui → 250 €/t en Côte d'Ivoire au 1er octobre 2026 (+13 %), dont 40 % versés EN CASH
  directement aux membres** ; différentiel bio 410 €/t ; DRD/LID : 400 $/t. Le prix bord champ, lui, est
  FIXÉ par l'État (2 800 FCFA campagne principale 2025-26, 1 200 FCFA en intermédiaire) : la coop ne
  négocie pas le prix, elle négocie les primes AU-DESSUS du prix garanti, dans le cadre du CCC.
- **La convergence 2026-27 (l'argument massue)** : carte producteur obligatoire au **1er sept. 2026** +
  nouvelle prime Fairtrade avec cash direct au **1er oct. 2026** + RDUE au **30 déc. 2026**. Trois
  échéances sur la même campagne : la coopérative qui PROUVE sa conformité à ce moment-là gagne sur
  tous les tableaux ; les autres perdent l'accès au premier débouché du cacao ivoirien.

## Réponses aux questions pièges
- **« Votre IA est-elle réelle ? »** — Oui : **cinq usages appellent réellement Gemini en production**
  (v1.2.0) : l'OCR de carte, le **plan d'action d'audit du registre**, le mémo DDS,
  l'**argumentaire de prime** (étape Valorisation) et le copilote exportateur. Les verdicts et
  chiffres restent calculés sur les données (l'IA met en mots, elle n'invente rien). Sans clé ou en
  cas de panne réseau : repli automatique sur le mode démonstration, étiqueté honnêtement à l'écran
  et visible dans l'admin.
- **« Précision de Whisp ? »** — Nous ne citons aucun pourcentage : Whisp est l'outil ONU/FAO de
  référence, pilote Kenya 6 000+ parcelles ; méthode par convergence de preuves.
- **« Pourquoi pas de crédit aux producteurs ? »** — Par choix, partagé par les coopératives : elles
  visent l'autonomie des producteurs, et le préfinancement individuel a historiquement produit impayés
  et fraudes. AGRIVO valorise la conformité par les primes et l'accès aux acheteurs premium, pas par la
  dette — aucun score de crédit, aucun plafond de financement dans le produit.
- **« Et si le producteur ment sur sa parcelle ? »** — Personne n'est cru sur parole : cinq verrous
  se croisent. (1) Identité : carte scannée, photo conservée, matricule unique (anti-doublon).
  (2) La capture GPS est guidée par l'app et faite par un **utilisateur identifié** (producteur,
  pisteur ou agent de coopérative) : chaque trace est horodatée et rattachée à son compte —
  AGRIVO reste 100 % logiciel, aucun personnel de terrain.
  (3) Contrôles automatiques : chevauchement avec les parcelles enrôlées, superficie plausible,
  signal GPS authentique (pas de position simulée). (4) La **vérité satellite** : Whisp vérifie ce
  qu'il y a réellement dans le polygone ; un contour mensonger inclut de la forêt perdue ou le champ
  du voisin, et se voit. (5) Réconciliation économique : le volume acheté est plafonné par
  superficie × rendement régional ; une parcelle de 2 ha ne peut pas « produire » 10 tonnes.
- **« D'où viennent les polygones et les données des parcelles ? »** — Quatre canaux, dans cet ordre :
  **(1) Les fichiers que la coopérative détient déjà** : les coops certifiées Rainforest Alliance ont
  l'obligation de cartographier leurs parcelles (polygone ≥ 4 ha, fichiers .geojson/.kml qui leur
  appartiennent) et les exportateurs financent des campagnes de cartographie chez leurs coops. AGRIVO
  les importe et les **audite** — car avoir des fichiers ≠ être conforme : l'étude Meridia/Rabo
  Foundation (région du Cavally) a montré qu'environ **30 % des données terrain ne sont pas assez
  fiables pour la RDUE**. **(2) La capture in-app pour les trous** (parcelles manquantes, polygones
  absents ≥ 4 ha, données rejetées à l'audit) : capture GPS guidée par l'utilisateur de l'app, règle
  RDUE point < 4 ha / polygone ≥ 4 ha. **(3) Le satellite juge, il ne déclare pas** : Whisp vérifie ce
  qu'il y a dans le polygone déclaré ; la géométrie légale de la DDS vient toujours de la déclaration.
  **(4) Le registre du CCC** (~3 M ha géolocalisés, ~900 000 cartes, 1,1 M producteurs recensés) :
  le QR de la carte donne l'identité (déjà exploité par notre scan) ; l'accès aux polygones du CCC
  reste notre **demande de partenariat**, pas un prérequis — l'État a déjà payé la collecte, AGRIVO
  la rend exploitable pour la RDUE. Faits d'appui : carte producteur obligatoire au **1er septembre
  2026**, application RDUE aux grandes/moyennes entreprises au **1er janvier 2027**.
- **« Pourquoi Agrivo alors que le SNT du Conseil Café-Cacao existe déjà ? »** — Le SNT trace les
  **transactions** du bord champ à l'export. Agrivo produit ce que le SNT ne donne pas aux acteurs :
  le verdict déforestation parcelle par parcelle (Whisp/FAO), le dossier de diligence prêt pour
  TRACES NT, le score sols et la valorisation commerciale. Complémentaire, pas concurrent : Agrivo relie la
  traçabilité nationale à l'exigence européenne.

- **« L'Europe a simplifié la RDUE, votre produit sert encore ? »** — La déclaration simplifiée unique
  (révision de déc. 2025) ne bénéficie qu'aux petits producteurs des pays classés **risque FAIBLE**.
  La Côte d'Ivoire est classée **risque STANDARD** (Commission, 22 mai 2025) : la diligence complète
  — géolocalisation parcelle par parcelle comprise — reste pleinement exigée pour le cacao ivoirien.
  Et si la CI devient « risque faible » à la révision du classement, ce sera GRÂCE à une traçabilité
  prouvée : exactement ce qu'AGRIVO produit.
- **« Meridia Verify ou Koltiva font déjà de l'audit de données, non ? »** — Oui, et c'est la meilleure
  preuve que le besoin est réel : des acteurs mondiaux ont bâti des produits entiers dessus. Trois
  différences : (1) eux vendent aux exportateurs et aux marques, en top-down — AGRIVO met l'audit
  DANS LES MAINS de la coopérative, en self-service ; (2) chez eux l'audit est un rapport — chez nous
  chaque parcelle rejetée repart en capture guidée in-app et chaque parcelle valide reçoit un verdict
  satellite + un certificat vérifiable publiquement ; (3) nous sommes conçus pour la Côte d'Ivoire :
  carte producteur, SNT, français, hors-connexion, prix coopérative.
- **« Et Trusty (blockchain ivoirienne) ? »** — Trusty trace des LOTS pour les exportateurs
  (blockchain). AGRIVO vérifie des PARCELLES pour les coopératives (satellite + règle RDUE) et
  transforme le résultat en dossier de valorisation. Complémentaires, pas concurrents.
- **« La conformité RDUE ne donne pas droit à une prime, c'est juste l'accès au marché. »** — Les
  deux. L'accès d'abord : sans géolocalisation conforme, plus d'exportation vers l'UE, premier
  débouché du cacao ivoirien. Les primes ensuite : certification et programmes se négocient au-dessus
  du prix garanti, et un portefeuille prouvé conforme est la pièce maîtresse de ces négociations —
  Fairtrade passe à 250 €/t au 1er octobre 2026, dont 40 % en cash direct aux membres.

## PLAN B — script de la vidéo de secours (à tourner AVANT le 11 juillet)

> ⚠️ **À TRANSMETTRE À CHRIST AVANT TOURNAGE** : le plan 5 a changé (pivot Valorisation, plus de
> slider micro-crédit). Ne pas tourner sur une version antérieure de l'app.
Format : capture d'écran 1080p, 2 min 30, sans musique forte, voix off ou sous-titres.

| # | Durée | Plan | Voix off |
|---|-------|------|----------|
| 1 | 0:00–0:15 | Splash → landing, scroll lent jusqu'aux 7 filières | « Agrivo rend la conformité RDUE simple, prouvable et abordable. » |
| 2 | 0:15–0:45 | Mobile : consentement → scan de la carte de Kouassi | « Au bord du champ, Amadou scanne la carte du producteur : Gemini Vision pré-remplit tout. » |
| 3 | 0:45–1:20 | Analyse : polygone qui se dessine → verdict Conforme | « Whisp, l'outil de la FAO, compare la parcelle aux images satellite depuis décembre 2020. » |
| 4 | 1:20–1:45 | Certificat PDF + zoom sur le QR → scan → /verifier-certificat | « Chaque certificat est vérifiable publiquement par n'importe quel acheteur. » |
| 5 | 1:45–2:10 | Étape Valorisation → « Partager le dossier avec l'exportateur » | « Et la conformité devient une opportunité : primes de durabilité et acheteurs premium, dossier partagé avec l'exportateur. » |
| 6 | 2:10–2:30 | Dashboard exportateur : carte + copilote + export TRACES NT | « Côté exportateur : tout le portefeuille, prêt pour TRACES NT. Agrivo. Prêt à exporter. » |

Checklist tournage : mode avion OFF mais MOCK garanti · reduced-motion OFF · fenêtre 1440×900 ·
compte démo déjà connecté · vider la recherche du dashboard · préparer la question du copilote.

## Checklist tournage v1.3.0 (revalidée sur la prod le 7 juillet — prompt E)

> Vérifié en direct sur https://agrivo-io.vercel.app : chaque plan est tournable tel quel. Deux
> changements depuis les versions précédentes à ne PAS rater :
- **Import du registre REPLIÉ par défaut** : sur le dashboard, cliquer d'abord **« Auditer mon
  registre »** (la carte se déplie) AVANT « Essayer avec le registre de démonstration ». Sinon le
  bouton du registre démo n'est pas visible.
- **Mode terrain réel (nouveau)** : si Christ filme sur un téléphone, à l'étape Cartographie choisir
  **« Tour de champ GPS (réel) »** et marcher un petit périmètre (cour, parking) — les waypoints se
  posent en marchant, « Fermer le polygone » s'active à 3 sommets. À défaut de mobile, les modes
  simulés du web font le plan de secours.
- **Préchauffer l'IA avant de filmer/pitcher** : se connecter en admin (`admin@agrivo.com`) →
  encart « Préparation démo (IA) » → **« Préchauffer l'IA (démo) »**. Si les deux chips passent
  « IA en direct », le cache est amorcé : même si Gemini plafonne pendant la démo, la dernière
  rédaction live se ré-affiche (étiquetée de son heure) au lieu du repli « Mode démonstration ».
- Labels exacts à filmer, dans l'ordre : « Auditer mon registre » → « Essayer avec le registre de
  démonstration » → « 63 % prêtes pour la RDUE » → « Générer le plan d'action IA » (badge « Rédigé
  par Gemini · IA en direct ») ; puis parcours → « Valoriser la parcelle » → « Partager le dossier
  avec l'exportateur » → « Générer l'argumentaire de prime (IA) » → « Copier ».
- Effet final : sur `/verifier-certificat?ref=AGV-2026-0417`, le statut « Conforme » s'affiche —
  bon plan de secours si le QR scanné en salle ne passe pas.

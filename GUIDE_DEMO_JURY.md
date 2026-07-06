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
3. **Web : dashboard coopérative (1 min 15)** — 4 KPI officiels (dont « Dossiers partagés »), alertes,
   dernière vérification remontée, puis **démo « Importer mon registre »** : clic sur « Essayer avec le
   registre de démonstration » → « 63 % prêtes pour la RDUE, 19 parcelles sur 30 » + anomalies par
   catégorie (à compléter sur le terrain / à corriger au bureau). Phrase clé : « Les coopératives ont
   déjà des fichiers ; environ 30 % de ces données ne sont pas fiables pour la RDUE. AGRIVO les
   transforme en conformité prouvable. »
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

## Réponses aux questions pièges
- **« Votre IA est-elle réelle ? »** — Oui : quand `GEMINI_API_KEY` est posée, l'OCR, le mémo DDS et le
  copilote appellent réellement Gemini. Les verdicts et chiffres restent calculés sur les données
  (l'IA met en mots, elle n'invente rien). Sans clé ou en cas de panne réseau : repli automatique sur
  le mode démonstration, visible et assumé dans l'admin.
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

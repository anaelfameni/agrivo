# AGRIVO — Présentation équipe (mise à jour de référence)

> **Document de référence officiel du projet** — version du 7 juillet 2026, rédigé par Anael (chef de projet).
> Il remplace la partie « état du produit » de `AGRIVO_Plan_Fonctionnement_et_Equipe.pdf` (6 juillet, matin)
> et intègre TOUT ce qui a changé depuis (sessions 14 à 22). Un nouvel arrivant doit pouvoir comprendre
> le projet en lisant ce seul document. Pour MAÎTRISER le projet et répondre au jury, lire ensuite le
> document de formation joint : **`AGRIVO_Formation_Equipe.pdf`**. Confidentiel équipe :
> Anael · Christ · Gaddiel · Domy.
> Jury : **samedi 11 juillet 2026, CSCTICAO** · Produit : **https://agrivo-io.vercel.app** (**v1.16.0, EN PRODUCTION**).

> 🟢 **MISE À JOUR — VEILLE DU JURY (vendredi 10 juillet 2026, v1.16.0).** En cas de contradiction avec le texte plus bas, **ce bloc fait foi**. Document de synthèse à lire en priorité : **`AGRIVO_Equipe_JourJ.pdf`**.
> - **Produit** : v1.16.0 en production sur https://agrivo-io.vercel.app — **79 tests** automatisés au vert, CI verte.
> - **Prix (à jour)** : coopérative **100 000 FCFA/mois** (≈ **1 200 FCFA** par producteur vérifié et par an) · API exportateur **à partir de 1 000 000 FCFA/mois**. *(Les anciens 125 000 / 120 000 / 1 500 000 cités plus bas sont caducs.)*
> - **Deux espaces, deux comptes démo** : Coopérative `client@test.com` / `123client123` (Amadou) · Exportateur `export@agrivo.com` / `123export123` (Marc).
> - **Le pitch est un pitch PUR de 5 minutes — AUCUNE démonstration en direct.** Le PowerPoint est **envoyé à l'avance** sur **vibeathonci.com/soumettre** (il ne sera pas projeté). Toute mention de « démo au jury » plus bas est caduque.
> - **Scan mobile réparé** : sur téléphone, bouton **« Activer la caméra »** puis **« Scanner la carte »** ; sinon **« Saisir manuellement »**. Message si l'image est floue (l'OCR redemande une photo nette).
> - **Langage** : « évaluation » (jamais « garantie ») · **aucun crédit ni financement** · verdicts exacts **Conforme / Anomalie détectée / Données insuffisantes** · Conseil du Café-Cacao = « **démarche engagée** », jamais « partenariat ».

---

## 1. La vision actuelle (ce qu'AGRIVO est devenu)

AGRIVO transforme les données de parcelles que les coopératives **possèdent déjà** en conformité RDUE
**prouvable** : audit du registre existant, vérification satellite parcelle par parcelle, certificat
vérifiable publiquement, et dossier de diligence prêt pour l'export. Et cette conformité devient un
**argument commercial** : primes de durabilité négociables, accès aux acheteurs premium, dossier partagé
avec l'exportateur.

Notre promesse en une phrase (celle du splash) : **« De la parcelle vérifiée à la prime négociée. »**

Trois idées structurent tout le produit :

1. **L'audit avant la collecte.** Les coopératives détiennent déjà des géodonnées (fichiers de
   certification Rainforest Alliance en .geojson/.kml, cartographies financées par les exportateurs).
   Le problème n'est pas d'en produire, mais de les rendre fiables : l'étude Meridia/Rabo Foundation
   (région du Cavally) montre qu'environ **30 % des données terrain ne sont pas assez fiables pour la
   RDUE**. AGRIVO importe le registre, l'audite, et ne fait capturer sur le terrain que ce qui manque.
2. **Le satellite juge, il ne déclare pas.** Whisp (l'outil de référence FAO) vérifie ce qu'il y a
   dans le polygone déclaré ; la géométrie légale vient toujours de la déclaration de l'opérateur.
3. **La conformité se valorise par les primes, jamais par la dette.** Le micro-crédit producteur est
   **retiré du produit** (décision du 6 juillet, voir §2). AGRIVO ne fait AUCUN score de crédit,
   plafond ou décision de financement — c'est une frontière produit ferme et définitive.

---

## 2. Le changement stratégique majeur : le pivot « Valorisation »

Suite à des informations terrain d'une professionnelle de l'export cacao (6+ ans d'expérience), deux
constats ont invalidé notre étape 6 « Crédit » : **(1)** les coopératives n'accordent aucun
préfinancement aux producteurs, par choix structurel (autonomie, historique d'impayés et de fraudes) ;
**(2)** elles connaissent déjà la géolocalisation de leurs producteurs affiliés avant l'achat.

Décisions actées (source de vérité : `PLAN_REORIENTATION_AGRIVO.md`) :

- **L'étape 6 du parcours = « Valorisation »** : la parcelle conforme rejoint le **dossier de
  conformité** de la coopérative — l'argument pour négocier les **primes de durabilité** (toujours
  « au-dessus du prix garanti », jamais « négocier le prix », qui est fixé par l'État) et accéder aux
  acheteurs premium. Bouton « Partager le dossier avec l'exportateur ».
- **Purge complète du crédit** dans l'interface FR + EN, les textes, le deck, le guide démo, les tests.
  Personne ne prononce « crédit », « prêt », « micro-crédit » ou « score financier » devant le jury.
- **Modèle économique** = abonnement coopérative + API exportateur (la commission micro-crédit est
  supprimée). Le deck présente l'hypothèse tarifaire à valider au pilote.

**Le pivot a été validé en ligne le 6 juillet** (recherche sourcée, session 18) :

- Prime Fairtrade cacao : **250 €/t en Côte d'Ivoire au 1er octobre 2026 (+13 %), dont 40 % en cash
  direct aux membres**.
- **Convergence 2026-27 (l'argument massue)** : carte producteur obligatoire au 01/09/2026 + prime
  Fairtrade cash au 01/10/2026 + RDUE au 30/12/2026 → trois échéances sur une seule campagne.
- La Côte d'Ivoire est classée **« risque standard »** (Commission, 22/05/2025) : la géolocalisation
  complète reste obligatoire — la « simplification UE » ne bénéficie qu'aux pays à risque faible.
- Concurrence : Meridia Verify et KoltiVerify font de l'audit de géodonnées (le besoin est validé par
  le marché) ; notre différence = self-service côté coopérative + boucle complète (audit → complétion
  in-app → verdict satellite → certificat public → dossier partagé) + ancrage Côte d'Ivoire. Trusty
  (blockchain ivoirienne) trace des LOTS pour les exportateurs : complémentaire, pas concurrent.

---

## 3. La deuxième bascule : de la collecte à l'audit

AGRIVO ne « collecte » plus d'abord : il **audite ce que la coopérative possède déjà**.

- **Import du registre** en tête du dashboard coopérative : fichier .geojson/.json/.kml/.csv, parsing
  100 % côté client (les données ne quittent pas le navigateur — micro-copy ARTCI « Vos données
  restent la propriété de la coopérative »).
- **Audit RDUE instantané** : % de parcelles prêtes + anomalies typées (polygone ouvert, doublon de
  matricule, parcelle ≥ 4 ha en point seul, chevauchement, hors zone) avec pour chacune l'action :
  « à corriger au bureau » ou « à compléter sur le terrain » (→ renvoie vers l'étape Cartographie).
- **La démo** : bouton « Essayer avec le registre de démonstration » → 30 parcelles à défauts
  volontaires → « **63 % prêtes pour la RDUE (19/30)** ». Phrase clé : « Vos données existent déjà.
  AGRIVO les rend prouvables. »
- La landing raconte désormais ce flux en 5 temps : Importez votre registre → AGRIVO l'audite →
  Complétez les trous → Le satellite juge → Valorisez.

---

## 4. L'IA est désormais RÉELLE en production

La clé Gemini est posée et testée en production (session 19). **Cinq usages Gemini tournent en LIVE**
sur https://agrivo-io.vercel.app (modèle `gemini-2.5-flash`) — les deux nouveaux ont été **vérifiés en
production le 7 juillet** (badge « Rédigé par Gemini · IA en direct » capturé) :

| Feature | Mode | Comportement |
|---|---|---|
| Copilote exportateur (`/api/gemini/query`) | **LIVE** | Le raisonnement et les chiffres restent déterministes (calculés sur les données) ; Gemini met en mots. Testé en prod : `live:true`. |
| Mémo de diligence DDS (`/api/gemini/memo`) | **LIVE** | Trame et faits déterministes, rédaction réécrite par Gemini. Si Gemini échoue en live : l'UI affiche « L'IA est momentanément indisponible. Veuillez réessayer plus tard. » — **plus de repli silencieux vers un texte simulé** (décision d'honnêteté, session 20). |
| OCR carte producteur (`/api/gemini/scan`) | **LIVE** | Gemini Vision extrait les champs de la photo. Repli mock prouvé sur image illisible. ⚠️ Reste à tester avec une **vraie carte** (mission Domy). |
| Whisp — détection satellite (`/api/whisp/verify`) | Pré-enregistré | Assumé devant le jury : « outil de référence FAO, API sur inscription, intégration au pilote ». |
| **Plan d'action IA** (`/api/gemini/audit-plan`) — NOUVEAU v1.2.0 | **LIVE** | Après l'audit du registre (le moment « 63 % »), Gemini transforme les anomalies en plan de travail priorisé (bureau d'abord, terrain ensuite). Faits déterministes, repli étiqueté « Mode démonstration ». |
| **Argumentaire de prime IA** (`/api/gemini/valorisation-memo`) — NOUVEAU v1.2.0 | **LIVE** | À l'étape Valorisation, Gemini rédige le brief de négociation (portefeuille prouvé + faits sourcés, jamais de montant promis) avec bouton Copier. |

**Le discours IA passe de 3 à 5 usages en production** — phrase jury : « L'IA ne détecte pas
seulement les problèmes : elle organise la mise en conformité et rédige l'argument commercial. »
Sans clé (dev/offline), tout retombe automatiquement en mode démonstration : **la démo ne casse jamais**.

> Note technique (leçon session 19) : les clés Google AI Studio au format `AQ.Ab8…` sont **valides**
> (nouveau format). L'ancienne consigne « une clé commence par AIza » est périmée.

> ⚠️ Note fiabilité (leçon session 21, à connaître avant vendredi) : en **free tier**, Google plafonne
> par adresse IP — et les IP de sortie Vercel sont PARTAGÉES entre des milliers d'apps. Résultat :
> le live peut répondre 429 par intermittence en prod alors que la même clé marche en local. Nos
> mitigations sont codées (retry, mise en mots sans « réflexion », repli étiqueté « Mode
> démonstration » — la démo ne casse jamais). **Le fix définitif est une action Anael de 5 minutes :
> activer la facturation Tier 1 sur la clé AI Studio avant la répétition de vendredi.**

---

## 5. Ce qui a changé dans le produit, version par version

### v1.0.0 (6 juillet — gel de compétition, sessions 17 à 18b)
- Pivot Valorisation complet (étape 6, purge crédit FR+EN, `evaluerValorisation` remplace le scoring).
- Import & audit RDUE du registre (dashboard coop) + 8 tests dédiés → **32 tests**.
- Reframe « collecte → audit » sur la landing et le guide démo.
- Refonte design priorisée (12 des 15 items de l'audit `AUDIT_INTERFACE_AGRIVO.md`) : reduced-motion
  garanti partout (plus aucun écran vide possible), eyebrow route-aware « Espace exportateur »,
  `/verifier-certificat` étoffé (rappel des 3 statuts verbatim), détails d'anomalie bilingues,
  accessibilité (`role="meter"` sur la jauge d'audit).
- Déployée en prod, CI verte, smoke-test 8/8 routes.

### v1.1.0 (6 juillet soir — correctifs UX que j'ai demandés, session 20)
| Zone | Avant | Maintenant |
|---|---|---|
| Page parcelle | Aperçu stylisé sur fond vert | **Vraie carte satellite** (imagerie Esri), polygone teinté au verdict, coordonnées GPS |
| Page Parcelles | Liste seule | Liste + **carte satellite du portefeuille liée** (survol ligne ↔ pastille) |
| Étape Cartographie | 2 modes (point / tour de champ) | **3e mode « J'ai déjà les coordonnées »** : la coop colle ses coordonnées existantes (1 ligne = point, ≥ 3 = polygone fermé), validation zone CI, mêmes contrôles d'intégrité |
| Producteurs | Ajout non cliquable, sans position | Champs **latitude/longitude**, producteur **persisté** et cliquable → fiche avec carte + CTA « Lancer la vérification » |
| Navigation | Onglet « Exportateur » ambigu | « **Vue exportateur** » + sous-titre « vue de démonstration » (le tableau de bord que consulte l'exportateur) |
| DDS en live | Repli silencieux vers texte simulé | Erreur honnête « L'IA est momentanément indisponible » |
| Domaine | agrivo-three.vercel.app | **https://agrivo-io.vercel.app** (seule URL à montrer) |

État technique : **v1.1.0 taguée et déployée · CI verte · 32/32 tests · TypeScript strict OK · 32 routes**.

### v1.2.0 (6 juillet, nuit — « L'auditeur IA », suite à l'ultra-review stratégique)
- **2 nouvelles features IA sur les moments signatures** (voir tableau §4) : plan d'action IA sur
  l'audit du registre + argumentaire de prime IA à l'étape Valorisation. Testées **live** (Gemini réel).
- Correctifs : écran admin honnête sur le mode live, verdict + preuves + lecture vocale enfin
  traduits en EN à l'étape Analyse, aperçu du certificat traduit, « cinq temps » à l'étape 1,
  « cockpit » retiré (charte), favicon (plus de 404).
- **39/39 tests · build vert · tag v1.2.0 · déployée en prod dans la nuit** (l'alias a fini par passer).

### v1.7.0 (7 juillet — mode terrain PWA + IA fiabilisée, session 24) — VERSION EN PROD
- **Mode terrain « Tour de champ GPS (réel) »** : sur mobile, l'étape Cartographie écoute la VRAIE
  géolocalisation de l'appareil (`watchPosition`) au lieu de la simuler — waypoints posés en marchant
  (~1 tous les 8 m), distance et précision live réelles, fermeture du polygone, emprise CI, standard
  RFC 7946. Les modes simulés restent sur desktop et en secours. **Conséquence pour le pitch : « une
  seule application, du bureau du gérant au bord du champ, sans store » est désormais RÉEL et
  démontrable sur un téléphone** (voir la nouvelle §4.6 du document de formation).
- **Filet anti-quota IA** : les 2 features signatures mémorisent dans le navigateur leur dernière
  réponse générée en direct ; si Gemini plafonne (429 free tier) pendant la démo, la dernière
  rédaction live se ré-affiche, étiquetée de son heure — sinon repli « Mode démonstration ». Un
  bouton admin **« Préchauffer l'IA (démo) »** amorce ce cache en coulisses avant de monter sur scène.
- **Répétition GO/NO-GO automatisée sur la prod** : 9 segments GO, 0 NO-GO, 0 erreur console ; plan
  d'action IA et argumentaire **confirmés LIVE** en production.
- **47/65 tests · build vert · tag v1.7.0 · EN PROD sur https://agrivo-io.vercel.app.**

### v1.2.1 (7 juillet — vérification prod + résorption de l'ultra-review, session 22)
- **Vérification en production des 5 points critiques** : plan d'action IA et argumentaire de prime
  **confirmés LIVE** (badge « Rédigé par Gemini · IA en direct »), étape 4 anglaise complète, plus
  de « quatre temps », favicon propre.
- **Vrai bug trouvé et corrigé** : l'écran admin lisait une constante serveur depuis le navigateur et
  affichait toujours « mode démonstration forcé » — il interroge désormais l'état RÉEL via
  `/api/admin/etat` (la prod répond `{"mock":false}`).
- **Pages légales sans placeholders** : plus aucun « [À compléter] » ; formulations honnêtes
  d'avant-immatriculation, directeur de la publication : Anael Fameni.
- **Certificat en anglais** : aperçu 100 % EN (date en-GB, « Cocoa », coordonnées N/S/E/W) ; le PDF
  téléchargé reste volontairement le document officiel en FRANÇAIS.
- **Import du registre replié par défaut** (une ligne « Auditer mon registre » qui s'étend au clic —
  le dashboard respire ; **+1 clic dans le déroulé de démo**, guide mis à jour).
- **Identifiants démo retirés de l'écran /connexion** (le bouton 1-clic reste — voir Annexe).
- Skeletons de chargement /app, états vides contextuels avec bouton de réinitialisation, transitions
  d'onglets exportateur, eyebrows uniformisés, `PLAN_V2.md` (chemin serveur post-jury).
- **39/39 tests · build vert · tag v1.2.1 · EN PROD sur https://agrivo-io.vercel.app.**

---

## 6. Changements UX/UI et design (sessions 14 → 20)

- **Design system stabilisé** : palette « Forêt & Données » (fond `#0a1f14`, vert signal `#16a34a`,
  ivoire `#f7f3ea`), titres **Space Grotesk**, corps Geist, chiffres Geist Mono. Framer-motion sobre,
  `prefers-reduced-motion` respecté partout (état initial = état final : règle générale depuis P5).
- **Splash + hero** conservés (signature visuelle), promesse mise à jour : « De la parcelle vérifiée à
  la prime négociée. »
- **Dashboard coop** : import registre en tête, KPI « Dossiers partagés » (teinte verte), alertes.
- **Dashboard exportateur** (3 onglets) : analytique + carte satellite du portefeuille liée au tableau,
  assistant IA, configuration & journal réseau. Colonnes du tableau retravaillées (truncate propre).
- **Parcours de vérification** : stepper resserré, rappel de la parcelle à l'étape Valorisation
  (badge statut + n° de certificat), focus-visible uniformisé sur les liens texte.
- **Cartes réelles partout** (v1.1.0) : plus aucun placeholder stylisé sur les pages parcelle/portefeuille.

---

## 7. Choix techniques et architecture (état réel)

- **Stack** : Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind v4 ·
  framer-motion 12 · lucide-react · react-leaflet (imagerie satellite Esri) · @react-pdf/renderer
  (certificat PDF + QR) · PWA (manifest, service worker prudent, page hors-connexion).
- **Aucun backend séparé cette édition** : données de démo via routes API Next.js. Auth côté client
  (localStorage) à l'expérience « vrai SaaS » (connexion, inscription, session, routes protégées).
- **Deux IA, jamais confondues** : **Whisp (FAO)** = détection satellite (pas un modèle maison ;
  pilote Kenya 6 000+ parcelles) · **Gemini (Google)** = langage/vision (OCR, mémo DDS, copilote).
- **Sécurité de la clé** : `GEMINI_API_KEY` est **serveur uniquement** (.env.local local, variable
  d'environnement Vercel) — aucun appel ne part du client, la clé n'est jamais exposée ni commitée.
- **MOCK_MODE** automatique : `MOCK_MODE = !GEMINI_API_KEY` ; chaque route garde un repli si l'appel
  échoue. Latence simulée pour un ressenti d'appel réel.
- **GeoJSON RFC 7946** : WGS-84, ordre lon/lat, **6 décimales** (±11 cm), anneaux fermés — vérifié
  par tests ; export conforme TRACES NT depuis le dashboard exportateur.
- **Import registre** : parsers GeoJSON/CSV/KML **purs et testés** (`lib/registre/audit.ts`),
  exécutés dans le navigateur (aucune donnée envoyée).
- **Preuves de méthode** (le jury évalue le pipeline, pas juste la démo) : `SPECS.md` (user stories +
  critères d'acceptation), `ARCHITECTURE.md` (ADR + plan de rollback Vercel), `CHANGELOG.md`,
  `PLAN_V2.md` (chemin vers la production réelle), **CI GitHub Actions** (lint + types + tests +
  build à chaque push), **65 tests Vitest**, tags `v1.0.0` → `v1.7.0`.

---

## 8. Le produit, écran par écran (pour un nouvel arrivant)

**Site public** : landing (splash + hero + « Vos données existent déjà. AGRIVO les rend prouvables. »),
/methodologie (schéma Donnée · IA · Résultat), /tarifs, /faq, /a-propos, /contact, /aide, pages
légales (CGU, confidentialité ARTCI, mentions), **/verifier-certificat** (vérification publique par
n° AGV ou scan du QR d'un certificat — c'est notre effet final devant le jury).

**Espace coopérative** (`/app`, compte démo en 1 clic) :
- **Dashboard** : bonjour Amadou, 4 KPI, **import & audit du registre** (replié en une ligne
  « Auditer mon registre » ; après l'audit : bouton **« Générer le plan d'action IA »**), recherche,
  dernières vérifications, alertes.
- **Parcours « Nouvelle vérification »** (golden path, 6 étapes) : 1. Sélection coopérative →
  2. **Scan carte producteur** (QR d'abord, repli OCR Gemini Vision ; anti-doublon matricule ; photo
  conservée comme preuve) → 3. **Cartographie GPS** (point central < 4 ha / tour de champ ≥ 4 ha —
  règle RDUE — ou « J'ai déjà les coordonnées » ; contrôles d'intégrité : chevauchement, superficie
  plausible, signal GPS authentique, doublon) → 4. **Analyse satellite Whisp** (3 statuts verbatim :
  Conforme · Anomalie détectée · Données insuffisantes) → 5. **Certificat PDF + QR** →
  6. **Valorisation** (dossier de conformité, primes, partage exportateur + **« Générer
  l'argumentaire de prime (IA) »** avec bouton Copier).
- **Parcelles / Producteurs / Paramètres / Consentement ARTCI** : gestion et conformité.
- **Vue exportateur** (démonstration du point de vue de l'exportateur) : analytique 4 KPI officiels
  (producteurs audités · taux de conformité · superficie cartographiée · volume validé), carte
  portefeuille, export GeoJSON TRACES NT, **copilote IA**, journal réseau.
- **Admin** (`admin@agrivo.com`) : clés d'API masquées, MOCK_MODE, état des services.

**L'app mobile (Christ)** fait la démo du golden path avec la **capture GPS réelle** (watchPosition,
tour de champ) là où le web simule — voir le document dédié `AGRIVO_Guide_App_Mobile.pdf` (Mission 2,
joint à cette mise à jour).

---

## 9. Décisions produit à connaître (et interdits de langage)

1. Les 3 statuts, mot pour mot : **Conforme** · **Anomalie détectée** · **Données insuffisantes**.
2. Toujours « **évaluation** », jamais « garantie » de conformité.
3. **Aucun pourcentage de précision inventé** (pas de « 99 % fiable »). Les seuls chiffres cités sont
   sourcés (63 % registre démo, ~30 % étude Cavally, 250 €/t Fairtrade, convergence 2026-27).
4. **Zéro crédit / prêt / score financier** — AGRIVO valorise par les primes, point.
5. On ne « négocie pas le prix » (fixé par l'État) : on négocie **les primes** au-dessus du prix garanti.
6. Pas de « délégué » (sauf « délégué à la protection des données », terme légal) : dire
   « l'utilisateur de l'app » (producteur, pisteur ou agent de coopérative).
7. Aucun logo de partenaire fabriqué ; « contact identifié », jamais « contact pris ».
8. Whisp = outil FAO (pas un modèle maison) ; Gemini = mise en mots ; les chiffres restent calculés.

---

## 10. Qui fait quoi d'ici samedi

| Qui | Quoi | Quand |
|---|---|---|
| **Christ** | App mobile : réadapter l'existant selon le guide technique joint (`AGRIVO_Guide_App_Mobile.pdf`) — priorité aux écrans de démo. Puis tourner la **vidéo plan B** sur la prod v1.1 (plan 5 = Valorisation, plan 2bis = import registre 63 %). | Mar–jeu ; vidéo jeudi soir au plus tard |
| **Gaddiel** | Maîtriser le discours technique : architecture (Next.js/Vercel, 2 IA distinctes Whisp/Gemini, GeoJSON RFC 7946, TRACES NT), réponses « pourquoi l'IA ? » et « si l'IA se trompe ? » (statut Données insuffisantes + revérification). Répéter l'export GeoJSON en démo. | Mar–ven |
| **Domy** | Scanner une **vraie carte producteur** (test OCR live — dernier maillon IA non testé en réel), revérifier les 3 chiffres cités (250 €/t, 63 %, convergence 2026-27), flashcards à jour pour les 4. | Mar–mer |
| **Anael** | `git push origin main --tags` (1 min — dernière action bloquée côté outil), **activer la facturation Tier 1 sur la clé Gemini** (5 min, fiabilise le live avant vendredi), action Vercel domaines (2 min : Project agrivo → Settings → Domains → Add `agrivo-io.vercel.app`), relire le deck v3, répétition générale sur PROD vendredi 10 (P9), chrono pitch 5:00. | Mar–ven |

**Jalon commun : répétition générale vendredi 10 juillet**, tous ensemble, sur https://agrivo-io.vercel.app —
parcours complet + questions croisées (cold-call : le jury peut interroger n'importe lequel d'entre nous).
Grille officielle : Impact 30 % · Faisabilité 20 % · Usage IA 20 % · Innovation 15 % · Pitch 15 %.
Le pitch dure **5 minutes** + 2 minutes de questions.

---

## 11. Roadmap (après le jury — slide « Et après »)

- **Monitoring continu du risque** (alertes satellite récurrentes réelles).
- **Diagnostics agronomiques** et extension du score de résilience des sols.
- **Carbone / biodiversité** (valorisation additionnelle du portefeuille).
- **Partenariat CCC** : accès au registre des ~3 M ha géolocalisés (demande officielle du pitch).
- **App mobile en production** (capture GPS réelle, offline-first, synchronisation).
- **Backend réel** : auth serveur, base de données, API Whisp officielle (inscription FAO), comptes multi-coops.
- Pilote nommé dans le deck : **ECOOKIM** + mentorat AFRINOVATECH + mise en relation CCC.

## 12. Prochaines étapes immédiates (check-list)

0. ☑ ~~Mettre en production~~ — **FAIT : la v1.7.0 est en prod sur https://agrivo-io.vercel.app**
   (mode terrain + IA fiabilisée, GO/NO-GO 9/9 le 7 juillet). Reste UNE commande Anael (1 min) :
   `git push origin main --tags` — pour que GitHub et la CI reflètent la prod.
1. ☐ **Action Anael (5 min) : facturation Tier 1 sur la clé Gemini** (AI Studio → Billing) — supprime
   la loterie 429 du free tier depuis les IP partagées Vercel. À faire AVANT la répétition de vendredi.
   (En attendant : bouton admin **« Préchauffer l'IA (démo) »** à cliquer avant la démo.)
1bis. ☑ **RÉSOLU (v1.16.0)** : le tarif coopérative est fixé et déployé à **100 000 FCFA/mois**
   (≈ 1 200 FCFA par producteur vérifié et par an) ; API exportateur **à partir de 1 000 000 FCFA/mois**.
   Les anciens 120 000 / 125 000 / 1 500 000 sont caducs.
2. ☐ Action Anael (2 min) : domaine `agrivo-io.vercel.app` attaché au projet Vercel (sinon réassigner l'alias à chaque déploiement).
3. ☐ Domy : test OCR avec une vraie carte producteur (mar–mer).
4. ☐ Christ : alignement app mobile (guide joint) puis vidéo plan B (jeudi soir max).
5. ☐ Équipe : **lire `AGRIVO_Formation_Equipe.pdf`** (formation + 40 questions/réponses jury) puis
   flashcards croisées à la répétition (`GUIDE_DEMO_JURY.md`, chacun).
6. ☐ Vendredi 10 : **P9 — répétition générale sur PROD** (déroulé 7 min chronométré avec les 2 clics
   IA, accepter les cookies sur la machine de démo, scan QR depuis un téléphone, vidéo plan B en
   local ET sur clé USB).
7. ☐ Samedi 11 : jury au CSCTICAO — aucun changement de code après le gel.

---

## Annexe — accès et références

- **URL unique** : https://agrivo-io.vercel.app (ne plus jamais montrer agrivo-three).
- Compte démo coopérative : `client@test.com` / `123client123` (Amadou, Coop. de Soubré) — bouton
  « Entrer avec le compte de démonstration ». ⚠️ Depuis v1.2.1, ces identifiants ne sont **plus
  affichés sur la page /connexion** (durcissement) : le bouton 1-clic reste, et ce document est la
  référence de l'équipe.
- Compte admin : `admin@agrivo.com` / `123admin123`.
- Guide présentateur intégré : **Ctrl+Shift+D** n'importe où dans le site.
- Vérification publique : `/verifier-certificat` (le QR du certificat PDF y mène).
- Documents du repo : `CLAUDE.md` (mémoire de travail) · `PLAN_REORIENTATION_AGRIVO.md` (pivot) ·
  `GUIDE_DEMO_JURY.md` (déroulé + questions pièges) · `AUDIT_INTERFACE_AGRIVO.md` (audit design P4) ·
  `SPECS.md` · `ARCHITECTURE.md` · `CHANGELOG.md` · `PLAN_V2.md` (après le jury) ·
  `SUPPORTS_PIVOT_P6.md` (contenus deck).
- Documents équipe (PDF joints) : **`AGRIVO_Formation_Equipe.pdf`** (formation complète + réponses
  jury — À LIRE PAR LES 4) · `AGRIVO_Guide_App_Mobile.pdf` (spec technique, Christ) ·
  `AGRIVO_Ultra_Review_Rapport_Final.pdf` et `AGRIVO_Ultra_Review_Strategique.pdf` (audits, référence).

*AGRIVO — document interne équipe · mis à jour le 7 juillet 2026 · rédigé par Anael (chef de projet).*

---

## Mise à jour v1.7.0 (8 juillet) — à connaître absolument

Le site est passé en **version finale v1.7.0** : **13 usages IA** (contre 8 avant) et **65 tests** au vert. Ce qui a changé :

- **5 nouvelles fonctions IA** : le **Copilote RDUE** (bulle ✨ sur le tableau de bord et la FAQ — répond aux questions sur le règlement avec la source citée), la **Revue IA du registre** (repère les signaux faibles : superficies identiques, noms quasi-doublons), le **Dossier acheteur EUDR** (onglet exportateur — résumé exécutif IA + export), le **verdict traduit en dioula/baoulé** (l'explication seulement, jamais le statut), et le **diagnostic visuel de parcelle** par photo (observation, jamais un verdict).
- **Rituel pré-vol AVANT toute démo** : se connecter en admin → « Préchauffer l'IA (démo) » → attendre le bandeau **« Démo prête : 6/6 en direct »**. C'est notre garantie anti-panne en salle.
- **Site vitrine finalisé** : onglet « Accueil » (l'écran de bienvenue n'apparaît plus que sur rafraîchissement ou arrivée par URL), heros unifiés sur Méthodologie/À propos/Tarifs, tout le jargon technique retiré des pages publiques, section « L'enjeu, à l'échelle du pays » (1ᵉʳ producteur mondial · 6 M+ de personnes · 66 % vers l'UE — chiffres sourcés USDA/Trase).
- **Le détail complet des 13 fonctions IA** (une par une, avec le bénéfice client) est dans le document **AGRIVO_Nouveautes_et_IA.pdf** — à lire en priorité.

# SPECS — Expression de besoin et spécifications AGRIVO

> Étapes 1 et 2 du pipeline « Du besoin à la Release ». Ce document trace le besoin, les user
> stories avec leurs critères d'acceptation mesurables, le périmètre du MVP et la justification
> de la stack. Référence de la « definition of done » depuis la release v1.0.0 ; le produit
> livré est en **v1.18+** (92 tests, CHANGELOG.md exhaustif, chemin V2 dans PLAN_V2.md).

## 1. Le problème

À partir du **30 décembre 2026**, le règlement européen RDUE (UE 2023/1115) interdit l'entrée
sur le marché de l'UE de 7 matières premières (cacao, café, hévéa, palmier à huile, bovins,
soja, bois) issues de parcelles déboisées après le 31 décembre 2020. Chaque lot doit être
accompagné d'une **géolocalisation de parcelle** (GeoJSON) et d'une déclaration de diligence
raisonnée. En Côte d'Ivoire, premier producteur mondial de cacao, plus d'un million de petits
producteurs risquent l'exclusion du marché européen faute d'outil de vérification accessible.

**Utilisateur final** : le gérant de coopérative (persona Amadou) qui doit vérifier des
centaines de parcelles au bord du champ, et l'exportateur (persona Marc) qui doit prouver la
conformité de chaque conteneur.

## 2. User stories et critères d'acceptation

### US1 — Vérifier une parcelle (Amadou, gérant de coopérative)
« En tant que gérant de coopérative, je veux vérifier la conformité RDUE d'une parcelle en
quelques minutes au bord du champ, afin de savoir immédiatement si la récolte de ce producteur
peut partir vers l'Europe. »

Critères d'acceptation :
1. Le parcours complet (consentement, scan, cartographie, verdict) s'exécute sans rechargement de page. ✅
2. Le scan de la carte producteur pré-remplit le formulaire (Gemini Vision en mode live, jeu de démonstration en mock). ✅
3. Le verdict est l'un des trois statuts figés : Conforme, Anomalie détectée, Données insuffisantes, avec sa phrase officielle. ✅
4. Le consentement ARTCI (loi n°2013-450) est recueilli par case à cocher AVANT toute collecte. ✅

### US2 — Prouver la conformité (Marc, directeur durabilité)
« En tant qu'exportateur, je veux exporter la géolocalisation de mon portefeuille au format
attendu par TRACES NT, afin de déposer mes déclarations sans ressaisie. »

Critères d'acceptation :
1. L'export produit une FeatureCollection GeoJSON RFC 7946 : ordre longitude puis latitude, WGS-84, 6 décimales, anneaux fermés. ✅ (testé : tests/donnees.test.ts)
2. Les 4 KPI officiels s'affichent : producteurs audités, taux de conformité, superficie cartographiée, volume validé. ✅ (testé)
3. Le certificat PDF porte un QR code de vérification publique. ✅

### US3 — Valoriser la conformité (Amadou, gérant de coopérative)
« En tant que gérant de coopérative, je veux que chaque parcelle conforme rejoigne le dossier de
valorisation de la coopérative, afin de négocier les primes de durabilité au-dessus du prix
garanti et d'accéder aux acheteurs premium. »

> Contrainte produit : AGRIVO ne fait aucun score de crédit, aucun plafond, ni décision de
> financement (frontière produit stricte).

Critères d'acceptation :
1. L'étape Valorisation n'apparaît QUE si la parcelle est conforme. ✅ (testé)
2. Aucun montant, plafond ou vocabulaire de financement n'est affiché. ✅ (testé : tests/ia.test.ts)
3. Le dossier partagé alimente le KPI « Dossiers partagés » du dashboard. ✅
4. L'argumentaire de prime (IA) ne cite que des faits calculés ou sourcés, sans promesse de montant. ✅ (testé : tests/ia-nouvelles.test.ts)

### US4 — Vérifier un certificat (un acheteur européen)
« En tant qu'acheteur, je veux vérifier l'authenticité d'un certificat Agrivo à partir de son
numéro ou de son QR code, afin de faire confiance au lot que j'achète. »

Critères d'acceptation :
1. La page publique /verifier-certificat retrouve un certificat par son numéro AGV. ✅
2. Un numéro inconnu produit un message d'erreur clair, pas une page blanche. ✅

## 3. Périmètre du MVP

**Dans le périmètre (IN)** : parcours de vérification 6 étapes (dont Cartographie GPS et
Valorisation) · import & audit RDUE du registre de la coopérative · dashboards coopérative et
exportateur · export GeoJSON TRACES NT · certificat PDF avec QR · vérification publique ·
mémo de diligence (DDS), plan d'action d'audit et argumentaire de prime générés par IA ·
copilote portefeuille · authentification à session locale · PWA installable · interface FR/EN.

**Hors périmètre (v2)** : backend persistant multi-utilisateurs · appel Whisp live (inscription
API en cours, mock fidèle en attendant) · assistant vocal dioula/baoulé (pas de TTS fiable pour
ces langues : non simulé, par honnêteté) · notifications push.

## 4. Stack retenue et justification

| Choix | Justification |
|---|---|
| Next.js 16 (App Router) + React 19 + TypeScript strict | Un seul framework pour pages, routes API et rendu serveur ; typage strict = moins de bugs de démo. |
| Tailwind CSS v4 + Framer Motion | Système de design tokenisé et animations maîtrisées (reduced-motion respecté). |
| Whisp (FAO) pour la détection | Outil de référence ONU pour le RDUE, pilote Kenya 6 000+ parcelles : crédibilité, pas de modèle maison invérifiable. |
| Gemini (Google) pour vision et langage | OCR de carte, rédaction du DDS, copilote. Clé serveur uniquement, jamais côté client. |
| Vercel | Déploiement continu depuis GitHub, re-promotion en un clic (plan de rollback). |
| Vitest + GitHub Actions | Tests des fonctions critiques et CI verte obligatoire avant fusion. |

## 5. Contraintes non fonctionnelles

1. **Robustesse démo** : aucun échec d'appel IA ne doit casser le parcours ; repli mock automatique testé.
2. **Sécurité** : clés API en variables d'environnement serveur, jamais dans le code ni le client ; `.env*` ignoré par git.
3. **Accessibilité** : statuts toujours doublés d'un texte et d'une icône (jamais la couleur seule), navigation clavier, prefers-reduced-motion respecté partout.
4. **Performance** : pages statiques prérendues (32 routes), PDF chargé à la demande, images optimisées.
5. **Conformité données** : consentement préalable (ARTCI), minimisation (le certificat public n'expose que ce qu'il porte déjà).

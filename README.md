# AGRIVO

[![CI](https://github.com/anaelfameni/agrivo/actions/workflows/ci.yml/badge.svg)](https://github.com/anaelfameni/agrivo/actions/workflows/ci.yml)

**La conformité agricole, simplifiée.** — Vibeathon Côte d'Ivoire 2026.

**Production : [agrivo-io.vercel.app](https://agrivo-io.vercel.app)**

> Preuves de méthode (pipeline « Du besoin à la Release ») : [SPECS.md](SPECS.md) (besoin, user
> stories, critères d'acceptation, IN/OUT du MVP) · [ARCHITECTURE.md](ARCHITECTURE.md) (flux
> Donnée → IA → Résultat, mini ADR, plan de rollback) · [CHANGELOG.md](CHANGELOG.md) (versions,
> jusqu'à v1.15) · CI GitHub Actions (lint + types + tests + build) · `npm test` pour la suite Vitest.

## Le problème

Le **RDUE** (Règlement (UE) 2023/1115 contre la déforestation) s'applique au cacao ivoirien dès le
**30 décembre 2026** : sans géolocalisation vérifiée de chaque parcelle, un lot ne peut plus entrer
dans l'Union européenne. La Côte d'Ivoire, 1er producteur mondial, est classée « **risque standard** »
(benchmarking du 22 mai 2025) : la diligence complète y reste obligatoire — alors qu'environ 30 % des
géodonnées terrain existantes ne sont pas fiables.

## La solution

AGRIVO permet aux **coopératives** d'auditer leur registre de parcelles, de vérifier chaque parcelle
par **analyse satellite** (convergence de preuves autour de la date pivot du 31/12/2020), d'obtenir
l'un de **trois verdicts** — « Conforme », « Anomalie détectée », « Données insuffisantes » — et de
générer un **certificat d'évaluation de conformité** (PDF horodaté + QR de vérification publique),
au format **GeoJSON RFC 7946** prêt pour la déclaration TRACES NT. La conformité prouvée devient un
argument de **valorisation** : primes de durabilité et accès aux acheteurs premium (jamais de crédit
ni de financement — hors périmètre produit).

La plateforme couvre les **7 matières premières du RDUE** : cacao, café, hévéa, palmier à huile,
bovins, soja et bois — démo centrée cacao (Soubré).

## 🚀 Lancer le projet

Prérequis : **Node.js ≥ 18.17** (testé sur Node 20+) et **npm**.

```bash
npm install        # dépendances
npm run dev        # développement → http://localhost:3000
npm run build      # build de production
npm run start      # servir le build
npm run lint       # ESLint
npm test           # suite Vitest
npm run typecheck  # tsc --noEmit
```

**Comptes de démonstration** (un clic depuis `/connexion`) :

| Espace | E-mail | Mot de passe | Persona |
|---|---|---|---|
| Coopérative | `client@test.com` | `123client123` | Amadou · Coopérative Agricole de Soubré |
| Exportateur | `export@agrivo.com` | `123export123` | Marc · Cacao Export CI |
| Admin | `admin@agrivo.com` | `123admin123` | Console interne (état IA, préchauffage) |

Un **guide interactif animé** s'ouvre à la première connexion de chaque espace (relançable via le
bouton « ? » de l'en-tête). Sans clé `GEMINI_API_KEY`, les usages IA basculent sur un repli
déterministe groundé : la démo ne casse jamais.

## 🧭 Parcours produit

- **Espace coopérative** (`/app`) : tableau de bord (KPI, répartition des 3 statuts, alertes,
  parcelles à re-vérifier), **audit du registre** (import GeoJSON/CSV/KML → % prêt RDUE + anomalies +
  plan d'action IA), **export GeoJSON** TRACES NT, producteurs, parcelles, paramètres.
- **Vérification d'une parcelle** (`/app/verifier`) : consentement (ARTCI, loi n°2013-450) →
  coordonnées de la parcelle (**minimum 4 sommets**, table Sommet | Latitude | Longitude, superficie
  calculée, bornes Côte d'Ivoire) → analyse satellite animée → verdict expliqué (+ lecture vocale) →
  **certificat PDF avec QR** → valorisation (dossier de conformité de la coopérative).
- **Masque « zones sensibles »** : aires protégées et forêts classées (tracés indicatifs, sources
  publiques WDPA/Ministère) affichables sur toutes les cartes ; une saisie manuelle qui recoupe une
  aire protégée déclenche une **détection géométrique réelle** (verdict « Anomalie détectée »).
- **Espace exportateur** (`/app/exportateur`) : portefeuille multi-coopératives (tableau trié ↔ carte
  satellite liée), répartition des statuts, assistant de portefeuille, export GeoJSON, alertes,
  configuration.
- **Vérification publique** (`/verifier-certificat`) : tout acheteur scanne le QR d'un certificat et
  confirme le verdict sans compte.
- **Site vitrine bilingue FR/EN** : méthodologie, tarifs (coopérative 100 000 FCFA/mois · API
  exportateur à partir de 1 000 000 FCFA/mois), FAQ, à-propos, contact, aide, pages légales. PWA
  installable avec mode hors connexion.

## 🤖 Usages de l'IA (en production)

- **Assistant AGRIVO** (`/api/gemini/rdue-qa`) : chatbot groundé sur une **base de 33 faits sourcés**
  (produit + RDUE) — il se présente, guide écran par écran, répond en 3-4 phrases, intercepte les
  questions de financement (hors périmètre) et oriente les demandes complexes vers support@agrivo.ci.
  Small-talk déterministe instantané ; repli groundé sans clé.
- **Plan d'action IA** sur l'audit de registre : priorise bureau/terrain à partir des anomalies réelles.
- **Mémo de diligence (DDS)** : trame déterministe tirée des données, rédaction IA charte-safe.
- **Argumentaire de prime** (valorisation) : stats du portefeuille + faits de marché sourcés.
- **Copilote exportateur** : questions en langage naturel sur le portefeuille (outils tracés).
- **Détection satellite** : moteur de verdicts à 3 états, convergence de preuves, date pivot 31/12/2020
  (méthodologie de référence FAO) ; détection géométrique réelle parcelle × zones sensibles.

Modèle : Gemini 2.5 Flash, clé **exclusivement côté serveur**. Chaque réponse IA est groundée sur des
faits vérifiés : aucun chiffre inventé, « évaluation » jamais « garantie ».

## 🗂️ Structure du projet

```
app/
  layout.tsx          Polices next/font, LanguageProvider, AuthProvider, SplashScreen
  globals.css         Tailwind v4 (@theme) : palette Forêt & Données, effets, animations
  page.tsx            Landing (hero + sections)
  connexion/ inscription/          Authentification par profil (coopérative / exportateur)
  methodologie/ tarifs/ faq/ ...   Pages vitrine et légales
  verifier-certificat/             Vérification publique par QR
  app/                Espace protégé (dashboard, verifier, parcelles, producteurs,
                      exportateur, parametres, admin, consentement)
  api/                Routes serveur (whisp/verify, gemini/rdue-qa|scan|explain|query|memo|
                      audit-plan|valorisation-memo, admin/etat)
components/
  app/onboarding-tour.tsx   Guide interactif animé (7 étapes coop / 6 exportateur)
  app/copilote-rdue.tsx     Widget Assistant AGRIVO
  verifier/ exportateur/ landing/ ui/ legal/ map/
config/filieres.ts    Source de vérité des 7 denrées RDUE
data/
  mock-parcelles.ts   45 parcelles de démonstration (9 coopératives) + 3 scénarios géo
  zones-sensibles.ts  Aires protégées CI (tracés indicatifs sourcés)
lib/
  ai/rdue-faits.ts    Base de connaissances sourcée de l'assistant (33 faits + small-talk)
  geo/                Géométrie pure : superficie, point-dans-polygone, chevauchements,
                      évaluation EUDR d'une saisie manuelle (lib/geo/evaluation.ts)
  registre/           Parsers + audit RDUE du registre (module pur testé)
tests/                Suite Vitest (géométrie, registre, IA, copilote, charte)
```

Les tokens de design vivent dans `app/globals.css` (Tailwind v4, bloc `@theme`). La charte complète
(règles de contenu, statuts figés, faits produit) est dans `CLAUDE.md`.

## 🛠️ Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind CSS v4 ·
Framer Motion 12 · lucide-react · react-leaflet (fonds satellite Esri) · @react-pdf/renderer ·
polices Space Grotesk / Geist / Geist Mono (`next/font`) · PWA. Déploiement : Vercel
(`agrivo-io.vercel.app`).

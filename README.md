# AGRIVO

[![CI](https://github.com/anaelfameni/agrivo/actions/workflows/ci.yml/badge.svg)](https://github.com/anaelfameni/agrivo/actions/workflows/ci.yml)

**La conformité agricole, simplifiée.** — projet Vibeathon 2026.

> Preuves de méthode (pipeline « Du besoin à la Release ») : [SPECS.md](SPECS.md) (besoin, user
> stories, critères d'acceptation, IN/OUT du MVP) · [ARCHITECTURE.md](ARCHITECTURE.md) (flux
> Donnée → IA → Résultat, mini ADR, plan de rollback) · [CHANGELOG.md](CHANGELOG.md) (versions) ·
> CI GitHub Actions (lint + types + 24 tests + build) · `npm test` pour lancer la suite Vitest.

AGRIVO permet aux coopératives agricoles ivoiriennes de vérifier en quelques secondes si une parcelle
respecte le **RDUE** (Règlement UE 2023/1115 anti-déforestation), de générer un **certificat PDF**
compatible TRACES NT, et d'ouvrir l'accès au **micro-crédit** (50 000–250 000 FCFA, Mobile Money)
pour le producteur conforme. La plateforme couvre les **7 matières premières du RDUE** : cacao, café,
hévéa, palmier à huile, bovins, soja et bois.

---

## 🚀 Lancer le projet

Prérequis : **Node.js ≥ 18.17** (testé sur Node 20+) et **npm**.

```bash
npm install      # installer les dépendances
npm run dev      # serveur de développement → http://localhost:3000
npm run build    # build de production
npm run start    # servir le build de production
npm run lint     # linter
```

**Compte de démonstration** : `client@test.com` / `123client123` (Amadou · Coopérative de Soubré).
Compte admin : `admin@agrivo.com` / `123admin123`.

La route `/` affiche l'**écran de bienvenue animé** puis la landing. `MOCK_MODE` est actif : aucune
clé d'API requise, toutes les réponses IA sont simulées côté serveur.

---

## 🧭 Parcours produit

- **Golden path (5 étapes)** : sélection coopérative → scan de la carte producteur (Gemini Vision) →
  cartographie de la parcelle (GeoJSON RFC 7946) → verdict Whisp (Conforme · Anomalie détectée ·
  Données insuffisantes) + explication IA + badge sols + certificat PDF → inclusion financière.
- **Espace coopérative** (`/app`) : tableau de bord (4 KPI : producteurs audités · taux de conformité ·
  superficie cartographiée · volume validé), producteurs, parcelles, vérification, paramètres.
- **Dashboard exportateur** (`/app/exportateur`) : analytique + carte satellite du portefeuille,
  export GeoJSON TRACES NT, copilote conversationnel, journal réseau et alertes.
- **Fiche parcelle** (`/app/parcelle/[id]`) : verdict, mémo de diligence (DDS) généré par IA,
  analyse de risque expliquée, scoring de crédit explicable, résumé de changement satellite.
- **Site vitrine** : méthodologie, tarifs, FAQ, à-propos, contact, aide, pages légales
  (confidentialité, CGU, mentions légales). Interface bilingue **FR / EN**.

## 🤖 Deux IA

- **Whisp (FAO)** — détection de déforestation par satellite, outil de référence ONU pour le RDUE
  (date pivot 31/12/2020, convergence de preuves).
- **Gemini (Google)** — vision (OCR carte producteur), langage (explications de verdict, mémo DDS,
  copilote portefeuille).

---

## 🗂️ Structure du projet

```
app/
  layout.tsx          Polices next/font, LanguageProvider, AuthProvider, SplashScreen
  globals.css         Tailwind v4 (@theme) : palette Forêt & Données, effets, animations
  page.tsx            Landing (hero + sections)
  connexion/ inscription/          Authentification (session localStorage)
  methodologie/ tarifs/ faq/ ...   Pages vitrine et légales
  app/                Espace applicatif protégé (dashboard, verifier, parcelles,
                      producteurs, exportateur, parametres, admin, consentement)
  api/                Routes serveur mockées (whisp/verify, gemini/scan|explain|query|memo)
components/
  splash-screen.tsx   Écran de bienvenue animé
  landing/ ui/ app/ verifier/ exportateur/ legal/
config/
  brand.ts            BRAND_NAME, BRAND_TAGLINE
  filieres.ts         Source de vérité unique des 7 denrées RDUE
data/mock-parcelles.ts  45 parcelles de démonstration (9 coopératives)
lib/
  ai/                 Stubs Whisp + Gemini (MOCK_MODE), analyse de risque, scoring crédit
  i18n.ts             Dictionnaire FR / EN
```

Les tokens de design vivent dans `app/globals.css` (Tailwind v4, bloc `@theme`). La charte complète
(règles de contenu, statuts figés, faits produit) est dans `CLAUDE.md`.

---

## 🛠️ Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind CSS v4 ·
Framer Motion 12 · lucide-react · react-leaflet (fonds satellite Esri) · @react-pdf/renderer ·
polices Space Grotesk / Geist / Geist Mono (`next/font`). Déploiement cible : Vercel.

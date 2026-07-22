# CLAUDE.md — Mémoire technique AGRIVO

> Fichier de mémoire TECHNIQUE / PRODUIT du dépôt, lu au début de chaque session de travail.
> **Règle de confidentialité :** ce fichier ne contient AUCUNE donnée de levée de fonds,
> d'investisseur, de stratégie business, de propriété intellectuelle, de négociation, ni
> d'information personnelle. Ces éléments sont conservés hors du dépôt, dans un dossier privé.
> Ne jamais les réintroduire ici.

## Produit

AGRIVO prépare la preuve d'origine du cacao ivoirien exigée par la réglementation européenne sur la
déforestation (RDUE) : cartographie des parcelles, vérification de l'absence de déforestation via
l'outil Whisp (FAO), et génération d'un dossier de preuve prêt à être remis à l'opérateur qui dépose
la déclaration.

Règles de rôle et de discours (charte produit, à respecter dans tout contenu) :
- L'opérateur dépose la déclaration ; l'exportateur prouve ; AGRIVO prépare et évalue.
- Ne jamais écrire « conformité garantie » ni « certification RDUE » : elles n'existent pour personne.
  AGRIVO émet une évaluation et prépare un dossier ; il ne garantit pas l'acceptation, qui relève de
  l'opérateur et de l'autorité compétente.
- Le producteur ne paie jamais. Aucun score de crédit, aucun plafond, aucune décision de financement
  (frontière produit stricte).
- Pas de tiret cadratin dans le texte visible (utiliser « · », la virgule ou « : »).
- Tout chiffre publié passe d'abord par `REGISTRE_CLAIMS.md` (source datée, gouvernance des claims).

## Stack technique

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind v4.
- framer-motion (animations), Leaflet / react-leaflet (cartes, tuiles Esri), @react-pdf/renderer
  (génération de documents), qrcode, lucide-react.
- Tests : Vitest (logique de domaine pure). Scripts npm : dev, build, start, lint, test, typecheck.

## Architecture — état actuel (prototype de démonstration)

- **Frontend seul** : pas de backend applicatif, pas de base de données.
- **Authentification de démonstration côté client** (localStorage) : NON destinée à la production.
- **Données** : fichiers statiques `data/mock-*` (jeu de démonstration).
- **Routes API** (`app/api/*`) : proxys serveur vers Whisp (FAO) et Gemini ; clés API strictement
  côté serveur ; repli déterministe (`MOCK_MODE` actif sans clé) pour que la démo ne dépende jamais
  du réseau.
- **Sécurité** : en-têtes complets dans `next.config.ts` (CSP, HSTS, X-Frame-Options, nosniff,
  Referrer-Policy, Permissions-Policy). `connect-src 'self'` : tous les appels tiers passent par le
  serveur. Ne PAS resserrer `script-src` sans nonce (l'hydratation Next et les JSON-LD inline en
  dépendent).
- **Modules `lib/`** organisés par domaine : `ai/` (whisp, gemini), `geo/`, `registre/`,
  `marketplace/`, `surveillance/`, `market/`, `mesure/`, `hors-ligne/`, etc.

## Direction V1 (production-ready) — architecture cible

Branche de travail : `feat/v1-production` (base propre). Cible technique :
- Monolithe modulaire, à frontières nettes, prêt à découpler.
- Base de données relationnelle multi-tenant (isolation par organisation).
- Authentification gérée + RBAC appliqué côté serveur.
- Couche d'accès aux données (repositories) : le domaine ne lit plus les mocks directement.
- Intégrations Whisp / Gemini sécurisées (authentification, rate-limit, quota, plafond de coût).
- Génération du dossier de preuve côté serveur.
- Observabilité de base (logs structurés, suivi d'erreurs), sauvegardes.
- Le sous-système marketplace est HORS périmètre V1 (parqué).

## Conventions de développement

- Avant de clore un lot de travail : `npx tsc --noEmit` · `npx vitest run` · `npm run lint` ·
  `npm run build`.
- Toujours arrêter le serveur de dev avant `npm run build` (conflit `.next`).
- Ne jamais commiter de secret ; secrets via variables d'environnement.
- Toute nouvelle donnée chiffrée destinée à être publiée passe par `REGISTRE_CLAIMS.md`.

## Note d'historique

Historique du dépôt réécrit le 22/07/2026 pour retirer toute donnée confidentielle et repartir sur une
base propre pour la ligne V1 (`feat/v1-production`). Le produit de démonstration antérieur
(v1.0 → v2.15) et son historique complet sont archivés en privé, hors du dépôt.

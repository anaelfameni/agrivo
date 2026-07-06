# CHANGELOG — AGRIVO

Versioning sémantique (MAJOR.MINOR.PATCH). Chaque release liste ce qui est ajouté, corrigé et
vérifié, conformément à l'étape 8 du pipeline « Du besoin à la Release ».

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

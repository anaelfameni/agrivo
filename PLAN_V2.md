# PLAN v2.0.0 — d'AGRIVO démo de compétition à produit en production

> Rédigé le 7 juillet 2026 (session 22), à partir de la dette technique documentée dans
> `LIVRABLE_AGRIVO_V4.md` §4-5, mise à jour du pivot Valorisation (plus aucune brique
> crédit/Mobile Money — frontière produit stricte) et de l'état v1.2.x. Horizon : après le jury,
> en vue du pilote coopérative (ECOOKIM visé dans le pitch).

## 1. Ce qui doit devenir SERVEUR (aujourd'hui côté navigateur, assumé pour la démo)

| Aujourd'hui (démo) | v2.0.0 (production) | Priorité |
|---|---|---|
| Auth localStorage, mots de passe en clair dans le navigateur | **Auth serveur** : sessions signées (cookies httpOnly), mots de passe hachés (argon2), rôles coop/exportateur/admin | P0 |
| Parcelles/producteurs mockés (`data/mock-parcelles.ts`) + ajouts en localStorage | **Base de données** (Postgres managé type Supabase/Neon) : coopératives, producteurs, parcelles (géométries PostGIS), vérifications, certificats, dossiers partagés | P0 |
| Import du registre parsé et audité 100 % client (jamais envoyé) | Conserver l'audit CLIENT comme argument ARTCI, mais **persister le résultat validé** (parcelles acceptées) côté serveur après consentement explicite | P1 |
| Verdicts Whisp pré-enregistrés | **API Whisp réelle** (inscription FAO Open Foris) appelée serveur, avec cache par géométrie + file de re-vérification | P0 |
| Certificats PDF générés à la volée, lookup dans les mocks | **Registre de certificats** serveur (n° AGV uniques, horodatage, révocation) — la page publique `/verifier-certificat` interroge ce registre | P0 |
| Clé Gemini dans l'env Vercel (déjà serveur ✅) | Inchangé, + **facturation Tier 1** (les 429 IP datacenter du free tier sont documentés en session 21) + quotas/télémétrie par coopérative | P1 |
| Guide présentateur, comptes démo visibles | Compte démo derrière un flag d'environnement, retiré des instances clients | P2 |

## 2. Chantiers v2.0.0 (ordre d'exécution proposé)

1. **Socle données + auth** (P0) : schéma Postgres/PostGIS, migrations, auth serveur, sessions ;
   reprise des personas démo comme seed.
2. **Whisp live** (P0) : intégration API officielle, statuts verbatim conservés, journal des
   analyses (date, sources, convergence) pour l'auditabilité RDUE.
3. **Registre de certificats + vérification publique** (P0) : n° AGV signés, QR inchangé,
   endpoint public en lecture seule, limites de débit.
4. **Multi-coopératives réel** (P1) : espaces isolés par coop, invitations, rôles ; la « Vue
   exportateur » devient un vrai compte exportateur consommant les dossiers partagés.
5. **Synchronisation mobile** (P1) : endpoints pour l'app de Christ (file offline → upsert
   vérifications), authentification par jeton d'appareil.
6. **Conformité en conditions réelles** (P1) : registre des traitements tenu, désignation du DPO,
   mentions légales définitives (RCCM), hébergement/localisation des données réévalués (exigence
   de souveraineté ARTCI ; envisager une région UE/Afrique plutôt que US par défaut).
7. **Observabilité & robustesse** (P2) : Sentry, logs structurés des routes IA (live/repli),
   alerting sur taux de repli Gemini, tests e2e Playwright sur le golden path.
8. **Dette UI** (P2) : extraire `FilterPill` partagé (dupliqué producteurs/parcelles),
   i18n complète des pages légales quand les textes définitifs existent.

## 3. Ce qui NE change PAS en v2

- La frontière Nanti : aucun score de crédit, plafond ou décision de financement, jamais.
- Les statuts verbatim, « évaluation » jamais « garantie », zéro % inventé.
- L'architecture « faits déterministes + IA pour la mise en mots » avec repli honnête étiqueté.
- Le design system (Forêt & Données, Space Grotesk, motion sobre, reduced-motion).

## 4. Estimation macro

P0 ≈ 3-4 semaines à 2 devs (socle + Whisp + certificats) · P1 ≈ 3 semaines · P2 ≈ continu.
Prérequis externes : inscription API Whisp (FAO), immatriculation société (mentions légales/DPO),
choix de l'hébergement des données conforme ARTCI.

# ARCHITECTURE — Conception et décisions AGRIVO

> Étapes 3 et 7 du pipeline « Du besoin à la Release » : modèle de données, flux, décisions
> d'architecture (mini ADR) et plan de déploiement avec rollback.

## 1. Le flux en une ligne

**Donnée → IA → Résultat**

```
  Carte producteur (photo)        Parcelle (polygone GeoJSON)
            │                                │
            ▼                                ▼
   Gemini Vision (OCR)              Whisp / FAO (détection)
            │                                │
            ▼                                ▼
   Formulaire pré-rempli      Verdict (3 statuts figés) + preuves
                                             │
                     ┌───────────────────────┼───────────────────────┐
                     ▼                       ▼                       ▼
             Certificat PDF + QR      Mémo DDS (Gemini)      Scoring crédit (XAI)
             vérifiable publiquement  prêt pour TRACES NT    50 000 à 250 000 FCFA
```

Deux IA aux rôles strictement séparés : **Whisp détecte** (il produit le verdict, jamais
reformulé), **Gemini explique** (il met en mots, il n'invente ni chiffre ni verdict).

## 2. Couches de l'application

| Couche | Contenu | Emplacement |
|---|---|---|
| Pages | Landing, vitrine, espace /app protégé, page publique de vérification | `app/` |
| Composants | UI de marque, parcours de vérification, dashboards | `components/` |
| Routes API | Whisp verify, Gemini scan/explain/query/memo. Seul point de sortie réseau. | `app/api/` |
| Couche IA | Client Gemini live + logique déterministe (scoring, risque, portefeuille) | `lib/ai/` |
| Données | 45 parcelles de démonstration, statistiques, export RFC 7946 | `data/` |
| Configuration | Marque, 7 filières RDUE (source de vérité unique) | `config/` |
| Tests | Vitest sur les fonctions critiques | `tests/` |

Modèle de données central : `Parcelle { id, producteurNom, numeroCartePro, cooperative,
region, superficieHa, filiere, geojson (Polygon RFC 7946), statut, dateVerification,
datePivotAnalyse, sourcesDonnees, numeroCertificat, referenceDDR?, propositionCredit? }`.

## 3. Décisions d'architecture (mini ADR)

**ADR-1 · MOCK_MODE avec repli automatique.** Le mode live s'active par la seule présence de
`GEMINI_API_KEY` ; chaque route garde un repli déterministe si l'appel échoue (timeout 12 s).
Conséquence : la démonstration ne dépend JAMAIS d'un appel réseau non testé. Le cas « API IA
indisponible » est couvert par un test.

**ADR-2 · Aucun appel IA depuis le client.** Le navigateur parle uniquement à nos routes
`/api/*` ; les clés vivent en variables d'environnement serveur. Surface d'attaque et fuite de
clé : nulles.

**ADR-3 · L'IA générative ne produit jamais un verdict ni un chiffre.** Les verdicts, KPI,
scores et plafonds sont calculés par du code déterministe et testé ; Gemini réécrit la forme
(charte injectée en instruction système : statuts figés, « évaluation » jamais « garantie »).

**ADR-4 · Frontière RSC.** Aucune valeur non-composant exportée d'un fichier `"use client"`
n'est consommée par un composant serveur (crash au prerender sinon). Les variantes et
géométries vivent dans des modules purs.

**ADR-5 · Règles React strictes rétrogradées en avertissement.** `set-state-in-effect`,
`purity`, `immutability`, `refs` signalent nos hydratations volontaires (localStorage → état
après montage), la physique des particules du splash et une ref synchronisée qui corrige un
bug de boucle Leaflet documenté. Rétrogradées en warning : la CI reste verte sans masquer les
nouveaux cas, qui restent visibles au rapport de lint.

**ADR-6 · Pas de backend persistant pour cette édition.** Données de démonstration
déterministes servies par les routes Next ; c'est assumé et affiché (compte admin, MOCK_MODE).
Le passage en production est décrit dans LIVRABLE_AGRIVO_V4.md.

## 4. Déploiement et plan de rollback

- **Environnements** : production sur Vercel (https://agrivo-io.vercel.app), builds locaux
  identiques (`npm run build`).
- **CI (GitHub Actions)** : lint + types + tests + build à chaque push et pull request sur
  `main`. Une CI rouge bloque la fusion.
- **Secrets** : `GEMINI_API_KEY` (et `GEMINI_MODEL` optionnel) en variables d'environnement
  Vercel ; `.env*` est ignoré par git. Sans clé, l'application fonctionne en mock : le
  déploiement ne peut pas casser pour cause de secret manquant.
- **Plan de rollback** : chaque déploiement Vercel est immuable et conservé. En cas d'échec en
  production : tableau de bord Vercel → Deployments → déploiement précédent → « Promote to
  Production » (moins d'une minute), puis réassigner l'alias `agrivo-io.vercel.app` si
  nécessaire (`vercel alias set <deploiement> agrivo-io.vercel.app`). Plan B ultime le jour du
  jury : la vidéo de secours (GUIDE_DEMO_JURY.md).
- **Versioning** : semantic versioning, tags git (`v1.0.0-rc.1` puis `v1.0.0` au feature
  freeze), changelog dans CHANGELOG.md.

# AUDIT AGRIVO — état « démo » avant transformation V4

> Réalisé au **P1** (2026-07-04). Objectif : recenser tout ce qui trahit une démo/hackathon avant de le
> transformer en produit crédible. Légende statut : ✅ corrigé en P1 · 🔜 planifié (prompt cible).

## 1. Liens morts / faux boutons

| Élément | Fichier:ligne | Problème | Statut |
|---|---|---|---|
| CTA « Commencer la vérification » | `components/landing/hero.tsx` (~183) | pointait vers `#produit`, **ancre inexistante** | ✅ ancre `id="produit"` ajoutée sur `GoldenPathSection` (`app/page.tsx`). Cible finale → `/app/verifier` en 🔜 P2 |
| CTA « Voir la démo » | `components/landing/hero.tsx` (~202) | même ancre morte + langage démo | 🔜 P2 (devient « Accéder au tableau de bord » → `/app/dashboard`) |
| CTA « Voir la démo en direct » | `app/page.tsx` `CtaFooter` (~512) | langage démo | 🔜 P2 (devient « Créer un compte » → `/inscription`) |

## 2. Textes de démonstration / internes affichés en production

| Texte | Fichier:ligne | Statut |
|---|---|---|
| « Source : Conseil Café-Cacao. **Chiffres à revérifier avant le pitch.** » | `app/page.tsx` `ChiffresSection` | ✅ note interne retirée |
| « **Ouvrez la démonstration** et déroulez le parcours complet… » | `app/page.tsx` `CtaFooter` | ✅ réécrit en promesse produit |
| « Données synthétiques, **version de démonstration**. Agrivo © 2026 · **Vibeathon**. » | `app/page.tsx` footer | ✅ → « Agrivo © 2026. Tous droits réservés. » |
| « Voir la démo » / « Voir la démo en direct » | hero + CtaFooter | 🔜 P2 |
| Commentaire `Données de démonstration (mock)` | `components/landing/hero.tsx` (~40) | garder (commentaire code, non visible) |

## 3. Pages manquantes (attendues d'un vrai SaaS)

| Page | Statut |
|---|---|
| `/connexion`, `/inscription` | 🔜 P2 |
| `/app/producteurs`, `/app/parcelles`, `/app/parametres` | 🔜 P4 |
| `/contact`, `/confidentialite`, `/cgu`, `/mentions-legales`, `/aide` | 🔜 P5 |
| Existantes OK : `/methodologie`, `/a-propos`, `/tarifs`, `/faq`, `/app/dashboard`, `/app/exportateur`, `/app/verifier`, `/app/consentement`, `/app/parcelle/[id]` | — |

## 4. Authentification

- **Aucune** : ni connexion, ni session, ni protection de routes, ni déconnexion. L'espace produit
  `/app/*` est atteignable par simple lien, sans aucune barrière. → 🔜 **P2** (auth localStorage réelle +
  entrée démo 1 clic, `client@test.com` / `123client123`).

## 5. Données mockées (inventaire)

| Source | Nature | Décision |
|---|---|---|
| `data/mock-parcelles.ts` | 45 parcelles synthétiques déterministes | **Légitime** (données démo). ✅ type `Filiere` aligné sur la SSOT 7 denrées |
| `components/landing/hero.tsx` `STATS`/`ROWS` | aperçu de dashboard du hero | **Garder** (aperçu produit, ne pas dénaturer) |
| `lib/ai/*` (`MOCK_MODE`) | stubs Whisp/Gemini | **Garder** (infra démo assumée ; clés réelles = prod future) |

## 6. Couverture filières (denrées RDUE)

- Avant : **4** filières en dur (cacao, café, hévéa, palmier), dispersées (`hero.tsx`, `app/page.tsx`
  `FilieresSection`, `data/mock-parcelles.ts`).
- ✅ P1 : **`config/filieres.ts`** = source de vérité unique des **7 denrées RDUE** (ajout bovins, soja,
  bois + produits dérivés). UI étendue en 🔜 **P3** (FilieresSection 4→7 + images) et **P4** (filtres).

## 7. Incohérences visuelles connues (→ P3)

- `FilieresSection` (`app/page.tsx`) : tuiles **hauteur fixe `h-44`**, **fond dégradé pur (aucune image)**,
  grille `sm:grid-cols-4` — casse à 7 denrées. **Cause principale** des « tableaux de tailles inégales ».
- À homogénéiser en P3 : hauteurs (`h-full`), rythme de grille, rayons, paddings sur toutes les sections.

## 8. Composants potentiellement inutilisés

- À confirmer au **P7** (passe de nettoyage + typage strict). Rien de bloquant détecté en P1.

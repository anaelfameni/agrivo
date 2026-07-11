# LIVRABLE — AGRIVO V4 « SaaS crédible »

Rapport de fin de chantier. AGRIVO est passé d'une démo Vibeathon à un produit qui **se présente comme un
vrai SaaS commercialisé** : parcours client réel, authentification, dashboard consolidé, 7 denrées RDUE
avec images, pages légales, et une page d'accueil premium. Stack inchangée : **Next.js 16 · React 19 ·
Tailwind v4 · framer-motion 12**, déploiement Vercel.

---

## 1. Améliorations réalisées (par étape)

| Étape | Livré |
|---|---|
| **Images** | 9 visuels libres de droits, art-dirigés, vérifiés un par un (7 denrées + 2 textures + satellite CI + chocolat dérivés). Crédits/attribution → `IMAGES_CREDITS.md`. |
| **P1 — Fondation** | `AUDIT.md` ; `config/filieres.ts` = source unique des **7 denrées RDUE** ; purge du langage « démo » ; ancre morte `#produit` corrigée. |
| **P2 — Auth** | `/connexion`, `/inscription`, session localStorage, **routes `/app/*` protégées**, déconnexion, **entrée démo 1 clic** ; tous les CTA « Voir la démo » remplacés. |
| **P3 — Accueil** | 7 denrées avec **vraies photos** + tuile « Produits dérivés », section **cartographie satellite** (parcelle CI top-down + polygone animé), police premium **Fraunces**, chips 7 denrées dans le hero, copywriting affiné. HERO + splash + aperçu dashboard **préservés**. |
| **P4 — Dashboard** | **Sidebar** (desktop) + nav mobile ; **/app/producteurs** (liste, recherche, filtres 7 filières, ajout) ; **/app/parcelles** ; **/app/parametres** (Profil / Organisation / Sécurité). |
| **P5 — Crédibilité** | `/contact`, `/confidentialite`, `/cgu`, `/mentions-legales`, `/aide` ; footer complet (Produit / Ressources / Légal) ; bandeau cookies. |
| **P6 — UX** | Frontières d'erreur (`app/error.tsx`, `app/app/error.tsx`), état de chargement `/app`, + (déjà en place tout au long : états vides, toasts, focus-visible, `prefers-reduced-motion`, responsive 390/768/1440). |
| **P7 — Nettoyage** | Suppression du composant orphelin `app-space-switch.tsx` ; ce rapport. |

**Gouvernance respectée** partout : mots bannis évités (« évaluation » et non « garantie », pas de « valeur
à risque »), statuts figés (Conforme / Anomalie détectée / Données insuffisantes), aucun logo partenaire
fabriqué, aucune photo « cliché » de personne. Chaque étape a passé le **GATE** : `tsc` ✓ · `next build` ✓ ·
captures CDP 1440 + 390 (0 débordement horizontal).

---

## 2. Architecture finale

**Routes (25)**
- Vitrine : `/` (accueil) · `/methodologie` · `/a-propos` · `/tarifs` · `/faq` · `/aide` · `/contact` ·
  `/confidentialite` · `/cgu` · `/mentions-legales`
- Auth : `/connexion` · `/inscription`
- Espace produit `/app/*` (protégé) : `dashboard` · `producteurs` · `parcelles` · `exportateur` ·
  `parametres` · `verifier` · `consentement` · `parcelle/[id]`
- API (mock) : `/api/whisp/verify` · `/api/gemini/{scan,explain,query}`

**Composants & données clés**
- `config/filieres.ts` — SSOT des 7 denrées (id, label, statut, couleur, icône, image).
- `components/auth-provider.tsx` — session + `useAuth` ; `components/app/route-guard.tsx` — protection.
- `components/app/app-sidebar.tsx` — navigation de l'espace.
- `components/legal/legal-shell.tsx` — coquille des pages légales.
- `components/cookie-consent.tsx` · `components/site-footer.tsx`.
- `data/mock-parcelles.ts` — 45 parcelles déterministes + agrégats (`portfolioStats`, `coopStats`…).

---

## 3. Fonctionnalités ajoutées / supprimées

**Ajoutées** : authentification + parcours client · 7 denrées RDUE (moteur multi-filières) · gestion des
producteurs · pages Parcelles / Paramètres · 5 pages légales/crédibilité · bandeau cookies · frontières
d'erreur · section cartographie satellite · images art-dirigées · police premium.

**Supprimées / neutralisées** : tout le langage « Voir la démo / version de démonstration / Vibeathon » de
l'UI · notes internes affichées (« …avant le pitch ») · ancien `AppSpaceSwitch` · section « Deux IA »
(remplacée par une grille Fonctionnalités) · éphémère thème « dark expansion » (revenu au thème clair).

---

## 4. Dette technique restante

- **Persistance = localStorage** (auth, ajouts de producteurs, paramètres) : non partagée entre appareils,
  effaçable ; à remplacer par un vrai backend.
- **Mots de passe stockés en clair** côté navigateur (démo uniquement) → hachage serveur en prod.
- **Duplication mineure** : `FilterPill` répété dans `/app/producteurs` et `/app/parcelles` (à extraire).
- **`MOCK_MODE`** actif : Whisp/Gemini/Mobile Money sont simulés.
- **i18n Dioula/Baoulé** : traductions provisoires, à valider par un locuteur natif.
- **Chiffres marché** (Conseil Café-Cacao) : à re-vérifier avant usage commercial.
- **Mentions légales** : champs `[À compléter]` (raison sociale, RCCM, siège, DPO…) à renseigner.

---

## 5. Recommandations pour la vraie production

1. **Backend + base de données** (ex. Supabase/Postgres) : remplacer la persistance localStorage ; auth
   serveur avec mots de passe hachés (argon2/bcrypt) et sessions signées.
2. **Clés API réelles** : Whisp (FAO), Gemini (Google) ; désactiver `MOCK_MODE` ; garder l'injection
   **côté serveur** (jamais dans le navigateur).
3. **Paiements Mobile Money** réels via un agrégateur + conventions avec l'IMF partenaire (le scoring reste
   indicatif, la décision revient à l'IMF).
4. **Conformité ARTCI/BCEAO en conditions réelles** : registre des traitements, DPO, souveraineté/localisation
   des données, consentement horodaté.
5. **Emails transactionnels** (contact, confirmation d'inscription) via un fournisseur (Resend, SES…).
6. **SEO / partage** : métadonnées OpenGraph par page, `sitemap.xml`, `robots.txt`, images OG.
7. **Observabilité** : Sentry (déjà des frontières d'erreur), analytics respectueux du consentement cookies.
8. **Tests** : e2e du parcours (connexion → vérification → certificat → crédit) et des gardes de routes.
9. **Images** : remplacer les visuels Wikimedia par des photos maison ou sous licence achetée (garder les
   mêmes noms de fichiers). Respecter l'attribution CC tant que les visuels actuels sont utilisés.

---

*Comptes de démonstration : `client@test.com` / `123client123`. Lancer en local : `npm run dev`.*

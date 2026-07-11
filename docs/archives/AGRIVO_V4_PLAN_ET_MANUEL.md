# AGRIVO V4 — Plan, données de référence & tâches manuelles

> Compagnon de **`PROMPTS_AGRIVO_V4_PRODUCTION.md`**. Objectif de la V4 : faire passer AGRIVO de
> « démo Vibeathon » à **produit SaaS crédible** (parcours client réel, auth, dashboard pro, pages de
> crédibilité, **7 denrées RDUE**, images art-dirigées, animations premium hors HERO), **sans casser
> l'existant** ni le HERO/splash que tu veux garder.

---

## 0. Comment utiliser le playbook

1. Ouvre un terminal Claude Code **dans le dossier** `C:\Users\Anael FAMENI\.claude\projects\Agrivo`
   (pour que `CLAUDE.md` s'auto-charge).
2. Colle **un seul prompt à la fois** (P1, puis P2, …) depuis `PROMPTS_AGRIVO_V4_PRODUCTION.md`.
3. À la fin de chaque prompt, vérifie le **GATE** (build vert + captures + aucun terme interdit) **avant**
   de passer au suivant.
4. **Ordre conseillé** : P1 → P2 → **P3 (accueil, ta priorité)** → P4 → P5 → P6 → P7.
   P3 ne dépend que de P1 : tu peux le lancer juste après P1 si tu veux voir l'accueil transformé vite.

---

## 1. Décisions verrouillées

| # | Décision | Détail |
|---|---|---|
| 1 | **Images art-dirigées, sans cliché** | Fonds aériens/satellite traités duotone forêt/or + macros de denrées dans les 7 cartes. **Personnes = avatars géométriques, jamais de photo.** |
| 2 | **Auth réelle + entrée démo 1 clic** | Vraies pages connexion/inscription, session localStorage, routes `/app/*` protégées, déconnexion. Compte démo `client@test.com` / `123client123` pré-rempli + bouton « Entrer en 1 clic ». |
| 3 | **Carte accueil = section légère** | Polygone SVG animé sur image satellite fixe (pas de Leaflet sur la landing → perf préservée). Le HERO garde son aperçu de dashboard. |

**On garde intact :** écran de bienvenue (splash), structure du HERO, aperçu de dashboard flottant animé.

---

## 2. Les 7 denrées du RDUE (Règlement UE 2023/1115) — source de vérité

À implémenter dans **`config/filieres.ts`** (créé en P1), consommé partout ensuite.

| id | Libellé FR | RDUE | Statut CI | Couleur (base) | Icône lucide | Image `/public/filieres/` |
|---|---|---|---|---|---|---|
| `cacao` | Cacao | cocoa | En production | `#C8861D` | `Bean`/`Nut` | `cacao.jpg` |
| `cafe` | Café | coffee | En production | `#7B4F2E` | `Coffee` | `cafe.jpg` |
| `hevea` | Hévéa | rubber | En production | `#16a34a` | `Droplet`/`Trees` | `hevea.jpg` |
| `palmier` | Palmier à huile | oil palm | En production | `#4A6B1F` | `Palmtree` | `palmier.jpg` |
| `bovins` | Bovins | cattle | Couverte | `#8A5A44` | `Beef` | `bovins.jpg` |
| `soja` | Soja | soya | Couverte | `#A9A02A` | `Sprout`/`Wheat` | `soja.jpg` |
| `bois` | Bois | wood | Couverte | `#5A6B54` | `TreePine`/`Logs` | `bois.jpg` |

**Positionnement honnête** : les 4 filières ivoiriennes = **« En production »** (démo cacao en tête) ; les
3 autres = **« Couverte par le moteur »**. Cohérent avec le SNT ivoirien, sans surpromettre.

**Produits dérivés RDUE** (à mentionner en 8e tuile ou en note) : chocolat, cuir, meubles, papier &
imprimés, pneus, huile de palme dérivée, charbon de bois. ⚠️ **À re-vérifier en ligne** dans P1 (la liste
Annexe I fait foi) — la recherche n'a pas pu être faite ici (limite de session atteinte, reset ~20h10).

---

## 3. Direction artistique des images (garde-fous)

- **Traitement duotone** : ombres → `forest-950 #0a1f14`, hautes lumières → `amber-soft #e0a64b` (ou
  ivory). Objectif : les images ne « sortent » pas de la charte, elles se fondent dedans.
- **Overlay lisibilité** : sur toute image servant de fond de section, poser `bg-forest-950/70` +
  réutiliser la texture `.grain` existante pour éviter le rendu « stock ».
- **Ratios homogènes** : cartes de denrées `aspect-[4/5]` (ou `h-full` uniforme) ; fonds de section
  `aspect-[16/9]`/`21/9`. **Jamais** de hauteurs fixes disparates.
- **Personnes** : uniquement avatars géométriques à initiales (comme aujourd'hui). **Aucune photo de
  personne** (règle CLAUDE.md).
- **Technique** : `next/image` (lazy hors hero), bundle `/public`, `sizes` correct, **LCP-safe**,
  `prefers-reduced-motion` respecté (pas de parallaxe agressive).
- **Fallback anti-casse** : garder le **dégradé radial actuel en couche de base** sous chaque image ; si un
  fichier manque, la tuile reste belle (jamais d'image cassée).

**Emplacements images :**
- `public/filieres/` → `cacao.jpg cafe.jpg hevea.jpg palmier.jpg bovins.jpg soja.jpg bois.jpg` (macros).
- `public/textures/` → `satellite-parcelles.jpg` (fond section cartographie), `aerial-canopy.jpg`
  (fond CTA/immersif), `aerial-fields.jpg` (optionnel).

---

## 4. À faire MANUELLEMENT (toi)

- [ ] **Fournir les images** dans `public/filieres/` et `public/textures/` aux noms exacts ci-dessus
      (macros de denrées + 1-2 fonds satellite/aériens). Sources libres de droits recommandées :
      **Pexels** / **Unsplash** (licence gratuite, usage commercial OK). Termes de recherche :
  - Cacao : `cocoa pods macro`, `cacao beans` · Café : `coffee cherries branch`
  - Hévéa : `rubber tree tapping latex` · Palmier : `oil palm fresh fruit bunch`
  - Bovins : `cattle herd pasture` · Soja : `soybean field pods` · Bois : `stacked timber logs`
  - Fonds : `aerial farmland patchwork`, `satellite view agriculture`, `aerial plantation canopy`
  - > Si tu préfères, je peux te **proposer une shortlist d'URLs précises** + appliquer moi-même le
      traitement duotone : demande-le et je m'en occupe (dès que la limite de session est levée).
- [ ] **Lancer les prompts un par un** dans le dossier `Agrivo`, vérifier le GATE avant le suivant.
- [ ] **Limite de session/débit** atteinte aujourd'hui (reset ~**20h10** Abidjan) : lancer après reset.
- [ ] **Vérifier visuellement** après P3 sur desktop **et** mobile (le projet a déjà un script CDP —
      `scratchpad/cdp-shot.mjs`, cité dans `CLAUDE.md`).

### Plus tard, pour une VRAIE mise en production (hors playbook UI)
- [ ] Backend + base de données réelle (ex. **Supabase**/Postgres) pour remplacer les mocks et l'auth
      localStorage.
- [ ] Clés API réelles : **Whisp (FAO)**, **Gemini (Google)** ; désactiver `MOCK_MODE`.
- [ ] Paiements **Mobile Money** réels (agrégateur), et conventions **IMF** partenaire.
- [ ] Validation des traductions **Dioula / Baoulé** par un locuteur natif.
- [ ] Re-vérification des **chiffres marché** (Conseil Café-Cacao) avant tout usage commercial.

---

## 5. Vérification bout-en-bout (definition of done)

- **Après P1-P3** : l'accueil montre **7 denrées + images + section cartographie** ; toutes les cartes ont
  des tailles homogènes ; **plus aucun mot « démo »** visible ; les 2 CTA du hero mènent à un vrai parcours.
- **Après P2-P5** : `client@test.com` / `123client123` → connexion → `/app` protégé → parcours vérification
  → certificat → crédit ; `/contact`, `/confidentialite`, `/cgu`, `/mentions-legales`, `/aide` accessibles
  depuis le footer.
- **Chaque prompt** : `tsc --noEmit` ✓ · `next build` ✓ · captures CDP 1440 & 390 (0 débordement) ·
  `grep` termes interdits = néant · Journal de build `CLAUDE.md` mis à jour.

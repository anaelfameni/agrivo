# AGRIVO

**La conformité agricole, simplifiée.** — projet Vibeathon 2026.

AGRIVO permet aux coopératives agricoles ivoiriennes de vérifier en quelques secondes si une parcelle
de cacao respecte le **RDUE** (règlement européen anti-déforestation), de générer un **certificat**, et
d'ouvrir l'accès au **micro-crédit** pour le producteur conforme.

Ce dépôt contient l'application web (PWA cible). **Session 1** pose les fondations : le système de design
complet et la **page d'entrée animée**.

---

## 🚀 Lancer le projet

Prérequis : **Node.js ≥ 18.17** (testé sur Node 20+) et **npm**.

```bash
npm install      # installer les dépendances
npm run dev      # serveur de développement → http://localhost:3000
npm run build    # build de production
npm run start    # servir le build de production
npm run lint     # linter (next lint)
```

La route `/` affiche la **page d'entrée animée** (une fois par session), puis mène à `/accueil`.

---

## 🗂️ Structure des dossiers

```
app/
  layout.tsx          Polices (next/font), <LanguageProvider>, metadata globale
  globals.css         Directives Tailwind + styles de base + prefers-reduced-motion
  page.tsx            « / » — page d'entrée animée (splash)
  accueil/page.tsx    « /accueil » — placeholder on-brand (page complète = prochaine session)
  not-found.tsx       Page 404 on-brand
components/
  ParcelPolygon.tsx   Motif signature (variantes draw / pulse) + PARCEL_PATH / PARCEL_VERTICES
  Header.tsx          En-tête global (wordmark + navigation + LanguageSwitcher + menu mobile)
  LanguageProvider.tsx  Contexte i18n (client) + hook useLanguage()
  ui/                 Composants de base :
                        Button · Card · Input · Select · Textarea · StatusBadge
                        AnimatedCounter · LanguageSwitcher · EmptyState · ErrorState
config/
  brand.ts            BRAND_NAME et BRAND_TAGLINE (à importer partout, jamais de nom en dur)
lib/
  utils.ts            cn() — fusion de classes Tailwind (fondation shadcn/ui)
  i18n.ts             Dictionnaire de traduction fr / dioula / baoulé + types
tailwind.config.ts    Tous les tokens de design
CLAUDE.md             Mémoire de projet (charte, règles de contenu, faits produit, avancement)
```

---

## 🎨 Où se trouvent les tokens de design

Toute décision visuelle part de deux endroits, jamais de valeurs en dur dans les composants :

- **`tailwind.config.ts`** — couleurs (Vert Canopée/Cacaoyer/Mousse, Or Récolte, statuts, neutres),
  rayons (`sm` 8px / `md` 12px / `lg` 20px), ombres (`sm`/`md`/`lg`, `glow-gold`), polices
  (`font-display` Newsreader, `font-sans` Inter, `font-mono` IBM Plex Mono), animations d'ambiance
  (`animate-drift`, `animate-breathe`) et l'easing `ease-entrance`.
- **`app/globals.css`** — styles de base (fond papier, couleur d'encre, focus clavier, sélection) et le
  filet de sécurité global `prefers-reduced-motion`.

Le **guide complet** (usage de chaque couleur, règles de contenu, voix de marque) vit dans `CLAUDE.md`.

### Le motif signature
`<ParcelPolygon>` est le cœur de l'identité : le polygone irrégulier de parcelle — littéralement l'objet
que le produit vérifie. Il sert aux badges de statut, aux chargements et aux filigranes. **Jamais** pour
un bouton ou un champ (qui gardent des coins classiques `rounded-sm`/`rounded-md`).

---

## 🌍 Multilingue — LanguageSwitcher & dictionnaire

Le produit vise trois langues : **Français (défaut) · Dioula · Baoulé**. L'accessibilité linguistique est
un pilier, pas un détail cosmétique.

- **Composant :** `components/ui/LanguageSwitcher.tsx` — sélecteur discret et **entièrement accessible**
  (ouverture au clic, navigation clavier flèches / Home / End / Échap, fermeture au clic extérieur,
  retour du focus). Présent dans le `Header`.
- **État partagé :** `components/LanguageProvider.tsx` expose `useLanguage()` → `{ lang, setLang, t }`.
  La préférence est mémorisée dans `localStorage`.
- **Dictionnaire :** `lib/i18n.ts`. Pour cette édition, seules quelques **chaînes clés** changent
  réellement de langue : les **3 statuts de conformité**, les **libellés de boutons** du parcours de
  vérification, et le **message de bienvenue** de la page d'entrée.

> ⚠️ Les chaînes **Dioula** et **Baoulé** sont **provisoires** et doivent être validées par un locuteur
> natif avant le pitch (cohérent avec la valeur de marque « honnête sur nos limites »). En français, les
> statuts restent les mots figés de la charte : *Conforme · Anomalie détectée · Données insuffisantes*.

---

## ✨ Principes de la page d'entrée

- **Anti-générique par construction** : pas de hero centré avec blob de gradient. Le hero est une
  **scène de vérification satellite** où le polygone de parcelle se **dessine trait par trait**, avec
  graticule, repères de recalage, balayage d'analyse et sommets Or Récolte — une image qui *dit ce que
  le produit fait*.
- **Séquence orchestrée** (Framer Motion) : tracé du polygone → marque → tagline → bienvenue → bouton
  (pulsation douce). **Sortie animée** via `AnimatePresence` avant la navigation vers `/accueil`.
- **Une fois par session** (`sessionStorage`), **`prefers-reduced-motion`** respecté (repli en fondu),
  focus clavier visible, responsive impeccable dès **375px**.

---

## 🛠️ Stack

Next.js 14 (App Router) · TypeScript strict · Tailwind CSS (thème custom) · Framer Motion ·
fondation shadcn/ui (`cn`, `cva`) · lucide-react · polices `next/font/google`. Déploiement cible : Vercel.

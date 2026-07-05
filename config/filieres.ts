/**
 * Source de vérité unique des filières AGRIVO = les 7 matières premières du RDUE
 * (Règlement UE 2023/1115, Annexe I). Module PUR (pas de "use client") — importable
 * aussi bien côté serveur que client.
 *
 * Positionnement honnête (cohérent avec le SNT ivoirien) :
 *  - les 4 filières ivoiriennes (cacao, café, hévéa, palmier à huile) = « en production » ;
 *  - les 3 autres (bovins, soja, bois) = « couvertes par le moteur ».
 *
 * Chaque filière porte une image macro art-dirigée (déposée dans public/filieres/) ; en
 * l'absence du fichier, l'UI retombe proprement sur un dégradé de marque (voir FilieresSection).
 */
import {
  Bean,
  Coffee,
  Droplets,
  TreePalm,
  Beef,
  Sprout,
  TreePine,
  type LucideIcon,
} from "lucide-react";

export type FiliereId =
  | "cacao"
  | "cafe"
  | "hevea"
  | "palmier"
  | "bovins"
  | "soja"
  | "bois";

export type StatutFiliere = "production" | "couverte";

export interface Filiere {
  id: FiliereId;
  label: string;
  /** Nom RDUE / EUDR officiel (anglais). */
  eudr: string;
  statut: StatutFiliere;
  /** Couleur de marque (hex) : pastilles, filtres, dégradé de repli. */
  couleur: string;
  icone: LucideIcon;
  /** Image macro art-dirigée dans public/filieres/. */
  image: string;
  /** Accroche courte affichée sous le libellé. */
  position: string;
}

export const FILIERES: readonly Filiere[] = [
  { id: "cacao",   label: "Cacao",           eudr: "cocoa",    statut: "production", couleur: "#C8861D", icone: Bean,     image: "/filieres/cacao.jpg",   position: "1er producteur mondial" },
  { id: "cafe",    label: "Café",            eudr: "coffee",   statut: "production", couleur: "#7B4F2E", icone: Coffee,   image: "/filieres/cafe.jpg",    position: "Filière historique" },
  { id: "hevea",   label: "Hévéa",           eudr: "rubber",   statut: "production", couleur: "#16A34A", icone: Droplets, image: "/filieres/hevea.jpg",   position: "1er africain, 3e mondial" },
  { id: "palmier", label: "Palmier à huile", eudr: "oil palm", statut: "production", couleur: "#4A6B1F", icone: TreePalm, image: "/filieres/palmier.jpg", position: "~400 000 ha en production" },
  { id: "bovins",  label: "Bovins",          eudr: "cattle",   statut: "couverte",   couleur: "#8A5A44", icone: Beef,     image: "/filieres/bovins.jpg",  position: "Cuir et viande soumis au RDUE" },
  { id: "soja",    label: "Soja",            eudr: "soya",     statut: "couverte",   couleur: "#A9A02A", icone: Sprout,   image: "/filieres/soja.jpg",    position: "Chaîne d'appro. mondiale" },
  { id: "bois",    label: "Bois",            eudr: "wood",     statut: "couverte",   couleur: "#5A6B54", icone: TreePine, image: "/filieres/bois.jpg",    position: "Grumes, sciages et papier" },
];

export const FILIERE_IDS: FiliereId[] = FILIERES.map((f) => f.id);

export function getFiliere(id: FiliereId): Filiere {
  const f = FILIERES.find((x) => x.id === id);
  if (!f) throw new Error(`Filière inconnue : ${id}`);
  return f;
}

/** Libellés (dérivés de la SSOT) — remplace l'ancien FILIERE_LABEL épars. */
export const FILIERE_LABEL: Record<FiliereId, string> = Object.fromEntries(
  FILIERES.map((f) => [f.id, f.label]),
) as Record<FiliereId, string>;

/** Libellé du statut de couverture, pour les badges. */
export const STATUT_FILIERE_LABEL: Record<StatutFiliere, string> = {
  production: "En production",
  couverte: "Couverte",
};

/**
 * Produits dérivés RDUE (Annexe I) — mentionnés sur l'accueil et le dashboard.
 * ⚠️ Liste indicative à re-vérifier sur le texte officiel avant tout usage commercial.
 */
export const PRODUITS_DERIVES = [
  "Chocolat",
  "Cuir",
  "Meubles",
  "Papier et imprimés",
  "Pneus",
  "Huile de palme dérivée",
  "Charbon de bois",
];

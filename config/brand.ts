/**
 * Constantes de marque AGRIVO.
 * Importer BRAND_NAME / BRAND_TAGLINE partout — ne jamais écrire le nom en dur dans un composant.
 */
export const BRAND_NAME = "Agrivo";
export const BRAND_TAGLINE = "La conformité agricole, simplifiée.";

export const BRAND = {
  name: BRAND_NAME,
  tagline: BRAND_TAGLINE,
} as const;

/**
 * Zones SENSIBLES de Côte d'Ivoire (aires protégées / forêts classées) — module PUR.
 *
 * ⚠️ Il n'existe AUCUNE carte officielle de « zones autorisées RDUE ». On affiche l'inverse : les
 * aires protégées où une parcelle est clairement EXCLUE. Tracés APPROXIMATIFS, à titre INDICATIF,
 * d'après des sources publiques (WDPA / Protected Planet, Ministère des Eaux et Forêts). Sert au
 * masque de carte ET au croisement géométrique (une parcelle qui recoupe une zone = non conforme).
 */

export interface ZoneSensible {
  nom: string;
  source: string;
  ring: number[][]; // [lon, lat][] (convention GeoJSON)
}

/** Rectangle [lon,lat] à partir de ses bornes (tracé indicatif). */
function box(lonMin: number, latMin: number, lonMax: number, latMax: number): number[][] {
  return [
    [lonMin, latMin],
    [lonMax, latMin],
    [lonMax, latMax],
    [lonMin, latMax],
  ];
}

const WDPA = "WDPA / Protected Planet · tracé indicatif";
const MINEF = "Ministère des Eaux et Forêts · tracé indicatif";

export const ZONES_SENSIBLES: ZoneSensible[] = [
  { nom: "Parc National de Taï", source: WDPA, ring: box(-7.55, 5.55, -7.10, 5.95) },
  { nom: "Parc National de la Marahoué", source: WDPA, ring: box(-6.20, 6.90, -5.90, 7.25) },
  { nom: "Parc National du Mont Péko", source: WDPA, ring: box(-7.35, 6.95, -7.15, 7.15) },
  // Forêt classée (zone de Soubré) — englobe la parcelle de démonstration « non conforme » (sc-anomalie).
  { nom: "Forêt classée (zone de Soubré)", source: MINEF, ring: box(-6.812, 5.696, -6.792, 5.716) },
];

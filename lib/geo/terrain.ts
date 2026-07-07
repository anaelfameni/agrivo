/**
 * Géométrie du mode terrain : tour de champ GPS RÉEL dans le navigateur (PWA mobile).
 * Le web simulait la marche ; ces fonctions pures transforment les fixes de
 * `navigator.geolocation.watchPosition` en waypoints propres (règle RDUE : polygone complet
 * dès 4 ha, WGS-84, 6 décimales, anneau fermé). Testées dans terrain.test.ts.
 */

/** Distance minimale (m) entre deux waypoints posés — filtre le bruit GPS à l'arrêt. */
export const MIN_WAYPOINT_M = 8;

/** Emprise de la Côte d'Ivoire acceptée par la validation (identique au mode « coordonnées »). */
export const EMPRISE_CI = { lonMin: -9, lonMax: -2, latMin: 4, latMax: 11 } as const;

/** Distance haversine en mètres entre deux positions [lon, lat]. */
export function haversineM(a: number[], b: number[]): number {
  const R = 6371000;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const la1 = (a[1] * Math.PI) / 180;
  const la2 = (b[1] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Distance cumulée (m) le long d'une trace [lon, lat][]. */
export function distanceCumuleeM(pts: number[][]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += haversineM(pts[i - 1], pts[i]);
  return d;
}

/** Un nouveau fix GPS mérite-t-il un waypoint ? (premier fix, ou ≥ minM du dernier posé). */
export function estNouveauWaypoint(
  dernier: number[] | undefined,
  fix: number[],
  minM: number = MIN_WAYPOINT_M,
): boolean {
  if (!dernier) return true;
  return haversineM(dernier, fix) >= minM;
}

/** Arrondit une coordonnée à 6 décimales (GeoJSON RFC 7946, ± 11 cm). */
export function arrondi6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/** Ferme l'anneau GeoJSON (répète le premier sommet en dernier) s'il ne l'est pas déjà. */
export function fermerAnneau(pts: number[][]): number[][] {
  if (pts.length < 3) return [...pts];
  const premier = pts[0];
  const dernier = pts[pts.length - 1];
  if (premier[0] === dernier[0] && premier[1] === dernier[1]) return [...pts];
  return [...pts, [premier[0], premier[1]]];
}

/** Tous les points [lon, lat] sont-ils dans l'emprise Côte d'Ivoire (lat 4–11, lon −9 à −2) ? */
export function dansEmpriseCI(pts: number[][]): boolean {
  return pts.every(
    ([lon, lat]) =>
      lon >= EMPRISE_CI.lonMin && lon <= EMPRISE_CI.lonMax && lat >= EMPRISE_CI.latMin && lat <= EMPRISE_CI.latMax,
  );
}

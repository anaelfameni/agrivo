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

/* --------------------------- Aire & croisement de polygones --------------------------- */

/** Anneau ouvert : retire le point de fermeture dupliqué s'il est présent. */
function anneauOuvert(ring: number[][]): number[][] {
  return ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
    ? ring.slice(0, -1)
    : ring;
}

/**
 * Superficie (hectares) d'un polygone [lon, lat] par la formule du lacet (shoelace), en projection
 * équirectangulaire locale (cos(latitude moyenne)) — précision suffisante pour une parcelle agricole.
 */
export function aireHa(ring: number[][]): number {
  const r = anneauOuvert(ring);
  if (r.length < 3) return 0;
  const R = 6378137; // rayon terrestre (m)
  const latAvg = (r.reduce((s, c) => s + c[1], 0) / r.length) * (Math.PI / 180);
  const xy = r.map(([lon, lat]) => [((lon * Math.PI) / 180) * R * Math.cos(latAvg), ((lat * Math.PI) / 180) * R]);
  let a = 0;
  for (let i = 0; i < xy.length; i++) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[(i + 1) % xy.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2 / 10000; // m² → ha
}

/** Le point [lon, lat] est-il dans le polygone (ray casting) ? */
export function pointInPolygon(pt: number[], ring: number[][]): boolean {
  const r = anneauOuvert(ring);
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i];
    const [xj, yj] = r[j];
    const intersecte = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersecte) inside = !inside;
  }
  return inside;
}

const orient = (a: number[], b: number[], c: number[]): number =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

/** Les segments [a,b] et [c,d] se croisent-ils (cas propre, colinéaires ignorés) ? */
export function segmentsCroisent(a: number[], b: number[], c: number[], d: number[]): boolean {
  const d1 = orient(c, d, a);
  const d2 = orient(c, d, b);
  const d3 = orient(a, b, c);
  const d4 = orient(a, b, d);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** Deux polygones [lon, lat] se chevauchent-ils (sommet contenu, ou arêtes qui se croisent) ? */
export function polygonesSeChevauchent(a: number[][], b: number[][]): boolean {
  const ra = anneauOuvert(a);
  const rb = anneauOuvert(b);
  if (ra.length < 3 || rb.length < 3) return false;
  if (ra.some((p) => pointInPolygon(p, rb))) return true;
  if (rb.some((p) => pointInPolygon(p, ra))) return true;
  for (let i = 0; i < ra.length; i++) {
    const a1 = ra[i];
    const a2 = ra[(i + 1) % ra.length];
    for (let j = 0; j < rb.length; j++) {
      if (segmentsCroisent(a1, a2, rb[j], rb[(j + 1) % rb.length])) return true;
    }
  }
  return false;
}

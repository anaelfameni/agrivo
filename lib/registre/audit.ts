/**
 * Audit RDUE d'un registre de parcelles importé par la coopérative (fichiers .geojson/.json/
 * .kml/.csv qu'elle détient déjà : exports de certification, cartographies financées par les
 * exportateurs). Module PUR (aucune dépendance UI) : parsing + validation de géométrie.
 *
 * Règle RDUE : point GPS accepté sous 4 ha, polygone obligatoire à partir de 4 ha,
 * coordonnées WGS84. L'audit classe chaque parcelle : prête pour la RDUE, ou porteuse
 * d'anomalies à corriger (au bureau) ou à compléter (sur le terrain).
 */

export type CategorieAnomalie =
  | "geometrie-invalide"
  | "polygone-manquant"
  | "doublon"
  | "chevauchement"
  | "hors-zone";

export type ActionAnomalie = "terrain" | "bureau";

export interface RegistreParcelle {
  matricule: string;
  nom?: string;
  superficieHa?: number;
  /** "point" = [lon, lat] ; "polygone" = anneau extérieur [[lon, lat], …] */
  geometrie:
    | { type: "point"; coords: [number, number] }
    | { type: "polygone"; ring: [number, number][] }
    | { type: "aucune" };
}

export interface AnomalieRegistre {
  categorie: CategorieAnomalie;
  matricule: string;
  nom?: string;
  detail: { fr: string; en: string };
  action: ActionAnomalie;
}

export interface AuditRegistre {
  total: number;
  valides: RegistreParcelle[];
  anomalies: AnomalieRegistre[];
  /** % de parcelles prêtes pour la RDUE (arrondi). */
  pretPct: number;
}

/** Emprise approximative de la Côte d'Ivoire (WGS84) : lon [-9, -2], lat [4, 11]. */
export const ZONE_CI = { lonMin: -9, lonMax: -2, latMin: 4, latMax: 11 } as const;

/** Seuil RDUE : polygone obligatoire à partir de 4 ha. */
export const SEUIL_POLYGONE_HA = 4;

const EPS = 1e-9;

/** Un anneau de polygone est fermé si premier et dernier sommet coïncident. */
export function anneauFerme(ring: [number, number][]): boolean {
  if (ring.length < 4) return false;
  const [x0, y0] = ring[0];
  const [x1, y1] = ring[ring.length - 1];
  return Math.abs(x0 - x1) < EPS && Math.abs(y0 - y1) < EPS;
}

/** Coordonnée [lon, lat] plausible pour une parcelle ivoirienne. */
export function dansLaZone([lon, lat]: [number, number]): boolean {
  return lon >= ZONE_CI.lonMin && lon <= ZONE_CI.lonMax && lat >= ZONE_CI.latMin && lat <= ZONE_CI.latMax;
}

function coordsDe(p: RegistreParcelle): [number, number][] {
  if (p.geometrie.type === "point") return [p.geometrie.coords];
  if (p.geometrie.type === "polygone") return p.geometrie.ring;
  return [];
}

function bbox(coords: [number, number][]) {
  let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
  for (const [lon, lat] of coords) {
    if (lon < lonMin) lonMin = lon;
    if (lon > lonMax) lonMax = lon;
    if (lat < latMin) latMin = lat;
    if (lat > latMax) latMax = lat;
  }
  return { lonMin, lonMax, latMin, latMax };
}

/** Chevauchement approché par intersection d'emprises (suffisant pour un audit de premier niveau). */
export function chevauchent(a: RegistreParcelle, b: RegistreParcelle): boolean {
  if (a.geometrie.type !== "polygone" || b.geometrie.type !== "polygone") return false;
  const ba = bbox(a.geometrie.ring);
  const bb = bbox(b.geometrie.ring);
  const lonOverlap = Math.min(ba.lonMax, bb.lonMax) - Math.max(ba.lonMin, bb.lonMin);
  const latOverlap = Math.min(ba.latMax, bb.latMax) - Math.max(ba.latMin, bb.latMin);
  if (lonOverlap <= 0 || latOverlap <= 0) return false;
  // On exige un recouvrement significatif (> 30 % de la plus petite emprise) pour éviter
  // de signaler deux parcelles simplement voisines.
  const aire = (r: { lonMin: number; lonMax: number; latMin: number; latMax: number }) =>
    Math.max(0, r.lonMax - r.lonMin) * Math.max(0, r.latMax - r.latMin);
  const inter = lonOverlap * latOverlap;
  const minAire = Math.min(aire(ba), aire(bb));
  return minAire > 0 && inter / minAire > 0.3;
}

/**
 * Audit RDUE du registre : chaque parcelle est soit prête, soit rattachée à une ou plusieurs
 * anomalies avec l'action à mener (« terrain » = à compléter via l'étape Cartographie,
 * « bureau » = à corriger dans le fichier source).
 */
export function auditerRegistre(parcelles: RegistreParcelle[]): AuditRegistre {
  const anomalies: AnomalieRegistre[] = [];
  const invalides = new Set<string>();
  const marquer = (p: RegistreParcelle, a: Omit<AnomalieRegistre, "matricule" | "nom">) => {
    anomalies.push({ ...a, matricule: p.matricule, nom: p.nom });
    invalides.add(p.matricule + "§" + parcelles.indexOf(p));
  };

  // Doublons de matricule
  const vus = new Map<string, number>();
  parcelles.forEach((p) => vus.set(p.matricule, (vus.get(p.matricule) ?? 0) + 1));
  const doublonsSignales = new Set<string>();
  for (const p of parcelles) {
    if ((vus.get(p.matricule) ?? 0) > 1 && !doublonsSignales.has(p.matricule)) {
      doublonsSignales.add(p.matricule);
      marquer(p, {
        categorie: "doublon",
        detail: {
          fr: `Le matricule ${p.matricule} apparaît ${vus.get(p.matricule)} fois dans le registre.`,
          en: `Matricule ${p.matricule} appears ${vus.get(p.matricule)} times in the register.`,
        },
        action: "bureau",
      });
    } else if (doublonsSignales.has(p.matricule)) {
      invalides.add(p.matricule + "§" + parcelles.indexOf(p));
    }
  }

  for (const p of parcelles) {
    // Géométrie absente ou invalide
    if (p.geometrie.type === "aucune") {
      marquer(p, {
        categorie: "geometrie-invalide",
        detail: { fr: "Aucune géométrie exploitable dans le fichier.", en: "No usable geometry in the file." },
        action: "terrain",
      });
      continue;
    }
    if (p.geometrie.type === "polygone" && !anneauFerme(p.geometrie.ring)) {
      marquer(p, {
        categorie: "geometrie-invalide",
        detail: {
          fr: "Polygone ouvert : le contour ne se referme pas sur son premier sommet.",
          en: "Open polygon: the outline does not close back on its first vertex.",
        },
        action: "terrain",
      });
    }
    // Hors zone
    const coords = coordsDe(p);
    if (coords.length > 0 && coords.some((c) => !dansLaZone(c))) {
      marquer(p, {
        categorie: "hors-zone",
        detail: {
          fr: "Des coordonnées sortent de l'emprise plausible de la Côte d'Ivoire (WGS84 inversé ou saisie erronée).",
          en: "Some coordinates fall outside the plausible extent of Côte d'Ivoire (swapped WGS84 or input error).",
        },
        action: "bureau",
      });
    }
    // Polygone manquant ≥ 4 ha (seul un point central existe)
    if (
      p.geometrie.type === "point" &&
      typeof p.superficieHa === "number" &&
      p.superficieHa >= SEUIL_POLYGONE_HA
    ) {
      marquer(p, {
        categorie: "polygone-manquant",
        detail: {
          fr: `Parcelle de ${p.superficieHa} ha : la RDUE exige un polygone à partir de ${SEUIL_POLYGONE_HA} ha, or seul un point central est fourni.`,
          en: `Plot of ${p.superficieHa} ha: the EUDR requires a polygon from ${SEUIL_POLYGONE_HA} ha, yet only a centre point is provided.`,
        },
        action: "terrain",
      });
    }
  }

  // Chevauchements (paires de polygones)
  for (let i = 0; i < parcelles.length; i++) {
    for (let j = i + 1; j < parcelles.length; j++) {
      if (chevauchent(parcelles[i], parcelles[j])) {
        marquer(parcelles[i], {
          categorie: "chevauchement",
          detail: {
            fr: `Le polygone chevauche celui du matricule ${parcelles[j].matricule}.`,
            en: `The polygon overlaps the one of matricule ${parcelles[j].matricule}.`,
          },
          action: "terrain",
        });
        invalides.add(parcelles[j].matricule + "§" + j);
      }
    }
  }

  const valides = parcelles.filter((p, idx) => !invalides.has(p.matricule + "§" + idx));
  return {
    total: parcelles.length,
    valides,
    anomalies,
    pretPct: parcelles.length ? Math.round((valides.length / parcelles.length) * 100) : 0,
  };
}

/* --------------------------------- Parsers --------------------------------- */

type GeoJSONGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: string; coordinates?: unknown };

interface GeoJSONFeature {
  type: "Feature";
  properties?: Record<string, unknown> | null;
  geometry?: GeoJSONGeometry | null;
}

function prop(props: Record<string, unknown> | null | undefined, keys: string[]): unknown {
  if (!props) return undefined;
  for (const k of keys) {
    const hit = Object.keys(props).find((x) => x.toLowerCase() === k);
    if (hit !== undefined) return props[hit];
  }
  return undefined;
}

/** Parse un GeoJSON (FeatureCollection de Point/Polygon) en parcelles de registre. */
export function parserGeoJSON(texte: string): RegistreParcelle[] {
  const doc = JSON.parse(texte) as { type?: string; features?: GeoJSONFeature[] };
  const features = Array.isArray(doc.features) ? doc.features : [];
  return features.map((f, i) => {
    const matricule = String(prop(f.properties, ["matricule", "id", "code"]) ?? `SANS-MATRICULE-${i + 1}`);
    const nom = prop(f.properties, ["nom", "name", "producteur"]) as string | undefined;
    const supRaw = prop(f.properties, ["superficie_ha", "superficieha", "superficie", "area_ha"]);
    const superficieHa = typeof supRaw === "number" ? supRaw : supRaw != null ? Number(supRaw) : undefined;
    let geometrie: RegistreParcelle["geometrie"] = { type: "aucune" };
    const g = f.geometry;
    if (g?.type === "Point" && Array.isArray((g as { coordinates?: unknown }).coordinates)) {
      const c = (g as { coordinates: [number, number] }).coordinates;
      geometrie = { type: "point", coords: [Number(c[0]), Number(c[1])] };
    } else if (g?.type === "Polygon") {
      const rings = (g as { coordinates: [number, number][][] }).coordinates;
      if (Array.isArray(rings) && Array.isArray(rings[0]) && rings[0].length > 0) {
        geometrie = { type: "polygone", ring: rings[0].map((c) => [Number(c[0]), Number(c[1])]) };
      }
    }
    return {
      matricule,
      nom,
      superficieHa: Number.isFinite(superficieHa) ? superficieHa : undefined,
      geometrie,
    };
  });
}

/** Parse un CSV `matricule,nom,superficie_ha,lat,lon` (points uniquement — livrables exportateurs). */
export function parserCSV(texte: string): RegistreParcelle[] {
  const lignes = texte.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lignes.length === 0) return [];
  const entetes = lignes[0].toLowerCase().split(/[;,]/).map((h) => h.trim());
  const idx = (names: string[]) => entetes.findIndex((h) => names.includes(h));
  const iMat = idx(["matricule", "id", "code"]);
  const iNom = idx(["nom", "name", "producteur"]);
  const iSup = idx(["superficie_ha", "superficie", "area_ha"]);
  const iLat = idx(["lat", "latitude"]);
  const iLon = idx(["lon", "lng", "longitude"]);
  return lignes.slice(1).map((l, n) => {
    const cols = l.split(/[;,]/).map((c) => c.trim());
    const lat = iLat >= 0 ? Number(cols[iLat]) : NaN;
    const lon = iLon >= 0 ? Number(cols[iLon]) : NaN;
    const sup = iSup >= 0 ? Number(cols[iSup]) : NaN;
    return {
      matricule: (iMat >= 0 && cols[iMat]) || `SANS-MATRICULE-${n + 1}`,
      nom: iNom >= 0 ? cols[iNom] || undefined : undefined,
      superficieHa: Number.isFinite(sup) ? sup : undefined,
      geometrie:
        Number.isFinite(lat) && Number.isFinite(lon)
          ? { type: "point", coords: [lon, lat] }
          : { type: "aucune" },
    };
  });
}

/** Parse un KML minimal (Placemark → Point ou Polygon, premier anneau). */
export function parserKML(texte: string): RegistreParcelle[] {
  const placemarks = texte.split(/<Placemark[\s>]/i).slice(1);
  return placemarks.map((bloc, i) => {
    const nom = /<name>([\s\S]*?)<\/name>/i.exec(bloc)?.[1]?.trim();
    const coordsTxt = /<coordinates>([\s\S]*?)<\/coordinates>/i.exec(bloc)?.[1]?.trim();
    let geometrie: RegistreParcelle["geometrie"] = { type: "aucune" };
    if (coordsTxt) {
      const pts = coordsTxt
        .split(/\s+/)
        .map((t) => t.split(",").map(Number))
        .filter((c) => c.length >= 2 && c.every((n) => Number.isFinite(n)))
        .map((c) => [c[0], c[1]] as [number, number]);
      if (/<Polygon[\s>]/i.test(bloc) && pts.length >= 3) geometrie = { type: "polygone", ring: pts };
      else if (pts.length >= 1) geometrie = { type: "point", coords: pts[0] };
    }
    return { matricule: nom || `KML-${i + 1}`, nom, geometrie };
  });
}

/** Route le parsing selon l'extension du fichier. */
export function parserRegistre(nomFichier: string, texte: string): RegistreParcelle[] {
  const ext = nomFichier.toLowerCase().split(".").pop() ?? "";
  if (ext === "csv") return parserCSV(texte);
  if (ext === "kml") return parserKML(texte);
  // .geojson / .json par défaut
  return parserGeoJSON(texte);
}

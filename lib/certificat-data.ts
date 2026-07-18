/**
 * Construction des données d'un certificat de conformité RDUE (module PUR — pas de dépendance
 * PDF, importable partout : aperçu HTML + génération PDF). Coordonnées WGS-84 à 6 décimales
 * (RFC 7946). Le certificat est une évaluation technique, pas une garantie légale.
 */
import {
  FILIERE_LABEL,
  STATUT_LABEL,
  STATUT_PHRASE,
  formatDateFr,
  fmtHa,
  type Parcelle,
  type Statut,
} from "@/data/mock-parcelles";

export interface CertificatData {
  numeroCertificat: string;
  emisLe: string;
  producteurNom: string;
  numeroCartePro: string;
  cooperative: string;
  filiereLabel: string;
  region: string;
  superficie: string;
  statut: Statut;
  statutLabel: string;
  phrase: string;
  datePivot: string;
  sources: string[];
  vertices: string[]; // "5.788300° N · 6.599900° O"
  centroid: string;
}

function fmtCoord(lon: number, lat: number, lang: "fr" | "en" = "fr"): string {
  const ouest = lang === "en" ? "W" : "O";
  return `${Math.abs(lat).toFixed(6)}° ${lat >= 0 ? "N" : "S"} · ${Math.abs(lon).toFixed(6)}° ${lon >= 0 ? "E" : ouest}`;
}

/** Libellés EN des filières — aperçu à l'écran + brouillon DDS (le PDF officiel reste FR). */
export const FILIERE_LABEL_EN: Record<Parcelle["filiere"], string> = {
  cacao: "Cocoa",
  cafe: "Coffee",
  hevea: "Rubber",
  palmier: "Oil palm",
  bovins: "Cattle",
  soja: "Soy",
  bois: "Wood",
};

export function buildCertificat(
  p: Parcelle,
  verdict?: { statut: Statut; phrase: string; sources: string[] },
  lang: "fr" | "en" = "fr",
): CertificatData {
  const verts =
    p.geojson.type === "Polygon" ? p.geojson.coordinates[0].slice(0, -1) : [p.geojson.coordinates];
  const cLon = verts.reduce((s, c) => s + c[0], 0) / verts.length;
  const cLat = verts.reduce((s, c) => s + c[1], 0) / verts.length;
  const statut = verdict?.statut ?? p.statut;
  return {
    numeroCertificat: p.numeroCertificat,
    emisLe: new Date().toLocaleString(lang === "en" ? "en-GB" : "fr-FR", { dateStyle: "long", timeStyle: "short" }),
    producteurNom: p.producteurNom,
    numeroCartePro: p.numeroCartePro,
    cooperative: p.cooperative,
    filiereLabel: lang === "en" ? FILIERE_LABEL_EN[p.filiere] : FILIERE_LABEL[p.filiere],
    region: p.region,
    superficie: fmtHa(p.superficieHa),
    statut,
    statutLabel: STATUT_LABEL[statut],
    phrase: verdict?.phrase ?? STATUT_PHRASE[statut],
    datePivot: formatDateFr(p.datePivotAnalyse),
    sources: verdict?.sources ?? p.sourcesDonnees,
    vertices: verts.map(([lon, lat]) => fmtCoord(lon, lat, lang)),
    centroid: fmtCoord(cLon, cLat, lang),
  };
}

/**
 * Modèle de données AGRIVO (démo, données synthétiques) — module PUR (pas de "use client"),
 * réutilisé par le dashboard coopérative (Prompt 3), le parcours (Prompt 4) et le dashboard
 * exportateur (Prompt 5). Aucune donnée réelle : tout est fictif.
 *
 * Vocabulaire figé : statuts « Conforme » / « Anomalie détectée » / « Données insuffisantes ».
 * Pas de « valeur à risque » (concept hors AGRIVO). Le micro-crédit est un prêt que le
 * producteur rembourse (jamais « gratuit »).
 */

import { type FiliereId, FILIERE_LABEL } from "@/config/filieres";

/** La liste des filières = source de vérité unique dans config/filieres.ts (les 7 denrées RDUE). */
export type Filiere = FiliereId;
export type Statut = "conforme" | "anomalie" | "insuffisant";

export type ParcelleGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "Point"; coordinates: number[] };

export interface Parcelle {
  id: string;
  producteurNom: string;
  numeroCartePro: string;
  cooperative: string;
  region: string;
  superficieHa: number;
  filiere: Filiere;
  geojson: ParcelleGeometry;
  statut: Statut;
  dateVerification: string; // ISO
  datePivotAnalyse: string; // "2020-12-31"
  sourcesDonnees: string[];
  numeroCertificat: string;
  referenceDDR?: string;
  propositionCredit?: { montantFcfa: number; statut: "proposee" | "acceptee" | "versee" };
  alerteActive?: boolean;
}

/* Libellés figés (charte) */
export const STATUT_LABEL: Record<Statut, string> = {
  conforme: "Conforme",
  anomalie: "Anomalie détectée",
  insuffisant: "Données insuffisantes",
};
export const STATUT_PHRASE: Record<Statut, string> = {
  conforme: "Aucune déforestation détectée après le 31 décembre 2020.",
  anomalie: "Une perte de couverture forestière a été identifiée sur cette zone.",
  insuffisant: "Présence de nuages ou données satellites insuffisantes pour statuer.",
};
export const STATUT_COLOR: Record<Statut, string> = {
  conforme: "var(--color-green-signal)",
  anomalie: "var(--color-red-block)",
  insuffisant: "var(--color-amber-cacao)",
};
/** Libellés de filière : ré-exportés depuis la source de vérité unique config/filieres.ts. */
export { FILIERE_LABEL };

/* Coopérative de démonstration (l'écran d'Amadou) */
export const COOP_DEMO = "Coopérative Agricole de Soubré";
export const COOP_DEMO_CODE = "COOP-SOU";
export const MANAGER_DEMO = "Amadou";

const SOURCES = ["Copernicus Sentinel-2", "Whisp · FAO Open Foris", "JRC Global Forest Cover"];

/** Petit polygone fermé, irrégulier, autour d'un centre [lon, lat] (RFC 7946, [lon, lat]). */
function poly(lon: number, lat: number): ParcelleGeometry {
  const d = 0.0016;
  return {
    type: "Polygon",
    coordinates: [
      [
        [lon - d, lat + d * 0.8],
        [lon + d * 1.1, lat + d],
        [lon + d, lat - d * 0.9],
        [lon - d * 0.8, lat - d],
        [lon - d, lat + d * 0.8],
      ],
    ],
  };
}

// Centres approximatifs par zone (filières RDUE ivoiriennes)
const SOUBRE: [number, number] = [-6.6039, 5.7853];
const MAN: [number, number] = [-7.5539, 7.4125];
const ABOISSO: [number, number] = [-3.2074, 5.4699];
const DABOU: [number, number] = [-4.3773, 5.3239];
const MEAGUI: [number, number] = [-6.5500, 5.4400];
const GAGNOA: [number, number] = [-5.9500, 6.1300];
const DUEKOUE: [number, number] = [-7.3400, 6.7400];
const SANPEDRO: [number, number] = [-6.6200, 4.7500];
const DALOA: [number, number] = [-6.4500, 6.8800];
const off = (c: [number, number], i: number): [number, number] => [c[0] + i * 0.004, c[1] + i * 0.003];

const PARCELLES_BASE: Parcelle[] = [
  // --- Coopérative Agricole de Soubré (cacao) : 4 conformes, 3 anomalies, 3 données insuffisantes ---
  { id: "p01", producteurNom: "Kouassi Yao", numeroCartePro: "CI-CCC-024517", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 3.2, filiere: "cacao", geojson: poly(...off(SOUBRE, 1)), statut: "conforme", dateVerification: "2026-07-01", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0417", referenceDDR: "DDR-CI-2026-10842", propositionCredit: { montantFcfa: 150000, statut: "proposee" } },
  { id: "p02", producteurNom: "Konan Adjoua", numeroCartePro: "CI-CCC-024518", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 2.6, filiere: "cacao", geojson: poly(...off(SOUBRE, 2)), statut: "conforme", dateVerification: "2026-06-30", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0418", referenceDDR: "DDR-CI-2026-10843" },
  { id: "p03", producteurNom: "Aya Brou", numeroCartePro: "CI-CCC-024519", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 4.8, filiere: "cacao", geojson: poly(...off(SOUBRE, 3)), statut: "conforme", dateVerification: "2026-06-29", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0419", referenceDDR: "DDR-CI-2026-10844", propositionCredit: { montantFcfa: 250000, statut: "versee" } },
  { id: "p04", producteurNom: "Koffi N'Guessan", numeroCartePro: "CI-CCC-024520", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 1.9, filiere: "cacao", geojson: poly(...off(SOUBRE, 4)), statut: "conforme", dateVerification: "2026-06-28", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0420", referenceDDR: "DDR-CI-2026-10845", propositionCredit: { montantFcfa: 100000, statut: "acceptee" } },
  { id: "p05", producteurNom: "Amenan Kouamé", numeroCartePro: "CI-CCC-024521", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 5.4, filiere: "cacao", geojson: poly(...off(SOUBRE, 5)), statut: "anomalie", dateVerification: "2026-07-02", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0421", alerteActive: true },
  { id: "p06", producteurNom: "Bakary Traoré", numeroCartePro: "CI-CCC-024522", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 3.7, filiere: "cacao", geojson: poly(...off(SOUBRE, 6)), statut: "anomalie", dateVerification: "2026-06-27", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0422" },
  { id: "p07", producteurNom: "Djédjé Serge", numeroCartePro: "CI-CCC-024523", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 2.1, filiere: "cacao", geojson: poly(...off(SOUBRE, 7)), statut: "anomalie", dateVerification: "2026-07-02", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0423", alerteActive: true },
  { id: "p08", producteurNom: "Akissi Marie", numeroCartePro: "CI-CCC-024524", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 3.0, filiere: "cacao", geojson: poly(...off(SOUBRE, 8)), statut: "insuffisant", dateVerification: "2026-06-26", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0424" },
  { id: "p09", producteurNom: "Yao Michel", numeroCartePro: "CI-CCC-024525", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 4.2, filiere: "cacao", geojson: poly(...off(SOUBRE, 9)), statut: "insuffisant", dateVerification: "2026-06-25", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0425" },
  { id: "p10", producteurNom: "N'Dri Paul", numeroCartePro: "CI-CCC-024526", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 2.8, filiere: "cacao", geojson: poly(...off(SOUBRE, 10)), statut: "insuffisant", dateVerification: "2026-06-24", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0426" },
  // --- Autres coopératives / filières (pour le dashboard exportateur, Prompt 5) ---
  { id: "p11", producteurNom: "Ouattara Salif", numeroCartePro: "CI-CCC-031204", cooperative: "UCACO Man", region: "Tonkpi · Man", superficieHa: 1.6, filiere: "cafe", geojson: poly(...off(MAN, 1)), statut: "conforme", dateVerification: "2026-06-30", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0511", referenceDDR: "DDR-CI-2026-11901" },
  { id: "p12", producteurNom: "Coulibaly Awa", numeroCartePro: "CI-CCC-031205", cooperative: "UCACO Man", region: "Tonkpi · Man", superficieHa: 2.3, filiere: "cafe", geojson: poly(...off(MAN, 2)), statut: "anomalie", dateVerification: "2026-07-01", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0512", alerteActive: true },
  { id: "p13", producteurNom: "Kouadio Jean", numeroCartePro: "CI-CCC-040788", cooperative: "COOP-HEV Aboisso", region: "Sud-Comoé · Aboisso", superficieHa: 6.1, filiere: "hevea", geojson: poly(...off(ABOISSO, 1)), statut: "conforme", dateVerification: "2026-06-29", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0603", referenceDDR: "DDR-CI-2026-12550" },
  { id: "p14", producteurNom: "Gnamien Rita", numeroCartePro: "CI-CCC-050133", cooperative: "COOP-PALM Dabou", region: "Grands-Ponts · Dabou", superficieHa: 3.9, filiere: "palmier", geojson: poly(...off(DABOU, 1)), statut: "insuffisant", dateVerification: "2026-06-28", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0701" },
];

/* --------------------------------------------------------------------------------------
 * Portefeuille exportateur (Prompt 5) — parcelles supplémentaires, multi-coopératives et
 * multi-filières. Générées de façon déterministe (ids / n° de carte / n° de certificat
 * séquentiels ; DDR pour les conformes) pour rester cohérentes et sans doublon. Données
 * 100 % synthétiques. Statuts figés inchangés ; jamais de « valeur à risque ».
 * ------------------------------------------------------------------------------------ */
type CreditSpec = [montant: number, statut: "proposee" | "acceptee" | "versee"];
interface Row {
  nom: string;
  ha: number;
  filiere: Filiere;
  statut: Statut;
  credit?: CreditSpec;
  alerte?: boolean;
}
interface CoopBlock {
  coop: string;
  region: string;
  center: [number, number];
  rows: Row[];
}

const EXTRA_BLOCKS: CoopBlock[] = [
  {
    coop: COOP_DEMO,
    region: "Nawa · Soubré",
    center: SOUBRE,
    rows: [
      { nom: "Tanoh Éric", ha: 3.4, filiere: "cacao", statut: "conforme", credit: [150000, "proposee"] },
      { nom: "Gbagba Rose", ha: 2.2, filiere: "cacao", statut: "conforme" },
      { nom: "Séka Louis", ha: 4.1, filiere: "cacao", statut: "insuffisant" },
    ],
  },
  {
    coop: "Coopérative de Méagui",
    region: "Nawa · Méagui",
    center: MEAGUI,
    rows: [
      { nom: "Kramo Félix", ha: 3.8, filiere: "cacao", statut: "conforme", credit: [200000, "acceptee"] },
      { nom: "Assi Grace", ha: 2.9, filiere: "cacao", statut: "conforme" },
      { nom: "Yeboua Marc", ha: 5.2, filiere: "cacao", statut: "anomalie", alerte: true },
      { nom: "Kouassi Ida", ha: 1.7, filiere: "cacao", statut: "conforme" },
      { nom: "Brou Daniel", ha: 3.1, filiere: "cacao", statut: "conforme" },
      { nom: "Nanan Josée", ha: 2.4, filiere: "cacao", statut: "insuffisant" },
    ],
  },
  {
    coop: "COOPAAG Gagnoa",
    region: "Gôh · Gagnoa",
    center: GAGNOA,
    rows: [
      { nom: "Digbeu Paul", ha: 4.6, filiere: "cacao", statut: "conforme", credit: [250000, "versee"] },
      { nom: "Zadi Ruth", ha: 2.0, filiere: "cafe", statut: "conforme" },
      { nom: "Gnepa Simon", ha: 3.3, filiere: "cacao", statut: "anomalie" },
      { nom: "Tra Bi Serge", ha: 2.7, filiere: "cafe", statut: "conforme" },
      { nom: "Irié Lou", ha: 3.9, filiere: "cacao", statut: "conforme" },
    ],
  },
  {
    coop: "Union de Duékoué",
    region: "Guémon · Duékoué",
    center: DUEKOUE,
    rows: [
      { nom: "Goué Blaise", ha: 6.4, filiere: "hevea", statut: "conforme", credit: [200000, "proposee"] },
      { nom: "Sahi Prosper", ha: 3.0, filiere: "cacao", statut: "conforme" },
      { nom: "Bahi Estelle", ha: 2.5, filiere: "cacao", statut: "insuffisant" },
      { nom: "Zoro Kévin", ha: 5.8, filiere: "hevea", statut: "anomalie", alerte: true },
    ],
  },
  {
    coop: "COOP-SP San Pédro",
    region: "San-Pédro · San Pédro",
    center: SANPEDRO,
    rows: [
      { nom: "Wodié Alain", ha: 4.2, filiere: "cacao", statut: "conforme", credit: [150000, "proposee"] },
      { nom: "Méledje Sylvie", ha: 3.7, filiere: "palmier", statut: "conforme" },
      { nom: "Kipré Yves", ha: 7.1, filiere: "hevea", statut: "conforme" },
      { nom: "Aka Bernard", ha: 2.8, filiere: "cacao", statut: "conforme" },
      { nom: "Toualy Rita", ha: 3.5, filiere: "palmier", statut: "anomalie" },
      { nom: "Gogbé Henri", ha: 4.9, filiere: "cacao", statut: "conforme" },
    ],
  },
  {
    coop: "COOP Daloa",
    region: "Haut-Sassandra · Daloa",
    center: DALOA,
    rows: [
      { nom: "N'Zué Patrick", ha: 3.6, filiere: "cacao", statut: "conforme", credit: [100000, "acceptee"] },
      { nom: "Koré Amélie", ha: 2.3, filiere: "cacao", statut: "conforme" },
      { nom: "Djaha Franck", ha: 4.4, filiere: "cacao", statut: "insuffisant" },
      { nom: "Bamba Salif", ha: 3.0, filiere: "cacao", statut: "conforme" },
    ],
  },
  {
    coop: "UCACO Man",
    region: "Tonkpi · Man",
    center: MAN,
    rows: [
      { nom: "Silué Odette", ha: 1.9, filiere: "cafe", statut: "conforme" },
      { nom: "Diomandé Karim", ha: 2.6, filiere: "cafe", statut: "conforme" },
      { nom: "Fofana Aya", ha: 2.1, filiere: "cafe", statut: "anomalie", alerte: true },
    ],
  },
];

/** Date de vérification déterministe, étalée sur juin-juillet 2026 (juillet borné au 4). */
function extraDate(seed: number): string {
  const useJuly = seed % 3 === 0;
  const day = useJuly ? Math.min(1 + (seed % 4), 4) : 1 + ((seed * 3) % 28);
  return `2026-${useJuly ? "07" : "06"}-${String(day).padStart(2, "0")}`;
}

function buildExtra(): Parcelle[] {
  const out: Parcelle[] = [];
  let n = PARCELLES_BASE.length; // 14
  let cert = 800;
  let ddr = 13000;
  let card = 60000;
  for (const b of EXTRA_BLOCKS) {
    b.rows.forEach((r, i) => {
      n += 1;
      cert += 1;
      card += 1;
      const p: Parcelle = {
        id: `p${String(n).padStart(2, "0")}`,
        producteurNom: r.nom,
        numeroCartePro: `CI-CCC-0${card}`,
        cooperative: b.coop,
        region: b.region,
        superficieHa: r.ha,
        filiere: r.filiere,
        geojson: poly(...off(b.center, i + 1)),
        statut: r.statut,
        dateVerification: extraDate(n),
        datePivotAnalyse: "2020-12-31",
        sourcesDonnees: SOURCES,
        numeroCertificat: `AGV-2026-0${cert}`,
      };
      if (r.statut === "conforme") {
        ddr += 1;
        p.referenceDDR = `DDR-CI-2026-${ddr}`;
      }
      if (r.credit) p.propositionCredit = { montantFcfa: r.credit[0], statut: r.credit[1] };
      if (r.alerte) p.alerteActive = true;
      out.push(p);
    });
  }
  return out;
}

/** Toutes les parcelles (démo coopérative + portefeuille exportateur). */
export const PARCELLES: Parcelle[] = [...PARCELLES_BASE, ...buildExtra()];

/* --------------------------------- Accès & agrégats --------------------------------- */
export function getParcelle(id: string): Parcelle | undefined {
  return PARCELLES.find((p) => p.id === id);
}
export function parcellesForCoop(coop: string = COOP_DEMO): Parcelle[] {
  return PARCELLES.filter((p) => p.cooperative === coop);
}
export function coopStats(parcelles: Parcelle[]) {
  const total = parcelles.length;
  const conformes = parcelles.filter((p) => p.statut === "conforme").length;
  return {
    verifiees: total,
    conformes,
    tauxConformite: total ? Math.round((conformes / total) * 100) : 0,
    propositionsCredit: parcelles.filter((p) => p.propositionCredit).length,
    alertes: parcelles.filter((p) => p.alerteActive).length,
  };
}

/* --------------------------- Portefeuille exportateur (Prompt 5) --------------------------- */

/**
 * Rendement indicatif par filière (tonnes/ha) pour estimer le « volume validé ». Ordres de
 * grandeur agronomiques ivoiriens, volontairement prudents ; sert uniquement à un KPI de démo
 * (aucune donnée réelle, aucun chiffre présenté comme mesuré).
 */
export const RENDEMENT_T_HA: Record<Filiere, number> = { cacao: 0.6, cafe: 0.5, hevea: 1.4, palmier: 3.0, bovins: 0.2, soja: 2.5, bois: 1.0 };

export function volumeTonnes(p: Parcelle): number {
  return p.superficieHa * RENDEMENT_T_HA[p.filiere];
}

/** Volume validé = somme des volumes des parcelles conformes uniquement (les autres ne sont pas certifiables). */
export function volumeValideTonnes(parcelles: Parcelle[]): number {
  return parcelles.filter((p) => p.statut === "conforme").reduce((s, p) => s + volumeTonnes(p), 0);
}

/** Les 4 KPI officiels du dashboard exportateur : producteurs audités · taux de conformité · superficie cartographiée · volume validé. */
export function portfolioStats(parcelles: Parcelle[]) {
  const total = parcelles.length;
  const conformes = parcelles.filter((p) => p.statut === "conforme").length;
  return {
    producteurs: total,
    tauxConformite: total ? Math.round((conformes / total) * 100) : 0,
    superficieHa: parcelles.reduce((s, p) => s + p.superficieHa, 0),
    volumeTonnes: Math.round(volumeValideTonnes(parcelles)),
  };
}

/** Coopératives distinctes présentes dans un portefeuille (ordre d'apparition). */
export function cooperatives(parcelles: Parcelle[]): string[] {
  return [...new Set(parcelles.map((p) => p.cooperative))];
}

/** Alertes actives regroupées par coopérative (centre d'alertes exportateur). */
export function alertesParCoop(parcelles: Parcelle[]): { cooperative: string; items: Parcelle[] }[] {
  const map = new Map<string, Parcelle[]>();
  for (const p of parcelles) {
    if (!p.alerteActive) continue;
    const arr = map.get(p.cooperative) ?? [];
    arr.push(p);
    map.set(p.cooperative, arr);
  }
  return [...map.entries()].map(([cooperative, items]) => ({ cooperative, items }));
}

/* --------------------------- Export GeoJSON (RFC 7946) --------------------------- */

/** Type minimal d'une FeatureCollection GeoJSON (RFC 7946). */
export interface FeatureCollection {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    geometry: ParcelleGeometry;
    properties: Record<string, string | number | string[]>;
  }[];
}

const round6 = (n: number) => Math.round(n * 1e6) / 1e6; // RFC 7946 : 6 décimales (~11 cm)

function roundGeometry(g: ParcelleGeometry): ParcelleGeometry {
  return g.type === "Polygon"
    ? { type: "Polygon", coordinates: g.coordinates.map((ring) => ring.map(([lon, lat]) => [round6(lon), round6(lat)])) }
    : { type: "Point", coordinates: [round6(g.coordinates[0]), round6(g.coordinates[1])] };
}

/**
 * Construit une FeatureCollection GeoJSON valide (RFC 7946, WGS-84 lon/lat, 6 décimales) à partir
 * des parcelles fournies. Prête pour un dépôt TRACES NT. Les propriétés reprennent le vocabulaire figé.
 */
export function exporterFeatureCollection(parcelles: Parcelle[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: parcelles.map((p) => ({
      type: "Feature",
      geometry: roundGeometry(p.geojson),
      properties: {
        id: p.id,
        producteur: p.producteurNom,
        numeroCartePro: p.numeroCartePro,
        cooperative: p.cooperative,
        region: p.region,
        filiere: FILIERE_LABEL[p.filiere],
        superficieHa: p.superficieHa,
        statut: STATUT_LABEL[p.statut],
        numeroCertificat: p.numeroCertificat,
        datePivotAnalyse: p.datePivotAnalyse,
        sourcesDonnees: p.sourcesDonnees,
      },
    })),
  };
}

/* --------------------------------- Formatage --------------------------------- */
export const fmtHa = (n: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(n)} ha`;
export const fmtFCFA = (n: number) => `${new Intl.NumberFormat("fr-FR").format(n)} FCFA`;
export function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
export const fmtTonnes = (n: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n)} t`;

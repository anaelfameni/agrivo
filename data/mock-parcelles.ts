/**
 * Modèle de données AGRIVO (démo, données synthétiques) — module PUR (pas de "use client"),
 * réutilisé par le dashboard coopérative (Prompt 3), le parcours (Prompt 4) et le dashboard
 * exportateur (Prompt 5). Aucune donnée réelle : tout est fictif.
 *
 * Vocabulaire figé : statuts « Conforme » / « Anomalie détectée » / « Données insuffisantes ».
 * Pas de « valeur à risque » ni de score de crédit/plafond de financement (concepts hors AGRIVO) :
 * la conformité se valorise par les primes et le dossier exportateur, jamais par du crédit.
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
  /** Dossier de conformité partagé avec l'exportateur (valorisation commerciale). */
  dossierPartage?: { date: string; statut: "partage" | "consulte" };
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
/** Phrases de verdict en anglais (mêmes formulations que la landing). */
export const STATUT_PHRASE_EN: Record<Statut, string> = {
  conforme: "No deforestation detected after 31 December 2020.",
  anomalie: "A loss of forest cover was identified on this area.",
  insuffisant: "Clouds or insufficient satellite data to decide.",
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
// Zone RURALE au nord-ouest de Soubré (mosaïque de plantations, vérifiée sur l'imagerie Esri) :
// le centre-ville faisait tomber les parcelles de démo en plein tissu urbain, peu crédible au jury.
const SOUBRE: [number, number] = [-6.65, 5.83];
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
  { id: "p01", producteurNom: "Kouassi Yao", numeroCartePro: "CI-CCC-024517", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 3.2, filiere: "cacao", geojson: poly(...off(SOUBRE, 1)), statut: "conforme", dateVerification: "2026-07-01", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0417", referenceDDR: "DDR-CI-2026-10842", dossierPartage: { date: "2026-07-01", statut: "partage" } },
  { id: "p02", producteurNom: "Konan Adjoua", numeroCartePro: "CI-CCC-024518", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 2.6, filiere: "cacao", geojson: poly(...off(SOUBRE, 2)), statut: "conforme", dateVerification: "2026-06-30", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0418", referenceDDR: "DDR-CI-2026-10843" },
  { id: "p03", producteurNom: "Aya Brou", numeroCartePro: "CI-CCC-024519", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 4.8, filiere: "cacao", geojson: poly(...off(SOUBRE, 3)), statut: "conforme", dateVerification: "2026-06-29", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0419", referenceDDR: "DDR-CI-2026-10844", dossierPartage: { date: "2026-06-29", statut: "consulte" } },
  { id: "p04", producteurNom: "Koffi N'Guessan", numeroCartePro: "CI-CCC-024520", cooperative: COOP_DEMO, region: "Nawa · Soubré", superficieHa: 1.9, filiere: "cacao", geojson: poly(...off(SOUBRE, 4)), statut: "conforme", dateVerification: "2026-06-28", datePivotAnalyse: "2020-12-31", sourcesDonnees: SOURCES, numeroCertificat: "AGV-2026-0420", referenceDDR: "DDR-CI-2026-10845", dossierPartage: { date: "2026-06-28", statut: "partage" } },
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
interface Row {
  nom: string;
  ha: number;
  filiere: Filiere;
  statut: Statut;
  /** Dossier de conformité partagé avec l'exportateur. */
  dossier?: "partage" | "consulte";
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
      { nom: "Tanoh Éric", ha: 3.4, filiere: "cacao", statut: "conforme", dossier: "partage" },
      { nom: "Gbagba Rose", ha: 2.2, filiere: "cacao", statut: "conforme" },
      { nom: "Séka Louis", ha: 4.1, filiere: "cacao", statut: "insuffisant" },
    ],
  },
  {
    coop: "Coopérative de Méagui",
    region: "Nawa · Méagui",
    center: MEAGUI,
    rows: [
      { nom: "Kramo Félix", ha: 3.8, filiere: "cacao", statut: "conforme", dossier: "consulte" },
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
      { nom: "Digbeu Paul", ha: 4.6, filiere: "cacao", statut: "conforme", dossier: "consulte" },
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
      { nom: "Goué Blaise", ha: 6.4, filiere: "hevea", statut: "conforme", dossier: "partage" },
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
      { nom: "Wodié Alain", ha: 4.2, filiere: "cacao", statut: "conforme", dossier: "partage" },
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
      { nom: "N'Zué Patrick", ha: 3.6, filiere: "cacao", statut: "conforme", dossier: "consulte" },
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
      if (r.dossier) p.dossierPartage = { date: p.dateVerification, statut: r.dossier };
      if (r.alerte) p.alerteActive = true;
      out.push(p);
    });
  }
  return out;
}

/** Toutes les parcelles (démo coopérative + portefeuille exportateur). */
export const PARCELLES: Parcelle[] = [...PARCELLES_BASE, ...buildExtra()];

/** Construit un polygone GeoJSON fermé à partir de sommets saisis en (latitude, longitude). */
function polyFromLatLon(corners: [number, number][]): ParcelleGeometry {
  const ring = corners.map(([lat, lon]) => [lon, lat]);
  return { type: "Polygon", coordinates: [[...ring, ring[0]]] };
}

/**
 * Scénarios de DÉMONSTRATION du parcours de vérification : 3 jeux de coordonnées fictives mais
 * réalistes (zone de Soubré/Nawa), un par verdict verbatim. Le moteur `whispMock` lit `statut` via
 * `parcelleId`, donc le parcours rend le bon verdict ET le bon enchaînement (conforme → certificat →
 * valorisation ; anomalie → certificat → fin ; insuffisant → fin sans certificat).
 * NON inclus dans PARCELLES : n'apparaissent ni dans le portefeuille coopérative ni exportateur.
 */
export const SCENARIOS_DEMO: Parcelle[] = [
  {
    id: "sc-conforme",
    producteurNom: "Tanoh Michel",
    numeroCartePro: "CI-CCC-024600",
    cooperative: COOP_DEMO,
    region: "Nawa · Soubré",
    superficieHa: 3.3,
    filiere: "cacao",
    geojson: polyFromLatLon([
      [5.786200, -6.649800],
      [5.786150, -6.648000],
      [5.784700, -6.648100],
      [5.784750, -6.649900],
    ]),
    statut: "conforme",
    dateVerification: "2026-07-08",
    datePivotAnalyse: "2020-12-31",
    sourcesDonnees: SOURCES,
    numeroCertificat: "AGV-2026-0600",
    referenceDDR: "DDR-CI-2026-10900",
  },
  {
    id: "sc-insuffisant",
    producteurNom: "N'Guessan Aya",
    numeroCartePro: "CI-CCC-024601",
    cooperative: COOP_DEMO,
    region: "Nawa · Buyo",
    superficieHa: 3.1,
    filiere: "cacao",
    geojson: polyFromLatLon([
      [5.802800, -6.901700],
      [5.802750, -6.899900],
      [5.801300, -6.900000],
      [5.801350, -6.901800],
    ]),
    statut: "insuffisant",
    dateVerification: "2026-07-08",
    datePivotAnalyse: "2020-12-31",
    sourcesDonnees: SOURCES,
    numeroCertificat: "AGV-2026-0601",
  },
  {
    id: "sc-anomalie",
    producteurNom: "Koffi Bertrand",
    numeroCartePro: "CI-CCC-024602",
    cooperative: COOP_DEMO,
    region: "Nawa · Soubré",
    superficieHa: 3.4,
    filiere: "cacao",
    geojson: polyFromLatLon([
      [5.705700, -6.802800],
      [5.705650, -6.800900],
      [5.704100, -6.801000],
      [5.704150, -6.802900],
    ]),
    statut: "anomalie",
    dateVerification: "2026-07-08",
    datePivotAnalyse: "2020-12-31",
    sourcesDonnees: SOURCES,
    numeroCertificat: "AGV-2026-0602",
  },
];

/* --------------------------------- Accès & agrégats --------------------------------- */
export function getParcelle(id: string): Parcelle | undefined {
  return PARCELLES.find((p) => p.id === id) ?? SCENARIOS_DEMO.find((p) => p.id === id);
}
/** Recherche par numéro de carte producteur (portefeuille réel, puis scénarios de démo). */
export function findParcelleByCarte(numero: string): Parcelle | undefined {
  return PARCELLES.find((p) => p.numeroCartePro === numero) ?? SCENARIOS_DEMO.find((p) => p.numeroCartePro === numero);
}
/**
 * Recherche par numéro de certificat pour la VÉRIFICATION PUBLIQUE (QR du PDF téléchargé).
 * Couvre le portefeuille ET les scénarios de démonstration : tout PDF que le site peut émettre
 * (p01…p45, sc-conforme AGV-2026-0600, sc-anomalie AGV-2026-0602…) doit résoudre — jamais un
 * QR imprimé qui tombe sur « introuvable ». Insensible à la casse.
 */
export function findCertificat(numero: string): Parcelle | undefined {
  const q = numero.trim().toUpperCase();
  if (!q) return undefined;
  return (
    PARCELLES.find((p) => p.numeroCertificat.toUpperCase() === q) ??
    SCENARIOS_DEMO.find((p) => p.numeroCertificat.toUpperCase() === q)
  );
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
    dossiersPartages: parcelles.filter((p) => p.dossierPartage).length,
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
/** Variante bilingue : mêmes options, locale selon la langue d'interface. */
export function formatDate(iso: string, lang: "fr" | "en" = "fr"): string {
  return new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
export const fmtTonnes = (n: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n)} t`;

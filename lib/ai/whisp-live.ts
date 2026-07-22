/**
 * Client RÉEL de l'API Whisp (FAO Open Foris — « What's in that plot? »), serveur uniquement.
 *
 * Activation : poser `WHISP_API_KEY` (compte gratuit sur https://whisp.openforis.org → clé d'API,
 * `.env.local` en local + variable d'environnement Vercel). Sans clé, rien ne change : le moteur
 * d'évaluation déterministe calibré sur la méthode Whisp reste le comportement par défaut.
 *
 * La requête reprend les MÊMES paramètres que l'interface officielle whisp.openforis.org
 * (`analysisOptions` du spec OpenAPI) : unités en hectares, données nationales Côte d'Ivoire
 * (`nationalCodes: ["ci"]`), identifiant externe = id de parcelle AGRIVO, analyse synchrone.
 * La réponse est le modèle officiel Whisp v3 : 11 indicateurs `Ind_*`, 3 catégories de risque
 * (`risk_pcrop` cultures pérennes · `risk_acrop` cultures annuelles · `risk_timber` bois) et les
 * couvertures par jeu de données (GFC, TMF, RADD, cacao ESA/FDaP…), exprimées en hectares.
 *
 * Chaque appelant DOIT garder un repli : si l'appel échoue, expire ou renvoie une réponse
 * inexploitable, on retombe sur le moteur actuel — la démonstration ne casse jamais.
 *
 * Mapping défensif vers les trois verdicts de la charte (mots figés) :
 *   risque faible → « Conforme » · risque élevé → « Anomalie détectée » ·
 *   « plus d'informations nécessaires » ou réponse ambiguë → « Données insuffisantes ».
 */
import type { Filiere, Statut } from "@/data/mock-parcelles";

const WHISP_API_BASE = process.env.WHISP_API_URL || "https://whisp.openforis.org/api";
/** L'API répond en ~8 s pour 1 polygone (mesuré) ; le serveur Whisp attend jusqu'à 60 s en sync. */
const SUBMIT_TIMEOUT_MS = 45_000;
/** Budget total (submit + sondages de file d'attente) — la route Vercel plafonne à 60 s. */
const BUDGET_TOTAL_MS = 52_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function whispLiveEnabled(): boolean {
  return Boolean(process.env.WHISP_API_KEY);
}

/* ------------------------------------------------------------------------------------------------
 * Le modèle officiel Whisp v3
 * ---------------------------------------------------------------------------------------------- */

/** Les 11 indicateurs officiels Whisp v3, dans l'ordre du site officiel (libellés neutres FR/EN). */
export const INDICATEURS_OFFICIELS: ReadonlyArray<{ code: string; fr: string; en: string }> = [
  { code: "Ind_01_treecover", fr: "Couvert arboré 2020", en: "Tree cover 2020" },
  { code: "Ind_02_commodities", fr: "Culture de rente 2020", en: "Commodities 2020" },
  { code: "Ind_03_disturbance_before_2020", fr: "Perturbation avant 2020", en: "Disturbance before 2020" },
  { code: "Ind_04_disturbance_after_2020", fr: "Perturbation après 2020", en: "Disturbance after 2020" },
  { code: "Ind_05_primary_2020", fr: "Forêt primaire 2020", en: "Primary forest 2020" },
  { code: "Ind_06_nat_reg_forest_2020", fr: "Forêt en régénération naturelle 2020", en: "Naturally regenerating forest 2020" },
  { code: "Ind_07_planted_plantations_2020", fr: "Plantations forestières 2020", en: "Planted plantations 2020" },
  { code: "Ind_08_planted_plantations_after_2020", fr: "Plantations établies après 2020", en: "Plantations established after 2020" },
  { code: "Ind_09_treecover_after_2020", fr: "Couvert arboré après 2020", en: "Tree cover after 2020" },
  { code: "Ind_10_agri_after_2020", fr: "Agriculture après 2020", en: "Agriculture after 2020" },
  { code: "Ind_11_logging_concession_before_2020", fr: "Concession forestière avant 2020", en: "Logging concession before 2020" },
];

/** Couvertures affichables (jeux de données du site officiel, valeurs en ha → % de la parcelle). */
const COUVERTURES_CANDIDATES: ReadonlyArray<{ code: string; fr: string; en: string }> = [
  { code: "GFC_TC_2020", fr: "Couvert arboré 2020 (GFC)", en: "Tree cover 2020 (GFC)" },
  { code: "nCI_Cocoa_bnetd", fr: "Cacao — carte nationale BNETD (CI)", en: "Cocoa — BNETD national map (CI)" },
  { code: "Cocoa_FDaP", fr: "Cacao détecté (FDaP)", en: "Cocoa detected (FDaP)" },
  { code: "Cocoa_ETH", fr: "Cacao détecté (ETH Zürich)", en: "Cocoa detected (ETH Zurich)" },
  { code: "Coffee_FDaP", fr: "Café détecté (FDaP)", en: "Coffee detected (FDaP)" },
  { code: "Rubber_FDaP", fr: "Hévéa détecté (FDaP)", en: "Rubber detected (FDaP)" },
  { code: "Oil_palm_FDaP", fr: "Palmier à huile détecté (FDaP)", en: "Oil palm detected (FDaP)" },
  { code: "Soy_Song_2020", fr: "Soja détecté (Song 2020)", en: "Soy detected (Song 2020)" },
  { code: "TMF_def_before_2020", fr: "Déforestation avant 2020 (TMF)", en: "Deforestation before 2020 (TMF)" },
];

/** Jeux « perturbation après le 31/12/2020 » agrégés en une seule ligne (le max des sources). */
const APRES_2020_SOURCES = [
  "TMF_def_after_2020",
  "TMF_deg_after_2020",
  "GFC_loss_after_2020",
  "RADD_after_2020",
  "GLAD-L_after_2020",
  "GLAD-S2_after_2020",
  "MODIS_fire_after_2020",
] as const;

export const CODE_PERTURBATION_APRES_2020 = "perturbation_apres_2020";

export interface WhispIndicateur {
  code: string;
  fr: string;
  en: string;
  valeur: "yes" | "no";
}

export interface WhispCouverture {
  code: string;
  fr: string;
  en: string;
  /** Pourcentage (entier) de la surface de la parcelle. */
  pct: number;
}

export interface WhispRisques {
  pcrop: string | null;
  acrop: string | null;
  timber: string | null;
}

/** Détail officiel d'une analyse Whisp en direct (affiché tel quel, jamais simulé). */
export interface WhispLiveDetail {
  indicateurs: WhispIndicateur[];
  risques: WhispRisques;
  surfaceHa: number | null;
  pays: string | null;
  region: string | null;
  couvertures: WhispCouverture[];
  version: string | null;
  horodatage: string | null;
  /** Jeton d'analyse Whisp (traçabilité de l'exécution). */
  token: string | null;
}

/* ------------------------------------------------------------------------------------------------
 * Requête aux paramètres officiels
 * ---------------------------------------------------------------------------------------------- */

/**
 * Corps de requête identique à celui de l'interface officielle : FeatureCollection WGS-84 +
 * `analysisOptions` (unités ha, données nationales CI, id externe AGRIVO, synchrone).
 */
export function construireRequete(ring: number[][], parcelleId?: string): unknown {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: parcelleId ? { agrivoId: parcelleId } : {},
        geometry: { type: "Polygon", coordinates: [ring] },
      },
    ],
    analysisOptions: {
      unitType: "ha",
      nationalCodes: ["ci"],
      externalIdColumn: parcelleId ? "agrivoId" : undefined,
      async: false,
      geometryAuditTrail: false,
    },
  };
}

/* ------------------------------------------------------------------------------------------------
 * Parseur du schéma réel
 * ---------------------------------------------------------------------------------------------- */

function nombre(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function chaine(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

/** % (entier, borné 0-100) d'une valeur en hectares rapportée à la surface de la parcelle. */
export function pct(valeurHa: unknown, surfaceHa: unknown): number | null {
  const v = nombre(valeurHa);
  const s = nombre(surfaceHa);
  if (v === null || s === null || !(s > 0)) return null;
  return Math.min(100, Math.max(0, Math.round((v / s) * 100)));
}

/** Extrait le détail officiel (11 indicateurs, 3 risques, couvertures…) des properties d'un plot. */
export function parseWhispFeature(props: Record<string, unknown>, token?: string | null): WhispLiveDetail {
  const surfaceHa = nombre(props.Area);

  const indicateurs: WhispIndicateur[] = [];
  for (const ind of INDICATEURS_OFFICIELS) {
    const v = chaine(props[ind.code])?.toLowerCase();
    if (v === "yes" || v === "no") indicateurs.push({ ...ind, valeur: v });
  }

  const couvertures: WhispCouverture[] = [];
  for (const c of COUVERTURES_CANDIDATES) {
    const p = pct(props[c.code], surfaceHa);
    if (p !== null && p > 0) couvertures.push({ ...c, pct: p });
  }
  // La ligne « perturbation après 2020 » est TOUJOURS présente (même à 0 % : c'est le verdict RDUE).
  const apres = APRES_2020_SOURCES.map((code) => pct(props[code], surfaceHa)).filter(
    (p): p is number => p !== null,
  );
  if (apres.length > 0) {
    couvertures.push({
      code: CODE_PERTURBATION_APRES_2020,
      fr: "Perturbation après le 31/12/2020 (TMF · GFC · RADD · GLAD)",
      en: "Disturbance after 31/12/2020 (TMF · GFC · RADD · GLAD)",
      pct: Math.max(...apres),
    });
  }

  const meta =
    props.whisp_processing_metadata && typeof props.whisp_processing_metadata === "object"
      ? (props.whisp_processing_metadata as Record<string, unknown>)
      : {};

  return {
    indicateurs,
    risques: {
      pcrop: chaine(props.risk_pcrop),
      acrop: chaine(props.risk_acrop),
      timber: chaine(props.risk_timber),
    },
    surfaceHa,
    pays: chaine(props.Country),
    region: chaine(props.Admin_Level_1),
    couvertures,
    version: chaine(meta.whisp_version),
    horodatage: chaine(meta.processing_timestamp_utc),
    token: token ?? null,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Verdict par filière
 * ---------------------------------------------------------------------------------------------- */

/** Mappe la catégorie de risque Whisp vers un verdict de la charte. Toute ambiguïté → insuffisant. */
export function risqueVersVerdict(risque: string | null): Statut {
  if (!risque) return "insuffisant";
  // Accents retirés AVANT l'appariement : \b ne fonctionne qu'avec les mots ASCII (« élevé » → « eleve »).
  const r = risque.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/\b(low|faible|no[_\s-]?risk)\b/.test(r)) return "conforme";
  if (/\b(high|eleve)\b/.test(r)) return "anomalie";
  // « more info needed », « unknown », valeurs inattendues : prudence de la charte.
  return "insuffisant";
}

/** Le pire des trois risques (jamais de faux « Conforme ») : anomalie > insuffisant > conforme. */
export function pireRisque(risques: WhispRisques): string | null {
  const valeurs = [risques.pcrop, risques.acrop, risques.timber].filter(
    (v): v is string => typeof v === "string" && v.trim() !== "",
  );
  if (valeurs.length === 0) return null;
  const verdicts = valeurs.map(risqueVersVerdict);
  const iAnomalie = verdicts.indexOf("anomalie");
  if (iAnomalie !== -1) return valeurs[iAnomalie];
  const iInsuffisant = verdicts.indexOf("insuffisant");
  if (iInsuffisant !== -1) return valeurs[iInsuffisant];
  return valeurs[0];
}

/**
 * Catégorie de risque officielle applicable à la filière : cultures pérennes (cacao, café, hévéa,
 * palmier) → `risk_pcrop` ; soja → `risk_acrop` ; bois → `risk_timber` ; bovins ou filière
 * inconnue → le pire des trois (prudence de la charte).
 */
export function risquePourFiliere(risques: WhispRisques, filiere?: Filiere | null): string | null {
  if (filiere === "cacao" || filiere === "cafe" || filiere === "hevea" || filiere === "palmier") {
    return risques.pcrop ?? pireRisque(risques);
  }
  if (filiere === "soja") return risques.acrop ?? pireRisque(risques);
  if (filiere === "bois") return risques.timber ?? pireRisque(risques);
  return pireRisque(risques);
}

/**
 * Cherche récursivement, dans la réponse Whisp, la première valeur textuelle d'une clé contenant
 * « risk » (ex. risk_pcrop). Repli défensif si le schéma officiel évolue.
 */
export function extraireRisque(data: unknown, profondeur = 0): string | null {
  if (data == null || profondeur > 6) return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const r = extraireRisque(item, profondeur + 1);
      if (r) return r;
    }
    return null;
  }
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const [cle, valeur] of Object.entries(obj)) {
      if (/risk/i.test(cle) && typeof valeur === "string" && valeur.trim()) return valeur;
    }
    for (const valeur of Object.values(obj)) {
      const r = extraireRisque(valeur, profondeur + 1);
      if (r) return r;
    }
  }
  return null;
}

/* ------------------------------------------------------------------------------------------------
 * Appel en direct (synchrone + file d'attente)
 * ---------------------------------------------------------------------------------------------- */

interface WhispApiResponse {
  code?: string;
  message?: string;
  data?: unknown;
  context?: { token?: string };
}

function tokenDe(payload: WhispApiResponse): string | null {
  const dataToken =
    payload.data && typeof payload.data === "object"
      ? chaine((payload.data as Record<string, unknown>).token)
      : null;
  return dataToken ?? chaine(payload.context?.token);
}

function featuresDe(payload: WhispApiResponse): Array<Record<string, unknown>> {
  const data = payload.data as Record<string, unknown> | undefined;
  const features = data && Array.isArray(data.features) ? (data.features as unknown[]) : [];
  return features.filter((f): f is Record<string, unknown> => Boolean(f) && typeof f === "object");
}

export interface WhispLiveVerdict {
  statut: Statut;
  /** Catégorie brute retenue pour le verdict (tracée dans la convergence de preuves). */
  risqueBrut: string | null;
  /** Détail officiel complet (11 indicateurs, 3 risques, couvertures, version, jeton). */
  detail: WhispLiveDetail;
}

/**
 * Appelle l'API Whisp en direct sur un anneau de polygone (lon/lat, RFC 7946), aux paramètres
 * officiels. Réponse 200 = terminé ; 202 = en file → sondage de `/status/{token}` dans le budget.
 * Lève une erreur en cas d'échec — l'appelant replie sur le moteur déterministe.
 */
export async function whispLiveVerify(
  ring: number[][],
  opts: { parcelleId?: string; filiere?: Filiere | null } = {},
): Promise<WhispLiveVerdict> {
  const key = process.env.WHISP_API_KEY;
  if (!key) throw new Error("WHISP_API_KEY absent");
  const debut = Date.now();

  const res = await fetch(`${WHISP_API_BASE}/submit/geojson`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": key },
    body: JSON.stringify(construireRequete(ring, opts.parcelleId)),
    signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
  });
  if (!res.ok && res.status !== 202) {
    throw new Error(`Whisp HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  let payload = (await res.json()) as WhispApiResponse;

  // File d'attente (analysis_queued / analysis_processing) : sonder le statut jusqu'au résultat.
  while (payload.code !== "analysis_completed") {
    if (payload.code && /error|timeout|cancelled/.test(payload.code)) {
      throw new Error(`Whisp ${payload.code}: ${String(payload.message ?? "").slice(0, 200)}`);
    }
    const token = tokenDe(payload);
    if (!token || Date.now() - debut > BUDGET_TOTAL_MS) {
      throw new Error(`Whisp sans résultat dans le budget (code ${payload.code ?? "inconnu"})`);
    }
    await sleep(3_000);
    const poll = await fetch(`${WHISP_API_BASE}/status/${token}`, {
      headers: { "X-API-KEY": key },
      signal: AbortSignal.timeout(15_000),
    });
    if (!poll.ok) throw new Error(`Whisp status HTTP ${poll.status}`);
    payload = (await poll.json()) as WhispApiResponse;
  }

  const feature = featuresDe(payload)[0];
  const props =
    feature && feature.properties && typeof feature.properties === "object"
      ? (feature.properties as Record<string, unknown>)
      : {};
  const detail = parseWhispFeature(props, tokenDe(payload));

  // Verdict : catégorie officielle de la filière ; à défaut, extraction défensive (schéma évolutif).
  const risqueBrut = risquePourFiliere(detail.risques, opts.filiere) ?? extraireRisque(payload.data);
  return { statut: risqueVersVerdict(risqueBrut), risqueBrut, detail };
}

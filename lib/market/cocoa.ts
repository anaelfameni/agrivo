/**
 * Cours du cacao ICE US (New York) — module PUR (aucun "use client"), importable côté serveur,
 * client et tests. La récupération réseau vit dans la route API `app/api/market/cocoa` ; ici on ne
 * fait que NORMALISER une charge utile Yahoo Finance et calculer des repères.
 *
 * Honnêteté (charte AGRIVO) : le cours est RÉEL mais DIFFÉRÉ (~15 min) ; jamais présenté « temps
 * réel ». En cas d'indisponibilité, on sert `SNAPSHOT_FALLBACK` (dernier cours connu, `stale:true`).
 * Symbole : `CC=F` = ICE Futures U.S. Cocoa, coté en USD / tonne métrique.
 */

export type RangeCode = "1J" | "1S" | "1M" | "1A";

export interface CocoaPoint {
  /** Unix (secondes). */ t: number;
  /** Cours de clôture (USD/tonne). */ c: number;
}

export interface CocoaQuote {
  symbol: string;
  currency: string;
  exchange: string;
  /** Dernier cours (USD/tonne). */ price: number;
  /** Clôture de référence de la période. */ prevClose: number;
  changeAbs: number;
  changePct: number;
  points: CocoaPoint[];
  /** Horodatage du dernier point (Unix s). */ asOf: number;
  range: RangeCode;
  source: string;
  /** Toujours vrai : donnée différée, jamais temps réel. */ delayed: boolean;
  /** Vrai si on a servi le repli (dernier cours connu), pas le flux. */ stale: boolean;
}

/** Paramètres Yahoo (range/interval) pour chaque plage de l'UI. */
export const RANGE_PARAMS: Record<RangeCode, { range: string; interval: string }> = {
  "1J": { range: "1d", interval: "5m" },
  "1S": { range: "5d", interval: "15m" },
  "1M": { range: "1mo", interval: "1d" },
  "1A": { range: "1y", interval: "1wk" },
};

export function rangeParams(code: string): { range: string; interval: string } {
  return RANGE_PARAMS[(code as RangeCode)] ?? RANGE_PARAMS["1M"];
}

const round = (n: number, d = 0) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

/**
 * Normalise la réponse de l'API chart de Yahoo Finance en `CocoaQuote`.
 * Filtre les points sans clôture (Yahoo insère des `null` sur les séances trouées). Jette si la
 * structure est invalide — l'appelant (route API) attrape et sert le repli.
 */
export function normaliseCocoa(payload: unknown, range: RangeCode): CocoaQuote {
  const result = (payload as { chart?: { result?: unknown[] } })?.chart?.result?.[0] as
    | {
        meta?: Record<string, number | string>;
        timestamp?: number[];
        indicators?: { quote?: { close?: (number | null)[] }[] };
      }
    | undefined;
  const meta = result?.meta;
  const ts = result?.timestamp;
  const closes = result?.indicators?.quote?.[0]?.close;
  if (!meta || !Array.isArray(ts) || !Array.isArray(closes)) {
    throw new Error("cocoa: structure de charge utile inattendue");
  }

  const points: CocoaPoint[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (typeof c === "number" && Number.isFinite(c)) points.push({ t: ts[i], c: round(c, 2) });
  }
  if (points.length === 0) throw new Error("cocoa: aucune clôture exploitable");

  const last = points[points.length - 1];
  const price = round(Number(meta.regularMarketPrice ?? last.c), 2);
  // La variation décrit la SÉRIE AFFICHÉE (1er → dernier point) : cohérente pour chaque plage.
  // (Sur 1J = variation intraday ; sur 1M/1A = variation de la période.) On évite ainsi de
  // présenter un « chartPreviousClose » d'avant-fenêtre comme un mouvement quotidien.
  const prevClose = points[0].c;
  const changeAbs = round(price - prevClose, 2);
  const changePct = prevClose ? round((changeAbs / prevClose) * 100, 2) : 0;

  return {
    symbol: String(meta.symbol ?? "CC=F"),
    currency: String(meta.currency ?? "USD"),
    exchange: String(meta.fullExchangeName ?? "ICE Futures"),
    price,
    prevClose,
    changeAbs,
    changePct,
    points,
    asOf: Number(meta.regularMarketTime ?? last.t),
    range,
    source: "Yahoo Finance",
    delayed: true,
    stale: false,
  };
}

/**
 * Repli servi quand le flux est indisponible : DERNIER COURS CONNU (relevé le 13/07/2026,
 * ICE US Cocoa ~5 552 USD/t, clôture de référence 5 959). Série courte et volontairement sobre —
 * jamais présentée comme un historique en direct : l'UI l'affiche « dernier cours connu (indicatif) ».
 */
const FALLBACK_SERIES = [5959, 5880, 5810, 5760, 5690, 5620, 5590, 5552];
const FALLBACK_ASOF = Math.floor(new Date("2026-07-13T10:55:00Z").getTime() / 1000);

export function snapshotFallback(range: RangeCode = "1M"): CocoaQuote {
  const step = 86_400; // 1 jour entre points (indicatif)
  const points: CocoaPoint[] = FALLBACK_SERIES.map((c, i) => ({
    t: FALLBACK_ASOF - (FALLBACK_SERIES.length - 1 - i) * step,
    c,
  }));
  const price = FALLBACK_SERIES[FALLBACK_SERIES.length - 1];
  const prevClose = FALLBACK_SERIES[0];
  const changeAbs = round(price - prevClose, 2);
  return {
    symbol: "CC=F",
    currency: "USD",
    exchange: "ICE Futures",
    price,
    prevClose,
    changeAbs,
    changePct: round((changeAbs / prevClose) * 100, 2),
    points,
    asOf: FALLBACK_ASOF,
    range,
    source: "dernier cours connu",
    delayed: true,
    stale: true,
  };
}

/* --------------------------------------------------------------------------------------------
 * Repère « prime / décote vs ICE » — relie un prix de lot (FCFA/kg) au cours mondial.
 * FX par défaut : 1 USD ≈ 605 FCFA (le FCFA est arrimé à l'euro à 655,957 XOF/EUR ; à EUR/USD ~1,08
 * cela donne ~607). Hypothèse AFFICHÉE dans l'UI — le % est CALCULÉ, jamais inventé. Ce n'est pas un
 * prix bord champ garanti : c'est une comparaison indicative au cours terminal ICE.
 * ------------------------------------------------------------------------------------------ */
export const FX_USD_FCFA_DEFAUT = 605;

export interface PrimeVsIce {
  /** Cours ICE converti en FCFA/kg. */ iceFcfaKg: number;
  /** Écart du lot vs ICE, en %. Positif = prime, négatif = décote. */ pct: number;
  fxUsdFcfa: number;
}

export function primeVsIce(
  prixFcfaKg: number,
  iceUsdTonne: number,
  fxUsdFcfa: number = FX_USD_FCFA_DEFAUT,
): PrimeVsIce {
  const iceFcfaKg = (iceUsdTonne * fxUsdFcfa) / 1000; // USD/t → FCFA/kg
  const pct = iceFcfaKg > 0 ? round(((prixFcfaKg - iceFcfaKg) / iceFcfaKg) * 100, 1) : 0;
  return { iceFcfaKg: round(iceFcfaKg), pct, fxUsdFcfa };
}

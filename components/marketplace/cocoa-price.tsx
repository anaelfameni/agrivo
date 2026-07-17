"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Info } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { primeVsIce, type CocoaQuote, type RangeCode } from "@/lib/market/cocoa";

/* ------------------------------------------------------------------ spot (partagé) ------------------------------------------------------------------ */

/** Cache module (~60 s) : plusieurs cartes partagent une seule requête de cours spot. */
let spotCache: { at: number; p: Promise<CocoaQuote | null> } | null = null;
function fetchSpot(): Promise<CocoaQuote | null> {
  const now = Date.now();
  if (spotCache && now - spotCache.at < 60_000) return spotCache.p;
  const p = fetch("/api/market/cocoa?range=1J").then((r) => r.json() as Promise<CocoaQuote>).catch(() => null);
  spotCache = { at: now, p };
  return p;
}

/** Cours spot ICE (USD/t) partagé, pour les puces « vs ICE » du catalogue. */
export function useCocoaSpot(): number | null {
  const [price, setPrice] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    fetchSpot().then((d) => alive && d && setPrice(d.price));
    return () => { alive = false; };
  }, []);
  return price;
}

/** Puce « prime / décote vs cours ICE » d'un prix de lot (calculée, hypothèse FX affichée en tooltip). */
export function VsIceChip({ prixFcfaKg, iceUsdT, className = "" }: { prixFcfaKg: number; iceUsdT: number | null; className?: string }) {
  const { lang } = useLanguage();
  if (!iceUsdT) return null;
  const { pct, fxUsdFcfa } = primeVsIce(prixFcfaKg, iceUsdT);
  const prime = pct >= 0;
  const label = lang === "en"
    ? `${prime ? "premium" : "discount"} vs ICE`
    : `${prime ? "prime" : "décote"} vs ICE`;
  const title = lang === "en"
    ? `Indicative gap to the ICE terminal price (assumption 1 USD ≈ ${fxUsdFcfa} FCFA). Not a farmgate guarantee.`
    : `Écart indicatif au cours terminal ICE (hypothèse 1 USD ≈ ${fxUsdFcfa} FCFA). Pas un prix bord champ garanti.`;
  return (
    <span
      title={title}
      className={`num inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.68rem] font-semibold ${prime ? "bg-green-signal/10 text-green-signal" : "bg-amber-cacao/10 text-amber-cacao"} ${className}`}
    >
      {prime ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {sign(pct)}{pct.toLocaleString(lang === "en" ? "en" : "fr-FR")} % {label}
    </span>
  );
}

/* ------------------------------------------------------------------ data hook ------------------------------------------------------------------ */

/** Récupère le cours (via la route API cache/repli). Ne jette jamais : en dernier recours, `null`.
 *  `loading` est DÉRIVÉ (la donnée en main correspond-elle à la plage demandée ?), pas de setState
 *  synchrone dans l'effet. Exporté : le terminal du héros (cocoa-terminal) le réutilise. */
export function useCocoa(range: RangeCode) {
  const [state, setState] = useState<{ range: RangeCode; data: CocoaQuote | null } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/api/market/cocoa?range=${range}`)
      .then((r) => r.json())
      .then((d: CocoaQuote) => alive && setState({ range, data: d }))
      .catch(() => alive && setState({ range, data: null }));
    return () => {
      alive = false;
    };
  }, [range]);
  const ready = state?.range === range;
  return { data: ready ? state!.data : null, loading: !ready };
}

const nf = (n: number, lang: "fr" | "en") => Math.round(n).toLocaleString(lang === "en" ? "en" : "fr-FR");
const sign = (n: number) => (n >= 0 ? "+" : "");

/* ------------------------------------------------------------------ ticker ------------------------------------------------------------------ */

/** Ruban compact du cours (héros). Pastille « ICE US · différé ». */
export function CocoaTicker({ className = "" }: { className?: string }) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const { data, loading } = useCocoa("1J");

  if (loading || !data) {
    return (
      <span className={`inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3.5 py-1.5 text-sm ${className}`}>
        <Activity size={14} className="animate-pulse text-green-signal" />
        <span className="h-3 w-40 animate-pulse rounded bg-stone-100" />
      </span>
    );
  }
  const up = data.changePct >= 0;
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full border border-black/[0.07] bg-white px-3.5 py-1.5 text-sm shadow-sm ${className}`}>
      <span className="font-semibold text-forest-950">{l === "en" ? "Cocoa" : "Cacao"} ICE US</span>
      <span className="num font-semibold text-forest-950">{nf(data.price, l)} <span className="text-forest-950/50">$/t</span></span>
      <span className={`num inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${up ? "bg-green-signal/10 text-green-signal" : "bg-red-block/10 text-red-block"}`}>
        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {sign(data.changePct)}{data.changePct.toLocaleString(l === "en" ? "en" : "fr-FR")} %
      </span>
      <span className="text-[0.68rem] font-medium text-forest-950/40">{data.stale ? (l === "en" ? "last known" : "dernier cours") : (l === "en" ? "delayed" : "différé")}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ chart ------------------------------------------------------------------ */

const RANGES: RangeCode[] = ["1J", "1S", "1M", "1A"];
const RANGE_LABEL: Record<RangeCode, { fr: string; en: string }> = {
  "1J": { fr: "1J", en: "1D" },
  "1S": { fr: "1S", en: "1W" },
  "1M": { fr: "1M", en: "1M" },
  "1A": { fr: "1A", en: "1Y" },
};

const W = 720;
const H = 240;
const PAD_TOP = 16;
const PAD_BOTTOM = 22;
// Gouttière gauche : réservée aux étiquettes de l'axe Y (prix). L'axe préservant son ratio
// (pas de preserveAspectRatio="none" ici), le texte SVG ne se déforme pas.
const PAD_LEFT = 52;
const PAD_RIGHT = 10;
const PLOT_TOP = PAD_TOP;
const PLOT_BOTTOM = H - PAD_BOTTOM;

function buildPaths(points: { t: number; c: number }[]) {
  const values = points.map((p) => p.c);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const n = points.length;
  const x = (i: number) => (n <= 1 ? PAD_LEFT : PAD_LEFT + (i / (n - 1)) * (W - PAD_LEFT - PAD_RIGHT));
  const y = (c: number) => PLOT_TOP + (1 - (c - min) / span) * (PLOT_BOTTOM - PLOT_TOP);
  const coords = points.map((p, i) => ({ x: x(i), y: y(p.c) }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
  const area = `${line} L ${(W - PAD_RIGHT).toFixed(2)} ${H} L ${PAD_LEFT.toFixed(2)} ${H} Z`;
  return { line, area, coords, min, max };
}

/* ------------------------------------------------------------------ sparkline ------------------------------------------------------------------ */

/** Fractions verticales du tracé Sparkline : y = SPARK_TOP + f * SPARK_BAND (f∈[0,1]).
 *  Exportées pour que le parent aligne ses labels d'axe Y sur les lignes de grille. */
export const SPARK_TOP = 8;
export const SPARK_BAND = 84;

/** Chemin lissé (Catmull-Rom → Bézier cubique) : courbe uniforme qui passe par tous les
 *  points, sans angles. `k` module la tension (1/6 ≈ Catmull-Rom standard). */
function smoothPath(coords: { x: number; y: number }[]): string {
  const n = coords.length;
  if (n < 3) return coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
  const k = 1 / 6;
  let d = `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(n - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) * k;
    const c1y = p1.y + (p2.y - p0.y) * k;
    const c2x = p2.x - (p3.x - p1.x) * k;
    const c2y = p2.y - (p3.y - p1.y) * k;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/** Sparkline fluide pour le terminal du héros : le SVG s'étire dans son conteneur
 *  (`preserveAspectRatio="none"`), la hauteur est donnée par la classe (ex. `h-24`).
 *  Courbe LISSÉE (Catmull-Rom, uniforme), aire dégradée, tracé qui se dessine, halo doux ;
 *  en option, lignes de grille aux fractions `yTicks` (alignées avec l'axe Y du parent) et
 *  point terminal pulsant (HTML superposé pour ne pas être déformé par l'étirement du
 *  viewBox). Pas de crosshair : la lecture détaillée vit dans le grand graphique. */
export function Sparkline({
  points,
  up,
  className = "",
  id = "spark",
  showEndDot = false,
  yTicks,
  smooth = true,
}: {
  points: { t: number; c: number }[];
  up: boolean;
  className?: string;
  id?: string;
  showEndDot?: boolean;
  /** Fractions 0..1 de la bande du tracé où poser une ligne de grille. */
  yTicks?: number[];
  smooth?: boolean;
}) {
  const reduce = useReducedMotion();
  const stroke = up ? "var(--color-green-signal)" : "var(--color-red-block)";
  const d = useMemo(() => {
    if (points.length < 2) return null;
    const values = points.map((p) => p.c);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const n = points.length;
    const coords = points.map((p, i) => ({
      x: (i / (n - 1)) * 100,
      y: SPARK_TOP + (1 - (p.c - min) / span) * SPARK_BAND,
    }));
    const line = smooth
      ? smoothPath(coords)
      : coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
    return { line, area: `${line} L 100 100 L 0 100 Z`, last: coords[coords.length - 1] };
  }, [points, smooth]);
  if (!d) return null;
  return (
    <div className={`relative ${className}`} aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks?.map((f) => {
          const y = SPARK_TOP + f * SPARK_BAND;
          return <line key={f} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />;
        })}
        <motion.path
          d={d.area}
          fill={`url(#${id}-fill)`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        {/* halo : même tracé, plus épais et translucide, sous la ligne nette */}
        <motion.path
          d={d.line}
          fill="none"
          stroke={stroke}
          strokeOpacity="0.35"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <motion.path
          d={d.line}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      {/* Point terminal « live » : HTML superposé (un cercle SVG serait déformé par l'étirement) */}
      {showEndDot && (
        <motion.span
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${d.last.x}%`, top: `${d.last.y}%` }}
          initial={reduce ? false : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduce ? 0 : 1.0, duration: 0.3, ease: "easeOut" }}
        >
          {!reduce && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: stroke }}
              animate={{ scale: [1, 3], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <span className="relative block h-2 w-2 rounded-full ring-2 ring-white/30" style={{ background: stroke }} />
        </motion.span>
      )}
    </div>
  );
}

export function fmtDate(t: number, range: RangeCode, lang: "fr" | "en") {
  const d = new Date(t * 1000);
  const loc = lang === "en" ? "en-GB" : "fr-FR";
  if (range === "1J") return d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString(loc, { day: "numeric", month: "short" });
}

const TR = {
  fr: {
    title: "Cacao · ICE US (New York)",
    sub: "Cours du contrat à terme CC=F, en dollars par tonne.",
    srcLive: "ICE US · CC=F · différé ~15 min · Yahoo Finance",
    srcStale: "Dernier cours connu (indicatif) : flux momentanément indisponible.",
    loading: "Chargement du cours…",
    yTitle: "Prix (USD / tonne)",
    xTitle: "Temps sur la plage choisie",
    legend: "Lecture : l'axe vertical indique le prix en dollars par tonne, l'axe horizontal le temps sur la plage sélectionnée (1J à 1A). Survolez la courbe pour lire le prix à une date précise.",
  },
  en: {
    title: "Cocoa · ICE US (New York)",
    sub: "CC=F futures price, in US dollars per tonne.",
    srcLive: "ICE US · CC=F · delayed ~15 min · Yahoo Finance",
    srcStale: "Last known price (indicative): feed momentarily unavailable.",
    loading: "Loading price…",
    yTitle: "Price (USD / tonne)",
    xTitle: "Time over the selected range",
    legend: "How to read it: the vertical axis shows the price in US dollars per tonne, the horizontal axis shows time over the selected range (1D to 1Y). Hover the curve to read the price on a given date.",
  },
} as const;

/** Graphique du cours cacao ICE : SVG custom animé (tracé qui se dessine + survol).
 *  `tone="dark"` : version panneau glass pour les sections sombres. */
export function CocoaChart({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const dark = tone === "dark";
  const reduce = useReducedMotion();
  const [range, setRange] = useState<RangeCode>("1M");
  const { data, loading } = useCocoa(range);
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const paths = useMemo(() => (data && data.points.length > 1 ? buildPaths(data.points) : null), [data]);
  const up = (data?.changePct ?? 0) >= 0;
  const stroke = up ? "var(--color-green-signal)" : "var(--color-red-block)";
  const upTxt = up ? (dark ? "text-emerald-400" : "text-green-signal") : (dark ? "text-red-400" : "text-red-block");

  const onMove = (clientX: number) => {
    if (!wrapRef.current || !data) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setHover(Math.round(frac * (data.points.length - 1)));
  };

  const hoverPoint = hover != null && data ? data.points[hover] : null;
  const hoverX = hover != null && paths ? (paths.coords[hover].x / W) * 100 : 0;
  const hoverY = hover != null && paths ? (paths.coords[hover].y / H) * 100 : 0;

  return (
    <div className={`${dark ? "liquid-glass-strong rounded-3xl" : "rounded-3xl border border-black/[0.07] bg-white shadow-sm"} p-6 md:p-8 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-signal">
            <Activity size={18} />
            <h3 className={`font-display text-lg font-semibold ${dark ? "text-white" : "text-forest-950"}`}>{t.title}</h3>
          </div>
          <p className={`mt-1 text-sm ${dark ? "text-white/55" : "text-forest-950/55"}`}>{t.sub}</p>
        </div>
        <div className="flex items-center gap-4">
          {data && (
            <div className="text-right">
              <p className={`num text-2xl font-bold ${dark ? "text-white" : "text-forest-950"}`}>{nf(data.price, l)} <span className={`text-base font-semibold ${dark ? "text-white/45" : "text-forest-950/45"}`}>$/t</span></p>
              <p className={`num inline-flex items-center gap-1 text-sm font-semibold ${upTxt}`}>
                {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {sign(data.changeAbs)}{nf(data.changeAbs, l)} ({sign(data.changePct)}{data.changePct.toLocaleString(l === "en" ? "en" : "fr-FR")} %)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle de plage */}
      <div className={`mt-5 inline-flex rounded-full p-1 ${dark ? "border border-white/10 bg-white/[0.06]" : "border border-black/[0.07] bg-ivory"}`}>
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => { setRange(r); setHover(null); }}
            aria-pressed={range === r}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              range === r
                ? dark ? "bg-green-signal text-white" : "bg-forest-950 text-white"
                : dark ? "text-white/60 hover:text-white" : "text-forest-950/60 hover:text-forest-950"
            }`}
          >
            {RANGE_LABEL[r][l]}
          </button>
        ))}
      </div>

      {/* Zone graphique */}
      <div
        ref={wrapRef}
        className="relative mt-5 select-none"
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => onMove(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
      >
        {loading || !paths ? (
          <div className={`h-[200px] w-full animate-pulse rounded-2xl md:h-[240px] ${dark ? "bg-white/[0.06]" : "bg-ivory"}`} aria-hidden />
        ) : (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="img" aria-label={`${t.title} : ${nf(data!.price, l)} USD/t`}>
              <defs>
                <linearGradient id="cocoa-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={dark ? "0.28" : "0.20"} />
                  <stop offset="100%" stopColor={stroke} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Axe Y : lignes de repère + étiquettes de prix (haut = max, milieu, bas = min) */}
              {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                const yLine = PLOT_TOP + f * (PLOT_BOTTOM - PLOT_TOP);
                const price = paths.max - f * (paths.max - paths.min);
                const labelled = f === 0 || f === 0.5 || f === 1;
                return (
                  <g key={f}>
                    <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={yLine} y2={yLine} stroke={dark ? "rgba(255,255,255,0.08)" : "var(--color-stone-100)"} strokeWidth="1" />
                    {labelled && (
                      <text x={PAD_LEFT - 8} y={yLine} textAnchor="end" dominantBaseline="middle" fontSize="12" className="num" fill={dark ? "rgba(255,255,255,0.5)" : "var(--color-stone-400)"}>
                        {nf(price, l)}
                      </text>
                    )}
                  </g>
                );
              })}
              {/* Titre de l'axe Y (vertical) */}
              <text transform={`translate(13 ${(PLOT_TOP + PLOT_BOTTOM) / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fill={dark ? "rgba(255,255,255,0.55)" : "var(--color-forest-950)"} fillOpacity={dark ? 1 : 0.55}>
                {t.yTitle}
              </text>
              <motion.path
                key={`area-${range}-${data!.stale}`}
                d={paths.area}
                fill="url(#cocoa-fill)"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <motion.path
                key={`line-${range}-${data!.stale}`}
                d={paths.line}
                fill="none"
                stroke={stroke}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
              {/* crosshair + point survolé */}
              {hover != null && (
                <>
                  <line x1={paths.coords[hover].x} x2={paths.coords[hover].x} y1={PAD_TOP} y2={H - PAD_BOTTOM} stroke={dark ? "rgba(255,255,255,0.35)" : "var(--color-stone-400)"} strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx={paths.coords[hover].x} cy={paths.coords[hover].y} r="5" fill={stroke} stroke={dark ? "#0a1f14" : "#fff"} strokeWidth="2" />
                </>
              )}
            </svg>

            {/* Axe X : bornes de date (alignées sur la zone tracée) + milieu + titre */}
            <div
              className={`mt-1 flex justify-between text-[0.68rem] ${dark ? "text-white/45" : "text-forest-950/45"}`}
              style={{ paddingLeft: `${(PAD_LEFT / W) * 100}%`, paddingRight: `${(PAD_RIGHT / W) * 100}%` }}
            >
              <span>{fmtDate(data!.points[0].t, range, l)}</span>
              <span>{fmtDate(data!.points[Math.floor((data!.points.length - 1) / 2)].t, range, l)}</span>
              <span>{fmtDate(data!.points[data!.points.length - 1].t, range, l)}</span>
            </div>
            <p className={`mt-0.5 text-center text-[0.68rem] font-medium ${dark ? "text-white/40" : "text-forest-950/40"}`}>{t.xTitle}</p>

            {/* Tooltip HTML positionné */}
            {hoverPoint && (
              <>
                <div className="pointer-events-none absolute z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${hoverX}%`, top: `${hoverY}%`, background: stroke }} />
                <div
                  className={`pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg px-2.5 py-1.5 text-center shadow-md ${dark ? "border border-white/15 bg-forest-900/95" : "border border-black/[0.08] bg-white"}`}
                  style={{ left: `${Math.min(92, Math.max(8, hoverX))}%`, top: `${Math.max(6, hoverY - 4)}%` }}
                >
                  <p className={`num text-sm font-bold ${dark ? "text-white" : "text-forest-950"}`}>{nf(hoverPoint.c, l)} $/t</p>
                  <p className={`text-[0.66rem] ${dark ? "text-white/55" : "text-forest-950/50"}`}>{fmtDate(hoverPoint.t, range, l)}</p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Légende de lecture (axes expliqués) */}
      <p className={`mt-4 flex items-start gap-1.5 text-[0.72rem] leading-relaxed ${dark ? "text-white/55" : "text-forest-950/55"}`}>
        <Info size={12} className="mt-0.5 shrink-0" />
        {t.legend}
      </p>
      {/* Source / honnêteté */}
      <p className={`mt-2 border-t pt-3 text-[0.72rem] leading-relaxed ${dark ? "border-white/10 text-white/45" : "border-black/[0.06] text-forest-950/45"}`}>
        {data?.stale ? t.srcStale : t.srcLive}
      </p>
    </div>
  );
}

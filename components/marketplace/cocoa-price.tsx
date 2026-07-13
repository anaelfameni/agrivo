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
 *  `loading` est DÉRIVÉ (la donnée en main correspond-elle à la plage demandée ?),pas de setState
 *  synchrone dans l'effet. */
function useCocoa(range: RangeCode) {
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

function buildPaths(points: { t: number; c: number }[]) {
  const values = points.map((p) => p.c);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const n = points.length;
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * W);
  const y = (c: number) => PAD_TOP + (1 - (c - min) / span) * (H - PAD_TOP - PAD_BOTTOM);
  const coords = points.map((p, i) => ({ x: x(i), y: y(p.c) }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  return { line, area, coords, min, max };
}

function fmtDate(t: number, range: RangeCode, lang: "fr" | "en") {
  const d = new Date(t * 1000);
  const loc = lang === "en" ? "en-GB" : "fr-FR";
  if (range === "1J") return d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString(loc, { day: "numeric", month: "short" });
}

const TR = {
  fr: { title: "Cacao · ICE US (New York)", sub: "Cours du contrat à terme CC=F, en dollars par tonne.", srcLive: "ICE US · CC=F · différé ~15 min · Yahoo Finance", srcStale: "Dernier cours connu (indicatif),flux momentanément indisponible.", loading: "Chargement du cours…" },
  en: { title: "Cocoa · ICE US (New York)", sub: "CC=F futures price, in US dollars per tonne.", srcLive: "ICE US · CC=F · delayed ~15 min · Yahoo Finance", srcStale: "Last known price (indicative),feed momentarily unavailable.", loading: "Loading price…" },
} as const;

/** Graphique du cours cacao ICE,SVG custom animé (tracé qui se dessine + survol). */
export function CocoaChart({ className = "" }: { className?: string }) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion();
  const [range, setRange] = useState<RangeCode>("1M");
  const { data, loading } = useCocoa(range);
  const [hover, setHover] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const paths = useMemo(() => (data && data.points.length > 1 ? buildPaths(data.points) : null), [data]);
  const up = (data?.changePct ?? 0) >= 0;
  const stroke = up ? "var(--color-green-signal)" : "var(--color-red-block)";

  const onMove = (clientX: number) => {
    if (!wrapRef.current || !data) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setHover(Math.round(frac * (data.points.length - 1)));
  };

  const hoverPoint = hover != null && data ? data.points[hover] : null;
  const hoverX = hover != null && data && data.points.length > 1 ? (hover / (data.points.length - 1)) * 100 : 0;
  const hoverY = hover != null && paths ? (paths.coords[hover].y / H) * 100 : 0;

  return (
    <div className={`rounded-3xl border border-black/[0.07] bg-white p-6 shadow-sm md:p-8 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-signal">
            <Activity size={18} />
            <h3 className="font-display text-lg font-semibold text-forest-950">{t.title}</h3>
          </div>
          <p className="mt-1 text-sm text-forest-950/55">{t.sub}</p>
        </div>
        <div className="flex items-center gap-4">
          {data && (
            <div className="text-right">
              <p className="num text-2xl font-bold text-forest-950">{nf(data.price, l)} <span className="text-base font-semibold text-forest-950/45">$/t</span></p>
              <p className={`num inline-flex items-center gap-1 text-sm font-semibold ${up ? "text-green-signal" : "text-red-block"}`}>
                {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {sign(data.changeAbs)}{nf(data.changeAbs, l)} ({sign(data.changePct)}{data.changePct.toLocaleString(l === "en" ? "en" : "fr-FR")} %)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle de plage */}
      <div className="mt-5 inline-flex rounded-full border border-black/[0.07] bg-ivory p-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => { setRange(r); setHover(null); }}
            aria-pressed={range === r}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${range === r ? "bg-forest-950 text-white" : "text-forest-950/60 hover:text-forest-950"}`}
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
          <div className="h-[200px] w-full animate-pulse rounded-2xl bg-ivory md:h-[240px]" aria-hidden />
        ) : (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="img" aria-label={`${t.title},${nf(data!.price, l)} USD/t`}>
              <defs>
                <linearGradient id="cocoa-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity="0.20" />
                  <stop offset="100%" stopColor={stroke} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* lignes de repère horizontales discrètes */}
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1="0" x2={W} y1={PAD_TOP + f * (H - PAD_TOP - PAD_BOTTOM)} y2={PAD_TOP + f * (H - PAD_TOP - PAD_BOTTOM)} stroke="var(--color-stone-100)" strokeWidth="1" />
              ))}
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
                  <line x1={paths.coords[hover].x} x2={paths.coords[hover].x} y1={PAD_TOP} y2={H - PAD_BOTTOM} stroke="var(--color-stone-400)" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx={paths.coords[hover].x} cy={paths.coords[hover].y} r="5" fill={stroke} stroke="#fff" strokeWidth="2" />
                </>
              )}
            </svg>

            {/* Bornes de date */}
            <div className="mt-1 flex justify-between px-0.5 text-[0.68rem] text-forest-950/40">
              <span>{fmtDate(data!.points[0].t, range, l)}</span>
              <span>{fmtDate(data!.points[data!.points.length - 1].t, range, l)}</span>
            </div>

            {/* Tooltip HTML positionné */}
            {hoverPoint && (
              <>
                <div className="pointer-events-none absolute z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${hoverX}%`, top: `${hoverY}%`, background: stroke }} />
                <div
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-black/[0.08] bg-white px-2.5 py-1.5 text-center shadow-md"
                  style={{ left: `${Math.min(92, Math.max(8, hoverX))}%`, top: `${Math.max(6, hoverY - 4)}%` }}
                >
                  <p className="num text-sm font-bold text-forest-950">{nf(hoverPoint.c, l)} $/t</p>
                  <p className="text-[0.66rem] text-forest-950/50">{fmtDate(hoverPoint.t, range, l)}</p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Source / honnêteté */}
      <p className="mt-4 flex items-center gap-1.5 text-[0.72rem] leading-relaxed text-forest-950/45">
        <Info size={12} className="shrink-0" />
        {data?.stale ? t.srcStale : t.srcLive}
      </p>
    </div>
  );
}

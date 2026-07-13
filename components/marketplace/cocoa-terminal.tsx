"use client";

/**
 * Terminal du cours cacao pour le héros sombre d'AGRIVO Market (v2.5, refonte premium).
 *
 * Panneau glass « salle des marchés » : prix qui ROULE vers sa nouvelle valeur (compteur
 * animé au chargement et à chaque changement de plage), pastille de variation colorée,
 * sparkline glow avec point terminal pulsant + grille fine, chips Plus haut / Plus bas,
 * toggle 1J/1S/1M/1A à pilule glissante (layoutId + spring), inclinaison 3D au curseur.
 *
 * Honnêteté : cours réel mais DIFFÉRÉ (~15 min), jamais « temps réel » ; en repli,
 * « dernier cours connu ». Source affichée. Tout est coupé sous prefers-reduced-motion.
 */

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowDown } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { FX_USD_FCFA_DEFAUT, type RangeCode } from "@/lib/market/cocoa";
import { useCocoa, Sparkline, fmtDate, SPARK_TOP, SPARK_BAND } from "./cocoa-price";

const RANGES: RangeCode[] = ["1J", "1S", "1M", "1A"];

const TR = {
  fr: {
    title: "Cacao · ICE US",
    delayed: "différé ~15 min",
    stale: "dernier cours connu",
    ranges: { "1J": "1J", "1S": "1S", "1M": "1M", "1A": "1A" } as Record<RangeCode, string>,
    onRange: { "1J": "sur 1 jour", "1S": "sur 1 semaine", "1M": "sur 1 mois", "1A": "sur 1 an" } as Record<RangeCode, string>,
    approx: (v: string, fx: number) => `≈ ${v} FCFA/t (hypothèse 1 USD ≈ ${fx} FCFA)`,
    source: "Contrat CC=F · Yahoo Finance",
    more: "Voir le marché en détail",
    unavailable: "Cours momentanément indisponible.",
  },
  en: {
    title: "Cocoa · ICE US",
    delayed: "delayed ~15 min",
    stale: "last known price",
    ranges: { "1J": "1D", "1S": "1W", "1M": "1M", "1A": "1Y" } as Record<RangeCode, string>,
    onRange: { "1J": "over 1 day", "1S": "over 1 week", "1M": "over 1 month", "1A": "over 1 year" } as Record<RangeCode, string>,
    approx: (v: string, fx: number) => `≈ ${v} FCFA/t (assumption 1 USD ≈ ${fx} FCFA)`,
    source: "CC=F contract · Yahoo Finance",
    more: "See the market in detail",
    unavailable: "Price momentarily unavailable.",
  },
} as const;

/** Compteur « rolling » : la valeur affichée glisse vers la cible à chaque changement. */
function useRollingNumber(target: number | null, reduced: boolean): number | null {
  const [display, setDisplay] = useState<number | null>(null);
  const fromRef = useRef<number | null>(null);
  useEffect(() => {
    if (target == null) return;
    if (reduced || fromRef.current == null) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }
    const from = fromRef.current;
    fromRef.current = target;
    if (from === target) return;
    const start = performance.now();
    const DUR = 700;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DUR);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setDisplay(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return display;
}

export function CocoaTerminal({ className = "" }: { className?: string }) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const loc = l === "en" ? "en" : "fr-FR";
  const reduce = useReducedMotion() ?? false;
  const [range, setRange] = useState<RangeCode>("1M");
  const { data, loading } = useCocoa(range);

  const up = (data?.changePct ?? 0) >= 0;
  const rolled = useRollingNumber(data ? data.price : null, reduce);
  const fcfaT = data ? Math.round(data.price * FX_USD_FCFA_DEFAUT) : null;
  const hi = data ? Math.max(...data.points.map((p) => p.c)) : null;
  const lo = data ? Math.min(...data.points.map((p) => p.c)) : null;

  /* Inclinaison 3D au curseur (springs, coupée en reduced-motion). */
  const tiltRef = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 160, damping: 20 });
  const sry = useSpring(ry, { stiffness: 160, damping: 20 });
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 2 * 7);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * 5);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={tiltRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
      className={`liquid-glass-strong rounded-3xl p-6 md:p-7 ${className}`}
    >
      {/* En-tête : identité + honnêteté */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
          <span className="glow-pulse h-1.5 w-1.5 rounded-full bg-green-signal" />
          {t.title}
        </span>
        <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[0.66rem] font-medium text-white/60">
          {data?.stale ? t.stale : t.delayed}
        </span>
      </div>

      {loading || !data || rolled == null ? (
        <div className="mt-5 space-y-3" aria-hidden>
          <div className="h-12 w-52 animate-pulse rounded-xl bg-white/[0.08]" />
          <div className="h-5 w-40 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="mt-5 h-24 w-full animate-pulse rounded-2xl bg-white/[0.05] md:h-28" />
        </div>
      ) : (
        <>
          {/* Prix « rolling » + pastille de variation */}
          <div className="mt-4">
            <p className="num text-5xl font-bold tracking-tight text-white md:text-[3.4rem] md:leading-none">
              {Math.round(rolled).toLocaleString(loc)}
              <span className="ml-2 text-xl font-semibold text-white/40">$/t</span>
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className={`num inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                  up
                    ? "border border-green-signal/35 bg-green-signal/15 text-emerald-300"
                    : "border border-red-400/35 bg-red-400/15 text-red-300"
                }`}
              >
                {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {up ? "+" : ""}{data.changePct.toLocaleString(loc)} %
              </span>
              <span className="text-xs font-medium text-white/45">{t.onRange[range]}</span>
            </div>
          </div>

          {/* Graphe : courbe lissée + axe Y (prix) à droite + axe X (temps) dessous.
              Les labels sont en HTML : le SVG étiré (preserveAspectRatio none) déformerait
              du texte. Les lignes de grille et les labels partagent SPARK_TOP/SPARK_BAND. */}
          <div className="mt-4">
            <div className="grid grid-cols-[1fr_auto] gap-x-2">
              <div className="border-b border-white/10 pb-px">
                <Sparkline
                  key={`spark-${range}`}
                  points={data.points}
                  up={up}
                  id={`terminal-${range}`}
                  className="h-24 md:h-28"
                  showEndDot
                  yTicks={[0, 0.5, 1]}
                />
              </div>
              {/* Axe Y : max · milieu · min */}
              <div className="relative h-24 w-11 md:h-28" aria-hidden>
                {hi != null && lo != null &&
                  [
                    { f: 0, v: hi },
                    { f: 0.5, v: (hi + lo) / 2 },
                    { f: 1, v: lo },
                  ].map(({ f, v }) => (
                    <span
                      key={f}
                      className="num absolute right-0 -translate-y-1/2 text-[0.62rem] font-medium text-white/40"
                      style={{ top: `${SPARK_TOP + f * SPARK_BAND}%` }}
                    >
                      {Math.round(v).toLocaleString(loc)}
                    </span>
                  ))}
              </div>
            </div>
            {/* Axe X : début · milieu · fin de la plage */}
            <div className="mt-1.5 grid grid-cols-[1fr_auto]">
              <div className="flex justify-between text-[0.62rem] font-medium text-white/40" aria-hidden>
                <span>{fmtDate(data.points[0].t, range, l)}</span>
                <span>{fmtDate(data.points[Math.floor((data.points.length - 1) / 2)].t, range, l)}</span>
                <span>{fmtDate(data.points[data.points.length - 1].t, range, l)}</span>
              </div>
              <div className="w-11" />
            </div>
          </div>
        </>
      )}

      {/* Toggle de plage : pilule glissante (shared element) */}
      <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.06] p-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            aria-pressed={range === r}
            className={`relative rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${range === r ? "text-white" : "text-white/55 hover:text-white"}`}
          >
            {range === r && (
              <motion.span
                layoutId="cocoa-range-pill"
                className="absolute inset-0 rounded-full bg-green-signal shadow-[0_6px_18px_-6px_rgba(22,163,74,0.9)]"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{t.ranges[r]}</span>
          </button>
        ))}
      </div>

      {/* Pied : conversion FCFA + source + ancre marché */}
      <div className="mt-5 space-y-1.5 border-t border-white/10 pt-4">
        <p className="num text-sm font-semibold text-amber-soft">
          {fcfaT != null ? t.approx(fcfaT.toLocaleString(loc), FX_USD_FCFA_DEFAUT) : t.unavailable}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[0.68rem] text-white/40">
          <span>{t.source}</span>
          <a href="#marche" className="inline-flex items-center gap-1 font-semibold text-white/70 transition-colors hover:text-white">
            {t.more} <ArrowDown size={12} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

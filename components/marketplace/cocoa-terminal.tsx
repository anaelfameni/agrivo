"use client";

/**
 * Terminal du cours cacao pour le héros sombre d'AGRIVO Market.
 *
 * Panneau glass « salle des marchés » : prix géant, variation colorée sur la plage
 * choisie, sparkline fluide (hauteur fixe, plus de ratio écrasé), toggle 1J/1S/1M/1A
 * et conversion FCFA/t avec l'hypothèse de change affichée. La lecture détaillée
 * (crosshair, tooltip) vit dans le grand graphique de la section « Marché en direct ».
 *
 * Honnêteté : cours réel mais DIFFÉRÉ (~15 min), jamais « temps réel » ; en repli,
 * « dernier cours connu ». Source affichée.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowDown } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { FX_USD_FCFA_DEFAUT, type RangeCode } from "@/lib/market/cocoa";
import { useCocoa, Sparkline } from "./cocoa-price";

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

export function CocoaTerminal({ className = "" }: { className?: string }) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const loc = l === "en" ? "en" : "fr-FR";
  const reduce = useReducedMotion();
  const [range, setRange] = useState<RangeCode>("1M");
  const { data, loading } = useCocoa(range);

  const up = (data?.changePct ?? 0) >= 0;
  const fcfaT = data ? Math.round(data.price * FX_USD_FCFA_DEFAUT) : null;

  return (
    <div className={`liquid-glass-strong rounded-3xl p-6 md:p-7 ${className}`}>
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

      {/* Prix géant + variation */}
      {loading || !data ? (
        <div className="mt-5 space-y-3" aria-hidden>
          <div className="h-12 w-52 animate-pulse rounded-xl bg-white/[0.08]" />
          <div className="h-4 w-36 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-5 h-24 w-full animate-pulse rounded-2xl bg-white/[0.05] md:h-28" />
        </div>
      ) : (
        <>
          <motion.div
            key={`price-${range}`}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4"
          >
            <p className="num text-5xl font-bold tracking-tight text-white md:text-[3.4rem] md:leading-none">
              {Math.round(data.price).toLocaleString(loc)}
              <span className="ml-2 text-xl font-semibold text-white/40">$/t</span>
            </p>
            <p className={`num mt-2 inline-flex items-center gap-1.5 text-sm font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
              {up ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {up ? "+" : ""}{data.changePct.toLocaleString(loc)} %
              <span className="font-medium text-white/45">{t.onRange[range]}</span>
            </p>
          </motion.div>

          {/* Sparkline fluide : hauteur fixe, largeur 100 % */}
          <div className="mt-4">
            <Sparkline key={`spark-${range}`} points={data.points} up={up} id={`terminal-${range}`} className="h-24 md:h-28" />
          </div>
        </>
      )}

      {/* Toggle de plage */}
      <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.06] p-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            aria-pressed={range === r}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${range === r ? "bg-green-signal text-white" : "text-white/60 hover:text-white"}`}
          >
            {t.ranges[r]}
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
    </div>
  );
}

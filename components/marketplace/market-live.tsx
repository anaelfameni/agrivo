"use client";

/**
 * Section sombre « Marché en direct » (#marche) : le grand graphique ICE interactif
 * (variante glass sombre) + le panneau « ce que ça change pour un lot » qui relie le
 * cours mondial aux prix indicatifs des lots cacao listés (prime/décote calculée,
 * hypothèse de change affichée). Fond signature discret : halos + grain, sans le
 * HeroBg complet pour différencier la section du héros.
 */

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Info } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche } from "@/data/mock-marketplace";
import { FX_USD_FCFA_DEFAUT } from "@/lib/market/cocoa";
import { CocoaChart, VsIceChip, useCocoaSpot } from "./cocoa-price";

const EASE = [0.16, 1, 0.3, 1] as const;

const TR = {
  fr: {
    eyebrow: "Marché en direct",
    title: "Le cours mondial, relié à chaque lot.",
    sub: "Le graphique suit le contrat cacao ICE US (différé ~15 min). Chaque prix indicatif du catalogue est comparé à ce cours : la prime ou la décote est calculée, jamais inventée.",
    panel: "Ce que ça change pour un lot",
    note: (fx: number) => `Écarts indicatifs : cours différé, prix vendeur négociables. Hypothèse 1 USD ≈ ${fx} FCFA.`,
    unit: "F/kg",
    empty: "Aucun lot cacao listé pour le moment.",
  },
  en: {
    eyebrow: "Live market",
    title: "The world price, tied to every lot.",
    sub: "The chart tracks the ICE US cocoa contract (delayed ~15 min). Every indicative price in the catalogue is compared to it: the premium or discount is computed, never invented.",
    panel: "What it changes for a lot",
    note: (fx: number) => `Indicative gaps: delayed price, negotiable seller prices. Assumption 1 USD ≈ ${fx} FCFA.`,
    unit: "F/kg",
    empty: "No cocoa lot listed at the moment.",
  },
} as const;

export function MarketLive({ wrap = "mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12" }: { wrap?: string }) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion();
  const spot = useCocoaSpot();

  const lotsCacao = useMemo(
    () => lotsMarche(PARCELLES).filter((x) => x.filiere === "cacao"),
    []
  );

  return (
    <section id="marche" className="relative isolate scroll-mt-20 overflow-hidden bg-forest-950 text-white">
      {/* Fond : halos discrets + grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-[10%] top-[-30%] h-[480px] w-[480px] rounded-full bg-green-signal/15 blur-[120px]" />
        <div className="absolute bottom-[-35%] right-[-8%] h-[420px] w-[420px] rounded-full bg-amber-cacao/10 blur-[120px]" />
        <div className="grain absolute inset-0 opacity-[0.05]" />
      </div>

      <div className={`${wrap} py-20 md:py-24`}>
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 22 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-2xl"
        >
          <span className="eyebrow text-green-signal">{t.eyebrow}</span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">{t.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/65">{t.sub}</p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Grand graphique interactif (glass sombre) */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 26 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <CocoaChart tone="dark" />
          </motion.div>

          {/* Panneau : lots cacao vs ICE */}
          <motion.aside
            initial={reduce ? undefined : "hidden"}
            whileInView={reduce ? undefined : "show"}
            viewport={{ once: true, margin: "-10% 0px" }}
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            className="liquid-glass-strong flex flex-col rounded-3xl p-6 md:p-7"
          >
            <motion.h3
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
              className="font-display text-lg font-semibold text-white"
            >
              {t.panel}
            </motion.h3>

            <div className="mt-4 flex-1 space-y-2.5">
              {lotsCacao.length === 0 && <p className="text-sm text-white/55">{t.empty}</p>}
              {lotsCacao.map((lot) => (
                <motion.div
                  key={lot.ref}
                  variants={{ hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } } }}
                >
                  <Link
                    href={`/marketplace/lot/${lot.ref}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-colors hover:border-green-signal/40 hover:bg-white/[0.07]"
                  >
                    <div className="min-w-0">
                      <p className="num truncate text-xs font-semibold text-white/85">{lot.ref}</p>
                      <p className="num mt-0.5 text-sm font-bold text-white">
                        {lot.prixIndicatifFcfaKg.toLocaleString(l === "en" ? "en" : "fr-FR")} <span className="text-xs font-medium text-white/45">{t.unit}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <VsIceChip prixFcfaKg={lot.prixIndicatifFcfaKg} iceUsdT={spot} />
                      <ArrowUpRight size={15} className="text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-green-signal" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.p
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } }}
              className="mt-5 flex items-start gap-1.5 border-t border-white/10 pt-4 text-[0.7rem] leading-relaxed text-white/45"
            >
              <Info size={12} className="mt-0.5 shrink-0" />
              {t.note(FX_USD_FCFA_DEFAUT)}
            </motion.p>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

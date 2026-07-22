"use client";

/**
 * Bandeau stats « bento » sous le héros : chiffres animés du marché (lots scellés,
 * tonnes conformes, coopératives, régions) + tuile spot cacao convertie en FCFA/kg
 * (flux différé, hypothèse FX affichée ; repli « dernier cours connu »).
 * Remplace la rangée de stats qui vivait dans le héros en v2.3.
 */

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Boxes, Scale, Building2, MapPin, Activity } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { StatNumber } from "@/components/ui/stat-number";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche } from "@/data/mock-marketplace";
import { FX_USD_FCFA_DEFAUT } from "@/lib/market/cocoa";
import { useCocoaSpot } from "./cocoa-price";

const EASE = [0.16, 1, 0.3, 1] as const;

const TR = {
  fr: {
    lots: "Lots scellés en vente",
    tonnes: "Tonnes conformes",
    coops: "Coopératives d'origine",
    regions: "Régions couvertes",
    spot: "Cacao ICE converti",
    spotUnit: "FCFA/kg",
    spotNote: (fx: number) => `différé · 1 USD ≈ ${fx} F`,
    spotStale: "dernier cours connu",
  },
  en: {
    lots: "Sealed lots for sale",
    tonnes: "Compliant tonnes",
    coops: "Origin cooperatives",
    regions: "Regions covered",
    spot: "ICE cocoa converted",
    spotUnit: "FCFA/kg",
    spotNote: (fx: number) => `delayed · 1 USD ≈ ${fx} F`,
    spotStale: "last known price",
  },
} as const;

export function MarketStats({ wrap = "mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12" }: { wrap?: string }) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion();
  const spot = useCocoaSpot();

  const stats = useMemo(() => {
    const lots = lotsMarche(PARCELLES);
    const scelles = lots.filter((x) => x.sceau.statut === "verifie");
    return {
      lots: scelles.length,
      tonnes: Math.round(scelles.reduce((s, x) => s + x.tonnage, 0)),
      coops: new Set(lots.flatMap((x) => x.cooperatives)).size,
      regions: new Set(lots.flatMap((x) => x.regions)).size,
    };
  }, []);

  /** Spot ICE USD/t → FCFA/kg (fx / 1000), arrondi. */
  const spotFcfaKg = spot != null ? Math.round((spot * FX_USD_FCFA_DEFAUT) / 1000) : null;

  const tiles = [
    { Icon: Boxes, v: stats.lots, k: t.lots },
    { Icon: Scale, v: stats.tonnes, k: t.tonnes },
    { Icon: Building2, v: stats.coops, k: t.coops },
    { Icon: MapPin, v: stats.regions, k: t.regions },
  ];

  return (
    <section className="border-b border-black/[0.06] bg-white">
      <div className={`${wrap} py-8 md:py-10`}>
        <motion.dl
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, margin: "-8% 0px" }}
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4"
        >
          {tiles.map((s) => (
            <motion.div
              key={s.k}
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
              className="group rounded-2xl border border-black/[0.06] bg-ivory p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-signal/25 hover:shadow-[0_18px_40px_-24px_rgba(10,31,20,0.4)]"
            >
              <s.Icon size={18} className="text-green-signal" />
              <StatNumber value={s.v} className="num mt-3 block text-3xl font-bold text-forest-950" />
              <dd className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-forest-950/45">{s.k}</dd>
            </motion.div>
          ))}

          {/* Tuile spot cacao (différé, conversion affichée) */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
            className="col-span-2 rounded-2xl border border-green-signal/20 bg-gradient-to-br from-green-signal/[0.08] to-ivory p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(22,163,74,0.45)] md:col-span-1"
          >
            <Activity size={18} className="text-green-signal" />
            {spotFcfaKg != null ? (
              <StatNumber value={spotFcfaKg} suffix={` ${t.spotUnit}`} className="num mt-3 block text-3xl font-bold text-forest-950" />
            ) : (
              <span className="mt-3 block h-8 w-28 animate-pulse rounded bg-black/[0.06]" aria-hidden />
            )}
            <dd className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-forest-950/45">
              {t.spot} <span className="normal-case text-forest-950/35">· {t.spotNote(FX_USD_FCFA_DEFAUT)}</span>
            </dd>
          </motion.div>
        </motion.dl>
      </div>
    </section>
  );
}

"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, Ship, Handshake, MapPin } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche } from "@/data/mock-marketplace";

/**
 * Ticker d'activité du marché — ruban défilant « place de marché vivante ». Les événements sont
 * DÉRIVÉS des lots réels mais volontairement ILLUSTRATIFS (libellé explicite) : aucune transaction
 * réelle n'a lieu sur cette version. Défilement en boucle, pause au survol, coupé si reduced-motion.
 */
const TR = {
  fr: {
    label: "Activité (illustratif)",
    sealed: (n: string, r: string) => `Lot scellé — ${n} · ${r}`,
    listed: (n: string, r: string) => `Nouveau lot au catalogue — ${n} · ${r}`,
    reserved: (n: string) => `Lot réservé — ${n}`,
  },
  en: {
    label: "Activity (illustrative)",
    sealed: (n: string, r: string) => `Lot sealed — ${n} · ${r}`,
    listed: (n: string, r: string) => `New lot listed — ${n} · ${r}`,
    reserved: (n: string) => `Lot reserved — ${n}`,
  },
} as const;

interface Item { Icon: typeof ShieldCheck; text: string }

export function ActivityTicker() {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion();

  const items = useMemo<Item[]>(() => {
    const lots = lotsMarche(PARCELLES);
    const out: Item[] = [];
    for (const lot of lots) {
      const region = lot.regions[0] ?? "";
      if (lot.statutMarche === "reserve") out.push({ Icon: Handshake, text: t.reserved(lot.nomLot.split(" · ")[0]) });
      else if (lot.sceau.statut === "verifie") out.push({ Icon: ShieldCheck, text: t.sealed(lot.nomLot.split(" · ")[0], region) });
      else out.push({ Icon: Ship, text: t.listed(lot.nomLot.split(" · ")[0], region) });
    }
    out.push({ Icon: MapPin, text: l === "en" ? "Origins across 6 regions of Côte d'Ivoire" : "Origines dans 6 régions de Côte d'Ivoire" });
    return out;
  }, [t, l]);

  const Chip = ({ it }: { it: Item }) => (
    <span className="mx-3 inline-flex items-center gap-2 whitespace-nowrap text-sm text-forest-950/70">
      <it.Icon size={14} className="text-green-signal" /> {it.text}
      <span className="ml-3 text-forest-950/20">•</span>
    </span>
  );

  return (
    <section aria-label={t.label} className="border-y border-black/[0.06] bg-white/70">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3 md:px-8">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-signal/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-green-signal">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-signal" /> {t.label}
        </span>
        <div className="group relative flex-1 overflow-hidden">
          {reduce ? (
            <div className="flex flex-wrap gap-y-1">{items.map((it, i) => <Chip key={i} it={it} />)}</div>
          ) : (
            <motion.div
              className="flex w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 28, ease: "linear", repeat: Infinity }}
              style={{ willChange: "transform" }}
            >
              {[...items, ...items].map((it, i) => <Chip key={i} it={it} />)}
            </motion.div>
          )}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-ivory to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ivory to-transparent" />
        </div>
      </div>
    </section>
  );
}

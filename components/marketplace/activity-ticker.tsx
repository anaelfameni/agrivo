"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, Ship, Handshake, MapPin } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche } from "@/data/mock-marketplace";

/**
 * Ruban d'activité du marché, COLLANT EN BAS de l'écran (sticky bottom) : toujours visible pendant
 * le défilement, il se range sous le pied de page une fois arrivé tout en bas. Les événements sont
 * dérivés des lots réels mais volontairement ILLUSTRATIFS (libellé explicite) : aucune transaction
 * réelle sur cette version. Défilement en boucle, pause au survol, coupé si reduced-motion.
 */
const TR = {
  fr: {
    label: "Activité (illustratif)",
    sealed: (n: string, r: string) => `Lot scellé · ${n} · ${r}`,
    listed: (n: string, r: string) => `Nouveau lot au catalogue · ${n} · ${r}`,
    reserved: (n: string) => `Lot réservé · ${n}`,
    origins: "Origines dans 6 régions de Côte d'Ivoire",
  },
  en: {
    label: "Activity (illustrative)",
    sealed: (n: string, r: string) => `Lot sealed · ${n} · ${r}`,
    listed: (n: string, r: string) => `New lot listed · ${n} · ${r}`,
    reserved: (n: string) => `Lot reserved · ${n}`,
    origins: "Origins across 6 regions of Côte d'Ivoire",
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
      const nom = lot.nomLot.split(" · ")[0];
      if (lot.statutMarche === "reserve") out.push({ Icon: Handshake, text: t.reserved(nom) });
      else if (lot.sceau.statut === "verifie") out.push({ Icon: ShieldCheck, text: t.sealed(nom, region) });
      else out.push({ Icon: Ship, text: t.listed(nom, region) });
    }
    out.push({ Icon: MapPin, text: t.origins });
    return out;
  }, [t]);

  const Chip = ({ it }: { it: Item }) => (
    <span className="mx-4 inline-flex items-center gap-2 whitespace-nowrap text-sm text-forest-950/75">
      <it.Icon size={14} className="text-green-signal" /> {it.text}
      <span className="ml-4 h-1 w-1 rounded-full bg-forest-950/20" />
    </span>
  );

  return (
    <div className="sticky bottom-0 z-40 border-t border-black/[0.07] bg-white/90 backdrop-blur-md">
      <div className="flex items-center gap-4 px-5 py-2.5 sm:px-8 lg:px-12">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-signal/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-green-signal">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-signal" /> {t.label}
        </span>
        <div className="relative flex-1 overflow-hidden">
          {reduce ? (
            <div className="flex flex-nowrap overflow-x-auto">{items.map((it, i) => <Chip key={i} it={it} />)}</div>
          ) : (
            <motion.div
              className="flex w-max hover:[animation-play-state:paused]"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 32, ease: "linear", repeat: Infinity }}
              style={{ willChange: "transform" }}
            >
              {[...items, ...items].map((it, i) => <Chip key={i} it={it} />)}
            </motion.div>
          )}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </div>
  );
}

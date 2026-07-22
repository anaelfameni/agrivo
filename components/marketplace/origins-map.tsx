"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Reveal } from "@/components/landing/reveal";
import { StatNumber } from "@/components/ui/stat-number";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche, parcellesDuLot } from "@/data/mock-marketplace";

const Map = dynamic(() => import("@/components/exportateur/portfolio-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-ivory" aria-hidden />,
});

/**
 * Carte des origines (v2.5, GRANDE) : la carte Leaflet occupe toute la largeur du conteneur
 * avec un panneau glass superposé (stats animées + chips des régions couvertes). En-tête de
 * section centré. `z-[500]` sur le panneau : les tuiles/overlays Leaflet vivent sous z 400.
 * Lecture seule (pas de sélection), servi côté client uniquement.
 */
const TR = {
  fr: {
    eyebrow: "Origines",
    title: "L'origine, sur la carte",
    sub: "Chaque lot du catalogue est rattaché à des parcelles géolocalisées et évaluées par satellite, réparties dans les bassins de production ivoiriens.",
    plots: "parcelles",
    regions: "régions",
  },
  en: {
    eyebrow: "Origins",
    title: "Origin, on the map",
    sub: "Every lot in the catalog is tied to geolocated plots assessed by satellite, spread across Côte d'Ivoire's production basins.",
    plots: "plots",
    regions: "regions",
  },
} as const;

export function OriginsMap({ wrap = "mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12" }: { wrap?: string }) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion();

  const { parcelles, regions } = useMemo(() => {
    const lots = lotsMarche(PARCELLES);
    const seen = new Set<string>();
    const ps = [] as ReturnType<typeof parcellesDuLot>;
    for (const lot of lots) {
      for (const p of parcellesDuLot(lot)) {
        if (!seen.has(p.id)) { seen.add(p.id); ps.push(p); }
      }
    }
    return { parcelles: ps, regions: [...new Set(lots.flatMap((x) => x.regions))].sort() };
  }, []);

  return (
    <section className={`${wrap} py-20 md:py-24`}>
      {/* En-tête centré */}
      <Reveal className="mx-auto max-w-2xl text-center">
        <div>
          <span className="eyebrow inline-flex items-center gap-1.5 text-green-signal">
            <MapPin size={13} /> {t.eyebrow}
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest-950 md:text-4xl">{t.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-forest-950/60 md:text-base">{t.sub}</p>
        </div>
      </Reveal>

      {/* Carte pleine largeur + panneau glass superposé */}
      <Reveal delay={0.08} className="mt-10">
        <div className="relative">
          <div className="h-[440px] w-full overflow-hidden rounded-3xl border border-black/[0.06] shadow-[0_30px_70px_-40px_rgba(10,31,20,0.5)] md:h-[560px] lg:h-[640px]">
            <Map parcelles={parcelles} selectedId={null} hoveredId={null} onSelect={() => {}} onHover={() => {}} />
          </div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, x: -18 }}
            whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute left-4 top-4 z-[500] hidden max-w-[300px] rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-[0_20px_50px_-25px_rgba(10,31,20,0.5)] backdrop-blur-md sm:block md:left-6 md:top-6"
          >
            <div className="flex gap-6">
              <div>
                <StatNumber value={parcelles.length} className="num block text-3xl font-bold text-forest-950" />
                <p className="mt-0.5 text-[0.68rem] font-medium uppercase tracking-wide text-forest-950/45">{t.plots}</p>
              </div>
              <div>
                <StatNumber value={regions.length} className="num block text-3xl font-bold text-forest-950" />
                <p className="mt-0.5 text-[0.68rem] font-medium uppercase tracking-wide text-forest-950/45">{t.regions}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {regions.map((r) => (
                <span key={r} className="inline-flex items-center gap-1 rounded-full border border-green-signal/25 bg-green-signal/[0.07] px-2 py-0.5 text-[0.66rem] font-semibold text-forest-950/70">
                  <span className="h-1 w-1 rounded-full bg-green-signal" /> {r}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Mobile : stats sous la carte (le panneau superposé serait trop encombrant) */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 sm:hidden">
            <p className="num text-xl font-bold text-forest-950">{parcelles.length} <span className="text-xs font-medium uppercase text-forest-950/45">{t.plots}</span></p>
            <p className="num text-xl font-bold text-forest-950">{regions.length} <span className="text-xs font-medium uppercase text-forest-950/45">{t.regions}</span></p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

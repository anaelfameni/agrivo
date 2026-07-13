"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Reveal } from "@/components/landing/reveal";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche, parcellesDuLot } from "@/data/mock-marketplace";

const Map = dynamic(() => import("@/components/exportateur/portfolio-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-ivory" aria-hidden />,
});

/**
 * Carte des origines — ancre visuellement d'où viennent les lots du catalogue. Réutilise le socle
 * Leaflet (`PortfolioMap`) avec les parcelles de TOUS les lots du marché. Lecture seule (pas de
 * sélection), servi côté client uniquement.
 */
const TR = {
  fr: { title: "L'origine, sur la carte", sub: "Chaque lot du catalogue est rattaché à des parcelles géolocalisées et évaluées par satellite, réparties dans les bassins de production ivoiriens.", plots: "parcelles", regions: "régions" },
  en: { title: "Origin, on the map", sub: "Every lot in the catalog is tied to geolocated plots assessed by satellite, spread across Côte d'Ivoire's production basins.", plots: "plots", regions: "regions" },
} as const;

export function OriginsMap() {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];

  const { parcelles, regions } = useMemo(() => {
    const lots = lotsMarche(PARCELLES);
    const seen = new Set<string>();
    const ps = [] as ReturnType<typeof parcellesDuLot>;
    for (const lot of lots) {
      for (const p of parcellesDuLot(lot)) {
        if (!seen.has(p.id)) { seen.add(p.id); ps.push(p); }
      }
    }
    return { parcelles: ps, regions: new Set(lots.flatMap((x) => x.regions)).size };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-center">
        <Reveal>
          <div>
            <div className="flex items-center gap-2 text-green-signal">
              <MapPin size={18} />
              <span className="eyebrow text-green-signal">{l === "en" ? "Origins" : "Origines"}</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold text-forest-950 md:text-3xl">{t.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-forest-950/60">{t.sub}</p>
            <div className="mt-5 flex gap-6">
              <div>
                <p className="num text-2xl font-bold text-forest-950">{parcelles.length}</p>
                <p className="text-xs uppercase tracking-wide text-forest-950/45">{t.plots}</p>
              </div>
              <div>
                <p className="num text-2xl font-bold text-forest-950">{regions}</p>
                <p className="text-xs uppercase tracking-wide text-forest-950/45">{t.regions}</p>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="h-[380px] w-full overflow-hidden rounded-3xl border border-black/[0.06] shadow-sm">
            <Map parcelles={parcelles} selectedId={null} hoveredId={null} onSelect={() => {}} onHover={() => {}} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

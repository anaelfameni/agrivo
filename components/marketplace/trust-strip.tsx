"use client";

import { Satellite, IdCard, Scale, Landmark } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Reveal } from "@/components/landing/reveal";

/**
 * Bandeau « Propulsé par » — signaux de confiance basés sur des MÉTHODES et des RÉGULATEURS réels
 * (jamais de faux témoignages ni de faux logos clients). Renforce le sérieux institutionnel.
 */
const TR = {
  fr: {
    title: "La confiance, prouvée par la méthode",
    sub: "AGRIVO ne demande pas qu'on lui fasse confiance : chaque lot s'appuie sur des sources publiques et des référentiels officiels.",
    items: [
      { Icon: Satellite, t: "Whisp · FAO", b: "Analyse satellite de déforestation (méthode Open Foris de la FAO)." },
      { Icon: IdCard, t: "Carte producteur · CCC", b: "Identité et parcelle vérifiées par le Conseil du Café-Cacao." },
      { Icon: Landmark, t: "RDUE · UE 2023/1115", b: "Aligné sur le règlement européen anti-déforestation." },
      { Icon: Scale, t: "Copernicus Sentinel-2", b: "Imagerie satellite européenne, sources ouvertes et traçables." },
    ],
  },
  en: {
    title: "Trust, proven by method",
    sub: "AGRIVO doesn't ask to be trusted: every lot relies on public sources and official frameworks.",
    items: [
      { Icon: Satellite, t: "Whisp · FAO", b: "Satellite deforestation analysis (FAO Open Foris method)." },
      { Icon: IdCard, t: "Producer card · CCC", b: "Identity and plot verified by the Coffee-Cocoa Council." },
      { Icon: Landmark, t: "EUDR · EU 2023/1115", b: "Aligned with the EU deforestation regulation." },
      { Icon: Scale, t: "Copernicus Sentinel-2", b: "European satellite imagery, open and traceable sources." },
    ],
  },
} as const;

export function TrustStrip() {
  const { lang } = useLanguage();
  const t = TR[lang === "en" ? "en" : "fr"];
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <Reveal>
        <h2 className="font-display text-2xl font-semibold text-forest-950 md:text-3xl">{t.title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-forest-950/55">{t.sub}</p>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((it, i) => (
          <Reveal key={it.t} delay={i * 0.06}>
            <div className="flex h-full items-start gap-3 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-signal/10 text-green-signal">
                <it.Icon size={19} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-forest-950">{it.t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-forest-950/55">{it.b}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

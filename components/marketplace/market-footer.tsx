"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/**
 * Pied de page de AGRIVO MARKET,thème clair, cohérent avec l'en-tête dédié.
 * Rappelle la frontière : AGRIVO fait le COMMERCE des fèves conformes, jamais le financement.
 */
const TR = {
  fr: {
    tagline: "La place de marché des lots agricoles conformes vérifiés.",
    frontier: "AGRIVO Market fait le commerce des fèves conformes,jamais le financement ni le crédit.",
    demo: "Lots de démonstration dérivés de dossiers réels. Cours ICE réel mais différé. Aucune transaction financière n'a lieu sur cette version.",
    navTitle: "Marketplace",
    browse: "Parcourir les lots",
    sell: "Vendre un lot",
    resTitle: "Ressources",
    site: "Site AGRIVO",
    method: "Méthodologie",
    rights: "Tous droits réservés.",
  },
  en: {
    tagline: "The marketplace of verified-compliant agricultural lots.",
    frontier: "AGRIVO Market trades compliant beans,never financing or credit.",
    demo: "Demonstration lots derived from real files. Real but delayed ICE price. No financial transaction takes place on this version.",
    navTitle: "Marketplace",
    browse: "Browse lots",
    sell: "Sell a lot",
    resTitle: "Resources",
    site: "AGRIVO site",
    method: "Methodology",
    rights: "All rights reserved.",
  },
} as const;

export function MarketFooter() {
  const { lang } = useLanguage();
  const t = TR[lang === "en" ? "en" : "fr"];
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-black/[0.06] bg-white">
      <div className="mx-auto w-full max-w-[1760px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-md">
            <p className="font-brand-serif text-xl not-italic text-forest-950" style={{ fontWeight: 600 }}>
              Agrivo <span className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-green-signal">Market</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-forest-950/60">{t.tagline}</p>
            <p className="mt-4 inline-flex items-start gap-2 rounded-xl border border-green-signal/20 bg-green-signal/[0.05] p-3 text-xs leading-relaxed text-forest-950/70">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-green-signal" /> {t.frontier}
            </p>
          </div>
          <nav className="flex flex-col gap-2.5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-forest-950/45">{t.navTitle}</p>
            <Link href="/marketplace" className="text-stone-500 transition-colors hover:text-forest-950">{t.browse}</Link>
            <Link href="/marketplace/vendre" className="text-stone-500 transition-colors hover:text-forest-950">{t.sell}</Link>
          </nav>
          <nav className="flex flex-col gap-2.5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-forest-950/45">{t.resTitle}</p>
            <Link href="/" className="inline-flex items-center gap-1 text-stone-500 transition-colors hover:text-forest-950">{t.site} <ArrowUpRight size={12} /></Link>
            <Link href="/methodologie" className="inline-flex items-center gap-1 text-stone-500 transition-colors hover:text-forest-950">{t.method} <ArrowUpRight size={12} /></Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-black/[0.06] pt-6 text-xs text-forest-950/40 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl">{t.demo}</p>
          <p>© {year} Agrivo. {t.rights}</p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/**
 * Pied de page de AGRIVO MARKET — sobre, sombre, cohérent avec l'en-tête dédié.
 * Rappelle la frontière : AGRIVO fait le COMMERCE des fèves conformes, jamais le financement.
 */
const TR = {
  fr: {
    tagline: "La place de marché des lots agricoles conformes vérifiés.",
    frontier: "AGRIVO Market fait le commerce des fèves conformes — jamais le financement ni le crédit.",
    demo: "Lots de démonstration dérivés de dossiers réels. Aucune transaction financière n'a lieu sur cette version.",
    browse: "Parcourir les lots",
    sell: "Vendre un lot",
    site: "Site AGRIVO",
    method: "Méthodologie",
    rights: "Tous droits réservés.",
  },
  en: {
    tagline: "The marketplace of verified-compliant agricultural lots.",
    frontier: "AGRIVO Market trades compliant beans — never financing or credit.",
    demo: "Demonstration lots derived from real files. No financial transaction takes place on this version.",
    browse: "Browse lots",
    sell: "Sell a lot",
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
    <footer className="border-t border-white/10 bg-forest-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="font-brand-serif text-xl not-italic" style={{ fontWeight: 600 }}>
              Agrivo <span className="font-display text-sm font-semibold uppercase tracking-[0.22em] text-amber-soft">Market</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{t.tagline}</p>
            <p className="mt-4 inline-flex items-start gap-2 rounded-xl border border-green-signal/25 bg-green-signal/[0.07] p-3 text-xs leading-relaxed text-white/70">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-green-signal" /> {t.frontier}
            </p>
          </div>
          <nav className="flex flex-col gap-2.5 text-sm">
            <Link href="/marketplace" className="text-white/60 transition-colors hover:text-white">{t.browse}</Link>
            <Link href="/marketplace/vendre" className="text-white/60 transition-colors hover:text-white">{t.sell}</Link>
            <Link href="/" className="inline-flex items-center gap-1 text-white/60 transition-colors hover:text-white">{t.site} <ArrowUpRight size={12} /></Link>
            <Link href="/methodologie" className="inline-flex items-center gap-1 text-white/60 transition-colors hover:text-white">{t.method} <ArrowUpRight size={12} /></Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl">{t.demo}</p>
          <p>© {year} Agrivo. {t.rights}</p>
        </div>
      </div>
    </footer>
  );
}

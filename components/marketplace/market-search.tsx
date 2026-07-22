"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/**
 * Barre de recherche du héros — LA porte d'entrée de la marketplace (« la recherche est le CTA »).
 * Contrôlée par le parent : soumettre défile vers le catalogue et applique la requête.
 */
const TR = {
  fr: { ph: "Rechercher un lot, une coopérative, une région…", go: "Rechercher", sugg: "Suggestions", chips: ["Cacao Nawa", "San-Pédro", "Café Tonkpi", "Scellés"] },
  en: { ph: "Search a lot, a cooperative, a region…", go: "Search", sugg: "Suggestions", chips: ["Cacao Nawa", "San-Pédro", "Café Tonkpi", "Sealed"] },
} as const;

export function MarketSearch({ onSubmit, tone = "light" }: { onSubmit: (q: string) => void; tone?: "light" | "dark" }) {
  const { lang } = useLanguage();
  const t = TR[lang === "en" ? "en" : "fr"];
  const [q, setQ] = useState("");
  const dark = tone === "dark";

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(q); }}
        className={`flex items-center gap-2 rounded-full p-1.5 pl-5 ${
          dark
            ? "liquid-glass shadow-[0_18px_50px_-20px_rgba(0,0,0,0.6)]"
            : "border border-black/[0.08] bg-white shadow-[0_12px_40px_-16px_rgba(10,31,20,0.35)]"
        }`}
      >
        <Search size={18} className={`shrink-0 ${dark ? "text-white/45" : "text-forest-950/40"}`} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.ph}
          aria-label={t.ph}
          className={`min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none ${
            dark ? "text-white placeholder:text-white/45" : "text-forest-950 placeholder:text-forest-950/40"
          }`}
        />
        <button type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-signal px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(22,163,74,0.8)] transition hover:brightness-110">
          <span className="hidden sm:inline">{t.go}</span> <ArrowRight size={16} />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`text-xs font-medium ${dark ? "text-white/45" : "text-forest-950/40"}`}>{t.sugg} :</span>
        {t.chips.map((c) => (
          <button
            key={c}
            onClick={() => onSubmit(c)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              dark
                ? "border border-white/15 bg-white/[0.06] text-white/75 hover:border-green-signal/60 hover:bg-green-signal/15 hover:text-white"
                : "border border-black/[0.08] bg-white text-forest-950/70 hover:border-green-signal/40 hover:text-green-signal"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, ShieldCheck, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getFiliere } from "@/config/filieres";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche, type MarketLot } from "@/data/mock-marketplace";
import { LotCard } from "@/components/marketplace/lot-card";

/**
 * Catalogue vivant de AGRIVO Market — l'acheteur est le héros. Grille de lots filtrable
 * (filière · région · sceau · recherche). Les lots scellés remontent en tête ; un lot réservé
 * ou « en préparation » reste visible mais clairement signalé (transparence de l'offre).
 */
const TR = {
  fr: {
    title: "Lots disponibles",
    lead: "Chaque lot est dérivé d'un dossier de traçabilité réel. Le sceau AGRIVO est recalculé à l'affichage — jamais affirmé sans preuve.",
    search: "Rechercher un lot, une coopérative, une région…",
    all: "Toutes filières",
    allRegions: "Toutes régions",
    sealedOnly: "Scellés uniquement",
    results: (n: number) => `${n} lot${n > 1 ? "s" : ""}`,
    empty: "Aucun lot ne correspond à ces filtres.",
    reset: "Réinitialiser",
    filters: "Filtres",
  },
  en: {
    title: "Available lots",
    lead: "Every lot is derived from a real traceability file. The AGRIVO seal is recomputed on display — never asserted without proof.",
    search: "Search a lot, a cooperative, a region…",
    all: "All commodities",
    allRegions: "All regions",
    sealedOnly: "Sealed only",
    results: (n: number) => `${n} lot${n > 1 ? "s" : ""}`,
    empty: "No lot matches these filters.",
    reset: "Reset",
    filters: "Filters",
  },
} as const;

function rank(lot: MarketLot): number {
  // Scellé & listé d'abord, puis scellé réservé, puis en préparation.
  if (lot.sceau.statut === "verifie" && lot.statutMarche === "liste") return 0;
  if (lot.sceau.statut === "verifie") return 1;
  return 2;
}

export function MarketCatalog() {
  const { lang } = useLanguage();
  const t = TR[lang === "en" ? "en" : "fr"];
  const all = useMemo(() => lotsMarche(PARCELLES).sort((a, b) => rank(a) - rank(b) || b.valeurFcfa - a.valeurFcfa), []);

  const filieres = useMemo(() => [...new Set(all.map((l) => l.filiere))], [all]);
  const regions = useMemo(() => [...new Set(all.flatMap((l) => l.regions))].sort(), [all]);

  const [filiere, setFiliere] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [sealedOnly, setSealedOnly] = useState(false);
  const [q, setQ] = useState("");

  const lots = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((l) => {
      if (filiere && l.filiere !== filiere) return false;
      if (region && !l.regions.includes(region)) return false;
      if (sealedOnly && l.sceau.statut !== "verifie") return false;
      if (needle) {
        const hay = `${l.nomLot} ${l.regions.join(" ")} ${l.cooperatives.join(" ")} ${l.filiereLabel}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [all, filiere, region, sealedOnly, q]);

  const active = Boolean(filiere || region || sealedOnly || q);

  return (
    <section id="catalogue" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 md:px-8 md:py-20">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">{t.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{t.lead}</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
          {t.results(lots.length)}
        </span>
      </div>

      {/* Barre de filtres */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search}
            className="w-full rounded-full border border-white/15 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-green-signal/60 focus:bg-white/[0.06]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/45">
            <SlidersHorizontal size={13} /> {t.filters}
          </span>

          {/* Filières */}
          <button
            onClick={() => setFiliere("")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filiere === "" ? "bg-white text-forest-950" : "border border-white/15 text-white/70 hover:border-white/35"}`}
          >
            {t.all}
          </button>
          {filieres.map((id) => {
            const f = getFiliere(id);
            const on = filiere === id;
            return (
              <button
                key={id}
                onClick={() => setFiliere(on ? "" : id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${on ? "text-forest-950" : "border border-white/15 text-white/70 hover:border-white/35"}`}
                style={on ? { background: f.couleur } : undefined}
              >
                <f.icone size={13} /> {f.label}
              </button>
            );
          })}

          {/* Région */}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 outline-none transition focus:border-green-signal/60 [&>option]:bg-forest-900"
          >
            <option value="">{t.allRegions}</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Sceau */}
          <button
            onClick={() => setSealedOnly((v) => !v)}
            aria-pressed={sealedOnly}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${sealedOnly ? "border border-green-signal/50 bg-green-signal/15 text-green-signal" : "border border-white/15 text-white/70 hover:border-white/35"}`}
          >
            <ShieldCheck size={13} /> {t.sealedOnly}
          </button>

          {active && (
            <button
              onClick={() => { setFiliere(""); setRegion(""); setSealedOnly(false); setQ(""); }}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white/50 transition hover:text-white"
            >
              <X size={13} /> {t.reset}
            </button>
          )}
        </div>
      </div>

      {/* Grille */}
      {lots.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-white/55">{t.empty}</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lots.map((lot) => (
            <LotCard key={lot.ref} lot={lot} lang={lang === "en" ? "en" : "fr"} />
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatNumber } from "@/components/ui/stat-number";
import { parcellesForCoop, portfolioStats, FILIERE_LABEL, fmtHa, formatDateFr, type Parcelle, type Statut } from "@/data/mock-parcelles";
import { FILIERES, type FiliereId } from "@/config/filieres";
import { useLanguage } from "@/components/language-provider";

// Espace coopérative : uniquement les parcelles de SA coopérative (pas le portefeuille multi-coops).
const COOP_PARCELLES = parcellesForCoop();

const PortfolioMap = dynamic(() => import("@/components/exportateur/portfolio-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-forest-950">
      <span className="glow-pulse inline-block h-2.5 w-2.5 rounded-full bg-green-signal" aria-hidden />
    </div>
  ),
});

const TR = {
  fr: {
    eyebrow: "Parcelles",
    title: "Parcelles cartographiées",
    sub: "Chaque parcelle est vérifiée par satellite et rattachée à un certificat.",
    kpis: ["Parcelles cartographiées", "Taux de conformité", "Superficie totale"],
    searchLabel: "Rechercher une parcelle",
    searchPlaceholder: "Rechercher un producteur, un n° de certificat…",
    allFilieres: "Toutes filières",
    allStatuts: "Tous statuts",
    statuts: { conforme: "Conforme", anomalie: "Anomalie détectée", insuffisant: "Données insuffisantes" },
    listTitle: "Liste des parcelles",
    mapTitle: "Carte du portefeuille",
    emptyTitle: "Aucune parcelle trouvée",
    emptyDesc: "Ajustez la recherche ou les filtres pour élargir les résultats.",
    emptyDescSearch: (q: string) => `Aucune parcelle ne correspond à « ${q} ». Vérifiez l'orthographe ou le n° de certificat.`,
    emptyDescFilters: "Aucune parcelle ne correspond aux filtres actifs.",
    emptyDescBoth: (q: string) => `Aucune parcelle pour « ${q} » avec ces filtres.`,
    emptyReset: "Effacer la recherche et les filtres",
  },
  en: {
    eyebrow: "Plots",
    title: "Mapped plots",
    sub: "Every plot is verified by satellite and linked to a certificate.",
    kpis: ["Mapped plots", "Compliance rate", "Total area"],
    searchLabel: "Search a plot",
    searchPlaceholder: "Search a farmer, a certificate number…",
    allFilieres: "All commodities",
    allStatuts: "All statuses",
    statuts: { conforme: "Compliant", anomalie: "Anomaly detected", insuffisant: "Insufficient data" },
    listTitle: "Plot list",
    mapTitle: "Portfolio map",
    emptyTitle: "No plot found",
    emptyDesc: "Adjust the search or the filters to widen the results.",
    emptyDescSearch: (q: string) => `No plot matches "${q}". Check the spelling or the certificate number.`,
    emptyDescFilters: "No plot matches the active filters.",
    emptyDescBoth: (q: string) => `No plot for "${q}" with these filters.`,
    emptyReset: "Clear search and filters",
  },
};

export default function ParcellesPage() {
  const { lang } = useLanguage();
  const t = TR[lang];
  const reduce = useReducedMotion() ?? false;
  const [query, setQuery] = useState("");
  const [filiere, setFiliere] = useState<FiliereId | "all">("all");
  const [statut, setStatut] = useState<Statut | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COOP_PARCELLES.filter((p) => {
      if (filiere !== "all" && p.filiere !== filiere) return false;
      if (statut !== "all" && p.statut !== statut) return false;
      if (q && !(p.producteurNom.toLowerCase().includes(q) || p.numeroCertificat.toLowerCase().includes(q) || p.numeroCartePro.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [query, filiere, statut]);

  const stats = useMemo(() => portfolioStats(COOP_PARCELLES), []);
  const kpis = [
    { label: t.kpis[0], value: stats.producteurs, suffix: "" },
    { label: t.kpis[1], value: stats.tauxConformite, suffix: " %" },
    { label: t.kpis[2], value: Math.round(stats.superficieHa), suffix: " ha" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl text-forest-950">{t.title}</h1>
        <p className="mt-1 text-sm text-stone-500">{t.sub}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <div key={k.label} className="card-premium relative overflow-hidden p-4 sm:p-5">
            <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-green-signal to-transparent" />
            <div className="num text-2xl font-semibold sm:text-3xl" style={{ color: i === 1 ? "var(--color-green-signal)" : "var(--color-forest-950)" }}>
              <StatNumber value={k.value} suffix={k.suffix} />
            </div>
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t.searchLabel}
            placeholder={t.searchPlaceholder}
            className="h-12 w-full rounded-full border border-black/[0.08] bg-white pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15" />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={filiere === "all"} onClick={() => setFiliere("all")}>{t.allFilieres}</FilterPill>
          {FILIERES.map((f) => (
            <FilterPill key={f.id} active={filiere === f.id} onClick={() => setFiliere(f.id)} dot={f.couleur}>{f.label}</FilterPill>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={statut === "all"} onClick={() => setStatut("all")}>{t.allStatuts}</FilterPill>
          <FilterPill active={statut === "conforme"} onClick={() => setStatut("conforme")}>{t.statuts.conforme}</FilterPill>
          <FilterPill active={statut === "anomalie"} onClick={() => setStatut("anomalie")}>{t.statuts.anomalie}</FilterPill>
          <FilterPill active={statut === "insuffisant"} onClick={() => setStatut("insuffisant")}>{t.statuts.insuffisant}</FilterPill>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="card-premium p-2 sm:p-3 xl:col-span-7">
          <div className="flex items-center justify-between px-3 py-2.5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
              <span className="h-4 w-1 rounded-full bg-green-signal" aria-hidden />
              {t.listTitle}
            </h2>
            <span className="num text-xs text-stone-400">{filtered.length} / {COOP_PARCELLES.length}</span>
          </div>
          {filtered.length === 0 ? (
            <div className="p-2">
              <EmptyState
                title={t.emptyTitle}
                description={
                  query.trim() && (filiere !== "all" || statut !== "all")
                    ? t.emptyDescBoth(query.trim())
                    : query.trim()
                      ? t.emptyDescSearch(query.trim())
                      : filiere !== "all" || statut !== "all"
                        ? t.emptyDescFilters
                        : t.emptyDesc
                }
                action={
                  (query.trim() || filiere !== "all" || statut !== "all") && (
                    <button
                      type="button"
                      onClick={() => { setQuery(""); setFiliere("all"); setStatut("all"); }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
                    >
                      {t.emptyReset}
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.03 } } }}
              className="scroll-slim flex max-h-[560px] flex-col overflow-y-auto xl:max-h-[600px]"
            >
              {filtered.map((p) => (
                <motion.li
                  key={p.id}
                  variants={{ hidden: reduce ? { opacity: 1 } : { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.3 } } }}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <ParcelleRow p={p} lang={lang} />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>

        {/* Carte satellite du portefeuille, liée à la liste (survol + clic) */}
        <div className="xl:col-span-5">
          <div className="h-[440px] overflow-hidden rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(10,31,20,0.04)] xl:sticky xl:top-24 xl:h-[680px]">
            <PortfolioMap
              parcelles={filtered}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
              onHover={setHoveredId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ParcelleRow({ p, lang }: { p: Parcelle; lang: "fr" | "en" }) {
  return (
    <Link href={`/app/parcelle/${p.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3 outline-none transition-colors hover:bg-green-signal/[0.06] focus-visible:ring-2 focus-visible:ring-green-signal/40">
      <div className="min-w-0">
        <span className="block truncate text-sm font-medium text-forest-950 transition-colors group-hover:text-green-signal">{p.producteurNom}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
          <StatusBadge statut={p.statut} size="sm" lang={lang} />
          <span className="num text-stone-400">{p.numeroCertificat}</span>
          <span aria-hidden className="text-stone-300">·</span>
          <span>{FILIERE_LABEL[p.filiere]}</span>
          <span aria-hidden className="text-stone-300">·</span>
          <span className="truncate">{p.region}</span>
          <span aria-hidden className="text-stone-300">·</span>
          <span className="num">{fmtHa(p.superficieHa)}</span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-stone-400">
        <span className="num hidden text-xs sm:inline">{formatDateFr(p.dateVerification)}</span>
        <ChevronRight size={18} className="shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-stone-500" />
      </div>
    </Link>
  );
}

function FilterPill({ active, onClick, children, dot }: { active: boolean; onClick: () => void; children: React.ReactNode; dot?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-signal ${active ? "bg-green-signal text-white shadow-[0_10px_24px_-12px_rgba(22,163,74,0.75)]" : "border border-black/[0.06] bg-white text-stone-600 hover:border-green-signal/40 hover:text-forest-950"}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />}
      {children}
    </button>
  );
}

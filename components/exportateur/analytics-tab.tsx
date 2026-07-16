"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpDown, Download, MapPin, Search, ShieldCheck, Sprout, Users, X } from "lucide-react";
import { StatNumber } from "@/components/ui/stat-number";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useLanguage } from "@/components/language-provider";
import { CampagneConformite } from "@/components/exportateur/campagne-conformite";
import {
  FILIERE_LABEL,
  fmtHa,
  formatDateFr,
  portfolioStats,
  type Filiere,
  type Parcelle,
  type Statut,
} from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;

// Carte Leaflet chargée à la demande (ssr:false) : pas de rendu serveur, bundle initial allégé.
const PortfolioMap = dynamic(() => import("@/components/exportateur/portfolio-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center rounded-2xl bg-forest-950 text-white/60">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70" aria-hidden />
    </div>
  ),
});

type SortKey = "producteur" | "cooperative" | "filiere" | "superficie" | "statut" | "date";
const STATUT_RANK: Record<Statut, number> = { conforme: 0, anomalie: 1, insuffisant: 2 };
const STATUT_KEYS: (Statut | "tous")[] = ["tous", "conforme", "anomalie", "insuffisant"];

const COPY = {
  fr: {
    statutFilters: { tous: "Tous", conforme: "Conforme", anomalie: "Anomalie détectée", insuffisant: "Données insuffisantes" },
    kpi: {
      producteurs: "Producteurs audités",
      taux: "Taux de conformité",
      superficie: "Superficie cartographiée",
      volume: "Volume validé",
    },
    repartition: "Répartition des statuts",
    searchAria: "Rechercher une parcelle, un producteur, une coopérative",
    searchPlaceholder: "Rechercher…",
    clear: "Effacer",
    filterStatut: "Filtrer par statut",
    filterFiliere: "Filtrer par filière",
    allFilieres: "Toutes filières",
    export: "Exporter GeoJSON",
    filteredView: "vue filtrée",
    tableTitle: "Parcelles du portefeuille",
    emptyTitle: "Aucune parcelle",
    emptyDesc: "Aucune parcelle ne correspond à ces filtres.",
    resetFilters: "Réinitialiser les filtres",
    th: { producteur: "Producteur", cooperative: "Coopérative", filiere: "Filière", superficie: "Superficie", statut: "Statut", date: "Date" },
    sortLocale: "fr",
  },
  en: {
    statutFilters: { tous: "All", conforme: "Compliant", anomalie: "Anomaly detected", insuffisant: "Insufficient data" },
    kpi: {
      producteurs: "Farmers audited",
      taux: "Compliance rate",
      superficie: "Area mapped",
      volume: "Validated volume",
    },
    repartition: "Status breakdown",
    searchAria: "Search a plot, a farmer, a cooperative",
    searchPlaceholder: "Search…",
    clear: "Clear",
    filterStatut: "Filter by status",
    filterFiliere: "Filter by commodity",
    allFilieres: "All commodities",
    export: "Export GeoJSON",
    filteredView: "filtered view",
    tableTitle: "Portfolio plots",
    emptyTitle: "No plot",
    emptyDesc: "No plot matches these filters.",
    resetFilters: "Reset filters",
    th: { producteur: "Farmer", cooperative: "Cooperative", filiere: "Commodity", superficie: "Area", statut: "Status", date: "Date" },
    sortLocale: "en",
  },
} as const;

export function AnalyticsTab({
  parcelles,
  selectedId,
  hoveredId,
  setSelectedId,
  setHoveredId,
  onExport,
}: {
  parcelles: Parcelle[];
  selectedId: string | null;
  hoveredId: string | null;
  setSelectedId: (id: string | null) => void;
  setHoveredId: (id: string | null) => void;
  onExport: (list: Parcelle[], scope: string) => void;
}) {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [query, setQuery] = useState("");
  const [statut, setStatut] = useState<Statut | "tous">("tous");
  const [filiere, setFiliere] = useState<Filiere | "toutes">("toutes");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const bodyRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => portfolioStats(parcelles), [parcelles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parcelles.filter((p) => {
      if (statut !== "tous" && p.statut !== statut) return false;
      if (filiere !== "toutes" && p.filiere !== filiere) return false;
      if (!q) return true;
      return (
        p.producteurNom.toLowerCase().includes(q) ||
        p.numeroCartePro.toLowerCase().includes(q) ||
        p.cooperative.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q)
      );
    });
  }, [parcelles, query, statut, filiere]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const val = (p: Parcelle): string | number => {
      switch (sortKey) {
        case "producteur":
          return p.producteurNom;
        case "cooperative":
          return p.cooperative;
        case "filiere":
          return FILIERE_LABEL[p.filiere];
        case "superficie":
          return p.superficieHa;
        case "statut":
          return STATUT_RANK[p.statut];
        case "date":
          return p.dateVerification;
      }
    };
    return [...filtered].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), t.sortLocale) * dir;
    });
  }, [filtered, sortKey, sortDir, t.sortLocale]);

  const resetFilters = () => {
    setQuery("");
    setStatut("tous");
    setFiliere("toutes");
  };

  // Un changement de filtre par l'utilisateur lève la sélection courante : évite que l'effet de
  // « remise en vue » (ci-dessous) ne réannule aussitôt le filtre qu'on vient d'appliquer.
  const onQuery = (v: string) => {
    setQuery(v);
    setSelectedId(null);
  };
  const onStatut = (s: Statut | "tous") => {
    setStatut(s);
    setSelectedId(null);
  };
  const onFiliere = (f: Filiere | "toutes") => {
    setFiliere(f);
    setSelectedId(null);
  };

  // Lien carte→tableau : si la parcelle sélectionnée (carte ou ⌘K) est masquée par un filtre,
  // on lève les filtres, puis on fait défiler sa ligne dans la vue.
  useEffect(() => {
    if (!selectedId) return;
    const visible = filtered.some((p) => p.id === selectedId);
    if (!visible && parcelles.some((p) => p.id === selectedId)) {
      resetFilters();
      return;
    }
    const row = bodyRef.current?.querySelector<HTMLElement>(`[data-row="${selectedId}"]`);
    row?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [selectedId, filtered, parcelles, reduce]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "producteur" || key === "cooperative" || key === "filiere" ? "asc" : "desc");
    }
  }

  const kpis = [
    { label: t.kpi.producteurs, value: stats.producteurs, suffix: "", Icon: Users },
    { label: t.kpi.taux, value: stats.tauxConformite, suffix: " %", Icon: ShieldCheck },
    { label: t.kpi.superficie, value: Math.round(stats.superficieHa), suffix: " ha", Icon: MapPin },
    { label: t.kpi.volume, value: stats.volumeTonnes, suffix: " t", Icon: Sprout },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Conformité de ma campagne : lots scellés, compte à rebours RDUE, prochaines actions */}
      <CampagneConformite lang={lang === "en" ? "en" : "fr"} />

      {/* 4 KPI officiels */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {kpis.map((k) => (
          <motion.div
            key={k.label}
            variants={{
              hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
            }}
            className="rounded-2xl border border-black/[0.05] bg-white p-4 shadow-[0_1px_2px_rgba(10,31,20,0.04)]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "rgba(22,163,74,0.1)" }} aria-hidden>
              <k.Icon size={16} strokeWidth={2} className="text-green-signal" />
            </span>
            <div className="mt-3 num text-2xl font-semibold tracking-tight text-forest-950 sm:text-[1.75rem]">
              <StatNumber value={k.value} suffix={k.suffix} />
            </div>
            <p className="mt-0.5 text-[0.8rem] font-medium text-forest-950">{k.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Répartition des 3 statuts (verbatim charte) sur tout le portefeuille */}
      {(() => {
        const rep = (["conforme", "anomalie", "insuffisant"] as Statut[]).map((s) => ({
          key: s,
          label: t.statutFilters[s],
          count: parcelles.filter((p) => p.statut === s).length,
          color: STATUT_RANK[s] === 0 ? "#16a34a" : STATUT_RANK[s] === 1 ? "#b4231e" : "#c8861d",
        }));
        const total = parcelles.length || 1;
        return (
          <div className="rounded-2xl border border-black/[0.05] bg-white p-4 shadow-[0_1px_2px_rgba(10,31,20,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <h3 className="text-sm font-semibold text-forest-950">{t.repartition}</h3>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {rep.map((r) => (
                  <li key={r.key} className="flex items-center gap-1.5 text-xs text-stone-600">
                    <span className="h-2 w-2 rounded-full" style={{ background: r.color }} aria-hidden />
                    {r.label} <span className="num font-semibold text-forest-950">{r.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-black/[0.06]" aria-hidden>
              {rep.map((r) =>
                r.count > 0 ? <div key={r.key} style={{ width: `${(r.count / total) * 100}%`, background: r.color }} /> : null,
              )}
            </div>
          </div>
        );
      })()}

      {/* Barre d'outils : recherche · filtres · export */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search size={16} strokeWidth={2} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              aria-label={t.searchAria}
              placeholder={t.searchPlaceholder}
              className="h-10 w-full rounded-full border border-black/[0.08] bg-white pl-10 pr-9 text-sm text-forest-950 outline-none transition-colors placeholder:text-stone-400 focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15"
            />
            {query && (
              <button type="button" onClick={() => onQuery("")} aria-label={t.clear} className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-stone-400 hover:bg-black/5 hover:text-forest-950">
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Filtre statut (segmenté) */}
          <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-black/[0.06] bg-white p-1" role="group" aria-label={t.filterStatut}>
            {STATUT_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={statut === k}
                onClick={() => onStatut(k)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-signal ${
                  statut === k ? "bg-forest-950 text-white" : "text-stone-500 hover:text-forest-950"
                }`}
              >
                {t.statutFilters[k]}
              </button>
            ))}
          </div>

          {/* Filtre filière */}
          <label className="sr-only" htmlFor="filiere-filter">{t.filterFiliere}</label>
          <select
            id="filiere-filter"
            value={filiere}
            onChange={(e) => onFiliere(e.target.value as Filiere | "toutes")}
            className="h-10 rounded-full border border-black/[0.08] bg-white px-4 text-sm text-forest-950 outline-none transition-colors focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15"
          >
            <option value="toutes">{t.allFilieres}</option>
            <option value="cacao">Cacao</option>
            <option value="cafe">Café</option>
            <option value="hevea">Hévéa</option>
            <option value="palmier">Palmier à huile</option>
          </select>
        </div>

        <button
          type="button"
          data-tour="export-geojson"
          onClick={() => onExport(sorted, t.filteredView)}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal"
        >
          <Download size={16} strokeWidth={2} aria-hidden />
          {t.export}
        </button>
      </div>

      {/* Tableau lié ↔ carte (côte à côte en xl : la coquille /app est assez large pour les 6 colonnes) */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* Tableau dense triable */}
        <div className="xl:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-[0_1px_2px_rgba(10,31,20,0.04)]">
            <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-2.5">
              <h3 className="text-sm font-semibold text-forest-950">{t.tableTitle}</h3>
              <span className="num text-xs text-stone-400">{sorted.length} / {parcelles.length}</span>
            </div>

            {sorted.length === 0 ? (
              <div className="p-3">
                <EmptyState
                  title={t.emptyTitle}
                  description={t.emptyDesc}
                  action={
                    <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal">
                      {t.resetFilters}
                    </button>
                  }
                />
              </div>
            ) : (
              <div ref={bodyRef} className="scroll-slim max-h-[600px] overflow-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-ivory-deep/80 backdrop-blur-sm">
                    <tr className="text-left">
                      <Th label={t.th.producteur} k="producteur" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                      <Th label={t.th.cooperative} k="cooperative" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="hidden md:table-cell" />
                      <Th label={t.th.filiere} k="filiere" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="hidden sm:table-cell" />
                      <Th label={t.th.superficie} k="superficie" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" className="hidden sm:table-cell" />
                      <Th label={t.th.statut} k="statut" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                      <Th label={t.th.date} k="date" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="hidden lg:table-cell" />
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((p) => {
                      const active = p.id === selectedId;
                      const hover = p.id === hoveredId;
                      return (
                        <tr
                          key={p.id}
                          data-row={p.id}
                          onMouseEnter={() => setHoveredId(p.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => setSelectedId(active ? null : p.id)}
                          className={`cursor-pointer border-t border-black/[0.04] outline-none transition-colors ${
                            active ? "bg-green-signal/[0.1]" : hover ? "bg-ivory-deep/60" : "hover:bg-ivory-deep/40"
                          }`}
                        >
                          <td className="px-4 py-2.5">
                            <span className="block whitespace-nowrap font-medium text-forest-950">{p.producteurNom}</span>
                            <span className="num block whitespace-nowrap text-[0.7rem] text-stone-400">{p.numeroCartePro}</span>
                          </td>
                          <td className="hidden max-w-[14rem] truncate px-4 py-2.5 text-stone-600 md:table-cell" title={p.cooperative}>
                            {p.cooperative}
                          </td>
                          <td className="hidden whitespace-nowrap px-4 py-2.5 text-stone-600 sm:table-cell">
                            {p.filiere === "palmier" ? "Palmier" : FILIERE_LABEL[p.filiere]}
                          </td>
                          <td className="num hidden whitespace-nowrap px-4 py-2.5 text-right text-forest-950 sm:table-cell">{fmtHa(p.superficieHa)}</td>
                          <td className="px-4 py-2.5"><StatusBadge statut={p.statut} size="sm" lang={lang} /></td>
                          <td className="num hidden whitespace-nowrap px-4 py-2.5 text-stone-500 lg:table-cell">{formatDateFr(p.dateVerification)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Carte liée */}
        <div className="xl:col-span-4">
          <div className="h-[340px] overflow-hidden rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(10,31,20,0.04)] xl:sticky xl:top-4 xl:h-[600px]">
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

/** En-tête de colonne triable, avec aria-sort (accessibilité). */
function Th({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  align = "left",
  className = "",
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const activeSort = sortKey === k;
  return (
    <th
      scope="col"
      aria-sort={activeSort ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      className={`whitespace-nowrap px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-wide text-stone-500 ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal ${
          align === "right" ? "flex-row-reverse" : ""
        } ${activeSort ? "text-forest-950" : ""}`}
      >
        {label}
        <ArrowUpDown size={12} strokeWidth={2} aria-hidden className={activeSort ? "opacity-100" : "opacity-40"} />
      </button>
    </th>
  );
}

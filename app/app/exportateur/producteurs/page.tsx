"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Search, Users, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatNumber } from "@/components/ui/stat-number";
import { FILIERE_LABEL, PARCELLES, cooperatives, fmtHa, type Statut } from "@/data/mock-parcelles";

/**
 * Producteurs (espace exportateur) : consolide TOUS les producteurs du réseau
 * d'approvisionnement, filtrables par coopérative et par statut. Chaque ligne ouvre la
 * parcelle correspondante sur la page Parcelles (tableau ↔ carte satellite liés).
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const STATUT_KEYS: (Statut | "tous")[] = ["tous", "conforme", "anomalie", "insuffisant"];

const COPY = {
  fr: {
    eyebrow: "Espace exportateur",
    titre: "Producteurs",
    sous: "Tous les producteurs de vos coopératives, consolidés. Chaque ligne ouvre la parcelle correspondante sur la carte satellite.",
    kpi: { total: "Producteurs audités", conformes: "Conformes", coops: "Coopératives" },
    searchAria: "Rechercher un producteur, un numéro de carte, une coopérative",
    searchPlaceholder: "Rechercher un producteur, un n° de carte…",
    clear: "Effacer",
    filterCoop: "Filtrer par coopérative",
    toutesCoops: "Toutes les coopératives",
    filterStatut: "Filtrer par statut",
    statuts: { tous: "Tous", conforme: "Conforme", anomalie: "Anomalie détectée", insuffisant: "Données insuffisantes" },
    emptyTitle: "Aucun producteur",
    emptyDesc: "Aucun producteur ne correspond à ces filtres.",
    reset: "Réinitialiser les filtres",
    voir: "Ouvrir la parcelle",
  },
  en: {
    eyebrow: "Exporter workspace",
    titre: "Farmers",
    sous: "Every farmer across your cooperatives, consolidated. Each row opens the matching plot on the satellite map.",
    kpi: { total: "Farmers audited", conformes: "Compliant", coops: "Cooperatives" },
    searchAria: "Search a farmer, a card number, a cooperative",
    searchPlaceholder: "Search a farmer, a card number…",
    clear: "Clear",
    filterCoop: "Filter by cooperative",
    toutesCoops: "All cooperatives",
    filterStatut: "Filter by status",
    statuts: { tous: "All", conforme: "Compliant", anomalie: "Anomaly detected", insuffisant: "Insufficient data" },
    emptyTitle: "No farmer",
    emptyDesc: "No farmer matches these filters.",
    reset: "Reset filters",
    voir: "Open the plot",
  },
} as const;

export default function ProducteursExportateurPage() {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];

  const [query, setQuery] = React.useState("");
  const [coop, setCoop] = React.useState<string>("toutes");
  const [statut, setStatut] = React.useState<Statut | "tous">("tous");

  const coops = React.useMemo(() => cooperatives(PARCELLES), []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return PARCELLES.filter((p) => {
      if (coop !== "toutes" && p.cooperative !== coop) return false;
      if (statut !== "tous" && p.statut !== statut) return false;
      if (!q) return true;
      return (
        p.producteurNom.toLowerCase().includes(q) ||
        p.numeroCartePro.toLowerCase().includes(q) ||
        p.cooperative.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q)
      );
    });
  }, [query, coop, statut]);

  const conformes = PARCELLES.filter((p) => p.statut === "conforme").length;
  const kpis = [
    { label: t.kpi.total, value: PARCELLES.length },
    { label: t.kpi.conformes, value: conformes },
    { label: t.kpi.coops, value: coops.length },
  ];

  const reset = () => {
    setQuery("");
    setCoop("toutes");
    setStatut("tous");
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl leading-tight text-forest-950">{t.titre}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-stone-500">{t.sous}</p>
      </div>

      {/* KPI compacts */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
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
            <div className="num text-2xl font-semibold tracking-tight text-forest-950">
              <StatNumber value={k.value} />
            </div>
            <p className="mt-0.5 text-[0.8rem] font-medium text-forest-950">{k.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search size={16} strokeWidth={2} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t.searchAria}
            placeholder={t.searchPlaceholder}
            className="h-10 w-full rounded-full border border-black/[0.08] bg-white pl-10 pr-9 text-sm text-forest-950 outline-none transition-colors placeholder:text-stone-400 focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label={t.clear} className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-stone-400 hover:bg-black/5 hover:text-forest-950">
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>

        <label className="sr-only" htmlFor="coop-filter">{t.filterCoop}</label>
        <select
          id="coop-filter"
          value={coop}
          onChange={(e) => setCoop(e.target.value)}
          className="h-10 max-w-full rounded-full border border-black/[0.08] bg-white px-4 text-sm text-forest-950 outline-none transition-colors focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15"
        >
          <option value="toutes">{t.toutesCoops}</option>
          {coops.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-black/[0.06] bg-white p-1" role="group" aria-label={t.filterStatut}>
          {STATUT_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={statut === k}
              onClick={() => setStatut(k)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-signal ${
                statut === k ? "bg-forest-950 text-white" : "text-stone-500 hover:text-forest-950"
              }`}
            >
              {t.statuts[k]}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="card-premium overflow-hidden p-2 sm:p-3">
        <div className="flex items-center justify-between px-3 py-2.5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-green-signal/10" aria-hidden>
              <Users size={16} strokeWidth={2} className="text-green-signal" />
            </span>
            {t.titre}
          </h2>
          <span className="num text-xs text-stone-400">{filtered.length} / {PARCELLES.length}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-2">
            <EmptyState
              title={t.emptyTitle}
              description={t.emptyDesc}
              action={
                <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal">
                  {t.reset}
                </button>
              }
            />
          </div>
        ) : (
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.02 } } }}
            className="flex flex-col"
          >
            {filtered.map((p) => (
              <motion.li
                key={p.id}
                variants={{
                  hidden: reduce ? { opacity: 1 } : { opacity: 0, x: -8 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
                }}
              >
                <Link
                  href={`/app/exportateur/parcelles?parcelle=${p.id}`}
                  aria-label={`${t.voir} · ${p.producteurNom}`}
                  className="group grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3 outline-none transition-colors hover:bg-green-signal/[0.06] focus-visible:ring-2 focus-visible:ring-green-signal/40"
                >
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-medium text-forest-950 transition-colors group-hover:text-green-signal">{p.producteurNom}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                      <StatusBadge statut={p.statut} size="sm" lang={lang} />
                      <span className="num text-stone-400">{p.numeroCartePro}</span>
                      <span aria-hidden className="text-stone-300">·</span>
                      <span className="max-w-[12rem] truncate">{p.cooperative}</span>
                      <span aria-hidden className="text-stone-300">·</span>
                      <span>{FILIERE_LABEL[p.filiere]}</span>
                      <span aria-hidden className="text-stone-300">·</span>
                      <span className="num">{fmtHa(p.superficieHa)}</span>
                    </span>
                  </div>
                  <ChevronRight size={18} strokeWidth={2} aria-hidden className="shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-green-signal" />
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatNumber } from "@/components/ui/stat-number";
import { PARCELLES, portfolioStats, FILIERE_LABEL, fmtHa, formatDateFr, type Parcelle, type Statut } from "@/data/mock-parcelles";
import { FILIERES, type FiliereId } from "@/config/filieres";

export default function ParcellesPage() {
  const [query, setQuery] = useState("");
  const [filiere, setFiliere] = useState<FiliereId | "all">("all");
  const [statut, setStatut] = useState<Statut | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PARCELLES.filter((p) => {
      if (filiere !== "all" && p.filiere !== filiere) return false;
      if (statut !== "all" && p.statut !== statut) return false;
      if (q && !(p.producteurNom.toLowerCase().includes(q) || p.numeroCertificat.toLowerCase().includes(q) || p.numeroCartePro.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [query, filiere, statut]);

  const stats = useMemo(() => portfolioStats(PARCELLES), []);
  const kpis = [
    { label: "Parcelles cartographiées", value: stats.producteurs, suffix: "" },
    { label: "Taux de conformité", value: stats.tauxConformite, suffix: " %" },
    { label: "Superficie totale", value: Math.round(stats.superficieHa), suffix: " ha" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow text-green-signal">Parcelles</p>
        <h1 className="mt-1.5 font-display text-3xl text-forest-950">Parcelles cartographiées</h1>
        <p className="mt-1 text-sm text-stone-500">Chaque parcelle est vérifiée par satellite et rattachée à un certificat.</p>
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
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher une parcelle"
            placeholder="Rechercher un producteur, un n° de certificat…"
            className="h-12 w-full rounded-full border border-black/[0.08] bg-white pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15" />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={filiere === "all"} onClick={() => setFiliere("all")}>Toutes filières</FilterPill>
          {FILIERES.map((f) => (
            <FilterPill key={f.id} active={filiere === f.id} onClick={() => setFiliere(f.id)} dot={f.couleur}>{f.label}</FilterPill>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={statut === "all"} onClick={() => setStatut("all")}>Tous statuts</FilterPill>
          <FilterPill active={statut === "conforme"} onClick={() => setStatut("conforme")}>Conforme</FilterPill>
          <FilterPill active={statut === "anomalie"} onClick={() => setStatut("anomalie")}>Anomalie détectée</FilterPill>
          <FilterPill active={statut === "insuffisant"} onClick={() => setStatut("insuffisant")}>Données insuffisantes</FilterPill>
        </div>
      </div>

      <div className="card-premium p-2 sm:p-3">
        <div className="flex items-center justify-between px-3 py-2.5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
            <span className="h-4 w-1 rounded-full bg-green-signal" aria-hidden />
            Liste des parcelles
          </h2>
          <span className="num text-xs text-stone-400">{filtered.length} / {PARCELLES.length}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-2"><EmptyState title="Aucune parcelle trouvée" description="Ajustez la recherche ou les filtres pour élargir les résultats." /></div>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((p) => <li key={p.id}><ParcelleRow p={p} /></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

function ParcelleRow({ p }: { p: Parcelle }) {
  return (
    <Link href={`/app/parcelle/${p.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3 outline-none transition-colors hover:bg-green-signal/[0.06] focus-visible:ring-2 focus-visible:ring-green-signal/40">
      <div className="min-w-0">
        <span className="block truncate text-sm font-medium text-forest-950 transition-colors group-hover:text-green-signal">{p.producteurNom}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
          <StatusBadge statut={p.statut} size="sm" />
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

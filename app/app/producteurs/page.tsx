"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, UserPlus, ChevronRight, Check } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PARCELLES, FILIERE_LABEL, fmtHa, COOP_DEMO, type Statut } from "@/data/mock-parcelles";
import { FILIERES, type FiliereId } from "@/config/filieres";

interface Producteur {
  id: string;
  producteurNom: string;
  numeroCartePro: string;
  cooperative: string;
  region: string;
  superficieHa: number;
  filiere: FiliereId;
  statut: Statut;
  linkId?: string;
}

const BASE: Producteur[] = PARCELLES.map((p) => ({
  id: p.id,
  producteurNom: p.producteurNom,
  numeroCartePro: p.numeroCartePro,
  cooperative: p.cooperative,
  region: p.region,
  superficieHa: p.superficieHa,
  filiere: p.filiere,
  statut: p.statut,
  linkId: p.id,
}));

const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-green-signal focus:ring-2 focus:ring-green-signal/15";

export default function ProducteursPage() {
  const reduce = useReducedMotion() ?? false;
  const [query, setQuery] = useState("");
  const [filiere, setFiliere] = useState<FiliereId | "all">("all");
  const [statut, setStatut] = useState<Statut | "all">("all");
  const [added, setAdded] = useState<Producteur[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const all = useMemo(() => [...added, ...BASE], [added]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((p) => {
      if (filiere !== "all" && p.filiere !== filiere) return false;
      if (statut !== "all" && p.statut !== statut) return false;
      if (q && !(p.producteurNom.toLowerCase().includes(q) || p.numeroCartePro.toLowerCase().includes(q) || p.cooperative.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [all, query, filiere, statut]);

  const addProducteur = (data: { producteurNom: string; cooperative: string; region: string; superficieHa: number; filiere: FiliereId }) => {
    const seq = 90001 + added.length;
    const p: Producteur = { ...data, id: `new-${Date.now()}`, numeroCartePro: `CI-CCC-0${seq}`, statut: "insuffisant" };
    setAdded((a) => [p, ...a]);
    setShowForm(false);
    setToast(`Producteur « ${data.producteurNom} » ajouté. Vérification à planifier.`);
    window.setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status"
            className="flex items-center gap-2.5 rounded-2xl border border-green-signal/20 bg-green-signal/[0.06] px-4 py-3 text-sm text-forest-950">
            <Check size={18} className="shrink-0 text-green-signal" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-green-signal">Producteurs</p>
          <h1 className="mt-1.5 font-display text-3xl text-forest-950">Vos producteurs</h1>
          <p className="mt-1 text-sm text-stone-500"><span className="num">{all.length}</span> producteurs suivis, toutes coopératives confondues.</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)}
          className="btn-green inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory">
          <UserPlus size={17} strokeWidth={2.25} /> Ajouter un producteur
        </button>
      </div>

      <AnimatePresence>
        {showForm && <AddForm reduce={reduce} onCancel={() => setShowForm(false)} onSubmit={addProducteur} />}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher un producteur"
            placeholder="Rechercher un producteur, un n° de carte, une coopérative…"
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
            Liste des producteurs
          </h2>
          <span className="num text-xs text-stone-400">{filtered.length} / {all.length}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-2"><EmptyState title="Aucun producteur trouvé" description="Ajustez la recherche ou les filtres pour élargir les résultats." /></div>
        ) : (
          <ul className="flex flex-col">
            {filtered.map((p) => <li key={p.id}><ProducteurRow p={p} /></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProducteurRow({ p }: { p: Producteur }) {
  const inner = (
    <>
      <div className="min-w-0">
        <span className="block truncate text-sm font-medium text-forest-950 transition-colors group-hover:text-green-signal">{p.producteurNom}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
          <StatusBadge statut={p.statut} size="sm" />
          <span className="num text-stone-400">{p.numeroCartePro}</span>
          <span aria-hidden className="text-stone-300">·</span>
          <span>{FILIERE_LABEL[p.filiere]}</span>
          <span aria-hidden className="text-stone-300">·</span>
          <span className="truncate">{p.cooperative}</span>
          <span aria-hidden className="text-stone-300">·</span>
          <span className="num">{fmtHa(p.superficieHa)}</span>
        </span>
      </div>
      {p.linkId && <ChevronRight size={18} className="shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-green-signal" />}
    </>
  );
  const cls = "group grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3";
  return p.linkId ? (
    <Link href={`/app/parcelle/${p.linkId}`} className={`${cls} outline-none transition-colors hover:bg-green-signal/[0.06] focus-visible:ring-2 focus-visible:ring-green-signal/40`}>{inner}</Link>
  ) : (
    <div className={cls}>{inner}</div>
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

function AddForm({ reduce, onCancel, onSubmit }: { reduce: boolean; onCancel: () => void; onSubmit: (d: { producteurNom: string; cooperative: string; region: string; superficieHa: number; filiere: FiliereId }) => void }) {
  const [nom, setNom] = useState("");
  const [coop, setCoop] = useState(COOP_DEMO);
  const [region, setRegion] = useState("Nawa · Soubré");
  const [ha, setHa] = useState("");
  const [filiere, setFiliere] = useState<FiliereId>("cacao");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nom.trim().length < 2) { setErr("Indiquez le nom du producteur."); return; }
    const s = parseFloat(ha.replace(",", "."));
    if (!s || s <= 0) { setErr("Indiquez une superficie valide (en hectares)."); return; }
    onSubmit({ producteurNom: nom.trim(), cooperative: coop.trim(), region: region.trim(), superficieHa: Math.round(s * 10) / 10, filiere });
  };

  return (
    <motion.form onSubmit={submit}
      initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(10,31,20,0.04)]"
    >
      <h2 className="font-display text-lg text-forest-950">Nouveau producteur</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Nom du producteur"><input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. Kouassi Yao" className={inputCls} /></Field>
        <Field label="Filière"><select value={filiere} onChange={(e) => setFiliere(e.target.value as FiliereId)} className={inputCls}>{FILIERES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></Field>
        <Field label="Coopérative"><input value={coop} onChange={(e) => setCoop(e.target.value)} className={inputCls} /></Field>
        <Field label="Région"><input value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} /></Field>
        <Field label="Superficie (ha)"><input value={ha} onChange={(e) => setHa(e.target.value)} inputMode="decimal" placeholder="3,2" className={inputCls} /></Field>
      </div>
      {err && <p className="mt-3 text-sm text-red-block">{err}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" className="btn-green inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">Ajouter</button>
        <button type="button" onClick={onCancel} className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:text-forest-950">Annuler</button>
      </div>
    </motion.form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-forest-950">{label}</span>
      {children}
    </label>
  );
}

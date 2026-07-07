"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, UserPlus, ChevronRight, Check } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PARCELLES, FILIERE_LABEL, fmtHa, COOP_DEMO, type Statut } from "@/data/mock-parcelles";
import { FILIERES, type FiliereId } from "@/config/filieres";
import { useLanguage } from "@/components/language-provider";
import { PRODUCTEURS_KEY, lireProducteursLocaux, type ProducteurLocal } from "@/lib/producteurs-locaux";

const TR = {
  fr: {
    eyebrow: "Producteurs",
    title: "Vos producteurs",
    subAfter: "producteurs suivis, toutes coopératives confondues.",
    add: "Ajouter un producteur",
    toast: (nom: string) => `Producteur « ${nom} » ajouté. Vérification à planifier.`,
    searchLabel: "Rechercher un producteur",
    searchPlaceholder: "Rechercher un producteur, un n° de carte, une coopérative…",
    allFilieres: "Toutes filières",
    allStatuts: "Tous statuts",
    statuts: { conforme: "Conforme", anomalie: "Anomalie détectée", insuffisant: "Données insuffisantes" },
    listTitle: "Liste des producteurs",
    emptyTitle: "Aucun producteur trouvé",
    emptyDesc: "Ajustez la recherche ou les filtres pour élargir les résultats.",
    emptyDescSearch: (q: string) => `Aucun producteur ne correspond à « ${q} ». Vérifiez l'orthographe ou le n° de carte.`,
    emptyDescFilters: "Aucun producteur ne correspond aux filtres actifs.",
    emptyDescBoth: (q: string) => `Aucun producteur pour « ${q} » avec ces filtres.`,
    emptyReset: "Effacer la recherche et les filtres",
    form: {
      title: "Nouveau producteur",
      nom: "Nom du producteur", nomPh: "Ex. Kouassi Yao",
      filiere: "Filière", coop: "Coopérative", region: "Région", ha: "Superficie (ha)",
      lat: "Latitude (optionnel)", latPh: "5.8321", lon: "Longitude", lonPh: "-6.6478",
      coordsHint: "Si la coopérative possède déjà la géolocalisation du producteur (registre, certification), saisissez-la : elle apparaîtra sur la carte de sa fiche.",
      errNom: "Indiquez le nom du producteur.",
      errHa: "Indiquez une superficie valide (en hectares).",
      errCoords: "Coordonnées invalides : latitude 4 à 11, longitude −9 à −2 (Côte d'Ivoire), ou laissez les deux champs vides.",
      submit: "Ajouter", cancel: "Annuler",
    },
  },
  en: {
    eyebrow: "Farmers",
    title: "Your farmers",
    subAfter: "farmers tracked, across all cooperatives.",
    add: "Add a farmer",
    toast: (nom: string) => `Farmer "${nom}" added. Verification to schedule.`,
    searchLabel: "Search a farmer",
    searchPlaceholder: "Search a farmer, a card number, a cooperative…",
    allFilieres: "All commodities",
    allStatuts: "All statuses",
    statuts: { conforme: "Compliant", anomalie: "Anomaly detected", insuffisant: "Insufficient data" },
    listTitle: "Farmer list",
    emptyTitle: "No farmer found",
    emptyDesc: "Adjust the search or the filters to widen the results.",
    emptyDescSearch: (q: string) => `No farmer matches "${q}". Check the spelling or the card number.`,
    emptyDescFilters: "No farmer matches the active filters.",
    emptyDescBoth: (q: string) => `No farmer for "${q}" with these filters.`,
    emptyReset: "Clear search and filters",
    form: {
      title: "New farmer",
      nom: "Farmer name", nomPh: "E.g. Kouassi Yao",
      filiere: "Commodity", coop: "Cooperative", region: "Region", ha: "Area (ha)",
      lat: "Latitude (optional)", latPh: "5.8321", lon: "Longitude", lonPh: "-6.6478",
      coordsHint: "If the cooperative already holds the farmer's geolocation (register, certification), enter it: it will appear on the map of their record.",
      errNom: "Enter the farmer's name.",
      errHa: "Enter a valid area (in hectares).",
      errCoords: "Invalid coordinates: latitude 4 to 11, longitude −9 to −2 (Côte d'Ivoire), or leave both fields empty.",
      submit: "Add", cancel: "Cancel",
    },
  },
};
type Tr = (typeof TR)["fr"];

type Producteur = ProducteurLocal;

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
  const { lang } = useLanguage();
  const t = TR[lang];
  const [query, setQuery] = useState("");
  const [filiere, setFiliere] = useState<FiliereId | "all">("all");
  const [statut, setStatut] = useState<Statut | "all">("all");
  const [added, setAdded] = useState<Producteur[]>([]);

  // Producteurs ajoutés par la coopérative : persistés en localStorage (fiche consultable après navigation).
  useEffect(() => {
    setAdded(lireProducteursLocaux());
  }, []);
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

  const addProducteur = (data: { producteurNom: string; cooperative: string; region: string; superficieHa: number; filiere: FiliereId; lat?: number; lon?: number }) => {
    const seq = 90001 + added.length;
    const id = `new-${Date.now()}`;
    const p: Producteur = { ...data, id, linkId: id, numeroCartePro: `CI-CCC-0${seq}`, statut: "insuffisant" };
    setAdded((a) => {
      const next = [p, ...a];
      try { localStorage.setItem(PRODUCTEURS_KEY, JSON.stringify(next)); } catch { /* stockage indisponible */ }
      return next;
    });
    setShowForm(false);
    setToast(t.toast(data.producteurNom));
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
          <p className="eyebrow text-green-signal">{t.eyebrow}</p>
          <h1 className="mt-1.5 font-display text-3xl text-forest-950">{t.title}</h1>
          <p className="mt-1 text-sm text-stone-500"><span className="num">{all.length}</span> {t.subAfter}</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)}
          className="btn-green inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory">
          <UserPlus size={17} strokeWidth={2.25} /> {t.add}
        </button>
      </div>

      <AnimatePresence>
        {showForm && <AddForm t={t.form} reduce={reduce} onCancel={() => setShowForm(false)} onSubmit={addProducteur} />}
      </AnimatePresence>

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

      <div className="card-premium p-2 sm:p-3">
        <div className="flex items-center justify-between px-3 py-2.5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
            <span className="h-4 w-1 rounded-full bg-green-signal" aria-hidden />
            {t.listTitle}
          </h2>
          <span className="num text-xs text-stone-400">{filtered.length} / {all.length}</span>
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
          <ul className="flex flex-col">
            {filtered.map((p) => <li key={p.id}><ProducteurRow p={p} lang={lang} /></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProducteurRow({ p, lang }: { p: Producteur; lang: "fr" | "en" }) {
  const inner = (
    <>
      <div className="min-w-0">
        <span className="block truncate text-sm font-medium text-forest-950 transition-colors group-hover:text-green-signal">{p.producteurNom}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
          <StatusBadge statut={p.statut} size="sm" lang={lang} />
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

function AddForm({ t, reduce, onCancel, onSubmit }: { t: Tr["form"]; reduce: boolean; onCancel: () => void; onSubmit: (d: { producteurNom: string; cooperative: string; region: string; superficieHa: number; filiere: FiliereId; lat?: number; lon?: number }) => void }) {
  const [nom, setNom] = useState("");
  const [coop, setCoop] = useState(COOP_DEMO);
  const [region, setRegion] = useState("Nawa · Soubré");
  const [ha, setHa] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [filiere, setFiliere] = useState<FiliereId>("cacao");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nom.trim().length < 2) { setErr(t.errNom); return; }
    const s = parseFloat(ha.replace(",", "."));
    if (!s || s <= 0) { setErr(t.errHa); return; }
    let coords: { lat?: number; lon?: number } = {};
    if (lat.trim() || lon.trim()) {
      const la = parseFloat(lat.replace(",", "."));
      const lo = parseFloat(lon.replace(",", "."));
      const ok = Number.isFinite(la) && Number.isFinite(lo) && la >= 4 && la <= 11 && lo >= -9 && lo <= -2;
      if (!ok) { setErr(t.errCoords); return; }
      coords = { lat: la, lon: lo };
    }
    onSubmit({ producteurNom: nom.trim(), cooperative: coop.trim(), region: region.trim(), superficieHa: Math.round(s * 10) / 10, filiere, ...coords });
  };

  return (
    <motion.form onSubmit={submit}
      initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(10,31,20,0.04)]"
    >
      <h2 className="font-display text-lg text-forest-950">{t.title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label={t.nom}><input value={nom} onChange={(e) => setNom(e.target.value)} placeholder={t.nomPh} className={inputCls} /></Field>
        <Field label={t.filiere}><select value={filiere} onChange={(e) => setFiliere(e.target.value as FiliereId)} className={inputCls}>{FILIERES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></Field>
        <Field label={t.coop}><input value={coop} onChange={(e) => setCoop(e.target.value)} className={inputCls} /></Field>
        <Field label={t.region}><input value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} /></Field>
        <Field label={t.ha}><input value={ha} onChange={(e) => setHa(e.target.value)} inputMode="decimal" placeholder="3,2" className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.lat}><input value={lat} onChange={(e) => setLat(e.target.value)} inputMode="decimal" placeholder={t.latPh} className={`num ${inputCls}`} /></Field>
          <Field label={t.lon}><input value={lon} onChange={(e) => setLon(e.target.value)} inputMode="decimal" placeholder={t.lonPh} className={`num ${inputCls}`} /></Field>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-stone-400">{t.coordsHint}</p>
      {err && <p className="mt-3 text-sm text-red-block">{err}</p>}
      <div className="mt-4 flex gap-2">
        <button type="submit" className="btn-green inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">{t.submit}</button>
        <button type="button" onClick={onCancel} className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:text-forest-950">{t.cancel}</button>
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

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Store, MapPin, Boxes, ArrowRight, Check, ExternalLink, Ship, Undo2, ShieldAlert, ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { SceauAgrivo } from "@/components/marketplace/sceau-agrivo";
import { JournalLot } from "@/components/marketplace/journal-lot";
import { ScanDocument } from "@/components/marketplace/scan-document";
import type { JalonPossession } from "@/data/mock-expeditions";
import { StatNumber } from "@/components/ui/stat-number";
import { getFiliere } from "@/config/filieres";
import { PARCELLES } from "@/data/mock-parcelles";
import {
  lotsMarche,
  takeRate,
  estVendable,
  TAUX_COMMISSION_MIN,
  TAUX_COMMISSION_MAX,
  type MarketLot,
} from "@/data/mock-marketplace";
import { connaissementsDupliquesMarche } from "@/lib/sentinelle/volume";
import { RfqInbox } from "@/components/exportateur/rfq-inbox";

/**
 * « Mes lots » (v2.6, refonte design system app) : l'espace de gestion des lots de l'exportateur
 * (côté OFFRE uniquement). La découverte et la réservation côté acheteur vivent sur la
 * VITRINE PUBLIQUE AGRIVO Market (/marketplace). Ici, l'exportateur publie / retire / suit
 * ses lots scellés, et bascule vers la fiche publique de chacun. AGRIVO fait le commerce
 * des fèves, jamais le financement : aucune donnée de crédit ici.
 *
 * Design : en-tête canonique de l'app (.eyebrow + font-display), bandeau KPI .panel-forest
 * (compteurs animés, recalculés quand on publie/retire), filtres à pilule glissante
 * (layoutId), cartes .card-premium staggerées, confirmation de retrait inline avec Annuler.
 */
const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
const fcfaCompact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M` : fcfa(n);
const pct = (t: number) => `${Math.round(t * 100)} %`;

const EASE = [0.16, 1, 0.3, 1] as const;

type FilterKey = "tous" | "publies" | "retires" | "reserves";
const FILTERS: FilterKey[] = ["tous", "publies", "retires", "reserves"];

const COPY = {
  fr: {
    eyebrow: "Espace exportateur · AGRIVO Market",
    title: "Mes lots",
    lead: "Publiez vos lots scellés sur la vitrine publique, suivez-les, retirez-les. Un lot n'est publiable que s'il porte le sceau AGRIVO (double verrou).",
    demo: "Lots de démonstration dérivés de vos expéditions. Aucune transaction réelle.",
    vitrine: "Voir la vitrine publique",
    kpiPublies: "Lots en ligne",
    kpiValeur: "Valeur publiée (FCFA)",
    kpiCommission: "Commission estimée (FCFA)",
    kpiScelles: "Lots scellés",
    kpiNote: `Commission ${pct(TAUX_COMMISSION_MIN)} à ${pct(TAUX_COMMISSION_MAX)} sur la transaction, estimation à ${pct(0.02)}. Jamais sur le producteur.`,
    filters: { tous: "Tous", publies: "Publiés", retires: "Retirés", reserves: "Réservés" } as Record<FilterKey, string>,
    tonnage: "Tonnage",
    prix: "Prix indicatif",
    valeur: "Valeur du lot",
    commission: "Commission estimée",
    parcelles: "parcelles d'origine",
    publier: "Publier sur la marketplace",
    retirer: "Retirer de la vente",
    enLigne: "En ligne",
    retire: "Retiré de la vitrine",
    retireInfo: "Lot retiré de la vitrine.",
    annuler: "Annuler",
    nonVendable: "Sceau en préparation : non publiable tant que le double verrou n'est pas vérifié.",
    journal: "Journal du lot",
    reserve: "Réservé",
    reserveBy: "Réservé par",
    fiche: "Voir la fiche publique",
    campagne: "Campagne",
    empty: "Aucun lot dans cette vue.",
    emptyAction: "Voir tous les lots",
    conflitTitre: "Contrôle inter-lots · connaissements",
    conflitOk: "Aucun connaissement partagé entre deux lots. Chaque remise ne sert qu'une fois.",
    conflitKo: (n: number, refs: string) =>
      `${n} lot${n > 1 ? "s" : ""} partagent un même connaissement (${refs}) : publication suspendue jusqu'à résolution.`,
  },
  en: {
    eyebrow: "Exporter space · AGRIVO Market",
    title: "My lots",
    lead: "List your sealed lots on the public marketplace, track them, remove them. A lot can only be listed if it carries the AGRIVO seal (double lock).",
    demo: "Demonstration lots derived from your shipments. No real transaction.",
    vitrine: "See the public marketplace",
    kpiPublies: "Lots online",
    kpiValeur: "Listed value (FCFA)",
    kpiCommission: "Estimated commission (FCFA)",
    kpiScelles: "Sealed lots",
    kpiNote: `Commission ${pct(TAUX_COMMISSION_MIN)} to ${pct(TAUX_COMMISSION_MAX)} on the transaction, estimated at ${pct(0.02)}. Never on the producer.`,
    filters: { tous: "All", publies: "Listed", retires: "Removed", reserves: "Reserved" } as Record<FilterKey, string>,
    tonnage: "Tonnage",
    prix: "Indicative price",
    valeur: "Lot value",
    commission: "Estimated commission",
    parcelles: "source plots",
    publier: "List on the marketplace",
    retirer: "Remove from sale",
    enLigne: "Online",
    retire: "Removed from the marketplace",
    retireInfo: "Lot removed from the marketplace.",
    annuler: "Undo",
    nonVendable: "Seal in preparation: cannot be listed until the double lock is verified.",
    journal: "Lot journal",
    reserve: "Reserved",
    reserveBy: "Reserved by",
    fiche: "View public file",
    campagne: "Harvest",
    empty: "No lot in this view.",
    emptyAction: "See all lots",
    conflitTitre: "Cross-lot check · bills of lading",
    conflitOk: "No bill of lading shared between two lots. Each hand-off is used only once.",
    conflitKo: (n: number, refs: string) =>
      `${n} lot${n > 1 ? "s" : ""} share the same bill of lading (${refs}): listing suspended until resolved.`,
  },
} as const;
type Copy = (typeof COPY)[keyof typeof COPY];

export default function MesLotsPage() {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = COPY[l];
  const reduce = useReducedMotion() ?? false;
  const lots = useMemo(() => lotsMarche(PARCELLES), []);
  // Sentinelle inter-lots : un même connaissement ne peut couvrir deux lots. Les lots concernés
  // voient leur publication suspendue (anti « blanchiment » par double comptage d'une remise).
  const lotsEnConflit = useMemo(() => {
    const dup = connaissementsDupliquesMarche(lots);
    const refs = new Set<string>();
    if (dup.size === 0) return refs;
    for (const lot of lots) {
      if (lot.journalPossession?.some((j) => j.connaissement && dup.has(j.connaissement.trim()))) {
        refs.add(lot.ref);
      }
    }
    return refs;
  }, [lots]);
  // État de session : lots retirés du marché (les constantes ne sont jamais mutées).
  const [retires, setRetires] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterKey>("tous");

  const toggle = (ref: string) => {
    // Garde-fou : publier/retirer n'a de sens que pour un lot vendable (sceau vérifié + listé)
    // et sans conflit de connaissement inter-lots.
    const lot = lots.find((x) => x.ref === ref);
    if (!lot || !estVendable(lot) || lotsEnConflit.has(ref)) return;
    setRetires((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  };

  // KPI dérivés en direct de l'état publier/retirer.
  const kpi = useMemo(() => {
    const publies = lots.filter((x) => estVendable(x) && !retires.has(x.ref));
    return {
      publies: publies.length,
      valeur: publies.reduce((s, x) => s + x.valeurFcfa, 0),
      commission: publies.reduce((s, x) => s + takeRate(x.valeurFcfa), 0),
      scelles: lots.filter((x) => x.sceau.statut === "verifie").length,
    };
  }, [lots, retires]);

  const counts = useMemo<Record<FilterKey, number>>(
    () => ({
      tous: lots.length,
      publies: lots.filter((x) => estVendable(x) && !retires.has(x.ref)).length,
      retires: lots.filter((x) => estVendable(x) && retires.has(x.ref)).length,
      reserves: lots.filter((x) => x.statutMarche === "reserve").length,
    }),
    [lots, retires]
  );

  const visibles = useMemo(() => {
    switch (filter) {
      case "publies": return lots.filter((x) => estVendable(x) && !retires.has(x.ref));
      case "retires": return lots.filter((x) => estVendable(x) && retires.has(x.ref));
      case "reserves": return lots.filter((x) => x.statutMarche === "reserve");
      default: return lots;
    }
  }, [lots, retires, filter]);

  return (
    <div className="mx-auto max-w-6xl px-1 py-2">
      {/* En-tête canonique de l'app */}
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow text-green-signal">{t.eyebrow}</p>
          <h1 className="mt-1.5 font-display text-3xl leading-tight text-forest-950">{t.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">{t.lead}</p>
          <p className="mt-2 text-xs text-amber-cacao">{t.demo}</p>
        </div>
        <Link href="/marketplace" className="btn-green inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
          <Store size={15} /> {t.vitrine} <ArrowRight size={14} />
        </Link>
      </header>

      {/* Bandeau KPI signature (recalculé en direct) */}
      <div className="panel-forest rounded-2xl p-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          {[
            { v: kpi.publies, k: t.kpiPublies, fmt: undefined as ((n: number) => string) | undefined },
            { v: kpi.valeur, k: t.kpiValeur, fmt: fcfaCompact },
            { v: kpi.commission, k: t.kpiCommission, fmt: fcfaCompact },
            { v: kpi.scelles, k: t.kpiScelles, fmt: undefined },
          ].map((s) => (
            <div key={s.k}>
              <StatNumber value={s.v} format={s.fmt} className="num block text-3xl font-bold text-white" />
              <dd className="mt-1 text-[0.68rem] font-medium uppercase tracking-wide text-white/50">{s.k}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 border-t border-white/10 pt-3 text-[0.7rem] leading-relaxed text-white/55">{t.kpiNote}</p>
      </div>

      {/* Sentinelle inter-lots : rassurance verte si aucun connaissement partagé, alerte rouge sinon */}
      {lotsEnConflit.size === 0 ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-green-signal/20 bg-green-signal/[0.06] px-4 py-2.5">
          <Check size={15} className="mt-0.5 shrink-0 text-green-signal" />
          <p className="text-xs leading-relaxed text-forest-950/70">
            <span className="font-semibold text-forest-950">{t.conflitTitre} · </span>
            {t.conflitOk}
          </p>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-block/30 bg-red-block/[0.06] px-4 py-2.5" role="alert">
          <ShieldAlert size={15} className="mt-0.5 shrink-0 text-red-block" />
          <p className="text-xs leading-relaxed text-forest-950/75">
            <span className="font-semibold text-red-block">{t.conflitTitre} · </span>
            {t.conflitKo(lotsEnConflit.size, [...lotsEnConflit].join(", "))}
          </p>
        </div>
      )}

      {/* Boîte de réception des demandes de cotation (vitrine publique → exportateur) */}
      <RfqInbox lang={l} />

      {/* Filtres : segmented control à pilule glissante */}
      <div className="mt-6 inline-flex flex-wrap rounded-full border border-black/[0.07] bg-white p-1 shadow-sm">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`relative rounded-full px-4 py-2 text-xs font-semibold transition-colors ${filter === f ? "text-white" : "text-forest-950/60 hover:text-forest-950"}`}
          >
            {filter === f && (
              <motion.span
                layoutId="mkt-filter-pill"
                className="absolute inset-0 rounded-full bg-forest-950"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">
              {t.filters[f]} <span className={`num ${filter === f ? "text-white/60" : "text-forest-950/35"}`}>{counts[f]}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Grille des lots */}
      {visibles.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-10 text-center">
          <p className="text-sm text-forest-950/55">{t.empty}</p>
          <button onClick={() => setFilter("tous")} className="mt-3 text-sm font-semibold text-green-signal hover:underline">
            {t.emptyAction}
          </button>
        </div>
      ) : (
        <motion.div
          key={filter}
          className="mt-6 grid gap-4 md:grid-cols-2"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
          {visibles.map((lot) => (
            <motion.div
              key={lot.ref}
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } }}
            >
              <LotCard lot={lot} lang={l} t={t} retire={retires.has(lot.ref)} conflit={lotsEnConflit.has(lot.ref)} onToggle={() => toggle(lot.ref)} reduce={reduce} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function LotCard({
  lot,
  lang,
  t,
  retire,
  conflit,
  onToggle,
  reduce,
}: {
  lot: MarketLot;
  lang: "fr" | "en";
  t: Copy;
  retire: boolean;
  conflit: boolean;
  onToggle: () => void;
  reduce: boolean;
}) {
  const f = getFiliere(lot.filiere);
  const vendable = estVendable(lot) && !conflit; // sceau vérifié + listé + sans conflit inter-lots
  const isReserved = lot.statutMarche === "reserve";
  const publie = !retire;
  const [journalOuvert, setJournalOuvert] = useState(false);
  // Jalons ajoutés PAR SCAN dans la session (les constantes seedées ne sont jamais mutées).
  const [jalonsSession, setJalonsSession] = useState<JalonPossession[]>([]);
  const journal = [...lot.journalPossession, ...jalonsSession];

  return (
    <article
      className="card-premium flex h-full flex-col rounded-2xl p-5"
      style={{ boxShadow: `inset 3px 0 0 0 ${f.couleur}` }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-forest-950">{lot.nomLot}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-forest-950/60">
            <span className="inline-flex items-center gap-1" style={{ color: f.couleur }}>
              <f.icone size={12} /> {lot.filiereLabel}
            </span>
            <span className="inline-flex items-center gap-1"><MapPin size={12} /> {lot.regions.join(", ")}</span>
            <span className="num text-forest-950/40">{t.campagne} {lot.campagne}</span>
          </p>
        </div>
        {/* Chip d'état de publication */}
        {isReserved ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-forest-950/15 bg-forest-950/[0.04] px-2.5 py-1 text-[0.68rem] font-semibold text-forest-950/70">
            <Ship size={12} /> {t.reserve}
          </span>
        ) : !vendable ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-cacao/30 bg-amber-cacao/10 px-2.5 py-1 text-[0.68rem] font-semibold text-amber-cacao">
            <ShieldAlert size={12} /> {lang === "en" ? "In prep." : "En prépa."}
          </span>
        ) : publie ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-green-signal/30 bg-green-signal/10 px-2.5 py-1 text-[0.68rem] font-semibold text-green-signal">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-signal" /> {t.enLigne}
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-[0.68rem] font-semibold text-forest-950/55">
            {t.filters.retires}
          </span>
        )}
      </div>

      <SceauAgrivo sceau={lot.sceau} lang={lang} detaille />

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-ivory p-3.5 text-sm">
        <div>
          <dt className="text-xs text-forest-950/55">{t.tonnage}</dt>
          <dd className="num font-semibold text-forest-950">{lot.tonnage.toFixed(1)} t</dd>
        </div>
        <div>
          <dt className="text-xs text-forest-950/55">{t.prix}</dt>
          <dd className="num font-semibold text-forest-950">{fcfa(lot.prixIndicatifFcfaKg)} <span className="text-forest-950/45">FCFA/kg</span></dd>
        </div>
        <div>
          <dt className="text-xs text-forest-950/55">{t.valeur}</dt>
          <dd className="num font-semibold text-forest-950">{fcfa(lot.valeurFcfa)} <span className="text-forest-950/45">FCFA</span></dd>
        </div>
        <div>
          <dt className="text-xs text-forest-950/55">{t.commission}</dt>
          <dd className="num font-semibold text-green-signal">{fcfa(takeRate(lot.valeurFcfa))} <span className="text-green-signal/60">FCFA</span></dd>
        </div>
      </dl>
      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-forest-950/45">
        <Boxes size={11} /> {lot.nbParcelles} {t.parcelles}
      </p>

      {/* Journal du lot (registre de possession amont, dépliable) */}
      <button
        onClick={() => setJournalOuvert((o) => !o)}
        aria-expanded={journalOuvert}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-forest-950/65 transition-colors hover:text-forest-950"
      >
        <motion.span
          animate={{ rotate: journalOuvert ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }}
          className="inline-flex"
        >
          <ChevronDown size={14} />
        </motion.span>
        {t.journal}
        {lot.alertesVolume.length > 0 && (
          <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-block px-1 text-[0.6rem] font-bold text-white">
            {lot.alertesVolume.length}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {journalOuvert && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-black/[0.06] bg-ivory/60 p-4">
              <JournalLot journal={journal} alertes={lot.alertesVolume} lang={lang} />
              <ScanDocument lang={lang} onAjout={(j) => setJalonsSession((prev) => [...prev, j])} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation inline après un retrait */}
      <AnimatePresence>
        {vendable && !isReserved && retire && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-black/[0.07] bg-black/[0.02] px-3 py-2 text-xs text-forest-950/65">
              {t.retireInfo}
              <button onClick={onToggle} className="inline-flex shrink-0 items-center gap-1 font-semibold text-green-signal hover:underline">
                <Undo2 size={12} /> {t.annuler}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
        {isReserved ? (
          <span className="text-xs text-forest-950/55">
            {lot.acheteur ? `${t.reserveBy} ${lot.acheteur}` : t.reserve}
          </span>
        ) : !vendable ? (
          <p className="max-w-[70%] text-xs leading-relaxed text-amber-cacao">{t.nonVendable}</p>
        ) : publie ? (
          <button
            onClick={onToggle}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-forest-950/70 transition hover:border-red-block/40 hover:text-red-block"
          >
            {t.retirer}
          </button>
        ) : (
          <button onClick={onToggle} className="btn-green inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
            <Check size={15} /> {t.publier}
          </button>
        )}

        <Link
          href={`/marketplace/lot/${lot.ref}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-950/60 transition hover:text-forest-950"
        >
          <ExternalLink size={13} /> {t.fiche}
        </Link>
      </div>
    </article>
  );
}

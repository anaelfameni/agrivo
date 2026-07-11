"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, Building2, FileCheck2, Phone, Plus, Trash2, Users } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { StatNumber } from "@/components/ui/stat-number";
import { AjouterCooperative } from "@/components/exportateur/ajouter-cooperative";
import type { SiegeItem } from "@/components/exportateur/sieges-map";
import { COOPERATIVES_INFO, statsPourCoop } from "@/data/cooperatives";
import { FILIERE_LABEL } from "@/config/filieres";
import { lireCoopsLocales, supprimerCoopLocale, type CoopLocale } from "@/lib/coops-locales";
import { PARCELLES } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;

const SiegesMap = dynamic(() => import("@/components/exportateur/sieges-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center rounded-2xl bg-forest-950 text-white/60">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70" aria-hidden />
    </div>
  ),
});

const COPY = {
  fr: {
    eyebrow: "Espace exportateur",
    titre: "Coopératives",
    sous: "Votre réseau d'approvisionnement, coopérative par coopérative. Sur la carte : la position du siège (un point), jamais une superficie. Les parcelles vivent sur la page Parcelles.",
    ajouter: "Ajouter une coopérative",
    kpi: { coops: "Coopératives suivies", producteurs: "Producteurs déclarés", taux: "Taux de conformité moyen", alertes: "Alertes actives" },
    fiche: { parcelles: "Parcelles vérifiées", declares: "producteurs déclarés", voir: "Voir ses parcelles" },
    importee: "Ajoutée par vous",
    auditResume: (pct: number, total: number) => `Registre importé : ${pct} % prêt (${total} parcelles)`,
    piecesSg: "pièce au dossier",
    piecesPl: "pièces au dossier",
    sansAudit: "Aucun registre importé pour l'instant.",
    retirer: "Retirer cette coopérative",
    ajouteeOk: (nom: string) => `« ${nom} » ajoutée à votre portefeuille.`,
    carte: "Sièges des coopératives",
    conformite: "Conformité",
  },
  en: {
    eyebrow: "Exporter workspace",
    titre: "Cooperatives",
    sous: "Your sourcing network, cooperative by cooperative. On the map: the headquarters position (a point), never an area. Plots live on the Plots page.",
    ajouter: "Add a cooperative",
    kpi: { coops: "Cooperatives tracked", producteurs: "Declared farmers", taux: "Average compliance rate", alertes: "Active alerts" },
    fiche: { parcelles: "Plots verified", declares: "declared farmers", voir: "View its plots" },
    importee: "Added by you",
    auditResume: (pct: number, total: number) => `Imported register: ${pct}% ready (${total} plots)`,
    piecesSg: "attachment on file",
    piecesPl: "attachments on file",
    sansAudit: "No register imported yet.",
    retirer: "Remove this cooperative",
    ajouteeOk: (nom: string) => `"${nom}" added to your portfolio.`,
    carte: "Cooperative headquarters",
    conformite: "Compliance",
  },
} as const;

export default function CooperativesPage() {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];

  const [locales, setLocales] = React.useState<CoopLocale[]>([]);
  const [panneau, setPanneau] = React.useState(false);
  const [selection, setSelection] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  // Hydratation des coopératives ajoutées + ouverture auto du panneau via ?ajouter=1.
  React.useEffect(() => {
    setLocales(lireCoopsLocales());
    try {
      if (new URLSearchParams(window.location.search).get("ajouter")) setPanneau(true);
    } catch {
      /* ignore */
    }
  }, []);

  const fiches = React.useMemo(
    () =>
      COOPERATIVES_INFO.map((c) => ({ info: c, stats: statsPourCoop(c.nom, PARCELLES), locale: null as CoopLocale | null })).concat(
        locales.map((l) => ({
          info: {
            id: l.id,
            nom: l.nom,
            region: l.region,
            ville: l.ville ?? l.region,
            siege: l.siege ?? ([6.2, -5.8] as [number, number]),
            gerant: l.gerant ?? "—",
            telephone: l.telephone ?? "—",
            producteursDeclares: l.producteursDeclares ?? 0,
            membreDepuis: l.ajouteeLe,
          },
          stats: statsPourCoop(l.nom, PARCELLES),
          locale: l,
        })),
      ),
    [locales],
  );

  const siegeItems: SiegeItem[] = React.useMemo(
    () =>
      fiches
        .filter((f) => !f.locale || f.locale.siege) // une coop ajoutée sans siège n'apparaît pas sur la carte
        .map((f) => ({
          id: f.info.id,
          nom: f.info.nom,
          ville: f.info.ville,
          region: f.info.region,
          siege: f.info.siege,
          parcelles: f.stats.parcelles,
          tauxConformite: f.stats.tauxConformite,
          alertes: f.stats.alertes,
          importee: Boolean(f.locale),
        })),
    [fiches],
  );

  const totaux = React.useMemo(() => {
    const declares = fiches.reduce((s, f) => s + (f.info.producteursDeclares || 0), 0);
    const avecParcelles = fiches.filter((f) => f.stats.parcelles > 0);
    const taux = avecParcelles.length
      ? Math.round(avecParcelles.reduce((s, f) => s + f.stats.tauxConformite, 0) / avecParcelles.length)
      : 0;
    return {
      coops: fiches.length,
      declares,
      taux,
      alertes: fiches.reduce((s, f) => s + f.stats.alertes, 0),
    };
  }, [fiches]);

  function onAjoutee(coop: CoopLocale) {
    setLocales(lireCoopsLocales());
    setPanneau(false);
    setSelection(coop.id);
    setToast(t.ajouteeOk(coop.nom));
    setTimeout(() => setToast(null), 4200);
  }

  function retirer(id: string) {
    supprimerCoopLocale(id);
    setLocales(lireCoopsLocales());
    if (selection === id) setSelection(null);
  }

  const kpis = [
    { label: t.kpi.coops, value: totaux.coops, suffix: "", Icon: Building2 },
    { label: t.kpi.producteurs, value: totaux.declares, suffix: "", Icon: Users },
    { label: t.kpi.taux, value: totaux.taux, suffix: " %", Icon: FileCheck2 },
    { label: t.kpi.alertes, value: totaux.alertes, suffix: "", Icon: Bell },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* En-tête + action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-green-signal">{t.eyebrow}</p>
          <h1 className="mt-1.5 font-display text-3xl leading-tight text-forest-950">{t.titre}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-stone-500">{t.sous}</p>
        </div>
        <button
          type="button"
          data-tour="ajouter-cooperative"
          onClick={() => setPanneau((v) => !v)}
          className="btn-green inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
        >
          <Plus size={17} strokeWidth={2.25} aria-hidden />
          {t.ajouter}
        </button>
      </div>

      {/* Toast d'ajout */}
      <AnimatePresence>
        {toast && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-green-signal/25 bg-green-signal/[0.07] px-4 py-3 text-sm text-forest-950"
            role="status"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Panneau d'ajout */}
      <AnimatePresence>{panneau && <AjouterCooperative onAjoutee={onAjoutee} onFermer={() => setPanneau(false)} />}</AnimatePresence>

      {/* KPI */}
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
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-green-signal/10" aria-hidden>
              <k.Icon size={16} strokeWidth={2} className="text-green-signal" />
            </span>
            <div className="mt-3 num text-2xl font-semibold tracking-tight text-forest-950">
              <StatNumber value={k.value} suffix={k.suffix} />
            </div>
            <p className="mt-0.5 text-[0.8rem] font-medium text-forest-950">{k.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Fiches ↔ carte des sièges */}
      <div className="grid gap-4 xl:grid-cols-12">
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.04 } } }}
          className="flex flex-col gap-3 xl:col-span-7"
          data-tour="liste-cooperatives"
        >
          {fiches.map((f) => {
            const active = selection === f.info.id;
            return (
              <motion.li
                key={f.info.id}
                variants={{
                  hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelection(active ? null : f.info.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelection(active ? null : f.info.id);
                    }
                  }}
                  className={`card-premium group cursor-pointer p-4 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-green-signal sm:p-5 ${
                    active ? "ring-2 ring-green-signal/50" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-forest-950">{f.info.nom}</h2>
                        {f.locale && (
                          <span className="rounded-full border border-amber-cacao/30 bg-amber-cacao/[0.08] px-2 py-0.5 text-[0.65rem] font-semibold text-amber-cacao">
                            {t.importee}
                          </span>
                        )}
                        {f.stats.alertes > 0 && (
                          <span className="num inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-block px-1.5 text-[0.65rem] font-semibold text-white">
                            {f.stats.alertes}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        {f.info.ville} · {f.info.region} · <span className="num">{f.info.producteursDeclares || "—"}</span> {t.fiche.declares}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                        <Phone size={11} strokeWidth={2} aria-hidden className="text-stone-400" />
                        {f.info.gerant} · <span className="num">{f.info.telephone}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="num text-xl font-semibold text-forest-950">{f.stats.parcelles}</p>
                      <p className="text-[0.68rem] text-stone-400">{t.fiche.parcelles}</p>
                    </div>
                  </div>

                  {/* Conformité dérivée des parcelles vérifiées, ou résumé d'audit pour une coop importée */}
                  {f.stats.parcelles > 0 ? (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-500">{t.conformite}</span>
                        <span className="num font-semibold text-forest-950">{f.stats.tauxConformite} %</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.06]" aria-hidden>
                        <div className="bar-fill h-full rounded-full bg-gradient-to-r from-green-signal to-[#22c55e]" style={{ width: `${f.stats.tauxConformite}%` }} />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-stone-500">
                      {f.locale?.audit ? t.auditResume(f.locale.audit.pretPct, f.locale.audit.total) : t.sansAudit}
                    </p>
                  )}

                  {/* Pièces jointes au dossier (métadonnées locales — jamais téléversées) */}
                  {f.locale?.documents && f.locale.documents.length > 0 && (
                    <p className="mt-1.5 text-[0.7rem] text-stone-500">
                      📎 {f.locale.documents.length} {f.locale.documents.length > 1 ? t.piecesPl : t.piecesSg}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(f.locale ? f.locale.filieres : f.stats.filieres).map((fil) => (
                        <span key={fil} className="rounded-full border border-black/[0.06] bg-ivory-deep/50 px-2 py-0.5 text-[0.65rem] text-stone-600">
                          {FILIERE_LABEL[fil]}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      {f.stats.parcelles > 0 && (
                        <Link
                          href={`/app/exportateur/parcelles?coop=${encodeURIComponent(f.info.nom)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full border border-black/10 px-3 py-1.5 text-[0.7rem] font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal"
                        >
                          {t.fiche.voir}
                        </Link>
                      )}
                      {f.locale && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            retirer(f.info.id);
                          }}
                          aria-label={t.retirer}
                          title={t.retirer}
                          className="grid h-7 w-7 place-items-center rounded-full text-stone-400 outline-none transition-colors hover:bg-red-block/10 hover:text-red-block focus-visible:ring-2 focus-visible:ring-red-block/40"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* Carte des sièges */}
        <div className="xl:col-span-5">
          <div className="h-[380px] overflow-hidden rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(10,31,20,0.04)] xl:sticky xl:top-24 xl:h-[560px]" data-tour="carte-sieges" aria-label={t.carte}>
            <SiegesMap items={siegeItems} selectedId={selection} onSelect={(id) => setSelection(id === selection ? null : id)} />
          </div>
        </div>
      </div>
    </div>
  );
}

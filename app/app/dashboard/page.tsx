"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Bell, CheckCircle2, ChevronRight, CloudOff, Download, FileCheck2, MapPin, Plus, Search, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { StatNumber } from "@/components/ui/stat-number";
import { StatusBadge } from "@/components/ui/status-badge";
import { PinMark } from "@/components/ui/pin-mark";
import { EmptyState } from "@/components/ui/empty-state";
import { Magnetic } from "@/components/ui/motion-primitives";
import { RegistreImport } from "@/components/app/registre-import";
import { RegularisationPanel } from "@/components/app/regularisation-panel";
import { SurveillancePanel } from "@/components/exportateur/surveillance-panel";
import { OnboardingStats } from "@/components/app/onboarding-stats";
import { useLanguage } from "@/components/language-provider";
import {
  COOP_DEMO,
  MANAGER_DEMO,
  FILIERE_LABEL,
  coopStats,
  exporterFeatureCollection,
  fmtHa,
  formatDateFr,
  parcellesForCoop,
  type Parcelle,
  type Statut,
} from "@/data/mock-parcelles";
import {
  JALONS_ORDRE,
  JALON_LABEL,
  expeditionsPourCoop,
  parcellesExpedition,
  progressionExpedition,
  statutExpedition,
} from "@/data/mock-expeditions";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  fr: {
    verifRecorded: (nom: string) => (
      <>Vérification de <span className="font-semibold">{nom}</span> enregistrée.</>
    ),
    close: "Fermer",
    eyebrow: "Espace coopérative",
    hello: "Bonjour",
    newVerif: "Nouvelle vérification",
    plan: "Abonnement coopérative · 100 000 FCFA/mois",
    logout: "Déconnexion",
    repartition: "Répartition des statuts",
    statuts: { conforme: "Conforme", anomalie: "Anomalie détectée", insuffisant: "Données insuffisantes" },
    kpi: {
      verifiees: { label: "Parcelles vérifiées", sub: "ce mois-ci" },
      taux: { label: "Taux de conformité", sub: "sur les parcelles vérifiées" },
      dossiers: { label: "Dossiers partagés", sub: "avec l'exportateur" },
      alertes: { label: "Alertes actives", sub: "à examiner" },
    },
    searchLabel: "Rechercher un producteur ou un numéro de carte",
    searchPlaceholder: "Rechercher un producteur, un n° de carte…",
    clearSearch: "Effacer la recherche",
    latest: "Dernières vérifications",
    emptyTitle: "Aucun producteur trouvé",
    emptyDesc: (q: string) => `Aucun résultat pour « ${q} ». Vérifiez l'orthographe ou le numéro de carte.`,
    alerts: "Alertes",
    noAlerts: "Aucune alerte active. Les nouvelles anomalies détectées apparaîtront ici.",
    newAnomaly: "Nouvelle anomalie détectée",
    onPlot: (nom: string, region: string) => `Sur la parcelle de ${nom} · ${region}`,
    exportRegistre: "Exporter (GeoJSON)",
    reverifTitle: "À re-vérifier",
    reverifSub: "Nouveau passage satellite requis (Données insuffisantes).",
    reverifNone: "Aucune parcelle en attente : toutes ont pu être statuées.",
    dateLocale: "fr-FR",
  },
  en: {
    verifRecorded: (nom: string) => (
      <>Verification of <span className="font-semibold">{nom}</span> recorded.</>
    ),
    close: "Close",
    eyebrow: "Cooperative workspace",
    hello: "Hello",
    newVerif: "New verification",
    plan: "Cooperative plan · 100,000 FCFA/month",
    logout: "Sign out",
    repartition: "Status breakdown",
    statuts: { conforme: "Compliant", anomalie: "Anomaly detected", insuffisant: "Insufficient data" },
    kpi: {
      verifiees: { label: "Plots verified", sub: "this month" },
      taux: { label: "Compliance rate", sub: "across verified plots" },
      dossiers: { label: "Shared files", sub: "with the exporter" },
      alertes: { label: "Active alerts", sub: "to review" },
    },
    searchLabel: "Search for a farmer or a card number",
    searchPlaceholder: "Search a farmer, a card number…",
    clearSearch: "Clear search",
    latest: "Latest verifications",
    emptyTitle: "No farmer found",
    emptyDesc: (q: string) => `No result for "${q}". Check the spelling or the card number.`,
    alerts: "Alerts",
    noAlerts: "No active alert. Newly detected anomalies will appear here.",
    newAnomaly: "New anomaly detected",
    onPlot: (nom: string, region: string) => `On ${nom}'s plot · ${region}`,
    exportRegistre: "Export (GeoJSON)",
    reverifTitle: "To re-verify",
    reverifSub: "New satellite pass required (Insufficient data).",
    reverifNone: "No plot pending: all could be decided.",
    dateLocale: "en-GB",
  },
};

export default function DashboardPage() {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];
  const { user } = useAuth();
  const firstName = user?.nom?.trim().split(/\s+/)[0] || MANAGER_DEMO;
  const organisation = user?.organisation || COOP_DEMO;
  const [query, setQuery] = useState("");
  const [today, setToday] = useState("");
  const [justVerified, setJustVerified] = useState<{ nom: string; statut: Statut } | null>(null);

  // Reflète une vérification qui vient d'être finalisée dans le parcours (Prompt 4).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("agrivo_verifie");
      if (raw) {
        const v = JSON.parse(raw) as { nom: string; statut: Statut };
        setJustVerified({ nom: v.nom, statut: v.statut });
        sessionStorage.removeItem("agrivo_verifie");
      }
    } catch {
      /* stockage indisponible */
    }
  }, []);

  // Date « live » côté client uniquement → évite tout écart d'hydratation SSR/CSR.
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(t.dateLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  }, [t.dateLocale]);

  const parcelles = useMemo(() => parcellesForCoop(), []);
  const stats = useMemo(() => coopStats(parcelles), [parcelles]);
  const alertes = useMemo(() => parcelles.filter((p) => p.alerteActive), [parcelles]);
  const aReverifier = useMemo(() => parcelles.filter((p) => p.statut === "insuffisant"), [parcelles]);

  /** Télécharge le registre de la coopérative au format GeoJSON (RFC 7946), prêt pour TRACES NT. */
  function exporterRegistre() {
    const fc = exporterFeatureCollection(parcelles);
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agrivo-registre-${parcelles.length}-parcelles.geojson`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const recentes = useMemo(
    () => [...parcelles].sort((a, b) => b.dateVerification.localeCompare(a.dateVerification)),
    [parcelles],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recentes;
    return recentes.filter(
      (p) =>
        p.producteurNom.toLowerCase().includes(q) ||
        p.numeroCartePro.toLowerCase().includes(q),
    );
  }, [query, recentes]);

  const kpis = [
    { ...t.kpi.verifiees, value: stats.verifiees, suffix: "", Icon: MapPin, tint: "rgba(22,163,74,0.12)", color: "var(--color-green-signal)", glow: "rgba(22,163,74,0.5)", pct: null as number | null },
    { ...t.kpi.taux, value: stats.tauxConformite, suffix: " %", Icon: ShieldCheck, tint: "rgba(22,163,74,0.12)", color: "var(--color-green-signal)", glow: "rgba(22,163,74,0.5)", pct: stats.tauxConformite },
    { ...t.kpi.dossiers, value: stats.dossiersPartages, suffix: "", Icon: FileCheck2, tint: "rgba(22,163,74,0.12)", color: "var(--color-green-signal)", glow: "rgba(22,163,74,0.5)", pct: null },
    { ...t.kpi.alertes, value: stats.alertes, suffix: "", Icon: Bell, tint: "rgba(180,35,30,0.10)", color: "var(--color-red-block)", glow: "rgba(180,35,30,0.4)", pct: null },
  ];

  // Santé du portefeuille coopérative : répartition des 3 statuts verbatim (charte).
  const repartition = [
    { key: "conforme", label: t.statuts.conforme, count: parcelles.filter((p) => p.statut === "conforme").length, color: "var(--color-green-signal)" },
    { key: "anomalie", label: t.statuts.anomalie, count: parcelles.filter((p) => p.statut === "anomalie").length, color: "var(--color-red-block)" },
    { key: "insuffisant", label: t.statuts.insuffisant, count: parcelles.filter((p) => p.statut === "insuffisant").length, color: "var(--color-amber-cacao)" },
  ];
  const totalRep = parcelles.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Bandeau : vérification qui vient d'être finalisée */}
      {justVerified && (
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center gap-3 rounded-2xl border border-green-signal/25 bg-green-signal/[0.07] px-4 py-3"
        >
          <CheckCircle2 size={20} strokeWidth={2} className="shrink-0 text-green-signal" aria-hidden />
          <p className="flex-1 text-sm text-forest-950">{t.verifRecorded(justVerified.nom)}</p>
          <StatusBadge statut={justVerified.statut} size="sm" lang={lang} />
          <button
            type="button"
            onClick={() => setJustVerified(null)}
            aria-label={t.close}
            className="grid h-8 w-8 place-items-center rounded-full text-stone-400 outline-none transition-colors hover:bg-black/5 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </motion.div>
      )}

      {/* En-tête « hero » vert forêt : l'identité de marque revient au premier plan */}
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="panel-forest relative overflow-hidden rounded-3xl border border-white/10 p-6 shadow-[0_30px_70px_-40px_rgba(10,31,20,0.8)] sm:p-8"
      >
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-green-signal/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-amber-cacao/10 blur-3xl" />
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.05]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-2 text-green-signal">
              <span className="glow-pulse inline-block h-1.5 w-1.5 rounded-full bg-green-signal" />
              {t.eyebrow}
            </p>
            <h1 className="mt-2.5 font-display text-3xl leading-tight text-white sm:text-[2.6rem]">
              {t.hello} {firstName}
            </h1>
            <p className="mt-1.5 text-sm text-white/55">
              {organisation}
              {today && (
                <>
                  {" · "}
                  <span className="capitalize">{today}</span>
                </>
              )}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-signal/30 bg-green-signal/10 px-3 py-1 text-xs font-medium text-green-signal">
              <ShieldCheck size={13} strokeWidth={2} aria-hidden />
              {t.plan}
            </span>
          </div>

          <Magnetic strength={0.25} className="w-full sm:w-auto">
            <Link
              href="/app/consentement"
              data-tour="nouvelle-verification"
              className="btn-green inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950 sm:w-auto"
            >
              <Plus size={18} strokeWidth={2.25} aria-hidden />
              {t.newVerif}
            </Link>
          </Magnetic>
        </div>
      </motion.div>

      {/* KPI */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.07 } } }}
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        data-tour="kpis"
      >
        {kpis.map((k) => (
          <motion.div
            key={k.label}
            variants={{
              hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
            }}
            className="card-premium group relative overflow-hidden p-4 sm:p-5"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: k.glow }}
            />
            <div className="relative flex items-center justify-between">
              <span
                className="grid h-10 w-10 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: k.tint }}
                aria-hidden
              >
                <k.Icon size={19} strokeWidth={2} style={{ color: k.color }} />
              </span>
            </div>
            <div className="relative mt-3.5 num text-3xl font-semibold tracking-tight text-forest-950 sm:text-[2.1rem]">
              <StatNumber value={k.value} suffix={k.suffix} />
            </div>
            <p className="relative mt-1 text-sm font-medium text-forest-950">{k.label}</p>
            <p className="relative text-xs text-stone-400">{k.sub}</p>
            {k.pct != null && (
              <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="bar-fill h-full rounded-full bg-gradient-to-r from-green-signal to-[#22c55e]"
                  style={{ width: `${Math.min(100, Math.max(0, k.pct))}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Santé du portefeuille : répartition des 3 statuts (verbatim charte) */}
      <div className="card-premium p-4 sm:p-5" data-tour="repartition">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
            <span className="h-4 w-1 rounded-full bg-green-signal" aria-hidden />
            {t.repartition}
          </h2>
          <span className="num text-xs text-stone-400">{totalRep}</span>
        </div>
        <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-black/[0.06]" aria-hidden>
          {repartition.map((r) =>
            r.count > 0 ? (
              <div key={r.key} style={{ width: `${totalRep ? (r.count / totalRep) * 100 : 0}%`, background: r.color }} />
            ) : null,
          )}
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
          {repartition.map((r) => (
            <li key={r.key} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} aria-hidden />
              <span className="text-sm text-forest-950">{r.label}</span>
              <span className="num ml-auto text-sm font-semibold text-forest-950">{r.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contenu principal + rail d'alertes (alertes en tête sur mobile) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="order-2 flex flex-col gap-4 lg:order-none lg:col-span-2">
          {/* Import & audit RDUE du registre de la coopérative */}
          <div data-tour="registre-import">
            <RegistreImport />
          </div>

          {/* Surveillance continue : cadence de revue 90 j + alertes, sur les parcelles de la coop */}
          <SurveillancePanel lang={lang === "en" ? "en" : "fr"} parcelles={parcelles} />

          {/* File de régularisation : gages administratifs manquants (carte producteur, réf. DDR) */}
          <RegularisationPanel lang={lang === "en" ? "en" : "fr"} parcelles={parcelles} />

          {/* Traçabilité aval (lecture seule) : où vont les parcelles de la coopérative */}
          <ParcellesEnExpedition lang={lang} />

          {/* Recherche producteur */}
          <div className="relative">
            <Search
              size={18}
              strokeWidth={2}
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              className="h-12 w-full rounded-full border border-black/[0.08] bg-white pl-11 pr-11 text-sm text-forest-950 outline-none transition-[border-color,box-shadow] placeholder:text-stone-400 focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t.clearSearch}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-stone-400 outline-none transition-colors hover:bg-black/5 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Liste des dernières vérifications */}
          <div className="card-premium overflow-hidden p-2 sm:p-3">
            <div className="flex items-center justify-between px-3 py-2.5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
                <span className="h-4 w-1 rounded-full bg-green-signal" aria-hidden />
                {t.latest}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={exporterRegistre}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
                >
                  <Download size={13} strokeWidth={2} aria-hidden />
                  {t.exportRegistre}
                </button>
                <span className="num text-xs text-stone-400">
                  {filtered.length} / {recentes.length}
                </span>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-2">
                <EmptyState
                  title={t.emptyTitle}
                  description={t.emptyDesc(query.trim())}
                  action={
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal"
                    >
                      {t.clearSearch}
                    </button>
                  }
                />
              </div>
            ) : (
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.035 } } }}
                className="flex flex-col"
              >
                {filtered.map((p) => (
                  <motion.li
                    key={p.id}
                    variants={{
                      hidden: reduce ? { opacity: 1 } : { opacity: 0, x: -8 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
                    }}
                  >
                    <VerificationRow parcelle={p} lang={lang} />
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </section>

        {/* Rail : centre d'alertes + parcelles à re-vérifier */}
        <aside className="order-1 flex flex-col gap-6 lg:order-none lg:col-span-1">
          <div className="card-premium p-4 sm:p-5" data-tour="alertes">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
                <span className="relative grid h-8 w-8 place-items-center rounded-xl" style={{ background: "rgba(180,35,30,0.10)" }} aria-hidden>
                  <Bell size={16} strokeWidth={2} className="text-red-block" />
                </span>
                {t.alerts}
              </h2>
              {alertes.length > 0 && (
                <span className="num inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-red-block px-1.5 text-xs font-semibold text-white">
                  {alertes.length}
                </span>
              )}
            </div>

            {alertes.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">{t.noAlerts}</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {alertes.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/app/parcelle/${p.id}`}
                      className="group flex items-start gap-3 rounded-xl border border-red-block/15 bg-red-block/[0.04] p-3 outline-none transition-colors hover:bg-red-block/[0.07] focus-visible:ring-2 focus-visible:ring-red-block/40"
                    >
                      <PinMark size={22} color="var(--color-red-block)" pulse className="mt-0.5 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-forest-950">{t.newAnomaly}</span>
                        <span className="mt-0.5 block text-xs text-stone-500">
                          {t.onPlot(p.producteurNom, p.region)}
                        </span>
                      </span>
                      <ChevronRight
                        size={16}
                        strokeWidth={2}
                        aria-hidden
                        className="mt-0.5 shrink-0 text-red-block/50 transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Parcelles en « Données insuffisantes » : à reprogrammer (nouveau passage satellite) */}
          <div className="card-premium p-4 sm:p-5" data-tour="reverifier">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
                <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: "rgba(200,134,29,0.12)" }} aria-hidden>
                  <CloudOff size={16} strokeWidth={2} className="text-amber-cacao" />
                </span>
                {t.reverifTitle}
              </h2>
              {aReverifier.length > 0 && (
                <span className="num inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-cacao px-1.5 text-xs font-semibold text-white">
                  {aReverifier.length}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-stone-500">{t.reverifSub}</p>
            {aReverifier.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">{t.reverifNone}</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {aReverifier.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/app/parcelle/${p.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-amber-cacao/20 bg-amber-cacao/[0.05] px-3 py-2.5 outline-none transition-colors hover:bg-amber-cacao/[0.09] focus-visible:ring-2 focus-visible:ring-amber-cacao/40"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-forest-950">{p.producteurNom}</span>
                        <span className="num mt-0.5 block text-xs text-stone-500">{p.numeroCartePro} · {fmtHa(p.superficieHa)}</span>
                      </span>
                      <ChevronRight size={15} strokeWidth={2} aria-hidden className="shrink-0 text-amber-cacao/60 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Coût d'onboarding mesuré (interne ; invisible tant qu'aucun parcours complété) */}
          <OnboardingStats />
        </aside>
      </div>
    </div>
  );
}

/** Ligne compacte d'une vérification récente → vue détaillée de la parcelle. */
function VerificationRow({ parcelle: p, lang }: { parcelle: Parcelle; lang: "fr" | "en" }) {
  return (
    <Link
      href={`/app/parcelle/${p.id}`}
      className="group grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3 outline-none transition-colors hover:bg-green-signal/[0.06] focus-visible:ring-2 focus-visible:ring-green-signal/40"
    >
      <div className="min-w-0">
        <span className="block truncate text-sm font-medium text-forest-950 transition-colors group-hover:text-green-signal">{p.producteurNom}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
          <StatusBadge statut={p.statut} size="sm" lang={lang} />
          <span className="num text-stone-400">{p.numeroCartePro}</span>
          <span aria-hidden className="text-stone-300">·</span>
          <span>{FILIERE_LABEL[p.filiere]}</span>
          <span aria-hidden className="text-stone-300">·</span>
          <span className="num">{fmtHa(p.superficieHa)}</span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-stone-400">
        <span className="num hidden text-xs sm:inline">{formatDateFr(p.dateVerification)}</span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-transparent transition-colors group-hover:bg-green-signal/12">
          <ChevronRight
            size={18}
            strokeWidth={2}
            aria-hidden
            className="shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-green-signal"
          />
        </span>
      </div>
    </Link>
  );
}

/**
 * Traçabilité aval, en LECTURE SEULE : les expéditions de l'exportateur qui contiennent des
 * parcelles de la coopérative. La coop voit où va son cacao (jalon documentaire courant) —
 * cohérent avec l'étape Valorisation (« Partager le dossier avec l'exportateur »).
 */
function ParcellesEnExpedition({ lang }: { lang: "fr" | "en" }) {
  const expeditions = expeditionsPourCoop(COOP_DEMO);
  if (expeditions.length === 0) return null;
  const en = lang === "en";
  return (
    <div className="card-premium p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
        <span className="h-4 w-1 rounded-full bg-green-signal" aria-hidden />
        {en ? "Your plots in shipments" : "Vos parcelles en expédition"}
      </h2>
      <p className="mt-1 text-xs text-stone-500">
        {en
          ? "Read-only view: your verified plots contributed to the exporter's shipment files."
          : "Vue en lecture seule : vos parcelles vérifiées intégrées aux dossiers d'expédition de l'exportateur."}
      </p>
      <ul className="mt-3 space-y-2">
        {expeditions.map((exp) => {
          const parcellesCoop = parcellesExpedition(exp).filter((p) => p.cooperative === COOP_DEMO);
          const prog = progressionExpedition(exp);
          return (
            <li key={exp.id} className="rounded-xl border border-black/[0.06] bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs text-forest-950">{exp.ref}</p>
                <p className="text-[11px] font-semibold text-green-signal">
                  {JALON_LABEL[statutExpedition(exp).code][lang]}
                </p>
              </div>
              <p className="mt-1 text-xs text-stone-600">
                {parcellesCoop.map((p) => p.producteurNom).join(" · ")}
              </p>
              <div className="mt-2 flex items-center gap-1" aria-hidden>
                {JALONS_ORDRE.map((code, i) => (
                  <span key={code} className={`h-1 flex-1 rounded-full ${i < prog ? "bg-green-signal" : "bg-forest-950/10"}`} />
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

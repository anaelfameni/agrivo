"use client";
import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, FileCheck2, QrCode, ScrollText, Search, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { StatNumber } from "@/components/ui/stat-number";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FILIERE_LABEL, formatDate, parcellesForCoop } from "@/data/mock-parcelles";
/**
 * Certificats (espace coopérative) : tous les certificats d'évaluation de conformité émis
 * pour la coopérative — numéro AGV, référence DDR, date, et lien de vérification publique
 * (la même page que celle ouverte par le QR code du PDF : n'importe quel acheteur peut
 * vérifier sans compte). Les parcelles en « Données insuffisantes » n'ont pas encore de
 * certificat : elles vivent dans la file « À re-vérifier » du tableau de bord.
 */
const EASE = [0.16, 1, 0.3, 1] as const;
const COPY = {
  fr: {
    eyebrow: "Espace coopérative",
    titre: "Certificats",
    sous: "Tous vos certificats d'évaluation de conformité : numéro, référence DDR et lien de vérification publique. N'importe quel acheteur peut scanner le QR code du PDF et vérifier le verdict, sans compte.",
    kpi: { emis: "Certificats émis", conformes: "Parcelles conformes", partages: "Dossiers partagés" },
    searchAria: "Rechercher un certificat, un producteur",
    searchPlaceholder: "Rechercher un n° AGV, un producteur…",
    clear: "Effacer la recherche",
    liste: "Certificats émis",
    verif: "Vérification publique",
    ouvrirParcelle: "Ouvrir la parcelle",
    emptyTitle: "Aucun certificat trouvé",
    emptyDesc: (q: string) => `Aucun résultat pour « ${q} ».`,
    note: "Un certificat AGRIVO est une évaluation technique : il ne remplace pas la déclaration de diligence raisonnée (DDS) de l'exportateur, seul responsable au sens du règlement (UE) 2023/1115.",
  },
  en: {
    eyebrow: "Cooperative workspace",
    titre: "Certificates",
    sous: "All your compliance-assessment certificates: number, DDR reference and public verification link. Any buyer can scan the PDF's QR code and verify the verdict, without an account.",
    kpi: { emis: "Certificates issued", conformes: "Compliant plots", partages: "Shared files" },
    searchAria: "Search a certificate, a farmer",
    searchPlaceholder: "Search an AGV number, a farmer…",
    clear: "Clear search",
    liste: "Issued certificates",
    verif: "Public verification",
    ouvrirParcelle: "Open the plot",
    emptyTitle: "No certificate found",
    emptyDesc: (q: string) => `No result for "${q}".`,
    note: "An AGRIVO certificate is a technical assessment: it does not replace the exporter's due diligence statement (DDS), the exporter remains solely responsible under Regulation (EU) 2023/1115.",
  },
} as const;
export default function CertificatsPage() {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [query, setQuery] = React.useState("");
  // Un certificat existe pour chaque parcelle statuée (conforme ou anomalie) ;
  // « Données insuffisantes » n'en a pas encore (file « À re-vérifier »).
  const certifiees = React.useMemo(
    () =>
      parcellesForCoop()
        .filter((p) => p.statut !== "insuffisant")
        .sort((a, b) => b.dateVerification.localeCompare(a.dateVerification)),
    [],
  );
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return certifiees;
    return certifiees.filter(
      (p) =>
        p.numeroCertificat.toLowerCase().includes(q) ||
        p.producteurNom.toLowerCase().includes(q) ||
        (p.referenceDDR ?? "").toLowerCase().includes(q),
    );
  }, [query, certifiees]);
  const kpis = [
    { label: t.kpi.emis, value: certifiees.length, Icon: ScrollText },
    { label: t.kpi.conformes, value: certifiees.filter((p) => p.statut === "conforme").length, Icon: FileCheck2 },
    { label: t.kpi.partages, value: certifiees.filter((p) => p.dossierPartage).length, Icon: QrCode },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl leading-tight text-forest-950">{t.titre}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-stone-500">{t.sous}</p>
      </div>
      {/* KPI */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
        className="grid grid-cols-3 gap-3"
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
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-cacao/10" aria-hidden>
              <k.Icon size={16} strokeWidth={2} className="text-amber-cacao" />
            </span>
            <div className="mt-3 num text-2xl font-semibold tracking-tight text-forest-950">
              <StatNumber value={k.value} />
            </div>
            <p className="mt-0.5 text-[0.8rem] font-medium text-forest-950">{k.label}</p>
          </motion.div>
        ))}
      </motion.div>
      {/* Recherche */}
      <div className="relative sm:max-w-md">
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
      {/* Liste des certificats */}
      <div className="card-premium overflow-hidden p-2 sm:p-3">
        <div className="flex items-center justify-between px-3 py-2.5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
            <span className="h-4 w-1 rounded-full bg-amber-cacao" aria-hidden />
            {t.liste}
          </h2>
          <span className="num text-xs text-stone-400">{filtered.length} / {certifiees.length}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-2">
            <EmptyState
              title={t.emptyTitle}
              description={t.emptyDesc(query.trim())}
              action={
                <button type="button" onClick={() => setQuery("")} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal">
                  {t.clear}
                </button>
              }
            />
          </div>
        ) : (
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.03 } } }}
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
                <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-amber-cacao/[0.05]">
                  <div className="min-w-0">
                    <Link
                      href={`/app/parcelle/${p.id}`}
                      title={t.ouvrirParcelle}
                      className="num block truncate text-sm font-semibold text-forest-950 outline-none transition-colors hover:text-green-signal focus-visible:ring-2 focus-visible:ring-green-signal"
                    >
                      {p.numeroCertificat}
                    </Link>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                      <StatusBadge statut={p.statut} size="sm" lang={lang} />
                      <span className="truncate">{p.producteurNom}</span>
                      <span aria-hidden className="text-stone-300">·</span>
                      <span>{FILIERE_LABEL[p.filiere]}</span>
                      {p.referenceDDR && (
                        <>
                          <span aria-hidden className="text-stone-300">·</span>
                          <span className="num">{p.referenceDDR}</span>
                        </>
                      )}
                      <span aria-hidden className="text-stone-300">·</span>
                      <span className="num">{formatDate(p.dateVerification, lang)}</span>
                    </span>
                  </div>
                  <Link
                    href={`/verifier-certificat?ref=${encodeURIComponent(p.numeroCertificat)}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-[0.7rem] font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal"
                  >
                    <ExternalLink size={12} strokeWidth={2} aria-hidden />
                    <span className="hidden sm:inline">{t.verif}</span>
                    <span className="sm:hidden" aria-hidden>QR</span>
                  </Link>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
      <p className="max-w-3xl text-xs leading-relaxed text-stone-400">{t.note}</p>
    </div>
  );
}

"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, Loader2, Download, ShieldCheck, BadgeCheck, ClipboardCopy, TerminalSquare } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { PARCELLES, exporterFeatureCollection, type Parcelle } from "@/data/mock-parcelles";
import { FILIERE_LABEL } from "@/config/filieres";

/**
 * Dossier acheteur EUDR consolidé — aboutissement du pilier Valorisation : la coopérative
 * (ou l'exportateur) génère, pour l'acheteur européen, un dossier des parcelles Conformes avec
 * un résumé exécutif rédigé par l'IA et l'export GeoJSON joint. Zéro finance, zéro garantie.
 *
 * Les faits sont déterministes (calculés sur le portefeuille) ; /api/gemini/dossier-acheteur
 * ne fait que rédiger le résumé exécutif. Repli déterministe si l'IA est indisponible.
 */

const COPY = {
  fr: {
    title: "Dossier acheteur EUDR",
    intro: "Consolidez les parcelles évaluées « Conforme » en un dossier prêt pour l'acheteur européen : résumé exécutif, certificats vérifiables et géométries GeoJSON jointes.",
    conformes: "parcelles Conformes",
    hectares: "hectares vérifiés",
    coops: "coopératives",
    filieres: "filières",
    generate: "Générer le résumé exécutif (IA)",
    generating: "Rédaction du résumé exécutif…",
    live: "Rédigé par l'IA · en direct",
    base: "Résumé déterministe",
    download: "Télécharger le GeoJSON du dossier",
    downloadReport: "Télécharger le rapport consolidé",
    copy: "Copier le résumé",
    copied: "Résumé copié !",
    api: "API REST (offre Pro) :",
    apiHint: "renvoie le portefeuille complet au format TRACES NT (filtre ?statut=conforme).",
    listTitle: "Parcelles incluses",
    certificate: "Certificat",
    reportTitle: "RAPPORT CONSOLIDÉ EUDR, AGRIVO",
    footer: "Évaluation de conformité, non une garantie. L'opérateur reste responsable de sa déclaration de diligence (TRACES NT).",
  },
  en: {
    title: "EUDR buyer file",
    intro: "Consolidate the plots assessed \"Compliant\" into a file ready for the European buyer: executive summary, verifiable certificates and attached GeoJSON geometries.",
    conformes: "Compliant plots",
    hectares: "verified hectares",
    coops: "cooperatives",
    filieres: "value chains",
    generate: "Generate the executive summary (AI)",
    generating: "Writing the executive summary…",
    live: "Written by AI · live",
    base: "Deterministic summary",
    download: "Download the file's GeoJSON",
    downloadReport: "Download the consolidated report",
    copy: "Copy the summary",
    copied: "Summary copied!",
    api: "REST API (Pro plan):",
    apiHint: "returns the full portfolio in TRACES NT format (filter ?statut=conforme).",
    listTitle: "Included plots",
    certificate: "Certificate",
    reportTitle: "EUDR CONSOLIDATED REPORT, AGRIVO",
    footer: "Compliance assessment, not a guarantee. The operator remains responsible for its due diligence statement (TRACES NT).",
  },
} as const;

export function DossierAcheteur() {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [resume, setResume] = React.useState<string | null>(null);
  const [live, setLive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [copie, setCopie] = React.useState(false);

  const conformes = React.useMemo<Parcelle[]>(() => PARCELLES.filter((p) => p.statut === "conforme"), []);

  const faits = React.useMemo(() => {
    const ha = conformes.reduce((s, p) => s + p.superficieHa, 0);
    const coops = [...new Set(conformes.map((p) => p.cooperative))];
    const filieres = [...new Set(conformes.map((p) => FILIERE_LABEL[p.filiere]))];
    const regions = [...new Set(conformes.map((p) => p.region))];
    return {
      nbConformes: conformes.length,
      total: PARCELLES.length,
      haConformes: Math.round(ha * 10) / 10,
      coops: coops.length,
      filieres,
      regions,
    };
  }, [conformes]);

  async function generer() {
    setLoading(true);
    try {
      const r = await fetch("/api/gemini/dossier-acheteur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faits, lang }),
      });
      const data = (await r.json()) as { resume?: string; live?: boolean };
      setResume(data.resume ?? null);
      setLive(Boolean(data.live));
    } catch {
      setResume(null);
    } finally {
      setLoading(false);
    }
  }

  function telecharger() {
    const fc = exporterFeatureCollection(conformes);
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agrivo-dossier-acheteur-${conformes.length}-parcelles.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Rapport consolidé lisible (texte) : en-tête, indicateurs, résumé exécutif s'il existe, liste complète. */
  function telechargerRapport() {
    const date = new Date().toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR");
    const lignes = [
      t.reportTitle,
      `${date} · ${faits.nbConformes}/${faits.total} ${t.conformes} · ${faits.haConformes} ${t.hectares} · ${faits.coops} ${t.coops}`,
      `${lang === "en" ? "Value chains" : "Filières"} : ${faits.filieres.join(", ")} · ${lang === "en" ? "Regions" : "Régions"} : ${faits.regions.join(", ")}`,
      "",
      ...(resume ? [resume, ""] : []),
      `--- ${t.listTitle} (${conformes.length}) ---`,
      ...conformes.map(
        (p) => `${p.producteurNom} · ${p.cooperative} · ${p.superficieHa} ha · ${t.certificate} ${p.numeroCertificat}`,
      ),
      "",
      t.footer,
    ];
    const blob = new Blob([lignes.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agrivo-rapport-eudr-${conformes.length}-parcelles.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copier() {
    if (!resume) return;
    try {
      await navigator.clipboard.writeText(resume);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      /* clipboard indisponible : silencieux */
    }
  }

  const chips: { valeur: string | number; libelle: string }[] = [
    { valeur: faits.nbConformes, libelle: t.conformes },
    { valeur: faits.haConformes, libelle: t.hectares },
    { valeur: faits.coops, libelle: t.coops },
    { valeur: faits.filieres.length, libelle: t.filieres },
  ];

  return (
    <div className="card-premium p-4 sm:p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
        <span className="chip-green grid h-8 w-8 place-items-center rounded-xl" aria-hidden>
          <FileText size={16} strokeWidth={2} className="text-green-signal" />
        </span>
        {t.title}
      </h2>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-stone-500">{t.intro}</p>

      {/* Faits déterministes */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {chips.map((c) => (
          <div key={c.libelle} className="rounded-xl border border-black/[0.06] bg-ivory-deep/30 p-3">
            <span className="num block text-2xl font-semibold tracking-tight text-forest-950">{c.valeur}</span>
            <span className="text-[0.7rem] leading-tight text-stone-500">{c.libelle}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={loading}
          onClick={generer}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-green-signal/30 bg-green-signal/[0.06] px-4 py-2 text-xs font-semibold text-green-signal outline-none transition-colors hover:bg-green-signal/[0.12] focus-visible:ring-2 focus-visible:ring-green-signal disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 size={13} strokeWidth={2} className="animate-spin" aria-hidden /> : <Sparkles size={13} strokeWidth={2} aria-hidden />}
          {loading ? t.generating : t.generate}
        </button>
        <button
          type="button"
          onClick={telecharger}
          className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-stone-500 outline-none transition-colors hover:text-forest-950 focus-visible:text-forest-950"
        >
          <Download size={13} strokeWidth={2} aria-hidden />
          {t.download}
        </button>
        <button
          type="button"
          onClick={telechargerRapport}
          className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-stone-500 outline-none transition-colors hover:text-forest-950 focus-visible:text-forest-950"
        >
          <FileText size={13} strokeWidth={2} aria-hidden />
          {t.downloadReport}
        </button>
      </div>

      {/* Résumé exécutif */}
      {resume && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 rounded-xl border border-green-signal/20 bg-green-signal/[0.04] p-4"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forest-950">
              <Sparkles size={13} strokeWidth={2} aria-hidden className="text-green-signal" />
              {t.title}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-stone-500 ring-1 ring-black/[0.06]">
              {live ? t.live : t.base}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-stone-700">{resume}</p>
          <button
            type="button"
            onClick={copier}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-[0.7rem] font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
          >
            <ClipboardCopy size={12} strokeWidth={2} aria-hidden />
            {copie ? t.copied : t.copy}
          </button>
        </motion.div>
      )}

      {/* Parcelles incluses */}
      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">{t.listTitle}</h3>
        <ul className="mt-2 flex flex-col gap-1.5">
          {conformes.slice(0, 6).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg border border-black/[0.05] bg-white/60 px-3 py-2 text-xs">
              <BadgeCheck size={13} strokeWidth={2} aria-hidden className="shrink-0 text-green-signal" />
              <span className="font-medium text-forest-950">{p.producteurNom}</span>
              <span className="text-stone-400">· {p.cooperative}</span>
              <span className="num ml-auto text-stone-500">{t.certificate} {p.numeroCertificat}</span>
            </li>
          ))}
          {conformes.length > 6 && (
            <li className="num pl-1 text-[0.7rem] text-stone-400">+ {conformes.length - 6}…</li>
          )}
        </ul>
      </div>

      {/* API REST (offre Pro), démontrable en direct */}
      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-ivory-deep/40 px-3 py-2 text-[0.7rem] leading-relaxed text-stone-500">
        <TerminalSquare size={12} strokeWidth={2} aria-hidden className="shrink-0 text-green-signal/80" />
        <span className="font-semibold text-forest-950">{t.api}</span>
        <a
          href="/api/exporteur/portefeuille?statut=conforme"
          target="_blank"
          rel="noreferrer"
          className="num rounded bg-white px-1.5 py-0.5 ring-1 ring-black/[0.06] transition-colors hover:text-green-signal"
        >
          GET /api/exporteur/portefeuille
        </a>
        <span>{t.apiHint}</span>
      </p>

      <p className="mt-3 flex items-start gap-1.5 border-t border-black/[0.05] pt-3 text-[0.7rem] leading-relaxed text-stone-400">
        <ShieldCheck size={12} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0 text-green-signal/70" />
        {t.footer}
      </p>
    </div>
  );
}

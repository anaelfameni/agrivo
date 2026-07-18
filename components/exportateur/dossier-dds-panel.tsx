"use client";

import * as React from "react";
import { CheckCircle2, Download, FileCheck2, TriangleAlert } from "lucide-react";
import { type Expedition } from "@/data/mock-expeditions";
import { PARCELLES } from "@/data/mock-parcelles";
import { construireDossierDds, fichiersDossierDds } from "@/lib/marketplace/dds-dossier";

/**
 * Panneau « Dossier DDS » d'une expédition : la jauge de préparation, la check-list recalculée
 * et les trois livrables (GeoJSON TRACES NT · brouillon DDS JSON · rapport PDF), téléchargeables
 * UNIQUEMENT quand toutes les vérifications passent (même doctrine de gating qu'`estVendable` :
 * le produit dit la vérité, il ne délivre pas un dossier incomplet).
 */

const COPY = {
  fr: {
    titre: "Dossier DDS",
    sousTitre: "Prêt à reporter dans TRACES NT : GeoJSON des parcelles, brouillon de déclaration, rapport d'évaluation de risque.",
    jauge: (ok: number, total: number) => `${ok} vérification(s) sur ${total} réunie(s)`,
    pret: "Dossier prêt",
    incomplet: "Dossier incomplet",
    geojson: "GeoJSON TRACES NT",
    brouillon: "Brouillon DDS (JSON)",
    rapport: "Rapport PDF",
    rapportEnCours: "Génération…",
    manquants: "À compléter avant de délivrer le dossier :",
  },
  en: {
    titre: "DDS file",
    sousTitre: "Ready to report in TRACES NT: plot GeoJSON, statement draft, risk assessment report.",
    jauge: (ok: number, total: number) => `${ok} of ${total} checks gathered`,
    pret: "File ready",
    incomplet: "File incomplete",
    geojson: "TRACES NT GeoJSON",
    brouillon: "DDS draft (JSON)",
    rapport: "PDF report",
    rapportEnCours: "Generating…",
    manquants: "To complete before the file can be delivered:",
  },
} as const;

function telechargerFichier(nom: string, contenu: string, type: string) {
  const blob = new Blob([contenu], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nom;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function DossierDdsPanel({ exp, lang }: { exp: Expedition; lang: "fr" | "en" }) {
  const t = COPY[lang];
  const [pdfEnCours, setPdfEnCours] = React.useState(false);
  const dossier = React.useMemo(() => construireDossierDds(exp, PARCELLES), [exp]);
  const ok = dossier.verifications.filter((v) => v.ok).length;
  const total = dossier.verifications.length;

  const telechargerDonnees = React.useCallback(
    (index: 0 | 1) => {
      if (!dossier.pret) return;
      const f = fichiersDossierDds(dossier)[index];
      telechargerFichier(f.nom, f.contenu, f.type);
    },
    [dossier],
  );

  const telechargerRapport = React.useCallback(async () => {
    if (!dossier.pret || pdfEnCours) return;
    setPdfEnCours(true);
    try {
      const { telechargerDdsPdf } = await import("@/components/exportateur/dds-pdf");
      await telechargerDdsPdf(exp, lang);
    } catch {
      /* génération annulée : le bouton reste disponible */
    } finally {
      setPdfEnCours(false);
    }
  }, [dossier.pret, pdfEnCours, exp, lang]);

  const boutonCls = dossier.pret
    ? "inline-flex items-center gap-1.5 rounded-full border border-forest-950/20 px-4 py-2 text-xs font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal focus-visible:ring-2 focus-visible:ring-green-signal disabled:opacity-60"
    : "inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-stone-400 outline-none";

  return (
    <section aria-label={`${t.titre} ${exp.ref}`} className="mt-3 rounded-xl border border-black/[0.07] bg-white p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
          <FileCheck2 size={14} className="text-forest-950" strokeWidth={2.25} aria-hidden />
          {t.titre}
        </p>
        <p
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            dossier.pret ? "bg-green-signal/15 text-green-signal" : "bg-amber-cacao/15 text-amber-cacao"
          }`}
        >
          {dossier.pret ? (
            <CheckCircle2 size={13} strokeWidth={2.25} aria-hidden />
          ) : (
            <TriangleAlert size={13} strokeWidth={2.25} aria-hidden />
          )}
          {dossier.pret ? t.pret : t.incomplet} · {t.jauge(ok, total)}
        </p>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-stone-600">{t.sousTitre}</p>

      {/* Jauge de préparation */}
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={ok}
        aria-label={t.jauge(ok, total)}
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-forest-950/[0.07]"
      >
        <div
          className={`h-full rounded-full transition-[width] ${dossier.pret ? "bg-green-signal" : "bg-amber-cacao"}`}
          style={{ width: `${Math.round((ok / Math.max(total, 1)) * 100)}%` }}
        />
      </div>

      <ul className="mt-3 space-y-1.5">
        {dossier.verifications.map((v) => (
          <li key={v.code} className="flex items-start gap-2 text-xs leading-relaxed">
            {v.ok ? (
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-signal" strokeWidth={2.25} aria-hidden />
            ) : (
              <TriangleAlert size={14} className="mt-0.5 shrink-0 text-amber-cacao" strokeWidth={2.25} aria-hidden />
            )}
            <span className="text-stone-600">{v.detail[lang]}</span>
          </li>
        ))}
      </ul>

      {!dossier.pret && (
        <p className="mt-3 rounded-lg bg-amber-cacao/[0.08] px-3 py-2 text-xs font-medium text-forest-950">
          {t.manquants}{" "}
          <span className="font-normal text-stone-600">{dossier.manquants.map((m) => m[lang]).join(" ")}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" disabled={!dossier.pret} onClick={() => telechargerDonnees(0)} className={boutonCls}>
          <Download size={14} strokeWidth={2.25} aria-hidden />
          {t.geojson}
        </button>
        <button type="button" disabled={!dossier.pret} onClick={() => telechargerDonnees(1)} className={boutonCls}>
          <Download size={14} strokeWidth={2.25} aria-hidden />
          {t.brouillon}
        </button>
        <button type="button" disabled={!dossier.pret || pdfEnCours} onClick={telechargerRapport} className={boutonCls}>
          <FileCheck2 size={14} strokeWidth={2.25} aria-hidden />
          {pdfEnCours ? t.rapportEnCours : t.rapport}
        </button>
      </div>

      <p className="mt-2.5 text-[10px] leading-relaxed text-stone-400">{dossier.disclaimer[lang]}</p>
    </section>
  );
}

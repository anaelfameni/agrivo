"use client";

import * as React from "react";
import { BadgeCheck, CheckCircle2, Download, FileCheck2, Send, TriangleAlert } from "lucide-react";
import { type Expedition } from "@/data/mock-expeditions";
import { PARCELLES } from "@/data/mock-parcelles";
import { construireDossierDds, fichiersDossierDds } from "@/lib/marketplace/dds-dossier";
import {
  ACCEPTATION_LABEL,
  acceptationPour,
  transitionsPossibles,
  type AcceptationDds,
  type StatutAcceptation,
} from "@/lib/marketplace/acceptation";

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
    transmissionTitre: "Transmission à l'opérateur",
    operateurPlaceholder: "Nom de l'opérateur (importateur UE)",
    transmettre: "Déclarer transmis",
    accepter: "Dossier accepté",
    reserves: "Réserves émises",
    retransmettre: "Retransmettre après correction",
    transmissionNote: "Déclaration de vos équipes, comme un jalon logistique : elle trace la remise du dossier, elle n'emporte aucune décision de conformité de l'opérateur.",
    transmissionGate: "Le dossier doit être complet avant de pouvoir être transmis.",
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
    transmissionTitre: "Hand-off to the operator",
    operateurPlaceholder: "Operator name (EU importer)",
    transmettre: "Declare sent",
    accepter: "File accepted",
    reserves: "Reservations raised",
    retransmettre: "Resend after correction",
    transmissionNote: "Declared by your teams, like a logistics milestone: it records the hand-off of the file and carries no compliance decision by the operator.",
    transmissionGate: "The file must be complete before it can be sent.",
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

const ACCEPTATION_LS = "agrivo:acceptation:v1:";

export function DossierDdsPanel({ exp, lang }: { exp: Expedition; lang: "fr" | "en" }) {
  const t = COPY[lang];
  const [pdfEnCours, setPdfEnCours] = React.useState(false);
  const dossier = React.useMemo(() => construireDossierDds(exp, PARCELLES), [exp]);

  // Acceptation opérateur : seed de démo, surchargée par la déclaration locale de la session.
  const [acc, setAcc] = React.useState<AcceptationDds>(() => acceptationPour(exp.ref));
  const [operateurSaisi, setOperateurSaisi] = React.useState("");
  React.useEffect(() => {
    setOperateurSaisi("");
    const seed = acceptationPour(exp.ref);
    try {
      const brut = localStorage.getItem(ACCEPTATION_LS + exp.ref);
      setAcc(brut ? (JSON.parse(brut) as AcceptationDds) : seed);
    } catch {
      setAcc(seed);
    }
  }, [exp.ref]);
  const declarer = React.useCallback(
    (statut: StatutAcceptation) => {
      if (!transitionsPossibles(acc.statut, dossier.pret).includes(statut)) return;
      const suivant: AcceptationDds = {
        statut,
        operateur: statut === "transmis" ? operateurSaisi.trim() || acc.operateur : acc.operateur,
        date: new Date().toISOString().slice(0, 10),
      };
      setAcc(suivant);
      try {
        localStorage.setItem(ACCEPTATION_LS + exp.ref, JSON.stringify(suivant));
      } catch {
        /* stockage indisponible : la déclaration reste valable pour la session courante */
      }
    },
    [acc, dossier.pret, operateurSaisi, exp.ref],
  );
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

      {/* Transmission à l'opérateur : la déclaration qui alimente la North Star
          (« tonnes couvertes par des dossiers acceptés »). Même doctrine que les jalons. */}
      <div className="mt-3 border-t border-black/[0.06] pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <Send size={13} className="text-forest-950" strokeWidth={2.25} aria-hidden />
            {t.transmissionTitre}
          </p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              acc.statut === "accepte"
                ? "bg-green-signal/15 text-green-signal"
                : acc.statut === "reserves"
                  ? "bg-red-block/10 text-red-block"
                  : acc.statut === "transmis"
                    ? "bg-forest-950/[0.07] text-forest-950"
                    : "bg-black/[0.05] text-stone-500"
            }`}
          >
            {acc.statut === "accepte" && <BadgeCheck size={13} strokeWidth={2.25} aria-hidden />}
            {ACCEPTATION_LABEL[acc.statut][lang]}
            {acc.operateur ? ` · ${acc.operateur}` : ""}
            {acc.date ? ` · ${acc.date}` : ""}
          </span>
        </div>

        {(acc.statut === "non-transmis" || acc.statut === "reserves") && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={operateurSaisi}
              onChange={(e) => setOperateurSaisi(e.target.value)}
              placeholder={acc.operateur ?? t.operateurPlaceholder}
              disabled={!dossier.pret}
              className="min-w-0 flex-1 rounded-full border border-black/10 px-4 py-2 text-xs text-forest-950 outline-none placeholder:text-stone-400 focus:border-green-signal disabled:bg-black/[0.03]"
            />
            <button
              type="button"
              disabled={!dossier.pret}
              onClick={() => declarer("transmis")}
              className={boutonCls}
            >
              <Send size={13} strokeWidth={2.25} aria-hidden />
              {acc.statut === "reserves" ? t.retransmettre : t.transmettre}
            </button>
            {!dossier.pret && <p className="w-full text-[10px] text-amber-cacao">{t.transmissionGate}</p>}
          </div>
        )}

        {acc.statut === "transmis" && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => declarer("accepte")} className={boutonCls}>
              <BadgeCheck size={13} strokeWidth={2.25} aria-hidden />
              {t.accepter}
            </button>
            <button type="button" onClick={() => declarer("reserves")} className={boutonCls}>
              <TriangleAlert size={13} strokeWidth={2.25} aria-hidden />
              {t.reserves}
            </button>
          </div>
        )}

        <p className="mt-2 text-[10px] leading-relaxed text-stone-400">{t.transmissionNote}</p>
      </div>

      <p className="mt-2.5 text-[10px] leading-relaxed text-stone-400">{dossier.disclaimer[lang]}</p>
    </section>
  );
}

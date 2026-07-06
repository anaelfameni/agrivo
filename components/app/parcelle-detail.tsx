"use client";

import Link from "next/link";
import { ArrowLeft, Download, FileCheck2, Layers, MapPin, Ruler, CalendarDays, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ParcelleMap } from "@/components/app/parcelle-map";
import { DdsMemo } from "@/components/app/dds-memo";
import { RiskCard } from "@/components/app/risk-card";
import { CreditScoreCard } from "@/components/app/credit-score-card";
import { useLanguage } from "@/components/language-provider";
import type { RiskAssessment, CreditScore, ChangementSatellite } from "@/lib/ai/gemini";
import {
  FILIERE_LABEL,
  STATUT_PHRASE,
  STATUT_PHRASE_EN,
  fmtFCFA,
  fmtHa,
  formatDate,
  type Parcelle,
} from "@/data/mock-parcelles";

const CREDIT_STATUT: Record<
  NonNullable<Parcelle["propositionCredit"]>["statut"],
  { label: { fr: string; en: string }; tint: string; color: string }
> = {
  proposee: { label: { fr: "Proposée", en: "Proposed" }, tint: "rgba(200,134,29,0.16)", color: "#6b4610" },
  acceptee: { label: { fr: "Acceptée", en: "Accepted" }, tint: "rgba(22,163,74,0.13)", color: "#0d4f27" },
  versee: { label: { fr: "Versée", en: "Disbursed" }, tint: "rgba(22,163,74,0.13)", color: "#0d4f27" },
};

/**
 * Détail d'une parcelle (îlot client, bilingue FR/EN). Les calculs IA (risque, score, lecture
 * satellite) restent faits côté serveur dans la page et arrivent en props sérialisables.
 */
export function ParcelleDetail({
  parcelle: p,
  risk,
  score,
  changement,
}: {
  parcelle: Parcelle;
  risk: RiskAssessment;
  score: CreditScore;
  changement: ChangementSatellite;
}) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const credit = p.propositionCredit;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/dashboard"
        className="inline-flex w-fit items-center gap-1.5 rounded-full text-sm text-stone-500 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        <ArrowLeft size={15} strokeWidth={2} aria-hidden />
        {en ? "Dashboard" : "Tableau de bord"}
      </Link>

      <header className="flex flex-col gap-2">
        <p className="eyebrow text-green-signal">{en ? "Verified plot" : "Parcelle vérifiée"}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl leading-tight text-forest-950 sm:text-4xl">
            {p.producteurNom}
          </h1>
          <StatusBadge statut={p.statut} lang={lang} />
        </div>
        <p className="num text-sm text-stone-500">
          {p.numeroCartePro} · {p.cooperative}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* Colonne carte + verdict */}
        <div className="flex flex-col gap-5">
          <ParcelleMap parcelle={p} className="aspect-[16/10]" />

          {/* Verdict */}
          <div className="card-premium p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-forest-950">
                {en ? "Analysis verdict" : "Verdict de l'analyse"}
              </h2>
              <StatusBadge statut={p.statut} size="sm" lang={lang} />
            </div>
            <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-stone-600">
              {en ? STATUT_PHRASE_EN[p.statut] : STATUT_PHRASE[p.statut]}
            </p>

            {/* Lecture satellite : narration IA du changement de couvert depuis la date pivot */}
            <div className="mt-4 rounded-xl border border-black/[0.06] bg-ivory-deep/30 p-3.5">
              <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-green-signal">
                <Sparkles size={12} strokeWidth={2.5} aria-hidden />{" "}
                {en ? "Satellite reading · AI" : "Lecture satellite · IA"}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{changement.narratif}</p>
              <ol className="mt-3 flex flex-col gap-2">
                {changement.observations.map((o) => (
                  <li key={o.periode} className="flex items-start gap-2.5 text-xs">
                    <span
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: o.sens === "positif" ? "var(--color-green-signal)" : o.sens === "négatif" ? "var(--color-red-block)" : "var(--color-stone-400)" }}
                      aria-hidden
                    />
                    <span>
                      <span className="num font-medium text-forest-950">{o.periode}</span>{" "}
                      <span className="text-stone-500">— {o.note}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/[0.05] pt-4 text-xs text-stone-500">
              <span>{en ? "Analysis cut-off date" : "Date pivot d'analyse"}</span>
              <span aria-hidden className="text-stone-300">·</span>
              <span className="num text-forest-950">{formatDate(p.datePivotAnalyse, lang)}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.sourcesDonnees.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-black/[0.06] bg-ivory-deep/50 px-2.5 py-1 text-[0.72rem] text-stone-600"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Analyse de risque RDUE expliquée (feature IA) */}
          <RiskCard risk={risk} lang={lang} />
        </div>

        {/* Colonne infos + crédit + certificat */}
        <div className="flex flex-col gap-5">
          <div className="card-premium p-5">
            <h2 className="text-sm font-semibold text-forest-950">
              {en ? "Farmer information" : "Informations producteur"}
            </h2>
            <dl className="mt-4 flex flex-col divide-y divide-black/[0.05]">
              <InfoRow icon={<Layers size={16} strokeWidth={2} />} label={en ? "Commodity" : "Filière"} value={FILIERE_LABEL[p.filiere]} />
              <InfoRow icon={<MapPin size={16} strokeWidth={2} />} label={en ? "Region" : "Région"} value={p.region} />
              <InfoRow icon={<Ruler size={16} strokeWidth={2} />} label={en ? "Area" : "Superficie"} value={fmtHa(p.superficieHa)} mono />
              <InfoRow icon={<CalendarDays size={16} strokeWidth={2} />} label={en ? "Verified on" : "Vérifiée le"} value={formatDate(p.dateVerification, lang)} />
              <InfoRow icon={<FileCheck2 size={16} strokeWidth={2} />} label={en ? "Certificate no." : "N° de certificat"} value={p.numeroCertificat} mono />
              {p.referenceDDR && (
                <InfoRow icon={<FileCheck2 size={16} strokeWidth={2} />} label={en ? "DDR reference" : "Référence DDR"} value={p.referenceDDR} mono />
              )}
            </dl>
          </div>

          {/* Scoring de crédit explicable (feature IA — inclusion financière) */}
          <CreditScoreCard score={score} lang={lang} />

          {/* Section crédit (uniquement si une proposition existe) */}
          {credit && (
            <div className="rounded-2xl border border-amber-cacao/20 bg-amber-cacao/[0.04] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-forest-950">
                  {en ? "Financial inclusion" : "Inclusion financière"}
                </h2>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ background: CREDIT_STATUT[credit.statut].tint, color: CREDIT_STATUT[credit.statut].color }}
                >
                  {en ? CREDIT_STATUT[credit.statut].label.en : CREDIT_STATUT[credit.statut].label.fr}
                </span>
              </div>
              <p className="num mt-3 text-2xl font-semibold text-forest-950">{fmtFCFA(credit.montantFcfa)}</p>
              <p className="mt-2 text-xs leading-relaxed text-stone-500">
                {en
                  ? "Loan facilitated with the partner microfinance institution, repaid by the farmer. The AGRIVO service remains free for them."
                  : "Prêt facilité auprès de l'institution de microfinance partenaire, remboursable par le producteur. Le service AGRIVO reste gratuit pour lui."}
              </p>
            </div>
          )}

          {/* Certificat — généré dans le parcours de vérification (Prompt 4) */}
          <button
            type="button"
            title={
              en
                ? "The PDF certificate is generated in the verification journey."
                : "Le certificat PDF est généré dans le parcours de vérification."
            }
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <Download size={16} strokeWidth={2} aria-hidden />
            {en ? "Download the certificate" : "Télécharger le certificat"}
          </button>
        </div>
      </div>

      {/* Dossier de diligence (DDS) généré par l'IA — feature IA phare */}
      <DdsMemo parcelleId={p.id} />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <dt className="flex items-center gap-2 text-sm text-stone-500">
        <span className="text-green-signal/70" aria-hidden>
          {icon}
        </span>
        {label}
      </dt>
      <dd className={`text-right text-sm font-medium text-forest-950 ${mono ? "num" : ""}`}>{value}</dd>
    </div>
  );
}

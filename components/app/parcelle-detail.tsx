"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Download, FileCheck2, Layers, MapPin, Ruler, CalendarDays, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
const ParcelleMapSat = dynamic(() => import("@/components/app/parcelle-map-sat"), {
  ssr: false,
  loading: () => (
    <div className="grid aspect-[16/10] place-items-center rounded-2xl border border-black/[0.08] bg-forest-950">
      <span className="glow-pulse inline-block h-2.5 w-2.5 rounded-full bg-green-signal" aria-hidden />
    </div>
  ),
});
import { DdsMemo } from "@/components/app/dds-memo";
import { RiskCard } from "@/components/app/risk-card";
import { ValorisationCard } from "@/components/app/valorisation-card";
import { useLanguage } from "@/components/language-provider";
import type { RiskAssessment, Valorisation, ChangementSatellite } from "@/lib/ai/gemini";
import {
  FILIERE_LABEL,
  STATUT_PHRASE,
  STATUT_PHRASE_EN,
  fmtHa,
  formatDate,
  type Parcelle,
} from "@/data/mock-parcelles";

const DOSSIER_STATUT: Record<
  NonNullable<Parcelle["dossierPartage"]>["statut"],
  { label: { fr: string; en: string }; tint: string; color: string }
> = {
  partage: { label: { fr: "Partagé", en: "Shared" }, tint: "rgba(22,163,74,0.13)", color: "#0d4f27" },
  consulte: { label: { fr: "Consulté par l'exportateur", en: "Viewed by the exporter" }, tint: "rgba(22,163,74,0.13)", color: "#0d4f27" },
};

/**
 * Détail d'une parcelle (îlot client, bilingue FR/EN). Les calculs IA (risque, valorisation,
 * lecture satellite) restent faits côté serveur dans la page et arrivent en props sérialisables.
 */
export function ParcelleDetail({
  parcelle: p,
  risk,
  valorisation,
  changement,
}: {
  parcelle: Parcelle;
  risk: RiskAssessment;
  valorisation: Valorisation;
  changement: ChangementSatellite;
}) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const dossier = p.dossierPartage;

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
          <ParcelleMapSat parcelle={p} className="aspect-[16/10]" />

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

        {/* Colonne infos + valorisation + certificat */}
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

          {/* Valorisation commerciale explicable (feature IA) */}
          <ValorisationCard valorisation={valorisation} lang={lang} />

          {/* Dossier de conformité partagé avec l'exportateur (uniquement si partagé) */}
          {dossier && (
            <div className="rounded-2xl border border-amber-cacao/20 bg-amber-cacao/[0.04] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-forest-950">
                  {en ? "Compliance file" : "Dossier de conformité"}
                </h2>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ background: DOSSIER_STATUT[dossier.statut].tint, color: DOSSIER_STATUT[dossier.statut].color }}
                >
                  {en ? DOSSIER_STATUT[dossier.statut].label.en : DOSSIER_STATUT[dossier.statut].label.fr}
                </span>
              </div>
              <p className="num mt-3 text-sm font-medium text-forest-950">{formatDate(dossier.date, lang)}</p>
              <p className="mt-2 text-xs leading-relaxed text-stone-500">
                {en
                  ? "The verified plot is part of the compliance file the cooperative shares with its exporter: the basis for negotiating sustainability premiums and accessing premium buyers."
                  : "La parcelle vérifiée fait partie du dossier de conformité que la coopérative partage avec son exportateur : la base de négociation des primes de durabilité et de l'accès aux acheteurs premium."}
              </p>
            </div>
          )}

          {/* Certificat — généré dans le parcours de vérification (Prompt 4) */}
          <Link
            href="/app/verifier"
            title={
              en
                ? "The PDF certificate is generated in the verification journey."
                : "Le certificat PDF est généré dans le parcours de vérification."
            }
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <Download size={16} strokeWidth={2} aria-hidden />
            {en ? "Generate the certificate (verification journey)" : "Générer le certificat (parcours de vérification)"}
          </Link>
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

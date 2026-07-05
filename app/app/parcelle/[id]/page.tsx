import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileCheck2, Layers, MapPin, Ruler, CalendarDays } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ParcelleMap } from "@/components/app/parcelle-map";
import {
  FILIERE_LABEL,
  STATUT_PHRASE,
  fmtFCFA,
  fmtHa,
  formatDateFr,
  getParcelle,
  type Parcelle,
} from "@/data/mock-parcelles";

const CREDIT_STATUT: Record<
  NonNullable<Parcelle["propositionCredit"]>["statut"],
  { label: string; tint: string; color: string }
> = {
  proposee: { label: "Proposée", tint: "rgba(200,134,29,0.16)", color: "#6b4610" },
  acceptee: { label: "Acceptée", tint: "rgba(22,163,74,0.13)", color: "#0d4f27" },
  versee: { label: "Versée", tint: "rgba(22,163,74,0.13)", color: "#0d4f27" },
};

export default async function ParcelleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parcelle = getParcelle(id);
  if (!parcelle) notFound();

  const p = parcelle;
  const credit = p.propositionCredit;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/dashboard"
        className="inline-flex w-fit items-center gap-1.5 rounded-full text-sm text-stone-500 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        <ArrowLeft size={15} strokeWidth={2} aria-hidden />
        Tableau de bord
      </Link>

      <header className="flex flex-col gap-2">
        <p className="eyebrow text-green-signal">Parcelle vérifiée</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl leading-tight text-forest-950 sm:text-4xl">
            {p.producteurNom}
          </h1>
          <StatusBadge statut={p.statut} />
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
              <h2 className="text-sm font-semibold text-forest-950">Verdict de l&apos;analyse</h2>
              <StatusBadge statut={p.statut} size="sm" />
            </div>
            <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-stone-600">
              {STATUT_PHRASE[p.statut]}
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/[0.05] pt-4 text-xs text-stone-500">
              <span>Date pivot d&apos;analyse</span>
              <span aria-hidden className="text-stone-300">·</span>
              <span className="num text-forest-950">{formatDateFr(p.datePivotAnalyse)}</span>
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
        </div>

        {/* Colonne infos + crédit + certificat */}
        <div className="flex flex-col gap-5">
          <div className="card-premium p-5">
            <h2 className="text-sm font-semibold text-forest-950">Informations producteur</h2>
            <dl className="mt-4 flex flex-col divide-y divide-black/[0.05]">
              <InfoRow icon={<Layers size={16} strokeWidth={2} />} label="Filière" value={FILIERE_LABEL[p.filiere]} />
              <InfoRow icon={<MapPin size={16} strokeWidth={2} />} label="Région" value={p.region} />
              <InfoRow icon={<Ruler size={16} strokeWidth={2} />} label="Superficie" value={fmtHa(p.superficieHa)} mono />
              <InfoRow icon={<CalendarDays size={16} strokeWidth={2} />} label="Vérifiée le" value={formatDateFr(p.dateVerification)} />
              <InfoRow icon={<FileCheck2 size={16} strokeWidth={2} />} label="N° de certificat" value={p.numeroCertificat} mono />
              {p.referenceDDR && (
                <InfoRow icon={<FileCheck2 size={16} strokeWidth={2} />} label="Référence DDR" value={p.referenceDDR} mono />
              )}
            </dl>
          </div>

          {/* Section crédit (uniquement si une proposition existe) */}
          {credit && (
            <div className="rounded-2xl border border-amber-cacao/20 bg-amber-cacao/[0.04] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-forest-950">Inclusion financière</h2>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ background: CREDIT_STATUT[credit.statut].tint, color: CREDIT_STATUT[credit.statut].color }}
                >
                  {CREDIT_STATUT[credit.statut].label}
                </span>
              </div>
              <p className="num mt-3 text-2xl font-semibold text-forest-950">{fmtFCFA(credit.montantFcfa)}</p>
              <p className="mt-2 text-xs leading-relaxed text-stone-500">
                Prêt facilité auprès de l&apos;institution de microfinance partenaire, remboursable par le
                producteur. Le service AGRIVO reste gratuit pour lui.
              </p>
            </div>
          )}

          {/* Certificat — généré dans le parcours de vérification (Prompt 4) */}
          <button
            type="button"
            title="Le certificat PDF est généré dans le parcours de vérification."
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <Download size={16} strokeWidth={2} aria-hidden />
            Télécharger le certificat
          </button>
        </div>
      </div>
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

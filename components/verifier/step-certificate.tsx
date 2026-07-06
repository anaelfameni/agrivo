"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Download, FileCheck2, Loader2 } from "lucide-react";
import { PinMark } from "@/components/ui/pin-mark";
import { useLanguage } from "@/components/language-provider";
import type { CertificatData } from "@/lib/certificat-data";
import type { Statut } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  fr: {
    eyebrow: "Certificat de conformité RDUE",
    generating: "Génération du certificat…",
    subtitle: "Évaluation de conformité RDUE",
    certNo: "N° de certificat",
    producer: "Producteur",
    cardNo: "N° de carte",
    coop: "Coopérative",
    filiere: "Filière",
    region: "Région",
    area: "Superficie",
    coords: "Coordonnées WGS-84 · 6 décimales (RFC 7946)",
    sources: "Sources de données",
    traces:
      "Dossier prêt pour soumission sur TRACES NT. Traitement réalisé avec le consentement éclairé du producteur (loi n°2013-450, ARTCI).",
    disclaimer:
      "Évaluation technique produite à partir de données satellites publiques. Ne se substitue pas à la responsabilité légale de l'opérateur qui dépose la déclaration de diligence raisonnée.",
    preparing: "Préparation…",
    download: "Télécharger le PDF",
    back: "Retour",
  },
  en: {
    eyebrow: "EUDR compliance certificate",
    generating: "Generating the certificate…",
    subtitle: "EUDR compliance assessment",
    certNo: "Certificate no.",
    producer: "Farmer",
    cardNo: "Card no.",
    coop: "Cooperative",
    filiere: "Commodity",
    region: "Region",
    area: "Area",
    coords: "WGS-84 coordinates · 6 decimals (RFC 7946)",
    sources: "Data sources",
    traces:
      "File ready for submission on TRACES NT. Processing carried out with the farmer's informed consent (law no. 2013-450, ARTCI).",
    disclaimer:
      "Technical assessment produced from public satellite data. It does not replace the legal responsibility of the operator filing the due diligence statement.",
    preparing: "Preparing…",
    download: "Download the PDF",
    back: "Back",
  },
} as const;
const TINT: Record<Statut, { bg: string; text: string; border: string }> = {
  conforme: { bg: "rgba(22,163,74,0.10)", text: "#0d4f27", border: "rgba(22,163,74,0.30)" },
  anomalie: { bg: "rgba(180,35,30,0.09)", text: "#8a1712", border: "rgba(180,35,30,0.30)" },
  insuffisant: { bg: "rgba(200,134,29,0.12)", text: "#6b4610", border: "rgba(200,134,29,0.35)" },
};

/**
 * Étape 4 — certificat. Animation de génération, puis aperçu HTML on-brand du certificat et
 * téléchargement du VRAI PDF (@react-pdf/renderer chargé à la demande). Fidèle au PDF produit.
 */
export function StepCertificate({
  data,
  nextLabel,
  onNext,
  onBack,
}: {
  data: CertificatData;
  nextLabel: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [generating, setGenerating] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const tint = TINT[data.statut];

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), reduce ? 200 : 1100);
    return () => clearTimeout(t);
  }, [reduce]);

  async function telecharger() {
    setDownloading(true);
    try {
      const mod = await import("@/components/verifier/certificat-pdf");
      await mod.telechargerCertificat(data);
    } catch {
      /* échec silencieux : l'aperçu reste disponible */
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center gap-2">
        <FileCheck2 size={16} strokeWidth={2} className="text-green-signal" aria-hidden />
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
      </div>

      <AnimatePresence mode="wait">
        {generating ? (
          <motion.div
            key="gen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid min-h-[320px] place-items-center rounded-2xl border border-black/[0.06] bg-white"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <PinMark size={48} color="var(--color-green-signal)" leafColor="rgba(224,166,75,0.95)" pulse />
              <p className="text-sm font-medium text-forest-950">{t.generating}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cert"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {/* Aperçu du certificat */}
            <article className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_20px_60px_-30px_rgba(10,31,20,0.4)]">
              <header className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-6 py-5">
                <div>
                  <p className="font-display text-2xl not-italic text-forest-950" style={{ fontStyle: "normal", fontWeight: 600 }}>
                    Agrivo
                  </p>
                  <p className="font-display text-sm text-stone-500">{t.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="eyebrow text-[0.6rem] text-stone-400">{t.certNo}</p>
                  <p className="num text-sm text-forest-950">{data.numeroCertificat}</p>
                  <p className="mt-1 text-[0.7rem] text-stone-400">{data.emisLe}</p>
                </div>
              </header>

              <div className="px-6 py-5">
                <div
                  className="rounded-xl border p-4"
                  style={{ background: tint.bg, borderColor: tint.border }}
                >
                  <p className="text-base font-semibold" style={{ color: tint.text }}>{data.statutLabel}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{data.phrase}</p>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                  <Cell label={t.producer} value={data.producteurNom} />
                  <Cell label={t.cardNo} value={data.numeroCartePro} mono />
                  <Cell label={t.coop} value={data.cooperative} />
                  <Cell label={t.filiere} value={data.filiereLabel} />
                  <Cell label={t.region} value={data.region} />
                  <Cell label={t.area} value={data.superficie} mono />
                </dl>

                <div className="mt-5">
                  <p className="eyebrow text-[0.6rem] text-stone-400">{t.coords}</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {data.vertices.map((v, i) => (
                      <li key={i} className="num text-xs text-forest-950">
                        <span className="text-stone-400">P{i + 1}</span>&nbsp;&nbsp;{v}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <p className="eyebrow text-[0.6rem] text-stone-400">{t.sources}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {data.sources.map((s) => (
                      <span key={s} className="rounded-full border border-black/[0.06] bg-ivory-deep/50 px-2.5 py-1 text-[0.72rem] text-stone-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-5 rounded-xl bg-[#f0f7f1] p-3.5 text-xs leading-relaxed text-[#0d4f27]">
                  {t.traces}
                </p>
                <p className="mt-3 text-[0.7rem] leading-relaxed text-stone-400">
                  {t.disclaimer}
                </p>
              </div>
            </article>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={telecharger}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-60"
              >
                {downloading ? <Loader2 size={16} strokeWidth={2} className="animate-spin" /> : <Download size={16} strokeWidth={2} aria-hidden />}
                {downloading ? t.preparing : t.download}
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-sm text-stone-400 outline-none transition-colors hover:text-forest-950 focus-visible:text-forest-950"
                >
                  {t.back}
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                >
                  {nextLabel}
                  <ArrowRight size={16} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Cell({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="eyebrow text-[0.6rem] text-stone-400">{label}</dt>
      <dd className={`mt-0.5 text-sm text-forest-950 ${mono ? "num" : ""}`}>{value}</dd>
    </div>
  );
}

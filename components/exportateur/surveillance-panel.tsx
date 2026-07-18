"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BellRing, CheckCircle2, RefreshCcw, Satellite } from "lucide-react";
import { PARCELLES, STATUT_LABEL, type Parcelle } from "@/data/mock-parcelles";
import { CADENCE_REVUE_JOURS, evaluerVeille } from "@/lib/surveillance/veille";
import { StatNumber } from "@/components/ui/stat-number";

/**
 * Panneau « Surveillance du portefeuille » : la conformité est une obligation CONTINUE, pas un
 * instantané. Cadence de revue trimestrielle : le panneau remonte les parcelles à re-vérifier
 * et les alertes actives, et renvoie vers la fiche parcelle (la re-vérification passe par
 * l'analyse satellite existante, jamais par un verdict déclaré ici).
 */
const TR = {
  fr: {
    eyebrow: "Surveillance du portefeuille",
    sub: (c: number) => `Cadence de revue : ${c} jours. Une parcelle vérifiée le reste tant que sa revue est à jour et qu'aucune alerte n'est active.`,
    aJour: "Parcelles à jour",
    revueDue: "Revues à planifier",
    alertes: "Alertes actives",
    aTraiterTitle: "À traiter en priorité",
    rien: "Tout le portefeuille est à jour de sa cadence de revue.",
    verifieLe: "vérifiée le",
    retard: (j: number) => `revue en retard de ${j} j`,
    alerte: "alerte active",
    ouvrir: "Ouvrir la fiche",
    note: "La re-vérification relance l'analyse satellite (Whisp · FAO) depuis la fiche parcelle ou le parcours de vérification de la coopérative.",
  },
  en: {
    eyebrow: "Portfolio monitoring",
    sub: (c: number) => `Review cadence: ${c} days. A verified plot stays verified as long as its review is current and no alert is active.`,
    aJour: "Plots up to date",
    revueDue: "Reviews to schedule",
    alertes: "Active alerts",
    aTraiterTitle: "To handle first",
    rien: "The whole portfolio is within its review cadence.",
    verifieLe: "verified on",
    retard: (j: number) => `review ${j} d overdue`,
    alerte: "active alert",
    ouvrir: "Open the plot",
    note: "Re-verification re-runs the satellite analysis (Whisp · FAO) from the plot page or the cooperative's verification journey.",
  },
} as const;

export function SurveillancePanel({ lang = "fr", parcelles = PARCELLES }: { lang?: "fr" | "en"; parcelles?: Parcelle[] }) {
  const reduce = useReducedMotion() ?? false;
  const t = TR[lang];
  const veille = useMemo(() => evaluerVeille(parcelles), [parcelles]);

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
      className="card-premium p-6"
      aria-label={t.eyebrow}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow flex items-center gap-1.5 text-forest-950">
          <Satellite size={14} className="text-green-signal" aria-hidden /> {t.eyebrow}
        </p>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">{t.sub(CADENCE_REVUE_JOURS)}</p>

      <dl className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <StatNumber value={veille.aJour} format={(n) => `${Math.round(n)}/${veille.total}`} className="num block text-2xl font-bold text-forest-950" />
          <dd className="mt-1 flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-wide text-stone-400"><CheckCircle2 size={11} /> {t.aJour}</dd>
        </div>
        <div>
          <StatNumber value={veille.revueDue} className={`num block text-2xl font-bold ${veille.revueDue > 0 ? "text-amber-cacao" : "text-forest-950"}`} />
          <dd className="mt-1 flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-wide text-stone-400"><RefreshCcw size={11} /> {t.revueDue}</dd>
        </div>
        <div>
          <StatNumber value={veille.alertes} className={`num block text-2xl font-bold ${veille.alertes > 0 ? "text-red-block" : "text-forest-950"}`} />
          <dd className="mt-1 flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-wide text-stone-400"><BellRing size={11} /> {t.alertes}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-black/[0.06] pt-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-stone-400">{t.aTraiterTitle}</p>
        {veille.aTraiter.length === 0 ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-green-signal"><CheckCircle2 size={14} /> {t.rien}</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {veille.aTraiter.slice(0, 4).map((v) => (
              <li key={v.parcelleId} className="flex flex-wrap items-center justify-between gap-2 text-xs leading-relaxed text-stone-600">
                <span className="min-w-0">
                  <span className="font-medium text-forest-950">{v.producteurNom}</span> · {v.cooperative} ·{" "}
                  {STATUT_LABEL[v.statut]} · {t.verifieLe} {v.verifieLe} ·{" "}
                  <span className={v.etat === "alerte" ? "font-semibold text-red-block" : "font-semibold text-amber-cacao"}>
                    {v.etat === "alerte" ? t.alerte : t.retard(v.joursRetard)}
                  </span>
                </span>
                <Link
                  href={`/app/parcelle/${v.parcelleId}`}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-green-signal transition hover:brightness-110"
                >
                  {t.ouvrir} <ArrowRight size={12} />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[10px] leading-relaxed text-stone-400">{t.note}</p>
      </div>
    </motion.section>
  );
}

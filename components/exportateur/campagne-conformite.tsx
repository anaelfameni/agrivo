"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarClock, ShieldCheck, Boxes, AlertTriangle, ArrowRight, Check } from "lucide-react";
import { PARCELLES } from "@/data/mock-parcelles";
import { etatCampagne } from "@/lib/marketplace/campagne";
import { StatNumber } from "@/components/ui/stat-number";

/**
 * Panneau « Conformité de ma campagne » : l'exportateur voit en un coup d'œil s'il est prêt
 * pour l'échéance RDUE (30/12/2026) : lots scellés, tonnage sécurisé, alertes bloquantes et
 * surtout LES PROCHAINES ACTIONS lot par lot (jamais un score, toujours un geste concret).
 */
const TR = {
  fr: {
    eyebrow: "Conformité de ma campagne",
    countdown: (j: number) => `J-${j} avant l'échéance RDUE (30 décembre 2026)`,
    scelles: "Lots scellés",
    tonnage: "Tonnage scellé (t)",
    alertes: "Alertes bloquantes",
    actionsTitle: "Prochaines actions",
    actionsNone: "Aucune action en attente : tous vos lots sont scellés et réconciliés.",
    voirLots: "Ouvrir Mes lots",
  },
  en: {
    eyebrow: "My campaign compliance",
    countdown: (j: number) => `D-${j} before the EUDR deadline (30 December 2026)`,
    scelles: "Sealed lots",
    tonnage: "Sealed tonnage (t)",
    alertes: "Blocking alerts",
    actionsTitle: "Next actions",
    actionsNone: "No pending action: all your lots are sealed and reconciled.",
    voirLots: "Open My lots",
  },
} as const;

export function CampagneConformite({ lang = "fr" }: { lang?: "fr" | "en" }) {
  const reduce = useReducedMotion() ?? false;
  const t = TR[lang];
  const etat = useMemo(() => etatCampagne(PARCELLES), []);

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="panel-forest rounded-2xl p-6"
      aria-label={t.eyebrow}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <span className="num inline-flex items-center gap-1.5 rounded-full border border-amber-soft/40 bg-amber-soft/10 px-3 py-1 text-xs font-semibold text-amber-soft">
          <CalendarClock size={13} /> {t.countdown(etat.joursRestants)}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-4">
        <div>
          <StatNumber value={etat.lotsScelles} format={(n) => `${Math.round(n)}/${etat.totalLots}`} className="num block text-2xl font-bold text-white" />
          <dd className="mt-1 flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-wide text-white/50"><ShieldCheck size={11} /> {t.scelles}</dd>
        </div>
        <div>
          <StatNumber value={etat.tonnageScelle} format={(n) => n.toLocaleString(lang === "en" ? "en" : "fr-FR", { maximumFractionDigits: 1 })} className="num block text-2xl font-bold text-white" />
          <dd className="mt-1 flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-wide text-white/50"><Boxes size={11} /> {t.tonnage}</dd>
        </div>
        <div>
          <StatNumber value={etat.alertesBloquantes} className={`num block text-2xl font-bold ${etat.alertesBloquantes > 0 ? "text-red-300" : "text-white"}`} />
          <dd className="mt-1 flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-wide text-white/50"><AlertTriangle size={11} /> {t.alertes}</dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-white/50">{t.actionsTitle}</p>
        {etat.actions.length === 0 ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-green-signal"><Check size={14} /> {t.actionsNone}</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {etat.actions.slice(0, 4).map((a, i) => (
              <li key={`${a.ref}-${i}`} className="flex items-start gap-2 text-xs leading-relaxed text-white/75">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-soft" />
                {lang === "en" ? a.detail.en : a.detail.fr}
              </li>
            ))}
          </ul>
        )}
        <Link href="/app/exportateur/marketplace" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-green-signal transition hover:brightness-110">
          {t.voirLots} <ArrowRight size={13} />
        </Link>
      </div>
    </motion.section>
  );
}

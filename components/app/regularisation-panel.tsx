"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, ContactRound, FileWarning, ListChecks } from "lucide-react";
import type { Parcelle } from "@/data/mock-parcelles";
import { fileRegularisation } from "@/lib/registre/regularisation";

/**
 * File de régularisation de la coopérative : les gages ADMINISTRATIFS du sceau qui
 * manquent (carte producteur, référence DDR), avec l'action recommandée. Complète les
 * panneaux existants (« À re-vérifier » = données insuffisantes, « Alertes » = anomalies)
 * sans les dupliquer. Invisible si le registre est administrativement complet.
 */
const TR = {
  fr: {
    title: "File de régularisation",
    lead: (p: number) =>
      `${p} parcelle${p > 1 ? "s" : ""} bloquée${p > 1 ? "s" : ""} avant d'entrer dans un lot vendable, pour une raison administrative (pas satellite).`,
    cartes: (n: number) => `${n} carte${n > 1 ? "s" : ""} producteur`,
    ddr: (n: number) => `${n} référence${n > 1 ? "s" : ""} DDR`,
    voir: "Voir le détail", reduire: "Réduire",
    motifCarte: "Carte producteur", motifDdr: "Référence DDR",
  },
  en: {
    title: "Regularisation queue",
    lead: (p: number) =>
      `${p} plot${p > 1 ? "s" : ""} blocked from joining a sellable lot for an administrative reason (not satellite).`,
    cartes: (n: number) => `${n} producer card${n > 1 ? "s" : ""}`,
    ddr: (n: number) => `${n} DDR reference${n > 1 ? "s" : ""}`,
    voir: "See details", reduire: "Collapse",
    motifCarte: "Producer card", motifDdr: "DDR reference",
  },
} as const;

export function RegularisationPanel({ lang, parcelles }: { lang: "fr" | "en"; parcelles: Parcelle[] }) {
  const t = TR[lang];
  const reduce = useReducedMotion();
  const [ouvert, setOuvert] = useState(false);
  const file = useMemo(() => fileRegularisation(parcelles), [parcelles]);

  if (file.items.length === 0) return null;

  return (
    <div className="card-premium rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListChecks size={17} className="text-amber-cacao" />
          <h2 className="font-display text-base font-semibold text-forest-950">{t.title}</h2>
        </div>
        <p className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {file.nbCartes > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-cacao/25 bg-amber-cacao/[0.08] px-2.5 py-1 text-amber-cacao">
              <ContactRound size={12} /> {t.cartes(file.nbCartes)}
            </span>
          )}
          {file.nbDdr > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-cacao/25 bg-amber-cacao/[0.08] px-2.5 py-1 text-amber-cacao">
              <FileWarning size={12} /> {t.ddr(file.nbDdr)}
            </span>
          )}
        </p>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-forest-950/55">{t.lead(file.nbParcelles)}</p>

      <button
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-forest-950/65 transition-colors hover:text-forest-950"
      >
        <motion.span
          animate={{ rotate: ouvert ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }}
          className="inline-flex"
        >
          <ChevronDown size={14} />
        </motion.span>
        {ouvert ? t.reduire : t.voir}
      </button>

      <AnimatePresence initial={false}>
        {ouvert && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ul className="mt-3 space-y-2.5">
              {file.items.map((item) => (
                <li key={`${item.parcelleId}-${item.motif}`} className="rounded-xl border border-black/[0.06] bg-ivory/60 p-3.5">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-semibold text-forest-950">{item.producteurNom}</span>
                    <span className="text-xs text-forest-950/50">{item.region}</span>
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-cacao/10 px-2 py-0.5 text-[0.66rem] font-semibold text-amber-cacao">
                      {item.motif === "carte-producteur" ? <ContactRound size={11} /> : <FileWarning size={11} />}
                      {item.motif === "carte-producteur" ? t.motifCarte : t.motifDdr}
                    </span>
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-forest-950/65">{lang === "en" ? item.en : item.fr}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

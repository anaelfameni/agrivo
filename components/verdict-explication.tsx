"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarClock,
  Camera,
  ChevronDown,
  CloudFog,
  HelpCircle,
  Layers,
  Ruler,
  Route,
  Scale,
  Split,
  TreePine,
  type LucideIcon,
} from "lucide-react";
import {
  ANOMALIE_ACTIONS,
  INSUFFISANT_ACTIONS,
  INSUFFISANT_CAUSES,
  INSUFFISANT_DEFINITION,
  INSUFFISANT_SOUS_TITRE,
  type PointExplication,
} from "@/lib/verdict-explanations";
import type { Statut } from "@/data/mock-parcelles";

/**
 * « Pourquoi ce verdict ? » — panneau d'explication PRÉCIS et actionnable des verdicts
 * non concluants. Fini l'explication générique : les causes réelles (documentées, recherche
 * FAO/Whisp) et les prochaines étapes concrètes, dans la langue de l'interface.
 * Rendu : rien pour « Conforme » ; causes + actions pour « Données insuffisantes » ;
 * prochaines étapes pour « Anomalie détectée ».
 */

const EASE = [0.16, 1, 0.3, 1] as const;

const ICONES: Record<string, LucideIcon> = {
  ombrage: TreePine,
  nuages: CloudFog,
  "petite-parcelle": Ruler,
  "sources-divergentes": Scale,
  "saison-seche": CalendarClock,
  tracer: Route,
  "preuves-terrain": Camera,
  "verifier-trace": Route,
  masque: Layers,
  isoler: Split,
};

const UI = {
  fr: {
    pourquoi: "Pourquoi ce verdict ?",
    causes: "Les causes réelles possibles",
    actions: "Vos prochaines étapes",
    actionsAnomalie: "Vos prochaines étapes",
  },
  en: {
    pourquoi: "Why this verdict?",
    causes: "The possible real causes",
    actions: "Your next steps",
    actionsAnomalie: "Your next steps",
  },
} as const;

function Points({ points, lang, accent }: { points: PointExplication[]; lang: "fr" | "en"; accent: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.ul
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
      className="flex flex-col gap-2.5"
    >
      {points.map((pt) => {
        const Icon = ICONES[pt.id] ?? HelpCircle;
        return (
          <motion.li
            key={pt.id}
            variants={{
              hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
            }}
            className="flex items-start gap-3"
          >
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${accent}1a` }} aria-hidden>
              <Icon size={14} strokeWidth={2} style={{ color: accent }} />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.82rem] font-semibold leading-snug text-forest-950">{pt.titre[lang]}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">{pt.detail[lang]}</span>
            </span>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

export function VerdictExplication({
  statut,
  lang,
  defaultOpen = false,
}: {
  statut: Statut;
  lang: "fr" | "en";
  defaultOpen?: boolean;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(defaultOpen);
  const t = UI[lang];

  if (statut === "conforme") return null;
  const insuffisant = statut === "insuffisant";
  const accent = insuffisant ? "#c8861d" : "#b4231e";

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        insuffisant ? "border-amber-cacao/25 bg-amber-cacao/[0.05]" : "border-red-block/20 bg-red-block/[0.03]"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-black/[0.02] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-signal/50"
      >
        <span className="flex items-center gap-2">
          <HelpCircle size={15} strokeWidth={2} style={{ color: accent }} aria-hidden />
          <span className="text-sm font-semibold text-forest-950">{t.pourquoi}</span>
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden
          className={`shrink-0 text-stone-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
              {insuffisant ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
                    {INSUFFISANT_SOUS_TITRE[lang]}
                  </p>
                  <p className="max-w-prose text-xs leading-relaxed text-stone-600">{INSUFFISANT_DEFINITION[lang]}</p>
                  <div>
                    <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-stone-500">{t.causes}</p>
                    <Points points={INSUFFISANT_CAUSES} lang={lang} accent={accent} />
                  </div>
                  <div>
                    <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-stone-500">{t.actions}</p>
                    <Points points={INSUFFISANT_ACTIONS} lang={lang} accent="#16a34a" />
                  </div>
                </>
              ) : (
                <div>
                  <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-stone-500">{t.actionsAnomalie}</p>
                  <Points points={ANOMALIE_ACTIONS} lang={lang} accent={accent} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

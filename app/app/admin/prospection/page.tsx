"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Users, MessageSquareText, ChevronDown, StickyNote } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import {
  PROSPECTS_SEED,
  STATUTS_PIPELINE,
  STATUT_PIPELINE_LABEL,
  SEGMENT_LABEL,
  statsPipeline,
  type Prospect,
  type StatutPipeline,
} from "@/data/prospection";

/**
 * CRM de prospection interne (admin) : le pipeline des 109 licenciés export, priorisé selon
 * l'étude de marché (44 coopératives exportatrices d'abord). Les fiches seedées sont des
 * GABARITS ANONYMISÉS à remplacer par les vraies cibles ; statuts et notes vivent en
 * localStorage (jamais de mutation des constantes). Le kit d'entretien H4 est intégré :
 * chaque entretien teste la disposition à payer avec un prix RÉEL proposé, jamais suggéré.
 */

const CLE_ETAT = "agrivo:prospection";

const QUESTIONS_H4 = {
  fr: [
    "Racontez-moi votre dernière expédition vers l'Europe : qu'est-ce qui a pris le plus de temps dans le dossier ?",
    "Que change le 1er septembre (SNT, carte producteur) pour vous, concrètement ?",
    "Aujourd'hui, qui prépare vos géolocalisations et vos références de diligence, et combien ça vous coûte (temps, argent) ?",
    "Si nous préparions pour vous le dossier complet d'un lot (parcelles évaluées, chaîne de possession, GeoJSON prêt pour l'acheteur), que devrait-il contenir pour que vous le payiez ?",
    "Test de prix (à énoncer, puis SE TAIRE) : « Ce dossier par lot, nous le facturons X FCFA. » Noter la réaction exacte, jamais suggérer que c'est négociable.",
    "Qui d'autre chez vous (ou chez vos acheteurs) devrait valider cet achat ?",
  ],
  en: [
    "Tell me about your last shipment to Europe: what took the longest in the file?",
    "What does 1 September (SNT, producer card) change for you, concretely?",
    "Today, who prepares your geolocations and due-diligence references, and what does it cost you (time, money)?",
    "If we prepared the complete file for one lot (assessed plots, chain of custody, buyer-ready GeoJSON), what must it contain for you to pay for it?",
    "Price test (state it, then STAY SILENT): \"This per-lot file costs X FCFA.\" Record the exact reaction, never hint it is negotiable.",
    "Who else on your side (or at your buyers) must approve this purchase?",
  ],
} as const;

interface EtatLocal {
  statuts: Record<string, StatutPipeline>;
  notes: Record<string, string>;
}

function lireEtat(): EtatLocal {
  if (typeof window === "undefined") return { statuts: {}, notes: {} };
  try {
    const brut = window.localStorage.getItem(CLE_ETAT);
    const parsed = brut ? (JSON.parse(brut) as EtatLocal) : null;
    return { statuts: parsed?.statuts ?? {}, notes: parsed?.notes ?? {} };
  } catch {
    return { statuts: {}, notes: {} };
  }
}

const TR = {
  fr: {
    back: "Console d'administration",
    eyebrow: "Interne · prospection",
    title: "Pipeline des 109 licenciés",
    lead: "Les gabarits ci-dessous sont anonymisés : remplacez chaque fiche par la vraie cible au fil de la prospection. Priorité de l'étude : les 44 coopératives exportatrices, une par une.",
    kit: "Kit d'entretien (test H4 : disposition à payer)",
    kitNote: "Règle d'or : proposer un prix réel et se taire. On note la réaction, on ne vend pas pendant l'entretien.",
    segment: "Segment",
    region: "Région",
    angle: "Angle d'attaque",
    statut: "Statut",
    notes: "Notes d'entretien",
    notesPh: "Réaction au prix, objections, prochaine action…",
  },
  en: {
    back: "Admin console",
    eyebrow: "Internal · prospecting",
    title: "Pipeline of the 109 licensees",
    lead: "The templates below are anonymised: replace each card with the real target as you prospect. Study priority: the 44 exporting cooperatives, one by one.",
    kit: "Interview kit (H4 test: willingness to pay)",
    kitNote: "Golden rule: state a real price and stay silent. Record the reaction; never sell during the interview.",
    segment: "Segment",
    region: "Region",
    angle: "Angle",
    statut: "Status",
    notes: "Interview notes",
    notesPh: "Price reaction, objections, next action…",
  },
} as const;

export default function ProspectionPage() {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion() ?? false;

  const [etat, setEtat] = useState<EtatLocal>({ statuts: {}, notes: {} });
  const [kitOuvert, setKitOuvert] = useState(false);
  useEffect(() => setEtat(lireEtat()), []);

  const majEtat = (next: EtatLocal) => {
    setEtat(next);
    try {
      window.localStorage.setItem(CLE_ETAT, JSON.stringify(next));
    } catch {
      /* stockage indisponible : l'état vit en mémoire */
    }
  };

  const prospects: Prospect[] = useMemo(
    () => PROSPECTS_SEED.map((p) => ({ ...p, statut: etat.statuts[p.id] ?? p.statut })),
    [etat.statuts],
  );
  const stats = useMemo(() => statsPipeline(prospects), [prospects]);

  return (
    <div className="mx-auto max-w-6xl px-1 py-2">
      <Link href="/app/admin" className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-forest-950">
        <ArrowLeft size={15} /> {t.back}
      </Link>
      <header className="mt-4">
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl leading-tight text-forest-950">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-stone-500">{t.lead}</p>
      </header>

      {/* Entonnoir */}
      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {STATUTS_PIPELINE.map((s) => (
          <div key={s} className="rounded-xl border border-black/[0.06] bg-white p-3 text-center">
            <p className="num text-xl font-bold text-forest-950">{stats[s]}</p>
            <p className="mt-0.5 text-[0.64rem] font-medium uppercase tracking-wide text-forest-950/45">{STATUT_PIPELINE_LABEL[s][l]}</p>
          </div>
        ))}
      </div>

      {/* Kit d'entretien H4 */}
      <div className="mt-5 rounded-2xl border border-amber-cacao/25 bg-amber-cacao/[0.05] p-5">
        <button onClick={() => setKitOuvert((o) => !o)} aria-expanded={kitOuvert} className="flex w-full items-center justify-between gap-3 text-left">
          <span className="flex items-center gap-2 text-sm font-semibold text-forest-950">
            <MessageSquareText size={15} className="text-amber-cacao" /> {t.kit}
          </span>
          <motion.span animate={{ rotate: kitOuvert ? 180 : 0 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }} className="inline-flex text-forest-950/50">
            <ChevronDown size={16} />
          </motion.span>
        </button>
        {kitOuvert && (
          <div className="mt-3">
            <p className="text-xs font-medium text-amber-cacao">{t.kitNote}</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-forest-950/75">
              {QUESTIONS_H4[l].map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Pipeline */}
      <motion.div
        className="mt-6 grid gap-4 md:grid-cols-2"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
      >
        {prospects.map((p) => (
          <motion.article
            key={p.id}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }}
            className="card-premium rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-display text-base font-semibold text-forest-950">
                  <Users size={14} className="text-green-signal" /> {p.nom}
                </h2>
                <p className="mt-1 text-xs text-forest-950/55">
                  {SEGMENT_LABEL[p.segment][l]} · {p.region}
                </p>
              </div>
              <select
                value={p.statut}
                onChange={(e) => majEtat({ ...etat, statuts: { ...etat.statuts, [p.id]: e.target.value as StatutPipeline } })}
                aria-label={t.statut}
                className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs font-medium text-forest-950 outline-none focus:border-green-signal/60"
              >
                {STATUTS_PIPELINE.map((s) => (
                  <option key={s} value={s}>{STATUT_PIPELINE_LABEL[s][l]}</option>
                ))}
              </select>
            </div>
            <p className="mt-3 rounded-xl bg-ivory px-3 py-2 text-xs leading-relaxed text-forest-950/70">
              <span className="font-semibold text-forest-950/85">{t.angle} : </span>{p.angle[l]}
            </p>
            <label className="mt-3 block text-[0.66rem] font-semibold uppercase tracking-wide text-forest-950/45">
              <span className="inline-flex items-center gap-1"><StickyNote size={11} /> {t.notes}</span>
              <textarea
                value={etat.notes[p.id] ?? ""}
                onChange={(e) => majEtat({ ...etat, notes: { ...etat.notes, [p.id]: e.target.value } })}
                placeholder={t.notesPh}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-forest-950 outline-none transition focus:border-green-signal/60 focus:ring-2 focus:ring-green-signal/20"
              />
            </label>
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}

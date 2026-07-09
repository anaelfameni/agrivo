"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Leaf, Loader2, RotateCcw, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { PinMark } from "@/components/ui/pin-mark";
import { PhotoTerrain } from "@/components/verifier/photo-terrain";
import { useLanguage } from "@/components/language-provider";
import type { AnalysisPhase } from "@/components/verifier/analysis-map";
import type { WhispResult } from "@/lib/ai/whisp";
import type { ScoreSols } from "@/lib/ai/gemini";
import { STATUT_COLOR, type Parcelle } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const COPY = {
  fr: {
    eyebrow: "Analyse satellite · FAO",
    intro:
      "L'analyse combine plusieurs sources satellites publiques (convergence de preuves, méthode FAO) autour de la date pivot du 31 décembre 2020.",
    drawing: "Cartographie de la parcelle…",
    scanning: "Analyse satellite en cours…",
    stopListen: "Arrêter la lecture",
    listenAria: "Écouter l'explication du verdict",
    stop: "Arrêter",
    listen: "Écouter",
    localTitle: "Expliquer au producteur",
    dioula: "Dioula",
    baoule: "Baoulé",
    translating: "Traduction…",
    translatedLive: "Traduit par l'IA · en direct",
    translatedOff: "Traduction en direct indisponible — texte original.",
    soilScore: "Score de résilience des sols",
    soilDialog: "Explication du score de résilience des sols",
    score: "Score",
    generating: "Explication en cours de génération…",
    scoreError: "Explication momentanément indisponible. Le score reste calculé sur les données de la parcelle.",
    methodology: "Méthodologie inspirée de standards reconnus type Kubeko.",
    close: "Fermer",
    launch: "Lancer l'analyse",
    analyzing: "Analyse en cours…",
    next: "Continuer",
    replay: "Revoir l'analyse",
    back: "Retour",
  },
  en: {
    eyebrow: "Satellite analysis · FAO",
    intro:
      "The analysis combines several public satellite sources (convergence of evidence, FAO method) around the cut-off date of 31 December 2020.",
    drawing: "Mapping the plot…",
    scanning: "Satellite analysis in progress…",
    stopListen: "Stop reading",
    listenAria: "Listen to the verdict explanation",
    stop: "Stop",
    listen: "Listen",
    localTitle: "Explain to the farmer",
    dioula: "Dioula",
    baoule: "Baoulé",
    translating: "Translating…",
    translatedLive: "Translated by AI · live",
    translatedOff: "Live translation unavailable — original text.",
    soilScore: "Soil resilience score",
    soilDialog: "Soil resilience score explanation",
    score: "Score",
    generating: "Explanation being generated…",
    scoreError: "Explanation temporarily unavailable. The score is still computed from the plot's data.",
    methodology: "Methodology inspired by recognised standards such as Kubeko.",
    close: "Close",
    launch: "Run the analysis",
    analyzing: "Analysis in progress…",
    next: "Continue",
    replay: "Replay the analysis",
    back: "Back",
  },
} as const;

const AnalysisMap = dynamic(() => import("@/components/verifier/analysis-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-forest-950">
      <PinMark size={40} color="#eafff2" leafColor="rgba(224,166,75,0.9)" pulse />
    </div>
  ),
});

/**
 * Étape 3 — cartographie & analyse : LE moment signature. La séquence (contour dessiné →
 * balayage satellite → remplissage du verdict) concentre le budget créatif. Explicabilité
 * (score de sols) + lecture vocale native (Web Speech) : crédibilité algorithmique + inclusion.
 */
export function StepAnalysis({
  parcelle,
  onVerdict,
  onNext,
  onBack,
}: {
  parcelle: Parcelle;
  onVerdict: (w: WhispResult) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [whisp, setWhisp] = useState<WhispResult | null>(null);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [score, setScore] = useState<ScoreSols | null>(null);
  const [scoreErr, setScoreErr] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [traduction, setTraduction] = useState<{ texte: string; langue: "dioula" | "baoule"; live: boolean } | null>(null);
  const [traduireLoading, setTraduireLoading] = useState<"dioula" | "baoule" | null>(null);
  const runningRef = useRef(false);

  const ring = parcelle.geojson.type === "Polygon" ? parcelle.geojson.coordinates[0] : [parcelle.geojson.coordinates];
  const done = phase === "verdict" && whisp;

  useEffect(() => {
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  async function lancer(replay = false) {
    if (runningRef.current) return;
    runningRef.current = true;
    setScoreOpen(false);
    setTraduction(null);
    stopParler();
    setPhase("drawing");
    const fetchP: Promise<WhispResult> =
      replay && whisp
        ? Promise.resolve(whisp)
        : fetch("/api/whisp/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ parcelleId: parcelle.id }),
          }).then((r) => r.json());
    await sleep(reduce ? 0 : 620);
    setPhase("scanning");
    const [result] = await Promise.all([fetchP, sleep(reduce ? 0 : 840)]);
    setWhisp(result);
    onVerdict(result);
    setPhase("verdict");
    runningRef.current = false;
  }

  async function ouvrirScore() {
    if (scoreOpen) {
      setScoreOpen(false);
      return;
    }
    setScoreOpen(true);
    if (!score) {
      setScoreErr(false);
      try {
        const r = await fetch("/api/gemini/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "sols", producteurNom: parcelle.producteurNom }),
        });
        if (!r.ok) throw new Error(String(r.status));
        setScore(await r.json());
      } catch {
        // Jamais un « génération… » éternel : on l'annonce honnêtement.
        setScoreErr(true);
      }
    }
  }

  async function traduire(langue: "dioula" | "baoule") {
    if (!whisp) return;
    setTraduireLoading(langue);
    try {
      // On ne traduit QUE l'explication (whisp.phrase). Le statut reste figé en français.
      const r = await fetch("/api/gemini/traduire-verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte: whisp.phrase, langue }),
      });
      const data = (await r.json()) as { traduction?: string; live?: boolean };
      setTraduction({ texte: data.traduction ?? whisp.phrase, langue, live: Boolean(data.live) });
    } catch {
      setTraduction({ texte: whisp.phrase, langue, live: false });
    } finally {
      setTraduireLoading(null);
    }
  }

  function parler() {
    if (!canSpeak || !whisp) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(lang === "en" ? (whisp.phraseEn ?? whisp.phrase) : whisp.phrase);
      u.lang = lang === "en" ? "en-GB" : "fr-FR";
      u.rate = 0.98;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    } catch {
      setSpeaking(false);
    }
  }
  function stopParler() {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setSpeaking(false);
  }

  const color = whisp ? STATUT_COLOR[whisp.statut] : "var(--color-green-signal)";

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      {/* Carte satellite (dominante) */}
      <div className="relative h-[44vh] min-h-[320px] overflow-hidden rounded-2xl border border-black/[0.08] lg:h-[62vh]">
        <AnalysisMap ring={ring} statut={whisp?.statut ?? parcelle.statut} phase={phase} />
      </div>

      {/* Panneau d'analyse */}
      <div className="flex flex-col rounded-2xl border border-black/[0.05] bg-white p-5 shadow-[0_1px_2px_rgba(10,31,20,0.04)]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} strokeWidth={2} className="text-green-signal" aria-hidden />
          <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        </div>
        <h2 className="mt-2 font-display text-2xl leading-tight text-forest-950">
          {parcelle.producteurNom}
        </h2>
        <p className="num text-sm text-stone-500">
          {parcelle.numeroCartePro} · {parcelle.region}
        </p>

        <div className="mt-5 flex-1">
          {!done ? (
            <div className="flex h-full flex-col">
              <p className="text-sm leading-relaxed text-stone-500">{t.intro}</p>
              {phase !== "idle" && (
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-ivory-deep/50 px-4 py-3">
                  <PinMark size={22} color="var(--color-green-signal)" pulse />
                  <span className="text-sm font-medium text-forest-950">
                    {phase === "drawing" ? t.drawing : t.scanning}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge statut={whisp.statut} lang={lang} />
                {canSpeak && (
                  <button
                    type="button"
                    onClick={speaking ? stopParler : parler}
                    aria-label={speaking ? t.stopListen : t.listenAria}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal"
                  >
                    {speaking ? <VolumeX size={14} strokeWidth={2} /> : <Volume2 size={14} strokeWidth={2} />}
                    {speaking ? t.stop : t.listen}
                  </button>
                )}
              </div>

              <p className="max-w-prose text-[0.95rem] font-medium leading-relaxed text-forest-950">
                {lang === "en" ? (whisp.phraseEn ?? whisp.phrase) : whisp.phrase}
              </p>

              {/* Expliquer en langue locale (Dioula / Baoulé) : on traduit l'EXPLICATION, jamais le statut. */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-stone-500">{t.localTitle} :</span>
                  {(["dioula", "baoule"] as const).map((lg) => (
                    <button
                      key={lg}
                      type="button"
                      onClick={() => traduire(lg)}
                      disabled={traduireLoading !== null}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-2.5 py-1 text-xs font-medium text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal disabled:opacity-50"
                    >
                      {traduireLoading === lg && <Loader2 size={12} strokeWidth={2} className="animate-spin" aria-hidden />}
                      {t[lg]}
                    </button>
                  ))}
                </div>
                {traduction && (
                  <div className="rounded-xl border border-black/[0.06] bg-ivory-deep/40 p-3">
                    <p className="text-[0.9rem] leading-relaxed text-forest-950">{traduction.texte}</p>
                    <p className="mt-1.5 text-[0.68rem] text-stone-400">
                      {traduction.langue === "dioula" ? t.dioula : t.baoule} · {traduction.live ? t.translatedLive : t.translatedOff}
                    </p>
                  </div>
                )}
              </div>

              {/* Faisceau de preuves (qualitatif) */}
              <ul className="flex flex-col gap-1.5">
                {(lang === "en" ? (whisp.convergenceEn ?? whisp.convergence) : whisp.convergence).map((c) => (
                  <li key={c} className="flex gap-2 text-xs leading-relaxed text-stone-500">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>

              {/* Score de résilience des sols (XAI) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={ouvrirScore}
                  aria-expanded={scoreOpen}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-cacao/25 bg-amber-cacao/[0.06] px-3.5 py-2 text-xs font-medium text-amber-cacao outline-none transition-colors hover:bg-amber-cacao/[0.12] focus-visible:ring-2 focus-visible:ring-amber-cacao/40"
                >
                  <Leaf size={14} strokeWidth={2} aria-hidden />
                  {t.soilScore}
                </button>
                <AnimatePresence>
                  {scoreOpen && (
                    <motion.div
                      role="dialog"
                      aria-label={t.soilDialog}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: EASE }}
                      className="absolute left-0 top-full z-20 mt-2 w-full max-w-sm rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_20px_50px_-20px_rgba(10,31,20,0.4)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-forest-950">
                          {t.score} {score ? `· ${score.niveau}` : "…"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setScoreOpen(false)}
                          aria-label={t.close}
                          className="grid h-6 w-6 place-items-center rounded-full text-stone-400 transition-colors hover:bg-black/5 hover:text-forest-950"
                        >
                          <X size={14} strokeWidth={2} />
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                        {score ? score.explication : scoreErr ? t.scoreError : t.generating}
                      </p>
                      <p className="mt-2 border-t border-black/[0.05] pt-2 text-[0.68rem] text-stone-400">
                        {t.methodology}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Diagnostic visuel de la parcelle (IA) — additif, n'affecte pas le verdict satellite. */}
              <PhotoTerrain />
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 border-t border-black/[0.05] pt-5">
          {!done ? (
            <button
              type="button"
              disabled={phase !== "idle"}
              onClick={() => lancer(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform,opacity] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === "idle" ? t.launch : t.analyzing}
            </button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onNext}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {t.next}
                <ArrowRight size={16} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() => lancer(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-3.5 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
              >
                <RotateCcw size={15} strokeWidth={2} aria-hidden />
                {t.replay}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onBack}
            className="rounded-full px-3 py-1 text-center text-sm text-stone-400 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, RefreshCw, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { MemoDiligence } from "@/lib/ai/gemini";
import { useLanguage } from "@/components/language-provider";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Dossier de diligence (DDS) généré par l'IA pour une parcelle. Îlot client : appelle la route
 * serveur `/api/gemini/memo` (MOCK_MODE côté serveur) et révèle le dossier section par section.
 */
export function DdsMemo({ parcelleId }: { parcelleId: string }) {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const en = lang === "en";
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [memo, setMemo] = useState<MemoDiligence | null>(null);

  async function generate() {
    setState("loading");
    try {
      const r = await fetch("/api/gemini/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelleId }),
      });
      if (!r.ok) throw new Error("http");
      setMemo((await r.json()) as MemoDiligence);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <section className="card-premium overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-sm font-semibold text-forest-950">
          <span className="chip-green grid h-9 w-9 place-items-center rounded-xl" aria-hidden>
            <FileText size={17} strokeWidth={2} className="text-green-signal" />
          </span>
          {en ? "Due diligence file" : "Dossier de diligence"}
          <span className="inline-flex items-center gap-1 rounded-full bg-green-signal/12 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-green-signal">
            <Sparkles size={11} strokeWidth={2.5} aria-hidden /> IA
          </span>
        </h2>
        {state === "done" && (
          <button
            type="button"
            onClick={generate}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-xs font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
          >
            <RefreshCw size={13} strokeWidth={2} aria-hidden /> {en ? "Regenerate" : "Régénérer"}
          </button>
        )}
      </div>

      {state === "idle" && (
        <div className="mt-3">
          <p className="max-w-xl text-sm leading-relaxed text-stone-500">
            {en
              ? "The AI composes an audit-ready file from the plot's verified data (operator, geolocation, verdict, methodology), ready for a TRACES NT declaration."
              : "L'IA compose un dossier « audit-ready » à partir des données vérifiées de la parcelle (opérateur, géolocalisation, verdict, méthodologie), prêt pour une déclaration TRACES NT."}
          </p>
          <button
            type="button"
            onClick={generate}
            className="btn-green mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <Sparkles size={16} strokeWidth={2.25} aria-hidden />
            {en ? "Generate the file" : "Générer le dossier"}
          </button>
        </div>
      )}

      {state === "loading" && (
        <div className="mt-4 flex flex-col gap-3" aria-live="polite">
          <p className="flex items-center gap-2 text-sm text-stone-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-signal/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-signal" />
            </span>
            {en ? "The AI is composing the due diligence file…" : "L'IA compose le dossier de diligence…"}
          </p>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="relative h-3 overflow-hidden rounded-full bg-black/[0.05]" style={{ width: `${92 - i * 12}%` }}>
              <div className="sweep-green absolute inset-0" />
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="mt-3">
          <p className="text-sm text-red-block">
            {en ? "Generation failed. Try again." : "La génération a échoué. Réessayez."}
          </p>
          <button type="button" onClick={generate} className="btn-green mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
            <RefreshCw size={15} aria-hidden /> {en ? "Try again" : "Réessayer"}
          </button>
        </div>
      )}

      {state === "done" && memo && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}
          className="mt-4 flex flex-col gap-4"
        >
          <motion.div
            variants={{ hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-black/[0.06] pb-3"
          >
            <span className="num text-xs font-semibold text-forest-950">{memo.reference}</span>
            <StatusBadge statut={memo.statut} size="sm" />
            <span className="text-xs text-stone-400">
              {en ? "Generated just now · assessment, not a guarantee" : "Généré à l'instant · évaluation, non garantie"}
            </span>
          </motion.div>

          {memo.sections.map((s) => (
            <motion.div
              key={s.titre}
              variants={{ hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}
            >
              <p className="text-sm font-semibold text-forest-950">{s.titre}</p>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{s.corps}</p>
            </motion.div>
          ))}

          <motion.div
            variants={{ hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}
            className="rounded-xl border border-green-signal/20 bg-green-signal/[0.05] p-4"
          >
            <p className="text-sm font-medium leading-relaxed text-forest-800">{memo.conclusion}</p>
          </motion.div>

          <p className="text-xs leading-relaxed text-stone-400">{memo.avertissement}</p>
        </motion.div>
      )}
    </section>
  );
}

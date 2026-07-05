"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Loader2, Smartphone } from "lucide-react";
import { PinMark } from "@/components/ui/pin-mark";
import { fmtFCFA } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;
const MIN = 50000;
const MAX = 250000;
const STEP = 10000;

/**
 * Étape 5 — inclusion financière (uniquement si conforme). Le producteur conforme devient
 * éligible : proposition de micro-crédit (un PRÊT remboursable, facilité via l'IMF partenaire ;
 * le service AGRIVO reste gratuit). Simulation Mobile Money + animation de succès.
 * « Le vert prouve, l'or récompense. »
 */
export function StepCredit({
  producteurNom,
  onFinish,
  onBack,
}: {
  producteurNom: string;
  onFinish: () => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const [amount, setAmount] = useState(150000);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  async function proposer() {
    setStatus("sending");
    await new Promise((r) => setTimeout(r, reduce ? 300 : 1500));
    setStatus("done");
  }

  const pct = ((amount - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center gap-2">
        <Smartphone size={16} strokeWidth={2} className="text-amber-cacao" aria-hidden />
        <p className="eyebrow text-amber-cacao">Inclusion financière</p>
      </div>

      <AnimatePresence mode="wait">
        {status !== "done" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(10,31,20,0.04)]"
          >
            <h2 className="font-display text-2xl leading-tight text-forest-950">
              {producteurNom} est éligible au micro-crédit
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Sa parcelle est conforme. Proposez un montant : c&apos;est un prêt facilité auprès de
              l&apos;institution de microfinance partenaire, remboursable par le producteur. Le service
              AGRIVO reste gratuit pour lui.
            </p>

            <div className="mt-7">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-stone-400">Montant proposé</span>
                <span className="num text-2xl font-semibold text-forest-950">{fmtFCFA(amount)}</span>
              </div>
              <input
                type="range"
                min={MIN}
                max={MAX}
                step={STEP}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                aria-label="Montant du micro-crédit en FCFA"
                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                style={{
                  background: `linear-gradient(to right, var(--color-green-signal) ${pct}%, var(--color-stone-100) ${pct}%)`,
                  accentColor: "var(--color-green-signal)",
                }}
              />
              <div className="mt-1.5 flex justify-between text-xs text-stone-400">
                <span className="num">{fmtFCFA(MIN)}</span>
                <span className="num">{fmtFCFA(MAX)}</span>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-stone-400 outline-none transition-colors hover:text-forest-950 focus-visible:text-forest-950"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={proposer}
                disabled={status === "sending"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform,opacity] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 size={16} strokeWidth={2} className="animate-spin" />
                    Envoi Mobile Money…
                  </>
                ) : (
                  <>
                    <Smartphone size={16} strokeWidth={2} aria-hidden />
                    Proposer au producteur
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative overflow-hidden rounded-2xl border border-green-signal/20 bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(10,31,20,0.4)]"
          >
            <div className="glow-radial pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            <motion.div
              initial={reduce ? { scale: 1 } : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: reduce ? 0 : 0.1 }}
              className="relative mx-auto grid h-20 w-20 place-items-center"
            >
              <span className="absolute inset-0 rounded-full bg-green-signal/12" />
              <PinMark size={52} color="var(--color-green-signal)" leafColor="var(--color-amber-soft)" />
              <motion.span
                initial={reduce ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: reduce ? 0 : 0.35, type: "spring", stiffness: 300, damping: 15 }}
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-green-signal text-white ring-4 ring-white"
              >
                <Check size={16} strokeWidth={3} />
              </motion.span>
            </motion.div>

            <h2 className="relative mt-5 font-display text-2xl text-forest-950">Proposition envoyée</h2>
            <p className="relative mt-1.5 text-sm text-stone-500">
              {fmtFCFA(amount)} proposés à {producteurNom} par Mobile Money.
            </p>
            <p className="relative mt-3 font-display text-sm italic text-amber-cacao">
              Le vert prouve, l&apos;or récompense.
            </p>

            <button
              type="button"
              onClick={onFinish}
              className="group relative mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-forest-950 px-6 py-3.5 text-sm font-semibold text-white outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Retour au tableau de bord
              <ArrowRight size={16} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

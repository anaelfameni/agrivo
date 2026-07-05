"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import { PinMark } from "@/components/ui/pin-mark";
import { StatusBadge } from "@/components/ui/status-badge";
import { QUESTIONS_SUGGEREES } from "@/lib/ai/gemini";
import { type Parcelle } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  animate?: boolean;
  parcelles?: Parcelle[];
  metric?: { label: string; value: string };
}

let msgSeq = 0;
const nid = () => `m${++msgSeq}`;

/** Révèle un texte mot à mot (effet « IA qui rédige »). En reduced-motion : texte complet d'emblée. */
function TypedText({ text, animate, onTick }: { text: string; animate?: boolean; onTick?: () => void }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const [count, setCount] = useState(animate && !reduce ? 0 : words.length);

  useEffect(() => {
    if (!animate || reduce) {
      setCount(words.length);
      return;
    }
    setCount(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setCount(i);
      onTick?.();
      if (i >= words.length) clearInterval(timer);
    }, 28);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animate, reduce]);

  return <>{words.slice(0, count).join(" ")}</>;
}

export function AssistantTab({
  onCiteSelect,
  pushLog,
}: {
  onCiteSelect: (id: string) => void;
  pushLog: (e: { service: string; label: string; ms?: number; status?: "ok" | "warn" }) => void;
}) {
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: nid(),
      role: "assistant",
      text: "Bonjour Marc. Je raisonne sur votre portefeuille de parcelles vérifiées : conformité, anomalies, superficies, éligibilité au micro-crédit. Posez votre question, ou choisissez ci-dessous.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages, loading]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { id: nid(), role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/gemini/query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = (await res.json()) as {
        texte: string;
        parcelles: Parcelle[];
        metric?: { label: string; value: string };
        analyseMs: number;
      };
      pushLog({ service: "Gemini API", label: `Requête assistant · réponse en ${data.analyseMs} ms`, ms: data.analyseMs, status: "ok" });
      setMessages((m) => [
        ...m,
        { id: nid(), role: "assistant", text: data.texte, animate: true, parcelles: data.parcelles, metric: data.metric },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: nid(), role: "assistant", text: "Je n'ai pas pu interroger le portefeuille à l'instant. Réessayez dans un moment." },
      ]);
      pushLog({ service: "Gemini API", label: "Requête assistant · échec", status: "warn" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-15rem)] min-h-[420px] max-w-3xl flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(10,31,20,0.04)]">
      {/* En-tête à l'identité AGRIVO (pas un chat générique) */}
      <div className="flex items-center gap-3 border-b border-black/[0.06] bg-ivory/60 px-4 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "rgba(22,163,74,0.1)" }} aria-hidden>
          <PinMark size={20} />
        </span>
        <div>
          <p className="text-sm font-semibold text-forest-950">Assistant AGRIVO</p>
          <p className="flex items-center gap-1.5 text-xs text-stone-500">
            <Sparkles size={12} strokeWidth={2} className="text-green-signal" aria-hidden />
            Raisonne sur vos données vérifiées · Gemini
          </p>
        </div>
      </div>

      {/* Fil de discussion */}
      <div ref={scrollRef} role="log" aria-live="polite" aria-label="Conversation avec l'assistant" className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.map((m) =>
          m.role === "user" ? (
            <motion.div
              key={m.id}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex justify-end"
            >
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-forest-950 px-4 py-2.5 text-sm text-white">{m.text}</p>
            </motion.div>
          ) : (
            <motion.div
              key={m.id}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex gap-2.5"
            >
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: "rgba(22,163,74,0.1)" }} aria-hidden>
                <PinMark size={15} />
              </span>
              <div className="min-w-0 max-w-[85%] space-y-2.5">
                <div className="rounded-2xl rounded-tl-md bg-ivory-deep/60 px-4 py-2.5 text-sm leading-relaxed text-forest-950">
                  <TypedText text={m.text} animate={m.animate} onTick={scrollToEnd} />
                </div>

                {m.metric && (
                  <div className="inline-flex items-baseline gap-2 rounded-xl border border-green-signal/20 bg-green-signal/[0.06] px-3 py-2">
                    <span className="num text-xl font-semibold text-forest-950">{m.metric.value}</span>
                    <span className="text-xs text-stone-500">{m.metric.label}</span>
                  </div>
                )}

                {m.parcelles && m.parcelles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.parcelles.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onCiteSelect(p.id)}
                        className="group inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white py-1 pl-1 pr-2.5 text-xs outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal"
                        title={`Voir ${p.producteurNom} sur la carte`}
                      >
                        <StatusBadge statut={p.statut} size="sm" />
                        <span className="font-medium text-forest-950">{p.producteurNom}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ),
        )}

        {/* Indicateur « rédige… » */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2.5"
            >
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: "rgba(22,163,74,0.1)" }} aria-hidden>
                <PinMark size={15} pulse />
              </span>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-ivory-deep/60 px-4 py-3.5" aria-label="L'assistant rédige">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-stone-400"
                    animate={reduce ? {} : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Questions suggérées + saisie */}
      <div className="border-t border-black/[0.06] bg-ivory/40 px-4 py-3">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {QUESTIONS_SUGGEREES.map((q) => (
            <button
              key={q}
              type="button"
              disabled={loading}
              onClick={() => ask(q)}
              className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Votre question sur le portefeuille"
            placeholder="Posez une question sur votre portefeuille…"
            className="h-11 flex-1 rounded-full border border-black/[0.08] bg-white px-4 text-sm text-forest-950 outline-none transition-colors placeholder:text-stone-400 focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Envoyer"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-signal text-white outline-none transition-[filter,transform] hover:brightness-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-40"
          >
            <ArrowUp size={18} strokeWidth={2.25} />
          </button>
        </form>
      </div>
    </div>
  );
}

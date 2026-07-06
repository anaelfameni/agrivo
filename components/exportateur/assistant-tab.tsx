"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Sparkles, Wrench } from "lucide-react";
import { PinMark } from "@/components/ui/pin-mark";
import { StatusBadge } from "@/components/ui/status-badge";
import { QUESTIONS_SUGGEREES } from "@/lib/ai/gemini";
import { useLanguage } from "@/components/language-provider";
import { type Parcelle } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  fr: {
    greeting:
      "Bonjour Marc. Je raisonne sur votre portefeuille de parcelles vérifiées : conformité, anomalies, superficies, parcelles prêtes pour le dossier exportateur. Posez votre question, ou choisissez ci-dessous.",
    error: "Je n'ai pas pu interroger le portefeuille à l'instant. Réessayez dans un moment.",
    title: "Assistant AGRIVO",
    subtitle: "Copilote agentique · exécute des outils sur vos données vérifiées",
    logAria: "Conversation avec l'assistant",
    tools: "Outils exécutés",
    seeOnMap: (nom: string) => `Voir ${nom} sur la carte`,
    typing: "L'assistant rédige",
    inputAria: "Votre question sur le portefeuille",
    placeholder: "Posez une question sur votre portefeuille…",
    send: "Envoyer",
  },
  en: {
    greeting:
      "Hello Marc. I reason over your portfolio of verified plots: compliance, anomalies, areas, micro-loan eligibility. Ask your question, or pick one below.",
    error: "I could not query the portfolio just now. Please try again in a moment.",
    title: "AGRIVO Assistant",
    subtitle: "Agentic copilot · runs tools on your verified data",
    logAria: "Conversation with the assistant",
    tools: "Tools executed",
    seeOnMap: (nom: string) => `See ${nom} on the map`,
    typing: "The assistant is writing",
    inputAria: "Your question about the portfolio",
    placeholder: "Ask a question about your portfolio…",
    send: "Send",
  },
} as const;

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  animate?: boolean;
  parcelles?: Parcelle[];
  metric?: { label: string; value: string };
  tools?: { name: string; detail: string }[];
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
  const { lang } = useLanguage();
  const t = COPY[lang];
  // Le message d'accueil est identifié par un id sentinelle : son texte suit la langue active.
  const [messages, setMessages] = useState<Msg[]>([{ id: "greeting", role: "assistant", text: "" }]);
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
        tools?: { name: string; detail: string }[];
        analyseMs: number;
      };
      pushLog({ service: "Gemini API", label: `Requête assistant · réponse en ${data.analyseMs} ms`, ms: data.analyseMs, status: "ok" });
      setMessages((m) => [
        ...m,
        { id: nid(), role: "assistant", text: data.texte, animate: true, parcelles: data.parcelles, metric: data.metric, tools: data.tools },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: nid(), role: "assistant", text: t.error },
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
          <p className="text-sm font-semibold text-forest-950">{t.title}</p>
          <p className="flex items-center gap-1.5 text-xs text-stone-500">
            <Sparkles size={12} strokeWidth={2} className="text-green-signal" aria-hidden />
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Fil de discussion */}
      <div ref={scrollRef} role="log" aria-live="polite" aria-label={t.logAria} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
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
                  <TypedText text={m.id === "greeting" ? t.greeting : m.text} animate={m.animate} onTick={scrollToEnd} />
                </div>

                {m.tools && m.tools.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase tracking-wide text-stone-400">
                      <Wrench size={11} strokeWidth={2.5} aria-hidden /> {t.tools}
                    </span>
                    {m.tools.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full border border-green-signal/20 bg-green-signal/[0.06] px-2 py-0.5 text-[0.68rem] text-forest-800"
                        title={`${t.name} → ${t.detail}`}
                      >
                        <span className="num font-semibold text-green-signal">{t.name}</span>
                        <span className="text-stone-400">{t.detail}</span>
                      </span>
                    ))}
                  </div>
                )}

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
                        title={t.seeOnMap(p.producteurNom)}
                      >
                        <StatusBadge statut={p.statut} size="sm" lang={lang} />
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
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-ivory-deep/60 px-4 py-3.5" aria-label={t.typing}>
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
            aria-label={t.inputAria}
            placeholder={t.placeholder}
            className="h-11 flex-1 rounded-full border border-black/[0.08] bg-white px-4 text-sm text-forest-950 outline-none transition-colors placeholder:text-stone-400 focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label={t.send}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-signal text-white outline-none transition-[filter,transform] hover:brightness-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-40"
          >
            <ArrowUp size={18} strokeWidth={2.25} />
          </button>
        </form>
      </div>
    </div>
  );
}

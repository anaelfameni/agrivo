"use client";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Send, X, ShieldCheck, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { FAITS_RDUE, QUESTIONS_SUGGEREES } from "@/lib/ai/rdue-faits";

/**
 * Copilote de conformité RDUE — assistant conversationnel flottant.
 * Interroge /api/gemini/rdue-qa (réponses groundées sur la base de faits sourcée).
 * Charte : statuts figés, aucune promesse, aucune finance — la route s'en assure ;
 * l'interface se contente d'afficher la réponse et sa source, avec un badge honnête
 * « IA en direct » (live) ou « Base RDUE vérifiée » (repli déterministe sourcé).
 */

interface Message {
  role: "user" | "assistant";
  text: string;
  source?: string | null;
  live?: boolean;
}

const UI = {
  fr: {
    ouvrir: "Ouvrir l'assistant AGRIVO",
    fermer: "Fermer",
    titre: "Assistant AGRIVO",
    sous: "Vos questions sur AGRIVO et la conformité RDUE.",
    accroche: "Posez une question sur AGRIVO (prix, parcours, verdicts, comptes) ou sur le règlement européen contre la déforestation. Je réponds à partir de faits vérifiés et sourcés.",
    placeholder: "Ex. : combien coûte AGRIVO ?",
    envoyer: "Envoyer",
    live: "IA en direct",
    base: "Base vérifiée",
    source: "Source",
    erreur: "Connexion indisponible. Réessayez dans un instant.",
    avert: "Évaluation et information réglementaire — ne remplace pas un conseil juridique.",
  },
  en: {
    ouvrir: "Open the AGRIVO assistant",
    fermer: "Close",
    titre: "AGRIVO Assistant",
    sous: "Your questions on AGRIVO and EUDR compliance.",
    accroche: "Ask about AGRIVO (pricing, journey, verdicts, accounts) or the EU Deforestation Regulation. I answer from verified, sourced facts.",
    placeholder: "E.g.: how much does AGRIVO cost?",
    envoyer: "Send",
    live: "AI live",
    base: "Verified base",
    source: "Source",
    erreur: "Connection unavailable. Please try again shortly.",
    avert: "Assessment and regulatory information — not a substitute for legal advice.",
  },
} as const;

export function CopiloteRdue() {
  const { lang } = useLanguage();
  const t = UI[lang];
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Questions de suivi : celles de la base de faits qui n'ont pas encore été posées (2 max).
  // Déterministe et sans appel réseau — le copilote reste conversationnel même en repli.
  const posees = React.useMemo(
    () => new Set(messages.filter((m) => m.role === "user").map((m) => m.text)),
    [messages],
  );
  const suivantes = React.useMemo(
    () => FAITS_RDUE.map((f) => f.question[lang]).filter((q) => !posees.has(q)).slice(0, 2),
    [posees, lang],
  );
  const dernierAssistant = messages.length > 0 && messages[messages.length - 1].role === "assistant";

  async function envoyer(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/gemini/rdue-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lang }),
      });
      const data = (await res.json()) as { reponse?: string; source?: string | null; live?: boolean };
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reponse ?? t.erreur, source: data.source, live: Boolean(data.live) },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: t.erreur }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t.ouvrir}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-signal text-white shadow-lg shadow-green-signal/30 transition-transform hover:scale-105 active:scale-95"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <Sparkles size={24} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label={t.titre}
            className="fixed bottom-24 right-6 z-40 flex h-[min(32rem,70vh)] w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-ivory shadow-2xl"
          >
            {/* En-tête */}
            <div className="flex items-start gap-3 border-b border-black/[0.08] bg-forest-950 px-4 py-3.5 text-white">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-signal/20 text-green-signal">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base leading-tight">{t.titre}</p>
                <p className="text-xs text-white/60">{t.sous}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label={t.fermer} className="rounded-full p-1 text-white/60 transition-colors hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Fil de conversation */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-stone-600">{t.accroche}</p>
                  <div className="flex flex-wrap gap-2">
                    {QUESTIONS_SUGGEREES.map((s) => (
                      <button
                        key={s.fr}
                        onClick={() => envoyer(s[lang])}
                        className="rounded-full border border-green-signal/30 bg-green-signal/[0.06] px-3 py-1.5 text-left text-xs font-medium text-forest-950 transition-colors hover:bg-green-signal/[0.12]"
                      >
                        {s[lang]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={m.role === "user" ? "max-w-[85%] rounded-2xl rounded-br-sm bg-green-signal px-3.5 py-2.5 text-sm text-white" : "max-w-[90%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm text-forest-950 shadow-sm ring-1 ring-black/[0.05]"}>
                    <p className="leading-relaxed">{m.text}</p>
                    {m.role === "assistant" && (m.source || m.live !== undefined) && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/[0.06] pt-2 text-[11px] text-stone-500">
                        <span className={m.live ? "inline-flex items-center gap-1 font-semibold text-green-signal" : "inline-flex items-center gap-1 font-semibold text-amber-cacao"}>
                          <span className={m.live ? "h-1.5 w-1.5 rounded-full bg-green-signal" : "h-1.5 w-1.5 rounded-full bg-amber-cacao"} />
                          {m.live ? t.live : t.base}
                        </span>
                        {m.source && <span>· {t.source} : {m.source}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm text-stone-500 shadow-sm ring-1 ring-black/[0.05]">
                    <Loader2 size={15} className="animate-spin" />
                  </div>
                </div>
              )}

              {/* Suivi conversationnel : propose les questions non encore posées. */}
              {dernierAssistant && !loading && suivantes.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suivantes.map((q) => (
                    <button
                      key={q}
                      onClick={() => envoyer(q)}
                      className="rounded-full border border-green-signal/30 bg-green-signal/[0.06] px-3 py-1.5 text-left text-xs font-medium text-forest-950 transition-colors hover:bg-green-signal/[0.12]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Saisie */}
            <form
              onSubmit={(e) => { e.preventDefault(); envoyer(input); }}
              className="border-t border-black/[0.08] bg-white px-3 py-3"
            >
              <div className="flex items-end gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.placeholder}
                  aria-label={t.placeholder}
                  className="min-w-0 flex-1 rounded-xl border border-black/[0.1] bg-ivory px-3 py-2 text-sm text-forest-950 outline-none transition-colors focus:border-green-signal"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label={t.envoyer}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-signal text-white transition-opacity disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="mt-2 px-1 text-[10px] leading-tight text-stone-400">{t.avert}</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

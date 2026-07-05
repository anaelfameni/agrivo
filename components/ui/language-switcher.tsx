"use client";

import * as React from "react";
import { Check, Globe, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import { LANGUAGES, LANGUAGE_META, type Language } from "@/lib/i18n";

/**
 * Sélecteur de langue accessible (Français · Dioula · Baoulé).
 * `tone` : "light" pour un fond sombre (hero), "dark" pour un fond clair (pages intérieures).
 * Navigation clavier (flèches, Home/End, Échap), fermeture au clic extérieur, focus rendu.
 */
export function LanguageSwitcher({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemsRef = React.useRef<Array<HTMLButtonElement | null>>([]);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, LANGUAGES.indexOf(lang));
    setActiveIndex(idx);
    const raf = requestAnimationFrame(() => itemsRef.current[idx]?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open, lang]);

  const choose = (l: Language) => {
    setLang(l);
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const focusItem = (i: number) => {
    setActiveIndex(i);
    itemsRef.current[i]?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        focusItem((activeIndex + 1) % LANGUAGES.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusItem((activeIndex - 1 + LANGUAGES.length) % LANGUAGES.length);
        break;
      case "Home":
        e.preventDefault();
        focusItem(0);
        break;
      case "End":
        e.preventDefault();
        focusItem(LANGUAGES.length - 1);
        break;
    }
  };

  const triggerCls =
    tone === "light"
      ? "border-white/20 text-white/80 hover:border-white/40 hover:text-white focus-visible:ring-white/70"
      : "border-black/10 text-forest-950/80 hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-green-signal";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("language")} : ${LANGUAGE_META[lang].label}`}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${triggerCls}`}
      >
        <Globe size={15} strokeWidth={1.75} aria-hidden />
        {LANGUAGE_META[lang].short}
        <ChevronDown size={14} strokeWidth={2} aria-hidden className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={t("language")}
            onKeyDown={onKeyDown}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_20px_50px_-20px_rgba(10,31,20,0.4)]"
          >
            {LANGUAGES.map((l, i) => {
              const selected = l === lang;
              const meta = LANGUAGE_META[l];
              return (
                <button
                  key={l}
                  ref={(el) => {
                    itemsRef.current[i] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  tabIndex={i === activeIndex ? 0 : -1}
                  onClick={() => choose(l)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-ivory-deep/60 focus:bg-ivory-deep/60 focus:outline-none ${selected ? "font-semibold text-forest-950" : "text-stone-600"}`}
                >
                  <span className="flex flex-col">
                    <span>{meta.label}</span>
                    {meta.native !== meta.label && (
                      <span className="text-xs text-stone-400">{meta.native}</span>
                    )}
                  </span>
                  {selected && <Check size={16} strokeWidth={2} aria-hidden className="text-green-signal" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

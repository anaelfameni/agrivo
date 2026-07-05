"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  translate,
  type Language,
  type TranslationKey,
} from "@/lib/i18n";

type Ctx = { lang: Language; setLang: (l: Language) => void; t: (k: TranslationKey) => string };
const LanguageContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "agrivo_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored) setLangState(stored);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  // Reflète la langue active sur <html lang> (accessibilité + moteurs de recherche).
  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* no-op */
    }
  }, []);

  const t = useCallback((k: TranslationKey) => translate(lang, k), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// Contexte de repli : hors <LanguageProvider> (pages d'erreur globales qui remplacent le layout
// racine, prerender de /_not-found…) on retombe sur le français plutôt que de crasher le rendu.
const FALLBACK_CTX: Ctx = {
  lang: DEFAULT_LANGUAGE,
  setLang: () => {},
  t: (k: TranslationKey) => translate(DEFAULT_LANGUAGE, k),
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  return ctx ?? FALLBACK_CTX;
}

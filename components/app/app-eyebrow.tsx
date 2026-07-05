"use client";

import { useLanguage } from "@/components/language-provider";

/** Eyebrow bilingue de la topbar /app (îlot client dans le layout serveur). */
export function AppEyebrow() {
  const { lang } = useLanguage();
  return (
    <span className="eyebrow hidden text-green-signal sm:block">
      {lang === "en" ? "Cooperative workspace" : "Espace coopérative"}
    </span>
  );
}

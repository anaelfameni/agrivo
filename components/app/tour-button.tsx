"use client";

import { HelpCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/** Bouton « ? » de la topbar /app : relance le guide interactif (événement `agrivo:tour:open`). */
export function TourButton() {
  const { lang } = useLanguage();
  const label = lang === "en" ? "Replay the guide" : "Relancer le guide";
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("agrivo:tour:open"))}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white/70 text-stone-500 outline-none transition-colors hover:border-green-signal/40 hover:text-green-signal focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
    >
      <HelpCircle size={16} strokeWidth={2} aria-hidden />
    </button>
  );
}

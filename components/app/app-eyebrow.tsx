"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

/** Eyebrow bilingue de la topbar /app (îlot client dans le layout serveur).
 * Route-aware : le cockpit exportateur n'est pas l'espace coopérative. */
export function AppEyebrow() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const exportateur = pathname?.startsWith("/app/exportateur");
  const label = exportateur
    ? lang === "en" ? "Exporter workspace" : "Espace exportateur"
    : lang === "en" ? "Cooperative workspace" : "Espace coopérative";
  return <span className="eyebrow hidden text-green-signal sm:block">{label}</span>;
}

"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";

/** Eyebrow bilingue de la topbar /app (îlot client dans le layout serveur).
 * Role/route-aware : l'exportateur voit toujours « Espace exportateur ». */
export function AppEyebrow() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const pathname = usePathname();
  const exportateur = user?.role === "exporter" || pathname?.startsWith("/app/exportateur");
  const label = exportateur
    ? lang === "en" ? "Exporter workspace" : "Espace exportateur"
    : lang === "en" ? "Cooperative workspace" : "Espace coopérative";
  return <span className="eyebrow hidden text-green-signal sm:block">{label}</span>;
}

"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { lireMesures, statsOnboarding, type StatsOnboarding } from "@/lib/mesure/onboarding";

/**
 * Coût d'onboarding MESURÉ — le panneau interne qui remplace le chiffre supposé par une donnée
 * réelle : durée moyenne/médiane des parcours de vérification complétés sur cet appareil.
 * Invisible tant qu'aucune mesure n'existe (jamais un zéro décoratif) ; réservé au pilotage,
 * jamais montré à un client.
 */
const TR = {
  fr: {
    title: "Coût d'onboarding (mesure interne)",
    sub: "Durée réelle des parcours de vérification complétés sur cet appareil.",
    moyenne: "Durée moyenne",
    mediane: "Médiane",
    parcours: (n: number) => `${n} parcours mesuré${n > 1 ? "s" : ""}`,
    min: "min",
  },
  en: {
    title: "Onboarding cost (internal metric)",
    sub: "Real duration of verification journeys completed on this device.",
    moyenne: "Average duration",
    mediane: "Median",
    parcours: (n: number) => `${n} journey${n > 1 ? "s" : ""} measured`,
    min: "min",
  },
} as const;

export function OnboardingStats() {
  const { lang } = useLanguage();
  const t = TR[lang === "en" ? "en" : "fr"];
  const [stats, setStats] = useState<StatsOnboarding | null>(null);

  // Lecture navigateur uniquement (après hydratation, jamais en SSR).
  useEffect(() => {
    setStats(statsOnboarding(lireMesures()));
  }, []);

  if (!stats || stats.n === 0) return null;

  return (
    <div className="card-premium rounded-2xl p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-forest-950">
        <Timer size={15} className="text-green-signal" /> {t.title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-stone-500">{t.sub}</p>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-ivory p-3">
          <dt className="text-[0.66rem] uppercase tracking-wide text-forest-950/45">{t.moyenne}</dt>
          <dd className="num mt-0.5 text-xl font-bold text-forest-950">
            {stats.moyenneMin.toLocaleString(lang === "en" ? "en" : "fr-FR")} <span className="text-sm font-medium text-forest-950/45">{t.min}</span>
          </dd>
        </div>
        <div className="rounded-xl bg-ivory p-3">
          <dt className="text-[0.66rem] uppercase tracking-wide text-forest-950/45">{t.mediane}</dt>
          <dd className="num mt-0.5 text-xl font-bold text-forest-950">
            {stats.medianeMin.toLocaleString(lang === "en" ? "en" : "fr-FR")} <span className="text-sm font-medium text-forest-950/45">{t.min}</span>
          </dd>
        </div>
      </dl>
      <p className="num mt-2 text-[0.7rem] text-forest-950/40">{t.parcours(stats.n)}</p>
    </div>
  );
}

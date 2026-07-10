"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { AssistantTab } from "@/components/exportateur/assistant-tab";

/**
 * Assistant IA (espace exportateur) : interrogez le portefeuille en langage naturel.
 * Chaque réponse est calculée sur les données réelles et cite les parcelles concernées —
 * cliquer une parcelle citée ouvre la page Parcelles avec la sélection posée.
 */

const COPY = {
  fr: {
    eyebrow: "Espace exportateur",
    titre: "Assistant IA",
    sous: "Interrogez votre portefeuille en langage naturel : « Quelles parcelles présentent un risque à Soubré ? », « Quel volume est validé ? ». Chaque réponse est calculée sur vos données et cite les parcelles concernées.",
  },
  en: {
    eyebrow: "Exporter workspace",
    titre: "AI Assistant",
    sous: "Query your portfolio in natural language: \"Which plots are at risk in Soubré?\", \"What volume is validated?\". Every answer is computed on your data and cites the plots involved.",
  },
} as const;

export default function AssistantExportateurPage() {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const router = useRouter();

  const onCiteSelect = React.useCallback(
    (id: string) => router.push(`/app/exportateur/parcelles?parcelle=${id}`),
    [router],
  );
  const pushLog = React.useCallback(() => {
    /* le journal d'activité vit sur la page Dossiers & rapports */
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl leading-tight text-forest-950">{t.titre}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-stone-500">{t.sous}</p>
      </div>

      <div data-tour="assistant-portefeuille">
        <AssistantTab onCiteSelect={onCiteSelect} pushLog={pushLog} />
      </div>
    </div>
  );
}

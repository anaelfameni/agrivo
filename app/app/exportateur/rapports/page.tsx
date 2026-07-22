"use client";

import * as React from "react";
import { useLanguage } from "@/components/language-provider";
import { DossierAcheteur } from "@/components/exportateur/dossier-acheteur";
import { ConfigTab } from "@/components/exportateur/config-tab";
import { type LogEntry } from "@/components/exportateur/types";
import { PARCELLES } from "@/data/mock-parcelles";

/**
 * Dossiers & rapports (espace exportateur) : le dossier acheteur EUDR consolidé (résumé
 * exécutif IA + certificats vérifiables + GeoJSON TRACES NT), le centre d'alertes du
 * portefeuille groupé par coopérative et le journal d'activité.
 */

const COPY = {
  fr: {
    eyebrow: "Espace exportateur",
    titre: "Dossiers & rapports",
    sous: "Consolidez vos parcelles conformes pour l'acheteur européen, suivez les alertes du portefeuille et le journal d'activité.",
    timeLocale: "fr-FR",
  },
  en: {
    eyebrow: "Exporter workspace",
    titre: "Files & reports",
    sous: "Consolidate your compliant plots for the European buyer, track portfolio alerts and the activity log.",
    timeLocale: "en-GB",
  },
} as const;

export default function RapportsExportateurPage() {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [log, setLog] = React.useState<LogEntry[]>([]);

  const pushLog = React.useCallback(
    (e: { service: string; label: string; ms?: number; status?: "ok" | "warn" }) => {
      setLog((prev) =>
        [
          {
            id: `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
            service: e.service,
            label: e.label,
            ms: e.ms ?? 0,
            status: e.status ?? "ok",
            time: new Date().toLocaleTimeString(t.timeLocale),
          },
          ...prev,
        ].slice(0, 60),
      );
    },
    [t.timeLocale],
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl leading-tight text-forest-950">{t.titre}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-stone-500">{t.sous}</p>
      </div>

      <div data-tour="dossier-acheteur">
        <DossierAcheteur />
      </div>

      {/* Centre d'alertes + journal d'activité */}
      <ConfigTab parcelles={PARCELLES} log={log} pushLog={pushLog} />
    </div>
  );
}

"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { AnalyticsTab } from "@/components/exportateur/analytics-tab";
import { PARCELLES, exporterFeatureCollection, type Parcelle } from "@/data/mock-parcelles";

/**
 * Parcelles (espace exportateur) : le registre satellite du portefeuille — tableau triable
 * LIÉ à la carte (cliquer d'un côté surligne de l'autre), masque des zones sensibles,
 * export GeoJSON RFC 7946. Accepte `?coop=` (vue filtrée depuis la page Coopératives)
 * et `?parcelle=` (sélection directe depuis Producteurs, Rapports ou l'assistant).
 */

const COPY = {
  fr: {
    eyebrow: "Espace exportateur",
    titre: "Parcelles",
    sous: "Le registre satellite de votre portefeuille : tableau et carte liés, masque des zones sensibles, export GeoJSON (RFC 7946) prêt pour TRACES NT.",
    coopFiltre: (c: string) => `Coopérative : ${c}`,
    leverFiltre: "Afficher tout le portefeuille",
  },
  en: {
    eyebrow: "Exporter workspace",
    titre: "Plots",
    sous: "Your portfolio's satellite register: linked table and map, sensitive-areas mask, GeoJSON export (RFC 7946) ready for TRACES NT.",
    coopFiltre: (c: string) => `Cooperative: ${c}`,
    leverFiltre: "Show the whole portfolio",
  },
} as const;

function ParcellesInner() {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const params = useSearchParams();

  const [coop, setCoop] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  // Paramètres d'entrée lus UNE fois (les interactions suivantes vivent dans l'état local).
  React.useEffect(() => {
    const c = params.get("coop");
    const p = params.get("parcelle");
    if (c && PARCELLES.some((x) => x.cooperative === c)) setCoop(c);
    if (p && PARCELLES.some((x) => x.id === p)) setSelectedId(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liste = React.useMemo(
    () => (coop ? PARCELLES.filter((p) => p.cooperative === coop) : PARCELLES),
    [coop],
  );

  const exportGeoJSON = React.useCallback((list: Parcelle[], scope: string) => {
    const fc = exporterFeatureCollection(list);
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agrivo-portefeuille-${list.length}-parcelles.geojson`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    void scope;
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl leading-tight text-forest-950">{t.titre}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-stone-500">{t.sous}</p>
        {coop && (
          <button
            type="button"
            onClick={() => setCoop(null)}
            title={t.leverFiltre}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-green-signal/30 bg-green-signal/[0.08] px-3.5 py-1.5 text-xs font-semibold text-forest-950 outline-none transition-colors hover:bg-green-signal/[0.14] focus-visible:ring-2 focus-visible:ring-green-signal"
          >
            {t.coopFiltre(coop)}
            <X size={13} strokeWidth={2.25} aria-hidden />
          </button>
        )}
      </div>

      <AnalyticsTab
        parcelles={liste}
        selectedId={selectedId}
        hoveredId={hoveredId}
        setSelectedId={setSelectedId}
        setHoveredId={setHoveredId}
        onExport={exportGeoJSON}
      />
    </div>
  );
}

export default function ParcellesExportateurPage() {
  return (
    <React.Suspense fallback={<div className="py-16 text-center text-sm text-stone-400">…</div>}>
      <ParcellesInner />
    </React.Suspense>
  );
}

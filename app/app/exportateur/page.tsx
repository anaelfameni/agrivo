"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Bell, Command, MessageSquareText, Settings2 } from "lucide-react";
import { AnalyticsTab } from "@/components/exportateur/analytics-tab";
import { AssistantTab } from "@/components/exportateur/assistant-tab";
import { ConfigTab } from "@/components/exportateur/config-tab";
import { CommandPalette, type CommandAction } from "@/components/exportateur/command-palette";
import { type ExpTab, type LogEntry } from "@/components/exportateur/types";
import { useLanguage } from "@/components/language-provider";
import {
  PARCELLES,
  cooperatives,
  exporterFeatureCollection,
  type Parcelle,
} from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;

const TABS: { key: ExpTab; Icon: typeof BarChart3 }[] = [
  { key: "analytique", Icon: BarChart3 },
  { key: "assistant", Icon: MessageSquareText },
  { key: "config", Icon: Settings2 },
];

const COPY = {
  fr: {
    tabs: {
      analytique: { label: "Analytique & cartographie", short: "Analytique" },
      assistant: { label: "Assistant IA", short: "Assistant" },
      config: { label: "Configuration & alertes", short: "Config" },
    },
    fullPortfolio: "portefeuille complet",
    eyebrow: "Espace exportateur",
    subtitle: (coops: number, parcelles: number) =>
      `Directeur durabilité · ${coops} coopératives · ${parcelles} parcelles suivies`,
    designed: "Conçu pour les grands opérateurs (jusqu'à plusieurs milliers de parcelles).",
    search: "Rechercher",
    alertsAria: (n: number) => `Centre d'alertes${n ? `, ${n} actives` : ""}`,
    tablist: "Sections du dashboard exportateur",
    timeLocale: "fr-FR",
  },
  en: {
    tabs: {
      analytique: { label: "Analytics & mapping", short: "Analytics" },
      assistant: { label: "AI assistant", short: "Assistant" },
      config: { label: "Settings & alerts", short: "Settings" },
    },
    fullPortfolio: "full portfolio",
    eyebrow: "Exporter workspace",
    subtitle: (coops: number, parcelles: number) =>
      `Sustainability director · ${coops} cooperatives · ${parcelles} plots tracked`,
    designed: "Designed for large operators (up to several thousand plots).",
    search: "Search",
    alertsAria: (n: number) => `Alert centre${n ? `, ${n} active` : ""}`,
    tablist: "Exporter dashboard sections",
    timeLocale: "en-GB",
  },
} as const;

export default function ExportateurPage() {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [tab, setTab] = useState<ExpTab>("analytique");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const nbAlertes = PARCELLES.filter((p) => p.alerteActive).length;
  const nbCoops = cooperatives(PARCELLES).length;

  const pushLog = useCallback((e: { service: string; label: string; ms?: number; status?: "ok" | "warn" }) => {
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
  }, [t.timeLocale]);

  const exportGeoJSON = useCallback(
    (list: Parcelle[], scope: string) => {
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
      pushLog({ service: "Export", label: `GeoJSON · ${list.length} parcelles (${scope})`, ms: 0, status: "ok" });
    },
    [pushLog],
  );

  // Raccourci ⌘K / Ctrl+K depuis n'importe où sur la page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectFromAnywhere = useCallback((id: string) => {
    setTab("analytique");
    setSelectedId(id);
  }, []);

  const handleAction = useCallback(
    (a: CommandAction) => {
      if (a === "export-geojson") exportGeoJSON(PARCELLES, t.fullPortfolio);
      else if (a === "go-assistant") setTab("assistant");
      else if (a === "go-alerts") setTab("config");
    },
    [exportGeoJSON, t.fullPortfolio],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête persona + actions globales */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow text-green-signal">{t.eyebrow}</p>
          <h1 className="mt-1.5 font-display text-3xl leading-tight text-forest-950 sm:text-4xl">Marc</h1>
          <p className="mt-1 text-sm text-stone-500">{t.subtitle(nbCoops, PARCELLES.length)}</p>
          <p className="mt-0.5 text-xs text-stone-400">{t.designed}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3.5 text-sm text-stone-500 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
          >
            <Command size={15} strokeWidth={2} aria-hidden />
            <span className="hidden sm:inline">{t.search}</span>
            <kbd className="num rounded border border-black/10 bg-ivory px-1.5 py-0.5 text-[0.62rem]">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={() => setTab("config")}
            aria-label={t.alertsAria(nbAlertes)}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-black/[0.08] bg-white text-forest-800 outline-none transition-colors hover:border-red-block/40 focus-visible:ring-2 focus-visible:ring-red-block/40"
          >
            <Bell size={17} strokeWidth={2} aria-hidden />
            {nbAlertes > 0 && (
              <span className="num absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-block px-1 text-[0.65rem] font-semibold text-white">
                {nbAlertes}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Onglets (indicateur animé) */}
      <div role="tablist" aria-label={t.tablist} className="flex gap-1 overflow-x-auto border-b border-black/[0.06]">
        {TABS.map((tb) => {
          const isActive = tab === tb.key;
          return (
            <button
              key={tb.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(tb.key)}
              className={`relative flex shrink-0 items-center gap-2 px-3.5 py-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-signal ${
                isActive ? "text-forest-950" : "text-stone-500 hover:text-forest-950"
              }`}
            >
              <tb.Icon size={16} strokeWidth={2} aria-hidden />
              <span className="hidden sm:inline">{t.tabs[tb.key].label}</span>
              <span className="sm:hidden">{t.tabs[tb.key].short}</span>
              {isActive &&
                (reduce ? (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-green-signal" />
                ) : (
                  <motion.span
                    layoutId="exp-tab-underline"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-green-signal"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                ))}
            </button>
          );
        })}
      </div>

      {/* Panneau actif */}
      <div>
        {tab === "analytique" && (
          <AnalyticsTab
            parcelles={PARCELLES}
            selectedId={selectedId}
            hoveredId={hoveredId}
            setSelectedId={setSelectedId}
            setHoveredId={setHoveredId}
            onExport={exportGeoJSON}
          />
        )}
        {tab === "assistant" && <AssistantTab onCiteSelect={selectFromAnywhere} pushLog={pushLog} />}
        {tab === "config" && <ConfigTab parcelles={PARCELLES} log={log} pushLog={pushLog} />}
      </div>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        parcelles={PARCELLES}
        onSelectParcelle={selectFromAnywhere}
        onAction={handleAction}
      />
    </div>
  );
}

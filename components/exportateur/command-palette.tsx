"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CornerDownLeft, Download, MessageSquareText, Bell, MapPin, Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLanguage } from "@/components/language-provider";
import { FILIERE_LABEL, fmtHa, type Parcelle } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  fr: {
    actExport: "Exporter le portefeuille en GeoJSON",
    actAssistant: "Poser une question à l'assistant",
    actAlerts: "Voir le centre d'alertes",
    hintAlerts: "Alertes",
    closeAria: "Fermer la palette de commandes",
    dialogAria: "Palette de commandes",
    inputAria: "Rechercher une parcelle, un producteur ou une commande",
    placeholder: "Rechercher un producteur, une parcelle, une commande…",
    esc: "Échap",
    noResult: (q: string) => `Aucun résultat pour « ${q} ».`,
    results: "Résultats",
    navigate: "naviguer",
    open: "ouvrir",
  },
  en: {
    actExport: "Export the portfolio as GeoJSON",
    actAssistant: "Ask the assistant a question",
    actAlerts: "Open the alert centre",
    hintAlerts: "Alerts",
    closeAria: "Close the command palette",
    dialogAria: "Command palette",
    inputAria: "Search a plot, a farmer or a command",
    placeholder: "Search a farmer, a plot, a command…",
    esc: "Esc",
    noResult: (q: string) => `No result for "${q}".`,
    results: "Results",
    navigate: "navigate",
    open: "open",
  },
} as const;

export type CommandAction = "export-geojson" | "go-assistant" | "go-alerts";

type Item =
  | { kind: "action"; id: string; label: string; hint: string; Icon: typeof Download; run: () => void }
  | { kind: "parcelle"; id: string; parcelle: Parcelle; run: () => void };

/**
 * Palette de commandes ⌘K / Ctrl+K (composant contrôlé). Recherche une parcelle ou un producteur
 * depuis n'importe où, plus quelques actions rapides. Entièrement pilotable au clavier
 * (flèches, Entrée, Échap). Détail « vrai outil pro ». Construite sans dépendance (cohérent projet).
 */
export function CommandPalette({
  open,
  onClose,
  parcelles,
  onSelectParcelle,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  parcelles: Parcelle[];
  onSelectParcelle: (id: string) => void;
  onAction: (a: CommandAction) => void;
}) {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Réinitialise à chaque ouverture + focus l'input.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  const actions: Item[] = useMemo(
    () => [
      {
        kind: "action",
        id: "act-export",
        label: t.actExport,
        hint: "RFC 7946",
        Icon: Download,
        run: () => onAction("export-geojson"),
      },
      {
        kind: "action",
        id: "act-assistant",
        label: t.actAssistant,
        hint: "IA",
        Icon: MessageSquareText,
        run: () => onAction("go-assistant"),
      },
      {
        kind: "action",
        id: "act-alerts",
        label: t.actAlerts,
        hint: t.hintAlerts,
        Icon: Bell,
        run: () => onAction("go-alerts"),
      },
    ],
    [onAction, t],
  );

  const results: Item[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const parcelleItems: Item[] = parcelles
      .filter((p) => {
        if (!q) return true;
        return (
          p.producteurNom.toLowerCase().includes(q) ||
          p.numeroCartePro.toLowerCase().includes(q) ||
          p.cooperative.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q)
        );
      })
      .slice(0, q ? 8 : 5)
      .map((p) => ({ kind: "parcelle" as const, id: p.id, parcelle: p, run: () => onSelectParcelle(p.id) }));

    const actionItems = q
      ? actions.filter((a) => a.kind === "action" && a.label.toLowerCase().includes(q))
      : actions;

    return [...actionItems, ...parcelleItems];
  }, [query, parcelles, actions, onSelectParcelle]);

  // Garde l'index actif dans les bornes quand les résultats changent.
  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(0, results.length - 1)));
  }, [results.length]);

  // Fait défiler l'élément actif dans la vue.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function runItem(item: Item | undefined) {
    if (!item) return;
    item.run();
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runItem(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Fond assombri (scrim) */}
          <button
            type="button"
            aria-label={t.closeAria}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-forest-950/45 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t.dialogAria}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            onKeyDown={onKeyDown}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_30px_80px_-20px_rgba(10,31,20,0.55)]"
          >
            {/* Champ de recherche */}
            <div className="flex items-center gap-3 border-b border-black/[0.06] px-4">
              <Search size={18} strokeWidth={2} aria-hidden className="text-stone-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t.inputAria}
                aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                placeholder={t.placeholder}
                className="h-14 flex-1 bg-transparent text-[0.95rem] text-forest-950 outline-none placeholder:text-stone-400"
              />
              <kbd className="hidden rounded-md border border-black/10 bg-ivory px-1.5 py-0.5 text-[0.65rem] font-medium text-stone-500 sm:block">
                {t.esc}
              </kbd>
            </div>

            {/* Résultats */}
            {results.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-stone-500">
                {t.noResult(query.trim())}
              </div>
            ) : (
              <ul ref={listRef} role="listbox" aria-label={t.results} className="max-h-[52vh] overflow-y-auto p-2">
                {results.map((item, idx) => {
                  const isActive = idx === active;
                  return (
                    <li key={item.id} data-idx={idx} id={`cmd-${item.id}`} role="option" aria-selected={isActive}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => runItem(item)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors ${
                          isActive ? "bg-green-signal/[0.09]" : "hover:bg-black/[0.03]"
                        }`}
                      >
                        {item.kind === "action" ? (
                          <>
                            <span
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                              style={{ background: "rgba(22,163,74,0.1)" }}
                              aria-hidden
                            >
                              <item.Icon size={16} strokeWidth={2} className="text-green-signal" />
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-medium text-forest-950">{item.label}</span>
                            <span className="eyebrow shrink-0 text-[0.58rem] text-stone-400">{item.hint}</span>
                          </>
                        ) : (
                          <>
                            <span
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                              style={{ background: "rgba(10,31,20,0.05)" }}
                              aria-hidden
                            >
                              <MapPin size={16} strokeWidth={2} className="text-forest-800" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-forest-950">
                                {item.parcelle.producteurNom}
                              </span>
                              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                                <span className="num truncate">{item.parcelle.numeroCartePro}</span>
                                <span aria-hidden className="text-stone-300">·</span>
                                <span className="truncate">{FILIERE_LABEL[item.parcelle.filiere]}</span>
                                <span aria-hidden className="text-stone-300">·</span>
                                <span className="num">{fmtHa(item.parcelle.superficieHa)}</span>
                              </span>
                            </span>
                            <StatusBadge statut={item.parcelle.statut} size="sm" className="shrink-0" lang={lang} />
                          </>
                        )}
                        {isActive && (
                          <CornerDownLeft size={15} strokeWidth={2} aria-hidden className="shrink-0 text-stone-400" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pied : rappels clavier */}
            <div className="flex items-center gap-4 border-t border-black/[0.06] px-4 py-2.5 text-[0.7rem] text-stone-400">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-black/10 bg-ivory px-1 py-0.5 num text-[0.62rem]">↑</kbd>
                <kbd className="rounded border border-black/10 bg-ivory px-1 py-0.5 num text-[0.62rem]">↓</kbd>
                {t.navigate}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-black/10 bg-ivory px-1 py-0.5 num text-[0.62rem]">↵</kbd>
                {t.open}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

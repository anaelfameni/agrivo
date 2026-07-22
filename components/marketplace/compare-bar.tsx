"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Scale, ShieldAlert, ShieldCheck, X } from "lucide-react";
import type { MarketLot } from "@/data/mock-marketplace";

/**
 * Comparateur de lots (jusqu'à 3) : barre collante en bas du catalogue + tableau
 * de comparaison côte à côte. Toutes les valeurs affichées sont recalculées des
 * données du lot, y compris le sceau : jamais un verdict inventé.
 */
const TR = {
  fr: {
    compare: "Comparer", clear: "Tout retirer", title: "Comparaison de lots",
    close: "Fermer", open: "Voir le dossier",
    seal: "Sceau AGRIVO", sealed: "Scellé", prep: "En préparation",
    price: "Prix indicatif", tonnage: "Tonnage", value: "Valeur du lot",
    plots: "Parcelles", coops: "Coopératives", regions: "Régions", campagne: "Campagne",
    hint: (n: number) => `${n}/3 lots sélectionnés`,
  },
  en: {
    compare: "Compare", clear: "Clear all", title: "Lot comparison",
    close: "Close", open: "View file",
    seal: "AGRIVO seal", sealed: "Sealed", prep: "In preparation",
    price: "Indicative price", tonnage: "Tonnage", value: "Lot value",
    plots: "Plots", coops: "Cooperatives", regions: "Regions", campagne: "Harvest",
    hint: (n: number) => `${n}/3 lots selected`,
  },
} as const;

const fcfa = (n: number, lang: "fr" | "en") => n.toLocaleString(lang === "en" ? "en" : "fr-FR");

export function CompareBar({
  lots,
  lang,
  onRemove,
  onClear,
}: {
  lots: MarketLot[];
  lang: "fr" | "en";
  onRemove: (ref: string) => void;
  onClear: () => void;
}) {
  const t = TR[lang];
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  if (lots.length === 0) return null;

  const rows: { label: string; render: (lot: MarketLot) => React.ReactNode }[] = [
    {
      label: t.seal,
      render: (lot) =>
        lot.sceau.statut === "verifie" ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-signal"><ShieldCheck size={13} /> {t.sealed}</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-cacao"><ShieldAlert size={13} /> {t.prep}</span>
        ),
    },
    { label: t.price, render: (lot) => <span className="num font-semibold">{fcfa(lot.prixIndicatifFcfaKg, lang)} F/kg</span> },
    { label: t.tonnage, render: (lot) => <span className="num font-semibold">{lot.tonnage.toFixed(1)} t</span> },
    { label: t.value, render: (lot) => <span className="num font-semibold text-amber-cacao">{fcfa(lot.valeurFcfa, lang)} F</span> },
    { label: t.plots, render: (lot) => <span className="num">{lot.nbParcelles}</span> },
    { label: t.coops, render: (lot) => lot.cooperatives.join(", ") },
    { label: t.regions, render: (lot) => lot.regions.join(", ") },
    { label: t.campagne, render: (lot) => <span className="num">{lot.campagne}</span> },
  ];

  return (
    <>
      {/* Barre collante de sélection */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-x-0 bottom-4 z-[600] px-4"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-black/10 bg-white p-3 shadow-[0_18px_50px_-20px_rgba(10,31,20,0.45)]">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-950/55">
            <Scale size={14} className="text-green-signal" /> {t.hint(lots.length)}
          </span>
          <span className="flex flex-1 flex-wrap items-center gap-1.5">
            {lots.map((lot) => (
              <span key={lot.ref} className="inline-flex items-center gap-1 rounded-full bg-ivory px-2.5 py-1 text-xs font-medium text-forest-950/80">
                {lot.nomLot}
                <button onClick={() => onRemove(lot.ref)} aria-label={`${t.clear} ${lot.nomLot}`} className="text-forest-950/40 transition hover:text-red-block">
                  <X size={12} />
                </button>
              </span>
            ))}
          </span>
          <button onClick={onClear} className="text-xs font-medium text-forest-950/45 transition hover:text-forest-950">{t.clear}</button>
          <button
            onClick={() => setOpen(true)}
            disabled={lots.length < 2}
            className="rounded-full bg-forest-950 px-4 py-2 text-xs font-semibold text-white transition enabled:hover:bg-green-signal disabled:opacity-40"
          >
            {t.compare} ({lots.length})
          </button>
        </div>
      </motion.div>

      {/* Tableau de comparaison */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] flex items-end justify-center bg-forest-950/50 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={t.title}
              className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-black/10 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-forest-950">{t.title}</h3>
                <button onClick={() => setOpen(false)} aria-label={t.close} className="rounded-full border border-black/10 p-2 text-forest-950/60 transition hover:bg-black/[0.04]">
                  <X size={15} />
                </button>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.06]">
                      <th className="py-2 pr-3" />
                      {lots.map((lot) => (
                        <th key={lot.ref} className="py-2 pr-3 align-bottom">
                          <p className="font-display text-sm font-semibold leading-snug text-forest-950">{lot.nomLot}</p>
                          <p className="num mt-0.5 text-[0.68rem] font-normal text-forest-950/45">{lot.ref}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label} className="border-b border-black/[0.04] align-top last:border-0">
                        <td className="py-2.5 pr-3 text-[0.68rem] font-semibold uppercase tracking-wide text-forest-950/45">{row.label}</td>
                        {lots.map((lot) => (
                          <td key={lot.ref} className="py-2.5 pr-3 text-forest-950/80">{row.render(lot)}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="pt-3" />
                      {lots.map((lot) => (
                        <td key={lot.ref} className="pt-3 pr-3">
                          <Link href={`/marketplace/lot/${lot.ref}`} className="inline-flex items-center gap-1 text-xs font-semibold text-green-signal underline-offset-2 hover:underline">
                            {t.open} <ArrowUpRight size={13} />
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

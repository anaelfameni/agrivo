"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Handshake, Truck, Warehouse, Scale, AlertTriangle, Check, FileText } from "lucide-react";
import {
  POSSESSION_ORDRE,
  POSSESSION_LABEL,
  type JalonPossession,
  type PossessionCode,
} from "@/data/mock-expeditions";
import type { AnomalieVolume } from "@/lib/sentinelle/volume";

/**
 * Registre de possession du lot — la frise AMONT (achat bord champ → pesée), le maillon que
 * personne ne trace aujourd'hui sur les flux indirects. Chaque nœud s'allume si le maillon est
 * documenté ; un maillon manquant reste en pointillé ambre « À documenter » (jamais masqué :
 * l'honnêteté du dossier est l'argument commercial). Les anomalies de la sentinelle de volume
 * s'affichent sous la frise et expliquent pourquoi le sceau reste « en préparation ».
 * Réutilisé en mode complet (espace « Mes lots ») et compact (fiche publique).
 */

const ICONES: Record<PossessionCode, typeof Truck> = {
  "achat-bord-champ": Handshake,
  "transport-connaissement": Truck,
  "reception-magasin": Warehouse,
  "pesee": Scale,
};

const TR = {
  fr: {
    aDocumenter: "À documenter",
    connaissement: "Connaissement",
    tonnes: "t constatées",
    alertesTitre: "Sentinelle de volume",
    manquant: "Ce maillon manque au dossier : le sceau reste en préparation tant que la chaîne n'est pas continue.",
  },
  en: {
    aDocumenter: "To document",
    connaissement: "Bill of lading",
    tonnes: "t recorded",
    alertesTitre: "Volume sentinel",
    manquant: "This link is missing: the seal stays in preparation until the chain is continuous.",
  },
} as const;

const fmtDate = (iso: string, lang: "fr" | "en") =>
  new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short", year: "numeric" });

export function JournalLot({
  journal,
  alertes = [],
  lang = "fr",
  compact = false,
}: {
  journal: JalonPossession[];
  alertes?: AnomalieVolume[];
  lang?: "fr" | "en";
  compact?: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const t = TR[lang];

  // Un slot par maillon canonique : documenté (jalon trouvé) ou manquant (pointillé ambre).
  const slots = POSSESSION_ORDRE.map((code) => ({
    code,
    jalon: journal.find((j) => j.code === code),
  }));

  return (
    <div>
      <motion.ol
        className="relative space-y-0"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        variants={{ show: { transition: { staggerChildren: 0.09 } } }}
      >
        {slots.map(({ code, jalon }, i) => {
          const Icone = ICONES[code];
          const ok = Boolean(jalon) && (code !== "transport-connaissement" || Boolean(jalon?.connaissement?.trim()));
          const dernier = i === slots.length - 1;
          return (
            <motion.li
              key={code}
              className="relative flex gap-3 pb-4 last:pb-0"
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
              }}
            >
              {/* Rail vertical (segment sous le nœud, sauf le dernier) */}
              {!dernier && (
                <span
                  aria-hidden
                  className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px ${ok ? "bg-green-signal/35" : "bg-amber-cacao/30"}`}
                />
              )}
              {/* Nœud */}
              <span
                className={`relative z-10 mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  ok
                    ? "border-green-signal/40 bg-green-signal/10 text-green-signal"
                    : "border-dashed border-amber-cacao/50 bg-amber-cacao/[0.07] text-amber-cacao"
                }`}
              >
                <Icone size={14} strokeWidth={1.75} />
              </span>
              {/* Contenu */}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-semibold text-forest-950">{POSSESSION_LABEL[code][lang]}</span>
                  {jalon ? (
                    <span className="num text-xs text-forest-950/45">{fmtDate(jalon.date, lang)}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-cacao/30 bg-amber-cacao/10 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-cacao">
                      <AlertTriangle size={10} /> {t.aDocumenter}
                    </span>
                  )}
                </p>
                {jalon && !compact && (
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-forest-950/60">
                    {jalon.acteur && <span>{jalon.acteur}</span>}
                    {jalon.connaissement && (
                      <span className="num inline-flex items-center gap-1 text-forest-950/70">
                        <FileText size={11} /> {jalon.connaissement}
                      </span>
                    )}
                    {jalon.tonnes != null && (
                      <span className="num">{jalon.tonnes.toLocaleString(lang === "en" ? "en" : "fr-FR")} {t.tonnes}</span>
                    )}
                  </p>
                )}
                {jalon?.note && !compact && (
                  <p className="mt-0.5 text-xs italic text-forest-950/50">{lang === "en" ? jalon.note.en : jalon.note.fr}</p>
                )}
                {!jalon && !compact && <p className="mt-0.5 text-xs leading-relaxed text-amber-cacao/90">{t.manquant}</p>}
              </div>
            </motion.li>
          );
        })}
      </motion.ol>

      {/* Anomalies de la sentinelle de volume (bloquantes = rouge, sinon ambre) */}
      {alertes.length > 0 && (
        <div className="mt-3 space-y-1.5 rounded-xl border border-red-block/25 bg-red-block/[0.05] p-3">
          <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wide text-red-block">
            <AlertTriangle size={12} /> {t.alertesTitre}
          </p>
          <ul className="space-y-1">
            {alertes.map((a, i) => (
              <li key={`${a.categorie}-${i}`} className={`text-xs leading-relaxed ${a.bloquant ? "text-red-block" : "text-amber-cacao"}`}>
                {lang === "en" ? a.detail.en : a.detail.fr}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Chaîne complète et saine : une ligne de confirmation discrète */}
      {alertes.length === 0 && slots.every(({ code, jalon }) => jalon && (code !== "transport-connaissement" || jalon.connaissement)) && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-green-signal">
          <Check size={13} />
          {lang === "en"
            ? "Continuous chain of custody, volumes reconciled."
            : "Chaîne de possession continue, volumes réconciliés."}
        </p>
      )}
    </div>
  );
}

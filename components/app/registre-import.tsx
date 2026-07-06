"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Copy,
  FileUp,
  Loader2,
  MapPin,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import {
  auditerRegistre,
  parserRegistre,
  type AuditRegistre,
  type CategorieAnomalie,
} from "@/lib/registre/audit";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  fr: {
    eyebrow: "Registre de la coopérative",
    title: "Importer mon registre",
    desc: "Vos fichiers de certification ou de cartographie existent déjà (.geojson, .json, .kml, .csv). AGRIVO les audite selon la règle RDUE : point sous 4 ha, polygone à partir de 4 ha.",
    cta: "Importer un fichier",
    demo: "Essayer avec le registre de démonstration",
    analyzing: "Audit du registre en cours…",
    parseError: "Fichier illisible : vérifiez qu'il s'agit bien d'un GeoJSON, KML ou CSV de parcelles.",
    resultTitle: "Audit RDUE du registre",
    ready: "prêtes pour la RDUE",
    of: (v: number, t: number) => `${v} parcelle${v > 1 ? "s" : ""} sur ${t}`,
    joined: (v: number) => `${v} parcelle${v > 1 ? "s valides ont rejoint" : " valide a rejoint"} le portefeuille : elles sont vérifiables par satellite comme les autres.`,
    anomaliesTitle: "Anomalies à traiter",
    close: "Fermer l'audit",
    actionTerrain: "À compléter sur le terrain",
    actionBureau: "À corriger au bureau",
    goMapping: "Ouvrir l'étape Cartographie",
    privacy: "Vos données restent la propriété de la coopérative (conformité ARTCI).",
    cat: {
      "geometrie-invalide": "Géométrie invalide",
      "polygone-manquant": "Polygone manquant (≥ 4 ha)",
      doublon: "Doublon de matricule",
      chevauchement: "Chevauchement",
      "hors-zone": "Hors zone",
    } as Record<CategorieAnomalie, string>,
  },
  en: {
    eyebrow: "Cooperative register",
    title: "Import my register",
    desc: "Your certification or mapping files already exist (.geojson, .json, .kml, .csv). AGRIVO audits them against the EUDR rule: point under 4 ha, polygon from 4 ha.",
    cta: "Import a file",
    demo: "Try with the demo register",
    analyzing: "Auditing the register…",
    parseError: "Unreadable file: check that it is a GeoJSON, KML or CSV of plots.",
    resultTitle: "EUDR audit of the register",
    ready: "ready for the EUDR",
    of: (v: number, t: number) => `${v} plot${v > 1 ? "s" : ""} out of ${t}`,
    joined: (v: number) => `${v} valid plot${v > 1 ? "s have" : " has"} joined the portfolio: they can be verified by satellite like the others.`,
    anomaliesTitle: "Anomalies to address",
    close: "Close the audit",
    actionTerrain: "To complete in the field",
    actionBureau: "To fix at the office",
    goMapping: "Open the Mapping step",
    privacy: "Your data remains the property of the cooperative (ARTCI compliance).",
    cat: {
      "geometrie-invalide": "Invalid geometry",
      "polygone-manquant": "Missing polygon (≥ 4 ha)",
      doublon: "Duplicate matricule",
      chevauchement: "Overlap",
      "hors-zone": "Out of zone",
    } as Record<CategorieAnomalie, string>,
  },
} as const;

const CAT_ICONS: Record<CategorieAnomalie, typeof AlertTriangle> = {
  "geometrie-invalide": AlertTriangle,
  "polygone-manquant": MapPin,
  doublon: Copy,
  chevauchement: Copy,
  "hors-zone": X,
};

/**
 * Import & audit RDUE du registre de la coopérative (canal A du plan de réorientation) :
 * la coop charge les fichiers qu'elle détient déjà, AGRIVO les audite (parsing 100 % client,
 * rien ne quitte le navigateur) et oriente chaque anomalie vers le terrain ou le bureau.
 */
export function RegistreImport() {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [audit, setAudit] = useState<AuditRegistre | null>(null);

  async function analyser(nom: string, texte: string) {
    setStatus("loading");
    // Petite latence perçue : l'audit est instantané mais un état de chargement rassure.
    await new Promise((r) => setTimeout(r, reduce ? 150 : 900));
    try {
      const parcelles = parserRegistre(nom, texte);
      if (parcelles.length === 0) throw new Error("vide");
      setAudit(auditerRegistre(parcelles));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  async function onFile(file: File) {
    analyser(file.name, await file.text());
  }

  async function onDemo() {
    setStatus("loading");
    try {
      const res = await fetch("/registre-demo.geojson");
      analyser("registre-demo.geojson", await res.text());
    } catch {
      setStatus("error");
    }
  }

  const parCategorie = audit
    ? audit.anomalies.reduce<Partial<Record<CategorieAnomalie, typeof audit.anomalies>>>((acc, a) => {
        (acc[a.categorie] ??= []).push(a);
        return acc;
      }, {})
    : {};

  return (
    <div className="card-premium p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
          <span className="chip-green grid h-8 w-8 place-items-center rounded-xl" aria-hidden>
            <FileUp size={16} strokeWidth={2} className="text-green-signal" />
          </span>
          {t.title}
        </h2>
        {status === "done" && audit && (
          <button
            type="button"
            onClick={() => {
              setAudit(null);
              setStatus("idle");
            }}
            className="text-xs text-stone-400 outline-none transition-colors hover:text-forest-950 focus-visible:text-forest-950"
          >
            {t.close}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {status !== "done" && (
          <motion.div
            key="import"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="mt-2 text-xs leading-relaxed text-stone-500">{t.desc}</p>
            {status === "error" && (
              <p className="mt-2 rounded-lg bg-red-block/[0.07] px-3 py-2 text-xs text-red-block" role="alert">
                {t.parseError}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={status === "loading"}
                onClick={() => inputRef.current?.click()}
                className="btn-green inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={15} strokeWidth={2} className="animate-spin" aria-hidden />
                    {t.analyzing}
                  </>
                ) : (
                  <>
                    <Upload size={15} strokeWidth={2} aria-hidden />
                    {t.cta}
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={status === "loading"}
                onClick={onDemo}
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-stone-500 outline-none transition-colors hover:text-forest-950 focus-visible:text-forest-950 disabled:opacity-60"
              >
                {t.demo}
                <ChevronRight size={13} strokeWidth={2} aria-hidden />
              </button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".geojson,.json,.kml,.csv"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
            <p className="mt-3 flex items-center gap-1.5 text-[0.7rem] text-stone-400">
              <ShieldCheck size={12} strokeWidth={2} aria-hidden className="shrink-0 text-green-signal/70" />
              {t.privacy}
            </p>
          </motion.div>
        )}

        {status === "done" && audit && (
          <motion.div
            key="result"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <p className="eyebrow mt-3 text-green-signal">{t.resultTitle}</p>

            {/* % prêt RDUE */}
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <span className="num text-4xl font-semibold tracking-tight text-forest-950">{audit.pretPct} %</span>
                <span className="ml-2 text-sm text-stone-500">{t.ready}</span>
              </div>
              <span className="num text-xs text-stone-400">{t.of(audit.valides.length, audit.total)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[0.06]" role="meter" aria-valuenow={audit.pretPct} aria-valuemin={0} aria-valuemax={100} aria-label={t.ready}>
              <div
                className="bar-fill h-full rounded-full bg-gradient-to-r from-green-signal to-[#22c55e]"
                style={{ width: `${audit.pretPct}%` }}
              />
            </div>
            <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-stone-500">
              <CheckCircle2 size={13} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0 text-green-signal" />
              {t.joined(audit.valides.length)}
            </p>

            {/* Anomalies par catégorie */}
            {audit.anomalies.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  {t.anomaliesTitle}
                </h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {(Object.keys(parCategorie) as CategorieAnomalie[]).map((cat) => {
                    const items = parCategorie[cat]!;
                    const Icon = CAT_ICONS[cat];
                    const terrain = items[0].action === "terrain";
                    return (
                      <li key={cat} className="rounded-xl border border-black/[0.06] bg-ivory-deep/30 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-2 text-sm font-medium text-forest-950">
                            <Icon size={14} strokeWidth={2} aria-hidden className="text-amber-cacao" />
                            {t.cat[cat]}
                            <span className="num rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[0.65rem] text-stone-500">
                              {items.length}
                            </span>
                          </span>
                          {terrain ? (
                            <Link
                              href="/app/consentement"
                              className="inline-flex items-center gap-1 rounded-full bg-green-signal/10 px-2.5 py-1 text-[0.7rem] font-semibold text-green-signal outline-none transition-colors hover:bg-green-signal/15 focus-visible:ring-2 focus-visible:ring-green-signal"
                            >
                              {t.actionTerrain}
                              <ArrowRight size={11} strokeWidth={2.5} aria-hidden />
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-cacao/10 px-2.5 py-1 text-[0.7rem] font-semibold text-amber-cacao">
                              <Building2 size={11} strokeWidth={2.5} aria-hidden />
                              {t.actionBureau}
                            </span>
                          )}
                        </div>
                        <ul className="mt-2 flex flex-col gap-1">
                          {items.slice(0, 3).map((a, i) => (
                            <li key={a.matricule + i} className="text-xs leading-relaxed text-stone-500">
                              <span className="num font-medium text-forest-950">{a.matricule}</span>
                              {a.nom ? ` · ${a.nom}` : ""} — {a.detail[lang]}
                            </li>
                          ))}
                          {items.length > 3 && (
                            <li className="num text-[0.7rem] text-stone-400">+ {items.length - 3}…</li>
                          )}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <p className="mt-3 flex items-center gap-1.5 border-t border-black/[0.05] pt-3 text-[0.7rem] text-stone-400">
              <ShieldCheck size={12} strokeWidth={2} aria-hidden className="shrink-0 text-green-signal/70" />
              {t.privacy}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

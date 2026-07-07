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
  Sparkles,
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
import { resumerAudit, type PlanAction } from "@/lib/registre/plan";
import { chargerLive, heureCache, sauverLive } from "@/lib/ai/live-cache";

/** Plan affiché : celui de l'API, ou la dernière rédaction live re-servie (cachedAt renseigné). */
type PlanAffiche = PlanAction & { cachedAt?: number };

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
    compactHint: "Auditez vos fichiers existants selon la règle RDUE.",
    open: "Auditer mon registre",
    collapse: "Réduire",
    planCta: "Générer le plan d'action IA",
    planLoading: "Rédaction du plan d'action…",
    planTitle: "Plan d'action de mise en conformité",
    planLive: "Rédigé par Gemini · IA en direct",
    planCache: (h: string) => `Rédigé par Gemini à ${h}`,
    planDemo: "Mode démonstration",
    planError: "Le plan n'a pas pu être généré. Réessayez.",
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
    compactHint: "Audit your existing files against the EUDR rule.",
    open: "Audit my register",
    collapse: "Collapse",
    planCta: "Generate the AI action plan",
    planLoading: "Writing the action plan…",
    planTitle: "Compliance action plan",
    planLive: "Written by Gemini · live AI",
    planCache: (h: string) => `Written by Gemini at ${h}`,
    planDemo: "Demo mode",
    planError: "The plan could not be generated. Try again.",
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
  const [plan, setPlan] = useState<PlanAffiche | null>(null);
  const [planStatus, setPlanStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  // U-11 : démarre replié (une ligne) pour alléger la colonne ; s'étend au clic et le reste
  // dès qu'un import est en cours ou fait.
  const [ouvert, setOuvert] = useState(false);
  const deplie = ouvert || status !== "idle";

  async function genererPlan() {
    if (!audit) return;
    setPlanStatus("loading");
    const payload = { resume: resumerAudit(audit), lang };
    // Filet anti-quota (429 free tier sur IP partagées) : si le live échoue, on re-sert la
    // DERNIÈRE rédaction produite par Gemini pour ce même audit, étiquetée avec son heure.
    const repli = () => {
      const cache = chargerLive<PlanAction>("audit-plan", payload);
      if (cache) {
        setPlan({ ...cache.data, cachedAt: cache.at });
        setPlanStatus("done");
        return true;
      }
      return false;
    };
    try {
      const r = await fetch("/api/gemini/audit-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as PlanAction;
      if (data.live) sauverLive("audit-plan", payload, data);
      else if (repli()) return;
      setPlan(data);
      setPlanStatus("done");
    } catch {
      if (!repli()) setPlanStatus("error");
    }
  }

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

  // État replié (U-11) : une seule ligne — icône + titre + CTA — qui s'étend au clic.
  if (!deplie) {
    return (
      <div className="card-premium p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setOuvert(true)}
          aria-expanded={false}
          className="flex w-full items-center justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="chip-green grid h-8 w-8 shrink-0 place-items-center rounded-xl" aria-hidden>
              <FileUp size={16} strokeWidth={2} className="text-green-signal" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-forest-950">{t.title}</span>
              <span className="hidden truncate text-xs text-stone-400 sm:block">{t.compactHint}</span>
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-green-signal/30 bg-green-signal/[0.06] px-3.5 py-1.5 text-xs font-semibold text-green-signal transition-colors hover:bg-green-signal/[0.12]">
            {t.open}
            <ChevronRight size={13} strokeWidth={2.5} aria-hidden />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="card-premium p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
          <span className="chip-green grid h-8 w-8 place-items-center rounded-xl" aria-hidden>
            <FileUp size={16} strokeWidth={2} className="text-green-signal" />
          </span>
          {t.title}
        </h2>
        {status === "done" && audit ? (
          <button
            type="button"
            onClick={() => {
              setAudit(null);
              setStatus("idle");
              setPlan(null);
              setPlanStatus("idle");
              setOuvert(true);
            }}
            className="text-xs text-stone-400 outline-none transition-colors hover:text-forest-950 focus-visible:text-forest-950"
          >
            {t.close}
          </button>
        ) : (
          status === "idle" && (
            <button
              type="button"
              onClick={() => setOuvert(false)}
              aria-expanded
              className="text-xs text-stone-400 outline-none transition-colors hover:text-forest-950 focus-visible:text-forest-950"
            >
              {t.collapse}
            </button>
          )
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
                              {a.nom ? ` · ${a.nom}` : ""} · {a.detail[lang]}
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

            {/* Plan d'action IA : Gemini transforme l'audit en plan de travail priorisé. */}
            <div className="mt-4">
              {planStatus !== "done" && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={planStatus === "loading"}
                    onClick={genererPlan}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-green-signal/30 bg-green-signal/[0.06] px-4 py-2 text-xs font-semibold text-green-signal outline-none transition-colors hover:bg-green-signal/[0.12] focus-visible:ring-2 focus-visible:ring-green-signal disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {planStatus === "loading" ? (
                      <Loader2 size={13} strokeWidth={2} className="animate-spin" aria-hidden />
                    ) : (
                      <Sparkles size={13} strokeWidth={2} aria-hidden />
                    )}
                    {planStatus === "loading" ? t.planLoading : t.planCta}
                  </button>
                  {planStatus === "error" && (
                    <p className="text-xs text-red-block" role="alert">{t.planError}</p>
                  )}
                </div>
              )}
              {planStatus === "done" && plan && (
                <motion.div
                  initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="rounded-xl border border-green-signal/20 bg-green-signal/[0.04] p-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forest-950">
                      <Sparkles size={13} strokeWidth={2} aria-hidden className="text-green-signal" />
                      {t.planTitle}
                    </h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-stone-500 ring-1 ring-black/[0.06]">
                      {plan.live ? t.planLive : plan.cachedAt ? t.planCache(heureCache(plan.cachedAt, lang)) : t.planDemo}
                    </span>
                  </div>
                  <ol className="mt-2.5 flex flex-col gap-2">
                    {plan.etapes.map((e, i) => (
                      <motion.li
                        key={e.titre}
                        initial={reduce ? { opacity: 1 } : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: EASE, delay: reduce ? 0 : i * 0.07 }}
                        className="flex items-start gap-2.5"
                      >
                        <span className="num mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-signal/12 text-[0.65rem] font-bold text-green-signal" aria-hidden>
                          {i + 1}
                        </span>
                        <span className="text-xs leading-relaxed text-stone-600">
                          <span className="font-semibold text-forest-950">{e.titre}</span>
                          {" · "}
                          {e.detail}
                        </span>
                      </motion.li>
                    ))}
                  </ol>
                  <p className="mt-2.5 border-t border-green-signal/15 pt-2.5 text-xs leading-relaxed text-stone-600">
                    {plan.conclusion}
                  </p>
                </motion.div>
              )}
            </div>

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

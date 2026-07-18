"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, MapPinned, Plus, RotateCcw, ShieldCheck, Trash2, Wand2 } from "lucide-react";
import { PinMark } from "@/components/ui/pin-mark";
import { useLanguage } from "@/components/language-provider";
import type { MappingMode } from "@/components/verifier/mapping-map";
import {
  FILIERE_LABEL,
  PARCELLES,
  RENDEMENT_T_HA,
  SCENARIOS_DEMO,
  type Parcelle,
  type Statut,
} from "@/data/mock-parcelles";
import { aireHa } from "@/lib/geo/terrain";
import { evaluerParcelle, type EvaluationParcelle } from "@/lib/geo/evaluation";

const EASE = [0.16, 1, 0.3, 1] as const;
const CHECK_TICK_MS = 420; // révélation d'un contrôle d'intégrité
const MIN_SOMMETS = 4;

const HEX: Record<Statut, string> = { conforme: "#16a34a", anomalie: "#b4231e", insuffisant: "#c8861d" };

/** Verdict transmis au parent quand la saisie est manuelle (croisement géométrique réel). */
export type ForcedVerdict = { statut: Statut; phrase: string; phraseEn: string };

type Row = { lat: string; lon: string };

const COPY = {
  fr: {
    eyebrow: "Cartographie · Coordonnées",
    title: "Capture de la parcelle",
    intro:
      "La coopérative renseigne les coordonnées GPS qu'elle détient déjà pour cette parcelle, sommet par sommet, au minimum 4 points qui forment le contour. Agrivo ne collecte pas la donnée sur le terrain.",
    scenariosTitle: "Exemples analysés (démo)",
    scenariosHint: "Chargez une parcelle de démonstration, puis lancez l'analyse pour voir le verdict.",
    scLabel: { conforme: "① Parcelle conforme", insuffisant: "② Données insuffisantes", anomalie: "③ Parcelle non conforme" } as Record<Statut, string>,
    scDesc: {
      conforme: "Zone stable, aucune déforestation après 2020.",
      insuffisant: "Couverture nuageuse : impossible de statuer.",
      anomalie: "Recouvre une aire protégée.",
    } as Record<Statut, string>,
    thSommet: "Sommet",
    thLat: "Latitude (Y)",
    thLon: "Longitude (X)",
    point: (i: number) => `Point ${String.fromCharCode(65 + i)}`,
    addVertex: "Ajouter un sommet",
    removeVertex: "Retirer ce sommet",
    manualHint: "Minimum 4 sommets pour former une parcelle. Ajoutez-en autant que nécessaire.",
    manualSubmit: "Valider les coordonnées",
    manualErrParse: "Format invalide : chaque sommet doit avoir une latitude et une longitude numériques (ex. 5.362140).",
    manualErrZone: "Ces coordonnées sortent de l'emprise de la Côte d'Ivoire (lat 4–11, lon −9–−2). Vérifiez l'ordre latitude, longitude.",
    manualErrCount: "Saisissez au moins 4 sommets pour former une parcelle.",
    captured: (n: number) => `Coordonnées validées : polygone de ${n} sommets (WGS-84, GeoJSON RFC 7946).`,
    superficie: "Superficie calculée",
    checksTitle: "Contrôles d'intégrité",
    next: "Valider la cartographie",
    redo: "Modifier les coordonnées",
    back: "Retour",
  },
  en: {
    eyebrow: "Mapping · Coordinates",
    title: "Plot capture",
    intro:
      "The cooperative enters the GPS coordinates it already holds for this plot, vertex by vertex, at least 4 points forming the outline. Agrivo does not collect field data itself.",
    scenariosTitle: "Analysed examples (demo)",
    scenariosHint: "Load a demonstration plot, then run the analysis to see the verdict.",
    scLabel: { conforme: "① Compliant plot", insuffisant: "② Insufficient data", anomalie: "③ Non-compliant plot" } as Record<Statut, string>,
    scDesc: {
      conforme: "Stable area, no deforestation after 2020.",
      insuffisant: "Cloud cover: unable to decide.",
      anomalie: "Overlaps a protected area.",
    } as Record<Statut, string>,
    thSommet: "Vertex",
    thLat: "Latitude (Y)",
    thLon: "Longitude (X)",
    point: (i: number) => `Point ${String.fromCharCode(65 + i)}`,
    addVertex: "Add a vertex",
    removeVertex: "Remove this vertex",
    manualHint: "At least 4 vertices to form a plot. Add as many as needed.",
    manualSubmit: "Validate the coordinates",
    manualErrParse: "Invalid format: each vertex needs a numeric latitude and longitude (e.g. 5.362140).",
    manualErrZone: "These coordinates fall outside Côte d'Ivoire (lat 4–11, lon −9–−2). Check the latitude, longitude order.",
    manualErrCount: "Enter at least 4 vertices to form a plot.",
    captured: (n: number) => `Coordinates validated: ${n}-vertex polygon (WGS-84, GeoJSON RFC 7946).`,
    superficie: "Computed area",
    checksTitle: "Integrity checks",
    next: "Validate the mapping",
    redo: "Edit the coordinates",
    back: "Back",
  },
} as const;

const MappingMap = dynamic(() => import("@/components/verifier/mapping-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-forest-950">
      <PinMark size={40} color="#eafff2" leafColor="rgba(224,166,75,0.9)" pulse />
    </div>
  ),
});

type Phase = "choose" | "captured";

/** Sommets [lon, lat] du polygone d'une parcelle, sans le point de fermeture dupliqué. */
function ringOf(parcelle: Parcelle): number[][] {
  const ring = parcelle.geojson.type === "Polygon" ? parcelle.geojson.coordinates[0] : [parcelle.geojson.coordinates];
  return ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
    ? ring.slice(0, -1)
    : ring;
}
function rowsOf(parcelle: Parcelle): Row[] {
  const rows = ringOf(parcelle).map(([lon, lat]) => ({ lat: lat.toFixed(6), lon: lon.toFixed(6) }));
  while (rows.length < MIN_SOMMETS) rows.push({ lat: "", lon: "" });
  return rows;
}
const num = (s: string) => parseFloat(s.replace(",", ".").replace(/°/g, "").trim());

/**
 * Étape 3 — cartographie de la parcelle. Saisie sommet par sommet (Sommet / Latitude (Y) /
 * Longitude (X)), minimum 4 points. La superficie est CALCULÉE depuis les sommets. Pour une
 * saisie manuelle, le verdict est déterminé par croisement géométrique avec les aires protégées
 * (recouvre → Anomalie ; hors zone → Conforme ; polygone dégénéré → Données insuffisantes).
 * Les 3 exemples analysés chargent une parcelle de démonstration et son verdict pré-défini.
 */
export function StepMapping({
  parcelle,
  onScenario,
  onNext,
  onBack,
}: {
  parcelle: Parcelle;
  onScenario?: (p: Parcelle) => void;
  onNext: (forced?: ForcedVerdict) => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];

  const [rows, setRows] = useState<Row[]>(() => rowsOf(parcelle));
  const [phase, setPhase] = useState<Phase>("choose");
  const [manualErr, setManualErr] = useState<string | null>(null);
  const [validCount, setValidCount] = useState(MIN_SOMMETS);
  const [capturedAire, setCapturedAire] = useState(0);
  const [evaluation, setEvaluation] = useState<EvaluationParcelle | null>(null);
  const [edited, setEdited] = useState(false);
  const [checksShown, setChecksShown] = useState(0);

  // Re-synchronise le tableau quand la parcelle change (choix d'un scénario de démo).
  useEffect(() => {
    setRows(rowsOf(parcelle));
    setPhase("choose");
    setManualErr(null);
    setEvaluation(null);
    setEdited(false);
    setChecksShown(0);
  }, [parcelle]);

  const aireStr = capturedAire.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 1 });
  const plafondT = Math.round(capturedAire * RENDEMENT_T_HA[parcelle.filiere] * 10) / 10;
  const checks =
    lang === "fr"
      ? [
          `Aucun chevauchement avec les ${PARCELLES.length} parcelles déjà enrôlées`,
          `Superficie plausible : plafond d'achat ${plafondT.toLocaleString("fr-FR")} t/an (${FILIERE_LABEL[parcelle.filiere].toLowerCase()}, rendement régional)`,
          "Coordonnées dans l'emprise de la Côte d'Ivoire",
          `Matricule ${parcelle.numeroCartePro} : unique, aucun doublon`,
        ]
      : [
          `No overlap with the ${PARCELLES.length} plots already enrolled`,
          `Plausible area: purchase cap ${plafondT.toLocaleString("en-GB")} t/year (${FILIERE_LABEL[parcelle.filiere].toLowerCase()}, regional yield)`,
          "Coordinates within Côte d'Ivoire",
          `Card number ${parcelle.numeroCartePro}: unique, no duplicate`,
        ];
  const allChecked = checksShown >= checks.length;

  // Aperçu carte : sommets valides saisis, sinon le contour de la parcelle courante.
  const previewCoords = useMemo(() => {
    const cs: number[][] = [];
    for (const r of rows) {
      const lat = num(r.lat);
      const lon = num(r.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) cs.push([lon, lat]);
    }
    return rows.length > 0 && cs.length === rows.length ? cs : ringOf(parcelle);
  }, [rows, parcelle]);
  const mapMode: MappingMode = previewCoords.length > 1 ? "polygon" : "point";

  function setCell(i: number, key: keyof Row, value: string) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
    setManualErr(null);
    setEdited(true);
  }
  function addRow() {
    setRows((rs) => [...rs, { lat: "", lon: "" }]);
    setManualErr(null);
    setEdited(true);
  }
  function removeRow(i: number) {
    setRows((rs) => (rs.length > MIN_SOMMETS ? rs.filter((_, idx) => idx !== i) : rs));
    setManualErr(null);
    setEdited(true);
  }

  function valider() {
    const coords: number[][] = [];
    for (const r of rows) {
      const lat = num(r.lat);
      const lon = num(r.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) { setManualErr(t.manualErrParse); return; }
      coords.push([lon, lat]);
    }
    if (coords.length < MIN_SOMMETS) { setManualErr(t.manualErrCount); return; }
    if (coords.some(([lon, lat]) => lon < -9 || lon > -2 || lat < 4 || lat > 11)) { setManualErr(t.manualErrZone); return; }
    setManualErr(null);
    setValidCount(coords.length);
    setCapturedAire(aireHa(coords));
    // Scénario de démo non modifié → verdict pré-défini (evaluation = null) ; sinon croisement géométrique réel.
    const scenarioIntact = parcelle.id.startsWith("sc-") && !edited;
    setEvaluation(scenarioIntact ? null : evaluerParcelle(coords));
    setChecksShown(0);
    setPhase("captured");
  }

  function recommencer() {
    setManualErr(null);
    setChecksShown(0);
    setPhase("choose");
  }

  function continuer() {
    onNext(evaluation ? { statut: evaluation.statut, phrase: evaluation.phrase, phraseEn: evaluation.phraseEn } : undefined);
  }

  // Révélation séquentielle des contrôles d'intégrité une fois les coordonnées validées.
  useEffect(() => {
    if (phase !== "captured" || checksShown >= checks.length) return;
    const id = setTimeout(() => setChecksShown((n) => n + 1), reduce ? 0 : CHECK_TICK_MS);
    return () => clearTimeout(id);
  }, [phase, checksShown, checks.length, reduce]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      {/* Aperçu satellite de la parcelle */}
      <div className="relative h-[52vh] min-h-[380px] overflow-hidden rounded-2xl border border-black/[0.08] lg:h-[68vh]">
        <MappingMap waypoints={previewCoords} count={previewCoords.length} mode={mapMode} closed active={false} />
      </div>

      {/* Panneau de saisie */}
      <div className="flex flex-col rounded-2xl border border-black/[0.05] bg-white p-5 shadow-[0_1px_2px_rgba(10,31,20,0.04)]">
        <div className="flex items-center gap-2">
          <MapPinned size={16} strokeWidth={2} className="text-green-signal" aria-hidden />
          <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        </div>
        <h2 className="mt-2 font-display text-2xl leading-tight text-forest-950">{t.title}</h2>
        <p className="num text-sm text-stone-500">
          {parcelle.producteurNom} · {parcelle.numeroCartePro}
        </p>

        <div className="mt-4 flex-1">
          {phase === "choose" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed text-stone-500">{t.intro}</p>

              {/* 3 exemples analysés (démo), chargent une parcelle et son verdict */}
              {onScenario && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <Wand2 size={13} strokeWidth={2} className="text-amber-cacao" aria-hidden />
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{t.scenariosTitle}</p>
                  </div>
                  <p className="text-[0.7rem] leading-relaxed text-stone-400">{t.scenariosHint}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {SCENARIOS_DEMO.map((sc) => {
                      const active = sc.id === parcelle.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => onScenario(sc)}
                          aria-pressed={active}
                          className={`flex flex-col gap-1 rounded-xl border p-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-signal ${
                            active ? "border-green-signal/50 bg-green-signal/[0.06]" : "border-black/[0.08] bg-white hover:border-green-signal/30"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-forest-950">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: HEX[sc.statut] }} aria-hidden />
                            {t.scLabel[sc.statut]}
                          </span>
                          <span className="text-[0.68rem] leading-snug text-stone-500">{t.scDesc[sc.statut]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tableau des sommets (format officiel : Sommet / Latitude (Y) / Longitude (X)) */}
              <div className="overflow-x-auto rounded-xl border border-black/[0.08]">
                <table className="w-full min-w-[300px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-ivory-deep/60 text-left">
                      <th className="px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-wider text-stone-500">{t.thSommet}</th>
                      <th className="px-2 py-2 text-[0.68rem] font-semibold uppercase tracking-wider text-stone-500">{t.thLat}</th>
                      <th className="px-2 py-2 text-[0.68rem] font-semibold uppercase tracking-wider text-stone-500">{t.thLon}</th>
                      <th className="w-9" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-t border-black/[0.05]">
                        <td className="whitespace-nowrap px-3 py-1.5 text-xs font-medium text-forest-950">{t.point(i)}</td>
                        <td className="px-2 py-1.5">
                          <input
                            value={r.lat}
                            onChange={(e) => setCell(i, "lat", e.target.value)}
                            inputMode="decimal"
                            spellCheck={false}
                            aria-label={`${t.point(i)}, ${t.thLat}`}
                            placeholder="5.362140"
                            className="num w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-green-signal focus:ring-2 focus:ring-green-signal/15"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            value={r.lon}
                            onChange={(e) => setCell(i, "lon", e.target.value)}
                            inputMode="decimal"
                            spellCheck={false}
                            aria-label={`${t.point(i)}, ${t.thLon}`}
                            placeholder="-3.985620"
                            className="num w-full rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-green-signal focus:ring-2 focus:ring-green-signal/15"
                          />
                        </td>
                        <td className="px-1 py-1.5 text-center">
                          {rows.length > MIN_SOMMETS && (
                            <button
                              type="button"
                              onClick={() => removeRow(i)}
                              aria-label={t.removeVertex}
                              className="grid h-7 w-7 place-items-center rounded-lg text-stone-400 outline-none transition-colors hover:bg-red-block/[0.08] hover:text-red-block focus-visible:ring-2 focus-visible:ring-red-block/40"
                            >
                              <Trash2 size={14} strokeWidth={2} aria-hidden />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
                >
                  <Plus size={13} strokeWidth={2} aria-hidden />
                  {t.addVertex}
                </button>
                <p className="text-[0.68rem] leading-snug text-stone-400">{t.manualHint}</p>
              </div>

              {manualErr && (
                <p role="alert" className="rounded-lg bg-red-block/[0.07] px-3 py-2 text-xs text-red-block">{manualErr}</p>
              )}
            </div>
          )}

          {phase === "captured" && (
            <motion.div
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-start gap-2.5 rounded-xl bg-green-signal/[0.08] px-4 py-3">
                <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-green-signal" aria-hidden />
                <p className="text-sm leading-relaxed text-forest-950">
                  {t.captured(validCount)}{" "}
                  <span className="font-semibold">
                    {t.superficie} : <span className="num">{aireStr} ha</span>
                  </span>
                </p>
              </div>

              {/* Croisement géométrique (saisie manuelle) : aire protégée recoupée ou non */}
              {evaluation && (
                <div
                  className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                  style={{ background: `${HEX[evaluation.statut]}12`, border: `1px solid ${HEX[evaluation.statut]}33` }}
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: HEX[evaluation.statut] }} aria-hidden />
                  <p className="text-sm leading-relaxed text-forest-950">{lang === "fr" ? evaluation.motif : evaluation.motifEn}</p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} strokeWidth={2} className="text-green-signal" aria-hidden />
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{t.checksTitle}</p>
                </div>
                <ul className="mt-2 flex flex-col gap-1.5" aria-live="polite">
                  <AnimatePresence>
                    {checks.slice(0, checksShown).map((c) => (
                      <motion.li
                        key={c}
                        initial={reduce ? { opacity: 1 } : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="flex items-start gap-2 text-xs leading-relaxed text-stone-600"
                      >
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-green-signal/15" aria-hidden>
                          <Check size={11} strokeWidth={3} className="text-green-signal" />
                        </span>
                        {c}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 border-t border-black/[0.05] pt-5">
          {phase === "choose" && (
            <button
              type="button"
              onClick={valider}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <Check size={16} strokeWidth={2.5} aria-hidden />
              {t.manualSubmit}
            </button>
          )}

          {phase === "captured" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={!allChecked}
                onClick={continuer}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform,opacity] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.next}
                <ArrowRight size={16} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={recommencer}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-3.5 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
              >
                <RotateCcw size={15} strokeWidth={2} aria-hidden />
                {t.redo}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onBack}
            className="rounded-full px-3 py-1 text-center text-sm text-stone-400 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );
}

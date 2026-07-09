"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ClipboardPaste, MapPinned, RotateCcw, ShieldCheck, Wand2 } from "lucide-react";
import { PinMark } from "@/components/ui/pin-mark";
import { useLanguage } from "@/components/language-provider";
import type { MappingMode } from "@/components/verifier/mapping-map";
import { FILIERE_LABEL, PARCELLES, RENDEMENT_T_HA, type Parcelle } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;
const CHECK_TICK_MS = 420; // révélation d'un contrôle d'intégrité

const COPY = {
  fr: {
    eyebrow: "Cartographie · Coordonnées",
    title: "Capture de la parcelle",
    intro:
      "La coopérative renseigne les coordonnées GPS qu'elle détient déjà pour cette parcelle (registre, certification, cartographie exportateur). Agrivo ne collecte pas la donnée sur le terrain : elle reste la propriété de la coopérative.",
    demoNote: "Démonstration : coordonnées d'exemple pré-remplies (zone de Soubré). Modifiez-les si besoin.",
    manualLabel: "Coordonnées WGS-84 (une paire « latitude, longitude » par ligne)",
    manualHint: "1 ligne = un point unique (parcelle de moins de 4 ha) · 3 lignes ou plus = sommets du polygone (fermé automatiquement).",
    manualSubmit: "Valider les coordonnées",
    demoFill: "Remplir un exemple (démo)",
    manualErrParse: "Format invalide : une paire « latitude, longitude » par ligne (ex. 5.8321, -6.6478).",
    manualErrZone: "Ces coordonnées sortent de l'emprise de la Côte d'Ivoire (lat 4–11, lon −9–−2). Vérifiez l'ordre latitude, longitude.",
    manualErrCount: "Saisissez 1 ligne (un point) ou au moins 3 lignes (polygone).",
    manualCaptured: (n: number) => n > 1 ? `Coordonnées fournies par la coopérative : polygone de ${n} sommets (WGS-84, GeoJSON RFC 7946).` : "Coordonnées fournies par la coopérative : point unique (WGS-84, GeoJSON RFC 7946).",
    superficie: "Superficie",
    checksTitle: "Contrôles d'intégrité",
    next: "Valider la cartographie",
    redo: "Effacer",
    back: "Retour",
  },
  en: {
    eyebrow: "Mapping · Coordinates",
    title: "Plot capture",
    intro:
      "The cooperative enters the GPS coordinates it already holds for this plot (register, certification, exporter mapping). Agrivo does not collect field data: it remains the cooperative's property.",
    demoNote: "Demo: sample coordinates pre-filled (Soubré area). Edit them if needed.",
    manualLabel: "WGS-84 coordinates (one « latitude, longitude » pair per line)",
    manualHint: "1 line = a single point (plot under 4 ha) · 3+ lines = polygon vertices (closed automatically).",
    manualSubmit: "Validate the coordinates",
    demoFill: "Fill a sample (demo)",
    manualErrParse: "Invalid format: one « latitude, longitude » pair per line (e.g. 5.8321, -6.6478).",
    manualErrZone: "These coordinates fall outside Côte d'Ivoire (lat 4–11, lon −9–−2). Check the latitude, longitude order.",
    manualErrCount: "Enter 1 line (a point) or at least 3 lines (polygon).",
    manualCaptured: (n: number) => n > 1 ? `Coordinates provided by the cooperative: ${n}-vertex polygon (WGS-84, GeoJSON RFC 7946).` : "Coordinates provided by the cooperative: single point (WGS-84, GeoJSON RFC 7946).",
    superficie: "Area",
    checksTitle: "Integrity checks",
    next: "Validate the mapping",
    redo: "Clear",
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

/**
 * Étape 3 — cartographie de la parcelle. Agrivo ne collecte pas la donnée terrain : la
 * coopérative fournit les coordonnées GPS qu'elle détient déjà (registre, certification,
 * cartographie exportateur). En démonstration, un exemple réaliste (zone de Soubré) est
 * pré-rempli. Puis contrôles d'intégrité anti-fraude (chevauchement, plausibilité, doublon).
 */
export function StepMapping({
  parcelle,
  onNext,
  onBack,
}: {
  parcelle: Parcelle;
  onNext: () => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];

  // Contour réel de la parcelle (mock) → sert d'exemple pré-rempli et d'aperçu carte.
  const ring = useMemo(
    () =>
      parcelle.geojson.type === "Polygon"
        ? parcelle.geojson.coordinates[0]
        : [parcelle.geojson.coordinates],
    [parcelle],
  );

  // Exemple de démonstration : les sommets de la parcelle, formatés « latitude, longitude ».
  const demoText = useMemo(
    () => ring.map(([lon, lat]) => `${lat.toFixed(6)}, ${lon.toFixed(6)}`).join("\n"),
    [ring],
  );

  const [manualText, setManualText] = useState(demoText);
  const [manualErr, setManualErr] = useState<string | null>(null);
  const [manualCoords, setManualCoords] = useState<number[][] | null>(null); // [lon, lat][]
  const [phase, setPhase] = useState<Phase>("choose");
  const [checksShown, setChecksShown] = useState(0);

  const plafondT = Math.round(parcelle.superficieHa * RENDEMENT_T_HA[parcelle.filiere] * 10) / 10;
  const haStr = parcelle.superficieHa.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB");
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

  function validerManuel() {
    const lignes = manualText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const coords: number[][] = [];
    for (const l of lignes) {
      const m = l.split(/[;,\s]+/).map(Number).filter((n) => Number.isFinite(n));
      if (m.length < 2) { setManualErr(t.manualErrParse); return; }
      const [lat, lon] = m; // convention de saisie : latitude, longitude
      coords.push([lon, lat]);
    }
    if (coords.length !== 1 && coords.length < 3) { setManualErr(t.manualErrCount); return; }
    const horsZone = coords.some(([lon, lat]) => lon < -9 || lon > -2 || lat < 4 || lat > 11);
    if (horsZone) { setManualErr(t.manualErrZone); return; }
    setManualErr(null);
    setManualCoords(coords);
    setChecksShown(0);
    setPhase("captured");
  }

  function remplirDemo() {
    setManualText(demoText);
    setManualErr(null);
  }

  function recommencer() {
    setManualCoords(null);
    setManualErr(null);
    setChecksShown(0);
    setPhase("choose");
  }

  // Révélation séquentielle des contrôles d'intégrité une fois les coordonnées validées.
  useEffect(() => {
    if (phase !== "captured" || checksShown >= checks.length) return;
    const id = setTimeout(() => setChecksShown((n) => n + 1), reduce ? 0 : CHECK_TICK_MS);
    return () => clearTimeout(id);
  }, [phase, checksShown, checks.length, reduce]);

  const previewCoords = manualCoords ?? ring;
  const mapMode: MappingMode = previewCoords.length > 1 ? "polygon" : "point";

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      {/* Aperçu satellite de la parcelle */}
      <div className="relative h-[44vh] min-h-[320px] overflow-hidden rounded-2xl border border-black/[0.08] lg:h-[62vh]">
        <MappingMap
          waypoints={previewCoords}
          count={previewCoords.length}
          mode={mapMode}
          closed={phase === "captured"}
          active={false}
        />
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
            <div className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-stone-500">{t.intro}</p>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="coords-manual" className="text-xs font-medium text-forest-950">
                  {t.manualLabel}
                </label>
                <textarea
                  id="coords-manual"
                  value={manualText}
                  onChange={(e) => { setManualText(e.target.value); setManualErr(null); }}
                  rows={5}
                  spellCheck={false}
                  className="num w-full resize-y rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-green-signal focus:ring-2 focus:ring-green-signal/15"
                />
                <p className="text-[0.7rem] leading-relaxed text-stone-400">{t.manualHint}</p>
                <p className="inline-flex items-center gap-1.5 text-[0.7rem] leading-relaxed text-amber-cacao">
                  <Wand2 size={12} strokeWidth={2} aria-hidden /> {t.demoNote}
                </p>
                {manualErr && (
                  <p role="alert" className="rounded-lg bg-red-block/[0.07] px-3 py-2 text-xs text-red-block">{manualErr}</p>
                )}
              </div>
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
                  {t.manualCaptured(manualCoords?.length ?? 1)}{" "}
                  <span className="font-semibold">
                    {t.superficie} : <span className="num">{haStr} ha</span>
                  </span>
                </p>
              </div>

              {/* Contrôles d'intégrité anti-fraude */}
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} strokeWidth={2} className="text-green-signal" aria-hidden />
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    {t.checksTitle}
                  </p>
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={validerManuel}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <ClipboardPaste size={16} strokeWidth={2} aria-hidden />
                {t.manualSubmit}
              </button>
              <button
                type="button"
                onClick={remplirDemo}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-3.5 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
              >
                <Wand2 size={15} strokeWidth={2} aria-hidden />
                {t.demoFill}
              </button>
            </div>
          )}

          {phase === "captured" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={!allChecked}
                onClick={onNext}
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

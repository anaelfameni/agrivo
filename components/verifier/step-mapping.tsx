"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ClipboardPaste, Crosshair, Footprints, MapPinned, RotateCcw, ShieldCheck } from "lucide-react";
import { PinMark } from "@/components/ui/pin-mark";
import { useLanguage } from "@/components/language-provider";
import type { MappingMode } from "@/components/verifier/mapping-map";
import { FILIERE_LABEL, PARCELLES, RENDEMENT_T_HA, type Parcelle } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;
const WALK_TICK_MS = 280; // pose d'un waypoint (simulation démo ; le mobile réel écoute watchPosition)
const POINT_FIX_MS = 1400; // acquisition du point central
const CHECK_TICK_MS = 420; // révélation d'un contrôle d'intégrité

const COPY = {
  fr: {
    eyebrow: "Cartographie · GPS terrain",
    title: "Capture de la parcelle",
    intro:
      "Si la coopérative possède déjà les coordonnées de cette parcelle (registre, certification, cartographie exportateur), saisissez-les directement. Sinon, capturez au bord du champ — règle RDUE : point central sous 4 ha, polygone complet à partir de 4 ha.",
    deskNote: "Un ajustement fin reste possible ensuite, au bureau, sur l'image satellite.",
    modePointTitle: "Point central",
    modePointDesc: (ha: string) => `Parcelle de ${ha} ha : un point GPS au centre du champ suffit (règle RDUE, moins de 4 ha).`,
    modePolyTitle: "Tour de champ GPS",
    modePolyDesc: (ha: string) => `Parcelle de ${ha} ha : l'utilisateur marche le périmètre, le téléphone enregistre les waypoints.`,
    modeManualTitle: "J'ai déjà les coordonnées",
    modeManualDesc: "La coopérative fournit les coordonnées GPS qu'elle détient : un point central, ou les sommets du polygone.",
    manualBadge: "Données existantes",
    manualLabel: "Coordonnées WGS-84 (une paire « latitude, longitude » par ligne)",
    manualPlaceholder: "5.8321, -6.6478\n5.8330, -6.6461\n5.8318, -6.6452\n5.8309, -6.6470",
    manualHint: "1 ligne = point central (moins de 4 ha) · 3 lignes ou plus = sommets du polygone (fermé automatiquement).",
    manualSubmit: "Valider les coordonnées",
    manualErrParse: "Format invalide : une paire « latitude, longitude » par ligne (ex. 5.8321, -6.6478).",
    manualErrZone: "Ces coordonnées sortent de l'emprise de la Côte d'Ivoire (lat 4–11, lon −9–−2). Vérifiez l'ordre latitude, longitude.",
    manualErrCount: "Saisissez 1 ligne (point central) ou au moins 3 lignes (polygone).",
    manualCaptured: (n: number) => n > 1 ? `Coordonnées fournies par la coopérative : polygone de ${n} sommets (WGS-84, GeoJSON RFC 7946).` : "Coordonnées fournies par la coopérative : point central (WGS-84, GeoJSON RFC 7946).",
    recommended: "Recommandé",
    required: "Requis dès 4 ha",
    start: "Démarrer la capture",
    walking: "Tour de champ en cours",
    pointing: "Acquisition du point central",
    waypoints: "Waypoints",
    distance: "Distance",
    accuracy: "Précision GPS",
    capturedPoly: (n: number) => `Polygone fermé : ${n} sommets, coordonnées WGS-84 (GeoJSON RFC 7946).`,
    capturedPoint: "Point central enregistré, coordonnées WGS-84 (GeoJSON RFC 7946).",
    superficie: "Superficie",
    checksTitle: "Contrôles d'intégrité",
    next: "Valider la cartographie",
    redo: "Recommencer",
    back: "Retour",
  },
  en: {
    eyebrow: "Mapping · Field GPS",
    title: "Plot capture",
    intro:
      "If the cooperative already holds this plot's coordinates (register, certification, exporter mapping), enter them directly. Otherwise capture at the edge of the field — EUDR rule: centre point under 4 ha, full polygon from 4 ha.",
    deskNote: "Fine adjustment remains possible afterwards, at the office, on the satellite image.",
    modePointTitle: "Centre point",
    modePointDesc: (ha: string) => `Plot of ${ha} ha: one GPS point at the centre of the field is enough (EUDR rule, under 4 ha).`,
    modePolyTitle: "GPS perimeter walk",
    modePolyDesc: (ha: string) => `Plot of ${ha} ha: the app user walks the perimeter, the phone records the waypoints.`,
    modeManualTitle: "I already have the coordinates",
    modeManualDesc: "The cooperative provides the GPS coordinates it holds: a centre point, or the polygon vertices.",
    manualBadge: "Existing data",
    manualLabel: "WGS-84 coordinates (one « latitude, longitude » pair per line)",
    manualPlaceholder: "5.8321, -6.6478\n5.8330, -6.6461\n5.8318, -6.6452\n5.8309, -6.6470",
    manualHint: "1 line = centre point (under 4 ha) · 3+ lines = polygon vertices (closed automatically).",
    manualSubmit: "Validate the coordinates",
    manualErrParse: "Invalid format: one « latitude, longitude » pair per line (e.g. 5.8321, -6.6478).",
    manualErrZone: "These coordinates fall outside Côte d'Ivoire (lat 4–11, lon −9–−2). Check the latitude, longitude order.",
    manualErrCount: "Enter 1 line (centre point) or at least 3 lines (polygon).",
    manualCaptured: (n: number) => n > 1 ? `Coordinates provided by the cooperative: ${n}-vertex polygon (WGS-84, GeoJSON RFC 7946).` : "Coordinates provided by the cooperative: centre point (WGS-84, GeoJSON RFC 7946).",
    recommended: "Recommended",
    required: "Required from 4 ha",
    start: "Start the capture",
    walking: "Perimeter walk in progress",
    pointing: "Acquiring the centre point",
    waypoints: "Waypoints",
    distance: "Distance",
    accuracy: "GPS accuracy",
    capturedPoly: (n: number) => `Polygon closed: ${n} vertices, WGS-84 coordinates (GeoJSON RFC 7946).`,
    capturedPoint: "Centre point recorded, WGS-84 coordinates (GeoJSON RFC 7946).",
    superficie: "Area",
    checksTitle: "Integrity checks",
    next: "Validate the mapping",
    redo: "Start again",
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

type Phase = "choose" | "capturing" | "captured";

/** Distance haversine en mètres entre deux [lon, lat]. */
function haversineM(a: number[], b: number[]): number {
  const R = 6371000;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const la1 = (a[1] * Math.PI) / 180;
  const la2 = (b[1] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Densifie le contour en waypoints réguliers (~4 par arête) : la trajectoire du tour de champ. */
function densifier(ring: number[][], perEdge = 4): number[][] {
  // Retire le point de fermeture dupliqué s'il est présent (anneau GeoJSON fermé).
  const pts =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring;
  const out: number[][] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    for (let k = 0; k < perEdge; k++) {
      const t = k / perEdge;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

/** Précision GPS simulée, déterministe (±3,0 à ±5,4 m) : pas d'aléa, pas de flash d'hydratation. */
const accuracyAt = (i: number) => 3 + ((i * 7) % 25) / 10;

/**
 * Étape 3 — cartographie de la parcelle (capture professionnelle). Deux modes conformes au
 * standard RDUE : point central (< 4 ha) ou tour de champ GPS (waypoints posés le long du
 * périmètre). Puis contrôles d'intégrité anti-fraude (chevauchement, plausibilité, signal GPS,
 * doublon). Simulation fidèle pour la démo web ; le mobile réel écoute la géolocalisation.
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

  const ring = useMemo(
    () =>
      parcelle.geojson.type === "Polygon"
        ? parcelle.geojson.coordinates[0]
        : [parcelle.geojson.coordinates],
    [parcelle],
  );
  const waypoints = useMemo(() => densifier(ring), [ring]);
  const centroid = useMemo(() => {
    const pts = waypoints.length ? waypoints : ring;
    const lon = pts.reduce((s, c) => s + c[0], 0) / pts.length;
    const lat = pts.reduce((s, c) => s + c[1], 0) / pts.length;
    return [lon, lat];
  }, [waypoints, ring]);

  const smallPlot = parcelle.superficieHa < 4;
  const [mode, setMode] = useState<MappingMode | "manual">(smallPlot ? "point" : "polygon");
  const [manualText, setManualText] = useState("");
  const [manualErr, setManualErr] = useState<string | null>(null);
  const [manualCoords, setManualCoords] = useState<number[][] | null>(null); // [lon, lat][]
  const [phase, setPhase] = useState<Phase>("choose");
  const [count, setCount] = useState(0);
  const [closed, setClosed] = useState(false);
  const [checksShown, setChecksShown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const plafondT = Math.round(parcelle.superficieHa * RENDEMENT_T_HA[parcelle.filiere] * 10) / 10;
  const haStr = parcelle.superficieHa.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB");
  const checks =
    lang === "fr"
      ? [
          `Aucun chevauchement avec les ${PARCELLES.length} parcelles déjà enrôlées`,
          `Superficie plausible : plafond d'achat ${plafondT.toLocaleString("fr-FR")} t/an (${FILIERE_LABEL[parcelle.filiere].toLowerCase()}, rendement régional)`,
          "Signal GPS authentique : aucune position simulée détectée",
          `Matricule ${parcelle.numeroCartePro} : unique, aucun doublon`,
        ]
      : [
          `No overlap with the ${PARCELLES.length} plots already enrolled`,
          `Plausible area: purchase cap ${plafondT.toLocaleString("en-GB")} t/year (${FILIERE_LABEL[parcelle.filiere].toLowerCase()}, regional yield)`,
          "Authentic GPS signal: no mock location detected",
          `Card number ${parcelle.numeroCartePro}: unique, no duplicate`,
        ];
  const allChecked = checksShown >= checks.length;

  const distanceM = useMemo(() => {
    let d = 0;
    for (let i = 1; i < Math.min(count, waypoints.length); i++) {
      d += haversineM(waypoints[i - 1], waypoints[i]);
    }
    if (closed && count >= waypoints.length && waypoints.length > 1) {
      d += haversineM(waypoints[waypoints.length - 1], waypoints[0]);
    }
    return Math.round(d);
  }, [count, closed, waypoints]);

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
    setCount(coords.length);
    setClosed(true);
    setChecksShown(0);
    setPhase("captured");
  }

  function demarrer() {
    if (mode === "manual") { validerManuel(); return; }
    setPhase("capturing");
    setCount(0);
    setClosed(false);
    setChecksShown(0);
    if (reduce) {
      // Reduced-motion : état final direct, pas de simulation animée.
      setCount(mode === "polygon" ? waypoints.length : 1);
      setClosed(true);
      setPhase("captured");
      setChecksShown(checks.length);
      return;
    }
    if (mode === "point") {
      setCount(1);
      timerRef.current = setInterval(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setClosed(true);
        setPhase("captured");
      }, POINT_FIX_MS);
      return;
    }
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c + 1 >= waypoints.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setClosed(true);
          setPhase("captured");
          return waypoints.length;
        }
        return c + 1;
      });
    }, WALK_TICK_MS);
  }

  // Révélation séquentielle des contrôles d'intégrité une fois la capture fermée.
  useEffect(() => {
    if (phase !== "captured" || checksShown >= checks.length) return;
    const id = setTimeout(() => setChecksShown((n) => n + 1), reduce ? 0 : CHECK_TICK_MS);
    return () => clearTimeout(id);
  }, [phase, checksShown, checks.length, reduce]);

  function recommencer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setManualCoords(null);
    setManualErr(null);
    setPhase("choose");
    setCount(0);
    setClosed(false);
    setChecksShown(0);
  }

  const mapMode: MappingMode = mode === "manual" ? (manualCoords && manualCoords.length > 1 ? "polygon" : "point") : mode;
  const mapWaypoints = mode === "manual" && manualCoords ? manualCoords : mode === "point" ? [centroid] : waypoints;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      {/* Carte satellite de capture */}
      <div className="relative h-[44vh] min-h-[320px] overflow-hidden rounded-2xl border border-black/[0.08] lg:h-[62vh]">
        <MappingMap
          waypoints={mapWaypoints}
          count={count}
          mode={mapMode}
          closed={closed}
          active={phase === "capturing"}
        />
      </div>

      {/* Panneau de capture */}
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
              <div className="flex flex-col gap-2" role="radiogroup" aria-label={t.title}>
                <ModeCard
                  icon={<Crosshair size={18} strokeWidth={2} aria-hidden />}
                  title={t.modePointTitle}
                  desc={t.modePointDesc(haStr)}
                  badge={smallPlot ? t.recommended : undefined}
                  selected={mode === "point"}
                  onSelect={() => setMode("point")}
                />
                <ModeCard
                  icon={<Footprints size={18} strokeWidth={2} aria-hidden />}
                  title={t.modePolyTitle}
                  desc={t.modePolyDesc(haStr)}
                  badge={smallPlot ? undefined : t.required}
                  selected={mode === "polygon"}
                  onSelect={() => setMode("polygon")}
                />
                <ModeCard
                  icon={<ClipboardPaste size={18} strokeWidth={2} aria-hidden />}
                  title={t.modeManualTitle}
                  desc={t.modeManualDesc}
                  badge={t.manualBadge}
                  selected={mode === "manual"}
                  onSelect={() => setMode("manual")}
                />
              </div>
              {mode === "manual" && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="coords-manual" className="text-xs font-medium text-forest-950">
                    {t.manualLabel}
                  </label>
                  <textarea
                    id="coords-manual"
                    value={manualText}
                    onChange={(e) => { setManualText(e.target.value); setManualErr(null); }}
                    rows={4}
                    spellCheck={false}
                    placeholder={t.manualPlaceholder}
                    className="num w-full resize-y rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-green-signal focus:ring-2 focus:ring-green-signal/15"
                  />
                  <p className="text-[0.7rem] leading-relaxed text-stone-400">{t.manualHint}</p>
                  {manualErr && (
                    <p role="alert" className="rounded-lg bg-red-block/[0.07] px-3 py-2 text-xs text-red-block">{manualErr}</p>
                  )}
                </div>
              )}
              <p className="text-xs leading-relaxed text-stone-400">{t.deskNote}</p>
            </div>
          )}

          {phase === "capturing" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl bg-ivory-deep/50 px-4 py-3">
                <PinMark size={22} color="var(--color-green-signal)" pulse />
                <span className="text-sm font-medium text-forest-950">
                  {mode === "polygon" ? t.walking : t.pointing}
                </span>
              </div>
              <dl className="grid grid-cols-3 gap-2">
                <Meter label={t.waypoints} value={mode === "polygon" ? `${count}/${waypoints.length}` : "1"} />
                <Meter label={t.distance} value={`${distanceM.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB")} m`} />
                <Meter label={t.accuracy} value={`±${accuracyAt(count).toFixed(1).replace(".", lang === "fr" ? "," : ".")} m`} />
              </dl>
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
                  {mode === "manual" ? t.manualCaptured(manualCoords?.length ?? 1) : mode === "polygon" ? t.capturedPoly(waypoints.length) : t.capturedPoint}{" "}
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
                        <span
                          className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-green-signal/15"
                          aria-hidden
                        >
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
              onClick={demarrer}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              {mode === "manual" ? <ClipboardPaste size={16} strokeWidth={2} aria-hidden /> : mode === "polygon" ? <Footprints size={16} strokeWidth={2} aria-hidden /> : <Crosshair size={16} strokeWidth={2} aria-hidden />}
              {mode === "manual" ? t.manualSubmit : t.start}
            </button>
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

function ModeCard({
  icon,
  title,
  desc,
  badge,
  selected,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-signal ${
        selected
          ? "border-green-signal/50 bg-green-signal/[0.06]"
          : "border-black/[0.08] bg-white hover:border-green-signal/30"
      }`}
    >
      <span
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
          selected ? "bg-green-signal text-white" : "bg-ivory-deep/70 text-forest-950"
        }`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-forest-950">{title}</span>
          {badge && (
            <span className="rounded-full bg-green-signal/12 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-green-signal">
              {badge}
            </span>
          )}
        </span>
        <span className="text-xs leading-relaxed text-stone-500">{desc}</span>
      </span>
    </button>
  );
}

function Meter({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-ivory-deep/40 px-3 py-2.5">
      <dt className="text-[0.62rem] font-medium uppercase tracking-wider text-stone-400">{label}</dt>
      <dd className="num mt-0.5 text-sm font-semibold text-forest-950">{value}</dd>
    </div>
  );
}

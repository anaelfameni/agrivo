"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L, { type Map as LeafletMap } from "leaflet";
import { motion, useReducedMotion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import { PinMark } from "@/components/ui/pin-mark";
import { ZonesSensiblesLayer } from "@/components/map/zones-sensibles-layer";
import { useLanguage } from "@/components/language-provider";
import { type Statut } from "@/data/mock-parcelles";

const LABELS = {
  fr: {
    idle: "Parcelle prête",
    drawing: "Cartographie…",
    scanning: "Analyse satellite en cours…",
    verdict: "Analyse terminée",
  },
  en: {
    idle: "Plot ready",
    drawing: "Mapping…",
    scanning: "Satellite analysis in progress…",
    verdict: "Analysis complete",
  },
} as const;

const EASE = [0.16, 1, 0.3, 1] as const;
// Couleurs en HEX explicite : les variables CSS ne sont pas fiables en attribut SVG (stroke/fill).
const HEX: Record<Statut, string> = {
  conforme: "#16a34a",
  anomalie: "#b4231e",
  insuffisant: "#c8861d",
};

export type AnalysisPhase = "idle" | "drawing" | "scanning" | "verdict";

interface Geom {
  w: number;
  h: number;
  poly: [number, number][];
  centroid: [number, number];
}

/** Égalité pixel-à-pixel de la géométrie projetée : évite un setState (et donc une boucle de rendu) inutile. */
function geomEqual(a: Geom, b: Geom): boolean {
  if (a.w !== b.w || a.h !== b.h) return false;
  if (a.centroid[0] !== b.centroid[0] || a.centroid[1] !== b.centroid[1]) return false;
  if (a.poly.length !== b.poly.length) return false;
  for (let i = 0; i < a.poly.length; i++) {
    if (a.poly[i][0] !== b.poly[i][0] || a.poly[i][1] !== b.poly[i][1]) return false;
  }
  return true;
}

/** Remonte l'instance Leaflet dès que la carte est prête. */
function MapBridge({ onReady }: { onReady: (m: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

/**
 * Carte satellite d'analyse (le moment signature). Fond satellite réel (Esri World Imagery via
 * react-leaflet) + surcouche SVG qui DESSINE le polygone de la parcelle, la BALAYE, puis la
 * REMPLIT de la couleur du verdict. La surcouche est projetée par Leaflet (aligne avec les tuiles)
 * et reste lisible même si les tuiles tardent (fond forêt). Vue figée : pas de pan/zoom accidentel.
 */
export default function AnalysisMap({
  ring,
  statut,
  phase,
}: {
  ring: number[][]; // [lon, lat][]
  statut: Statut;
  phase: AnalysisPhase;
}) {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const tl = LABELS[lang];
  const [showZones, setShowZones] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const mountedRef = useRef(true);
  const [geom, setGeom] = useState<Geom | null>(null);
  const color = HEX[statut];

  // `ring` est une nouvelle référence à chaque rendu du parent : on dérive une clé stable de son
  // CONTENU pour ne recréer `bounds`/mémos que quand la parcelle change réellement (sinon la carte
  // se ré-observait à chaque rendu → setGeom en boucle → « Maximum update depth exceeded »).
  const ringKey = JSON.stringify(ring);
  const ringRef = useRef(ring);
  ringRef.current = ring;

  const latlngs = useMemo(
    () => ring.map(([lon, lat]) => [lat, lon] as [number, number]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ringKey],
  );
  const bounds = useMemo(() => L.latLngBounds(latlngs), [latlngs]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      mapRef.current = null;
    };
  }, []);

  // Projection Leaflet → pixels. Protégée : la carte peut être en cours d'init ou démontée
  // (transition d'étape), auquel cas latLngToContainerPoint lèverait (_leaflet_pos).
  const compute = useCallback((map: LeafletMap) => {
    try {
      if (!mountedRef.current || !map.getContainer()?.isConnected) return;
      const ring = ringRef.current;
      const size = map.getSize();
      const poly = ring.map(([lon, lat]) => {
        const p = map.latLngToContainerPoint([lat, lon]);
        return [p.x, p.y] as [number, number];
      });
      const cLon = ring.reduce((s, c) => s + c[0], 0) / ring.length;
      const cLat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
      const cp = map.latLngToContainerPoint([cLat, cLon]);
      const next: Geom = { w: size.x, h: size.y, poly, centroid: [cp.x, cp.y] };
      // Ne remplace l'état QUE si la projection a réellement changé : casse la boucle de rendu.
      setGeom((prev) => (prev && geomEqual(prev, next) ? prev : next));
    } catch {
      /* carte non prête ou démontée : on ignore ce cycle */
    }
  }, []);

  const onReady = useCallback(
    (map: LeafletMap) => {
      mapRef.current = map;
      try {
        map.fitBounds(bounds, { padding: [28, 28] });
      } catch {
        /* ignore */
      }
      compute(map);
      // Recalcule après stabilisation du layout (compute est protégé si démonté).
      setTimeout(() => compute(map), 250);
    },
    [bounds, compute],
  );

  // Recalcule la surcouche si le conteneur change de taille.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const map = mapRef.current;
      if (!map || !mountedRef.current || !el.isConnected) return;
      try {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [28, 28] });
      } catch {
        return;
      }
      compute(map);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [bounds, compute]);

  const polyPath = geom
    ? geom.poly.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + " Z"
    : "";

  const showVerdict = phase === "verdict";
  const scanning = phase === "scanning";
  const analyzing = phase === "drawing" || phase === "scanning";

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "radial-gradient(120% 120% at 30% 10%, #12372a 0%, #0a1f14 70%)" }}
    >
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [28, 28] }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl
        className="h-full w-full"
        style={{ background: "transparent" }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagerie © Esri, Maxar, Earthstar Geographics"
          maxZoom={19}
        />
        <MapBridge onReady={onReady} />
        <ZonesSensiblesLayer show={showZones} />
      </MapContainer>

      {/* Bascule du masque « zones sensibles » (aires protégées, tracé indicatif) */}
      <button
        type="button"
        onClick={() => setShowZones((v) => !v)}
        aria-pressed={showZones}
        className={`pointer-events-auto absolute right-3 top-3 z-[500] inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.6rem] font-semibold backdrop-blur-sm outline-none transition-colors ${showZones ? "border-red-block/60 bg-red-block/80 text-white" : "border-white/20 bg-black/40 text-white/90 hover:border-white/40"}`}
      >
        <span className="h-2 w-2 rounded-[2px] border border-white/60" style={{ background: showZones ? "#b4231e" : "transparent" }} aria-hidden />
        {lang === "en" ? "Sensitive areas" : "Zones sensibles"}
      </button>

      {/* Vignette : concentre le regard et fait ressortir la parcelle + les étiquettes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[450]"
        style={{ boxShadow: "inset 0 0 140px 40px rgba(10,31,20,0.5)" }}
      />

      {/* Surcouche d'analyse (projetée par Leaflet, alignée aux tuiles) */}
      {geom && (
        <svg
          width={geom.w}
          height={geom.h}
          viewBox={`0 0 ${geom.w} ${geom.h}`}
          className="pointer-events-none absolute inset-0 z-[500]"
          aria-hidden
        >
          <defs>
            <linearGradient id={`sweep-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#16a34a" stopOpacity="0" />
              <stop offset="0.5" stopColor="#6ee7a3" stopOpacity="0.55" />
              <stop offset="1" stopColor="#16a34a" stopOpacity="0" />
            </linearGradient>
            <clipPath id={`clip-${uid}`}>
              <path d={polyPath} />
            </clipPath>
          </defs>

          {/* Halo pulsé neutre pendant l'analyse */}
          {analyzing && (
            <motion.path
              d={polyPath}
              fill="#eafff2"
              initial={{ opacity: 0 }}
              animate={reduce ? { opacity: 0.1 } : { opacity: [0.05, 0.16, 0.05] }}
              transition={{ duration: 1.1, repeat: reduce ? 0 : Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Balayage satellite pendant le scan */}
          {scanning && !reduce && (
            <g clipPath={`url(#clip-${uid})`}>
              <motion.rect
                y={0}
                width={16}
                height={geom.h}
                fill={`url(#sweep-${uid})`}
                initial={{ x: -16 }}
                animate={{ x: geom.w }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              />
            </g>
          )}

          {/* Remplissage du verdict (scale-bounce discret) */}
          {showVerdict && (
            <motion.path
              d={polyPath}
              fill={color}
              initial={reduce ? { opacity: 0.34 } : { opacity: 0, scale: 0.9 }}
              animate={reduce ? { opacity: 0.34 } : { opacity: 0.34, scale: [0.9, 1.04, 1] }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          )}

          {/* Halo sombre : garantit le contraste du contour sur n'importe quelle imagerie */}
          <motion.path
            d={polyPath}
            fill="none"
            stroke="rgba(10,31,20,0.55)"
            strokeWidth={8}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: phase === "idle" ? 0 : 1 }}
            transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
          />
          {/* Contour net qui se dessine (blanc pendant l'analyse, couleur du verdict ensuite) */}
          <motion.path
            d={polyPath}
            fill="none"
            stroke={showVerdict ? color : "#ffffff"}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: phase === "idle" ? 0 : 1 }}
            transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
          />

          {/* Sommets, légèrement interactifs */}
          {phase !== "idle" &&
            geom.poly.map((p, i) => (
              <motion.circle
                key={i}
                cx={p[0]}
                cy={p[1]}
                r={4}
                fill="#f7f3ea"
                stroke={showVerdict ? color : "#0a1f14"}
                strokeWidth={1.5}
                className="pointer-events-auto cursor-pointer"
                initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.6 }}
                transition={{ duration: 0.3, delay: reduce ? 0 : 0.5 + i * 0.05 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <title>
                  {Math.abs(ring[i]?.[1] ?? 0).toFixed(4)}° {(ring[i]?.[1] ?? 0) >= 0 ? "N" : "S"},{" "}
                  {Math.abs(ring[i]?.[0] ?? 0).toFixed(4)}° {(ring[i]?.[0] ?? 0) >= 0 ? "E" : "O"}
                </title>
              </motion.circle>
            ))}
        </svg>
      )}

      {/* Pin/feuille pulsant « analyse en cours » au centroïde */}
      {geom && analyzing && (
        <div
          className="pointer-events-none absolute z-[500] -translate-x-1/2 -translate-y-1/2"
          style={{ left: geom.centroid[0], top: geom.centroid[1] }}
        >
          <PinMark size={40} color="#eafff2" leafColor="rgba(224,166,75,0.95)" pulse />
        </div>
      )}

      {/* Étiquette d'état */}
      <div className="pointer-events-none absolute left-3 top-3 z-[500]">
        <span className="eyebrow rounded-full bg-black/35 px-3 py-1.5 text-[0.62rem] text-white/90 backdrop-blur-sm">
          {tl[phase]}
        </span>
      </div>
    </div>
  );
}

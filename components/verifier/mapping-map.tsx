"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L, { type Map as LeafletMap } from "leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import { PinMark } from "@/components/ui/pin-mark";
import { ZonesSensiblesLayer } from "@/components/map/zones-sensibles-layer";
import { useLanguage } from "@/components/language-provider";

const LABELS = {
  fr: {
    idle: "Prêt pour la capture",
    walking: "Tour de champ en cours…",
    pointing: "Acquisition du signal GPS…",
    closedPoly: "Polygone fermé",
    closedPoint: "Point central enregistré",
  },
  en: {
    idle: "Ready to capture",
    walking: "Perimeter walk in progress…",
    pointing: "Acquiring GPS signal…",
    closedPoly: "Polygon closed",
    closedPoint: "Centre point recorded",
  },
} as const;

const GREEN = "#16a34a";
const IVORY = "#f7f3ea";

export type MappingMode = "polygon" | "point";

interface Geom {
  w: number;
  h: number;
  pts: [number, number][]; // waypoints projetés (pixels)
  centroid: [number, number];
}

function geomEqual(a: Geom, b: Geom): boolean {
  if (a.w !== b.w || a.h !== b.h || a.pts.length !== b.pts.length) return false;
  if (a.centroid[0] !== b.centroid[0] || a.centroid[1] !== b.centroid[1]) return false;
  for (let i = 0; i < a.pts.length; i++) {
    if (a.pts[i][0] !== b.pts[i][0] || a.pts[i][1] !== b.pts[i][1]) return false;
  }
  return true;
}

function MapBridge({ onReady }: { onReady: (m: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

/**
 * Carte satellite de CAPTURE (étape cartographie). Même plomberie de projection que
 * `analysis-map.tsx` (surcouche SVG alignée aux tuiles Esri, protections démontage/boucle),
 * mais tournée vers la capture : les waypoints GPS se posent un à un le long du périmètre
 * (mode tour de champ) ou un point unique s'enregistre au centre (mode point central).
 * La liste complète des waypoints est projetée UNE fois ; l'animation ne dépend que de `count`.
 */
export default function MappingMap({
  waypoints,
  count,
  mode,
  closed,
  active,
}: {
  waypoints: number[][]; // [lon, lat][] : la trajectoire complète prévue (statique)
  count: number; // nombre de waypoints déjà posés (0..N)
  mode: MappingMode;
  closed: boolean; // capture terminée (polygone fermé / point enregistré)
  active: boolean; // capture en cours
}) {
  const { lang } = useLanguage();
  const tl = LABELS[lang];
  const [showZones, setShowZones] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const mountedRef = useRef(true);
  const [geom, setGeom] = useState<Geom | null>(null);

  const wpKey = JSON.stringify(waypoints);
  const wpRef = useRef(waypoints);
  wpRef.current = waypoints;

  const latlngs = useMemo(
    () => waypoints.map(([lon, lat]) => [lat, lon] as [number, number]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wpKey],
  );
  const bounds = useMemo(() => L.latLngBounds(latlngs), [latlngs]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      mapRef.current = null;
    };
  }, []);

  const compute = useCallback((map: LeafletMap) => {
    try {
      if (!mountedRef.current || !map.getContainer()?.isConnected) return;
      const wps = wpRef.current;
      const size = map.getSize();
      const pts = wps.map(([lon, lat]) => {
        const p = map.latLngToContainerPoint([lat, lon]);
        return [p.x, p.y] as [number, number];
      });
      const cLon = wps.reduce((s, c) => s + c[0], 0) / wps.length;
      const cLat = wps.reduce((s, c) => s + c[1], 0) / wps.length;
      const cp = map.latLngToContainerPoint([cLat, cLon]);
      const next: Geom = { w: size.x, h: size.y, pts, centroid: [cp.x, cp.y] };
      setGeom((prev) => (prev && geomEqual(prev, next) ? prev : next));
    } catch {
      /* carte non prête ou démontée : on ignore ce cycle */
    }
  }, []);

  const onReady = useCallback(
    (map: LeafletMap) => {
      mapRef.current = map;
      try {
        map.fitBounds(bounds, { padding: [36, 36] });
      } catch {
        /* ignore */
      }
      compute(map);
      setTimeout(() => compute(map), 250);
    },
    [bounds, compute],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const map = mapRef.current;
      if (!map || !mountedRef.current || !el.isConnected) return;
      try {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [36, 36] });
      } catch {
        return;
      }
      compute(map);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [bounds, compute]);

  const placed = geom ? geom.pts.slice(0, Math.min(count, geom.pts.length)) : [];
  const last = placed[placed.length - 1];
  const walkPath =
    placed.length > 1
      ? placed.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")
      : "";
  const fullPath = geom
    ? geom.pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + " Z"
    : "";

  const label = closed
    ? mode === "polygon"
      ? tl.closedPoly
      : tl.closedPoint
    : active
      ? mode === "polygon"
        ? tl.walking
        : tl.pointing
      : tl.idle;

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "radial-gradient(120% 120% at 30% 10%, #12372a 0%, #0a1f14 70%)" }}
    >
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [36, 36] }}
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
        className={`pointer-events-auto absolute right-3 top-3 z-[520] inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.6rem] font-semibold backdrop-blur-sm outline-none transition-colors ${showZones ? "border-red-block/60 bg-red-block/80 text-white" : "border-white/20 bg-black/40 text-white/90 hover:border-white/40"}`}
      >
        <span className="h-2 w-2 rounded-[2px] border border-white/60" style={{ background: showZones ? "#b4231e" : "transparent" }} aria-hidden />
        {lang === "en" ? "Sensitive areas" : "Zones sensibles"}
      </button>

      {/* Vignette : concentre le regard, garantit le contraste des marqueurs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[450]"
        style={{ boxShadow: "inset 0 0 140px 40px rgba(10,31,20,0.5)" }}
      />

      {geom && mode === "polygon" && (
        <svg
          width={geom.w}
          height={geom.h}
          viewBox={`0 0 ${geom.w} ${geom.h}`}
          className="pointer-events-none absolute inset-0 z-[500]"
          aria-hidden
        >
          <defs>
            <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={GREEN} stopOpacity="0.32" />
              <stop offset="1" stopColor={GREEN} stopOpacity="0.18" />
            </linearGradient>
          </defs>

          {/* Polygone fermé : remplissage + contour définitif */}
          {closed && (
            <>
              <motion.path
                d={fullPath}
                fill={`url(#fill-${uid})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <path
                d={fullPath}
                fill="none"
                stroke="rgba(10,31,20,0.55)"
                strokeWidth={8}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d={fullPath}
                fill="none"
                stroke={GREEN}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Trace du tour de champ (waypoints posés jusqu'ici) */}
          {!closed && walkPath && (
            <>
              <path
                d={walkPath}
                fill="none"
                stroke="rgba(10,31,20,0.55)"
                strokeWidth={7}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d={walkPath}
                fill="none"
                stroke={IVORY}
                strokeWidth={2.5}
                strokeDasharray="6 5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Waypoints posés */}
          {placed.map((p, i) => (
            <motion.circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r={i === placed.length - 1 && !closed ? 5 : 3.5}
              fill={IVORY}
              stroke={closed ? GREEN : "#0a1f14"}
              strokeWidth={1.5}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
          ))}
        </svg>
      )}

      {/* Mode point central : croisillon + halo de précision au centroïde */}
      {geom && mode === "point" && (active || closed) && (
        <div
          className="pointer-events-none absolute z-[500] -translate-x-1/2 -translate-y-1/2"
          style={{ left: geom.centroid[0], top: geom.centroid[1] }}
        >
          <div className="relative grid place-items-center">
            {!closed && (
              <motion.span
                aria-hidden
                className="absolute h-16 w-16 rounded-full border-2 border-green-signal/70"
                initial={{ opacity: 0.8, scale: 0.4 }}
                animate={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            {closed && (
              <span
                aria-hidden
                className="absolute h-14 w-14 rounded-full border-2 border-green-signal/60 bg-green-signal/15"
              />
            )}
            <PinMark size={38} color="#eafff2" leafColor="rgba(224,166,75,0.95)" pulse={!closed} />
          </div>
        </div>
      )}

      {/* Marcheur (dernier waypoint) pendant le tour de champ */}
      {geom && mode === "polygon" && active && !closed && last && (
        <div
          className="pointer-events-none absolute z-[510] -translate-x-1/2 -translate-y-full"
          style={{ left: last[0], top: last[1] }}
        >
          <PinMark size={34} color="#eafff2" leafColor="rgba(224,166,75,0.95)" pulse />
        </div>
      )}

      {/* Étiquette d'état */}
      <div className="pointer-events-none absolute left-3 top-3 z-[520]">
        <span className="eyebrow rounded-full bg-black/35 px-3 py-1.5 text-[0.62rem] text-white/90 backdrop-blur-sm">
          {label}
        </span>
      </div>
    </div>
  );
}

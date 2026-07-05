"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PinMark } from "@/components/ui/pin-mark";
import { type Parcelle, type Statut } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;
// HEX explicite : var() CSS n'est pas fiable en attribut SVG (stroke/fill), notamment sur Safari.
const HEX: Record<Statut, string> = {
  conforme: "#16a34a",
  anomalie: "#b4231e",
  insuffisant: "#c8861d",
};
const W = 100;
const H = 66;
const PAD = 16;

/** Projette un anneau [lon, lat][] dans le viewBox SVG (y inversé : le nord est en haut). */
function project(ring: number[][]): [number, number][] {
  const lons = ring.map((c) => c[0]);
  const lats = ring.map((c) => c[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const spanLon = maxLon - minLon || 1e-6;
  const spanLat = maxLat - minLat || 1e-6;
  return ring.map(([lon, lat]) => [
    PAD + ((lon - minLon) / spanLon) * (W - 2 * PAD),
    PAD + (1 - (lat - minLat) / spanLat) * (H - 2 * PAD),
  ]);
}

/**
 * Aperçu cartographique stylisé d'une parcelle (fond « satellite » sombre + grille + polygone
 * GeoJSON qui se dessine). Volontairement un placeholder soigné : la carte satellite complète
 * (react-leaflet) est construite dans le parcours de vérification (Prompt 4).
 */
export function ParcelleMap({ parcelle, className = "" }: { parcelle: Parcelle; className?: string }) {
  const reduce = useReducedMotion();
  const color = HEX[parcelle.statut];
  const geo = parcelle.geojson;

  let d = "";
  let sommets: [number, number][] = [];
  let centroid: number[] = [];

  if (geo.type === "Polygon") {
    const ring = geo.coordinates[0];
    sommets = project(ring);
    d = sommets.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ") + " Z";
    const lon = ring.reduce((s, c) => s + c[0], 0) / ring.length;
    const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
    centroid = [lon, lat];
  } else {
    centroid = geo.coordinates;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-black/[0.06] ${className}`}
      style={{ background: "radial-gradient(120% 120% at 30% 10%, #12372a 0%, #0a1f14 70%)" }}
    >
      {/* Grille cartographique + grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(to right,#eafff2 1px,transparent 1px),linear-gradient(to bottom,#eafff2 1px,transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
      <PinMark
        size={120}
        color="rgba(234,255,242,0.05)"
        leafColor="rgba(224,166,75,0.06)"
        className="pointer-events-none absolute -bottom-6 -right-4"
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="relative block w-full"
        role="img"
        aria-label={`Emplacement de la parcelle de ${parcelle.producteurNom} (${parcelle.region})`}
      >
        {geo.type === "Polygon" ? (
          <>
            {/* Remplissage du verdict */}
            <motion.path
              d={d}
              fill={color}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              transition={{ duration: 0.6, delay: reduce ? 0 : 0.75 }}
            />
            {/* Contour qui se dessine */}
            <motion.path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={0.9}
              strokeLinejoin="round"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
            />
            {/* Sommets */}
            {sommets.map((p, i) => (
              <motion.circle
                key={i}
                cx={p[0]}
                cy={p[1]}
                r={0.9}
                fill="#f7f3ea"
                stroke={color}
                strokeWidth={0.6}
                initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: reduce ? 0 : 0.9 + i * 0.06 }}
                style={{ transformOrigin: `${p[0]}px ${p[1]}px` }}
              />
            ))}
          </>
        ) : (
          <PinMark size={0} />
        )}
      </svg>

      {/* Étiquettes coin */}
      <div className="pointer-events-none absolute left-3 top-3">
        <span className="eyebrow rounded-full bg-black/25 px-2.5 py-1 text-[0.62rem] text-white/85 backdrop-blur-sm">
          Zone analysée
        </span>
      </div>
      {centroid.length === 2 && (
        <div className="pointer-events-none absolute bottom-3 left-3">
          <span className="num rounded-full bg-black/25 px-2.5 py-1 text-[0.68rem] text-white/80 backdrop-blur-sm">
            {Math.abs(centroid[1]).toFixed(4)}° {centroid[1] >= 0 ? "N" : "S"} ·{" "}
            {Math.abs(centroid[0]).toFixed(4)}° {centroid[0] >= 0 ? "E" : "O"}
          </span>
        </div>
      )}
    </div>
  );
}

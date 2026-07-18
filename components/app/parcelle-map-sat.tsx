"use client";

import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";
import { LabelsLayer } from "@/components/map/labels-layer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/components/language-provider";
import { STATUT_LABEL, type Parcelle, type Statut } from "@/data/mock-parcelles";

const STATUT_LABEL_EN: Record<Statut, string> = {
  conforme: "Compliant",
  anomalie: "Anomaly detected",
  insuffisant: "Insufficient data",
};

// HEX explicite : var() CSS n'est pas fiable dans les options de tracé Leaflet.
const HEX: Record<Statut, string> = {
  conforme: "#16a34a",
  anomalie: "#b4231e",
  insuffisant: "#c8861d",
};

/** Recadre la carte sur la parcelle (au montage) + corrige la taille au premier rendu. */
function FitBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      try {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
      } catch {
        /* carte non prête : ignoré */
      }
    };
    fit();
    const t = setTimeout(fit, 220);
    return () => clearTimeout(t);
  }, [map, bounds]);
  return null;
}

/**
 * Carte satellite RÉELLE d'une parcelle (imagerie Esri World Imagery, même fond que le parcours
 * de vérification et le portefeuille exportateur) : polygone GeoJSON teinté au verdict, ou point
 * central. Remplace l'ancien aperçu stylisé sur la page parcelle.
 */
export default function ParcelleMapSat({ parcelle, className = "" }: { parcelle: Parcelle; className?: string }) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const color = HEX[parcelle.statut];

  const { ring, center } = useMemo(() => {
    if (parcelle.geojson.type === "Polygon") {
      const r = parcelle.geojson.coordinates[0].map(([lon, lat]) => [lat, lon] as [number, number]);
      const cLat = r.reduce((s, c) => s + c[0], 0) / r.length;
      const cLon = r.reduce((s, c) => s + c[1], 0) / r.length;
      return { ring: r, center: [cLat, cLon] as [number, number] };
    }
    const [lon, lat] = parcelle.geojson.coordinates;
    return { ring: null, center: [lat, lon] as [number, number] };
  }, [parcelle]);

  const bounds = useMemo(() => {
    if (ring) return L.latLngBounds(ring);
    return L.latLng(center).toBounds(420); // ~420 m autour du point central
  }, [ring, center]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-black/[0.08] ${className}`}>
      <MapContainer
        bounds={bounds}
        scrollWheelZoom={false}
        attributionControl
        className="h-full w-full"
        style={{ background: "#0a1f14", position: "absolute", inset: 0 }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagerie © Esri, Maxar, Earthstar Geographics"
          maxZoom={19}
        />
        <LabelsLayer />
        <FitBounds bounds={bounds} />
        {ring ? (
          <Polygon
            positions={ring}
            pathOptions={{ color, weight: 2.5, opacity: 1, fillColor: color, fillOpacity: 0.28 }}
          />
        ) : (
          <CircleMarker
            center={center}
            radius={9}
            pathOptions={{ color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 0.95 }}
          />
        )}
      </MapContainer>

      {/* Étiquettes (au-dessus des tuiles Leaflet : z-[500]) */}
      <div className="pointer-events-none absolute left-3 top-3 z-[500]">
        <span className="eyebrow rounded-full bg-forest-950/70 px-2.5 py-1 text-[0.62rem] text-white/90 backdrop-blur-sm">
          {en ? "Analyzed area · satellite imagery" : "Zone analysée · imagerie satellite"}
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-wrap items-center gap-1.5">
        <span className="num rounded-full bg-forest-950/70 px-2.5 py-1 text-[0.68rem] text-white/85 backdrop-blur-sm">
          {Math.abs(center[0]).toFixed(4)}° {center[0] >= 0 ? "N" : "S"} · {Math.abs(center[1]).toFixed(4)}°{" "}
          {center[1] >= 0 ? "E" : en ? "W" : "O"}
        </span>
        {/* Légende : la couleur du tracé = le statut de la parcelle */}
        <span className="flex items-center gap-1.5 rounded-full bg-forest-950/70 px-2.5 py-1 text-[0.65rem] font-medium text-white/90 backdrop-blur-sm">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden />
          {(en ? STATUT_LABEL_EN : STATUT_LABEL)[parcelle.statut]}
        </span>
      </div>
    </div>
  );
}

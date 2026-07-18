"use client";

import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import { LabelsLayer } from "@/components/map/labels-layer";
import L from "leaflet";
import { useReducedMotion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/components/language-provider";

/**
 * Carte des SIÈGES de coopératives (espace exportateur). Chaque coopérative est un POINT
 * — la position exacte de son siège social — jamais une superficie : les parcelles
 * cartographiées vivent sur la page Parcelles. Corrige l'incohérence relevée par Anael
 * (les coopératives apparaissaient comme des polygones de parcelles).
 */

export interface SiegeItem {
  id: string;
  nom: string;
  ville: string;
  region: string;
  /** [lat, lon] du siège. */
  siege: [number, number];
  parcelles: number;
  tauxConformite: number;
  alertes: number;
  /** Ajoutée par l'exportateur (vs portefeuille de démonstration). */
  importee: boolean;
}

/** Recadre la carte sur l'ensemble des sièges + corrige la taille au montage. */
function FitSieges({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      try {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [32, 32] });
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

/** Centre la carte sur le siège sélectionné (lien fiches → carte). */
function PanToSiege({ center, reduce }: { center: [number, number] | null; reduce: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    try {
      const zoom = Math.max(map.getZoom(), 9);
      if (reduce) map.setView(center, zoom);
      else map.flyTo(center, zoom, { duration: 0.8 });
    } catch {
      /* ignoré */
    }
  }, [map, center, reduce]);
  return null;
}

function SiegeMarker({
  item,
  active,
  onSelect,
  lang,
}: {
  item: SiegeItem;
  active: boolean;
  onSelect: (id: string) => void;
  lang: "fr" | "en";
}) {
  const ref = useRef<L.CircleMarker | null>(null);
  useEffect(() => {
    if (active) {
      try {
        ref.current?.bringToFront();
      } catch {
        /* ignoré */
      }
    }
  }, [active]);

  const color = item.alertes > 0 ? "#c8861d" : "#16a34a";
  return (
    <CircleMarker
      ref={ref}
      center={item.siege}
      radius={active ? 11 : 8}
      pathOptions={{
        color: "#ffffff",
        weight: active ? 2.5 : 1.5,
        fillColor: item.importee ? "#e0a64b" : color,
        fillOpacity: 0.95,
      }}
      eventHandlers={{ click: () => onSelect(item.id) }}
    >
      <Tooltip direction="top" offset={[0, -8]} opacity={1}>
        <span className="block text-[0.7rem] font-semibold text-forest-950">{item.nom}</span>
        <span className="block text-[0.65rem] text-stone-600">
          {item.ville} · {item.region}
        </span>
        <span className="block text-[0.65rem] text-stone-600">
          {item.parcelles > 0
            ? lang === "en"
              ? `${item.parcelles} plots · ${item.tauxConformite}% compliant`
              : `${item.parcelles} parcelles · ${item.tauxConformite} % conformes`
            : lang === "en"
              ? "No plot verified yet"
              : "Aucune parcelle vérifiée pour l'instant"}
        </span>
      </Tooltip>
    </CircleMarker>
  );
}

export default function SiegesMap({
  items,
  selectedId,
  onSelect,
}: {
  items: SiegeItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const { lang } = useLanguage();

  const bounds = useMemo(() => {
    if (items.length === 0) return L.latLngBounds([[4.3, -8.6], [7.9, -2.5]]); // Côte d'Ivoire (repli)
    return L.latLngBounds(items.map((i) => i.siege));
  }, [items]);

  const selectedCenter = useMemo(
    () => items.find((i) => i.id === selectedId)?.siege ?? null,
    [items, selectedId],
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <MapContainer bounds={bounds} scrollWheelZoom={false} attributionControl className="h-full w-full" style={{ background: "#0a1f14" }}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagerie © Esri, Maxar, Earthstar Geographics"
          maxZoom={19}
        />
        <LabelsLayer />
        <FitSieges bounds={bounds} />
        <PanToSiege center={selectedCenter} reduce={reduce} />
        {items.map((i) => (
          <SiegeMarker key={i.id} item={i} active={i.id === selectedId} onSelect={onSelect} lang={lang} />
        ))}
      </MapContainer>

      {/* Légende : un point = un siège (jamais une superficie) */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-col gap-1 rounded-xl bg-forest-950/70 px-3 py-2 backdrop-blur-sm">
        <span className="flex items-center gap-2 text-[0.65rem] font-medium text-white/90">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#16a34a" }} aria-hidden />
          {lang === "en" ? "Headquarters (point)" : "Siège (un point)"}
        </span>
        <span className="flex items-center gap-2 text-[0.65rem] font-medium text-white/90">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#c8861d" }} aria-hidden />
          {lang === "en" ? "Active alerts" : "Alertes actives"}
        </span>
        <span className="flex items-center gap-2 text-[0.65rem] font-medium text-white/90">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#e0a64b" }} aria-hidden />
          {lang === "en" ? "Added by you" : "Ajoutée par vous"}
        </span>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-[500]">
        <span className="eyebrow rounded-full bg-forest-950/70 px-3 py-1.5 text-[0.6rem] text-white/90 backdrop-blur-sm">
          {items.length} {lang === "en" ? `cooperative${items.length > 1 ? "s" : ""}` : `coopérative${items.length > 1 ? "s" : ""}`}
        </span>
      </div>
    </div>
  );
}

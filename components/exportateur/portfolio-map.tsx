"use client";

import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, MapContainer, Polygon, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useReducedMotion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/components/language-provider";
import { FILIERE_LABEL, STATUT_LABEL, fmtHa, type Parcelle, type Statut } from "@/data/mock-parcelles";

/** Statuts figés en anglais (mêmes termes que StatusBadge et lib/i18n.ts). */
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

interface Shape {
  p: Parcelle;
  ring: [number, number][] | null; // [lat, lon][]
  center: [number, number]; // [lat, lon]
}

function toShape(p: Parcelle): Shape {
  if (p.geojson.type === "Polygon") {
    const ring = p.geojson.coordinates[0].map(([lon, lat]) => [lat, lon] as [number, number]);
    const cLat = ring.reduce((s, c) => s + c[0], 0) / ring.length;
    const cLon = ring.reduce((s, c) => s + c[1], 0) / ring.length;
    return { p, ring, center: [cLat, cLon] };
  }
  const [lon, lat] = p.geojson.coordinates;
  return { p, ring: null, center: [lat, lon] };
}

/** Recadre la carte sur l'ensemble du portefeuille (au montage) + corrige la taille.
 *  Padding réduit : un cadrage un peu plus serré rend les pastilles lisibles dès l'ouverture. */
function FitBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      try {
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [16, 16] });
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

/** Zoome/centre la carte sur la parcelle sélectionnée (lien tableau→carte). */
function PanToSelected({ center, reduce }: { center: [number, number] | null; reduce: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    try {
      const zoom = Math.max(map.getZoom(), 13);
      if (reduce) map.setView(center, zoom);
      else map.flyTo(center, zoom, { duration: 0.8 });
    } catch {
      /* ignoré */
    }
  }, [map, center, reduce]);
  return null;
}

/** Une parcelle : polygone (détail au zoom) + pastille de statut (toujours visible). */
function ParcelleShape({
  shape,
  active,
  onSelect,
  onHover,
}: {
  shape: Shape;
  active: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const polyRef = useRef<L.Polygon | null>(null);
  const dotRef = useRef<L.CircleMarker | null>(null);
  const { lang } = useLanguage();
  const { p, ring, center } = shape;
  const color = HEX[p.statut];

  useEffect(() => {
    if (active) {
      try {
        polyRef.current?.bringToFront();
        dotRef.current?.bringToFront();
      } catch {
        /* ignoré */
      }
    }
  }, [active]);

  const handlers = {
    click: () => onSelect(p.id),
    mouseover: () => onHover(p.id),
    mouseout: () => onHover(null),
  };

  return (
    <>
      {ring && (
        <Polygon
          ref={polyRef}
          positions={ring}
          pathOptions={{ color, weight: active ? 3 : 1.25, opacity: 1, fillColor: color, fillOpacity: active ? 0.55 : 0.25 }}
          eventHandlers={handlers}
        />
      )}
      <CircleMarker
        ref={dotRef}
        center={center}
        radius={active ? 9 : 6.5}
        pathOptions={{ color: "#ffffff", weight: active ? 2.25 : 1.5, fillColor: color, fillOpacity: 0.95 }}
        eventHandlers={handlers}
      >
        <Tooltip direction="top" offset={[0, -6]} opacity={1}>
          <span className="block text-[0.7rem] font-semibold text-forest-950">{p.producteurNom}</span>
          <span className="block text-[0.65rem] text-stone-600">
            {(lang === "en" ? STATUT_LABEL_EN : STATUT_LABEL)[p.statut]} · {FILIERE_LABEL[p.filiere]} · {fmtHa(p.superficieHa)}
          </span>
        </Tooltip>
      </CircleMarker>
    </>
  );
}

/**
 * Carte satellite du portefeuille (exportateur, Prompt 5). Chaque parcelle est un polygone + une
 * pastille de statut visible à tout niveau de zoom. LIÉE au tableau : cliquer une parcelle la
 * sélectionne (le tableau scrolle vers sa ligne, la carte zoome dessus) ; survoler une ligne du
 * tableau surligne la pastille correspondante.
 */
export default function PortfolioMap({
  parcelles,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: {
  parcelles: Parcelle[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const { lang } = useLanguage();
  const shapes = useMemo(() => parcelles.map(toShape), [parcelles]);

  const bounds = useMemo(() => {
    const pts: [number, number][] = [];
    for (const s of shapes) {
      if (s.ring) pts.push(...s.ring);
      else pts.push(s.center);
    }
    if (pts.length === 0) return L.latLngBounds([[4.3, -8.6], [7.9, -2.5]]); // Côte d'Ivoire (repli)
    return L.latLngBounds(pts);
  }, [shapes]);

  const selectedCenter = useMemo(() => shapes.find((s) => s.p.id === selectedId)?.center ?? null, [shapes, selectedId]);
  const legende: Statut[] = ["conforme", "anomalie", "insuffisant"];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <MapContainer bounds={bounds} scrollWheelZoom={false} attributionControl className="h-full w-full" style={{ background: "#0a1f14" }}>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagerie © Esri, Maxar, Earthstar Geographics"
          maxZoom={19}
        />
        <FitBounds bounds={bounds} />
        <PanToSelected center={selectedCenter} reduce={reduce} />
        {shapes.map((s) => (
          <ParcelleShape
            key={s.p.id}
            shape={s}
            active={s.p.id === selectedId || s.p.id === hoveredId}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </MapContainer>

      {/* Légende (le sens n'est jamais porté par la seule couleur : texte + le tableau reste la source accessible) */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-col gap-1 rounded-xl bg-forest-950/70 px-3 py-2 backdrop-blur-sm">
        {legende.map((statut) => (
          <span key={statut} className="flex items-center gap-2 text-[0.65rem] font-medium text-white/90">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: HEX[statut] }} aria-hidden />
            {(lang === "en" ? STATUT_LABEL_EN : STATUT_LABEL)[statut]}
          </span>
        ))}
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-[500]">
        <span className="eyebrow rounded-full bg-forest-950/70 px-3 py-1.5 text-[0.6rem] text-white/90 backdrop-blur-sm">
          {parcelles.length} {lang === "en" ? `plot${parcelles.length > 1 ? "s" : ""}` : `parcelle${parcelles.length > 1 ? "s" : ""}`}
        </span>
      </div>
    </div>
  );
}

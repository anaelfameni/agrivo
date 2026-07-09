"use client";

import { Polygon, Tooltip } from "react-leaflet";
import { ZONES_SENSIBLES } from "@/data/zones-sensibles";

/**
 * Masque « zones sensibles » : aires protégées / forêts classées (tracés INDICATIFS, sources citées).
 * Couche vectorielle Leaflet rouge hachurée, rendue SOUS les parcelles. Ce n'est jamais un masque de
 * « zones autorisées » (inexistant) — c'est l'inverse : les zones où une parcelle est exclue.
 */
export function ZonesSensiblesLayer({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <>
      {ZONES_SENSIBLES.map((z) => (
        <Polygon
          key={z.nom}
          positions={z.ring.map(([lon, lat]) => [lat, lon] as [number, number])}
          pathOptions={{ color: "#b4231e", weight: 1, opacity: 0.9, fillColor: "#b4231e", fillOpacity: 0.2, dashArray: "5 4" }}
        >
          <Tooltip sticky>
            <span className="block text-[0.7rem] font-semibold text-forest-950">{z.nom}</span>
            <span className="block text-[0.6rem] text-stone-500">{z.source}</span>
          </Tooltip>
        </Polygon>
      ))}
    </>
  );
}

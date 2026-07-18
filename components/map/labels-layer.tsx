"use client";

import { TileLayer } from "react-leaflet";

/**
 * Couche de NOMS DE LIEUX (villes, localités, frontières) posée au-dessus de l'imagerie
 * satellite Esri World_Imagery, qui n'a aucun label. Même fournisseur (Esri) : la couche
 * de référence « World_Boundaries_and_Places » est conçue exactement pour cet usage.
 * À monter APRÈS le TileLayer d'imagerie dans chaque carte.
 */
export function LabelsLayer() {
  return (
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
      attribution="Noms de lieux © Esri"
    />
  );
}

/**
 * Légende compacte à poser en overlay sur une carte (coin bas-gauche par défaut).
 * `items` : libellé + couleur (les couleurs de statut de la charte, ou toute autre série).
 */
export function MapLegend({
  items,
  className = "absolute bottom-3 left-3 z-[500]",
}: {
  items: { label: string; color: string; ring?: boolean }[];
  className?: string;
}) {
  return (
    <div className={`${className} pointer-events-none`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-forest-950/80 px-3 py-1.5 backdrop-blur-sm">
        {items.map((it) => (
          <span key={it.label} className="flex items-center gap-1.5 text-[0.65rem] font-medium text-white/90">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: it.color, boxShadow: it.ring ? `0 0 0 2px ${it.color}44` : undefined }}
            />
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}

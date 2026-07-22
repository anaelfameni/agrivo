import type { Metadata } from "next";
import { PARCELLES } from "@/data/mock-parcelles";
import { findMarketLot, MARKET_LOT_REFS } from "@/data/mock-marketplace";
import { LotDetail } from "@/components/marketplace/lot-detail";

/** Pré-génère les fiches des lots connus du catalogue. */
export function generateStaticParams() {
  return MARKET_LOT_REFS.map((ref) => ({ ref }));
}

export async function generateMetadata({ params }: { params: Promise<{ ref: string }> }): Promise<Metadata> {
  const { ref } = await params;
  const lot = findMarketLot(ref, PARCELLES);
  if (!lot) return { title: "Lot introuvable" };
  return {
    title: lot.nomLot,
    description: `${lot.filiereLabel} · ${lot.tonnage.toFixed(1)} t · ${lot.regions.join(", ")}. Lot conforme évalué par le sceau AGRIVO (carte producteur, polygone hors-déforestation, intégrité de volume).`,
  };
}

export default async function LotPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <LotDetail refLot={ref} />;
}

import type { Metadata } from "next";
import { MarketHeader } from "@/components/marketplace/market-header";
import { MarketFooter } from "@/components/marketplace/market-footer";
import { ActivityTicker } from "@/components/marketplace/activity-ticker";

/**
 * Layout dédié de AGRIVO MARKET.
 * Chrome PROPRE (en-tête + pied dédiés, marque « AGRIVO Market »), détaché du site vitrine et de
 * l'espace applicatif. Thème B2B clair (fond ivoire, accents verts), pleine largeur.
 *
 * Le ruban d'activité est COLLANT EN BAS (sticky) : toujours visible pendant le défilement, il se
 * range naturellement sous le pied de page une fois arrivé tout en bas.
 */
export const metadata: Metadata = {
  title: {
    default: "AGRIVO Market · Lots de cacao conforme vérifié",
    template: "%s · AGRIVO Market",
  },
  description:
    "La place de marché des lots agricoles conformes RDUE, vérifiés par le sceau AGRIVO : carte producteur, polygone hors-déforestation et intégrité de volume. Le commerce des fèves conformes, jamais le financement.",
};

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory text-forest-950">
      <MarketHeader />
      <main className="flex-1">{children}</main>
      <MarketFooter />
      <ActivityTicker />
    </div>
  );
}

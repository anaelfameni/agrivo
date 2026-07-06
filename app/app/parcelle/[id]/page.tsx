import { notFound } from "next/navigation";
import { ParcelleDetail } from "@/components/app/parcelle-detail";
import { analyserRisque, evaluerValorisation, resumerChangementSatellite } from "@/lib/ai/gemini";
import { getParcelle } from "@/data/mock-parcelles";

/**
 * Page serveur : charge la parcelle et fait les calculs IA côté serveur (risque, valorisation,
 * lecture satellite), puis délègue tout le rendu à l'îlot client bilingue <ParcelleDetail>.
 */
export default async function ParcelleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parcelle = getParcelle(id);
  if (!parcelle) notFound();

  return (
    <ParcelleDetail
      parcelle={parcelle}
      risk={analyserRisque(parcelle)}
      valorisation={evaluerValorisation(parcelle)}
      changement={resumerChangementSatellite(parcelle)}
    />
  );
}

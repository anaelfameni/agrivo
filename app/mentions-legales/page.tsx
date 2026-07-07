import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal/legal-shell";
import { BRAND_NAME } from "@/config/brand";

export const metadata: Metadata = {
  title: `Mentions légales · ${BRAND_NAME}`,
  description: "Mentions légales de la plateforme AGRIVO.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalShell title="Mentions légales" updated="7 juillet 2026">
      <LegalSection title="Éditeur">
        <p>
          Le site AGRIVO est édité par l&apos;équipe du projet AGRIVO. La société est en cours de
          constitution : la raison sociale, la forme juridique, le capital et le numéro
          d&apos;immatriculation au RCCM (Registre du Commerce et du Crédit Mobilier de Côte
          d&apos;Ivoire) seront publiés sur cette page à l&apos;issue de l&apos;immatriculation.
        </p>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>Anael Fameni, chef de projet AGRIVO.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>Par la page contact du site. Une adresse e-mail dédiée sera publiée avec les coordonnées définitives de la société.</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis. Les traitements de données à caractère personnel et leur localisation sont décrits dans la politique de confidentialité.</p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>La marque « Agrivo », le logo et l&apos;ensemble des contenus du site sont protégés. Toute reproduction sans autorisation est interdite. Les données satellites proviennent de sources tierces reconnues (Whisp/FAO, Copernicus), citées à titre informatif.</p>
      </LegalSection>

      <LegalSection title="Statut réglementaire">
        <p>AGRIVO est un fournisseur de logiciel (sous-traitant technologique B2B). AGRIVO n&apos;est pas un établissement de crédit et ne détient aucun agrément financier délivré par la BCEAO.</p>
      </LegalSection>
    </LegalShell>
  );
}

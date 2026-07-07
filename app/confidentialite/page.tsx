import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal/legal-shell";
import { BRAND_NAME } from "@/config/brand";

export const metadata: Metadata = {
  title: `Politique de confidentialité · ${BRAND_NAME}`,
  description: "Comment AGRIVO collecte, traite et protège les données, dans le respect de la loi ivoirienne n°2013-450 (ARTCI).",
};

export default function ConfidentialitePage() {
  return (
    <LegalShell
      title="Politique de confidentialité"
      updated="4 juillet 2026"
      intro="AGRIVO traite des données à caractère personnel dans le respect de la loi ivoirienne n°2013-450 relative à la protection des données à caractère personnel et sous le contrôle de l'ARTCI. Cette page explique quelles données nous traitons, pourquoi, et quels sont vos droits."
    >
      <LegalSection title="1. Données que nous traitons">
        <p>Dans le cadre de la vérification de conformité RDUE, nous traitons notamment :</p>
        <ul className="list-disc pl-5">
          <li>l&apos;identité du producteur (nom, numéro de carte professionnelle) ;</li>
          <li>la géolocalisation et le contour de la parcelle (coordonnées GPS, GeoJSON) ;</li>
          <li>les informations de la coopérative et de son gérant (contact professionnel) ;</li>
          <li>les résultats d&apos;évaluation et les certificats générés.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Finalités">
        <p>Ces données servent uniquement à : évaluer la conformité RDUE d&apos;une parcelle, générer un certificat prêt pour une déclaration TRACES NT, et — avec le consentement du producteur — constituer le dossier de conformité que la coopérative partage avec son exportateur.</p>
      </LegalSection>

      <LegalSection title="3. Base légale et consentement">
        <p>Le traitement repose sur le <strong>consentement explicite</strong> du producteur, recueilli avant toute vérification, et sur l&apos;intérêt légitime de l&apos;exportateur à démontrer sa conformité réglementaire. Le producteur peut retirer son consentement à tout moment.</p>
      </LegalSection>

      <LegalSection title="4. Rôle d'AGRIVO">
        <p>AGRIVO agit comme <strong>sous-traitant technologique</strong> (fournisseur de logiciel B2B) pour le compte des coopératives et exportateurs. AGRIVO ne détient aucun agrément financier et ne produit aucun scoring de crédit : les données servent exclusivement à la conformité et à sa valorisation commerciale.</p>
      </LegalSection>

      <LegalSection title="5. Souveraineté et hébergement des données">
        <p>Nous privilégions la souveraineté des données conformément aux exigences de l&apos;ARTCI. Pendant la phase pilote, l&apos;hébergement applicatif est assuré par Vercel Inc. (États-Unis) ; le registre des traitements et la liste des sous-traitants techniques sont tenus à jour en interne et communiqués sur demande via la page contact.</p>
      </LegalSection>

      <LegalSection title="6. Durée de conservation">
        <p>Les données sont conservées le temps nécessaire à la conformité réglementaire (le RDUE impose une traçabilité pluriannuelle), puis archivées ou supprimées. Les données du pilote de démonstration sont purgées à la fin du pilote ; le détail des durées par catégorie est tenu dans notre registre des traitements, disponible sur demande.</p>
      </LegalSection>

      <LegalSection title="7. Vos droits">
        <p>Conformément à la loi n°2013-450, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;opposition et d&apos;effacement. Pour l&apos;exercer, écrivez-nous depuis la page contact. Vous pouvez également saisir l&apos;ARTCI.</p>
      </LegalSection>

      <LegalSection title="8. Sécurité">
        <p>Les accès sont protégés (authentification, journalisation), les clés d&apos;API sont injectées côté serveur et ne transitent jamais par le navigateur, et les échanges satellites reposent sur des sources reconnues (Whisp/FAO, Copernicus).</p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>Un délégué à la protection des données sera désigné avec l&apos;immatriculation de la société. Dans l&apos;intervalle, l&apos;équipe AGRIVO répond à toute demande relative aux données via la page contact.</p>
      </LegalSection>
    </LegalShell>
  );
}

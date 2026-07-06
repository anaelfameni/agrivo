import type { Metadata } from "next";
import { LegalShell, LegalSection, Todo } from "@/components/legal/legal-shell";
import { BRAND_NAME } from "@/config/brand";

export const metadata: Metadata = {
  title: `Conditions d'utilisation · ${BRAND_NAME}`,
  description: "Conditions générales d'utilisation de la plateforme AGRIVO de conformité RDUE.",
};

export default function CguPage() {
  return (
    <LegalShell
      title="Conditions générales d'utilisation"
      updated="4 juillet 2026"
      intro="Les présentes conditions régissent l'accès et l'usage de la plateforme AGRIVO. En créant un compte, vous les acceptez."
    >
      <LegalSection title="1. Objet">
        <p>AGRIVO est une plateforme logicielle d&apos;aide à la conformité au règlement européen sur la déforestation (RDUE). Elle permet de vérifier des parcelles par satellite, de générer des certificats et de constituer le dossier de conformité que la coopérative fait valoir auprès de ses acheteurs.</p>
      </LegalSection>

      <LegalSection title="2. Compte et responsabilités">
        <p>Vous êtes responsable de la confidentialité de vos identifiants et de l&apos;exactitude des données saisies. Vous vous engagez à recueillir le consentement des producteurs avant toute vérification.</p>
      </LegalSection>

      <LegalSection title="3. Nature de l'évaluation">
        <p>AGRIVO fournit une <strong>évaluation</strong> de conformité, non une garantie. Chaque parcelle reçoit l&apos;un de trois verdicts : <strong>Conforme</strong>, <strong>Anomalie détectée</strong> ou <strong>Données insuffisantes</strong>. La décision réglementaire finale relève de l&apos;opérateur qui met le produit sur le marché.</p>
      </LegalSection>

      <LegalSection title="4. Gratuité pour le producteur">
        <p>Le service AGRIVO est gratuit pour le producteur : la vérification est prise en charge par l&apos;abonnement de sa coopérative. AGRIVO n&apos;est pas un établissement de crédit et ne propose <strong>aucun financement</strong> : la conformité se valorise par les primes et l&apos;accès aux marchés.</p>
      </LegalSection>

      <LegalSection title="5. Disponibilité et niveau de service">
        <p>Nous nous efforçons d&apos;assurer une disponibilité continue. Les engagements de niveau de service (SLA) applicables aux offres API exportateur sont précisés au contrat.</p>
      </LegalSection>

      <LegalSection title="6. Propriété intellectuelle">
        <p>La plateforme, sa marque et son code sont la propriété d&apos;AGRIVO. Les données que vous saisissez restent les vôtres ; vous nous concédez une licence d&apos;usage strictement nécessaire à la fourniture du service.</p>
      </LegalSection>

      <LegalSection title="7. Limitation de responsabilité">
        <p>AGRIVO ne saurait être tenu responsable des décisions prises par des tiers (douanes, importateurs, institutions financières) sur la base d&apos;une évaluation, ni des indisponibilités des sources satellites externes.</p>
      </LegalSection>

      <LegalSection title="8. Résiliation">
        <p>Vous pouvez fermer votre compte à tout moment. Nous pouvons suspendre un accès en cas d&apos;usage frauduleux ou contraire aux présentes conditions.</p>
      </LegalSection>

      <LegalSection title="9. Droit applicable">
        <p>Les présentes conditions sont régies par le droit ivoirien. Tout litige relève des juridictions compétentes de <Todo>ville du siège</Todo>, après recherche d&apos;une solution amiable.</p>
      </LegalSection>
    </LegalShell>
  );
}

/**
 * Argumentaire de prime (module PUR, testé) — étape Valorisation.
 *
 * Rédige le brief de négociation que le gérant de coopérative apporte à son exportateur : la
 * conformité prouvée du portefeuille devient un argument commercial. Les FAITS sont 100 %
 * déterministes (statistiques calculées sur les données) + faits de marché SOURCÉS (guide démo,
 * vérifiés en ligne le 6 juillet 2026). En mode LIVE, Gemini ne fait que la mise en mots
 * (route /api/gemini/valorisation-memo).
 *
 * Charte : primes négociées AU-DESSUS du prix garanti par l'État (jamais « négocier le prix ») ;
 * aucun montant de prime inventé ni promis ; aucun crédit, score financier ni plafond ;
 * « évaluation », jamais « garantie » de conformité.
 */

import { fmtHa, parcellesForCoop, type Parcelle } from "@/data/mock-parcelles";

export interface ArgumentairePrime {
  titre: string;
  paragraphes: string[];
  /** true si la rédaction vient de Gemini (rempli par la route). */
  live?: boolean;
}

/** Faits de marché sourcés (GUIDE_DEMO_JURY.md, vérifiés 2026-07-06). Jamais présentés comme des promesses. */
export const FAITS_MARCHE = {
  fairtrade: {
    fr: "la prime Fairtrade cacao passe à 250 €/t en Côte d'Ivoire au 1er octobre 2026, dont 40 % versés en cash directement aux membres",
    en: "the Fairtrade cocoa premium rises to €250/t in Côte d'Ivoire on 1 October 2026, 40% of which is paid in cash directly to members",
  },
  convergence: {
    fr: "carte du producteur obligatoire au 1er septembre 2026, prime Fairtrade en cash au 1er octobre 2026, RDUE au 30 décembre 2026 : trois échéances sur la même campagne",
    en: "producer card mandatory on 1 September 2026, Fairtrade cash premium on 1 October 2026, EUDR on 30 December 2026: three deadlines in the same season",
  },
} as const;

/**
 * Argumentaire DÉTERMINISTE (repli sans clé et trame des faits pour Gemini).
 * `coop` = parcelles de la coopérative de `p` (par défaut, calculées depuis les données).
 */
export function genererArgumentairePrime(
  p: Parcelle,
  coop: Parcelle[] = parcellesForCoop(p.cooperative),
  lang: "fr" | "en" = "fr",
): ArgumentairePrime {
  const fr = lang === "fr";
  const conformes = coop.filter((x) => x.statut === "conforme");
  const haConformes = conformes.reduce((s, x) => s + x.superficieHa, 0);
  const haStr = fmtHa(Math.round(haConformes * 10) / 10);

  const titre = fr
    ? `Argumentaire de prime · ${p.cooperative}`
    : `Premium negotiation brief · ${p.cooperative}`;

  const paragraphes = fr
    ? [
        `Notre coopérative présente un portefeuille dont la conformité est prouvée parcelle par parcelle : ${conformes.length} parcelles évaluées Conforme sur ${coop.length} vérifiées, soit ${haStr} de superficie vérifiée par satellite (méthode Whisp, FAO). La parcelle de ${p.producteurNom} vient de rejoindre ce dossier avec le certificat ${p.numeroCertificat}, vérifiable publiquement par QR code par n'importe quel acheteur.`,
        `Chaque parcelle du dossier est accompagnée de sa géolocalisation au format exigé par la réglementation (WGS-84, 6 décimales), de ses sources satellites et de son évaluation de conformité : les éléments de diligence sont prêts pour TRACES NT, sans travail supplémentaire pour votre équipe.`,
        `Ce niveau de preuve arrive au bon moment : ${FAITS_MARCHE.convergence.fr}. Et ${FAITS_MARCHE.fairtrade.fr}. Un portefeuille prouvé conforme est la pièce maîtresse pour négocier les primes de durabilité au-dessus du prix garanti par l'État, et pour accéder aux acheteurs les plus exigeants.`,
        `Nous proposons d'inscrire cette preuve de conformité dans notre relation commerciale : accès continu à notre dossier de valorisation, certificats vérifiables sur chaque lot, et complément des parcelles restantes selon notre plan d'action de mise en conformité.`,
      ]
    : [
        `Our cooperative presents a portfolio whose compliance is proven plot by plot: ${conformes.length} plots assessed Compliant out of ${coop.length} verified, i.e. ${haStr} of satellite-verified area (Whisp method, FAO). ${p.producteurNom}'s plot has just joined this file with certificate ${p.numeroCertificat}, publicly verifiable by QR code by any buyer.`,
        `Every plot in the file comes with its geolocation in the format required by the regulation (WGS-84, 6 decimals), its satellite sources and its compliance assessment: the due-diligence elements are ready for TRACES NT, with no extra work for your team.`,
        `This level of proof arrives at the right time: ${FAITS_MARCHE.convergence.en}. And ${FAITS_MARCHE.fairtrade.en}. A portfolio proven compliant is the cornerstone for negotiating sustainability premiums above the state-guaranteed farm-gate price, and for reaching the most demanding buyers.`,
        `We propose to anchor this proof of compliance in our commercial relationship: continuous access to our valorisation file, verifiable certificates on every lot, and completion of the remaining plots according to our compliance action plan.`,
      ];

  return { titre, paragraphes };
}

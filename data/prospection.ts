/**
 * CRM de prospection interne : le pipeline des 109 licenciés export 2025-26 (Reuters), dont
 * ~44 coopératives exportatrices (Ecofin), persona prioritaire de l'étude de marché.
 *
 * ⚠️ Les fiches ci-dessous sont des GABARITS ANONYMISÉS (segment, région, taille indicative) :
 * aucun nom réel d'entreprise n'est seedé (charte : jamais de fausse preuve sociale). L'équipe
 * remplace chaque gabarit par la vraie cible au fil de la prospection ; les éditions vivent en
 * localStorage (lib/prospection-locale via la page), jamais dans ce module PUR.
 */

export type SegmentProspect = "cooperative-exportatrice" | "negociant-national" | "filiale-trader";
export type StatutPipeline = "a-contacter" | "contacte" | "entretien-planifie" | "entretien-fait" | "proposition" | "client";

export const STATUTS_PIPELINE: StatutPipeline[] = [
  "a-contacter",
  "contacte",
  "entretien-planifie",
  "entretien-fait",
  "proposition",
  "client",
];

export const STATUT_PIPELINE_LABEL: Record<StatutPipeline, { fr: string; en: string }> = {
  "a-contacter": { fr: "À contacter", en: "To contact" },
  "contacte": { fr: "Contacté", en: "Contacted" },
  "entretien-planifie": { fr: "Entretien planifié", en: "Interview scheduled" },
  "entretien-fait": { fr: "Entretien fait", en: "Interview done" },
  "proposition": { fr: "Proposition envoyée", en: "Proposal sent" },
  "client": { fr: "Client", en: "Client" },
};

export const SEGMENT_LABEL: Record<SegmentProspect, { fr: string; en: string }> = {
  "cooperative-exportatrice": { fr: "Coopérative exportatrice", en: "Exporting cooperative" },
  "negociant-national": { fr: "Négociant national", en: "National trader" },
  "filiale-trader": { fr: "Filiale de trader international", en: "International trader subsidiary" },
};

export interface Prospect {
  id: string;
  /** Gabarit anonymisé, à remplacer par la vraie cible (« Coop export · Nawa n°1 »). */
  nom: string;
  segment: SegmentProspect;
  region: string;
  /** Pourquoi cette cible d'abord (angle d'attaque issu de l'étude). */
  angle: { fr: string; en: string };
  statut: StatutPipeline;
}

/**
 * Seed du pipeline : les 15 premiers gabarits, priorisés selon l'étude (coops exportatrices
 * d'abord : elles réunissent l'offre ET la vente ; puis négociants hors programmes traders).
 */
export const PROSPECTS_SEED: Prospect[] = [
  { id: "pr01", nom: "Coop export · Nawa n°1", segment: "cooperative-exportatrice", region: "Nawa (Soubré)", angle: { fr: "Bassin cacao n°1 ; persona idéal offre + vente.", en: "Top cocoa basin; ideal supply + sales persona." }, statut: "a-contacter" },
  { id: "pr02", nom: "Coop export · Nawa n°2", segment: "cooperative-exportatrice", region: "Nawa (Méagui)", angle: { fr: "Coopérative déjà certifiée : registre existant à auditer.", en: "Already certified co-op: existing register to audit." }, statut: "a-contacter" },
  { id: "pr03", nom: "Coop export · San-Pédro n°1", segment: "cooperative-exportatrice", region: "San-Pédro", angle: { fr: "Proximité du port : cycle logistique court.", en: "Close to the port: short logistics cycle." }, statut: "a-contacter" },
  { id: "pr04", nom: "Coop export · Haut-Sassandra n°1", segment: "cooperative-exportatrice", region: "Haut-Sassandra (Daloa)", angle: { fr: "Grosse zone de flux indirects : la douleur chaîne de possession.", en: "Large indirect-flow area: chain-of-custody pain." }, statut: "a-contacter" },
  { id: "pr05", nom: "Coop export · Gôh n°1", segment: "cooperative-exportatrice", region: "Gôh (Gagnoa)", angle: { fr: "Réconciliation de volumes : cas d'usage sentinelle.", en: "Volume reconciliation: sentinel use case." }, statut: "a-contacter" },
  { id: "pr06", nom: "Coop export · Indénié n°1", segment: "cooperative-exportatrice", region: "Indénié-Djuablin (Abengourou)", angle: { fr: "Zone Est, moins couverte par les programmes traders.", en: "Eastern zone, less covered by trader programmes." }, statut: "a-contacter" },
  { id: "pr07", nom: "Coop export · Cavally n°1", segment: "cooperative-exportatrice", region: "Cavally (Guiglo)", angle: { fr: "Données terrain peu fiables documentées : besoin d'audit.", en: "Documented unreliable field data: audit need." }, statut: "a-contacter" },
  { id: "pr08", nom: "Coop export · La Mé n°1", segment: "cooperative-exportatrice", region: "La Mé (Adzopé)", angle: { fr: "Proximité Abidjan : entretien facile à organiser.", en: "Near Abidjan: easy to schedule an interview." }, statut: "a-contacter" },
  { id: "pr09", nom: "Négociant national · Abidjan n°1", segment: "negociant-national", region: "Abidjan", angle: { fr: "Dépose des DDS : acheteur direct du dossier lot scellé.", en: "Files DDS: direct buyer of the sealed-lot file." }, statut: "a-contacter" },
  { id: "pr10", nom: "Négociant national · Abidjan n°2", segment: "negociant-national", region: "Abidjan", angle: { fr: "Sourcing multi-régions : besoin de sceau standardisé.", en: "Multi-region sourcing: needs a standard seal." }, statut: "a-contacter" },
  { id: "pr11", nom: "Négociant national · San-Pédro n°1", segment: "negociant-national", region: "San-Pédro", angle: { fr: "Export en volume : sensibilité prix de la commission.", en: "Volume exporter: commission price sensitivity." }, statut: "a-contacter" },
  { id: "pr12", nom: "Négociant national · San-Pédro n°2", segment: "negociant-national", region: "San-Pédro", angle: { fr: "Flux indirects majoritaires : la cible chaîne de possession.", en: "Mostly indirect flows: chain-of-custody target." }, statut: "a-contacter" },
  { id: "pr13", nom: "Filiale trader · Abidjan n°1", segment: "filiale-trader", region: "Abidjan", angle: { fr: "A déjà sa traçabilité interne : tester le discours partenaire.", en: "Has in-house traceability: test the partner pitch." }, statut: "a-contacter" },
  { id: "pr14", nom: "Coop export · Tonkpi n°1 (café)", segment: "cooperative-exportatrice", region: "Tonkpi (Man)", angle: { fr: "Café RDUE : même moteur, deuxième filière de preuve.", en: "EUDR coffee: same engine, second proof commodity." }, statut: "a-contacter" },
  { id: "pr15", nom: "Coop export · Sud-Comoé n°1 (hévéa)", segment: "cooperative-exportatrice", region: "Sud-Comoé (Aboisso)", angle: { fr: "Hévéa : la démo d'extension notée dans l'étude.", en: "Rubber: the expansion demo flagged in the study." }, statut: "a-contacter" },
];

/** Répartition du pipeline par statut (compteurs de l'entonnoir). */
export function statsPipeline(prospects: Prospect[]): Record<StatutPipeline, number> {
  const out = Object.fromEntries(STATUTS_PIPELINE.map((s) => [s, 0])) as Record<StatutPipeline, number>;
  for (const p of prospects) out[p.statut] += 1;
  return out;
}

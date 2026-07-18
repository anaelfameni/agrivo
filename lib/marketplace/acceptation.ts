/**
 * Suivi d'acceptation du dossier DDS par l'opérateur européen. C'est la North Star d'AGRIVO :
 * « tonnes couvertes par des dossiers acceptés par l'opérateur responsable ». Un dossier
 * préparé ne vaut que s'il est ACCEPTÉ par l'opérateur qui dépose la DDS (le premier metteur
 * sur le marché de l'Union, en général l'importateur européen, art. 2 et 7 du règlement
 * (UE) 2023/1115).
 *
 * Module PUR (aucun "use client") : importable serveur, client et tests. L'acceptation est
 * DÉCLARÉE par les équipes de l'exportateur (comme les jalons logistiques) : AGRIVO trace la
 * déclaration, il n'emporte aucune décision de conformité de l'opérateur.
 */

import { EXPEDITIONS, tonnageExpedition, type Expedition } from "@/data/mock-expeditions";
import { construireDossierDds } from "@/lib/marketplace/dds-dossier";
import type { Parcelle } from "@/data/mock-parcelles";

export type StatutAcceptation = "non-transmis" | "transmis" | "accepte" | "reserves";

export interface AcceptationDds {
  statut: StatutAcceptation;
  /** Nom de l'opérateur destinataire (saisi par l'exportateur). */
  operateur?: string;
  /** Date ISO de la dernière déclaration. */
  date?: string;
}

export const ACCEPTATION_LABEL: Record<StatutAcceptation, { fr: string; en: string }> = {
  "non-transmis": { fr: "Non transmis", en: "Not sent" },
  transmis: { fr: "Transmis à l'opérateur", en: "Sent to the operator" },
  accepte: { fr: "Accepté par l'opérateur", en: "Accepted by the operator" },
  reserves: { fr: "Réserves émises", en: "Reservations raised" },
};

/**
 * Transitions autorisées : on ne peut transmettre qu'un dossier PRÊT (même doctrine de gating
 * qu'`estVendable` : le produit ne laisse pas partir un dossier incomplet) ; l'issue (accepté
 * ou réserves) ne se déclare qu'après transmission. Un dossier avec réserves peut être
 * retransmis après correction.
 */
export function transitionsPossibles(statut: StatutAcceptation, dossierPret: boolean): StatutAcceptation[] {
  if (statut === "non-transmis") return dossierPret ? ["transmis"] : [];
  if (statut === "transmis") return ["accepte", "reserves"];
  if (statut === "reserves") return dossierPret ? ["transmis"] : [];
  return []; // accepté : état final pour l'expédition courante
}

/**
 * Déclarations de démonstration (mêmes seeds assumés que le reste de la plateforme) :
 * EXP-2026-0001 (dossier complet) accepté ; EXP-2026-0002 transmis, en attente de retour.
 * Tout le reste : non transmis.
 */
export const ACCEPTATIONS_DEMO: Record<string, AcceptationDds> = {
  "EXP-2026-0001": { statut: "accepte", operateur: "Importateur UE (démonstration)", date: "2026-07-16" },
  "EXP-2026-0002": { statut: "transmis", operateur: "Importateur UE (démonstration)", date: "2026-07-17" },
};

export function acceptationPour(ref: string, acceptations: Record<string, AcceptationDds> = ACCEPTATIONS_DEMO): AcceptationDds {
  return acceptations[ref] ?? { statut: "non-transmis" };
}

/**
 * La North Star : tonnes couvertes par des dossiers DDS acceptés par l'opérateur. Un dossier
 * n'est compté que s'il est à la fois DÉCLARÉ accepté ET réellement complet (recalcul : jamais
 * de tonne comptée sur un dossier qui ne passerait plus ses vérifications).
 */
export function tonnesDossiersAcceptes(
  toutesParcelles: Parcelle[],
  acceptations: Record<string, AcceptationDds> = ACCEPTATIONS_DEMO,
  expeditions: Expedition[] = EXPEDITIONS,
): number {
  let total = 0;
  for (const exp of expeditions) {
    if (acceptationPour(exp.ref, acceptations).statut !== "accepte") continue;
    if (!construireDossierDds(exp, toutesParcelles).pret) continue;
    total += tonnageExpedition(exp);
  }
  return Math.round(total * 10) / 10;
}

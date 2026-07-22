/**
 * Surveillance continue du portefeuille : la conformité RDUE n'est pas un instantané, c'est une
 * obligation CONTINUE de l'opérateur. Chaque parcelle vérifiée porte donc une date de prochaine
 * revue (cadence trimestrielle : les signaux satellite évoluent avec les saisons et les
 * campagnes), et le portefeuille remonte les parcelles à re-vérifier et les alertes actives.
 *
 * Module PUR (aucun "use client") : évalue depuis le référentiel passé, n'invente rien.
 * La re-vérification elle-même passe par le parcours existant (analyse satellite Whisp/FAO) :
 * ce module dit QUAND revoir, jamais un verdict à la place de l'analyse.
 */

import { type Parcelle, type Statut } from "@/data/mock-parcelles";

/** Cadence de revue : 90 jours (une revue par trimestre de campagne). */
export const CADENCE_REVUE_JOURS = 90;

export type EtatVeille = "a-jour" | "revue-due" | "alerte";

export interface VeilleParcelle {
  parcelleId: string;
  producteurNom: string;
  cooperative: string;
  statut: Statut;
  etat: EtatVeille;
  /** Date ISO de la dernière vérification. */
  verifieLe: string;
  /** Date ISO à laquelle la prochaine revue est due. */
  prochaineRevue: string;
  /** Jours de retard sur la cadence (0 si à jour). */
  joursRetard: number;
}

export interface ResumeVeille {
  total: number;
  aJour: number;
  revueDue: number;
  alertes: number;
  /** Les parcelles à traiter (alertes d'abord, puis retard décroissant). */
  aTraiter: VeilleParcelle[];
}

function plusJours(iso: string, jours: number): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00Z" : ""));
  d.setUTCDate(d.getUTCDate() + jours);
  return d.toISOString().slice(0, 10);
}

function joursEntre(aIso: string, b: Date): number {
  const a = new Date(aIso + (aIso.length === 10 ? "T00:00:00Z" : "")).getTime();
  return Math.floor((b.getTime() - a) / 86_400_000);
}

/** Évalue l'état de veille d'une parcelle : alerte active > revue due > à jour. */
export function veilleParcelle(p: Parcelle, maintenant: Date): VeilleParcelle {
  const prochaineRevue = plusJours(p.dateVerification, CADENCE_REVUE_JOURS);
  const retard = Math.max(0, joursEntre(p.dateVerification, maintenant) - CADENCE_REVUE_JOURS);
  const etat: EtatVeille = p.alerteActive ? "alerte" : retard > 0 ? "revue-due" : "a-jour";
  return {
    parcelleId: p.id,
    producteurNom: p.producteurNom,
    cooperative: p.cooperative,
    statut: p.statut,
    etat,
    verifieLe: p.dateVerification,
    prochaineRevue,
    joursRetard: retard,
  };
}

/** Évalue tout le portefeuille et classe ce qui est à traiter. */
export function evaluerVeille(parcelles: Parcelle[], maintenant: Date = new Date()): ResumeVeille {
  const lignes = parcelles.map((p) => veilleParcelle(p, maintenant));
  const aTraiter = lignes
    .filter((l) => l.etat !== "a-jour")
    .sort((a, b) => (a.etat === b.etat ? b.joursRetard - a.joursRetard : a.etat === "alerte" ? -1 : 1));
  return {
    total: lignes.length,
    aJour: lignes.filter((l) => l.etat === "a-jour").length,
    revueDue: lignes.filter((l) => l.etat === "revue-due").length,
    alertes: lignes.filter((l) => l.etat === "alerte").length,
    aTraiter,
  };
}

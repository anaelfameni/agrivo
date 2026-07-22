/**
 * « Conformité de ma campagne » : l'agrégat qui répond en un coup d'œil à LA question de
 * l'exportateur avant l'échéance RDUE : « suis-je prêt pour la campagne 2026-27 ? ».
 * Recalculé depuis les lots du marché (sceau 5 gages + sentinelle de volume), jamais inventé.
 * Module PUR (aucun "use client") : importable côté serveur, client et tests.
 */

import { estVendable, findMarketExpedition, lotsMarche, type MarketLot } from "@/data/mock-marketplace";
import { possessionComplete } from "@/data/mock-expeditions";
import { construireDossierDds } from "@/lib/marketplace/dds-dossier";
import { ACCEPTATIONS_DEMO, tonnesDossiersAcceptes, type AcceptationDds } from "@/lib/marketplace/acceptation";
import type { Parcelle } from "@/data/mock-parcelles";

export const ECHEANCE_RDUE = "2026-12-30";

export interface ActionCampagne {
  /** Référence du lot concerné. */
  ref: string;
  detail: { fr: string; en: string };
}

export interface EtatCampagne {
  totalLots: number;
  lotsScelles: number;
  lotsVendables: number;
  /** Lots dont le dossier DDS est complet (toutes les vérifications du dossier réunies). */
  dossiersDdsPrets: number;
  /**
   * North Star : tonnes couvertes par des dossiers DDS acceptés par l'opérateur européen
   * (déclaré accepté ET dossier recalculé complet).
   */
  tonnesDossiersAcceptes: number;
  tonnageScelle: number;
  /** Anomalies bloquantes ouvertes (sentinelle de volume), tous lots confondus. */
  alertesBloquantes: number;
  /** Jours restants avant l'échéance RDUE grands opérateurs. */
  joursRestants: number;
  /** Les prochaines actions concrètes, lot par lot (jamais un score, toujours un geste). */
  actions: ActionCampagne[];
}

export function joursAvant(dateIso: string, maintenant: Date): number {
  return Math.max(0, Math.ceil((new Date(dateIso).getTime() - maintenant.getTime()) / 86_400_000));
}

/** Les actions qui débloquent un lot donné (vide si le lot est scellé et sain). */
export function actionsPourLot(lot: MarketLot): ActionCampagne[] {
  const actions: ActionCampagne[] = [];
  if (!possessionComplete(lot.journalPossession)) {
    actions.push({
      ref: lot.ref,
      detail: {
        fr: `${lot.ref} : compléter le registre de possession (un maillon amont manque au dossier).`,
        en: `${lot.ref}: complete the chain-of-custody register (an upstream link is missing).`,
      },
    });
  }
  for (const a of lot.alertesVolume) {
    if (a.bloquant) actions.push({ ref: lot.ref, detail: a.detail });
  }
  const criteresKo = lot.sceau.criteres.filter((c) => !c.ok && c.code !== "chaine-possession");
  for (const c of criteresKo) {
    actions.push({ ref: lot.ref, detail: { fr: `${lot.ref} : ${c.fr}`, en: `${lot.ref}: ${c.en}` } });
  }
  return actions;
}

/** Agrège l'état de campagne depuis le référentiel passé (pur/testable). */
export function etatCampagne(
  toutesParcelles: Parcelle[],
  maintenant: Date = new Date(),
  acceptations: Record<string, AcceptationDds> = ACCEPTATIONS_DEMO,
): EtatCampagne {
  const lots = lotsMarche(toutesParcelles);
  const scelles = lots.filter((l) => l.sceau.statut === "verifie");
  return {
    totalLots: lots.length,
    lotsScelles: scelles.length,
    lotsVendables: lots.filter(estVendable).length,
    dossiersDdsPrets: lots.filter((l) => {
      const exp = findMarketExpedition(l.ref);
      return exp ? construireDossierDds(exp, toutesParcelles).pret : false;
    }).length,
    tonnesDossiersAcceptes: tonnesDossiersAcceptes(toutesParcelles, acceptations),
    tonnageScelle: Math.round(scelles.reduce((s, l) => s + l.tonnage, 0) * 10) / 10,
    alertesBloquantes: lots.reduce((s, l) => s + l.alertesVolume.filter((a) => a.bloquant).length, 0),
    joursRestants: joursAvant(ECHEANCE_RDUE, maintenant),
    actions: lots.flatMap(actionsPourLot),
  };
}

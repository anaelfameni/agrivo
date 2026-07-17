/**
 * Sentinelle de volume — le verrou anti « blanchiment de cacao » au niveau du lot.
 *
 * Le RDUE interdit le bilan de masse : un lot vendu comme conforme ne doit contenir QUE des fèves
 * dont l'origine est tracée. La sentinelle recalcule, depuis les seules données du lot, trois
 * incohérences de volume qui trahiraient un mélange de flux :
 *   1. « depassement-plafond » : un prélèvement dépasse le plafond agronomique d'une parcelle
 *      (superficie × rendement régional) — plus de fèves que la terre ne peut produire ;
 *   2. « ecart-pesee » : la pesée finale ne correspond pas au tonnage composé du lot ;
 *   3. « connaissement-duplique » : un même numéro de connaissement couvre deux remises (le
 *      même document ne peut justifier deux volumes différents).
 *
 * Chaque anomalie bloquante interdit le scellage / la publication du lot (le bouton reste
 * désactivé), exactement comme `composerExpedition` refuse une composition non conforme.
 * Module PUR (aucun "use client") : importable côté serveur, client et tests.
 */

import {
  plafondTonnes,
  tonnageExpedition,
  type Expedition,
} from "@/data/mock-expeditions";
import { type Parcelle } from "@/data/mock-parcelles";

export type CategorieAnomalie = "depassement-plafond" | "ecart-pesee" | "connaissement-duplique";

export interface AnomalieVolume {
  categorie: CategorieAnomalie;
  detail: { fr: string; en: string };
  /** true = interdit le scellage / la publication tant que l'anomalie est ouverte. */
  bloquant: boolean;
}

export interface SentinelleResultat {
  anomalies: AnomalieVolume[];
  /** true dès qu'une anomalie bloquante est ouverte. */
  bloquant: boolean;
}

/** Écart de pesée toléré entre la pesée finale et le tonnage composé (8 %, plancher 0,1 t). */
export const TOLERANCE_PESEE = 0.08;

function t2(n: number): string {
  return n.toFixed(2);
}

/**
 * Évalue la sentinelle de volume d'un lot (expédition + référentiel de parcelles). Ne jette
 * jamais : retourne la liste exacte des anomalies, affichable telle quelle à l'écran.
 */
export function evaluerSentinelleVolume(exp: Expedition, toutesParcelles: Parcelle[]): SentinelleResultat {
  const anomalies: AnomalieVolume[] = [];
  const parcelles = exp.parcelleIds
    .map((id) => toutesParcelles.find((p) => p.id === id))
    .filter((p): p is Parcelle => Boolean(p));

  // 1. Dépassement du plafond agronomique par parcelle (verrou anti-fraude, niveau lot).
  for (const p of parcelles) {
    const t = exp.tonnages[p.id] ?? 0;
    const plafond = plafondTonnes(p);
    if (t > plafond + 1e-9) {
      anomalies.push({
        categorie: "depassement-plafond",
        detail: {
          fr: `Prélèvement sur la parcelle de ${p.producteurNom} (${t2(t)} t) au-delà du plafond agronomique (${t2(plafond)} t) : risque de mélange de flux.`,
          en: `Draw from ${p.producteurNom}'s plot (${t2(t)} t) exceeds the agronomic cap (${t2(plafond)} t): risk of flow mixing.`,
        },
        bloquant: true,
      });
    }
  }

  // 2. Écart de pesée : la pesée finale doit réconcilier le tonnage composé du lot.
  const journal = exp.journalPossession ?? [];
  const pesee = journal.find((j) => j.code === "pesee");
  const tonnageLot = tonnageExpedition(exp);
  if (pesee?.tonnes != null && tonnageLot > 0) {
    const ecart = Math.abs(pesee.tonnes - tonnageLot);
    if (ecart > Math.max(TOLERANCE_PESEE * tonnageLot, 0.1)) {
      anomalies.push({
        categorie: "ecart-pesee",
        detail: {
          fr: `Écart entre la pesée (${t2(pesee.tonnes)} t) et le lot composé (${t2(tonnageLot)} t) : réconcilier avant de sceller.`,
          en: `Gap between weighing (${t2(pesee.tonnes)} t) and the composed lot (${t2(tonnageLot)} t): reconcile before sealing.`,
        },
        bloquant: true,
      });
    }
  }

  // 3. Connaissement dupliqué dans le journal du lot (une remise ne peut être comptée deux fois).
  const vus = new Map<string, number>();
  for (const j of journal) {
    const n = j.connaissement?.trim();
    if (n) vus.set(n, (vus.get(n) ?? 0) + 1);
  }
  for (const [num, c] of vus) {
    if (c > 1) {
      anomalies.push({
        categorie: "connaissement-duplique",
        detail: {
          fr: `Le connaissement ${num} apparaît ${c} fois dans le journal du lot : une remise ne peut être comptée deux fois.`,
          en: `Bill of lading ${num} appears ${c} times in the lot journal: a hand-off cannot be counted twice.`,
        },
        bloquant: true,
      });
    }
  }

  return { anomalies, bloquant: anomalies.some((a) => a.bloquant) };
}

/**
 * Audit CROISÉ du marché : un même numéro de connaissement ne peut couvrir DEUX lots différents.
 * Retourne l'ensemble des numéros dupliqués entre expéditions (surface une alerte globale dans
 * l'espace exportateur, et désactive la publication des lots concernés). Calqué sur le comptage
 * par `Map` de `auditerRegistre`.
 */
export function connaissementsDupliquesMarche(
  exps: readonly { ref: string; journalPossession?: { connaissement?: string }[] }[],
): Set<string> {
  const vus = new Map<string, Set<string>>();
  for (const exp of exps) {
    for (const j of exp.journalPossession ?? []) {
      const n = j.connaissement?.trim();
      if (!n) continue;
      const lots = vus.get(n) ?? new Set<string>();
      lots.add(exp.ref);
      vus.set(n, lots);
    }
  }
  const dup = new Set<string>();
  for (const [num, lots] of vus) if (lots.size > 1) dup.add(num);
  return dup;
}

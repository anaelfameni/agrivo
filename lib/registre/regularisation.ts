/**
 * File de régularisation de la coopérative — ce qui empêche les parcelles d'entrer
 * dans un lot vendable, avec l'action recommandée pour chacune.
 *
 * Complète (sans les dupliquer) les panneaux existants du tableau de bord :
 * les « Données insuffisantes » ont déjà « À re-vérifier », les anomalies ont déjà « Alertes ».
 * Ici on couvre les deux gages ADMINISTRATIFS du sceau : la carte producteur et la référence DDR.
 *
 * Wording imposé (CLAUDE.md) : « régularisation auprès du Conseil du Café-Cacao »,
 * JAMAIS « contournement ». Aucun verdict inventé : tout est dérivé des données de la parcelle.
 */

import type { Parcelle } from "@/data/mock-parcelles";
import { estProducteurCarte } from "@/data/mock-marketplace";

export type MotifRegularisation = "carte-producteur" | "reference-ddr";

export interface ItemRegularisation {
  parcelleId: string;
  producteurNom: string;
  region: string;
  motif: MotifRegularisation;
  fr: string;
  en: string;
}

export interface FileRegularisation {
  items: ItemRegularisation[];
  /** Parcelles concernées (une parcelle peut cumuler plusieurs motifs). */
  nbParcelles: number;
  nbCartes: number;
  nbDdr: number;
}

/**
 * Construit la file de régularisation à partir du registre de la coopérative.
 * Pur et déterministe : mêmes parcelles en entrée, même file en sortie.
 */
export function fileRegularisation(parcelles: Parcelle[]): FileRegularisation {
  const items: ItemRegularisation[] = [];

  for (const p of parcelles) {
    if (!estProducteurCarte(p.numeroCartePro)) {
      items.push({
        parcelleId: p.id,
        producteurNom: p.producteurNom,
        region: p.region,
        motif: "carte-producteur",
        fr: "Carte producteur absente ou invalide : régularisation auprès du Conseil du Café-Cacao. Sans carte, la parcelle est exclue du sceau (gage ②).",
        en: "Producer card missing or invalid: regularisation with the Conseil du Café-Cacao. Without a card, the plot is excluded from the seal (lock ②).",
      });
    }
    if (!p.referenceDDR) {
      items.push({
        parcelleId: p.id,
        producteurNom: p.producteurNom,
        region: p.region,
        motif: "reference-ddr",
        fr: "Référence DDR manquante au dossier : à compléter pour que la parcelle rejoigne un lot vendable (gage ④).",
        en: "DDR reference missing from the file: complete it so the plot can join a sellable lot (lock ④).",
      });
    }
  }

  const parcellesConcernees = new Set(items.map((i) => i.parcelleId));
  return {
    items,
    nbParcelles: parcellesConcernees.size,
    nbCartes: items.filter((i) => i.motif === "carte-producteur").length,
    nbDdr: items.filter((i) => i.motif === "reference-ddr").length,
  };
}

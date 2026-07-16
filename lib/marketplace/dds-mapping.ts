/**
 * Correspondance sceau AGRIVO ↔ diligence raisonnée de l'acheteur (RDUE).
 *
 * Chaque gage du sceau répond à une exigence précise de la due diligence que l'opérateur
 * européen doit documenter avant de déposer sa DDS (règlement (UE) 2023/1115). Cette table
 * rend la correspondance explicite : l'acheteur lit, ligne à ligne, ce que le lot scellé
 * lui apporte pour SON dossier.
 *
 * ⚠️ Honnêteté charte : le sceau APPUIE la diligence raisonnée de l'opérateur, il ne la
 * remplace jamais (l'opérateur qui dépose la DDS reste seul responsable). Toujours afficher
 * l'avertissement `DDS_DISCLAIMER` avec cette table.
 * Module PUR (aucun "use client") : importable côté serveur, client et tests.
 */

import type { CritereCode } from "@/data/mock-marketplace";

/** Libellé court de chaque gage (colonnes de la table de correspondance). */
export const GAGE_LABEL: Record<CritereCode, { fr: string; en: string }> = {
  "segregation": { fr: "Ségrégation", en: "Segregation" },
  "carte-producteur": { fr: "Carte producteur", en: "Producer card" },
  "integrite": { fr: "Intégrité des volumes", en: "Volume integrity" },
  "references-ddr": { fr: "Références DDR", en: "DDR references" },
  "chaine-possession": { fr: "Chaîne de possession", en: "Chain of custody" },
};

export interface ExigenceDds {
  /** L'exigence de due diligence à laquelle le gage répond. */
  exigence: { fr: string; en: string };
  /** Référence indicative du règlement (UE) 2023/1115. */
  reference: string;
}

export const DDS_MAPPING: Record<CritereCode, ExigenceDds> = {
  "segregation": {
    exigence: {
      fr: "Produits issus uniquement de parcelles évaluées « Conforme » : le bilan de masse est interdit, la ségrégation physique doit être démontrable.",
      en: "Products sourced only from plots assessed “Compliant”: mass balance is forbidden, physical segregation must be demonstrable.",
    },
    reference: "Règl. (UE) 2023/1115, art. 3 et 9",
  },
  "carte-producteur": {
    exigence: {
      fr: "Identité des producteurs et rattachement des parcelles : l'opérateur doit collecter l'information fournisseur jusqu'au producteur.",
      en: "Farmer identity and plot attribution: the operator must collect supplier information down to the farmer.",
    },
    reference: "Règl. (UE) 2023/1115, art. 9(1)",
  },
  "integrite": {
    exigence: {
      fr: "Évaluation du risque documentée : géolocalisations à jour, volumes plausibles au regard des superficies, dossier complet avant expédition.",
      en: "Documented risk assessment: up-to-date geolocations, volumes plausible against plot areas, complete file before shipment.",
    },
    reference: "Règl. (UE) 2023/1115, art. 10",
  },
  "references-ddr": {
    exigence: {
      fr: "Références de diligence raisonnée disponibles pour chaque parcelle du lot, réutilisables dans la déclaration de l'opérateur.",
      en: "Due diligence references available for every plot in the lot, reusable in the operator's statement.",
    },
    reference: "Règl. (UE) 2023/1115, art. 4 et 33",
  },
  "chaine-possession": {
    exigence: {
      fr: "Traçabilité de la chaîne d'approvisionnement : qui a détenu le lot du bord champ à la composition (achat, transport documenté, réception, pesée).",
      en: "Supply chain traceability: who held the lot from farm gate to composition (purchase, documented transport, reception, weighing).",
    },
    reference: "Règl. (UE) 2023/1115, art. 9(1) et 10(2)",
  },
};

export const DDS_DISCLAIMER = {
  fr: "Le sceau AGRIVO appuie la diligence raisonnée de l'acheteur ; il ne remplace pas la déclaration (DDS) de l'opérateur, seul responsable de la conformité au sens du règlement (UE) 2023/1115.",
  en: "The AGRIVO seal supports the buyer's due diligence; it does not replace the operator's statement (DDS), who remains solely responsible for compliance under Regulation (EU) 2023/1115.",
};

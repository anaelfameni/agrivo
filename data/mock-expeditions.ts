/**
 * Expéditions — traçabilité DOCUMENTAIRE de la parcelle au conteneur.
 *
 * Le RDUE exige, pour chaque déclaration de diligence raisonnée (DDS), la géolocalisation de
 * TOUTES les parcelles d'origine de l'expédition — et interdit le bilan de masse (ségrégation
 * physique). Ce module applique donc deux règles dures, héritées du moteur anti-fraude du site :
 *   1. SÉGRÉGATION : seules des parcelles évaluées « Conforme » peuvent composer un lot ;
 *   2. RÉCONCILIATION : le tonnage prélevé sur une parcelle ne peut dépasser son plafond
 *      (superficie × rendement régional) — le verrou « blanchiment de cacao » appliqué au lot.
 *
 * Les jalons sont DÉCLARATIFS (saisis par l'exportateur — aucun capteur) : AGRIVO trace le
 * dossier documentaire, il ne suit pas physiquement les sacs (terrain du SNT national).
 * Module PUR (aucun "use client") : importable côté serveur, client et tests.
 */

import {
  getParcelle,
  volumeTonnes,
  exporterFeatureCollection,
  type Parcelle,
  type Filiere,
} from "@/data/mock-parcelles";

export type JalonCode = "compose" | "depart-coop" | "recu-port" | "embarque" | "arrive-ue";

export interface Jalon {
  code: JalonCode;
  date: string; // ISO jour
  note?: { fr: string; en: string };
}

/** Ordre canonique des 5 jalons déclaratifs du dossier d'expédition. */
export const JALONS_ORDRE: JalonCode[] = ["compose", "depart-coop", "recu-port", "embarque", "arrive-ue"];

export const JALON_LABEL: Record<JalonCode, { fr: string; en: string }> = {
  "compose": { fr: "Lot composé", en: "Lot composed" },
  "depart-coop": { fr: "Départ coopérative", en: "Left the cooperative" },
  "recu-port": { fr: "Reçu entrepôt / port", en: "Received at warehouse / port" },
  "embarque": { fr: "Embarqué", en: "Loaded on vessel" },
  "arrive-ue": { fr: "Arrivé UE · DDS déposée", en: "Arrived in EU · DDS filed" },
};

export interface Expedition {
  id: string;
  /** Référence publique du dossier (QR, page de vérification). */
  ref: string;
  nomLot: string;
  acheteur: string;
  paysAcheteur: string;
  portDepart: "San Pédro" | "Abidjan";
  portArrivee: string;
  navire?: string;
  numeroConteneur?: string;
  /** Code SH de la marchandise (1801 = fèves de cacao). */
  codeSH: string;
  filiere: Filiere;
  parcelleIds: string[];
  /** Tonnage prélevé par parcelle (t) — chaque valeur ≤ plafondTonnes(parcelle). */
  tonnages: Record<string, number>;
  jalons: Jalon[];
  creeLe: string;
}

/** Plafond anti-fraude d'une parcelle : superficie × rendement régional de sa filière. */
export function plafondTonnes(p: Parcelle): number {
  return volumeTonnes(p);
}

export interface CompositionRefus {
  parcelleId: string;
  raison: "non-conforme" | "tonnage-au-dela-du-plafond" | "parcelle-inconnue";
}

export interface CompositionResultat {
  ok: boolean;
  refus: CompositionRefus[];
  tonnageTotal: number;
}

/**
 * Vérifie qu'une composition de lot respecte la ségrégation ET la réconciliation des volumes.
 * Ne jette jamais : retourne la liste exacte des refus (affichable telle quelle à l'écran).
 */
export function composerExpedition(entrees: { parcelleId: string; tonnes: number }[]): CompositionResultat {
  const refus: CompositionRefus[] = [];
  let total = 0;
  for (const { parcelleId, tonnes } of entrees) {
    const p = getParcelle(parcelleId);
    if (!p) {
      refus.push({ parcelleId, raison: "parcelle-inconnue" });
      continue;
    }
    if (p.statut !== "conforme") {
      refus.push({ parcelleId, raison: "non-conforme" });
      continue;
    }
    if (tonnes > plafondTonnes(p) + 1e-9) {
      refus.push({ parcelleId, raison: "tonnage-au-dela-du-plafond" });
      continue;
    }
    total += tonnes;
  }
  return { ok: refus.length === 0, refus, tonnageTotal: Math.round(total * 100) / 100 };
}

/** Parcelles réelles d'une expédition (ids inconnus ignorés — jamais de trou à l'écran). */
export function parcellesExpedition(exp: Expedition): Parcelle[] {
  return exp.parcelleIds.map((id) => getParcelle(id)).filter((p): p is Parcelle => Boolean(p));
}

/** Tonnage total du lot (somme des prélèvements par parcelle). */
export function tonnageExpedition(exp: Expedition): number {
  return Math.round(exp.parcelleIds.reduce((s, id) => s + (exp.tonnages[id] ?? 0), 0) * 100) / 100;
}

/**
 * GeoJSON TRACES NT du lot : exactement les parcelles contributrices (RFC 7946, WGS-84,
 * 6 décimales — la mécanique éprouvée d'exporterFeatureCollection), enrichi des métadonnées
 * d'expédition dans les properties de chaque feature.
 */
export function expeditionFeatureCollection(exp: Expedition) {
  const fc = exporterFeatureCollection(parcellesExpedition(exp));
  return {
    ...fc,
    features: fc.features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        expeditionRef: exp.ref,
        tonnesPrelevees: exp.tonnages[(f.properties as { id: string }).id] ?? 0,
        codeSH: exp.codeSH,
      },
    })),
  };
}

/** Dernier jalon atteint (les jalons sont enregistrés dans l'ordre canonique). */
export function statutExpedition(exp: Expedition): Jalon {
  return exp.jalons[exp.jalons.length - 1];
}

/** Progression 1..5 pour la barre de jalons. */
export function progressionExpedition(exp: Expedition): number {
  return JALONS_ORDRE.indexOf(statutExpedition(exp).code) + 1;
}

/**
 * Recherche par référence pour la VÉRIFICATION PUBLIQUE (QR du dossier d'expédition).
 * Insensible à la casse et aux espaces — même contrat que findCertificat.
 */
export function findExpedition(ref: string): Expedition | undefined {
  const q = ref.trim().toUpperCase();
  if (!q) return undefined;
  return EXPEDITIONS.find((e) => e.ref.toUpperCase() === q);
}

/** Expéditions dont au moins une parcelle appartient à la coopérative donnée (vue coop, lecture seule). */
export function expeditionsPourCoop(cooperative: string): Expedition[] {
  return EXPEDITIONS.filter((e) => parcellesExpedition(e).some((p) => p.cooperative === cooperative));
}

/**
 * Trois expéditions de démonstration, composées UNIQUEMENT de parcelles conformes existantes
 * (les tonnages respectent les plafonds — vérifié par les tests) :
 *  - EXP-2026-0001 : dossier COMPLET arrivé en Europe (les 5 jalons) — le lot de la démo jury ;
 *  - EXP-2026-0002 : en mer (4 jalons) ;
 *  - EXP-2026-0003 : en cours de composition (1 jalon).
 */
export const EXPEDITIONS: Expedition[] = [
  {
    id: "exp1",
    ref: "EXP-2026-0001",
    nomLot: "Cacao Nawa · récolte principale 2025-26",
    acheteur: "Chocolats Meridia SAS",
    paysAcheteur: "France",
    portDepart: "San Pédro",
    portArrivee: "Le Havre",
    navire: "MSC Amboise",
    numeroConteneur: "MSKU-483920-1",
    codeSH: "1801",
    filiere: "cacao",
    parcelleIds: ["p01", "p02", "p03", "p04"],
    tonnages: { p01: 1.9, p02: 1.5, p03: 2.8, p04: 1.1 },
    jalons: [
      { code: "compose", date: "2026-06-12" },
      { code: "depart-coop", date: "2026-06-15", note: { fr: "Coopérative Agricole de Soubré", en: "Soubré Agricultural Cooperative" } },
      { code: "recu-port", date: "2026-06-17", note: { fr: "Entrepôt portuaire de San Pédro", en: "San Pédro port warehouse" } },
      { code: "embarque", date: "2026-06-20", note: { fr: "MSC Amboise · conteneur MSKU-483920-1", en: "MSC Amboise · container MSKU-483920-1" } },
      { code: "arrive-ue", date: "2026-07-04", note: { fr: "Le Havre · référence DDS transmise à l'acheteur", en: "Le Havre · DDS reference sent to the buyer" } },
    ],
    creeLe: "2026-06-12",
  },
  {
    id: "exp2",
    ref: "EXP-2026-0002",
    nomLot: "Café Tonkpi · lot export n° 2",
    acheteur: "Nordic Roasters AB",
    paysAcheteur: "Suède",
    portDepart: "Abidjan",
    portArrivee: "Anvers",
    navire: "CMA CGM Bamako",
    numeroConteneur: "CGMU-201184-7",
    codeSH: "0901",
    filiere: "cafe",
    parcelleIds: ["p11", "p43", "p44"],
    tonnages: { p11: 0.7, p43: 0.9, p44: 1.2 },
    jalons: [
      { code: "compose", date: "2026-06-28" },
      { code: "depart-coop", date: "2026-07-01", note: { fr: "UCACO Man", en: "UCACO Man" } },
      { code: "recu-port", date: "2026-07-04", note: { fr: "Terminal céréalier d'Abidjan", en: "Abidjan terminal" } },
      { code: "embarque", date: "2026-07-08", note: { fr: "CMA CGM Bamako · conteneur CGMU-201184-7", en: "CMA CGM Bamako · container CGMU-201184-7" } },
    ],
    creeLe: "2026-06-28",
  },
  {
    id: "exp3",
    ref: "EXP-2026-0003",
    nomLot: "Cacao Nawa · lot complémentaire",
    acheteur: "— (en négociation)",
    paysAcheteur: "—",
    portDepart: "San Pédro",
    portArrivee: "—",
    codeSH: "1801",
    filiere: "cacao",
    parcelleIds: ["p15", "p16"],
    tonnages: { p15: 1.2, p16: 0.8 },
    jalons: [{ code: "compose", date: "2026-07-09" }],
    creeLe: "2026-07-09",
  },
];

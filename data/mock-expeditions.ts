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

/* --------------------------------------------------------------------------------------------
 * Journal de POSSESSION du lot (AMONT) — la chaîne de possession continue, du bord champ à la
 * composition. Distinct des jalons LOGISTIQUES aval (JALONS_ORDRE : compose → arrive-ue) : ici on
 * retrace QUI a détenu le lot AVANT sa composition (achat bord champ → transport sous connaissement
 * → réception magasin → pesée), la donnée qu'exige le RDUE pour prouver qu'un lot n'a pas absorbé
 * de flux indirect non tracé. Réutilise la forme d'un jalon, enrichie d'une provenance (acteur, n°
 * de connaissement, tonnes) que lit la sentinelle de volume.
 * ------------------------------------------------------------------------------------------ */
export type PossessionCode = "achat-bord-champ" | "transport-connaissement" | "reception-magasin" | "pesee";

export interface JalonPossession {
  code: PossessionCode;
  date: string; // ISO jour (antérieur à la composition du lot)
  /** Qui détient / transfère le lot à ce jalon (pisteur, traitant, magasinier). */
  acteur?: string;
  /** N° de connaissement / bordereau de transport (preuve documentaire de la remise). */
  connaissement?: string;
  /** Volume constaté à ce jalon (t) — lu par la sentinelle de volume. */
  tonnes?: number;
  note?: { fr: string; en: string };
}

/** Ordre canonique de la chaîne de possession amont (tout se passe avant la composition du lot). */
export const POSSESSION_ORDRE: PossessionCode[] = [
  "achat-bord-champ",
  "transport-connaissement",
  "reception-magasin",
  "pesee",
];

export const POSSESSION_LABEL: Record<PossessionCode, { fr: string; en: string }> = {
  "achat-bord-champ": { fr: "Achat bord champ", en: "Farm-gate purchase" },
  "transport-connaissement": { fr: "Transport · connaissement", en: "Transport · bill of lading" },
  "reception-magasin": { fr: "Réception magasin", en: "Warehouse reception" },
  "pesee": { fr: "Pesée", en: "Weighing" },
};

/**
 * La chaîne de possession est-elle CONTINUE : les 4 jalons amont présents, et le jalon de transport
 * porte bien un numéro de connaissement (la remise est documentée) ? Ne juge pas les volumes (rôle
 * de la sentinelle de volume) : ici, uniquement la présence des maillons.
 */
export function possessionComplete(journal: JalonPossession[]): boolean {
  const codes = journal.map((j) => j.code);
  const tousPresents = POSSESSION_ORDRE.every((c) => codes.includes(c));
  const transport = journal.find((j) => j.code === "transport-connaissement");
  const connaissementPresent = Boolean(transport?.connaissement && transport.connaissement.trim());
  return tousPresents && connaissementPresent;
}

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
  /** Journal de possession AMONT (bord champ → pesée), antérieur à la composition. Optionnel :
   *  un lot ancien peut ne pas le porter (son 5ᵉ critère de sceau restera « en préparation »). */
  journalPossession?: JalonPossession[];
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

/* ------------------------------------------------------------------------------------------
 * Contrôle PRÉ-EMBARQUEMENT — le screening documentaire du lot avant départ.
 * Niveaux QUALITATIFS uniquement (jamais de score inventé) ; chaque point est un fait
 * recalculé depuis les données du lot. Référence temporelle = date de composition du lot
 * (déterministe : mêmes résultats en test, en démo et en production).
 * ---------------------------------------------------------------------------------------- */

export interface PointControle {
  niveau: "ok" | "attention";
  code: "plafonds" | "fraicheur" | "alertes-coop" | "references-ddr" | "logistique";
  fr: string;
  en: string;
}

export interface ControleEmbarquement {
  /** « pret » si aucun point d'attention, sinon « attention ». Jamais de faux « prêt ». */
  niveau: "pret" | "attention";
  points: PointControle[];
}

/** Jours entre deux dates ISO (b - a). */
function joursEntre(aIso: string, bIso: string): number {
  return Math.round((new Date(bIso).getTime() - new Date(aIso).getTime()) / 86_400_000);
}

export function controleEmbarquement(exp: Expedition, toutesParcelles: Parcelle[]): ControleEmbarquement {
  const parcelles = parcellesExpedition(exp);
  const points: PointControle[] = [];

  // 1. Plafonds anti-fraude : un prélèvement > 90 % du plafond mérite une re-pesée avant départ.
  const ratios = parcelles.map((p) => (exp.tonnages[p.id] ?? 0) / Math.max(plafondTonnes(p), 1e-9));
  const tendues = parcelles.filter((_, i) => ratios[i] > 0.9);
  const moyen = Math.round((ratios.reduce((s, r) => s + r, 0) / Math.max(ratios.length, 1)) * 100);
  if (tendues.length > 0) {
    points.push({
      niveau: "attention",
      code: "plafonds",
      fr: `${tendues.length} prélèvement(s) au-delà de 90 % du plafond anti-fraude (${tendues.map((p) => p.producteurNom).join(", ")}) : re-vérifier les pesées avant embarquement.`,
      en: `${tendues.length} draw(s) above 90% of the anti-fraud cap (${tendues.map((p) => p.producteurNom).join(", ")}): re-check weighings before loading.`,
    });
  } else {
    points.push({
      niveau: "ok",
      code: "plafonds",
      fr: `Volumes réconciliés : utilisation moyenne de ${moyen} % des plafonds anti-fraude, marge saine sur chaque parcelle.`,
      en: `Volumes reconciled: average use of ${moyen}% of the anti-fraud caps, healthy margin on every plot.`,
    });
  }

  // 2. Fraîcheur des vérifications satellites à la date de composition du lot.
  const agees = parcelles.filter((p) => joursEntre(p.dateVerification, exp.creeLe) > 30);
  if (agees.length > 0) {
    points.push({
      niveau: "attention",
      code: "fraicheur",
      fr: `${agees.length} parcelle(s) vérifiée(s) plus de 30 jours avant la composition du lot : une re-vérification satellite est conseillée avant l'embarquement.`,
      en: `${agees.length} plot(s) verified more than 30 days before the lot was composed: a satellite re-verification is advised before loading.`,
    });
  } else {
    points.push({
      niveau: "ok",
      code: "fraicheur",
      fr: "Toutes les vérifications satellites datent de moins de 30 jours à la composition du lot.",
      en: "All satellite verifications are less than 30 days old at lot composition.",
    });
  }

  // 3. Contexte coopérative : des alertes actives AILLEURS dans les coops contributrices.
  //    La ségrégation les exclut déjà du lot → point INFORMATIF (niveau ok), jamais bloquant :
  //    « Points d'attention avant embarquement » est réservé à ce qui demande une action.
  const coops = new Set(parcelles.map((p) => p.cooperative));
  const alertes = toutesParcelles.filter((p) => coops.has(p.cooperative) && p.alerteActive && !exp.parcelleIds.includes(p.id));
  if (alertes.length > 0) {
    points.push({
      niveau: "ok",
      code: "alertes-coop",
      fr: `Pour information : ${alertes.length} alerte(s) active(s) sur d'autres parcelles des coopératives contributrices, sans effet sur ce lot (ségrégation stricte).`,
      en: `For information: ${alertes.length} active alert(s) on other plots of the contributing cooperatives, no effect on this lot (strict segregation).`,
    });
  } else {
    points.push({
      niveau: "ok",
      code: "alertes-coop",
      fr: "Aucune alerte active dans les coopératives contributrices.",
      en: "No active alert in the contributing cooperatives.",
    });
  }

  // 4. Références DDR : chaque parcelle conforme devrait porter la sienne au dossier.
  const sansDdr = parcelles.filter((p) => !p.referenceDDR);
  if (sansDdr.length > 0) {
    points.push({
      niveau: "attention",
      code: "references-ddr",
      fr: `${sansDdr.length} parcelle(s) sans référence DDR enregistrée : compléter le dossier avant la déclaration.`,
      en: `${sansDdr.length} plot(s) without a recorded DDR reference: complete the file before filing.`,
    });
  } else {
    points.push({
      niveau: "ok",
      code: "references-ddr",
      fr: `Références DDR présentes pour les ${parcelles.length} parcelles du lot.`,
      en: `DDR references present for all ${parcelles.length} plots in the lot.`,
    });
  }

  // 5. Logistique documentaire : navire et conteneur à renseigner avant l'embarquement.
  const dernierJalon = statutExpedition(exp).code;
  if ((dernierJalon === "compose" || dernierJalon === "depart-coop" || dernierJalon === "recu-port") && (!exp.navire || !exp.numeroConteneur)) {
    points.push({
      niveau: "attention",
      code: "logistique",
      fr: "Navire et numéro de conteneur à renseigner avant le jalon « Embarqué ».",
      en: "Vessel and container number to be filled in before the \"Loaded\" milestone.",
    });
  } else {
    points.push({
      niveau: "ok",
      code: "logistique",
      fr: "Informations logistiques complètes pour le stade actuel du lot.",
      en: "Logistics information complete for the lot's current stage.",
    });
  }

  return { niveau: points.some((p) => p.niveau === "attention") ? "attention" : "pret", points };
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
    // ~78-80 % des plafonds anti-fraude : marge saine, le contrôle pré-embarquement sort « Prêt ».
    tonnages: { p01: 1.5, p02: 1.2, p03: 2.3, p04: 0.9 },
    jalons: [
      { code: "compose", date: "2026-06-12" },
      { code: "depart-coop", date: "2026-06-15", note: { fr: "Coopérative Agricole de Soubré", en: "Soubré Agricultural Cooperative" } },
      { code: "recu-port", date: "2026-06-17", note: { fr: "Entrepôt portuaire de San Pédro", en: "San Pédro port warehouse" } },
      { code: "embarque", date: "2026-06-20", note: { fr: "MSC Amboise · conteneur MSKU-483920-1", en: "MSC Amboise · container MSKU-483920-1" } },
      { code: "arrive-ue", date: "2026-07-04", note: { fr: "Le Havre · référence DDS transmise à l'acheteur", en: "Le Havre · DDS reference sent to the buyer" } },
    ],
    journalPossession: [
      { code: "achat-bord-champ", date: "2026-06-05", acteur: "Pisteur agréé · secteur Soubré", tonnes: 5.9 },
      { code: "transport-connaissement", date: "2026-06-07", connaissement: "CNT-SOU-260607-01", tonnes: 5.9 },
      { code: "reception-magasin", date: "2026-06-09", acteur: "Magasin coopérative de Soubré", tonnes: 5.9 },
      { code: "pesee", date: "2026-06-10", tonnes: 5.9, note: { fr: "Pont-bascule : écart nul avec le bordereau d'achat.", en: "Weighbridge: zero gap with the purchase note." } },
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
    // Prélèvements sous 90 % des plafonds anti-fraude (café 0,5 t/ha) → contrôle « Prêt », sceau vérifié.
    tonnages: { p11: 0.7, p43: 0.8, p44: 0.9 },
    jalons: [
      { code: "compose", date: "2026-06-28" },
      { code: "depart-coop", date: "2026-07-01", note: { fr: "UCACO Man", en: "UCACO Man" } },
      { code: "recu-port", date: "2026-07-04", note: { fr: "Terminal céréalier d'Abidjan", en: "Abidjan terminal" } },
      { code: "embarque", date: "2026-07-08", note: { fr: "CMA CGM Bamako · conteneur CGMU-201184-7", en: "CMA CGM Bamako · container CGMU-201184-7" } },
    ],
    journalPossession: [
      { code: "achat-bord-champ", date: "2026-06-20", acteur: "Traitant agréé · Tonkpi", tonnes: 2.4 },
      { code: "transport-connaissement", date: "2026-06-22", connaissement: "CNT-MAN-260622-04", tonnes: 2.4 },
      { code: "reception-magasin", date: "2026-06-24", acteur: "Magasin UCACO Man", tonnes: 2.4 },
      { code: "pesee", date: "2026-06-26", tonnes: 2.4 },
    ],
    creeLe: "2026-06-28",
  },
  {
    id: "exp3",
    ref: "EXP-2026-0003",
    nomLot: "Cacao Nawa · lot complémentaire",
    acheteur: "En négociation",
    paysAcheteur: "À confirmer",
    portDepart: "San Pédro",
    portArrivee: "À confirmer",
    codeSH: "1801",
    filiere: "cacao",
    parcelleIds: ["p15", "p16"],
    tonnages: { p15: 1.2, p16: 0.8 },
    jalons: [{ code: "compose", date: "2026-07-09" }],
    journalPossession: [
      { code: "achat-bord-champ", date: "2026-07-02", acteur: "Pisteur agréé · secteur Soubré", tonnes: 2.0 },
      { code: "transport-connaissement", date: "2026-07-04", connaissement: "CNT-SOU-260704-02", tonnes: 2.0 },
      { code: "reception-magasin", date: "2026-07-06", acteur: "Magasin coopérative de Soubré", tonnes: 2.0 },
      { code: "pesee", date: "2026-07-08", tonnes: 2.0 },
    ],
    creeLe: "2026-07-09",
  },
];

/**
 * Marketplace du cacao conforme (v2.0) — la place de marché des LOTS VÉRIFIÉS.
 *
 * Positionnement (v2, validé 13/07/2026) : la conformité/traçabilité est le WEDGE ; la marketplace
 * est l'endgame. L'exportateur (client payeur) publie ses lots déjà tracés (module Expéditions) ;
 * l'acheteur premium ne voit que des lots portant le SCEAU AGRIVO. Take-rate sur la transaction.
 *
 * ⚠️ Frontière Nanti : AGRIVO fait le COMMERCE des fèves (mise en relation + sceau), JAMAIS le
 * financement/crédit. Aucun score financier ici.
 *
 * Le SCEAU AGRIVO = DOUBLE VERROU anti-fraude, calculé (jamais inventé) depuis les données du lot :
 *   ① Ségrégation : toutes les parcelles du lot sont « Conforme » (pas de bilan de masse) ;
 *   ② Carte producteur : tous les producteurs sont cartés (identité + parcelle vérifiées par l'État) ;
 *   ③ Intégrité : le contrôle pré-embarquement est « Prêt » (volumes réconciliés, vérifs fraîches) ;
 *   ④ Références DDR présentes au dossier.
 * Un lot ne peut être VENDU que si son sceau est « vérifié ». Gate carte SOUPLE : un producteur
 * non carté n'est pas supprimé, il fait juste échouer le critère ② → lot « en préparation ».
 *
 * Module PUR (aucun "use client") : importable côté serveur, client et tests.
 */

import {
  controleEmbarquement,
  parcellesExpedition,
  tonnageExpedition,
  EXPEDITIONS,
  type Expedition,
} from "@/data/mock-expeditions";
import {
  FILIERE_LABEL,
  getParcelle,
  type Filiere,
  type Parcelle,
} from "@/data/mock-parcelles";

/* --------------------------------------------------------------------------------------------
 * Ancre anti-fraude : la carte producteur (Conseil Café-Cacao).
 * Une carte CCC valide a la forme « CI-CCC-###### ». C'est la garantie d'État que le producteur
 * et sa parcelle sont déjà déclarés — la 1ʳᵉ moitié du double verrou.
 * ------------------------------------------------------------------------------------------ */
const FORMAT_CARTE_CCC = /^CI-CCC-\d{4,}$/;

/** Le producteur est-il carté (carte producteur CCC valide) ? */
export function estProducteurCarte(numeroCartePro: string): boolean {
  return FORMAT_CARTE_CCC.test((numeroCartePro ?? "").trim().toUpperCase());
}

/* --------------------------------------------------------------------------------------------
 * Le SCEAU AGRIVO — évalué, jamais affirmé sans preuve.
 * ------------------------------------------------------------------------------------------ */
export type CritereCode = "segregation" | "carte-producteur" | "integrite" | "references-ddr";

export interface CritereSceau {
  code: CritereCode;
  ok: boolean;
  fr: string;
  en: string;
}

export interface Sceau {
  /** « verifie » seulement si les 4 critères passent ; sinon « en-preparation ». Jamais de faux sceau. */
  statut: "verifie" | "en-preparation";
  criteres: CritereSceau[];
}

/**
 * Évalue le sceau d'un lot (expédition + référentiel de parcelles). Ne jette jamais.
 * Réutilise le moteur anti-fraude existant `controleEmbarquement()` pour le critère d'intégrité.
 */
export function evaluerSceau(exp: Expedition, toutesParcelles: Parcelle[]): Sceau {
  // Résolution depuis le référentiel PASSÉ (pur/testable), pas depuis la constante globale.
  const parcelles = exp.parcelleIds
    .map((id) => toutesParcelles.find((p) => p.id === id))
    .filter((p): p is Parcelle => Boolean(p));

  const nonConformes = parcelles.filter((p) => p.statut !== "conforme");
  const nonCartes = parcelles.filter((p) => !estProducteurCarte(p.numeroCartePro));
  const sansDdr = parcelles.filter((p) => !p.referenceDDR);
  const controle = controleEmbarquement(exp, toutesParcelles);

  const criteres: CritereSceau[] = [
    {
      code: "segregation",
      ok: parcelles.length > 0 && nonConformes.length === 0,
      fr:
        nonConformes.length === 0
          ? "Ségrégation : toutes les parcelles du lot sont évaluées « Conforme »."
          : `${nonConformes.length} parcelle(s) non conforme(s) dans le lot : à retirer avant mise en vente.`,
      en:
        nonConformes.length === 0
          ? "Segregation: every plot in the lot is assessed “Compliant”."
          : `${nonConformes.length} non-compliant plot(s) in the lot: remove before listing.`,
    },
    {
      code: "carte-producteur",
      ok: parcelles.length > 0 && nonCartes.length === 0,
      fr:
        nonCartes.length === 0
          ? "Carte producteur : tous les producteurs sont cartés (identité et parcelle vérifiées par l'État)."
          : `${nonCartes.length} producteur(s) non carté(s) : exclu(s) du sceau jusqu'à régularisation de la carte.`,
      en:
        nonCartes.length === 0
          ? "Producer card: every farmer is carded (identity and plot verified by the State)."
          : `${nonCartes.length} un-carded farmer(s): excluded from the seal until the card is regularised.`,
    },
    {
      code: "integrite",
      ok: controle.niveau === "pret",
      fr:
        controle.niveau === "pret"
          ? "Intégrité : volumes réconciliés et vérifications satellites à jour (contrôle pré-embarquement « Prêt »)."
          : "Intégrité : le contrôle pré-embarquement signale des points d'attention à lever.",
      en:
        controle.niveau === "pret"
          ? "Integrity: volumes reconciled and satellite checks up to date (pre-shipment control “Ready”)."
          : "Integrity: the pre-shipment control flags points to address.",
    },
    {
      code: "references-ddr",
      ok: parcelles.length > 0 && sansDdr.length === 0,
      fr:
        sansDdr.length === 0
          ? "Références DDR complètes au dossier."
          : `${sansDdr.length} parcelle(s) sans référence DDR : compléter le dossier.`,
      en:
        sansDdr.length === 0
          ? "DDR references complete in the file."
          : `${sansDdr.length} plot(s) without a DDR reference: complete the file.`,
    },
  ];

  const statut: Sceau["statut"] = criteres.every((c) => c.ok) ? "verifie" : "en-preparation";
  return { statut, criteres };
}

/* --------------------------------------------------------------------------------------------
 * Take-rate — le revenu de la marketplace (1 à 3 % du montant de la transaction).
 * C'est un modèle économique, jamais une promesse de précision : les taux sont des paramètres.
 * ------------------------------------------------------------------------------------------ */
export const TAUX_COMMISSION_MIN = 0.01;
export const TAUX_COMMISSION_MAX = 0.03;
export const TAUX_COMMISSION_DEFAUT = 0.02;

/** Valeur d'un lot en FCFA = tonnage (t) × 1000 (kg/t) × prix indicatif (FCFA/kg). */
export function valeurLotFcfa(tonnage: number, prixFcfaKg: number): number {
  return Math.round(tonnage * 1000 * prixFcfaKg);
}

/** Commission marketplace en FCFA pour un montant de transaction et un taux (borné 1–3 %). */
export function takeRate(valeurFcfa: number, taux: number = TAUX_COMMISSION_DEFAUT): number {
  const t = Math.min(Math.max(taux, TAUX_COMMISSION_MIN), TAUX_COMMISSION_MAX);
  return Math.round(valeurFcfa * t);
}

/* --------------------------------------------------------------------------------------------
 * Les lots du marché — dérivés des expéditions déjà tracées (offre de l'exportateur).
 * On n'invente aucune parcelle : un lot de marché EST une expédition + un prix indicatif + un
 * état de marché. Le sceau est recalculé à la lecture.
 *
 * AGRIVO Market (vitrine publique) affiche un catalogue de LOTS RÉELS dérivés du portefeuille :
 *   • 2 lots des expéditions du site (EXP-2026-0001 cacao, 0002 café) ;
 *   • 4 lots MARKETPLACE (EXP-2026-0004..0007) composés d'autres parcelles conformes du
 *     portefeuille (Méagui, San-Pédro, Daloa, Gagnoa).
 * Ces 4 lots ne sont PAS ajoutés au registre global des expéditions (mock-expeditions) :
 *   ils vivent ici, leur dossier public est la page /marketplace/lot/[ref].
 * ------------------------------------------------------------------------------------------ */
export type StatutMarche = "liste" | "reserve";

export interface MarketLot {
  /** Référence publique du lot (QR, page /marketplace/lot/[ref]). */
  ref: string;
  nomLot: string;
  filiere: Filiere;
  filiereLabel: string;
  cooperatives: string[];
  regions: string[];
  tonnage: number;
  /** Prix indicatif proposé par le vendeur (FCFA/kg) — négociable, jamais garanti. */
  prixIndicatifFcfaKg: number;
  valeurFcfa: number;
  sceau: Sceau;
  statutMarche: StatutMarche;
  /** Nombre de parcelles d'origine (transparence de l'offre). */
  nbParcelles: number;
  /** Ids des parcelles d'origine (mini-carte, tableau certificats/DDR de la fiche lot). */
  parcelleIds: string[];
  /** Campagne / millésime de récolte. */
  campagne: string;
  portDepart: string;
  /** Acheteur (seulement pour un lot déjà réservé). */
  acheteur?: string;
  paysAcheteur?: string;
}

/**
 * Lots MARKETPLACE supplémentaires (EXP-2026-0004..0007) — expéditions composées d'autres
 * parcelles CONFORMES du portefeuille. Tonnages sous les plafonds anti-fraude et vérifications
 * satellites fraîches à la composition, pour que le sceau sorte « vérifié » — SAUF 0007,
 * volontairement « en préparation » (une pesée > 90 % du plafond → réconciliation à finir) :
 * la vitrine montre honnêtement qu'un lot conforme n'est pas scellé tant que le verrou d'intégrité
 * n'est pas levé. Non ajoutées au registre global EXPEDITIONS (les tests d'expédition exigent que
 * TOUT lot du registre soit irréprochable ; ici on veut justement un cas « en préparation »).
 */
const LOTS_SUPPLEMENTAIRES: Expedition[] = [
  {
    id: "mkt4",
    ref: "EXP-2026-0004",
    nomLot: "Cacao Nawa · Méagui, récolte principale 2025-26",
    acheteur: "— (à vendre)",
    paysAcheteur: "—",
    portDepart: "San Pédro",
    portArrivee: "—",
    navire: "MSC Lorette",
    numeroConteneur: "MSCU-771208-4",
    codeSH: "1801",
    filiere: "cacao",
    parcelleIds: ["p18", "p21", "p22"],
    tonnages: { p18: 2.0, p21: 0.9, p22: 1.6 },
    jalons: [
      { code: "compose", date: "2026-07-08" },
      { code: "depart-coop", date: "2026-07-09", note: { fr: "Coopérative de Méagui", en: "Méagui Cooperative" } },
    ],
    creeLe: "2026-07-08",
  },
  {
    id: "mkt5",
    ref: "EXP-2026-0005",
    nomLot: "Cacao San-Pédro · lot littoral 2025-26",
    acheteur: "— (à vendre)",
    paysAcheteur: "—",
    portDepart: "San Pédro",
    portArrivee: "—",
    navire: "Maersk Sètte",
    numeroConteneur: "MRKU-559034-2",
    codeSH: "1801",
    filiere: "cacao",
    parcelleIds: ["p33", "p36", "p38"],
    tonnages: { p33: 2.2, p36: 1.4, p38: 2.6 },
    jalons: [
      { code: "compose", date: "2026-07-03" },
      { code: "depart-coop", date: "2026-07-04", note: { fr: "COOP-SP San Pédro", en: "COOP-SP San Pédro" } },
    ],
    creeLe: "2026-07-03",
  },
  {
    id: "mkt6",
    ref: "EXP-2026-0006",
    nomLot: "Cacao Haut-Sassandra · Daloa 2025-26",
    acheteur: "— (à vendre)",
    paysAcheteur: "—",
    portDepart: "San Pédro",
    portArrivee: "—",
    navire: "CMA CGM Sassandra",
    numeroConteneur: "CMAU-330871-9",
    codeSH: "1801",
    filiere: "cacao",
    parcelleIds: ["p39", "p40", "p42"],
    tonnages: { p39: 1.9, p40: 1.2, p42: 1.6 },
    jalons: [
      { code: "compose", date: "2026-07-08" },
      { code: "depart-coop", date: "2026-07-09", note: { fr: "COOP Daloa", en: "COOP Daloa" } },
    ],
    creeLe: "2026-07-08",
  },
  {
    id: "mkt7",
    ref: "EXP-2026-0007",
    nomLot: "Cacao Gôh · Gagnoa (réconciliation en cours)",
    acheteur: "— (à vendre)",
    paysAcheteur: "—",
    portDepart: "San Pédro",
    portArrivee: "—",
    codeSH: "1801",
    filiere: "cacao",
    parcelleIds: ["p28", "p30"],
    // p28 volontairement à ~96 % de son plafond → le contrôle d'intégrité reste « attention »,
    // donc sceau « en préparation » (démonstration honnête du verrou de réconciliation).
    tonnages: { p28: 2.25, p30: 1.5 },
    jalons: [{ code: "compose", date: "2026-06-30" }],
    creeLe: "2026-06-30",
  },
];

/** Toutes les expéditions adressables par la marketplace (registre du site + lots marketplace). */
const EXPEDITIONS_MARCHE: Expedition[] = [...EXPEDITIONS, ...LOTS_SUPPLEMENTAIRES];

/** Prix indicatif + état de marché par référence de lot (FCFA/kg) — au-dessus du prix bord champ. */
const MARKET_SEED: Record<string, { prixFcfaKg: number; statutMarche: StatutMarche }> = {
  "EXP-2026-0001": { prixFcfaKg: 3100, statutMarche: "liste" },
  "EXP-2026-0002": { prixFcfaKg: 2650, statutMarche: "reserve" },
  "EXP-2026-0004": { prixFcfaKg: 2950, statutMarche: "liste" },
  "EXP-2026-0005": { prixFcfaKg: 3050, statutMarche: "liste" },
  "EXP-2026-0006": { prixFcfaKg: 2900, statutMarche: "liste" },
  "EXP-2026-0007": { prixFcfaKg: 3000, statutMarche: "liste" },
};

/** Références de tous les lots du catalogue (generateStaticParams de la fiche lot). */
export const MARKET_LOT_REFS: string[] = Object.keys(MARKET_SEED);

/** Construit un lot de marché à partir d'une expédition + un prix indicatif. */
export function lotDepuisExpedition(
  exp: Expedition,
  prixFcfaKg: number,
  statutMarche: StatutMarche,
  toutesParcelles: Parcelle[],
): MarketLot {
  const parcelles = parcellesExpedition(exp);
  const tonnage = tonnageExpedition(exp);
  const cooperatives = [...new Set(parcelles.map((p) => p.cooperative))];
  const regions = [...new Set(parcelles.map((p) => p.region))];
  // La campagne est dérivée de la date de composition (millésime de récolte).
  const annee = new Date(exp.creeLe).getFullYear();
  const reserve = statutMarche === "reserve" && exp.acheteur && !exp.acheteur.startsWith("—");
  return {
    ref: exp.ref,
    nomLot: exp.nomLot,
    filiere: exp.filiere,
    filiereLabel: FILIERE_LABEL[exp.filiere],
    cooperatives,
    regions,
    tonnage,
    prixIndicatifFcfaKg: prixFcfaKg,
    valeurFcfa: valeurLotFcfa(tonnage, prixFcfaKg),
    sceau: evaluerSceau(exp, toutesParcelles),
    statutMarche,
    nbParcelles: parcelles.length,
    parcelleIds: parcelles.map((p) => p.id),
    campagne: `${annee - 1}-${String(annee).slice(2)}`,
    portDepart: exp.portDepart,
    acheteur: reserve ? exp.acheteur : undefined,
    paysAcheteur: reserve ? exp.paysAcheteur : undefined,
  };
}

/**
 * Le catalogue de la marketplace (dérivé des expéditions du site + lots marketplace).
 * `toutesParcelles` = le référentiel (PARCELLES) passé par l'appelant pour rester pur/testable.
 */
export function lotsMarche(toutesParcelles: Parcelle[]): MarketLot[] {
  return EXPEDITIONS_MARCHE.filter((e) => MARKET_SEED[e.ref]).map((e) => {
    const seed = MARKET_SEED[e.ref];
    return lotDepuisExpedition(e, seed.prixFcfaKg, seed.statutMarche, toutesParcelles);
  });
}

/** L'expédition source d'un lot de marché (pour la fiche lot : logistique, jalons, PDF, mini-carte). */
export function findMarketExpedition(ref: string): Expedition | undefined {
  const q = ref.trim().toUpperCase();
  if (!q || !MARKET_SEED[q]) return undefined;
  return EXPEDITIONS_MARCHE.find((e) => e.ref.toUpperCase() === q);
}

/** Un lot de marché par référence, ou undefined (vérification publique de la fiche lot). */
export function findMarketLot(ref: string, toutesParcelles: Parcelle[]): MarketLot | undefined {
  const exp = findMarketExpedition(ref);
  if (!exp) return undefined;
  const seed = MARKET_SEED[exp.ref];
  return lotDepuisExpedition(exp, seed.prixFcfaKg, seed.statutMarche, toutesParcelles);
}

/** Les parcelles d'origine d'un lot (mini-carte + tableau certificats/DDR de la fiche lot). */
export function parcellesDuLot(lot: MarketLot): Parcelle[] {
  return lot.parcelleIds.map((id) => getParcelle(id)).filter((p): p is Parcelle => Boolean(p));
}

/** Un lot est-il vendable (sceau vérifié ET encore listé) ? */
export function estVendable(lot: MarketLot): boolean {
  return lot.sceau.statut === "verifie" && lot.statutMarche === "liste";
}

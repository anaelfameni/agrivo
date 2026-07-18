/**
 * Dossier DDS — le « dernier mètre » de la traçabilité AGRIVO : assembler, pour UNE expédition,
 * tout ce que l'opérateur reporte dans TRACES NT au moment de déposer sa déclaration de
 * diligence raisonnée (règlement (UE) 2023/1115) :
 *   • le GeoJSON des parcelles d'origine (RFC 7946, la mécanique éprouvée du module Expéditions) ;
 *   • un BROUILLON de déclaration : les champs factuels (denrée, code SH, masse nette, pays de
 *     production, parcelles géolocalisées, références DDR) pré-assemblés depuis le dossier ;
 *   • une check-list de préparation recalculée depuis les moteurs existants (audit de
 *     géolocalisation, ségrégation, carte producteur, chaîne de possession + sentinelle de
 *     volume, contrôle pré-embarquement, références DDR) ;
 *   • un rapport structuré des ÉLÉMENTS réunis pour l'évaluation de risque de l'opérateur
 *     (art. 9 et 10 du règlement).
 *
 * ⚠️ Honnêteté charte : AGRIVO PRÉPARE le dossier ; le DÉPÔT dans TRACES NT reste l'acte de
 * l'opérateur, seul responsable de la conformité (DDS_DISCLAIMER, toujours affiché avec ces
 * livrables). Le module ne produit JAMAIS un verdict de risque à la place de l'opérateur :
 * il constate des éléments, il n'affirme rien.
 * Module PUR (aucun "use client") : importable côté serveur, client et tests.
 */

import {
  controleEmbarquement,
  expeditionFeatureCollection,
  possessionComplete,
  tonnageExpedition,
  type Expedition,
} from "@/data/mock-expeditions";
import { estProducteurCarte } from "@/data/mock-marketplace";
import { FILIERE_LABEL, type Parcelle } from "@/data/mock-parcelles";
import { FILIERE_LABEL_EN } from "@/lib/certificat-data";
import { evaluerSentinelleVolume } from "@/lib/sentinelle/volume";
import { DDS_DISCLAIMER } from "@/lib/marketplace/dds-mapping";

/* --------------------------------------------------------------------------------------------
 * Check-list de préparation — chaque vérification est un FAIT recalculé, jamais une promesse.
 * ------------------------------------------------------------------------------------------ */

export type VerificationDdsCode =
  | "geolocalisation"
  | "segregation"
  | "identite"
  | "references-ddr"
  | "possession"
  | "controle";

export interface VerificationDds {
  code: VerificationDdsCode;
  ok: boolean;
  detail: { fr: string; en: string };
}

/** Règle RDUE : une parcelle de 4 ha ou plus doit être décrite par un POLYGONE (pas un point). */
const SEUIL_POLYGONE_HA = 4;

export interface BrouillonDds {
  /** Référence interne du dossier (l'expédition AGRIVO). */
  refInterne: string;
  /** Activité déclarée par l'opérateur pour ce flux. */
  activite: { fr: string; en: string };
  denree: { fr: string; en: string };
  /** Code SH indicatif de la marchandise (ex. 1801 = fèves de cacao). */
  codeSH: string;
  /** Masse nette du lot (t) = somme des prélèvements par parcelle. */
  masseNetteTonnes: number;
  paysProduction: { fr: string; en: string };
  nbParcelles: number;
  nbParcellesGeolocalisees: number;
  /** Campagne de récolte, dérivée de la date de composition du lot. */
  periodeRecolte: string;
  /** Références DDR déjà enregistrées pour les parcelles du lot. */
  referencesDdr: string[];
}

export interface DossierDds {
  ref: string;
  brouillon: BrouillonDds;
  /** GeoJSON TRACES NT du lot (RFC 7946, WGS-84, 6 décimales, tonnages par parcelle). */
  geojson: ReturnType<typeof expeditionFeatureCollection>;
  verifications: VerificationDds[];
  /** true seulement si TOUTES les vérifications passent. Jamais de faux « prêt ». */
  pret: boolean;
  /** Ce qui bloque encore, actionnable tel quel à l'écran (vide si `pret`). */
  manquants: { fr: string; en: string }[];
  disclaimer: { fr: string; en: string };
}

/** Résout les parcelles du lot depuis le référentiel PASSÉ (pur/testable, même doctrine que le sceau). */
function resoudreParcelles(exp: Expedition, toutesParcelles: Parcelle[]): Parcelle[] {
  return exp.parcelleIds
    .map((id) => toutesParcelles.find((p) => p.id === id))
    .filter((p): p is Parcelle => Boolean(p));
}

/** Campagne de récolte « 2025-26 » dérivée de la date de composition (même règle que la marketplace). */
function campagneDepuis(creeLe: string): string {
  const annee = new Date(creeLe).getFullYear();
  return `${annee - 1}-${String(annee).slice(2)}`;
}

/**
 * Assemble le dossier DDS d'une expédition. Ne jette jamais : un dossier incomplet sort avec
 * `pret: false` et la liste exacte des manquants (le produit dit la vérité, il ne bloque pas
 * en silence).
 */
export function construireDossierDds(exp: Expedition, toutesParcelles: Parcelle[]): DossierDds {
  const parcelles = resoudreParcelles(exp, toutesParcelles);
  const verifications: VerificationDds[] = [];

  // 1. Géolocalisation : chaque parcelle porte sa géométrie, et la règle « 4 ha et plus =
  //    polygone » est respectée (un point central ne suffit qu'en dessous du seuil).
  const grandesEnPoint = parcelles.filter(
    (p) => p.superficieHa >= SEUIL_POLYGONE_HA && p.geojson.type !== "Polygon",
  );
  verifications.push({
    code: "geolocalisation",
    ok: parcelles.length > 0 && grandesEnPoint.length === 0,
    detail:
      parcelles.length === 0
        ? { fr: "Aucune parcelle résolue pour ce lot : la géolocalisation ne peut pas être jointe.", en: "No plot resolved for this lot: geolocation cannot be attached." }
        : grandesEnPoint.length === 0
          ? {
              fr: `Géolocalisation complète : ${parcelles.length} parcelle(s) au format RFC 7946, règle du polygone (4 ha et plus) respectée.`,
              en: `Geolocation complete: ${parcelles.length} plot(s) in RFC 7946 format, polygon rule (4 ha and above) respected.`,
            }
          : {
              fr: `${grandesEnPoint.length} parcelle(s) de 4 ha ou plus décrite(s) par un simple point : un polygone est requis (${grandesEnPoint.map((p) => p.producteurNom).join(", ")}).`,
              en: `${grandesEnPoint.length} plot(s) of 4 ha or more described by a single point: a polygon is required (${grandesEnPoint.map((p) => p.producteurNom).join(", ")}).`,
            },
  });

  // 2. Ségrégation : tous les verdicts « Conforme » (le bilan de masse est interdit).
  const nonConformes = parcelles.filter((p) => p.statut !== "conforme");
  verifications.push({
    code: "segregation",
    ok: parcelles.length > 0 && nonConformes.length === 0,
    detail:
      nonConformes.length === 0
        ? { fr: "Ségrégation : toutes les parcelles du lot sont évaluées « Conforme ».", en: "Segregation: every plot in the lot is assessed “Compliant”." }
        : {
            fr: `${nonConformes.length} parcelle(s) non conforme(s) dans le lot : à retirer avant toute déclaration.`,
            en: `${nonConformes.length} non-compliant plot(s) in the lot: remove before any filing.`,
          },
  });

  // 3. Identité : chaque producteur est carté (carte producteur CCC, l'ancre d'identité de l'État).
  const nonCartes = parcelles.filter((p) => !estProducteurCarte(p.numeroCartePro));
  verifications.push({
    code: "identite",
    ok: parcelles.length > 0 && nonCartes.length === 0,
    detail:
      nonCartes.length === 0
        ? { fr: "Identité des producteurs : tous cartés (carte producteur du Conseil du Café-Cacao).", en: "Farmer identity: all carded (Coffee-Cocoa Council producer card)." }
        : {
            fr: `${nonCartes.length} producteur(s) sans carte valide : régulariser l'identité avant la déclaration.`,
            en: `${nonCartes.length} farmer(s) without a valid card: regularise identity before filing.`,
          },
  });

  // 4. Références DDR disponibles pour chaque parcelle.
  const sansDdr = parcelles.filter((p) => !p.referenceDDR);
  verifications.push({
    code: "references-ddr",
    ok: parcelles.length > 0 && sansDdr.length === 0,
    detail:
      sansDdr.length === 0
        ? { fr: `Références DDR présentes pour les ${parcelles.length} parcelles du lot.`, en: `DDR references present for all ${parcelles.length} plots in the lot.` }
        : {
            fr: `${sansDdr.length} parcelle(s) sans référence DDR : compléter le dossier.`,
            en: `${sansDdr.length} plot(s) without a DDR reference: complete the file.`,
          },
  });

  // 5. Chaîne de possession continue ET sentinelle de volume sans anomalie bloquante.
  const chaineComplete = possessionComplete(exp.journalPossession ?? []);
  const sentinelle = evaluerSentinelleVolume(exp, toutesParcelles);
  const possessionOk = chaineComplete && !sentinelle.bloquant;
  verifications.push({
    code: "possession",
    ok: possessionOk,
    detail: possessionOk
      ? {
          fr: "Chaîne de possession continue : achat bord champ, transport sous connaissement, réception et pesée réconciliés.",
          en: "Continuous chain of custody: farm-gate purchase, transport under bill of lading, reception and weighing reconciled.",
        }
      : !chaineComplete
        ? {
            fr: "Chaîne de possession incomplète : un maillon amont (achat, connaissement, réception ou pesée) manque au dossier.",
            en: "Incomplete chain of custody: an upstream link (purchase, bill of lading, reception or weighing) is missing.",
          }
        : {
            fr: "Sentinelle de volume : un écart bloquant reste à réconcilier avant la déclaration.",
            en: "Volume sentinel: a blocking gap remains to reconcile before filing.",
          },
  });

  // 6. Contrôle pré-embarquement « Prêt » (plafonds, fraîcheur satellite, logistique).
  const controle = controleEmbarquement(exp, toutesParcelles);
  verifications.push({
    code: "controle",
    ok: controle.niveau === "pret",
    detail:
      controle.niveau === "pret"
        ? { fr: "Contrôle pré-embarquement « Prêt » : volumes réconciliés, vérifications satellites à jour.", en: "Pre-shipment control “Ready”: volumes reconciled, satellite checks up to date." }
        : {
            fr: "Le contrôle pré-embarquement signale des points d'attention à lever avant la déclaration.",
            en: "The pre-shipment control flags points to address before filing.",
          },
  });

  const pret = parcelles.length > 0 && verifications.every((v) => v.ok);
  const filiereFr = FILIERE_LABEL[exp.filiere];
  const filiereEn = FILIERE_LABEL_EN[exp.filiere];

  return {
    ref: exp.ref,
    brouillon: {
      refInterne: exp.ref,
      activite: { fr: "Exportation", en: "Export" },
      denree: { fr: filiereFr, en: filiereEn },
      codeSH: exp.codeSH,
      masseNetteTonnes: tonnageExpedition(exp),
      paysProduction: { fr: "Côte d'Ivoire", en: "Côte d'Ivoire" },
      nbParcelles: exp.parcelleIds.length,
      nbParcellesGeolocalisees: parcelles.filter((p) => Boolean(p.geojson)).length,
      periodeRecolte: campagneDepuis(exp.creeLe),
      referencesDdr: parcelles.map((p) => p.referenceDDR).filter((r): r is string => Boolean(r)),
    },
    geojson: expeditionFeatureCollection(exp),
    verifications,
    pret,
    manquants: verifications.filter((v) => !v.ok).map((v) => v.detail),
    disclaimer: DDS_DISCLAIMER,
  };
}

/* --------------------------------------------------------------------------------------------
 * Rapport des éléments réunis pour l'évaluation de risque DE L'OPÉRATEUR (art. 9 et 10).
 * Chaque section CONSTATE ce que le dossier contient ; elle ne conclut jamais sur le risque
 * (cette conclusion appartient à l'opérateur qui dépose la DDS).
 * ------------------------------------------------------------------------------------------ */

export type SectionRisqueCode =
  | "identite"
  | "geolocalisation"
  | "deforestation"
  | "legalite"
  | "chaine"
  | "pays";

export interface SectionRisque {
  code: SectionRisqueCode;
  titre: { fr: string; en: string };
  contenu: { fr: string; en: string };
}

export function rapportRisque(exp: Expedition, toutesParcelles: Parcelle[]): SectionRisque[] {
  const parcelles = resoudreParcelles(exp, toutesParcelles);
  const cartes = parcelles.filter((p) => estProducteurCarte(p.numeroCartePro)).length;
  const conformes = parcelles.filter((p) => p.statut === "conforme").length;
  const polygones = parcelles.filter((p) => p.geojson.type === "Polygon").length;
  const avecDdr = parcelles.filter((p) => Boolean(p.referenceDDR)).length;
  const chaineComplete = possessionComplete(exp.journalPossession ?? []);
  const sentinelle = evaluerSentinelleVolume(exp, toutesParcelles);
  const nbJalons = (exp.journalPossession ?? []).length;

  return [
    {
      code: "identite",
      titre: { fr: "Identité des producteurs (art. 9)", en: "Farmer identity (art. 9)" },
      contenu: {
        fr: `${cartes} producteur(s) sur ${parcelles.length} porte(nt) une carte producteur valide du Conseil du Café-Cacao : l'identité et le rattachement des parcelles s'appuient sur l'ancre d'identité de l'État.`,
        en: `${cartes} of ${parcelles.length} farmer(s) hold a valid Coffee-Cocoa Council producer card: identity and plot attribution rest on the State's identity anchor.`,
      },
    },
    {
      code: "geolocalisation",
      titre: { fr: "Géolocalisation des parcelles (art. 9)", en: "Plot geolocation (art. 9)" },
      contenu: {
        fr: `${parcelles.length} parcelle(s) géolocalisée(s) au format RFC 7946 (WGS-84, 6 décimales), dont ${polygones} en polygone. Le GeoJSON joint reprend exactement les parcelles contributrices et leurs tonnages.`,
        en: `${parcelles.length} plot(s) geolocated in RFC 7946 format (WGS-84, 6 decimals), including ${polygones} as polygons. The attached GeoJSON lists exactly the contributing plots and their tonnages.`,
      },
    },
    {
      code: "deforestation",
      titre: { fr: "Non-déforestation après le 31 décembre 2020 (art. 10)", en: "No deforestation after 31 December 2020 (art. 10)" },
      contenu: {
        fr: `${conformes} parcelle(s) sur ${parcelles.length} évaluée(s) « Conforme » par analyse satellite (convergence de preuves, date pivot du 31 décembre 2020). Chaque verdict est daté et rattaché à son certificat d'évaluation.`,
        en: `${conformes} of ${parcelles.length} plot(s) assessed “Compliant” by satellite analysis (convergence of evidence, cut-off date 31 December 2020). Each verdict is dated and linked to its assessment certificate.`,
      },
    },
    {
      code: "legalite",
      titre: { fr: "Légalité de la production (art. 9 et 10)", en: "Legality of production (art. 9 and 10)" },
      contenu: {
        fr: `La carte producteur atteste l'enregistrement de chaque producteur auprès du Conseil du Café-Cacao ; ${avecDdr} parcelle(s) porte(nt) une référence DDR réutilisable dans la déclaration. Les pièces de la coopérative restent consultables au dossier.`,
        en: `The producer card attests each farmer's registration with the Coffee-Cocoa Council; ${avecDdr} plot(s) carry a DDR reference reusable in the statement. The cooperative's supporting documents remain available in the file.`,
      },
    },
    {
      code: "chaine",
      titre: { fr: "Traçabilité de la chaîne d'approvisionnement (art. 9)", en: "Supply chain traceability (art. 9)" },
      contenu: {
        fr: chaineComplete
          ? `Chaîne de possession documentée en ${nbJalons} jalon(s), de l'achat bord champ à la pesée, sous connaissement. Sentinelle de volume : ${sentinelle.bloquant ? "un écart bloquant reste ouvert" : "aucune anomalie bloquante"}.`
          : `Chaîne de possession partiellement documentée (${nbJalons} jalon(s) au dossier) : un maillon amont manque encore. Sentinelle de volume : ${sentinelle.bloquant ? "un écart bloquant reste ouvert" : "aucune anomalie bloquante"}.`,
        en: chaineComplete
          ? `Chain of custody documented in ${nbJalons} step(s), from farm-gate purchase to weighing, under bill of lading. Volume sentinel: ${sentinelle.bloquant ? "a blocking gap remains open" : "no blocking anomaly"}.`
          : `Chain of custody partially documented (${nbJalons} step(s) on file): an upstream link is still missing. Volume sentinel: ${sentinelle.bloquant ? "a blocking gap remains open" : "no blocking anomaly"}.`,
      },
    },
    {
      code: "pays",
      titre: { fr: "Contexte pays (art. 10)", en: "Country context (art. 10)" },
      contenu: {
        fr: "La Côte d'Ivoire est classée « risque standard » par la Commission européenne : la diligence raisonnée complète et la géolocalisation des parcelles restent obligatoires pour chaque déclaration.",
        en: "Côte d'Ivoire is classified as “standard risk” by the European Commission: full due diligence and plot geolocation remain mandatory for every statement.",
      },
    },
  ];
}

/* --------------------------------------------------------------------------------------------
 * Fichiers téléchargeables — préparés ici (pur), écrits par le composant client.
 * ------------------------------------------------------------------------------------------ */

export interface FichierDds {
  nom: string;
  contenu: string;
  type: string;
}

/** Les deux fichiers de données du dossier (le rapport PDF est rendu par dds-pdf.tsx). */
export function fichiersDossierDds(dossier: DossierDds): FichierDds[] {
  return [
    {
      nom: `dds-${dossier.ref}.geojson`,
      contenu: JSON.stringify(dossier.geojson, null, 2),
      type: "application/geo+json",
    },
    {
      nom: `dds-brouillon-${dossier.ref}.json`,
      contenu: JSON.stringify(
        {
          avertissement: dossier.disclaimer,
          brouillon: dossier.brouillon,
          verifications: dossier.verifications,
        },
        null,
        2,
      ),
      type: "application/json",
    },
  ];
}

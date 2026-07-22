import { PARCELLES, type Filiere, type Parcelle } from "@/data/mock-parcelles";

/**
 * Fiches des coopératives du portefeuille exportateur — la couche « annuaire » au-dessus
 * des parcelles. Chaque fiche porte la position du SIÈGE (un point [lat, lon], jamais une
 * superficie : les parcelles cartographiées vivent dans mock-parcelles) + les informations
 * que la coopérative partage avec son exportateur (gérant, téléphone, effectif déclaré).
 *
 * Module PUR (pas de "use client") : consommé par les pages client et testé unitairement.
 * Les statistiques sont TOUJOURS dérivées des parcelles (source de vérité unique).
 */

export interface CoopInfo {
  id: string;
  nom: string;
  region: string;
  ville: string;
  /** Position du siège social : [lat, lon] (un point sur la carte, jamais un polygone). */
  siege: [number, number];
  gerant: string;
  telephone: string;
  /** Effectif déclaré par la coopérative (≠ producteurs déjà audités dans AGRIVO). */
  producteursDeclares: number;
  /** Date d'entrée dans le portefeuille de l'exportateur (ISO). */
  membreDepuis: string;
}

/** Les 9 coopératives du portefeuille de démonstration (noms EXACTEMENT ceux des parcelles). */
export const COOPERATIVES_INFO: CoopInfo[] = [
  {
    id: "coop-soubre",
    nom: "Coopérative Agricole de Soubré",
    region: "Nawa",
    ville: "Soubré",
    siege: [5.7836, -6.5933],
    gerant: "Amadou Koné",
    telephone: "+225 07 49 12 30 58",
    producteursDeclares: 600,
    membreDepuis: "2026-03-02",
  },
  {
    id: "coop-meagui",
    nom: "Coopérative de Méagui",
    region: "Nawa",
    ville: "Méagui",
    siege: [5.4041, -6.5559],
    gerant: "Adjoua N'Da",
    telephone: "+225 05 84 20 17 66",
    producteursDeclares: 480,
    membreDepuis: "2026-03-18",
  },
  {
    id: "coop-gagnoa",
    nom: "COOPAAG Gagnoa",
    region: "Gôh",
    ville: "Gagnoa",
    siege: [6.1319, -5.9506],
    gerant: "Serge Digbeu",
    telephone: "+225 07 58 33 02 41",
    producteursDeclares: 720,
    membreDepuis: "2026-04-06",
  },
  {
    id: "coop-duekoue",
    nom: "Union de Duékoué",
    region: "Guémon",
    ville: "Duékoué",
    siege: [6.7418, -7.3495],
    gerant: "Blaise Goué",
    telephone: "+225 01 42 76 09 15",
    producteursDeclares: 350,
    membreDepuis: "2026-04-21",
  },
  {
    id: "coop-sanpedro",
    nom: "COOP-SP San Pédro",
    region: "San-Pédro",
    ville: "San Pédro",
    siege: [4.7485, -6.6363],
    gerant: "Sylvie Méledje",
    telephone: "+225 07 61 48 25 90",
    producteursDeclares: 810,
    membreDepuis: "2026-05-04",
  },
  {
    id: "coop-daloa",
    nom: "COOP Daloa",
    region: "Haut-Sassandra",
    ville: "Daloa",
    siege: [6.877, -6.4502],
    gerant: "Patrick N'Zué",
    telephone: "+225 05 90 14 72 33",
    producteursDeclares: 540,
    membreDepuis: "2026-05-19",
  },
  {
    id: "coop-man",
    nom: "UCACO Man",
    region: "Tonkpi",
    ville: "Man",
    siege: [7.4125, -7.5544],
    gerant: "Odette Silué",
    telephone: "+225 01 37 65 88 02",
    producteursDeclares: 260,
    membreDepuis: "2026-05-30",
  },
  {
    id: "coop-aboisso",
    nom: "COOP-HEV Aboisso",
    region: "Sud-Comoé",
    ville: "Aboisso",
    siege: [5.468, -3.2073],
    gerant: "Jean Kouadio",
    telephone: "+225 07 22 51 40 79",
    producteursDeclares: 190,
    membreDepuis: "2026-06-08",
  },
  {
    id: "coop-dabou",
    nom: "COOP-PALM Dabou",
    region: "Grands-Ponts",
    ville: "Dabou",
    siege: [5.3256, -4.3767],
    gerant: "Rita Gnamien",
    telephone: "+225 05 03 96 21 47",
    producteursDeclares: 230,
    membreDepuis: "2026-06-15",
  },
];

/** Fiche d'une coopérative par son nom exact (celui porté par les parcelles). */
export function coopInfoParNom(nom: string): CoopInfo | undefined {
  return COOPERATIVES_INFO.find((c) => c.nom === nom);
}

export interface CoopStats {
  parcelles: number;
  conformes: number;
  anomalies: number;
  insuffisantes: number;
  /** % arrondi de parcelles Conformes (0 si aucune parcelle vérifiée). */
  tauxConformite: number;
  alertes: number;
  /** Filières réellement présentes dans les parcelles vérifiées de la coopérative. */
  filieres: Filiere[];
}

/** Statistiques d'une coopérative, dérivées des parcelles (jamais stockées à part). */
export function statsPourCoop(nom: string, parcelles: Parcelle[] = PARCELLES): CoopStats {
  const liste = parcelles.filter((p) => p.cooperative === nom);
  const conformes = liste.filter((p) => p.statut === "conforme").length;
  const anomalies = liste.filter((p) => p.statut === "anomalie").length;
  const insuffisantes = liste.filter((p) => p.statut === "insuffisant").length;
  const filieres: Filiere[] = [];
  for (const p of liste) if (!filieres.includes(p.filiere)) filieres.push(p.filiere);
  return {
    parcelles: liste.length,
    conformes,
    anomalies,
    insuffisantes,
    tauxConformite: liste.length ? Math.round((conformes / liste.length) * 100) : 0,
    alertes: liste.filter((p) => p.alerteActive).length,
    filieres,
  };
}

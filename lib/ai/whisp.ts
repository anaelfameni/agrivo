/**
 * Stub de détection géospatiale WHISP (FAO Open Foris — « What is in that plot? »).
 *
 * Whisp est l'outil de référence de la FAO pour le RDUE : approche « convergence de preuves »,
 * date pivot 31/12/2020, disponible en API HTTP. Ce n'est PAS un modèle maison. Ici, un stub
 * structuré + mock réaliste ; aucun pourcentage de précision inventé (convergence qualitative).
 *
 * Module serveur : jamais appelé directement depuis le client (passe par app/api/whisp/verify).
 */
import {
  getParcelle,
  STATUT_PHRASE,
  STATUT_PHRASE_EN,
  type Filiere,
  type Statut,
} from "@/data/mock-parcelles";

export interface WhispVerifyInput {
  parcelleId?: string;
  coordinates?: number[][][] | number[];
  filiere?: Filiere;
  /** Forçage manuel du verdict (guide présentateur, Prompt 6). */
  force?: Statut;
}

export interface WhispResult {
  statut: Statut;
  phrase: string; // phrase figée de la charte (FR)
  phraseEn: string; // phrase figée (EN) — le client choisit selon la langue d'interface
  datePivot: string; // "2020-12-31"
  sources: string[];
  convergence: string[]; // convergence de preuves (qualitatif — jamais de % inventé)
  convergenceEn: string[];
  analyseMs: number; // rempli par la route (latence simulée)
  demo: boolean;
}

/** Faisceau de preuves qualitatif présenté selon le verdict (aucun pourcentage inventé). */
const CONVERGENCE: Record<Statut, string[]> = {
  conforme: [
    "Imagerie optique Sentinel-2 (Copernicus) : couvert végétal stable depuis la date pivot.",
    "Aucune alerte de perte de couverture forestière (JRC Global Forest Cover).",
    "Convergence des sources satellites sur la période analysée.",
  ],
  anomalie: [
    "Imagerie Sentinel-2 : réduction du couvert détectée après le 31 décembre 2020.",
    "Perte forestière corroborée par une seconde source indépendante.",
    "Convergence des preuves cohérente sur plusieurs passages satellites.",
  ],
  insuffisant: [
    "Couverture nuageuse persistante sur les passages Sentinel-2 disponibles.",
    "Données satellites insuffisantes pour statuer sur la période.",
    "Un nouveau passage est requis pour atteindre la convergence de preuves.",
  ],
};

const CONVERGENCE_EN: Record<Statut, string[]> = {
  conforme: [
    "Sentinel-2 optical imagery (Copernicus): vegetation cover stable since the cut-off date.",
    "No forest cover loss alert (JRC Global Forest Cover).",
    "Satellite sources converge over the analysed period.",
  ],
  anomalie: [
    "Sentinel-2 imagery: cover reduction detected after 31 December 2020.",
    "Forest loss corroborated by a second independent source.",
    "Convergence of evidence consistent across several satellite passes.",
  ],
  insuffisant: [
    "Persistent cloud cover on the available Sentinel-2 passes.",
    "Insufficient satellite data to decide over the period.",
    "A new pass is required to reach convergence of evidence.",
  ],
};

/** Résultat pré-enregistré (MOCK_MODE) : dérivé de la parcelle démo, ou forcé. */
export function whispMock(input: WhispVerifyInput): WhispResult {
  const parcelle = input.parcelleId ? getParcelle(input.parcelleId) : undefined;
  const statut: Statut = input.force ?? parcelle?.statut ?? "conforme";
  return {
    statut,
    phrase: STATUT_PHRASE[statut],
    phraseEn: STATUT_PHRASE_EN[statut],
    datePivot: parcelle?.datePivotAnalyse ?? "2020-12-31",
    sources:
      parcelle?.sourcesDonnees ?? [
        "Copernicus Sentinel-2",
        "Whisp · FAO Open Foris",
        "JRC Global Forest Cover",
      ],
    convergence: CONVERGENCE[statut],
    convergenceEn: CONVERGENCE_EN[statut],
    analyseMs: 0,
    demo: true,
  };
}

/**
 * Vérification Whisp d'une parcelle.
 * // TODO: brancher la vraie API Whisp (endpoint + clé FAO Open Foris) en envoyant le GeoJSON.
 * // Aucun appel réseau ne doit partir du client — toujours via la route serveur.
 */
export async function whispVerify(input: WhispVerifyInput): Promise<WhispResult> {
  // En production (MOCK_MODE off) : POST du GeoJSON vers l'API Whisp, puis mapping du résultat.
  return whispMock(input);
}

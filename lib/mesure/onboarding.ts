/**
 * Compteur de coût d'onboarding — l'instrument de MESURE interne du golden path.
 *
 * L'étude de marché a identifié le coût d'enrôlement d'un producteur comme « l'inconnue n° 1 »
 * du modèle économique : plutôt que d'affirmer un chiffre supposé, AGRIVO le MESURE dès le
 * premier pilote. Chaque parcours de vérification complété enregistre sa durée et son nombre
 * d'étapes ; le panneau interne affiche les agrégats (jamais montrés à un client).
 *
 * Stockage navigateur (localStorage) : instrument de pilote, pas une base de données.
 * Les fonctions de calcul sont PURES (testables) ; seules lire/enregistrer touchent au stockage.
 */

export interface MesureOnboarding {
  /** Horodatages ms epoch (début du parcours → écran de fin). */
  debut: number;
  fin: number;
  /** Nombre d'étapes traversées (golden path = 6). */
  etapes: number;
}

export interface StatsOnboarding {
  n: number;
  /** Durée moyenne d'un enrôlement, en minutes (1 décimale). */
  moyenneMin: number;
  /** Durée médiane, en minutes (1 décimale). */
  medianeMin: number;
}

const CLE = "agrivo:onboarding-mesures";
const MAX_MESURES = 200;

/** Durée plausible d'un parcours : entre 30 s et 4 h (écarte les onglets oubliés ouverts). */
export function mesureValide(m: MesureOnboarding): boolean {
  const duree = m.fin - m.debut;
  return Number.isFinite(duree) && duree >= 30_000 && duree <= 4 * 3_600_000 && m.etapes > 0;
}

/** Agrégats PURS sur une liste de mesures (les invalides sont écartées, jamais comptées). */
export function statsOnboarding(mesures: MesureOnboarding[]): StatsOnboarding {
  const valides = mesures.filter(mesureValide);
  if (valides.length === 0) return { n: 0, moyenneMin: 0, medianeMin: 0 };
  const minutes = valides.map((m) => (m.fin - m.debut) / 60_000).sort((a, b) => a - b);
  const somme = minutes.reduce((s, x) => s + x, 0);
  const milieu = Math.floor(minutes.length / 2);
  const mediane = minutes.length % 2 === 1 ? minutes[milieu] : (minutes[milieu - 1] + minutes[milieu]) / 2;
  const arrondi = (x: number) => Math.round(x * 10) / 10;
  return { n: valides.length, moyenneMin: arrondi(somme / minutes.length), medianeMin: arrondi(mediane) };
}

/** Lit les mesures enregistrées (tableau vide hors navigateur ou stockage corrompu). */
export function lireMesures(): MesureOnboarding[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = window.localStorage.getItem(CLE);
    const parsed = brut ? (JSON.parse(brut) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as MesureOnboarding[]).filter((m) => m && typeof m === "object") : [];
  } catch {
    return [];
  }
}

/** Enregistre une mesure complétée (silencieux hors navigateur ; garde les 200 dernières). */
export function enregistrerMesure(m: MesureOnboarding): void {
  if (typeof window === "undefined" || !mesureValide(m)) return;
  try {
    const toutes = [...lireMesures(), m].slice(-MAX_MESURES);
    window.localStorage.setItem(CLE, JSON.stringify(toutes));
  } catch {
    /* stockage plein / bloqué : l'instrument ne casse jamais le parcours */
  }
}

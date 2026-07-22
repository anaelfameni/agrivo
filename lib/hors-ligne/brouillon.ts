/**
 * Brouillons HORS LIGNE du parcours de vérification : le travail au bord du champ ne se perd
 * jamais, même quand le réseau tombe (réalité terrain documentée par l'étude de marché, et
 * force du concurrent Farmerline : AGRIVO répond avec une version simple et sûre).
 *
 * Version simple assumée : sauvegarde locale de l'état du parcours (étape, parcelle, verdict)
 * à chaque progression, proposition de reprise à la prochaine ouverture, purge à la fin.
 * Aucune file de synchronisation serveur (pas de backend d'écriture à ce stade).
 * Module PUR : la persistance passe par une interface Storage injectable (testable en node).
 */

export interface BrouillonVerification {
  /** Étape atteinte (2..6 : on ne sauvegarde qu'un parcours réellement commencé). */
  step: number;
  /** Parcelle en cours (id du référentiel), si le scan a abouti. */
  parcelleId?: string;
  /** Verdict satellite déjà obtenu (sérialisé tel quel, jamais recalculé au retour). */
  whisp?: unknown;
  /** Verdict imposé par la saisie manuelle, le cas échéant. */
  forced?: unknown;
  /** Horodatage de la dernière sauvegarde (ms epoch). */
  savedAt: number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const CLE_BROUILLON = "agrivo:verifier-brouillon";
/** Un brouillon plus vieux que 7 jours n'est plus proposé (données de terrain périmées). */
export const BROUILLON_TTL_MS = 7 * 24 * 3_600_000;

function storageParDefaut(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Sauvegarde le brouillon (silencieux si le stockage est indisponible ou plein). */
export function sauverBrouillon(b: Omit<BrouillonVerification, "savedAt">, storage: StorageLike | null = storageParDefaut()): void {
  if (!storage || b.step < 2 || b.step > 6) return;
  try {
    storage.setItem(CLE_BROUILLON, JSON.stringify({ ...b, savedAt: Date.now() }));
  } catch {
    /* stockage plein / bloqué : le parcours continue sans brouillon */
  }
}

/** Lit un brouillon exploitable (null si absent, corrompu ou périmé). */
export function lireBrouillon(storage: StorageLike | null = storageParDefaut(), maintenant = Date.now()): BrouillonVerification | null {
  if (!storage) return null;
  try {
    const brut = storage.getItem(CLE_BROUILLON);
    if (!brut) return null;
    const b = JSON.parse(brut) as BrouillonVerification;
    if (typeof b?.step !== "number" || b.step < 2 || b.step > 6) return null;
    if (typeof b.savedAt !== "number" || maintenant - b.savedAt > BROUILLON_TTL_MS) return null;
    return b;
  } catch {
    return null;
  }
}

/** Efface le brouillon (fin de parcours, abandon explicite ou reprise consommée). */
export function effacerBrouillon(storage: StorageLike | null = storageParDefaut()): void {
  try {
    storage?.removeItem(CLE_BROUILLON);
  } catch {
    /* rien à faire */
  }
}

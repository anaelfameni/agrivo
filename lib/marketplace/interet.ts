/**
 * Intérêt acheteur — favoris et alertes de marché (briques premium de la vitrine).
 *
 * Favoris : l'acheteur épingle des lots (référence) et les retrouve d'un clic dans le catalogue.
 * Alertes : l'acheteur enregistre ses critères (filière, région, scellés) ; à chaque visite,
 * la vitrine recalcule les lots correspondants (calcul à l'affichage, jamais de push inventé :
 * l'envoi d'emails viendra avec le backend, ce qui est dit honnêtement dans l'UI).
 *
 * Persistance localStorage (démo, même navigateur). Fonctions PURES testables + storage gardé.
 */

import type { MarketLot } from "@/data/mock-marketplace";

/* ------------------------------------- favoris ------------------------------------- */

const CLE_FAVORIS = "agrivo:favoris:v1";

/** Bascule une référence dans la liste (pur : retourne la nouvelle liste). */
export function basculerFavori(favoris: string[], ref: string): string[] {
  return favoris.includes(ref) ? favoris.filter((r) => r !== ref) : [...favoris, ref];
}

export function lireFavoris(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(window.localStorage.getItem(CLE_FAVORIS) ?? "[]");
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function ecrireFavoris(favoris: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_FAVORIS, JSON.stringify(favoris));
  } catch {
    /* silencieux : la démo continue */
  }
}

/* ------------------------------------- alertes ------------------------------------- */

export interface AlerteMarche {
  id: string;
  filiere: string; // "" = toutes
  region: string; // "" = toutes
  scellesSeul: boolean;
  dateIso: string;
}

const CLE_ALERTES = "agrivo:alertes:v1";

export function construireAlerte(
  criteres: { filiere: string; region: string; scellesSeul: boolean },
  now: Date = new Date(),
): AlerteMarche {
  return {
    id: `AL-${now.getTime().toString(36).toUpperCase()}`,
    filiere: criteres.filiere ?? "",
    region: criteres.region ?? "",
    scellesSeul: Boolean(criteres.scellesSeul),
    dateIso: now.toISOString(),
  };
}

/** Deux alertes aux mêmes critères = doublon (on ne stocke qu'une fois). */
export function alerteExiste(alertes: AlerteMarche[], a: Pick<AlerteMarche, "filiere" | "region" | "scellesSeul">): boolean {
  return alertes.some(
    (x) => x.filiere === a.filiere && x.region === a.region && x.scellesSeul === a.scellesSeul,
  );
}

/** Les lots du catalogue qui correspondent aux critères d'une alerte (recalculé à l'affichage). */
export function lotsCorrespondants(alerte: AlerteMarche, lots: MarketLot[]): MarketLot[] {
  return lots.filter((lot) => {
    if (alerte.filiere && lot.filiere !== alerte.filiere) return false;
    if (alerte.region && !lot.regions.includes(alerte.region)) return false;
    if (alerte.scellesSeul && lot.sceau.statut !== "verifie") return false;
    return true;
  });
}

export function lireAlertes(): AlerteMarche[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(window.localStorage.getItem(CLE_ALERTES) ?? "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function ecrireAlertes(alertes: AlerteMarche[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_ALERTES, JSON.stringify(alertes));
  } catch {
    /* silencieux */
  }
}

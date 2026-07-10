import type { Filiere } from "@/data/mock-parcelles";

/**
 * Coopératives ajoutées par l'EXPORTATEUR (fonction « Ajouter une coopérative ») —
 * persistées dans le navigateur (localStorage), comme les producteurs ajoutés côté coop
 * (lib/producteurs-locaux.ts). Aucun backend cette édition : le registre importé est
 * audité 100 % côté client et seul son RÉSUMÉ est conservé (jamais le fichier).
 */

export interface CoopLocale {
  id: string;
  nom: string;
  region: string;
  ville?: string;
  /** Position du siège : [lat, lon]. Optionnelle (une coop sans siège n'apparaît pas sur la carte). */
  siege?: [number, number];
  gerant?: string;
  telephone?: string;
  producteursDeclares?: number;
  filieres: Filiere[];
  /** Date d'ajout au portefeuille (ISO). */
  ajouteeLe: string;
  /** Résumé de l'audit RDUE du registre partagé (si un fichier a été importé). */
  audit?: { pretPct: number; total: number; anomalies: number };
}

const KEY = "agrivo:coops";

export function lireCoopsLocales(): CoopLocale[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as CoopLocale[]) : [];
    return Array.isArray(list) ? list.filter((c) => c && typeof c.nom === "string") : [];
  } catch {
    return [];
  }
}

function ecrire(coops: CoopLocale[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(coops));
  } catch {
    /* stockage indisponible : l'ajout restera en mémoire de la page */
  }
}

export function ajouterCoopLocale(data: Omit<CoopLocale, "id" | "ajouteeLe">): CoopLocale {
  const coop: CoopLocale = {
    ...data,
    id: `cl-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    ajouteeLe: new Date().toISOString().slice(0, 10),
  };
  ecrire([...lireCoopsLocales(), coop]);
  return coop;
}

export function supprimerCoopLocale(id: string): void {
  ecrire(lireCoopsLocales().filter((c) => c.id !== id));
}

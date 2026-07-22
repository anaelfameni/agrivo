/**
 * Producteurs ajoutés par la coopérative depuis /app/producteurs : persistés côté navigateur
 * (localStorage) pour que leur fiche reste consultable après navigation. Données de session
 * de démonstration — en production réelle, ce serait une table serveur.
 */

import type { FiliereId } from "@/config/filieres";
import type { Statut } from "@/data/mock-parcelles";

export interface ProducteurLocal {
  id: string;
  producteurNom: string;
  numeroCartePro: string;
  cooperative: string;
  region: string;
  superficieHa: number;
  filiere: FiliereId;
  statut: Statut;
  linkId?: string;
  lat?: number;
  lon?: number;
}

export const PRODUCTEURS_KEY = "agrivo:producteurs";

export function lireProducteursLocaux(): ProducteurLocal[] {
  try {
    const raw = localStorage.getItem(PRODUCTEURS_KEY);
    return raw ? (JSON.parse(raw) as ProducteurLocal[]) : [];
  } catch {
    return [];
  }
}

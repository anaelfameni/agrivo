/**
 * Scan universel des documents de transport du lot (connaissement, bordereau d'achat,
 * ticket de pesée) : la partie PURE du pipeline (types, validation anti-invention, repli démo).
 * La lecture réelle vit dans app/api/gemini/scan-document (Gemini Vision), qui n'accepte que
 * ce que ce module valide — jamais un champ inventé si le document est illisible.
 * Module PUR (aucun "use client") : importable côté serveur, client et tests.
 */

export type TypeDocument = "connaissement" | "bordereau-achat" | "ticket-pesee";

export const TYPES_DOCUMENT: TypeDocument[] = ["connaissement", "bordereau-achat", "ticket-pesee"];

export const TYPE_DOCUMENT_LABEL: Record<TypeDocument, { fr: string; en: string }> = {
  "connaissement": { fr: "Connaissement de transport", en: "Transport bill of lading" },
  "bordereau-achat": { fr: "Bordereau d'achat bord champ", en: "Farm-gate purchase note" },
  "ticket-pesee": { fr: "Ticket de pesée", en: "Weighing ticket" },
};

/** Résultat d'extraction : uniquement ce qui est LU sur le document, jamais inventé. */
export interface ExtractionDocument {
  typeDocument: TypeDocument;
  /** N° du document (connaissement, bordereau, ticket). Vide si illisible. */
  numero: string;
  /** Date portée par le document (ISO jour) ; vide si illisible. */
  date: string;
  /** Acteur mentionné (transporteur, pisteur, traitant, magasinier) ; vide si absent. */
  acteur: string;
  /** Tonnage lu sur le document (t) ; null si illisible. */
  tonnes: number | null;
}

const EXTRACTION_VIDE = (type: TypeDocument): ExtractionDocument => ({
  typeDocument: type,
  numero: "",
  date: "",
  acteur: "",
  tonnes: null,
});

/**
 * Valide et assainit une extraction brute (sortie JSON du modèle). Ne jette jamais :
 * tout champ douteux redevient vide/null. Un tonnage doit être un nombre fini raisonnable
 * (0 < t < 100 000) ; une date doit parser en date valide, renvoyée au format ISO jour.
 */
export function validerExtraction(type: TypeDocument, brut: unknown): ExtractionDocument {
  if (!brut || typeof brut !== "object") return EXTRACTION_VIDE(type);
  const b = brut as Record<string, unknown>;

  const numero = typeof b.numero === "string" ? b.numero.trim().slice(0, 64) : "";
  const acteur = typeof b.acteur === "string" ? b.acteur.trim().slice(0, 120) : "";

  let date = "";
  if (typeof b.date === "string" && b.date.trim()) {
    const d = new Date(b.date.trim());
    if (!Number.isNaN(d.getTime())) date = d.toISOString().slice(0, 10);
  }

  let tonnes: number | null = null;
  const t = typeof b.tonnes === "string" ? Number(b.tonnes.replace(",", ".")) : b.tonnes;
  if (typeof t === "number" && Number.isFinite(t) && t > 0 && t < 100_000) {
    tonnes = Math.round(t * 100) / 100;
  }

  return { typeDocument: type, numero, date, acteur, tonnes };
}

/** Une extraction est-elle exploitable (au moins un n° ou un tonnage lus) ? */
export function extractionLisible(e: ExtractionDocument): boolean {
  return Boolean(e.numero) || e.tonnes != null;
}

/**
 * Résultat de DÉMONSTRATION (développement local sans clé Gemini, jamais en production) :
 * déterministe par type de document, cohérent avec les seeds du portefeuille.
 */
export function extractionDemo(type: TypeDocument): ExtractionDocument {
  switch (type) {
    case "connaissement":
      return { typeDocument: type, numero: "CNT-SOU-260712-05", date: "2026-07-12", acteur: "Transport Nawa Express", tonnes: 4.8 };
    case "bordereau-achat":
      return { typeDocument: type, numero: "BA-SOU-260710-18", date: "2026-07-10", acteur: "Pisteur agréé · secteur Soubré", tonnes: 4.8 };
    case "ticket-pesee":
      return { typeDocument: type, numero: "TP-SOU-260713-02", date: "2026-07-13", acteur: "Pont-bascule coopérative de Soubré", tonnes: 4.8 };
  }
}

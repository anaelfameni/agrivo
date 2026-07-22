import { describe, it, expect } from "vitest";
import {
  TYPES_DOCUMENT,
  TYPE_DOCUMENT_LABEL,
  validerExtraction,
  extractionLisible,
  extractionDemo,
} from "@/lib/ai/scan-document";

describe("scan de documents — validation anti-invention", () => {
  it("les 3 types de documents portent un libellé bilingue", () => {
    expect(TYPES_DOCUMENT).toHaveLength(3);
    for (const t of TYPES_DOCUMENT) {
      expect(TYPE_DOCUMENT_LABEL[t].fr.length).toBeGreaterThan(3);
      expect(TYPE_DOCUMENT_LABEL[t].en.length).toBeGreaterThan(3);
    }
  });

  it("assainit une extraction valide (trim, date ISO, tonnes arrondies)", () => {
    const e = validerExtraction("connaissement", {
      numero: "  CNT-TEST-99  ",
      date: "2026-07-12",
      acteur: " Transport Nawa ",
      tonnes: "4,825",
    });
    expect(e.numero).toBe("CNT-TEST-99");
    expect(e.date).toBe("2026-07-12");
    expect(e.acteur).toBe("Transport Nawa");
    expect(e.tonnes).toBe(4.83);
    expect(extractionLisible(e)).toBe(true);
  });

  it("rejette les champs douteux sans jeter (jamais de champ inventé)", () => {
    // Entrée totalement invalide → tout vide.
    const vide = validerExtraction("ticket-pesee", null);
    expect(vide.numero).toBe("");
    expect(vide.tonnes).toBeNull();
    expect(extractionLisible(vide)).toBe(false);
    // Tonnage négatif, date invalide → écartés.
    const douteux = validerExtraction("bordereau-achat", { numero: "BA-1", date: "pas-une-date", tonnes: -3 });
    expect(douteux.numero).toBe("BA-1");
    expect(douteux.date).toBe("");
    expect(douteux.tonnes).toBeNull();
    // Tonnage délirant écarté aussi.
    expect(validerExtraction("ticket-pesee", { tonnes: 1_000_000 }).tonnes).toBeNull();
  });

  it("le repli démo est déterministe et lisible pour chaque type", () => {
    for (const t of TYPES_DOCUMENT) {
      const demo = extractionDemo(t);
      expect(demo.typeDocument).toBe(t);
      expect(extractionLisible(demo)).toBe(true);
      expect(demo.tonnes).toBeGreaterThan(0);
      // Déterminisme : deux appels rendent le même résultat.
      expect(extractionDemo(t)).toEqual(demo);
    }
  });
});

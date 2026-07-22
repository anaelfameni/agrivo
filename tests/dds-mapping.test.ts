import { describe, it, expect } from "vitest";
import { PARCELLES } from "@/data/mock-parcelles";
import { findExpedition } from "@/data/mock-expeditions";
import { evaluerSceau } from "@/data/mock-marketplace";
import { DDS_MAPPING, DDS_DISCLAIMER, GAGE_LABEL } from "@/lib/marketplace/dds-mapping";

describe("correspondance sceau ↔ diligence raisonnée (DDS)", () => {
  it("chaque gage du sceau a son exigence DDS bilingue, sa référence et son libellé court", () => {
    const sceau = evaluerSceau(findExpedition("EXP-2026-0001")!, PARCELLES);
    for (const c of sceau.criteres) {
      const m = DDS_MAPPING[c.code];
      expect(m, c.code).toBeDefined();
      expect(m.exigence.fr.length).toBeGreaterThan(20);
      expect(m.exigence.en.length).toBeGreaterThan(20);
      expect(m.reference).toContain("2023/1115");
      expect(GAGE_LABEL[c.code].fr.length).toBeGreaterThan(2);
      expect(GAGE_LABEL[c.code].en.length).toBeGreaterThan(2);
    }
  });

  it("l'avertissement d'honnêteté existe et dit que le sceau ne remplace pas la DDS", () => {
    expect(DDS_DISCLAIMER.fr).toContain("ne remplace pas");
    expect(DDS_DISCLAIMER.en).toContain("does not replace");
    // Jamais le mot « garantie » affirmé (charte : évaluation, pas garantie).
    expect(DDS_DISCLAIMER.fr.toLowerCase()).not.toContain("garanti");
  });
});

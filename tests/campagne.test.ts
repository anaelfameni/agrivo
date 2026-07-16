import { describe, it, expect } from "vitest";
import { PARCELLES } from "@/data/mock-parcelles";
import { etatCampagne, joursAvant, actionsPourLot } from "@/lib/marketplace/campagne";
import { findMarketLot } from "@/data/mock-marketplace";

describe("conformité de ma campagne — agrégat exportateur", () => {
  it("compte les lots scellés, le tonnage et les jours restants (déterministe)", () => {
    const etat = etatCampagne(PARCELLES, new Date("2026-07-16"));
    expect(etat.totalLots).toBeGreaterThanOrEqual(5);
    expect(etat.lotsScelles).toBeGreaterThanOrEqual(1);
    expect(etat.lotsScelles).toBeLessThanOrEqual(etat.totalLots);
    expect(etat.tonnageScelle).toBeGreaterThan(0);
    expect(etat.joursRestants).toBe(joursAvant("2026-12-30", new Date("2026-07-16")));
    expect(etat.joursRestants).toBeGreaterThan(100);
  });

  it("un lot scellé et sain n'a aucune action ; le lot 0007 en a au moins une", () => {
    const sain = findMarketLot("EXP-2026-0001", PARCELLES)!;
    expect(actionsPourLot(sain)).toHaveLength(0);
    const enPrep = findMarketLot("EXP-2026-0007", PARCELLES)!;
    const actions = actionsPourLot(enPrep);
    expect(actions.length).toBeGreaterThan(0);
    for (const a of actions) {
      expect(a.ref).toBe("EXP-2026-0007");
      expect(a.detail.fr.length).toBeGreaterThan(10);
      expect(a.detail.en.length).toBeGreaterThan(10);
    }
  });

  it("l'échéance passée rend zéro jour (jamais négatif)", () => {
    expect(joursAvant("2026-12-30", new Date("2027-06-01"))).toBe(0);
  });
});

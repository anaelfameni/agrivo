import { describe, expect, it } from "vitest";
import { distanceEdition, revuerRegistre } from "@/lib/registre/revue";
import type { RegistreParcelle } from "@/lib/registre/audit";

const pt = (matricule: string, nom: string, superficieHa: number, lon: number, lat: number): RegistreParcelle => ({
  matricule,
  nom,
  superficieHa,
  geometrie: { type: "point", coords: [lon, lat] },
});

describe("revue registre — distance d'édition", () => {
  it("calcule des distances connues", () => {
    expect(distanceEdition("abc", "abc")).toBe(0);
    expect(distanceEdition("abc", "abd")).toBe(1);
    expect(distanceEdition("abc", "")).toBe(3);
    expect(distanceEdition("kitten", "sitting")).toBe(3);
  });
});

describe("revue registre — détection déterministe des points à vérifier", () => {
  it("signale ≥ 3 superficies strictement identiques", () => {
    const r = revuerRegistre([
      pt("A1", "Alpha", 2.5, -6.6, 5.8),
      pt("A2", "Beta", 2.5, -6.61, 5.81),
      pt("A3", "Gamma", 2.5, -6.62, 5.82),
    ]);
    expect(r.points.some((p) => p.id.startsWith("superficie-identique"))).toBe(true);
  });

  it("signale deux noms quasi-identiques (distance ≤ 2)", () => {
    const r = revuerRegistre([
      pt("B1", "Kouassi Yao", 1.2, -6.6, 5.8),
      pt("B2", "Kouassi Yai", 3.4, -6.6, 5.8),
    ]);
    expect(r.points.some((p) => p.id.startsWith("nom-proche"))).toBe(true);
  });

  it("signale une superficie atypique (> 50 ha)", () => {
    const r = revuerRegistre([pt("C1", "Xylo", 80, -6.6, 5.8)]);
    expect(r.points.some((p) => p.id === "superficie-atypique")).toBe(true);
  });

  it("signale des matricules consécutifs géographiquement dispersés", () => {
    const r = revuerRegistre([
      pt("CI-9", "Un", 1.1, -6.6, 5.8),
      pt("CI-10", "Deux", 2.2, -3.0, 9.0),
    ]);
    expect(r.points.some((p) => p.id.startsWith("dispersion"))).toBe(true);
  });

  it("ne signale RIEN sur un registre propre", () => {
    const r = revuerRegistre([
      pt("K1", "Premier", 1.1, -6.6, 5.8),
      pt("K2", "Second", 2.3, -6.601, 5.801),
      pt("K3", "Troisieme", 3.7, -6.602, 5.802),
    ]);
    expect(r.points).toHaveLength(0);
  });

  it("respecte la charte : jamais « Anomalie détectée », toujours « vérifier »", () => {
    const r = revuerRegistre([
      pt("A1", "Alpha", 2.5, -6.6, 5.8),
      pt("A2", "Beta", 2.5, -6.6, 5.8),
      pt("A3", "Gamma", 2.5, -6.6, 5.8),
      pt("C1", "Xylo", 80, -6.6, 5.8),
    ]);
    for (const p of r.points) {
      expect(p.motif.fr).not.toContain("Anomalie détectée");
      expect(p.motif.fr.toLowerCase()).toContain("vérifier");
      expect(p.motif.en.toLowerCase()).toContain("check");
    }
  });
});

/**
 * Tests des fonctions de données critiques (étape 5 du pipeline : prouver que le logiciel
 * fait ce qu'il est censé faire). Périmètre : les 4 KPI officiels et l'export GeoJSON RFC 7946,
 * car ce sont eux qui partent vers TRACES NT et vers le jury.
 */
import { describe, it, expect } from "vitest";
import {
  PARCELLES,
  portfolioStats,
  exporterFeatureCollection,
  volumeValideTonnes,
  getParcelle,
} from "@/data/mock-parcelles";

describe("portfolioStats (les 4 KPI officiels)", () => {
  const stats = portfolioStats(PARCELLES);

  it("compte 45 producteurs audités sur le portefeuille de démonstration", () => {
    expect(stats.producteurs).toBe(45);
  });

  it("calcule un taux de conformité cohérent (0 à 100, arrondi)", () => {
    expect(stats.tauxConformite).toBeGreaterThanOrEqual(0);
    expect(stats.tauxConformite).toBeLessThanOrEqual(100);
    expect(Number.isInteger(stats.tauxConformite)).toBe(true);
    const conformes = PARCELLES.filter((p) => p.statut === "conforme").length;
    expect(stats.tauxConformite).toBe(Math.round((conformes / PARCELLES.length) * 100));
  });

  it("agrège la superficie totale des parcelles", () => {
    const somme = PARCELLES.reduce((s, p) => s + p.superficieHa, 0);
    expect(stats.superficieHa).toBeCloseTo(somme, 6);
  });

  it("ne compte le volume validé QUE sur les parcelles conformes", () => {
    const nonConformes = PARCELLES.filter((p) => p.statut !== "conforme");
    expect(volumeValideTonnes(nonConformes)).toBe(0);
    expect(stats.volumeTonnes).toBeGreaterThan(0);
  });

  it("ne divise pas par zéro sur un portefeuille vide", () => {
    expect(portfolioStats([]).tauxConformite).toBe(0);
  });
});

describe("exporterFeatureCollection (GeoJSON RFC 7946 pour TRACES NT)", () => {
  const fc = exporterFeatureCollection(PARCELLES);

  it("produit une FeatureCollection avec une Feature par parcelle", () => {
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features).toHaveLength(PARCELLES.length);
    for (const f of fc.features) expect(f.type).toBe("Feature");
  });

  it("écrit les coordonnées en ordre [longitude, latitude] (WGS-84, Côte d'Ivoire)", () => {
    for (const f of fc.features) {
      if (f.geometry.type !== "Polygon") continue;
      for (const [lon, lat] of f.geometry.coordinates[0]) {
        // Côte d'Ivoire : longitude négative (ouest), latitude positive basse.
        expect(lon).toBeGreaterThan(-9);
        expect(lon).toBeLessThan(-2);
        expect(lat).toBeGreaterThan(4);
        expect(lat).toBeLessThan(11);
      }
    }
  });

  it("arrondit chaque coordonnée à 6 décimales maximum (précision ± 11 cm)", () => {
    for (const f of fc.features) {
      if (f.geometry.type !== "Polygon") continue;
      for (const coord of f.geometry.coordinates[0]) {
        for (const v of coord) {
          const decimales = (String(v).split(".")[1] ?? "").length;
          expect(decimales).toBeLessThanOrEqual(6);
        }
      }
    }
  });

  it("ferme chaque anneau de polygone (premier point = dernier point)", () => {
    for (const f of fc.features) {
      if (f.geometry.type !== "Polygon") continue;
      const ring = f.geometry.coordinates[0];
      expect(ring.length).toBeGreaterThanOrEqual(4);
      expect(ring[0]).toEqual(ring[ring.length - 1]);
    }
  });

  it("porte les propriétés de traçabilité attendues par un exportateur", () => {
    const props = fc.features[0].properties as Record<string, unknown>;
    for (const cle of ["producteur", "numeroCartePro", "cooperative", "statut", "numeroCertificat", "datePivotAnalyse"]) {
      expect(props[cle]).toBeTruthy();
    }
  });
});

describe("getParcelle", () => {
  it("retrouve la parcelle de démonstration p01 (Kouassi Yao, AGV-2026-0417)", () => {
    const p = getParcelle("p01");
    expect(p?.producteurNom).toBe("Kouassi Yao");
    expect(p?.numeroCertificat).toBe("AGV-2026-0417");
  });

  it("renvoie undefined pour un identifiant inconnu", () => {
    expect(getParcelle("inexistant")).toBeUndefined();
  });
});

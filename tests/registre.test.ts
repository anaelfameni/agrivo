/**
 * Tests du module d'audit RDUE du registre coopérative (fonctions pures de validation
 * de géométrie) + audit de bout en bout du fichier de démonstration à défauts volontaires.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  anneauFerme,
  dansLaZone,
  auditerRegistre,
  parserGeoJSON,
  parserCSV,
  type RegistreParcelle,
} from "@/lib/registre/audit";

const demo = readFileSync(join(__dirname, "..", "data", "registre-demo.geojson"), "utf8");

describe("validation de géométrie (fonctions pures)", () => {
  it("détecte un polygone ouvert (le contour ne se referme pas)", () => {
    const ferme: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
    const ouvert: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0.1]];
    expect(anneauFerme(ferme)).toBe(true);
    expect(anneauFerme(ouvert)).toBe(false);
  });

  it("détecte des coordonnées hors de l'emprise ivoirienne (lat/lon inversés)", () => {
    expect(dansLaZone([-6.65, 5.83])).toBe(true); // Soubré
    expect(dansLaZone([5.83, -6.65])).toBe(false); // inversion classique
  });

  it("exige un polygone à partir de 4 ha (un point seul ne suffit pas)", () => {
    const grandeSansPolygone: RegistreParcelle[] = [
      { matricule: "T-1", superficieHa: 6, geometrie: { type: "point", coords: [-6.6, 5.8] } },
      { matricule: "T-2", superficieHa: 2, geometrie: { type: "point", coords: [-6.6, 5.81] } },
    ];
    const audit = auditerRegistre(grandeSansPolygone);
    expect(audit.anomalies.map((a) => a.categorie)).toContain("polygone-manquant");
    expect(audit.valides.map((p) => p.matricule)).toEqual(["T-2"]);
  });
});

describe("audit du registre de démonstration (défauts volontaires)", () => {
  const parcelles = parserGeoJSON(demo);
  const audit = auditerRegistre(parcelles);

  it("lit les 30 parcelles du fichier", () => {
    expect(audit.total).toBe(30);
  });

  it("trouve chaque catégorie d'anomalie attendue", () => {
    const cats = new Set(audit.anomalies.map((a) => a.categorie));
    expect(cats).toContain("geometrie-invalide"); // polygones ouverts
    expect(cats).toContain("doublon"); // matricule AGR-R-005 en triple
    expect(cats).toContain("polygone-manquant"); // >= 4 ha avec point seul
    expect(cats).toContain("chevauchement");
    expect(cats).toContain("hors-zone");
  });

  it("calcule un % prêt RDUE cohérent (ni 0 ni 100 : fichier volontairement imparfait)", () => {
    expect(audit.pretPct).toBeGreaterThan(0);
    expect(audit.pretPct).toBeLessThan(100);
    expect(audit.valides.length + " / " + audit.total).toBe(`${audit.valides.length} / 30`);
  });

  it("oriente chaque anomalie vers une action : terrain ou bureau", () => {
    for (const a of audit.anomalies) {
      expect(["terrain", "bureau"]).toContain(a.action);
    }
    // Un doublon se corrige au bureau ; un polygone manquant se complète sur le terrain.
    expect(audit.anomalies.find((a) => a.categorie === "doublon")?.action).toBe("bureau");
    expect(audit.anomalies.find((a) => a.categorie === "polygone-manquant")?.action).toBe("terrain");
  });
});

describe("parser CSV (livrables exportateurs : points)", () => {
  it("lit matricule, superficie et coordonnées", () => {
    const csv = "matricule,nom,superficie_ha,lat,lon\nC-1,Yao,2.5,5.83,-6.65\nC-2,Koffi,6,5.84,-6.64";
    const rows = parserCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].geometrie).toEqual({ type: "point", coords: [-6.65, 5.83] });
    const audit = auditerRegistre(rows);
    // C-2 : 6 ha avec point seul -> polygone manquant
    expect(audit.anomalies.some((a) => a.matricule === "C-2" && a.categorie === "polygone-manquant")).toBe(true);
  });
});

describe("rapprochement SNT : carte producteur (avertissements non bloquants)", () => {
  const point = (lon: number): RegistreParcelle["geometrie"] => ({ type: "point", coords: [lon, 5.8] });

  it("sans aucune colonne carte dans le fichier, aucun avertissement (colonne simplement absente)", () => {
    const audit = auditerRegistre([
      { matricule: "C-1", geometrie: point(-6.6) },
      { matricule: "C-2", geometrie: point(-6.61) },
    ]);
    expect(audit.colonneCartePresente).toBe(false);
    expect(audit.avertissements).toEqual([]);
  });

  it("si la colonne existe, chaque parcelle sans carte est signalée SANS bloquer la géométrie", () => {
    const audit = auditerRegistre([
      { matricule: "C-1", carte: "CI-CCC-000111", geometrie: point(-6.6) },
      { matricule: "C-2", geometrie: point(-6.61) },
      { matricule: "C-3", carte: "  ", geometrie: point(-6.62) },
    ]);
    expect(audit.colonneCartePresente).toBe(true);
    expect(audit.avertissements.map((a) => a.matricule).sort()).toEqual(["C-2", "C-3"]);
    expect(audit.avertissements.every((a) => a.categorie === "non-carte")).toBe(true);
    // Non bloquant : les 3 parcelles restent géométriquement prêtes.
    expect(audit.valides).toHaveLength(3);
    expect(audit.pretPct).toBe(100);
    // Charte : régularisation via le Conseil du Café-Cacao, jamais de contournement.
    expect(audit.avertissements[0].detail.fr).toContain("Conseil du Café-Cacao");
    expect(audit.avertissements[0].detail.fr).not.toMatch(/contourn/i);
  });

  it("les parseurs lisent la carte producteur (GeoJSON et CSV)", () => {
    const geo = parserGeoJSON(
      JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { matricule: "G-1", carte_producteur: "CI-CCC-000222" },
            geometry: { type: "Point", coordinates: [-6.6, 5.8] },
          },
        ],
      }),
    );
    expect(geo[0].carte).toBe("CI-CCC-000222");
    const csv = parserCSV("matricule,nom,carte,lat,lon\nP-1,Awa,CI-CCC-000333,5.8,-6.6\nP-2,Koffi,,5.81,-6.61");
    expect(csv[0].carte).toBe("CI-CCC-000333");
    expect(csv[1].carte).toBeUndefined();
  });
});

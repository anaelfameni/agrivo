import { describe, expect, it } from "vitest";
import {
  EXPEDITIONS,
  JALONS_ORDRE,
  composerExpedition,
  controleEmbarquement,
  expeditionFeatureCollection,
  expeditionsPourCoop,
  findExpedition,
  parcellesExpedition,
  plafondTonnes,
  progressionExpedition,
  statutExpedition,
  tonnageExpedition,
} from "@/data/mock-expeditions";
import { getParcelle, COOP_DEMO, PARCELLES } from "@/data/mock-parcelles";

describe("expéditions — ségrégation et réconciliation (règles RDUE)", () => {
  it("refuse toute parcelle non conforme dans un lot (ségrégation, jamais de bilan de masse)", () => {
    const r = composerExpedition([
      { parcelleId: "p01", tonnes: 1.0 }, // conforme
      { parcelleId: "p05", tonnes: 1.0 }, // anomalie
      { parcelleId: "p08", tonnes: 1.0 }, // insuffisant
    ]);
    expect(r.ok).toBe(false);
    expect(r.refus.map((x) => x.parcelleId).sort()).toEqual(["p05", "p08"]);
    expect(r.refus.every((x) => x.raison === "non-conforme")).toBe(true);
  });

  it("refuse un tonnage au-delà du plafond anti-fraude (superficie × rendement)", () => {
    const p01 = getParcelle("p01")!;
    const plafond = plafondTonnes(p01); // 3,2 ha × 0,6 t/ha = 1,92 t
    expect(plafond).toBeCloseTo(1.92, 5);
    const trop = composerExpedition([{ parcelleId: "p01", tonnes: plafond + 0.1 }]);
    expect(trop.ok).toBe(false);
    expect(trop.refus[0].raison).toBe("tonnage-au-dela-du-plafond");
    const juste = composerExpedition([{ parcelleId: "p01", tonnes: plafond }]);
    expect(juste.ok).toBe(true);
  });

  it("signale les parcelles inconnues sans jeter", () => {
    const r = composerExpedition([{ parcelleId: "p999", tonnes: 1 }]);
    expect(r.ok).toBe(false);
    expect(r.refus[0].raison).toBe("parcelle-inconnue");
  });

  it("les 3 expéditions de démonstration sont IRRÉPROCHABLES (100 % conformes, plafonds respectés)", () => {
    for (const exp of EXPEDITIONS) {
      const entrees = exp.parcelleIds.map((id) => ({ parcelleId: id, tonnes: exp.tonnages[id] ?? 0 }));
      const r = composerExpedition(entrees);
      expect(r.ok, `${exp.ref} doit passer ségrégation + plafonds (refus: ${JSON.stringify(r.refus)})`).toBe(true);
      expect(parcellesExpedition(exp).every((p) => p.statut === "conforme")).toBe(true);
      expect(parcellesExpedition(exp)).toHaveLength(exp.parcelleIds.length); // aucun id fantôme
    }
  });
});

describe("expéditions — dossier GeoJSON TRACES NT du lot", () => {
  it("contient exactement les parcelles contributrices, enrichies des métadonnées du lot", () => {
    const exp = EXPEDITIONS[0]; // EXP-2026-0001, 4 parcelles Soubré
    const fc = expeditionFeatureCollection(exp);
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features).toHaveLength(4);
    for (const f of fc.features) {
      const props = f.properties as { id: string; expeditionRef: string; tonnesPrelevees: number; codeSH: string };
      expect(exp.parcelleIds).toContain(props.id);
      expect(props.expeditionRef).toBe("EXP-2026-0001");
      expect(props.tonnesPrelevees).toBeGreaterThan(0);
      expect(props.codeSH).toBe("1801");
      // Anneau fermé, coordonnées [lon, lat] (RFC 7946)
      const ring = (f.geometry as { coordinates: number[][][] }).coordinates[0];
      expect(ring[0]).toEqual(ring[ring.length - 1]);
    }
  });

  it("tonnage total = somme des prélèvements", () => {
    expect(tonnageExpedition(EXPEDITIONS[0])).toBeCloseTo(5.9, 5); // 1.5+1.2+2.3+0.9
  });
});

describe("expéditions — jalons, recherche publique et vue coopérative", () => {
  it("les jalons suivent l'ordre canonique et le statut = dernier jalon", () => {
    for (const exp of EXPEDITIONS) {
      const codes = exp.jalons.map((j) => j.code);
      const attendu = JALONS_ORDRE.slice(0, codes.length);
      expect(codes, `${exp.ref} : jalons dans l'ordre`).toEqual(attendu);
    }
    expect(statutExpedition(EXPEDITIONS[0]).code).toBe("arrive-ue");
    expect(progressionExpedition(EXPEDITIONS[0])).toBe(5);
    expect(progressionExpedition(EXPEDITIONS[2])).toBe(1);
  });

  it("findExpedition résout la référence publique (casse/espaces) et rejette l'inconnu", () => {
    expect(findExpedition("EXP-2026-0001")?.id).toBe("exp1");
    expect(findExpedition("  exp-2026-0002 ")?.id).toBe("exp2");
    expect(findExpedition("EXP-9999-0000")).toBeUndefined();
    expect(findExpedition("")).toBeUndefined();
  });

  it("aucun doublon de référence", () => {
    const refs = EXPEDITIONS.map((e) => e.ref);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it("la coopérative de démo voit ses expéditions (lecture seule)", () => {
    const pourCoop = expeditionsPourCoop(COOP_DEMO);
    expect(pourCoop.map((e) => e.ref)).toContain("EXP-2026-0001");
    expect(pourCoop.map((e) => e.ref)).not.toContain("EXP-2026-0002"); // café UCACO Man
  });
});

describe("expéditions — contrôle pré-embarquement (screening IA, faits déterministes)", () => {
  it("rend toujours les 5 points de contrôle, chacun bilingue", () => {
    const c = controleEmbarquement(EXPEDITIONS[0], PARCELLES);
    expect(c.points).toHaveLength(5);
    expect(c.points.map((p) => p.code).sort()).toEqual(
      ["alertes-coop", "fraicheur", "logistique", "plafonds", "references-ddr"],
    );
    for (const p of c.points) {
      expect(p.fr.length).toBeGreaterThan(10);
      expect(p.en.length).toBeGreaterThan(10);
    }
  });

  it("signale un prélèvement au-delà de 90 % du plafond (jamais de faux « prêt »)", () => {
    const exp = { ...EXPEDITIONS[0], tonnages: { ...EXPEDITIONS[0].tonnages, p01: plafondTonnes(getParcelle("p01")!) * 0.95 } };
    const c = controleEmbarquement(exp, PARCELLES);
    const plafonds = c.points.find((p) => p.code === "plafonds")!;
    expect(plafonds.niveau).toBe("attention");
    expect(c.niveau).toBe("attention");
  });

  it("le lot de démonstration EXP-2026-0001 a des volumes sous 90 % des plafonds", () => {
    const c = controleEmbarquement(EXPEDITIONS[0], PARCELLES);
    expect(c.points.find((p) => p.code === "plafonds")!.niveau).toBe("ok");
    expect(c.points.find((p) => p.code === "references-ddr")!.niveau).toBe("ok");
  });

  it("un lot en composition sans navire reçoit le point logistique", () => {
    const c = controleEmbarquement(EXPEDITIONS[2], PARCELLES); // exp3 : composé, sans navire
    expect(c.points.find((p) => p.code === "logistique")!.niveau).toBe("attention");
    expect(c.niveau).toBe("attention");
  });
});

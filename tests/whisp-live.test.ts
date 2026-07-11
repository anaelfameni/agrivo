import { describe, expect, it } from "vitest";
import { extraireRisque, featureCollectionPour, risqueVersVerdict, whispLiveEnabled } from "@/lib/ai/whisp-live";
import { whispVerify } from "@/lib/ai/whisp";

describe("Whisp live — mapping défensif vers les trois verdicts de la charte", () => {
  it("risque faible → Conforme · risque élevé → Anomalie détectée", () => {
    expect(risqueVersVerdict("low")).toBe("conforme");
    expect(risqueVersVerdict("Low risk")).toBe("conforme");
    expect(risqueVersVerdict("no_risk")).toBe("conforme");
    expect(risqueVersVerdict("high")).toBe("anomalie");
    expect(risqueVersVerdict("HIGH RISK")).toBe("anomalie");
    expect(risqueVersVerdict("élevé")).toBe("anomalie");
  });

  it("toute ambiguïté → Données insuffisantes (prudence de la charte, jamais un faux Conforme)", () => {
    expect(risqueVersVerdict(null)).toBe("insuffisant");
    expect(risqueVersVerdict("more info needed")).toBe("insuffisant");
    expect(risqueVersVerdict("unknown")).toBe("insuffisant");
    expect(risqueVersVerdict("")).toBe("insuffisant");
    // « lowland » ne doit PAS matcher « low » (mot entier exigé).
    expect(risqueVersVerdict("lowland forest")).toBe("insuffisant");
  });

  it("extraireRisque trouve la première clé « risk » quel que soit l'emballage de la réponse", () => {
    expect(extraireRisque({ data: [{ plotId: 1, EUDR_risk: "low" }] })).toBe("low");
    expect(extraireRisque([{ whisp_risk_category: "high" }])).toBe("high");
    expect(extraireRisque({ results: { rows: [{ risk: "more info needed" }] } })).toBe("more info needed");
    expect(extraireRisque({ foo: "bar" })).toBeNull();
    expect(extraireRisque(null)).toBeNull();
  });

  it("featureCollectionPour construit un GeoJSON RFC 7946 valide (Polygon, un anneau)", () => {
    const ring = [[-6.65, 5.83], [-6.64, 5.83], [-6.64, 5.84], [-6.65, 5.83]];
    const fc = featureCollectionPour(ring) as { type: string; features: { geometry: { type: string; coordinates: number[][][] } }[] };
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features[0].geometry.type).toBe("Polygon");
    expect(fc.features[0].geometry.coordinates[0]).toEqual(ring);
  });

  it("robustesse sans clé : whispLiveEnabled() false, le moteur déterministe répond toujours", async () => {
    // Dans l'environnement de test, aucune WHISP_API_KEY n'est posée.
    expect(whispLiveEnabled()).toBe(false);
    const r = await whispVerify({ parcelleId: "p01" });
    expect(["conforme", "anomalie", "insuffisant"]).toContain(r.statut);
    expect(r.phrase.length).toBeGreaterThan(10);
  });
});

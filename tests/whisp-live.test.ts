import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CODE_PERTURBATION_APRES_2020,
  construireRequete,
  extraireRisque,
  parseWhispFeature,
  pct,
  pireRisque,
  risquePourFiliere,
  risqueVersVerdict,
  whispLiveEnabled,
  type WhispRisques,
} from "@/lib/ai/whisp-live";
import { whispVerify } from "@/lib/ai/whisp";

/** Réponse RÉELLE de l'API Whisp (11/07/2026, polygone d'1 ha près de Soubré, options officielles). */
const FIXTURE = JSON.parse(
  readFileSync(new URL("./fixtures/whisp-reponse-reelle.json", import.meta.url), "utf-8"),
) as {
  code: string;
  data: { features: Array<{ properties: Record<string, unknown> }> };
  context: { token: string };
};
const PROPS = FIXTURE.data.features[0].properties;

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

  it("extraireRisque (repli défensif) trouve la première clé « risk » quel que soit l'emballage", () => {
    expect(extraireRisque({ data: [{ plotId: 1, EUDR_risk: "low" }] })).toBe("low");
    expect(extraireRisque([{ whisp_risk_category: "high" }])).toBe("high");
    expect(extraireRisque({ results: { rows: [{ risk: "more info needed" }] } })).toBe("more info needed");
    expect(extraireRisque({ foo: "bar" })).toBeNull();
    expect(extraireRisque(null)).toBeNull();
  });
});

describe("Whisp live — requête aux paramètres du site officiel", () => {
  const ring = [
    [-6.65, 5.83],
    [-6.64, 5.83],
    [-6.64, 5.84],
    [-6.65, 5.83],
  ];

  it("construireRequete envoie les analysisOptions officielles (ha, données nationales CI, id externe)", () => {
    const req = construireRequete(ring, "p01") as {
      type: string;
      features: Array<{ properties: Record<string, unknown>; geometry: { type: string; coordinates: number[][][] } }>;
      analysisOptions: Record<string, unknown>;
    };
    expect(req.type).toBe("FeatureCollection");
    expect(req.features[0].geometry.type).toBe("Polygon");
    expect(req.features[0].geometry.coordinates[0]).toEqual(ring);
    expect(req.features[0].properties).toEqual({ agrivoId: "p01" });
    expect(req.analysisOptions).toMatchObject({
      unitType: "ha",
      nationalCodes: ["ci"],
      externalIdColumn: "agrivoId",
      async: false,
      geometryAuditTrail: false,
    });
  });

  it("sans id de parcelle : pas de colonne d'id externe, propriétés vides", () => {
    const req = construireRequete(ring) as {
      features: Array<{ properties: Record<string, unknown> }>;
      analysisOptions: Record<string, unknown>;
    };
    expect(req.features[0].properties).toEqual({});
    expect(req.analysisOptions.externalIdColumn).toBeUndefined();
  });
});

describe("Whisp live — parseur du schéma officiel v3 (fixture réelle de l'API)", () => {
  it("la fixture est bien une analyse terminée", () => {
    expect(FIXTURE.code).toBe("analysis_completed");
  });

  it("extrait les 11 indicateurs officiels, les 3 risques, la surface et la localisation", () => {
    const d = parseWhispFeature(PROPS, FIXTURE.context.token);
    expect(d.indicateurs).toHaveLength(11);
    expect(d.indicateurs[0]).toMatchObject({ code: "Ind_01_treecover", valeur: "no" });
    expect(d.indicateurs[1]).toMatchObject({ code: "Ind_02_commodities", valeur: "yes" });
    expect(d.indicateurs[3]).toMatchObject({ code: "Ind_04_disturbance_after_2020", valeur: "no" });
    expect(d.risques).toEqual({ pcrop: "low", acrop: "low", timber: "low" });
    expect(d.surfaceHa).toBeCloseTo(0.992, 2);
    expect(d.pays).toBe("CIV");
    expect(d.region).toBe("Bas-Sassandra");
    expect(d.version).toBe("3.0.0a14");
    expect(d.token).toBe(FIXTURE.context.token);
  });

  it("couvertures : % réels rapportés à la surface + la ligne « après 2020 » toujours présente", () => {
    const d = parseWhispFeature(PROPS);
    const gfc = d.couvertures.find((c) => c.code === "GFC_TC_2020");
    expect(gfc?.pct).toBe(95); // 0.941 ha / 0.992 ha
    const apres = d.couvertures.find((c) => c.code === CODE_PERTURBATION_APRES_2020);
    expect(apres?.pct).toBe(0); // aucune perturbation après le 31/12/2020 sur cette parcelle
  });

  it("pct : borné 0-100, null si surface absente ou nulle", () => {
    expect(pct(0.941, 0.992)).toBe(95);
    expect(pct(1.2, 0.9)).toBe(100);
    expect(pct(0.5, 0)).toBeNull();
    expect(pct("0.5", 1)).toBeNull();
    expect(pct(0.5, undefined)).toBeNull();
  });

  it("schéma inattendu (sans Ind_*/risk_*) : parse vide mais sans erreur, repli extraireRisque", () => {
    const d = parseWhispFeature({ foo: "bar" });
    expect(d.indicateurs).toHaveLength(0);
    expect(d.risques).toEqual({ pcrop: null, acrop: null, timber: null });
    expect(risquePourFiliere(d.risques, "cacao")).toBeNull();
  });
});

describe("Whisp live — catégorie de risque officielle par filière", () => {
  const risques: WhispRisques = { pcrop: "low", acrop: "high", timber: "more info needed" };

  it("cultures pérennes → risk_pcrop · soja → risk_acrop · bois → risk_timber", () => {
    expect(risquePourFiliere(risques, "cacao")).toBe("low");
    expect(risquePourFiliere(risques, "cafe")).toBe("low");
    expect(risquePourFiliere(risques, "hevea")).toBe("low");
    expect(risquePourFiliere(risques, "palmier")).toBe("low");
    expect(risquePourFiliere(risques, "soja")).toBe("high");
    expect(risquePourFiliere(risques, "bois")).toBe("more info needed");
  });

  it("bovins ou filière inconnue → le pire des trois (jamais de faux Conforme)", () => {
    expect(risquePourFiliere(risques, "bovins")).toBe("high");
    expect(risquePourFiliere(risques, undefined)).toBe("high");
    expect(risqueVersVerdict(risquePourFiliere({ pcrop: "low", acrop: "low", timber: "more info" }, "bovins"))).toBe(
      "insuffisant",
    );
    expect(risqueVersVerdict(risquePourFiliere({ pcrop: "low", acrop: "low", timber: "low" }, "bovins"))).toBe(
      "conforme",
    );
  });

  it("pireRisque : anomalie > insuffisant > conforme · tout vide → null", () => {
    expect(pireRisque({ pcrop: "low", acrop: "high", timber: "low" })).toBe("high");
    expect(pireRisque({ pcrop: "low", acrop: null, timber: "unknown" })).toBe("unknown");
    expect(pireRisque({ pcrop: "low", acrop: "low", timber: "low" })).toBe("low");
    expect(pireRisque({ pcrop: null, acrop: null, timber: null })).toBeNull();
  });

  it("catégorie de la filière absente → repli sur le pire des trois", () => {
    expect(risquePourFiliere({ pcrop: null, acrop: "high", timber: null }, "cacao")).toBe("high");
  });
});

describe("Whisp live — robustesse sans clé", () => {
  it("whispLiveEnabled() false, le moteur déterministe répond toujours", async () => {
    // Dans l'environnement de test, aucune WHISP_API_KEY n'est posée.
    expect(whispLiveEnabled()).toBe(false);
    const r = await whispVerify({ parcelleId: "p01" });
    expect(["conforme", "anomalie", "insuffisant"]).toContain(r.statut);
    expect(r.phrase.length).toBeGreaterThan(10);
  });
});

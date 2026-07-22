import { describe, expect, it } from "vitest";
import { PARCELLES, type Parcelle } from "@/data/mock-parcelles";
import { CADENCE_REVUE_JOURS, evaluerVeille, veilleParcelle } from "@/lib/surveillance/veille";

const base: Parcelle = {
  id: "t01",
  producteurNom: "Test Producteur",
  numeroCartePro: "CI-CCC-000001",
  cooperative: "Coop Test",
  region: "Nawa · Soubré",
  superficieHa: 2,
  filiere: "cacao",
  geojson: { type: "Point", coordinates: [-6.6, 5.78] },
  statut: "conforme",
  dateVerification: "2026-07-01",
  datePivotAnalyse: "2020-12-31",
  sourcesDonnees: [],
  numeroCertificat: "AGV-TEST-0001",
};

describe("surveillance continue du portefeuille (lib/surveillance/veille)", () => {
  it("une parcelle fraîchement vérifiée est à jour, avec sa prochaine revue à J+90", () => {
    const v = veilleParcelle(base, new Date("2026-07-18T00:00:00Z"));
    expect(v.etat).toBe("a-jour");
    expect(v.joursRetard).toBe(0);
    expect(v.prochaineRevue).toBe("2026-09-29"); // 2026-07-01 + 90 jours
    expect(CADENCE_REVUE_JOURS).toBe(90);
  });

  it("au-delà de la cadence, la revue devient due avec le retard exact", () => {
    const v = veilleParcelle(base, new Date("2026-10-09T00:00:00Z")); // J+100
    expect(v.etat).toBe("revue-due");
    expect(v.joursRetard).toBe(10);
  });

  it("une alerte active prime sur tout, même à jour de cadence", () => {
    const v = veilleParcelle({ ...base, alerteActive: true }, new Date("2026-07-18T00:00:00Z"));
    expect(v.etat).toBe("alerte");
  });

  it("le résumé classe : alertes d'abord, puis retard décroissant ; les comptes se recoupent", () => {
    const parcelles: Parcelle[] = [
      base, // à jour
      { ...base, id: "t02", dateVerification: "2026-03-01" }, // très en retard
      { ...base, id: "t03", dateVerification: "2026-04-05" }, // en retard
      { ...base, id: "t04", alerteActive: true }, // alerte
    ];
    const r = evaluerVeille(parcelles, new Date("2026-07-18T00:00:00Z"));
    expect(r.total).toBe(4);
    expect(r.aJour + r.revueDue + r.alertes).toBe(4);
    expect(r.alertes).toBe(1);
    expect(r.aTraiter[0].parcelleId).toBe("t04"); // l'alerte en tête
    expect(r.aTraiter[1].parcelleId).toBe("t02"); // puis le plus grand retard
  });

  it("sur le référentiel de démo, les alertes de veille = les parcelles à alerteActive", () => {
    const r = evaluerVeille(PARCELLES, new Date("2026-07-18T00:00:00Z"));
    expect(r.alertes).toBe(PARCELLES.filter((p) => p.alerteActive).length);
    expect(r.total).toBe(PARCELLES.length);
  });
});

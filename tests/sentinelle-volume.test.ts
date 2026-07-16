import { describe, it, expect } from "vitest";
import { PARCELLES, getParcelle } from "@/data/mock-parcelles";
import { findExpedition, plafondTonnes, tonnageExpedition, type Expedition } from "@/data/mock-expeditions";
import { evaluerSentinelleVolume, connaissementsDupliquesMarche } from "@/lib/sentinelle/volume";

describe("sentinelle de volume — verrou anti « blanchiment de cacao »", () => {
  it("ne signale rien sur un lot sain (volumes réconciliés, pesée cohérente)", () => {
    const exp = findExpedition("EXP-2026-0001")!;
    const r = evaluerSentinelleVolume(exp, PARCELLES);
    expect(r.anomalies).toHaveLength(0);
    expect(r.bloquant).toBe(false);
  });

  it("bloque un prélèvement au-delà du plafond agronomique d'une parcelle", () => {
    const exp = findExpedition("EXP-2026-0001")!;
    const plafond = plafondTonnes(getParcelle("p01")!); // 1,92 t
    const truque: Expedition = { ...exp, tonnages: { ...exp.tonnages, p01: plafond + 0.5 } };
    const r = evaluerSentinelleVolume(truque, PARCELLES);
    expect(r.bloquant).toBe(true);
    expect(r.anomalies.some((a) => a.categorie === "depassement-plafond")).toBe(true);
  });

  it("bloque un écart entre la pesée finale et le tonnage composé du lot", () => {
    const exp = findExpedition("EXP-2026-0001")!;
    const tonnage = tonnageExpedition(exp); // 5,9 t
    const truque: Expedition = {
      ...exp,
      journalPossession: (exp.journalPossession ?? []).map((j) =>
        j.code === "pesee" ? { ...j, tonnes: tonnage + 2 } : j,
      ),
    };
    const r = evaluerSentinelleVolume(truque, PARCELLES);
    expect(r.bloquant).toBe(true);
    expect(r.anomalies.some((a) => a.categorie === "ecart-pesee")).toBe(true);
  });

  it("bloque un connaissement dupliqué DANS le journal du lot", () => {
    const exp = findExpedition("EXP-2026-0001")!;
    const journal = exp.journalPossession ?? [];
    const num = journal.find((j) => j.code === "transport-connaissement")!.connaissement!;
    const truque: Expedition = {
      ...exp,
      journalPossession: [...journal, { code: "reception-magasin", date: "2026-06-11", connaissement: num }],
    };
    const r = evaluerSentinelleVolume(truque, PARCELLES);
    expect(r.bloquant).toBe(true);
    expect(r.anomalies.some((a) => a.categorie === "connaissement-duplique")).toBe(true);
  });

  it("chaque anomalie porte un détail bilingue non vide", () => {
    const exp = findExpedition("EXP-2026-0001")!;
    const truque: Expedition = { ...exp, tonnages: { ...exp.tonnages, p01: 99 } };
    const r = evaluerSentinelleVolume(truque, PARCELLES);
    expect(r.anomalies.length).toBeGreaterThan(0);
    for (const a of r.anomalies) {
      expect(a.detail.fr.length).toBeGreaterThan(10);
      expect(a.detail.en.length).toBeGreaterThan(10);
    }
  });

  it("détecte un connaissement partagé entre DEUX lots différents (audit croisé du marché)", () => {
    const a = findExpedition("EXP-2026-0001")!;
    const b: Expedition = {
      ...a,
      id: "clone",
      ref: "EXP-2026-9999",
      journalPossession: (a.journalPossession ?? []).map((j) => ({ ...j })),
    };
    const numPartage = (a.journalPossession ?? []).find((j) => j.connaissement)!.connaissement!;
    const dup = connaissementsDupliquesMarche([a, b]);
    expect(dup.has(numPartage)).toBe(true);
    // Sans doublon (un seul lot), l'ensemble est vide.
    expect(connaissementsDupliquesMarche([a]).size).toBe(0);
  });
});

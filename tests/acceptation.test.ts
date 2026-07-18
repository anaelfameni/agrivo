import { describe, expect, it } from "vitest";
import { PARCELLES } from "@/data/mock-parcelles";
import { EXPEDITIONS, tonnageExpedition } from "@/data/mock-expeditions";
import { construireDossierDds } from "@/lib/marketplace/dds-dossier";
import {
  ACCEPTATION_LABEL,
  ACCEPTATIONS_DEMO,
  acceptationPour,
  tonnesDossiersAcceptes,
  transitionsPossibles,
} from "@/lib/marketplace/acceptation";
import { etatCampagne } from "@/lib/marketplace/campagne";

describe("acceptation opérateur (North Star : tonnes couvertes par des dossiers acceptés)", () => {
  it("les seeds de démo sont cohérents : le seul dossier accepté est aussi un dossier complet", () => {
    for (const [ref, acc] of Object.entries(ACCEPTATIONS_DEMO)) {
      if (acc.statut !== "accepte") continue;
      const exp = EXPEDITIONS.find((e) => e.ref === ref);
      expect(exp).toBeDefined();
      expect(construireDossierDds(exp!, PARCELLES).pret).toBe(true);
    }
  });

  it("la North Star compte les tonnes de EXP-2026-0001 (accepté + complet), et rien d'autre", () => {
    const exp1 = EXPEDITIONS.find((e) => e.ref === "EXP-2026-0001")!;
    expect(tonnesDossiersAcceptes(PARCELLES)).toBe(Math.round(tonnageExpedition(exp1) * 10) / 10);
  });

  it("un dossier déclaré accepté mais INCOMPLET ne compte jamais (recalcul, pas de confiance aveugle)", () => {
    // EXP-2026-0007 : chaîne de possession volontairement incomplète → dossier jamais prêt.
    const tonnes = tonnesDossiersAcceptes(PARCELLES, {
      "EXP-2026-0007": { statut: "accepte", date: "2026-07-18" },
    });
    expect(tonnes).toBe(0);
  });

  it("gating des transitions : on ne transmet qu'un dossier prêt ; l'issue vient après transmission", () => {
    expect(transitionsPossibles("non-transmis", false)).toEqual([]);
    expect(transitionsPossibles("non-transmis", true)).toEqual(["transmis"]);
    expect(transitionsPossibles("transmis", true)).toEqual(["accepte", "reserves"]);
    expect(transitionsPossibles("reserves", true)).toEqual(["transmis"]);
    expect(transitionsPossibles("accepte", true)).toEqual([]);
  });

  it("libellés bilingues et repli non-transmis par défaut", () => {
    expect(acceptationPour("EXP-INCONNUE").statut).toBe("non-transmis");
    for (const label of Object.values(ACCEPTATION_LABEL)) {
      expect(label.fr.length).toBeGreaterThan(0);
      expect(label.en.length).toBeGreaterThan(0);
      expect(label.fr).not.toMatch(/garanti/i);
      expect(label.en).not.toMatch(/guarantee/i);
    }
  });

  it("l'état de campagne expose la North Star (tonnesDossiersAcceptes)", () => {
    const etat = etatCampagne(PARCELLES, new Date("2026-07-18"));
    expect(etat.tonnesDossiersAcceptes).toBeGreaterThan(0);
    expect(etat.tonnesDossiersAcceptes).toBe(tonnesDossiersAcceptes(PARCELLES));
  });
});

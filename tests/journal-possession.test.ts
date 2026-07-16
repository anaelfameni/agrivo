import { describe, it, expect } from "vitest";
import { PARCELLES } from "@/data/mock-parcelles";
import {
  POSSESSION_ORDRE,
  POSSESSION_LABEL,
  possessionComplete,
  findExpedition,
  type JalonPossession,
} from "@/data/mock-expeditions";
import { findMarketLot } from "@/data/mock-marketplace";

const JOURNAL_COMPLET: JalonPossession[] = [
  { code: "achat-bord-champ", date: "2026-06-01", tonnes: 5 },
  { code: "transport-connaissement", date: "2026-06-02", connaissement: "CNT-TEST-01", tonnes: 5 },
  { code: "reception-magasin", date: "2026-06-03", tonnes: 5 },
  { code: "pesee", date: "2026-06-04", tonnes: 5 },
];

describe("journal de possession — la chaîne amont (bord champ → pesée)", () => {
  it("l'ordre canonique compte 4 maillons, chacun avec un libellé bilingue", () => {
    expect(POSSESSION_ORDRE).toHaveLength(4);
    for (const code of POSSESSION_ORDRE) {
      expect(POSSESSION_LABEL[code].fr.length).toBeGreaterThan(2);
      expect(POSSESSION_LABEL[code].en.length).toBeGreaterThan(2);
    }
  });

  it("possessionComplete exige les 4 maillons ET un connaissement sur le transport", () => {
    expect(possessionComplete(JOURNAL_COMPLET)).toBe(true);
    // Un maillon manquant (pas de pesée) casse la continuité.
    expect(possessionComplete(JOURNAL_COMPLET.slice(0, 3))).toBe(false);
    // Transport sans numéro de connaissement = remise non documentée.
    const sansConnaissement = JOURNAL_COMPLET.map((j) =>
      j.code === "transport-connaissement" ? { ...j, connaissement: undefined } : j,
    );
    expect(possessionComplete(sansConnaissement)).toBe(false);
  });

  it("les expéditions de démonstration portent un journal de possession complet", () => {
    for (const ref of ["EXP-2026-0001", "EXP-2026-0002", "EXP-2026-0003"]) {
      const exp = findExpedition(ref)!;
      expect(possessionComplete(exp.journalPossession ?? [])).toBe(true);
    }
  });

  it("le MarketLot expose son journal de possession dans l'ordre canonique", () => {
    const lot = findMarketLot("EXP-2026-0001", PARCELLES)!;
    expect(lot.journalPossession.length).toBeGreaterThanOrEqual(4);
    const codesPresents = lot.journalPossession.map((j) => j.code);
    // Les maillons présents apparaissent dans l'ordre de POSSESSION_ORDRE.
    const positions = codesPresents.map((c) => POSSESSION_ORDRE.indexOf(c));
    const trie = [...positions].sort((a, b) => a - b);
    expect(positions).toEqual(trie);
  });

  it("le lot 0007 (réconciliation en cours) a un journal de possession INCOMPLET", () => {
    const lot = findMarketLot("EXP-2026-0007", PARCELLES)!;
    expect(possessionComplete(lot.journalPossession)).toBe(false);
    expect(lot.sceau.statut).toBe("en-preparation");
  });
});

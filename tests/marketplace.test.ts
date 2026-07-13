import { describe, it, expect } from "vitest";
import { PARCELLES } from "@/data/mock-parcelles";
import { findExpedition } from "@/data/mock-expeditions";
import {
  estProducteurCarte,
  evaluerSceau,
  takeRate,
  valeurLotFcfa,
  lotsMarche,
  estVendable,
  findMarketLot,
  findMarketExpedition,
  parcellesDuLot,
  MARKET_LOT_REFS,
  TAUX_COMMISSION_DEFAUT,
  TAUX_COMMISSION_MAX,
} from "@/data/mock-marketplace";

describe("carte producteur (ancre anti-fraude)", () => {
  it("reconnaît une carte CCC valide", () => {
    expect(estProducteurCarte("CI-CCC-024517")).toBe(true);
    expect(estProducteurCarte("ci-ccc-031204")).toBe(true); // insensible à la casse
  });
  it("rejette une carte absente ou hors format", () => {
    expect(estProducteurCarte("")).toBe(false);
    expect(estProducteurCarte("NON-CARTE")).toBe(false);
    expect(estProducteurCarte("CI-XXX-1")).toBe(false);
  });
});

describe("sceau AGRIVO (double verrou)", () => {
  it("évalue les 4 critères et vérifie un lot 100 % conforme + carté + prêt", () => {
    const exp = findExpedition("EXP-2026-0001")!;
    const sceau = evaluerSceau(exp, PARCELLES);
    expect(sceau.criteres).toHaveLength(4);
    // EXP-2026-0001 = p01..p04, toutes conformes, cartées CCC, DDR présentes, contrôle « Prêt »
    expect(sceau.statut).toBe("verifie");
    expect(sceau.criteres.every((c) => c.ok)).toBe(true);
  });

  it("ne délivre jamais un faux sceau : un producteur non carté fait échouer le critère carte", () => {
    const exp = findExpedition("EXP-2026-0001")!;
    // On simule un producteur non carté sur la 1ʳᵉ parcelle du lot.
    const parcellesTruquees = PARCELLES.map((p) =>
      p.id === exp.parcelleIds[0] ? { ...p, numeroCartePro: "NON-CARTE" } : p,
    );
    const sceau = evaluerSceau(exp, parcellesTruquees);
    const carte = sceau.criteres.find((c) => c.code === "carte-producteur")!;
    expect(carte.ok).toBe(false);
    expect(sceau.statut).toBe("en-preparation");
  });
});

describe("take-rate (revenu marketplace)", () => {
  it("calcule la valeur d'un lot en FCFA (tonnage × 1000 × prix/kg)", () => {
    expect(valeurLotFcfa(10, 3000)).toBe(30_000_000);
  });
  it("applique le taux par défaut de 2 %", () => {
    expect(takeRate(30_000_000)).toBe(600_000);
    expect(takeRate(30_000_000, TAUX_COMMISSION_DEFAUT)).toBe(600_000);
  });
  it("borne le taux entre 1 % et 3 %", () => {
    expect(takeRate(1_000_000, 0.5)).toBe(Math.round(1_000_000 * TAUX_COMMISSION_MAX));
    expect(takeRate(1_000_000, 0)).toBe(Math.round(1_000_000 * 0.01));
  });
});

describe("lots du marché", () => {
  it("dérive des lots depuis les expéditions seedées, avec sceau recalculé", () => {
    const lots = lotsMarche(PARCELLES);
    expect(lots.length).toBeGreaterThan(0);
    for (const lot of lots) {
      expect(lot.ref).toMatch(/^EXP-/);
      expect(lot.valeurFcfa).toBe(valeurLotFcfa(lot.tonnage, lot.prixIndicatifFcfaKg));
      expect(["verifie", "en-preparation"]).toContain(lot.sceau.statut);
    }
  });
  it("n'est vendable que si le sceau est vérifié ET le lot listé", () => {
    const lots = lotsMarche(PARCELLES);
    for (const lot of lots) {
      if (estVendable(lot)) {
        expect(lot.sceau.statut).toBe("verifie");
        expect(lot.statutMarche).toBe("liste");
      }
    }
  });

  it("le catalogue est vivant : ≥ 5 lots, dont ≥ 1 réservé et ≥ 1 en préparation", () => {
    const lots = lotsMarche(PARCELLES);
    expect(lots.length).toBeGreaterThanOrEqual(5);
    expect(lots.some((l) => l.statutMarche === "reserve")).toBe(true);
    expect(lots.some((l) => l.sceau.statut === "en-preparation")).toBe(true);
    // Au moins un lot pleinement vendable pour animer la vitrine.
    expect(lots.some((l) => estVendable(l))).toBe(true);
  });

  it("un lot réservé expose son acheteur ; un lot en préparation n'est pas vendable", () => {
    const lots = lotsMarche(PARCELLES);
    const reserve = lots.find((l) => l.statutMarche === "reserve")!;
    expect(reserve.acheteur).toBeTruthy();
    expect(estVendable(reserve)).toBe(false);
    const prep = lots.find((l) => l.sceau.statut === "en-preparation")!;
    expect(estVendable(prep)).toBe(false);
  });
});

describe("fiche lot publique (findMarketLot / findMarketExpedition)", () => {
  it("chaque référence du catalogue résout un lot ET son expédition source", () => {
    expect(MARKET_LOT_REFS.length).toBeGreaterThanOrEqual(5);
    for (const ref of MARKET_LOT_REFS) {
      const lot = findMarketLot(ref, PARCELLES);
      const exp = findMarketExpedition(ref);
      expect(lot, ref).toBeDefined();
      expect(exp, ref).toBeDefined();
      expect(lot!.ref).toBe(ref);
      // Les parcelles du lot se résolvent toutes (aucun id fantôme).
      expect(parcellesDuLot(lot!)).toHaveLength(lot!.nbParcelles);
      expect(parcellesDuLot(lot!).length).toBe(exp!.parcelleIds.length);
    }
  });

  it("rejette une référence inconnue (casse/espaces tolérés)", () => {
    expect(findMarketLot("EXP-9999-0000", PARCELLES)).toBeUndefined();
    expect(findMarketLot("", PARCELLES)).toBeUndefined();
    const first = MARKET_LOT_REFS[0];
    expect(findMarketLot(`  ${first.toLowerCase()} `, PARCELLES)?.ref).toBe(first);
  });
});

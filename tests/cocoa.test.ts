import { describe, it, expect } from "vitest";
import {
  normaliseCocoa,
  snapshotFallback,
  primeVsIce,
  rangeParams,
  FX_USD_FCFA_DEFAUT,
} from "@/lib/market/cocoa";

/** Charge utile Yahoo Finance réduite mais fidèle (un `close` null à filtrer, comme en vrai). */
const FIXTURE = {
  chart: {
    result: [
      {
        meta: {
          currency: "USD",
          symbol: "CC=F",
          fullExchangeName: "ICE Futures",
          instrumentType: "FUTURE",
          regularMarketPrice: 5552,
          chartPreviousClose: 5959,
          previousClose: 6065,
          regularMarketTime: 1783940152,
        },
        timestamp: [1783500300, 1783586700, 1783673100, 1783759500, 1783940152],
        indicators: { quote: [{ close: [5959, 5810, null, 5620, 5552] }] },
      },
    ],
  },
};

describe("cours cacao ICE — normalisation Yahoo", () => {
  it("normalise, filtre les clôtures nulles et calcule la variation", () => {
    const q = normaliseCocoa(FIXTURE, "1M");
    expect(q.symbol).toBe("CC=F");
    expect(q.currency).toBe("USD");
    expect(q.exchange).toBe("ICE Futures");
    // 5 timestamps, 1 close null → 4 points exploitables.
    expect(q.points).toHaveLength(4);
    expect(q.points.every((p) => Number.isFinite(p.c))).toBe(true);
    expect(q.price).toBe(5552);
    expect(q.prevClose).toBe(5959);
    expect(q.changeAbs).toBe(5552 - 5959);
    expect(q.changePct).toBeCloseTo((-407 / 5959) * 100, 1);
    expect(q.delayed).toBe(true);
    expect(q.stale).toBe(false);
    expect(q.range).toBe("1M");
  });

  it("jette sur une charge utile invalide (l'appelant servira le repli)", () => {
    expect(() => normaliseCocoa({}, "1M")).toThrow();
    expect(() => normaliseCocoa({ chart: { result: [{ meta: {} }] } }, "1M")).toThrow();
  });

  it("mappe les plages de l'UI vers les paramètres Yahoo", () => {
    expect(rangeParams("1J")).toEqual({ range: "1d", interval: "5m" });
    expect(rangeParams("1A")).toEqual({ range: "1y", interval: "1wk" });
    expect(rangeParams("inconnu")).toEqual({ range: "1mo", interval: "1d" }); // repli 1M
  });
});

describe("cours cacao — repli (dernier cours connu)", () => {
  it("sert un instantané non vide, marqué stale mais toujours différé", () => {
    const q = snapshotFallback("1S");
    expect(q.stale).toBe(true);
    expect(q.delayed).toBe(true);
    expect(q.source).toBe("dernier cours connu");
    expect(q.points.length).toBeGreaterThan(1);
    expect(q.range).toBe("1S");
  });
});

describe("prime / décote vs ICE", () => {
  it("convertit le cours ICE (USD/t) en FCFA/kg puis calcule l'écart du lot", () => {
    const r = primeVsIce(3100, 5552); // FX par défaut
    expect(r.fxUsdFcfa).toBe(FX_USD_FCFA_DEFAUT);
    // 5552 USD/t × 605 / 1000 = 3358,96 → arrondi 3359 FCFA/kg
    expect(r.iceFcfaKg).toBe(3359);
    // 3100 < 3359 → décote (pct négatif)
    expect(r.pct).toBeLessThan(0);
  });

  it("respecte un FX personnalisé et le signe de la prime", () => {
    const r = primeVsIce(4000, 5552, 600); // prix au-dessus du cours converti → prime
    expect(r.iceFcfaKg).toBe(Math.round((5552 * 600) / 1000));
    expect(r.pct).toBeGreaterThan(0);
  });
});

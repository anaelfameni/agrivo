import { describe, it, expect } from "vitest";
import { mesureValide, statsOnboarding, type MesureOnboarding } from "@/lib/mesure/onboarding";

const min = (n: number) => n * 60_000;
const mesure = (dureeMin: number, etapes = 6): MesureOnboarding => ({ debut: 0, fin: min(dureeMin), etapes });

describe("compteur de coût d'onboarding — agrégats purs", () => {
  it("écarte les mesures implausibles (trop courtes, trop longues, sans étape)", () => {
    expect(mesureValide({ debut: 0, fin: 10_000, etapes: 6 })).toBe(false); // 10 s
    expect(mesureValide({ debut: 0, fin: min(300), etapes: 6 })).toBe(false); // 5 h (onglet oublié)
    expect(mesureValide({ debut: 0, fin: min(8), etapes: 0 })).toBe(false);
    expect(mesureValide(mesure(8))).toBe(true);
  });

  it("calcule moyenne et médiane en minutes (1 décimale)", () => {
    const stats = statsOnboarding([mesure(6), mesure(8), mesure(13)]);
    expect(stats.n).toBe(3);
    expect(stats.moyenneMin).toBe(9);
    expect(stats.medianeMin).toBe(8);
  });

  it("médiane paire = moyenne des deux mesures centrales ; invalides jamais comptées", () => {
    const stats = statsOnboarding([mesure(6), mesure(10), mesure(300), { debut: 0, fin: 5_000, etapes: 6 }]);
    expect(stats.n).toBe(2); // 300 min (5 h) et 5 s écartées
    expect(stats.medianeMin).toBe(8);
  });

  it("zéro mesure = zéros propres (jamais NaN)", () => {
    expect(statsOnboarding([])).toEqual({ n: 0, moyenneMin: 0, medianeMin: 0 });
  });
});

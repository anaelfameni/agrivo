import { describe, expect, it } from "vitest";
import {
  MIN_WAYPOINT_M,
  arrondi6,
  dansEmpriseCI,
  distanceCumuleeM,
  estNouveauWaypoint,
  fermerAnneau,
  haversineM,
} from "@/lib/geo/terrain";
import { chargerLive, cleLive } from "@/lib/ai/live-cache";

// Repères : Soubré rural ~[-6.65, 5.83] ; 0,001° de latitude ≈ 111,2 m partout sur le globe.
const SOUBRE: number[] = [-6.65, 5.83];

describe("mode terrain — géométrie du tour de champ GPS réel", () => {
  it("haversineM : 0 m entre un point et lui-même, ~111 m pour 0,001° de latitude", () => {
    expect(haversineM(SOUBRE, SOUBRE)).toBe(0);
    const d = haversineM(SOUBRE, [SOUBRE[0], SOUBRE[1] + 0.001]);
    expect(d).toBeGreaterThan(105);
    expect(d).toBeLessThan(118);
  });

  it("distanceCumuleeM : additionne les segments de la trace (0 pour moins de 2 points)", () => {
    expect(distanceCumuleeM([])).toBe(0);
    expect(distanceCumuleeM([SOUBRE])).toBe(0);
    const a = SOUBRE;
    const b = [SOUBRE[0], SOUBRE[1] + 0.001];
    const c = [SOUBRE[0], SOUBRE[1] + 0.002];
    expect(distanceCumuleeM([a, b, c])).toBeCloseTo(haversineM(a, b) + haversineM(b, c), 6);
  });

  it("estNouveauWaypoint : premier fix accepté, bruit GPS à l'arrêt filtré sous le seuil", () => {
    expect(estNouveauWaypoint(undefined, SOUBRE)).toBe(true);
    // ~1,1 m plus loin : bruit à l'arrêt, pas un waypoint.
    expect(estNouveauWaypoint(SOUBRE, [SOUBRE[0], SOUBRE[1] + 0.00001])).toBe(false);
    // ~111 m plus loin : nouveau waypoint.
    expect(estNouveauWaypoint(SOUBRE, [SOUBRE[0], SOUBRE[1] + 0.001])).toBe(true);
    expect(MIN_WAYPOINT_M).toBeGreaterThan(0);
  });

  it("arrondi6 : coordonnées au standard RFC 7946 (6 décimales)", () => {
    expect(arrondi6(-6.6478004999)).toBe(-6.6478);
    expect(arrondi6(5.8321006)).toBe(5.832101);
  });

  it("fermerAnneau : répète le premier sommet en dernier, sans doubler un anneau déjà fermé", () => {
    const ouvert = [
      [-6.6478, 5.8321],
      [-6.6461, 5.833],
      [-6.6452, 5.8318],
    ];
    const ferme = fermerAnneau(ouvert);
    expect(ferme).toHaveLength(4);
    expect(ferme[ferme.length - 1]).toEqual(ouvert[0]);
    expect(fermerAnneau(ferme)).toHaveLength(4); // idempotent
    expect(fermerAnneau([SOUBRE])).toHaveLength(1); // pas d'anneau sous 3 sommets
  });

  it("dansEmpriseCI : Soubré accepté, coordonnées hors Côte d'Ivoire refusées", () => {
    expect(dansEmpriseCI([SOUBRE, [-4.02, 5.34]])).toBe(true); // Soubré + Abidjan
    expect(dansEmpriseCI([[2.35, 48.85]])).toBe(false); // Paris
    expect(dansEmpriseCI([SOUBRE, [2.35, 48.85]])).toBe(false); // un seul point hors zone suffit
  });
});

describe("cache client des réponses IA live (filet anti-quota de démonstration)", () => {
  it("cleLive : déterministe pour un même payload, distincte pour des payloads différents", () => {
    const p = { resume: { total: 30, categories: [] }, lang: "fr" };
    expect(cleLive("audit-plan", p)).toBe(cleLive("audit-plan", { resume: { total: 30, categories: [] }, lang: "fr" }));
    expect(cleLive("audit-plan", p)).not.toBe(cleLive("audit-plan", { ...p, lang: "en" }));
    expect(cleLive("audit-plan", p)).not.toBe(cleLive("valorisation-memo", p));
  });

  it("chargerLive : renvoie null sans navigateur (jamais d'exception hors client)", () => {
    expect(chargerLive("audit-plan", { lang: "fr" })).toBeNull();
  });
});

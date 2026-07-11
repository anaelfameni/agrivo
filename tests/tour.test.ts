import { describe, expect, it } from "vitest";
import { TOUR_KEY_COOP, TOUR_KEY_EXPORTER, tourKey, reinitialiserTour } from "@/lib/tour";

describe("guide interactif — clés et réinitialisation à la connexion démo", () => {
  it("associe chaque rôle à sa clé (rôle inconnu → parcours coopérative)", () => {
    expect(tourKey("exporter")).toBe(TOUR_KEY_EXPORTER);
    expect(tourKey("coop")).toBe(TOUR_KEY_COOP);
    expect(tourKey("admin")).toBe(TOUR_KEY_COOP);
    expect(TOUR_KEY_COOP).not.toBe(TOUR_KEY_EXPORTER);
  });

  it("ne jette jamais quand le stockage est indisponible (environnement Node)", () => {
    expect(() => reinitialiserTour()).not.toThrow();
  });

  it("efface les deux drapeaux « visite vue » (stockage simulé)", () => {
    const store = new Map<string, string>();
    const fake = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    const g = globalThis as { localStorage?: typeof fake };
    const original = g.localStorage;
    g.localStorage = fake;
    try {
      store.set(TOUR_KEY_COOP, "1");
      store.set(TOUR_KEY_EXPORTER, "1");
      store.set("agrivo:session", "conservée");
      reinitialiserTour();
      expect(store.has(TOUR_KEY_COOP)).toBe(false);
      expect(store.has(TOUR_KEY_EXPORTER)).toBe(false);
      expect(store.get("agrivo:session")).toBe("conservée"); // ne touche que le guide
    } finally {
      if (original === undefined) delete g.localStorage;
      else g.localStorage = original;
    }
  });
});

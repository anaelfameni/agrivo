import { describe, it, expect } from "vitest";
import {
  sauverBrouillon,
  lireBrouillon,
  effacerBrouillon,
  CLE_BROUILLON,
  BROUILLON_TTL_MS,
  type StorageLike,
} from "@/lib/hors-ligne/brouillon";

function memoire(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe("brouillon hors ligne du parcours de vérification", () => {
  it("sauvegarde puis relit un parcours en cours (étapes 2..6)", () => {
    const s = memoire();
    sauverBrouillon({ step: 4, parcelleId: "p01", whisp: { statut: "conforme" } }, s);
    const b = lireBrouillon(s)!;
    expect(b.step).toBe(4);
    expect(b.parcelleId).toBe("p01");
    expect((b.whisp as { statut: string }).statut).toBe("conforme");
  });

  it("refuse de sauvegarder hors du parcours (étape 1 ou écran de fin)", () => {
    const s = memoire();
    sauverBrouillon({ step: 1 }, s);
    sauverBrouillon({ step: 7 }, s);
    expect(lireBrouillon(s)).toBeNull();
  });

  it("un brouillon périmé (plus de 7 jours) n'est plus proposé", () => {
    const s = memoire();
    sauverBrouillon({ step: 3, parcelleId: "p01" }, s);
    const apresTtl = Date.now() + BROUILLON_TTL_MS + 1000;
    expect(lireBrouillon(s, apresTtl)).toBeNull();
  });

  it("un brouillon corrompu est ignoré sans jeter ; effacer nettoie", () => {
    const s = memoire();
    s.setItem(CLE_BROUILLON, "{pas du json");
    expect(lireBrouillon(s)).toBeNull();
    sauverBrouillon({ step: 2 }, s);
    effacerBrouillon(s);
    expect(lireBrouillon(s)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { findCertificat, PARCELLES, SCENARIOS_DEMO } from "@/data/mock-parcelles";

describe("vérification publique — findCertificat (QR du PDF téléchargé)", () => {
  it("résout TOUS les certificats que le site peut émettre (portefeuille + scénarios)", () => {
    for (const p of [...PARCELLES, ...SCENARIOS_DEMO]) {
      const trouve = findCertificat(p.numeroCertificat);
      expect(trouve, `QR ${p.numeroCertificat} (${p.id}) doit résoudre`).toBeDefined();
      expect(trouve!.producteurNom).toBe(p.producteurNom);
      expect(trouve!.statut).toBe(p.statut);
    }
  });

  it("résout les scénarios de démo par leur numéro exact (le QR de leur PDF)", () => {
    expect(findCertificat("AGV-2026-0600")?.id).toBe("sc-conforme");
    expect(findCertificat("AGV-2026-0602")?.id).toBe("sc-anomalie");
  });

  it("est insensible à la casse et aux espaces (saisie manuelle du numéro)", () => {
    expect(findCertificat("  agv-2026-0417 ")?.id).toBe("p01");
  });

  it("rend undefined pour un numéro inconnu ou vide (jamais de faux certificat)", () => {
    expect(findCertificat("AGV-9999-0000")).toBeUndefined();
    expect(findCertificat("")).toBeUndefined();
    expect(findCertificat("   ")).toBeUndefined();
  });

  it("aucun doublon de numéro entre portefeuille et scénarios", () => {
    const nums = [...PARCELLES, ...SCENARIOS_DEMO].map((p) => p.numeroCertificat);
    expect(new Set(nums).size).toBe(nums.length);
  });
});

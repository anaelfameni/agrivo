import { describe, expect, it } from "vitest";
import {
  FAITS_RDUE,
  HORS_PERIMETRE_FINANCE,
  HORS_SUJET,
  QUESTIONS_SUGGEREES,
  faitsPourPrompt,
  repondreDeterministe,
} from "@/lib/ai/rdue-faits";

describe("Copilote RDUE — appariement déterministe des faits", () => {
  it("apparie la définition du règlement", () => {
    const r = repondreDeterministe("Qu'est-ce que le RDUE exactement ?", "fr");
    expect(r.faitId).toBe("definition");
    expect(r.horsPerimetre).toBe(false);
    expect(r.reponse).toContain("2023/1115");
    expect(r.source).toBeTruthy();
  });

  it("apparie les échéances (paraphrase « quand » / « report »)", () => {
    expect(repondreDeterministe("Le règlement peut-il encore être reporté ?", "fr").faitId).toBe("echeances");
    expect(repondreDeterministe("C'est pour quelle date l'entrée en vigueur ?", "fr").faitId).toBe("echeances");
  });

  it("apparie le cas Côte d'Ivoire", () => {
    const r = repondreDeterministe("La Côte d'Ivoire est-elle vraiment concernée ?", "fr");
    expect(r.faitId).toBe("cote-ivoire");
    expect(r.reponse.toLowerCase()).toContain("risque standard");
  });

  it("apparie « qui dépose la déclaration »", () => {
    expect(repondreDeterministe("Qui doit déposer la déclaration de diligence ?", "fr").faitId).toBe("qui-declare");
  });

  it("apparie la date de coupure 2020", () => {
    expect(repondreDeterministe("Quelle est la date de référence pour la déforestation ?", "fr").faitId).toBe("cutoff");
  });
});

describe("Copilote RDUE — garde-fou charte (frontière Nanti)", () => {
  it("intercepte toute question de crédit AVANT tout appariement", () => {
    for (const q of ["Puis-je obtenir un crédit ?", "Vous faites du préfinancement ?", "Un prêt pour le planteur ?", "Quel plafond de financement ?"]) {
      const r = repondreDeterministe(q, "fr");
      expect(r.horsPerimetre).toBe(true);
      expect(r.faitId).toBeNull();
      expect(r.reponse).toBe(HORS_PERIMETRE_FINANCE.fr);
    }
  });

  it("aucune réponse déterministe ne promet de garantie ni de financement", () => {
    for (const f of FAITS_RDUE) {
      for (const lang of ["fr", "en"] as const) {
        // « prix garanti » (bord champ fixé par l'État) est la formulation de charte autorisée :
        // on l'exclut AVANT de contrôler que « garantie » n'apparaît qu'en négation.
        const txt = f.reponse[lang].toLowerCase().replace(/prix garanti|guaranteed price/g, "");
        if (txt.includes("garanti")) expect(txt).toMatch(/jamais une garantie|never a .*guarantee/);
        expect(txt).not.toMatch(/\bcrédit\b|\bprêt\b|financement/);
      }
    }
  });
});

describe("Copilote RDUE — robustesse", () => {
  it("renvoie le message hors-sujet quand rien ne correspond", () => {
    const r = repondreDeterministe("Quelle est la météo à Abidjan demain ?", "fr");
    expect(r.horsPerimetre).toBe(true);
    expect(r.faitId).toBeNull();
    expect(r.reponse).toBe(HORS_SUJET.fr);
  });

  it("répond en anglais quand lang = en", () => {
    const r = repondreDeterministe("What are the deadlines?", "en");
    expect(r.faitId).toBe("echeances");
    expect(r.reponse).toContain("2027");
    expect(r.reponse).not.toContain("décembre");
  });

  it("le prompt de grounding inclut chaque fait curé", () => {
    const prompt = faitsPourPrompt("fr");
    for (const f of FAITS_RDUE) expect(prompt).toContain(`[${f.id}]`);
  });

  it("chaque fait est complet et bilingue, chaque question suggérée aussi", () => {
    for (const f of FAITS_RDUE) {
      expect(f.motsCles.length).toBeGreaterThan(0);
      for (const lang of ["fr", "en"] as const) {
        expect(f.question[lang].length).toBeGreaterThan(3);
        expect(f.reponse[lang].length).toBeGreaterThan(10);
        expect(f.source[lang].length).toBeGreaterThan(1);
      }
    }
    for (const s of QUESTIONS_SUGGEREES) {
      expect(s.fr.length).toBeGreaterThan(3);
      expect(s.en.length).toBeGreaterThan(3);
    }
  });
});

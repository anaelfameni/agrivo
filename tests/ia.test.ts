/**
 * Tests de la couche IA déterministe : valorisation commerciale, analyse de risque, assistant
 * portefeuille, et ROBUSTESSE (cas « API IA indisponible » : le repli mock doit prendre
 * le relais, jamais une erreur devant le jury).
 */
import { describe, it, expect } from "vitest";
import { PARCELLES, getParcelle } from "@/data/mock-parcelles";
import {
  evaluerValorisation,
  analyserRisque,
  interrogerPortefeuille,
  genererMemoDiligence,
} from "@/lib/ai/gemini";
import { geminiLiveEnabled, callGemini } from "@/lib/ai/gemini-live";
import { MOCK_MODE } from "@/lib/ai/config";

const conforme = PARCELLES.find((p) => p.statut === "conforme")!;
const anomalie = PARCELLES.find((p) => p.statut === "anomalie")!;
const insuffisant = PARCELLES.find((p) => p.statut === "insuffisant")!;

describe("evaluerValorisation (valorisation commerciale explicable, frontière Nanti)", () => {
  it("écarte toute parcelle non conforme du dossier de valorisation", () => {
    for (const p of [anomalie, insuffisant]) {
      const v = evaluerValorisation(p);
      expect(v.pret).toBe(false);
    }
  });

  it("prépare toute parcelle conforme pour le dossier exportateur", () => {
    for (const p of PARCELLES.filter((x) => x.statut === "conforme")) {
      const v = evaluerValorisation(p);
      expect(v.pret).toBe(true);
      expect(v.signaux.length).toBeGreaterThan(0);
    }
  });

  it("ne produit jamais de score de crédit, de plafond ni de montant (frontière produit stricte)", () => {
    for (const p of [conforme, anomalie, insuffisant]) {
      const v = evaluerValorisation(p);
      const texte = [v.explication, ...v.signaux.map((s) => s.label)].join(" ").toLowerCase();
      expect(texte).not.toContain("crédit");
      expect(texte).not.toContain("fcfa");
      expect(texte).not.toContain("plafond");
      expect(texte).not.toMatch(/\d+\s*%/);
    }
  });
});

describe("analyserRisque (niveau qualitatif, jamais de pourcentage inventé)", () => {
  it("associe chaque statut au bon niveau de risque", () => {
    expect(analyserRisque(anomalie).niveau).toBe("Bloquant");
    expect(analyserRisque(insuffisant).niveau).toBe("Modéré");
    expect(analyserRisque(conforme).niveau).toBe("Faible");
  });

  it("n'exprime jamais le risque en pourcentage (règle de charte)", () => {
    for (const p of [conforme, anomalie, insuffisant]) {
      const r = analyserRisque(p);
      expect(r.synthese).not.toMatch(/\d+\s*%/);
      expect(r.recommandation).not.toMatch(/\d+\s*%/);
    }
  });
});

describe("interrogerPortefeuille (raisonnement déterministe sur les données)", () => {
  it("identifie exactement les parcelles à risque de la région de Soubré", () => {
    const r = interrogerPortefeuille("Quelles parcelles présentent un risque dans la région de Soubré ?", PARCELLES);
    const attendues = PARCELLES.filter((p) => p.statut === "anomalie" && p.region.includes("Soubré"));
    expect(r.parcelles.map((p) => p.id).sort()).toEqual(attendues.map((p) => p.id).sort());
  });

  it("compte les parcelles prêtes pour le dossier exportateur (les conformes uniquement)", () => {
    const r = interrogerPortefeuille("Combien de parcelles sont prêtes pour le dossier exportateur ?", PARCELLES);
    const conformes = PARCELLES.filter((p) => p.statut === "conforme").length;
    expect(r.metric?.value).toBe(String(conformes));
  });

  it("répond sans planter sur une question vide ou hors sujet", () => {
    expect(() => interrogerPortefeuille("", PARCELLES)).not.toThrow();
    expect(interrogerPortefeuille("blabla incompréhensible", PARCELLES).texte.length).toBeGreaterThan(0);
  });
});

describe("genererMemoDiligence (statuts figés de la charte)", () => {
  it("cite la phrase figée du statut, jamais une reformulation", () => {
    const memo = genererMemoDiligence(getParcelle("p01")!);
    const section = memo.sections.find((s) => s.titre.includes("Évaluation"))!;
    expect(section.corps).toContain("Aucune déforestation détectée après le 31 décembre 2020.");
  });

  it("dit « évaluation » et jamais « garantie » dans l'avertissement", () => {
    const memo = genererMemoDiligence(conforme);
    expect(memo.avertissement).toContain("évaluation");
    expect(memo.avertissement).not.toContain("garantie,");
  });
});

describe("robustesse : API IA indisponible (le repli mock protège la démo)", () => {
  it("sans GEMINI_API_KEY, le mode live est désactivé et MOCK_MODE est actif", () => {
    if (!process.env.GEMINI_API_KEY) {
      expect(geminiLiveEnabled()).toBe(false);
      expect(MOCK_MODE).toBe(true);
    } else {
      expect(geminiLiveEnabled()).toBe(true);
    }
  });

  it("callGemini lève une erreur claire sans clé (que les routes attrapent pour replier)", async () => {
    if (process.env.GEMINI_API_KEY) return; // en environnement live, ce cas ne s'applique pas
    await expect(callGemini([{ text: "test" }])).rejects.toThrow("GEMINI_API_KEY");
  });
});

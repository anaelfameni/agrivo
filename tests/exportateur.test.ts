import { describe, expect, it } from "vitest";
import { COOPERATIVES_INFO, coopInfoParNom, statsPourCoop } from "@/data/cooperatives";
import { PARCELLES, COOP_DEMO, cooperatives } from "@/data/mock-parcelles";
import { ZONE_CI } from "@/lib/registre/audit";
import {
  ANOMALIE_ACTIONS,
  INSUFFISANT_ACTIONS,
  INSUFFISANT_CAUSES,
  INSUFFISANT_DEFINITION,
  INSUFFISANT_SOUS_TITRE,
} from "@/lib/verdict-explanations";
import { repondreDeterministe } from "@/lib/ai/rdue-faits";

describe("Coopératives (espace exportateur) — sièges & statistiques", () => {
  it("chaque coopérative du portefeuille a une fiche avec un SIÈGE (un point, pas une superficie)", () => {
    for (const nom of cooperatives(PARCELLES)) {
      const info = coopInfoParNom(nom);
      expect(info, `fiche manquante pour « ${nom} »`).toBeTruthy();
      // Le siège est un point [lat, lon] plausible en Côte d'Ivoire.
      const [lat, lon] = info!.siege;
      expect(lat).toBeGreaterThanOrEqual(ZONE_CI.latMin);
      expect(lat).toBeLessThanOrEqual(ZONE_CI.latMax);
      expect(lon).toBeGreaterThanOrEqual(ZONE_CI.lonMin);
      expect(lon).toBeLessThanOrEqual(ZONE_CI.lonMax);
    }
  });

  it("les fiches sont complètes (gérant, téléphone, effectif déclaré, ville)", () => {
    for (const c of COOPERATIVES_INFO) {
      expect(c.gerant.length).toBeGreaterThan(2);
      expect(c.telephone).toMatch(/^\+225 /);
      expect(c.producteursDeclares).toBeGreaterThan(0);
      expect(c.ville.length).toBeGreaterThan(1);
    }
  });

  it("les statistiques d'une coopérative sont dérivées des parcelles (source de vérité unique)", () => {
    const s = statsPourCoop(COOP_DEMO);
    const attendu = PARCELLES.filter((p) => p.cooperative === COOP_DEMO);
    expect(s.parcelles).toBe(attendu.length);
    expect(s.conformes).toBe(attendu.filter((p) => p.statut === "conforme").length);
    expect(s.conformes + s.anomalies + s.insuffisantes).toBe(s.parcelles);
    expect(s.tauxConformite).toBe(Math.round((s.conformes / s.parcelles) * 100));
  });

  it("une coopérative inconnue rend des statistiques vides, jamais une erreur", () => {
    const s = statsPourCoop("Coopérative Inexistante");
    expect(s.parcelles).toBe(0);
    expect(s.tauxConformite).toBe(0);
  });
});

describe("Verdicts — explications précises (jamais génériques)", () => {
  it("« Données insuffisantes » a des causes réelles documentées, bilingues", () => {
    expect(INSUFFISANT_CAUSES.length).toBeGreaterThanOrEqual(4);
    const ids = INSUFFISANT_CAUSES.map((c) => c.id);
    // Les causes découvertes par la recherche : ombrage (le cas n°1), nuages, résolution, divergence.
    for (const attendu of ["ombrage", "nuages", "petite-parcelle", "sources-divergentes"]) {
      expect(ids).toContain(attendu);
    }
    for (const c of [...INSUFFISANT_CAUSES, ...INSUFFISANT_ACTIONS, ...ANOMALIE_ACTIONS]) {
      for (const lang of ["fr", "en"] as const) {
        expect(c.titre[lang].length).toBeGreaterThan(5);
        expect(c.detail[lang].length).toBeGreaterThan(30);
      }
    }
  });

  it("la définition reste charte-safe : prudence, jamais « Conforme » par défaut, aucun % inventé", () => {
    for (const lang of ["fr", "en"] as const) {
      expect(INSUFFISANT_DEFINITION[lang]).not.toMatch(/\d+\s?%/);
      expect(INSUFFISANT_SOUS_TITRE[lang].length).toBeGreaterThan(10);
    }
    expect(INSUFFISANT_DEFINITION.fr).toContain("jamais");
  });

  it("les actions donnent une marche à suivre concrète (saison sèche, tracé, preuves)", () => {
    const ids = INSUFFISANT_ACTIONS.map((a) => a.id);
    expect(ids).toContain("saison-seche");
    expect(ids).toContain("tracer");
    expect(ids).toContain("preuves-terrain");
  });
});

describe("Assistant AGRIVO — nouveaux faits (exportateur, verdicts, guide)", () => {
  it("répond sur l'ajout d'une coopérative (fonctionnalité exportateur)", () => {
    const r = repondreDeterministe("Comment ajouter une coopérative ?", "fr");
    expect(r.faitId).toBe("exportateur-cooperatives");
    expect(r.reponse).toContain("siège");
  });

  it("répond sur les paliers de prix exportateur SANS perdre la question prix générique", () => {
    const generique = repondreDeterministe("Combien coûte AGRIVO ?", "fr");
    expect(generique.faitId).toBe("agrivo-prix");
    expect(generique.reponse).toContain("100 000");
    expect(generique.reponse).toContain("500 000");
    const paliers = repondreDeterministe("Que contient l'offre exportateur Essentiel ?", "fr");
    expect(paliers.faitId).toBe("exportateur-prix");
  });

  it("explique précisément « Données insuffisantes » (causes réelles, pas de générique)", () => {
    const r = repondreDeterministe("Que veut dire données insuffisantes ?", "fr");
    expect(r.faitId).toBe("verdict-insuffisant");
    expect(r.reponse).toContain("ombrage");
  });

  it("donne la marche à suivre après une anomalie", () => {
    const r = repondreDeterministe("Que faire après une anomalie détectée ?", "fr");
    expect(r.faitId).toBe("verdict-anomalie");
  });

  it("connaît le guide interactif et l'équipe", () => {
    expect(repondreDeterministe("Comment relancer le guide interactif ?", "fr").faitId).toBe("guide-tour");
    expect(repondreDeterministe("Qui est derrière AGRIVO ?", "fr").faitId).toBe("agrivo-equipe");
  });

  it("reste hors-sujet sur une question sans rapport (les mots-clés courts ne fuient plus)", () => {
    for (const q of ["Quelle est la météo à Abidjan demain ?", "Raconte-moi une blague", "Qui a gagné le match hier ?"]) {
      const r = repondreDeterministe(q, "fr");
      expect(r.horsPerimetre, `« ${q} » devrait être hors-sujet (obtenu : ${r.faitId})`).toBe(true);
    }
  });
});

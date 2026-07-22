import { describe, expect, it } from "vitest";
import {
  construireDossierDds,
  fichiersDossierDds,
  rapportRisque,
} from "@/lib/marketplace/dds-dossier";
import { findExpedition, tonnageExpedition, type Expedition } from "@/data/mock-expeditions";
import { findMarketExpedition } from "@/data/mock-marketplace";
import { PARCELLES } from "@/data/mock-parcelles";

const exp1 = findExpedition("EXP-2026-0001")!;
const exp7 = findMarketExpedition("EXP-2026-0007")!;

/** Texte intégral (FR + EN) d'un dossier, pour les contrôles de charte. */
function texteIntegral(exp: Expedition): string {
  const dossier = construireDossierDds(exp, PARCELLES);
  return JSON.stringify(dossier) + JSON.stringify(rapportRisque(exp, PARCELLES));
}

describe("Dossier DDS — le livrable TRACES NT en 1 clic", () => {
  it("EXP-2026-0001 (chaîne complète) : dossier prêt, zéro manquant, 6 vérifications OK", () => {
    const dossier = construireDossierDds(exp1, PARCELLES);
    expect(dossier.pret).toBe(true);
    expect(dossier.manquants).toHaveLength(0);
    expect(dossier.verifications).toHaveLength(6);
    expect(dossier.verifications.every((v) => v.ok)).toBe(true);
  });

  it("le brouillon reprend les faits du lot : masse nette, denrée, code SH, pays, campagne", () => {
    const { brouillon } = construireDossierDds(exp1, PARCELLES);
    expect(brouillon.masseNetteTonnes).toBe(tonnageExpedition(exp1));
    expect(brouillon.masseNetteTonnes).toBeCloseTo(5.9, 2);
    expect(brouillon.denree.fr).toBe("Cacao");
    expect(brouillon.denree.en).toBe("Cocoa");
    expect(brouillon.codeSH).toBe("1801");
    expect(brouillon.paysProduction.fr).toBe("Côte d'Ivoire");
    expect(brouillon.periodeRecolte).toBe("2025-26");
    expect(brouillon.nbParcelles).toBe(4);
    expect(brouillon.nbParcellesGeolocalisees).toBe(4);
    expect(brouillon.referencesDdr.length).toBe(4);
  });

  it("le GeoJSON du dossier est la FeatureCollection TRACES NT du lot (réf + tonnages)", () => {
    const { geojson } = construireDossierDds(exp1, PARCELLES);
    expect(geojson.type).toBe("FeatureCollection");
    expect(geojson.features).toHaveLength(4);
    for (const f of geojson.features) {
      const props = f.properties as { expeditionRef: string; tonnesPrelevees: number; codeSH: string };
      expect(props.expeditionRef).toBe("EXP-2026-0001");
      expect(props.tonnesPrelevees).toBeGreaterThan(0);
      expect(props.codeSH).toBe("1801");
    }
  });

  it("EXP-2026-0007 (démonstration honnête) : jamais prêt, manquants exacts affichables", () => {
    const dossier = construireDossierDds(exp7, PARCELLES);
    expect(dossier.pret).toBe(false);
    expect(dossier.manquants.length).toBeGreaterThan(0);
    const possession = dossier.verifications.find((v) => v.code === "possession")!;
    expect(possession.ok).toBe(false);
    expect(possession.detail.fr).toContain("incomplète");
    const controle = dossier.verifications.find((v) => v.code === "controle")!;
    expect(controle.ok).toBe(false);
  });

  it("une parcelle non conforme dans le lot interdit le dossier (ségrégation)", () => {
    const nonConforme = PARCELLES.find((p) => p.statut !== "conforme")!;
    const exp: Expedition = {
      ...exp1,
      id: "test-seg",
      ref: "EXP-TEST-SEG",
      parcelleIds: [...exp1.parcelleIds, nonConforme.id],
      tonnages: { ...exp1.tonnages, [nonConforme.id]: 0.1 },
    };
    const dossier = construireDossierDds(exp, PARCELLES);
    expect(dossier.pret).toBe(false);
    expect(dossier.verifications.find((v) => v.code === "segregation")!.ok).toBe(false);
  });

  it("le rapport de risque constate les éléments (art. 9/10) sans jamais conclure à leur place", () => {
    const sections = rapportRisque(exp1, PARCELLES);
    expect(sections).toHaveLength(6);
    const codes = sections.map((s) => s.code);
    for (const c of ["identite", "geolocalisation", "deforestation", "legalite", "chaine", "pays"]) {
      expect(codes).toContain(c);
    }
    const chaine = sections.find((s) => s.code === "chaine")!;
    expect(chaine.contenu.fr).toContain("aucune anomalie bloquante");
    // Bilingue : chaque section porte FR et EN non vides.
    for (const s of sections) {
      expect(s.titre.fr.length).toBeGreaterThan(0);
      expect(s.titre.en.length).toBeGreaterThan(0);
      expect(s.contenu.fr.length).toBeGreaterThan(0);
      expect(s.contenu.en.length).toBeGreaterThan(0);
    }
  });

  it("charte : jamais « garantie », jamais « risque négligeable » affirmé, jamais de tiret cadratin", () => {
    for (const exp of [exp1, exp7]) {
      const txt = texteIntegral(exp).toLowerCase();
      expect(txt).not.toMatch(/garanti|guarantee/);
      expect(txt).not.toMatch(/négligeable|negligible/);
      expect(texteIntegral(exp)).not.toContain("—");
    }
  });

  it("charte : le disclaimer DDS accompagne toujours le dossier (l'opérateur reste seul responsable)", () => {
    const dossier = construireDossierDds(exp1, PARCELLES);
    expect(dossier.disclaimer.fr).toContain("seul responsable");
    expect(dossier.disclaimer.en).toContain("solely responsible");
  });

  it("fichiersDossierDds : GeoJSON + brouillon JSON valides, nommés par référence", () => {
    const dossier = construireDossierDds(exp1, PARCELLES);
    const fichiers = fichiersDossierDds(dossier);
    expect(fichiers).toHaveLength(2);
    expect(fichiers[0].nom).toBe("dds-EXP-2026-0001.geojson");
    expect(fichiers[1].nom).toBe("dds-brouillon-EXP-2026-0001.json");
    const geo = JSON.parse(fichiers[0].contenu);
    expect(geo.type).toBe("FeatureCollection");
    const brouillon = JSON.parse(fichiers[1].contenu);
    expect(brouillon.avertissement.fr).toContain("seul responsable");
    expect(brouillon.brouillon.codeSH).toBe("1801");
    expect(Array.isArray(brouillon.verifications)).toBe(true);
  });

  it("un lot sans parcelles résolues ne sort jamais « prêt »", () => {
    const exp: Expedition = { ...exp1, id: "test-vide", ref: "EXP-TEST-VIDE", parcelleIds: ["inconnue"], tonnages: {} };
    const dossier = construireDossierDds(exp, PARCELLES);
    expect(dossier.pret).toBe(false);
    expect(dossier.verifications.find((v) => v.code === "geolocalisation")!.ok).toBe(false);
  });
});

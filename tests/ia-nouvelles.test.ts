/**
 * Tests des deux nouvelles features IA (v1.2.0) : plan d'action d'audit et argumentaire de
 * prime. On teste les modules PURS (trames déterministes servies en repli et fournies à Gemini) :
 * exactitude des chiffres, respect de la charte (pas de « garantie » de conformité, aucun
 * vocabulaire de crédit, statuts verbatim), bilinguisme.
 */
import { describe, expect, it } from "vitest";
import { auditerRegistre, type RegistreParcelle } from "@/lib/registre/audit";
import { construirePlanAction, resumerAudit } from "@/lib/registre/plan";
import { genererArgumentairePrime } from "@/lib/ai/argumentaire";
import { getParcelle, parcellesForCoop } from "@/data/mock-parcelles";

function registreDeTest(): RegistreParcelle[] {
  return [
    // valide (point < 4 ha, dans la zone)
    { matricule: "AGR-T-001", nom: "Test Un", superficieHa: 2, geometrie: { type: "point", coords: [-6.6, 5.8] } },
    // doublon (bureau)
    { matricule: "AGR-T-002", superficieHa: 2, geometrie: { type: "point", coords: [-6.61, 5.81] } },
    { matricule: "AGR-T-002", superficieHa: 2, geometrie: { type: "point", coords: [-6.62, 5.82] } },
    // polygone manquant ≥ 4 ha (terrain)
    { matricule: "AGR-T-003", superficieHa: 6, geometrie: { type: "point", coords: [-6.63, 5.83] } },
    // hors zone (bureau)
    { matricule: "AGR-T-004", superficieHa: 1, geometrie: { type: "point", coords: [5.83, -6.63] } },
  ];
}

describe("resumerAudit + construirePlanAction (plan d'action IA)", () => {
  const audit = auditerRegistre(registreDeTest());
  const resume = resumerAudit(audit);

  it("condense l'audit en comptes exacts par catégorie", () => {
    const doublon = resume.categories.find((c) => c.categorie === "doublon");
    const manquant = resume.categories.find((c) => c.categorie === "polygone-manquant");
    const horsZone = resume.categories.find((c) => c.categorie === "hors-zone");
    expect(doublon?.count).toBe(1); // 1 matricule en doublon signalé une fois
    expect(manquant?.count).toBe(1);
    expect(horsZone?.count).toBe(1);
    expect(resume.total).toBe(5);
  });

  it("produit un plan ordonné bureau d'abord, terrain ensuite, puis réimport et vérification", () => {
    const plan = construirePlanAction(resume, "fr");
    expect(plan.etapes.length).toBeGreaterThanOrEqual(4);
    const idxBureau = plan.etapes.findIndex((e) => e.titre.startsWith("Corriger au bureau"));
    const idxTerrain = plan.etapes.findIndex((e) => e.titre.startsWith("Compléter sur le terrain"));
    expect(idxBureau).toBeGreaterThanOrEqual(0);
    expect(idxTerrain).toBeGreaterThan(idxBureau);
    expect(plan.etapes.at(-2)?.titre).toMatch(/Réimporter/);
    expect(plan.etapes.at(-1)?.titre).toMatch(/vérification satellite/);
    expect(plan.conclusion).toContain(`${resume.validesCount}`);
  });

  it("respecte la charte : jamais de « garantie », aucun vocabulaire de crédit, statuts verbatim", () => {
    for (const lang of ["fr", "en"] as const) {
      const plan = construirePlanAction(resume, lang);
      const texte = [plan.conclusion, ...plan.etapes.map((e) => e.titre + " " + e.detail)].join(" ");
      expect(texte.toLowerCase()).not.toMatch(/garantie|guarantee/);
      // « prêt/prêtes » (= ready) est légitime ; le vocabulaire banni est celui du financement.
      expect(texte.toLowerCase()).not.toMatch(/crédit|\bcredit\b|\bloan\b|fcfa|plafond|emprunt/);
    }
    const fr = construirePlanAction(resume, "fr");
    const texteFr = fr.etapes.map((e) => e.detail).join(" ");
    expect(texteFr).toContain("Conforme, Anomalie détectée ou Données insuffisantes");
  });

  it("est bilingue (la version EN ne contient pas la trame FR)", () => {
    const en = construirePlanAction(resume, "en");
    expect(en.etapes[0].titre).toMatch(/Fix at the office|Complete in the field/);
    expect(en.conclusion).toMatch(/ready/);
  });
});

describe("genererArgumentairePrime (argumentaire de prime IA)", () => {
  const p = getParcelle("p01")!;
  const coop = parcellesForCoop(p.cooperative);
  const conformes = coop.filter((x) => x.statut === "conforme").length;

  it("cite les chiffres exacts du portefeuille et le certificat de la parcelle", () => {
    const memo = genererArgumentairePrime(p, coop, "fr");
    const texte = memo.paragraphes.join(" ");
    expect(texte).toContain(`${conformes} parcelles`);
    expect(texte).toContain(`${coop.length} vérifiées`);
    expect(texte).toContain(p.numeroCertificat);
    expect(memo.titre).toContain(p.cooperative);
  });

  it("parle de primes AU-DESSUS du prix garanti, jamais de crédit ni de garantie de conformité", () => {
    for (const lang of ["fr", "en"] as const) {
      const memo = genererArgumentairePrime(p, coop, lang);
      const texte = memo.paragraphes.join(" ").toLowerCase();
      expect(texte).toMatch(/prime|premium/);
      // « prêt/prêts » (= ready) est légitime ; le vocabulaire banni est celui du financement.
      expect(texte).not.toMatch(/crédit|\bcredit\b|\bloan\b|fcfa|plafond|emprunt/);
      expect(texte).not.toMatch(/garantie de conformité|compliance guarantee/);
      // « prix garanti par l'État » est autorisé (fait réglementaire), la « garantie » de conformité non.
    }
  });

  it("n'invente aucun pourcentage de précision (seuls les faits sourcés 40 % / dates figurent)", () => {
    const memo = genererArgumentairePrime(p, coop, "fr");
    const texte = memo.paragraphes.join(" ");
    const pourcentages = texte.match(/\d+\s?%/g) ?? [];
    for (const pct of pourcentages) expect(pct.replace(/\s/g, "")).toBe("40%");
  });
});

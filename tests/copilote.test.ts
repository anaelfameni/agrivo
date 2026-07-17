import { describe, expect, it } from "vitest";
import { repondreDeterministe, detecterSmallTalk, FAITS_RDUE } from "@/lib/ai/rdue-faits";

describe("Assistant AGRIVO — base de connaissances & appariement", () => {
  it("la base couvre AGRIVO (produit/prix/site) ET la RDUE", () => {
    const ids = new Set(FAITS_RDUE.map((f) => f.id));
    for (const id of ["agrivo-prix", "agrivo-produit", "agrivo-espaces", "agrivo-verdicts", "agrivo-compte", "cote-ivoire", "echeances"]) {
      expect(ids.has(id)).toBe(true);
    }
    expect(FAITS_RDUE.length).toBeGreaterThanOrEqual(20);
  });

  it("répond aux questions PRODUIT (prix, comment créer un compte)", () => {
    const prix = repondreDeterministe("Combien coûte AGRIVO ?", "fr");
    expect(prix.horsPerimetre).toBe(false);
    expect(prix.faitId).toBe("agrivo-prix");
    expect(prix.reponse).toContain("100 000");

    const compte = repondreDeterministe("comment créer un compte", "fr");
    expect(compte.faitId).toBe("agrivo-compte");
  });

  it("répond aux questions RDUE (Côte d'Ivoire)", () => {
    const ci = repondreDeterministe("La Côte d'Ivoire est-elle concernée ?", "fr");
    expect(ci.faitId).toBe("cote-ivoire");
    expect(ci.finance).toBe(false);
  });

  it("garde-fou finance (frontière Nanti) : question crédit interceptée", () => {
    const credit = repondreDeterministe("Puis-je avoir un crédit pour ma coopérative ?", "fr");
    expect(credit.finance).toBe(true);
    expect(credit.horsPerimetre).toBe(true);
    expect(credit.reponse.toLowerCase()).toContain("aucun crédit");
  });

  it("hors-sujet réel : hors périmètre mais PAS finance (l'IA pourra rediriger poliment)", () => {
    const meteo = repondreDeterministe("Quelle est la météo à Paris ?", "fr");
    expect(meteo.finance).toBe(false);
    expect(meteo.horsPerimetre).toBe(true);
    expect(meteo.reponse).toContain("support@agrivo.ci");
  });

  it("sait se présenter (« Qui es-tu ? », « Bonjour »)", () => {
    const qui = repondreDeterministe("Bonjour, qui es-tu ?", "fr");
    expect(qui.faitId).toBe("assistant-presentation");
    expect(qui.reponse).toContain("Assistant AGRIVO");
  });

  it("oriente vers le support pour une prise de contact", () => {
    const sup = repondreDeterministe("Comment contacter le support ?", "fr");
    expect(sup.faitId).toBe("agrivo-support");
    expect(sup.reponse).toContain("support@agrivo.ci");
  });

  it("small-talk : merci / ça va / au revoir ont une réponse chaleureuse instantanée", () => {
    expect(detecterSmallTalk("Merci beaucoup !", "fr")?.reponse).toContain("plaisir");
    expect(detecterSmallTalk("ça va ?", "fr")?.reponse).toContain("Assistant AGRIVO");
    expect(detecterSmallTalk("au revoir", "fr")?.reponse.toLowerCase()).toContain("au revoir");
    expect(detecterSmallTalk("bonjour", "fr")?.reponse).toContain("Assistant AGRIVO");
  });

  it("small-talk : une vraie question N'EST PAS avalée par le salut", () => {
    expect(detecterSmallTalk("Bonjour, comment créer un compte ?", "fr")).toBeNull();
    expect(detecterSmallTalk("Merci, et combien coûte AGRIVO ?", "fr")).toBeNull();
    expect(detecterSmallTalk("Quelles sont les échéances ?", "fr")).toBeNull();
  });

  it("connaît le SNT et la carte du producteur (fait snt-carte, chiffres CCC sourcés)", () => {
    const snt = repondreDeterministe("Qu'est-ce que le SNT ?", "fr");
    expect(snt.faitId).toBe("snt-carte");
    expect(snt.reponse).toContain("1er septembre 2026");
    expect(snt.reponse).toContain("900 000");
    const carte = repondreDeterministe("What is the producer card?", "en");
    expect(carte.faitId).toBe("snt-carte");
    // Sans régression : la question RDUE générique reste sur son fait.
    expect(repondreDeterministe("Qu'est-ce que le RDUE ?", "fr").faitId).toBe("definition");
  });

  it("guidage dans le site : guide interactif, import registre, producteurs, paramètres", () => {
    expect(repondreDeterministe("Comment relancer le guide interactif ?", "fr").faitId).toBe("guide-tour");
    expect(repondreDeterministe("Comment importer mon registre de parcelles ?", "fr").faitId).toBe("guide-import");
    expect(repondreDeterministe("Comment ajouter un producteur ?", "fr").faitId).toBe("guide-producteurs");
    expect(repondreDeterministe("Où changer mon mot de passe ?", "fr").faitId).toBe("guide-parametres");
  });
});

import { describe, expect, it } from "vitest";
import { PARCELLES, parcellesForCoop } from "@/data/mock-parcelles";
import { lotsMarche, estProducteurCarte } from "@/data/mock-marketplace";
import {
  contactValide,
  construireDemande,
  marquerRepondue,
  resumeDemandes,
  validerDemande,
  type DemandeCotation,
} from "@/lib/marketplace/rfq";
import {
  alerteExiste,
  basculerFavori,
  construireAlerte,
  lotsCorrespondants,
} from "@/lib/marketplace/interet";
import { fileRegularisation } from "@/lib/registre/regularisation";

describe("demandes de cotation (RFQ)", () => {
  it("valide un contact email ou téléphone, refuse le reste", () => {
    expect(contactValide("achats@negoce.eu")).toBe(true);
    expect(contactValide("+33 6 12 34 56 78")).toBe(true);
    expect(contactValide("0595335662")).toBe(true);
    expect(contactValide("pas-un-contact")).toBe(false);
    expect(contactValide("a@b")).toBe(false);
    expect(contactValide("")).toBe(false);
  });

  it("refuse une demande incomplète et un volume supérieur au tonnage du lot", () => {
    const vide = validerDemande({ societe: "", contact: "", volumeT: 0 }, 100);
    expect(vide.societe).toBeTruthy();
    expect(vide.contact).toBeTruthy();
    expect(vide.volumeT).toBeTruthy();

    const trop = validerDemande(
      { societe: "Negoce SA", contact: "achats@negoce.eu", volumeT: 150 },
      100,
    );
    expect(trop.volumeT).toContain("100");

    const ok = validerDemande(
      { societe: "Negoce SA", contact: "achats@negoce.eu", volumeT: 40 },
      100,
    );
    expect(Object.keys(ok)).toHaveLength(0);
  });

  it("construit une demande normalisée (id, date, statut, pays par défaut)", () => {
    const now = new Date("2026-07-19T12:00:00Z");
    const d = construireDemande(
      {
        refLot: "LOT-001",
        nomLot: "Cacao Nawa",
        societe: "  Negoce SA  ",
        contact: " achats@negoce.eu ",
        pays: "",
        volumeT: 40,
        incoterm: "FOB Abidjan",
        message: "  Livraison T4  ",
      },
      now,
    );
    expect(d.id.startsWith("RFQ-")).toBe(true);
    expect(d.societe).toBe("Negoce SA");
    expect(d.contact).toBe("achats@negoce.eu");
    expect(d.pays).toBe("À confirmer");
    expect(d.message).toBe("Livraison T4");
    expect(d.statut).toBe("nouvelle");
    expect(d.dateIso).toBe(now.toISOString());
  });

  it("résume les demandes et marque une réponse sans muter l'original", () => {
    const base: DemandeCotation[] = [
      construireDemande(
        { refLot: "L1", nomLot: "A", societe: "S1", contact: "a@b.co", pays: "FR", volumeT: 10, incoterm: "FOB Abidjan", message: "" },
        new Date("2026-07-19T10:00:00Z"),
      ),
      construireDemande(
        { refLot: "L2", nomLot: "B", societe: "S2", contact: "b@c.co", pays: "NL", volumeT: 25, incoterm: "CIF port UE", message: "" },
        new Date("2026-07-19T11:00:00Z"),
      ),
    ];
    const r1 = resumeDemandes(base);
    expect(r1.total).toBe(2);
    expect(r1.nouvelles).toBe(2);
    expect(r1.volumeTotalT).toBe(35);

    const apres = marquerRepondue(base, base[0].id);
    expect(apres).not.toBe(base);
    expect(base[0].statut).toBe("nouvelle");
    expect(apres.find((d) => d.id === base[0].id)?.statut).toBe("repondue");
    expect(resumeDemandes(apres).nouvelles).toBe(1);
  });
});

describe("favoris et alertes de marché", () => {
  it("bascule un favori sans muter la liste d'origine", () => {
    const avant: string[] = ["LOT-A"];
    const avec = basculerFavori(avant, "LOT-B");
    expect(avec).toEqual(["LOT-A", "LOT-B"]);
    expect(avant).toEqual(["LOT-A"]);
    const sans = basculerFavori(avec, "LOT-A");
    expect(sans).toEqual(["LOT-B"]);
  });

  it("détecte les alertes en doublon sur les mêmes critères", () => {
    const a = construireAlerte({ filiere: "cacao", region: "", scellesSeul: true });
    expect(alerteExiste([a], { filiere: "cacao", region: "", scellesSeul: true })).toBe(true);
    expect(alerteExiste([a], { filiere: "cacao", region: "", scellesSeul: false })).toBe(false);
    expect(alerteExiste([], { filiere: "cacao", region: "", scellesSeul: true })).toBe(false);
  });

  it("recalcule les lots correspondants : scellés seulement, critères vides = tout le catalogue", () => {
    const catalogue = lotsMarche(PARCELLES);
    expect(catalogue.length).toBeGreaterThan(0);

    const tous = construireAlerte({ filiere: "", region: "", scellesSeul: false });
    expect(lotsCorrespondants(tous, catalogue)).toHaveLength(catalogue.length);

    const scelles = construireAlerte({ filiere: "", region: "", scellesSeul: true });
    const resultat = lotsCorrespondants(scelles, catalogue);
    expect(resultat.length).toBeGreaterThan(0);
    for (const lot of resultat) expect(lot.sceau.statut).toBe("verifie");

    const cacao = construireAlerte({ filiere: "cacao", region: "", scellesSeul: false });
    for (const lot of lotsCorrespondants(cacao, catalogue)) expect(lot.filiere).toBe("cacao");
  });
});

describe("file de régularisation de la coopérative", () => {
  it("compte de façon cohérente cartes et références DDR", () => {
    const file = fileRegularisation(parcellesForCoop());
    expect(file.items.length).toBe(file.nbCartes + file.nbDdr);
    expect(file.nbParcelles).toBeLessThanOrEqual(file.items.length);
    for (const item of file.items) {
      expect(["carte-producteur", "reference-ddr"]).toContain(item.motif);
      expect(item.fr.length).toBeGreaterThan(0);
      expect(item.en.length).toBeGreaterThan(0);
    }
  });

  it("ne signale une carte que si elle est réellement invalide", () => {
    const file = fileRegularisation(PARCELLES);
    for (const item of file.items.filter((i) => i.motif === "carte-producteur")) {
      const p = PARCELLES.find((x) => x.id === item.parcelleId);
      expect(p).toBeDefined();
      expect(estProducteurCarte(p!.numeroCartePro)).toBe(false);
    }
  });

  it("un registre propre produit une file vide", () => {
    const propres = PARCELLES.filter(
      (p) => estProducteurCarte(p.numeroCartePro) && Boolean(p.referenceDDR),
    );
    const file = fileRegularisation(propres);
    expect(file.items).toHaveLength(0);
    expect(file.nbParcelles).toBe(0);
    expect(file.nbCartes).toBe(0);
    expect(file.nbDdr).toBe(0);
  });

  it("le wording impose la régularisation auprès du Conseil du Café-Cacao", () => {
    const avecCarteInvalide = [
      { ...PARCELLES[0], numeroCartePro: "INVALIDE" },
    ];
    const file = fileRegularisation(avecCarteInvalide);
    expect(file.nbCartes).toBe(1);
    expect(file.items[0].fr).toContain("régularisation auprès du Conseil du Café-Cacao");
    expect(file.items[0].fr).not.toContain("contournement");
  });
});

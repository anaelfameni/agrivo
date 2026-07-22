import { NextResponse } from "next/server";
import { PARCELLES, exporterFeatureCollection, type Statut } from "@/data/mock-parcelles";

/**
 * API REST exportateur (offre Pro) — export en masse du portefeuille au format GeoJSON
 * RFC 7946 (WGS-84, 6 décimales), directement exploitable pour la déclaration TRACES NT.
 *
 *   GET /api/exporteur/portefeuille            → tout le portefeuille
 *   GET /api/exporteur/portefeuille?statut=conforme|anomalie|insuffisant → filtré par verdict
 *
 * Démontrable en direct (navigateur ou curl). En production réelle, l'accès est authentifié
 * par clé d'API (gérée dans la console d'administration).
 */
export async function GET(req: Request) {
  const statut = new URL(req.url).searchParams.get("statut");
  const valides: Statut[] = ["conforme", "anomalie", "insuffisant"];
  if (statut && !valides.includes(statut as Statut)) {
    return NextResponse.json(
      { error: `Statut inconnu « ${statut} ». Valeurs acceptées : ${valides.join(", ")}.` },
      { status: 400 },
    );
  }
  const liste = statut ? PARCELLES.filter((p) => p.statut === statut) : PARCELLES;
  return NextResponse.json(exporterFeatureCollection(liste), {
    headers: {
      "Content-Type": "application/geo+json",
      "Content-Disposition": `inline; filename="agrivo-portefeuille-${liste.length}-parcelles.geojson"`,
    },
  });
}

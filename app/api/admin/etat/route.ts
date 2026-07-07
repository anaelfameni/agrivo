import { NextResponse } from "next/server";
import { MOCK_MODE } from "@/lib/ai/config";

/**
 * État système RÉEL, évalué côté serveur (l'environnement n'existe pas côté client :
 * un composant client qui importe MOCK_MODE verrait toujours `true`). Consommé par
 * la console admin. Force-dynamic : ne jamais figer cet état au build.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    mock: MOCK_MODE,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
}

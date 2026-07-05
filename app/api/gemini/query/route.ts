import { NextResponse } from "next/server";
import { interrogerPortefeuille } from "@/lib/ai/gemini";
import { PARCELLES } from "@/data/mock-parcelles";
import { MOCK_MODE, simulatedLatency, sleep } from "@/lib/ai/config";

/**
 * Assistant portefeuille (Gemini — raisonnement langage naturel sur les données). En MOCK_MODE
 * (forcé), latence simulée puis raisonnement local sur le portefeuille. Aucun appel réseau ne
 * part jamais du client : le chat POST vers cette route, jamais vers un service tiers.
 * // TODO: brancher la vraie clé API Gemini ici (le raisonnement resterait exécuté sur PARCELLES).
 */
export async function POST(req: Request) {
  const { question } = (await req.json().catch(() => ({}))) as { question?: string };
  // Une réponse conversationnelle est un peu plus rapide qu'une analyse satellite.
  const analyseMs = Math.round(simulatedLatency() * 0.6);
  if (MOCK_MODE) await sleep(analyseMs);
  const answer = interrogerPortefeuille(question ?? "", PARCELLES);
  return NextResponse.json({ ...answer, analyseMs });
}

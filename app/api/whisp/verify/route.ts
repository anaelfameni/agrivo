import { NextResponse } from "next/server";
import { whispVerify, type WhispVerifyInput } from "@/lib/ai/whisp";
import { MOCK_MODE, simulatedLatency, sleep } from "@/lib/ai/config";

/**
 * Détection Whisp (FAO). En MOCK_MODE (forcé), court-circuite tout appel réseau et renvoie le
 * résultat pré-enregistré après une latence simulée (1200-1800 ms) pour un ressenti d'appel réel.
 * Sécurise la démo : aucun appel live non testé. Aucun appel réseau ne part jamais du client.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as WhispVerifyInput;
  const analyseMs = simulatedLatency();
  if (MOCK_MODE) await sleep(analyseMs);
  const result = await whispVerify(body);
  return NextResponse.json({ ...result, analyseMs });
}

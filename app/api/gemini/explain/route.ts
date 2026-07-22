import { NextResponse } from "next/server";
import { genererExplicationVerdict, expliquerScoreSols } from "@/lib/ai/gemini";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import type { Statut } from "@/data/mock-parcelles";

/**
 * Explications Gemini (langage) : `kind: "verdict"` renvoie la phrase figée du verdict ;
 * `kind: "sols"` renvoie l'explicabilité du score de résilience des sols (XAI).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    kind?: "verdict" | "sols";
    statut?: Statut;
    producteurNom?: string;
  };
  if (MOCK_MODE) await sleep(650);
  if (body.kind === "sols") {
    return NextResponse.json(expliquerScoreSols(body.producteurNom ?? ""));
  }
  return NextResponse.json({ explication: genererExplicationVerdict(body.statut ?? "conforme") });
}

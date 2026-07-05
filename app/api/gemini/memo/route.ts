import { NextResponse } from "next/server";
import { genererMemoDiligence } from "@/lib/ai/gemini";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { getParcelle } from "@/data/mock-parcelles";

/**
 * Génère le dossier de diligence (DDS) « audit-ready » d'une parcelle via l'IA générative.
 * MOCK_MODE : latence simulée, aucun appel réseau live. Jamais appelé depuis le client sans passer ici.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { parcelleId?: string };
  const p = body.parcelleId ? getParcelle(body.parcelleId) : undefined;
  if (!p) return NextResponse.json({ error: "Parcelle introuvable." }, { status: 404 });
  if (MOCK_MODE) await sleep(1100);
  return NextResponse.json(genererMemoDiligence(p));
}

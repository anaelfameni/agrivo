import { NextResponse } from "next/server";
import { genererMemoDiligence, type MemoDiligence } from "@/lib/ai/gemini";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, parseJson, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import { getParcelle } from "@/data/mock-parcelles";

/**
 * Génère le dossier de diligence (DDS) « audit-ready » d'une parcelle.
 * La TRAME et les FAITS restent déterministes (tirés des vraies données). En LIVE, Gemini
 * réécrit la rédaction des sections à partir de ces faits (jamais de chiffre inventé) ;
 * en cas d'échec ou sans clé, repli sur la rédaction déterministe.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { parcelleId?: string };
  const p = body.parcelleId ? getParcelle(body.parcelleId) : undefined;
  if (!p) return NextResponse.json({ error: "Parcelle introuvable." }, { status: 404 });

  const base = genererMemoDiligence(p);

  if (geminiLiveEnabled()) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Voici un dossier de diligence raisonnée (DDS) RDUE dont la trame et les faits sont vérifiés. Réécris UNIQUEMENT la rédaction (corps des sections et conclusion) dans un français professionnel plus fluide, sans ajouter, retirer ni modifier AUCUN fait, chiffre, référence ou statut. Garde exactement les mêmes titres de sections. Réponds en JSON strict : {"sections": [{"titre": string, "corps": string}], "conclusion": string}.\n\nDossier :\n${JSON.stringify({ sections: base.sections, conclusion: base.conclusion })}`,
          },
        ],
        { system: CHARTE_SYSTEM, json: true, maxOutputTokens: 2048 },
      );
      const rewritten = parseJson<Pick<MemoDiligence, "sections" | "conclusion">>(raw);
      if (rewritten.sections?.length === base.sections.length && rewritten.conclusion) {
        return NextResponse.json({
          ...base,
          sections: rewritten.sections,
          conclusion: rewritten.conclusion,
          avertissement:
            "Ce dossier constitue une évaluation de conformité, non une garantie. Rédaction assistée par IA à partir de faits vérifiés ; relecture humaine recommandée avant soumission.",
          live: true,
        });
      }
    } catch (e) {
      console.error("[gemini/memo] live échoué, repli déterministe:", e);
    }
  }

  if (MOCK_MODE) await sleep(1100);
  return NextResponse.json(base);
}

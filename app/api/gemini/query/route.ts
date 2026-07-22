import { NextResponse } from "next/server";
import { runPortfolioAgent } from "@/lib/ai/gemini";
import { PARCELLES } from "@/data/mock-parcelles";
import { MOCK_MODE, simulatedLatency, sleep } from "@/lib/ai/config";
import { callGemini, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";

/**
 * Assistant portefeuille. Le RAISONNEMENT reste déterministe et exécuté sur les données
 * (`runPortfolioAgent` : filtres, agrégats, parcelles citées — jamais un chiffre inventé).
 * En LIVE, Gemini met en mots la réponse à partir de ces faits calculés ; en cas d'échec
 * ou sans clé, le texte déterministe est renvoyé tel quel. Aucun appel ne part du client.
 */
export async function POST(req: Request) {
  const { question } = (await req.json().catch(() => ({}))) as { question?: string };
  const analyseMs = Math.round(simulatedLatency() * 0.6);
  const answer = runPortfolioAgent(question ?? "", PARCELLES);

  if (geminiLiveEnabled() && question?.trim()) {
    try {
      const texte = await callGemini(
        [
          {
            text: `Question d'un directeur durabilité sur son portefeuille de parcelles : « ${question} »\n\nFaits calculés sur les données réelles du portefeuille (seule source autorisée, n'ajoute AUCUN chiffre) :\n- Réponse de référence : ${answer.texte}\n- Chiffre clé : ${answer.metric ? `${answer.metric.label} = ${answer.metric.value}` : "aucun"}\n- Outils exécutés : ${answer.tools.map((t) => `${t.name} (${t.detail})`).join(", ")}\n\nReformule la réponse de référence en 2 ou 3 phrases naturelles et professionnelles qui répondent directement à la question. Texte brut uniquement, sans markdown.`,
          },
        ],
        { system: CHARTE_SYSTEM, maxOutputTokens: 512 },
      );
      return NextResponse.json({ ...answer, texte: texte.trim(), analyseMs, live: true });
    } catch (e) {
      console.error("[gemini/query] live échoué, repli déterministe:", e);
    }
  }

  if (MOCK_MODE) await sleep(analyseMs);
  return NextResponse.json({ ...answer, analyseMs });
}

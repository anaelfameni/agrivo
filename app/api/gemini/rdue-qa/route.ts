import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import { repondreDeterministe, faitsPourPrompt } from "@/lib/ai/rdue-faits";

/**
 * Copilote de conformité RDUE. Répond aux questions sur le règlement (UE) 2023/1115
 * en s'appuyant STRICTEMENT sur une base de faits curée et sourcée (lib/ai/rdue-faits).
 *
 * Charte : la réponse est GROUNDÉE — Gemini ne peut ni inventer un chiffre, ni sortir des
 * faits fournis, ni parler de crédit/financement. Toute question finance est interceptée
 * de façon déterministe AVANT l'appel IA (frontière Nanti). Sans clé ou en cas d'échec,
 * on renvoie la réponse déterministe appariée ; la démo ne dépend jamais du live.
 */
const SYSTEM_COPILOTE = `${CHARTE_SYSTEM}

Rôle : tu es le Copilote de conformité RDUE d'AGRIVO. Tu réponds aux questions d'un gérant de coopérative ivoirienne sur le règlement européen contre la déforestation.
Règles supplémentaires STRICTES :
- Réponds UNIQUEMENT à partir des faits fournis ci-dessous. N'ajoute aucun fait, chiffre ou date qui n'y figure pas.
- Sois direct et rassurant, 3 phrases maximum. Pas de liste, pas de formule d'accroche.
- Si la question porte sur du crédit, du financement ou un prêt, réponds que ce n'est pas le métier d'AGRIVO et ramène vers la conformité.
- Tu peux reformuler pour t'adapter à la question, mais la substance et les chiffres restent EXACTEMENT ceux des faits.`;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { question?: string; lang?: "fr" | "en" };
  const lang = body.lang === "en" ? "en" : "fr";
  const question = (body.question ?? "").toString().slice(0, 500).trim();
  if (!question) {
    return NextResponse.json({ error: "Question manquante." }, { status: 400 });
  }

  // Vérité déterministe : garde-fou charte (finance) + réponse sourcée appariée aux faits.
  const base = repondreDeterministe(question, lang);

  // Hors périmètre (finance / hors-sujet) : la réponse déterministe fait autorité, aucun appel IA.
  if (base.horsPerimetre) {
    if (MOCK_MODE) await sleep(500);
    return NextResponse.json({ reponse: base.reponse, source: base.source, live: false });
  }

  if (geminiLiveEnabled()) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Question du gérant : « ${question} »\n\nFaits vérifiés (réponds à partir de ceux-ci uniquement, dans un ${lang === "fr" ? "français" : "anglais"} clair, 3 phrases maximum) :\n${faitsPourPrompt(lang)}\n\nLa réponse de référence est le fait « ${base.faitId} ». Reformule-la naturellement pour coller à la question, sans changer les chiffres ni les dates.`,
          },
        ],
        // Mise en mots courte : pas de « réflexion » (latence ÷ 2-3), marge suffisante pour 3 phrases.
        { system: SYSTEM_COPILOTE, maxOutputTokens: 512, thinkingBudget: 0 },
      );
      const reponse = raw.trim();
      if (reponse.length > 10) {
        return NextResponse.json({ reponse, source: base.source, live: true });
      }
    } catch (e) {
      console.error("[gemini/rdue-qa] live échoué, repli déterministe:", e);
    }
  }

  if (MOCK_MODE) await sleep(700);
  return NextResponse.json({ reponse: base.reponse, source: base.source, live: false });
}

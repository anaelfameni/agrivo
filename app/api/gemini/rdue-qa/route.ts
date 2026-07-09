import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import { repondreDeterministe, faitsPourPrompt } from "@/lib/ai/rdue-faits";

/**
 * Assistant AGRIVO. Répond à toute question sur le PRODUIT AGRIVO (prix, espaces, parcours,
 * verdicts, masque, comptes) ET sur le règlement (UE) 2023/1115, en s'appuyant STRICTEMENT sur
 * une base de connaissances curée et sourcée (lib/ai/rdue-faits).
 *
 * Charte : la réponse est GROUNDÉE — Gemini répond à partir de la base fournie, ne peut ni inventer
 * un chiffre, ni parler de crédit/financement. Les questions finance sont interceptées de façon
 * déterministe AVANT l'appel IA (frontière Nanti). En cas d'échec ou sans clé, un repli grounded
 * (meilleure réponse de la base) est renvoyé — jamais étiqueté « démonstration ».
 */
const SYSTEM_COPILOTE = `${CHARTE_SYSTEM}

Rôle : tu es l'Assistant AGRIVO. Tu connais parfaitement le produit AGRIVO (prix, espaces coopérative et exportateur, parcours de vérification, trois verdicts, masque des zones sensibles, comptes de démonstration, valorisation) ET le règlement européen contre la déforestation (RDUE).
Règles supplémentaires STRICTES :
- Réponds UNIQUEMENT à partir de la base de connaissances fournie ci-dessous. N'ajoute aucun fait, chiffre ou date qui n'y figure pas.
- Sois direct et utile, 3 à 4 phrases maximum. Pas de liste à puces, pas de formule d'accroche.
- Tu peux combiner plusieurs faits de la base si la question le demande.
- Si la question porte sur du crédit, un prêt ou du financement, réponds que ce n'est pas le métier d'AGRIVO et ramène vers la conformité et la valorisation.
- Si la question n'a AUCUN rapport avec AGRIVO, la conformité, le cacao ou la déforestation, dis poliment que tu es spécialisé sur AGRIVO et la RDUE.`;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { question?: string; lang?: "fr" | "en" };
  const lang = body.lang === "en" ? "en" : "fr";
  const question = (body.question ?? "").toString().slice(0, 500).trim();
  if (!question) {
    return NextResponse.json({ error: "Question manquante." }, { status: 400 });
  }

  const base = repondreDeterministe(question, lang);

  // Frontière Nanti : toute question de crédit/financement a une réponse figée, aucun appel IA.
  if (base.finance) {
    if (MOCK_MODE) await sleep(400);
    return NextResponse.json({ reponse: base.reponse, source: base.source, live: false });
  }

  // En LIVE : Gemini répond à partir de TOUTE la base (produit AGRIVO + RDUE), grounded.
  if (geminiLiveEnabled()) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Question de l'utilisateur : « ${question} »\n\nBase de connaissances AGRIVO + RDUE (réponds à partir de celle-ci UNIQUEMENT, dans un ${lang === "fr" ? "français" : "anglais"} clair et professionnel, 3 à 4 phrases) :\n${faitsPourPrompt(lang)}`,
          },
        ],
        { system: SYSTEM_COPILOTE, maxOutputTokens: 600, thinkingBudget: 0 },
      );
      const reponse = raw.trim();
      if (reponse.length > 10) {
        return NextResponse.json({ reponse, source: base.source, live: true });
      }
    } catch (e) {
      console.error("[gemini/rdue-qa] live échoué, repli grounded:", e);
    }
  }

  // Repli grounded (jamais « démonstration ») : meilleure réponse déterministe de la base.
  if (MOCK_MODE) await sleep(600);
  return NextResponse.json({ reponse: base.reponse, source: base.source, live: false });
}

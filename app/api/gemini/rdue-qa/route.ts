import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import { repondreDeterministe, faitsPourPrompt, detecterSmallTalk } from "@/lib/ai/rdue-faits";

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

Rôle : tu es l'Assistant AGRIVO. Tu connais parfaitement le produit AGRIVO (prix, espaces coopérative et exportateur, parcours de vérification, trois verdicts, masque des zones sensibles, comptes de démonstration, valorisation, pages du site) ET le règlement européen contre la déforestation (RDUE).
Règles supplémentaires STRICTES :
- Réponds COURT et DIRECT : 1 à 3 phrases maximum, jamais plus. Pas de liste à puces, pas de formule d'accroche, va droit au but. Une réponse d'une seule phrase est parfaite si elle suffit.
- Appuie-toi sur la base de connaissances fournie. Tu peux expliquer, reformuler et combiner ces faits librement pour bien répondre — mais n'invente JAMAIS un chiffre, un prix, une date ou un fait qui n'y figure pas.
- Quand c'est utile, guide l'utilisateur vers la bonne page ou la bonne action du site (en une courte indication).
- Si on te salue ou te demande qui tu es, présente-toi en UNE phrase comme l'Assistant AGRIVO.
- Crédit, prêt ou financement : dis en une phrase que ce n'est pas le métier d'AGRIVO et ramène vers la conformité et la valorisation.
- Question trop complexe ou spécifique à un dossier client : oriente en une phrase vers support@agrivo.ci.
- Question SANS AUCUN rapport avec AGRIVO, la conformité RDUE, le cacao ou la déforestation : réponds en une phrase que tu es spécialisé sur AGRIVO et la RDUE, sans traiter le sujet.`;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { question?: string; lang?: "fr" | "en" };
  const lang = body.lang === "en" ? "en" : "fr";
  const question = (body.question ?? "").toString().slice(0, 500).trim();
  if (!question) {
    return NextResponse.json({ error: "Question manquante." }, { status: 400 });
  }

  // Small-talk pur (salut, merci, au revoir, « ça va ? ») : réponse chaleureuse instantanée,
  // identique en live et en repli, sans consommer le quota IA.
  const smallTalk = detecterSmallTalk(question, lang);
  if (smallTalk) {
    return NextResponse.json({ reponse: smallTalk.reponse, source: "Assistant AGRIVO", live: false });
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
            text: `Question de l'utilisateur : « ${question} »\n\nRéponds en ${lang === "fr" ? "français" : "anglais"} clair, COURT (1 à 3 phrases). Appuie-toi sur cette base de connaissances AGRIVO + RDUE, sans inventer de chiffre ou de date absent :\n${faitsPourPrompt(lang)}`,
          },
        ],
        { system: SYSTEM_COPILOTE, maxOutputTokens: 320, thinkingBudget: 0 },
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

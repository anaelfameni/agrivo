import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";

/**
 * Traduction du verdict en langue locale (Dioula / Baoulé) pour que l'agent lise l'EXPLICATION
 * au producteur. On ne traduit QUE la phrase d'explication : le STATUT reste figé en français
 * (« Conforme » / « Anomalie détectée » / « Données insuffisantes »), conformément à la charte.
 *
 * Honnêteté : si Gemini est indisponible, on ne fabrique PAS une fausse traduction — on renvoie
 * le texte original en signalant que la traduction en direct n'est pas disponible.
 */
const LANGUES: Record<string, { fr: string }> = {
  dioula: { fr: "dioula (jula)" },
  baoule: { fr: "baoulé" },
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { texte?: string; langue?: string };
  const texte = (body.texte ?? "").toString().slice(0, 600).trim();
  const langue = body.langue && LANGUES[body.langue] ? body.langue : "dioula";
  if (!texte) {
    return NextResponse.json({ error: "Texte à traduire manquant." }, { status: 400 });
  }

  if (geminiLiveEnabled()) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Traduis en ${LANGUES[langue].fr} l'explication suivante, destinée à être lue à voix haute à un producteur de cacao. Registre simple et respectueux. Ne traduis pas les noms propres ni les dates. Ne traduis AUCUN statut réglementaire. Ne rajoute rien. Réponds uniquement par la traduction.\n\nExplication : « ${texte} »`,
          },
        ],
        { system: CHARTE_SYSTEM, maxOutputTokens: 400, thinkingBudget: 0 },
      );
      const traduction = raw.trim();
      if (traduction.length > 2) {
        return NextResponse.json({ traduction, live: true });
      }
    } catch (e) {
      console.error("[gemini/traduire-verdict] live échoué:", e);
    }
  }

  // Repli honnête : pas de fausse traduction, on rend le texte d'origine.
  if (MOCK_MODE) await sleep(500);
  return NextResponse.json({ traduction: texte, live: false });
}

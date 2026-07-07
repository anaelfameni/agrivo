import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, parseJson, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";

/**
 * Diagnostic agronomique VISUEL d'une parcelle (Gemini Vision). Décrit des OBSERVATIONS
 * qualitatives d'une photo prise au champ (culture probable, canopée, ombrage, agroforesterie,
 * état visible du couvert). Ce n'est PAS un verdict de conformité : la détection de déforestation
 * reste l'exclusivité de Whisp (phrases figées). Le prompt l'interdit explicitement.
 *
 * Charte : observations qualitatives, aucun statut, aucun pourcentage, aucune finance.
 */
const OBSERVATIONS_DEMO_FR = [
  "Culture probable : cacaoyers adultes, port régulier.",
  "Canopée : couverture partielle, présence d'arbres d'ombrage.",
  "Signes d'agroforesterie : quelques essences forestières conservées.",
  "État visible du couvert : feuillage globalement vert, sans stress marqué.",
];
const OBSERVATIONS_DEMO_EN = [
  "Likely crop: mature cocoa trees, regular habit.",
  "Canopy: partial cover, shade trees present.",
  "Signs of agroforestry: a few forest species retained.",
  "Visible canopy condition: broadly green foliage, no marked stress.",
];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { imageBase64?: string; mimeType?: string; lang?: "fr" | "en" };
  const lang = body.lang === "en" ? "en" : "fr";

  if (geminiLiveEnabled() && body.imageBase64) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Voici la photo d'une parcelle agricole ivoirienne prise au champ. Décris des OBSERVATIONS qualitatives, en ${lang === "fr" ? "français" : "anglais"}, sur : culture probable, densité de canopée, présence d'arbres d'ombrage / d'agroforesterie, état visible du couvert. Réponds en JSON strict {"observations": string[]} (3 à 5 items courts). N'émets AUCUN verdict de conformité ou de déforestation, AUCUN pourcentage, AUCUN chiffre. Si la photo n'est pas une parcelle, renvoie une liste vide.`,
          },
          { inlineData: { mimeType: body.mimeType || "image/jpeg", data: body.imageBase64 } },
        ],
        { system: CHARTE_SYSTEM, json: true, maxOutputTokens: 600, thinkingBudget: 0 },
      );
      const parsed = parseJson<{ observations: string[] }>(raw);
      if (Array.isArray(parsed.observations) && parsed.observations.length > 0) {
        return NextResponse.json({ observations: parsed.observations.slice(0, 5), live: true });
      }
    } catch (e) {
      console.error("[gemini/parcelle-photo] live échoué, repli démo:", e);
    }
  }

  if (MOCK_MODE) await sleep(1200);
  return NextResponse.json({ observations: lang === "en" ? OBSERVATIONS_DEMO_EN : OBSERVATIONS_DEMO_FR, live: false });
}

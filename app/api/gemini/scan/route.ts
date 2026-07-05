import { NextResponse } from "next/server";
import { scannerCarteProducteur, type ScanResult } from "@/lib/ai/gemini";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, parseJson, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import { FILIERES } from "@/config/filieres";

const FILIERE_IDS = FILIERES.map((f) => f.id);

/**
 * OCR de la carte producteur. LIVE (GEMINI_API_KEY posée + image fournie) : Gemini Vision extrait
 * les champs de la photo. Sinon, ou en cas d'échec : résultat pré-enregistré (repli mock, démo sûre).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { imageBase64?: string; mimeType?: string };

  if (geminiLiveEnabled() && body.imageBase64) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Voici la photo d'une carte professionnelle de producteur agricole ivoirien. Extrais exactement ces champs et réponds en JSON strict : {"producteurNom": string, "numeroCartePro": string, "localite": string, "filiere": une valeur parmi ${JSON.stringify(FILIERE_IDS)}}. Si un champ est illisible, mets une chaîne vide.`,
          },
          { inlineData: { mimeType: body.mimeType || "image/jpeg", data: body.imageBase64 } },
        ],
        { system: CHARTE_SYSTEM, json: true },
      );
      const parsed = parseJson<ScanResult>(raw);
      if (parsed.producteurNom || parsed.numeroCartePro) {
        return NextResponse.json({
          ...parsed,
          filiere: FILIERE_IDS.includes(parsed.filiere) ? parsed.filiere : "cacao",
          live: true,
        });
      }
    } catch (e) {
      console.error("[gemini/scan] live échoué, repli mock:", e);
    }
  }

  if (MOCK_MODE) await sleep(1300);
  const result = await scannerCarteProducteur();
  return NextResponse.json(result);
}

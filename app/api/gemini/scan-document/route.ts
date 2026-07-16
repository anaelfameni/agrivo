import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, parseJson, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import {
  TYPES_DOCUMENT,
  TYPE_DOCUMENT_LABEL,
  validerExtraction,
  extractionLisible,
  extractionDemo,
  type TypeDocument,
} from "@/lib/ai/scan-document";

/**
 * Scan universel des documents de transport du lot (connaissement, bordereau d'achat bord champ,
 * ticket de pesée) — le geste qui remplit le registre de possession en une photo.
 *
 * Même doctrine que l'OCR de la carte producteur (app/api/gemini/scan) :
 *  - en PRODUCTION (GEMINI_API_KEY posée), lecture RÉELLE via Gemini Vision ; document illisible
 *    ou appel échoué → champs vides, l'application redemande une photo (JAMAIS de faux champ) ;
 *  - en développement local sans clé : résultat de démonstration déterministe, étiqueté demo.
 * L'extraction validée alimente un jalon du journal de possession ; l'anti-doublon de
 * connaissement est recalculé par la sentinelle de volume, pas ici.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    typeDocument?: string;
    imageBase64?: string;
    mimeType?: string;
  };

  const type: TypeDocument = TYPES_DOCUMENT.includes(body.typeDocument as TypeDocument)
    ? (body.typeDocument as TypeDocument)
    : "connaissement";
  const vide = validerExtraction(type, {});
  const imageBase64 =
    typeof body.imageBase64 === "string" && body.imageBase64.length > 100 ? body.imageBase64 : null;

  if (geminiLiveEnabled()) {
    if (!imageBase64) {
      return NextResponse.json({ ...vide, live: true, unreadable: true });
    }
    try {
      const label = TYPE_DOCUMENT_LABEL[type].fr;
      const raw = await callGemini(
        [
          {
            text:
              `Tu reçois la photo d'un document logistique de la filière cacao ivoirienne. ` +
              `SI — et seulement si — c'est un document du type « ${label} » LISIBLE, extrais ses champs. ` +
              `Réponds en JSON strict : {"numero": string, "date": string (format AAAA-MM-JJ), "acteur": string, "tonnes": number}. ` +
              `Mets une chaîne vide (ou null pour tonnes) pour tout champ illisible ou absent. ` +
              `Si la photo n'est PAS un document de ce type lisible (floue, vide, autre document, main, décor), renvoie TOUS les champs vides. ` +
              `N'invente JAMAIS un numéro, une date ou un tonnage : n'écris que ce que tu lis réellement sur le document.`,
          },
          { inlineData: { mimeType: body.mimeType || "image/jpeg", data: imageBase64 } },
        ],
        { system: CHARTE_SYSTEM, json: true, thinkingBudget: 0 },
      );
      const extraction = validerExtraction(type, parseJson<Record<string, unknown>>(raw));
      if (extractionLisible(extraction)) {
        return NextResponse.json({ ...extraction, live: true });
      }
      // Photo reçue mais aucun document lisible dessus : on redemande, sans inventer.
      return NextResponse.json({ ...vide, live: true, unreadable: true });
    } catch (e) {
      console.error("[gemini/scan-document] lecture échouée:", e);
      return NextResponse.json({ ...vide, live: false, error: true });
    }
  }

  // Développement local SANS clé Gemini : résultat de démonstration (jamais en production).
  if (MOCK_MODE) await sleep(900);
  return NextResponse.json({ ...extractionDemo(type), demo: true });
}

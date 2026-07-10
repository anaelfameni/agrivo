import { NextResponse } from "next/server";
import { scannerCarteProducteur, type ScanResult } from "@/lib/ai/gemini";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, parseJson, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import { FILIERES } from "@/config/filieres";

const FILIERE_IDS = FILIERES.map((f) => f.id);

const VIDE: ScanResult = { producteurNom: "", numeroCartePro: "", localite: "", filiere: "cacao" };

/**
 * OCR de la carte producteur.
 *
 * En PRODUCTION (GEMINI_API_KEY posée), on lit RÉELLEMENT la photo via Gemini Vision. On ne
 * renvoie JAMAIS de résultat de démonstration ici : si la photo est illisible (floue, vide,
 * autre document) ou si l'appel échoue, on renvoie des champs vides — l'application redemande
 * alors une photo nette ou propose la saisie manuelle. Le résultat pré-enregistré (démo) ne
 * sert qu'en développement local sans clé Gemini.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { imageBase64?: string; mimeType?: string };
  const imageBase64 = typeof body.imageBase64 === "string" && body.imageBase64.length > 100 ? body.imageBase64 : null;

  if (geminiLiveEnabled()) {
    // Pas d'image exploitable → on redemande une photo (aucun faux résultat).
    if (!imageBase64) {
      return NextResponse.json({ ...VIDE, live: true, unreadable: true });
    }
    try {
      const raw = await callGemini(
        [
          {
            text:
              `Tu reçois la photo prise par un agent de coopérative au bord d'un champ. ` +
              `SI — et seulement si — c'est une carte de producteur agricole ivoirien LISIBLE, extrais ses champs. ` +
              `Réponds en JSON strict : {"producteurNom": string, "numeroCartePro": string, "localite": string, "filiere": une valeur parmi ${JSON.stringify(FILIERE_IDS)}}. ` +
              `Mets une chaîne vide pour tout champ illisible. ` +
              `Si la photo n'est PAS une carte producteur lisible (floue, vide, autre document, main, décor), renvoie TOUS les champs vides. ` +
              `N'invente JAMAIS un nom ou un numéro : n'écris que ce que tu lis réellement sur la carte.`,
          },
          { inlineData: { mimeType: body.mimeType || "image/jpeg", data: imageBase64 } },
        ],
        { system: CHARTE_SYSTEM, json: true, thinkingBudget: 0 },
      );
      const parsed = parseJson<ScanResult>(raw);
      const nom = (parsed.producteurNom ?? "").trim();
      const carte = (parsed.numeroCartePro ?? "").trim();
      if (nom || carte) {
        return NextResponse.json({
          producteurNom: nom,
          numeroCartePro: carte,
          localite: (parsed.localite ?? "").trim(),
          filiere: FILIERE_IDS.includes(parsed.filiere) ? parsed.filiere : "cacao",
          live: true,
        });
      }
      // Photo reçue mais aucune carte lisible dessus : on redemande, sans inventer.
      return NextResponse.json({ ...VIDE, live: true, unreadable: true });
    } catch (e) {
      console.error("[gemini/scan] OCR échoué:", e);
      // Échec réseau / quota : pas de faux résultat non plus.
      return NextResponse.json({ ...VIDE, live: false, error: true });
    }
  }

  // Développement local SANS clé Gemini : résultat de démonstration pré-enregistré (jamais en prod).
  if (MOCK_MODE) await sleep(1000);
  const result = await scannerCarteProducteur();
  return NextResponse.json({ ...result, demo: true });
}

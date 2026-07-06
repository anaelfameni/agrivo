import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, parseJson, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import { genererArgumentairePrime, type ArgumentairePrime } from "@/lib/ai/argumentaire";
import { getParcelle, parcellesForCoop } from "@/data/mock-parcelles";

/**
 * Argumentaire de prime (étape Valorisation). Les FAITS sont déterministes : statistiques du
 * portefeuille calculées sur les données + faits de marché sourcés (jamais des promesses).
 * En LIVE, Gemini met en mots ; en cas d'échec ou sans clé, la rédaction déterministe est
 * renvoyée avec `live: false` (étiquetée « mode démonstration » par l'interface).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { parcelleId?: string; lang?: "fr" | "en" };
  const lang = body.lang === "en" ? "en" : "fr";
  const p = body.parcelleId ? getParcelle(body.parcelleId) : undefined;
  if (!p) return NextResponse.json({ error: "Parcelle introuvable." }, { status: 404 });

  const base = genererArgumentairePrime(p, parcellesForCoop(p.cooperative), lang);

  if (geminiLiveEnabled()) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Voici l'argumentaire qu'un gérant de coopérative ivoirienne présente à son exportateur pour négocier des primes de durabilité AU-DESSUS du prix garanti par l'État (on ne négocie jamais le prix lui-même). La trame et TOUS les chiffres, dates et références sont vérifiés et non négociables. Réécris UNIQUEMENT la rédaction en ${lang === "fr" ? "français" : "anglais"} professionnel et convaincant, sans ajouter, retirer ni modifier AUCUN chiffre, date, référence ou fait, sans promettre aucun montant, sans aucun vocabulaire de crédit ou de financement. Garde le même nombre de paragraphes. Réponds en JSON strict : {"titre": string, "paragraphes": [string]}.\n\nArgumentaire :\n${JSON.stringify({ titre: base.titre, paragraphes: base.paragraphes })}`,
          },
        ],
        { system: CHARTE_SYSTEM, json: true, maxOutputTokens: 1536 },
      );
      const rewritten = parseJson<Pick<ArgumentairePrime, "titre" | "paragraphes">>(raw);
      if (rewritten.paragraphes?.length === base.paragraphes.length && rewritten.titre) {
        return NextResponse.json({ titre: rewritten.titre, paragraphes: rewritten.paragraphes, live: true });
      }
    } catch (e) {
      console.error("[gemini/valorisation-memo] live échoué, repli déterministe:", e);
    }
  }

  if (MOCK_MODE) await sleep(1100);
  return NextResponse.json({ ...base, live: false });
}

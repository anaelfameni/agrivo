import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, parseJson, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";

/**
 * Revue IA du registre — Gemini MET EN MOTS les points à vérifier calculés de façon
 * déterministe côté client (lib/registre/revue.ts). Il ne peut ni en ajouter, ni en retirer,
 * ni changer un chiffre ou un matricule : on lui envoie les motifs, il renvoie EXACTEMENT le
 * même nombre de motifs reformulés, dans le même ordre. Toute divergence → repli déterministe.
 *
 * Charte : ce sont des « points à vérifier », jamais « Anomalie détectée » (rappelé au prompt).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { motifs?: unknown; lang?: "fr" | "en" };
  const lang = body.lang === "en" ? "en" : "fr";
  const motifs = Array.isArray(body.motifs) ? body.motifs.filter((m): m is string => typeof m === "string") : [];

  if (motifs.length === 0) {
    return NextResponse.json({ motifs: [], live: false });
  }

  if (geminiLiveEnabled()) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Voici des « points à vérifier » issus de la revue d'un registre de coopérative (RDUE). Réécris CHAQUE point dans un ${lang === "fr" ? "français" : "anglais"} professionnel, neutre et concis, SANS changer aucun chiffre, matricule, superficie ni la substance, et SANS transformer un doute en affirmation. N'emploie JAMAIS « Anomalie détectée » : ce sont des points à vérifier. Réponds en JSON strict {"motifs": string[]} avec EXACTEMENT ${motifs.length} éléments, dans le même ordre.\n\nPoints :\n${motifs.map((m, i) => `${i + 1}. ${m}`).join("\n")}`,
          },
        ],
        { system: CHARTE_SYSTEM, json: true, maxOutputTokens: 1500, thinkingBudget: 0 },
      );
      const parsed = parseJson<{ motifs: string[] }>(raw);
      if (
        Array.isArray(parsed.motifs) &&
        parsed.motifs.length === motifs.length &&
        parsed.motifs.every((m) => typeof m === "string" && m.trim().length > 0)
      ) {
        return NextResponse.json({ motifs: parsed.motifs, live: true });
      }
    } catch (e) {
      console.error("[gemini/registre-revue] live échoué, repli déterministe:", e);
    }
  }

  if (MOCK_MODE) await sleep(700);
  return NextResponse.json({ motifs, live: false });
}

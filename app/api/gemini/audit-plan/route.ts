import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, parseJson, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import { construirePlanAction, type PlanAction, type ResumeAudit } from "@/lib/registre/plan";

/**
 * Plan d'action IA après l'audit du registre. Les FAITS (comptes par catégorie, actions
 * bureau/terrain, % prêt) sont déterministes et calculés côté client sur les données de la
 * coopérative — la route ne reçoit qu'un résumé anonyme. En LIVE, Gemini met le plan en mots ;
 * en cas d'échec ou sans clé, le plan déterministe est renvoyé tel quel avec `live: false`
 * (l'interface l'étiquette honnêtement « mode démonstration »).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { resume?: ResumeAudit; lang?: "fr" | "en" };
  const lang = body.lang === "en" ? "en" : "fr";
  if (!body.resume || typeof body.resume.total !== "number" || !Array.isArray(body.resume.categories)) {
    return NextResponse.json({ error: "Résumé d'audit manquant." }, { status: 400 });
  }

  const base = construirePlanAction(body.resume, lang);

  if (geminiLiveEnabled()) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Voici le plan d'action de mise en conformité RDUE d'un registre de coopérative. La trame et TOUS les chiffres sont vérifiés et non négociables. Réécris UNIQUEMENT la rédaction (titres et détails) dans un ${lang === "fr" ? "français" : "anglais"} professionnel, direct et motivant pour un gérant de coopérative, sans ajouter, retirer ni modifier AUCUN chiffre, compte ou fait. Garde le même nombre d'étapes et le même ordre. Réponds en JSON strict : {"etapes": [{"titre": string, "detail": string}], "conclusion": string}.\n\nPlan :\n${JSON.stringify({ etapes: base.etapes, conclusion: base.conclusion })}`,
          },
        ],
        { system: CHARTE_SYSTEM, json: true, maxOutputTokens: 1536 },
      );
      const rewritten = parseJson<Pick<PlanAction, "etapes" | "conclusion">>(raw);
      if (rewritten.etapes?.length === base.etapes.length && rewritten.conclusion) {
        return NextResponse.json({ etapes: rewritten.etapes, conclusion: rewritten.conclusion, live: true });
      }
    } catch (e) {
      console.error("[gemini/audit-plan] live échoué, repli déterministe:", e);
    }
  }

  if (MOCK_MODE) await sleep(900);
  return NextResponse.json({ ...base, live: false });
}

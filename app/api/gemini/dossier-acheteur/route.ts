import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";

/**
 * Dossier acheteur EUDR — résumé exécutif consolidé pour l'opérateur/acheteur européen.
 * Les FAITS (nb de parcelles Conformes, hectares vérifiés, coopératives, filières) sont
 * calculés côté client sur le portefeuille ; la route ne reçoit qu'un résumé chiffré et
 * demande à Gemini de rédiger un résumé exécutif « audit-ready ». Il ne modifie aucun chiffre.
 *
 * Charte : « évaluation », jamais « garantie » ; l'opérateur reste responsable de sa
 * déclaration ; aucun chiffre inventé ; aucune notion de crédit/financement.
 */
interface FaitsDossier {
  nbConformes: number;
  total: number;
  haConformes: number;
  coops: number;
  filieres: string[];
  regions: string[];
}

function resumeDeterministe(f: FaitsDossier, lang: "fr" | "en"): string {
  const filieres = f.filieres.join(", ");
  const regions = f.regions.join(", ");
  if (lang === "en") {
    return `This buyer file consolidates ${f.nbConformes} plots assessed "Compliant" out of ${f.total} in the portfolio, i.e. ${f.haConformes} ha verified by satellite (Whisp method, FAO) across ${f.coops} cooperative(s), ${filieres} value chain(s), in ${regions}. Each plot carries a publicly verifiable certificate and its GeoJSON geometry (RFC 7946). This is a compliance assessment, not a guarantee: the operator remains responsible for its due diligence statement filed on TRACES NT.`;
  }
  return `Ce dossier acheteur consolide ${f.nbConformes} parcelles évaluées « Conforme » sur ${f.total} du portefeuille, soit ${f.haConformes} ha vérifiés par satellite (méthode Whisp, FAO) sur ${f.coops} coopérative(s), filière(s) ${filieres}, en ${regions}. Chaque parcelle porte un certificat vérifiable publiquement et sa géométrie GeoJSON (RFC 7946). Il s'agit d'une évaluation de conformité, non d'une garantie : l'opérateur reste responsable de sa déclaration de diligence déposée sur TRACES NT.`;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { faits?: FaitsDossier; lang?: "fr" | "en" };
  const lang = body.lang === "en" ? "en" : "fr";
  const f = body.faits;
  if (!f || typeof f.nbConformes !== "number" || typeof f.total !== "number") {
    return NextResponse.json({ error: "Faits du dossier manquants." }, { status: 400 });
  }

  const base = resumeDeterministe(f, lang);

  if (geminiLiveEnabled()) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Rédige un résumé exécutif (4 à 6 phrases) pour l'acheteur européen d'un dossier de conformité RDUE, dans un ${lang === "fr" ? "français" : "anglais"} professionnel et sobre. Utilise EXCLUSIVEMENT ces faits, sans en modifier aucun chiffre :\n${base}\n\nGarde le mot « évaluation » (jamais « garantie »), rappelle que l'opérateur reste responsable, ne mentionne aucun crédit ni financement, n'invente rien. Réponds par le seul texte du résumé.`,
          },
        ],
        { system: CHARTE_SYSTEM, maxOutputTokens: 700, thinkingBudget: 0 },
      );
      const resume = raw.trim();
      if (resume.length > 40) {
        return NextResponse.json({ resume, live: true });
      }
    } catch (e) {
      console.error("[gemini/dossier-acheteur] live échoué, repli déterministe:", e);
    }
  }

  if (MOCK_MODE) await sleep(800);
  return NextResponse.json({ resume: base, live: false });
}

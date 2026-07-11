import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import { findExpedition, parcellesExpedition, tonnageExpedition, statutExpedition, JALON_LABEL } from "@/data/mock-expeditions";
import { FILIERE_LABEL } from "@/data/mock-parcelles";

/**
 * Résumé exécutif du DOSSIER D'EXPÉDITION (parcelle → conteneur) pour l'acheteur européen.
 * Les faits sont recalculés côté serveur depuis l'expédition (jamais depuis le client) ;
 * Gemini ne fait que la mise en mots. Charte : « évaluation » jamais « garantie », l'opérateur
 * reste responsable de sa DDS, suivi DOCUMENTAIRE (déclaratif) — jamais « suivi physique ».
 */
function resumeDeterministe(ref: string, lang: "fr" | "en"): string | null {
  const exp = findExpedition(ref);
  if (!exp) return null;
  const parcelles = parcellesExpedition(exp);
  const coops = [...new Set(parcelles.map((p) => p.cooperative))];
  const tonnes = tonnageExpedition(exp);
  const jalon = JALON_LABEL[statutExpedition(exp).code][lang];
  const filiere = FILIERE_LABEL[exp.filiere];
  if (lang === "en") {
    return `Shipment file ${exp.ref} ("${exp.nomLot}") consolidates ${parcelles.length} plots, all assessed "Compliant" by satellite (Whisp method, FAO), contributed by ${coops.join(", ")} for ${tonnes} t of ${filiere.toLowerCase()} (HS code ${exp.codeSH}). Volumes are reconciled plot by plot against the anti-fraud cap (area × regional yield) and segregation is strict: no non-compliant plot can enter a lot. Current documentary milestone: ${jalon}. The lot's GeoJSON (RFC 7946) lists every plot of origin, as required for the due diligence statement on TRACES NT. This is a compliance assessment, not a guarantee: the operator remains solely responsible for its DDS.`;
  }
  return `Le dossier d'expédition ${exp.ref} (« ${exp.nomLot} ») consolide ${parcelles.length} parcelles, toutes évaluées « Conforme » par satellite (méthode Whisp, FAO), apportées par ${coops.join(", ")} pour ${tonnes} t de ${filiere.toLowerCase()} (code SH ${exp.codeSH}). Les volumes sont réconciliés parcelle par parcelle contre le plafond anti-fraude (superficie × rendement régional) et la ségrégation est stricte : aucune parcelle non conforme ne peut entrer dans un lot. Jalon documentaire actuel : ${jalon}. Le GeoJSON du lot (RFC 7946) liste toutes les parcelles d'origine, comme l'exige la déclaration de diligence raisonnée sur TRACES NT. Il s'agit d'une évaluation de conformité, non d'une garantie : l'opérateur reste seul responsable de sa DDS.`;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { ref?: string; lang?: "fr" | "en" };
  const lang = body.lang === "en" ? "en" : "fr";
  const base = body.ref ? resumeDeterministe(body.ref, lang) : null;
  if (!base) {
    return NextResponse.json({ error: "Expédition inconnue." }, { status: 400 });
  }

  if (geminiLiveEnabled()) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Rédige un résumé exécutif (4 à 6 phrases) du dossier d'expédition RDUE ci-dessous pour l'acheteur européen, dans un ${lang === "fr" ? "français" : "anglais"} professionnel et sobre. Utilise EXCLUSIVEMENT ces faits, sans modifier aucun chiffre :\n${base}\n\nGarde « évaluation » (jamais « garantie »), rappelle que l'opérateur reste responsable de sa DDS, parle de suivi DOCUMENTAIRE (jamais de suivi physique des sacs), aucune notion de crédit. Réponds par le seul texte du résumé.`,
          },
        ],
        { system: CHARTE_SYSTEM, maxOutputTokens: 700, thinkingBudget: 0 },
      );
      const resume = raw.trim();
      if (resume.length > 40) {
        return NextResponse.json({ resume, live: true });
      }
    } catch (e) {
      console.error("[gemini/expedition-memo] live échoué, repli déterministe:", e);
    }
  }

  if (MOCK_MODE) await sleep(800);
  return NextResponse.json({ resume: base, live: false });
}

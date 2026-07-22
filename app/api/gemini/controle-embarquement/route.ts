import { NextResponse } from "next/server";
import { MOCK_MODE, sleep } from "@/lib/ai/config";
import { callGemini, geminiLiveEnabled, CHARTE_SYSTEM } from "@/lib/ai/gemini-live";
import { controleEmbarquement, findExpedition } from "@/data/mock-expeditions";
import { PARCELLES } from "@/data/mock-parcelles";

/**
 * Contrôle PRÉ-EMBARQUEMENT (IA) d'un dossier d'expédition — le screening documentaire du lot
 * avant départ. Les 5 points de contrôle sont des FAITS recalculés côté serveur
 * (plafonds anti-fraude, fraîcheur des vérifications, alertes coop, références DDR,
 * logistique) ; Gemini ne fait que rédiger la note de synthèse. Niveaux qualitatifs
 * uniquement — jamais de score inventé, jamais « garantie ».
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { ref?: string; lang?: "fr" | "en" };
  const lang = body.lang === "en" ? "en" : "fr";
  const exp = body.ref ? findExpedition(body.ref) : undefined;
  if (!exp) {
    return NextResponse.json({ error: "Expédition inconnue." }, { status: 400 });
  }

  const controle = controleEmbarquement(exp, PARCELLES);
  const faits = controle.points.map((p) => `- [${p.niveau === "ok" ? "OK" : "ATTENTION"}] ${p[lang]}`).join("\n");
  const verdictFr = controle.niveau === "pret" ? "Prêt à embarquer" : "Points d'attention avant embarquement";
  const verdictEn = controle.niveau === "pret" ? "Ready to load" : "Attention points before loading";
  const base =
    lang === "en"
      ? `Pre-shipment screening of ${exp.ref}, ${verdictEn}.\n${faits}\nThis is a documentary assessment, not a guarantee: the operator remains responsible for its DDS.`
      : `Contrôle pré-embarquement de ${exp.ref}, ${verdictFr}.\n${faits}\nIl s'agit d'une évaluation documentaire, non d'une garantie : l'opérateur reste responsable de sa DDS.`;

  let note = base;
  let live = false;
  if (geminiLiveEnabled()) {
    try {
      const raw = await callGemini(
        [
          {
            text: `Rédige une note de contrôle pré-embarquement (3 à 5 phrases) pour l'exportateur, dans un ${lang === "fr" ? "français" : "anglais"} professionnel et sobre, à partir de CES SEULS faits (n'en modifie aucun, n'invente rien) :\n${base}\n\nCommence par le verdict (« ${lang === "fr" ? verdictFr : verdictEn} »), garde « évaluation » (jamais « garantie »), rappelle que l'opérateur reste responsable de sa DDS, aucune notion de crédit. Réponds par le seul texte de la note.`,
          },
        ],
        { system: CHARTE_SYSTEM, maxOutputTokens: 700, thinkingBudget: 0 },
      );
      const texte = raw.trim();
      if (texte.length > 40) {
        note = texte;
        live = true;
      }
    } catch (e) {
      console.error("[gemini/controle-embarquement] live échoué, repli déterministe:", e);
    }
  }

  if (MOCK_MODE && !live) await sleep(700);
  return NextResponse.json({ niveau: controle.niveau, points: controle.points, note, live });
}

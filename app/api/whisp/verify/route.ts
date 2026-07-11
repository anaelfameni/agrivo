import { NextResponse } from "next/server";
import { whispVerify, type WhispVerifyInput } from "@/lib/ai/whisp";
import { whispLiveEnabled, whispLiveVerify } from "@/lib/ai/whisp-live";
import { getParcelle, STATUT_PHRASE, STATUT_PHRASE_EN } from "@/data/mock-parcelles";
import { MOCK_MODE, simulatedLatency, sleep } from "@/lib/ai/config";

/**
 * Détection satellite d'une parcelle.
 *
 * LIVE (WHISP_API_KEY posée) : l'anneau du polygone est envoyé à l'API Whisp (FAO) et le verdict
 * vient de sa catégorie de risque — sauf pour les parcelles de scénario (`sc-*`) et les verdicts
 * forcés, qui restent déterministes (la démonstration sur scène ne dépend jamais du réseau).
 * REPLI (sans clé, échec ou timeout) : moteur déterministe calibré sur la méthode Whisp,
 * comportement historique inchangé. Aucun appel réseau ne part jamais du client.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as WhispVerifyInput;
  const analyseMs = simulatedLatency();

  const estScenario = typeof body.parcelleId === "string" && body.parcelleId.startsWith("sc-");
  if (whispLiveEnabled() && !body.force && !estScenario) {
    const ring = anneauPour(body);
    if (ring) {
      const debut = Date.now();
      try {
        const live = await whispLiveVerify(ring);
        const base = await whispVerify(body);
        return NextResponse.json({
          ...base,
          statut: live.statut,
          phrase: STATUT_PHRASE[live.statut],
          phraseEn: STATUT_PHRASE_EN[live.statut],
          convergence: [
            `Analyse Whisp (FAO Open Foris) exécutée en direct sur la parcelle${live.risqueBrut ? ` · catégorie de risque retournée : « ${live.risqueBrut} »` : ""}.`,
            ...base.convergence.slice(0, 2),
          ],
          convergenceEn: [
            `Whisp (FAO Open Foris) analysis run live on the plot${live.risqueBrut ? ` · returned risk category: "${live.risqueBrut}"` : ""}.`,
            ...base.convergenceEn.slice(0, 2),
          ],
          demo: false,
          live: true,
          analyseMs: Date.now() - debut,
        });
      } catch (e) {
        console.error("[whisp/verify] live échoué, repli moteur déterministe:", e);
      }
    }
  }

  if (MOCK_MODE) await sleep(analyseMs);
  const result = await whispVerify(body);
  return NextResponse.json({ ...result, analyseMs });
}

/** Anneau lon/lat de la parcelle : coordonnées fournies, sinon geojson de la parcelle connue. */
function anneauPour(body: WhispVerifyInput): number[][] | null {
  const c = body.coordinates as unknown;
  if (Array.isArray(c) && Array.isArray(c[0]) && Array.isArray((c as number[][][])[0][0])) {
    const ring = (c as number[][][])[0];
    if (ring.length >= 4) return ring;
  }
  if (Array.isArray(c) && Array.isArray(c[0]) && typeof (c as number[][])[0][0] === "number") {
    const ring = c as number[][];
    if (ring.length >= 4) return ring;
  }
  if (body.parcelleId) {
    const p = getParcelle(body.parcelleId);
    const ring = p?.geojson?.coordinates?.[0];
    if (Array.isArray(ring) && ring.length >= 4) return ring as number[][];
  }
  return null;
}

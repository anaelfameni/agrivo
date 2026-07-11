import { NextResponse } from "next/server";
import { whispVerify, type WhispVerifyInput } from "@/lib/ai/whisp";
import {
  CODE_PERTURBATION_APRES_2020,
  whispLiveEnabled,
  whispLiveVerify,
  type WhispLiveVerdict,
} from "@/lib/ai/whisp-live";
import { getParcelle, STATUT_PHRASE, STATUT_PHRASE_EN } from "@/data/mock-parcelles";
import { MOCK_MODE, simulatedLatency, sleep } from "@/lib/ai/config";

/** L'analyse Whisp en direct (Google Earth Engine) prend ~8-30 s : marge au-delà du défaut Vercel. */
export const maxDuration = 60;

const PAYS_LABEL: Record<string, { fr: string; en: string }> = {
  CIV: { fr: "Côte d'Ivoire", en: "Côte d'Ivoire" },
};

/**
 * Détection satellite d'une parcelle.
 *
 * LIVE (WHISP_API_KEY posée) : le polygone est soumis à l'API Whisp (FAO) avec les MÊMES paramètres
 * que l'interface officielle whisp.openforis.org (unités ha, données nationales CI, id externe
 * AGRIVO) ; le verdict vient de la catégorie de risque officielle de la filière et la réponse
 * embarque le détail complet (11 indicateurs, 3 risques, couvertures). Les parcelles de scénario
 * (`sc-*`) et les verdicts forcés restent déterministes — la démonstration sur scène ne dépend
 * jamais du réseau. REPLI (sans clé, échec ou timeout) : moteur déterministe calibré sur la méthode
 * Whisp, comportement historique inchangé. Aucun appel réseau ne part jamais du client.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as WhispVerifyInput;
  const analyseMs = simulatedLatency();

  const estScenario = typeof body.parcelleId === "string" && body.parcelleId.startsWith("sc-");
  if (whispLiveEnabled() && !body.force && !estScenario) {
    const ring = anneauPour(body);
    if (ring) {
      const parcelle = body.parcelleId ? getParcelle(body.parcelleId) : undefined;
      const filiere = body.filiere ?? parcelle?.filiere ?? null;
      const debut = Date.now();
      try {
        const live = await whispLiveVerify(ring, { parcelleId: body.parcelleId, filiere });
        const base = await whispVerify(body);
        return NextResponse.json({
          ...base,
          statut: live.statut,
          phrase: STATUT_PHRASE[live.statut],
          phraseEn: STATUT_PHRASE_EN[live.statut],
          convergence: convergenceLive(live, "fr"),
          convergenceEn: convergenceLive(live, "en"),
          detail: live.detail,
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

/** Convergence de preuves reconstruite sur les VRAIES valeurs retournées par l'API officielle. */
function convergenceLive(live: WhispLiveVerdict, lang: "fr" | "en"): string[] {
  const d = live.detail;
  const lignes: string[] = [];

  const risque = live.risqueBrut ? `« ${live.risqueBrut} »` : lang === "fr" ? "non retournée" : "not returned";
  lignes.push(
    lang === "fr"
      ? `Analyse Whisp v3 (FAO Open Foris) exécutée en direct via Google Earth Engine · catégorie de risque officielle : ${risque}.`
      : `Whisp v3 (FAO Open Foris) analysis run live on Google Earth Engine · official risk category: ${risque}.`,
  );

  const lieu = [d.region, d.pays ? (PAYS_LABEL[d.pays]?.[lang] ?? d.pays) : null].filter(Boolean).join(", ");
  if (lieu || d.surfaceHa !== null) {
    const surface =
      d.surfaceHa !== null
        ? `${d.surfaceHa.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 2 })} ha`
        : null;
    lignes.push(
      lang === "fr"
        ? `Localisation confirmée par l'API : ${lieu || "—"}${surface ? ` · ${surface} analysés` : ""}.`
        : `Location confirmed by the API: ${lieu || "—"}${surface ? ` · ${surface} analysed` : ""}.`,
    );
  }

  const apres = d.couvertures.find((c) => c.code === CODE_PERTURBATION_APRES_2020);
  if (apres) {
    lignes.push(
      lang === "fr"
        ? `Perturbation après le 31/12/2020 : ${apres.pct} % de la parcelle (TMF · GFC · RADD · GLAD).`
        : `Disturbance after 31/12/2020: ${apres.pct}% of the plot (TMF · GFC · RADD · GLAD).`,
    );
  }

  return lignes;
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

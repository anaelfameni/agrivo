/**
 * Client RÉEL de l'API Whisp (FAO Open Foris — « What's in that plot? »), serveur uniquement.
 *
 * Activation : poser `WHISP_API_KEY` (compte gratuit sur https://whisp.openforis.org → clé d'API,
 * `.env.local` en local + variable d'environnement Vercel). Sans clé, rien ne change : le moteur
 * d'évaluation déterministe calibré sur la méthode Whisp reste le comportement par défaut.
 *
 * Chaque appelant DOIT garder un repli : si l'appel échoue, expire (15 s) ou renvoie une réponse
 * inexploitable, on retombe sur le moteur actuel — la démonstration ne casse jamais.
 *
 * Mapping défensif de la sortie Whisp vers les trois verdicts de la charte (mots figés) :
 *   risque faible → « Conforme » · risque élevé → « Anomalie détectée » ·
 *   « plus d'informations nécessaires » ou réponse ambiguë → « Données insuffisantes ».
 */
import type { Statut } from "@/data/mock-parcelles";

const WHISP_API_BASE = process.env.WHISP_API_URL || "https://whisp.openforis.org/api";

export function whispLiveEnabled(): boolean {
  return Boolean(process.env.WHISP_API_KEY);
}

/** GeoJSON minimal accepté par /api/submit/geojson (FeatureCollection d'un polygone). */
export function featureCollectionPour(ring: number[][]): unknown {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [ring] },
      },
    ],
  };
}

/**
 * Cherche récursivement, dans la réponse Whisp, la première valeur textuelle d'une clé contenant
 * « risk » (ex. EUDR_risk, whisp_risk, risk_pcrop). Défensif : le schéma exact peut évoluer.
 */
export function extraireRisque(data: unknown, profondeur = 0): string | null {
  if (data == null || profondeur > 6) return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const r = extraireRisque(item, profondeur + 1);
      if (r) return r;
    }
    return null;
  }
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const [cle, valeur] of Object.entries(obj)) {
      if (/risk/i.test(cle) && typeof valeur === "string" && valeur.trim()) return valeur;
    }
    for (const valeur of Object.values(obj)) {
      const r = extraireRisque(valeur, profondeur + 1);
      if (r) return r;
    }
  }
  return null;
}

/** Mappe la catégorie de risque Whisp vers un verdict de la charte. Toute ambiguïté → insuffisant. */
export function risqueVersVerdict(risque: string | null): Statut {
  if (!risque) return "insuffisant";
  // Accents retirés AVANT l'appariement : \b ne fonctionne qu'avec les mots ASCII (« élevé » → « eleve »).
  const r = risque.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/\b(low|faible|no[_\s-]?risk)\b/.test(r)) return "conforme";
  if (/\b(high|eleve)\b/.test(r)) return "anomalie";
  // « more info needed », « unknown », valeurs inattendues : prudence de la charte.
  return "insuffisant";
}

export interface WhispLiveVerdict {
  statut: Statut;
  /** Catégorie brute renvoyée par l'API (tracée dans la convergence de preuves). */
  risqueBrut: string | null;
}

/**
 * Appelle l'API Whisp en direct sur un anneau de polygone (lon/lat, RFC 7946).
 * Lève une erreur en cas d'échec — l'appelant replie sur le moteur déterministe.
 */
export async function whispLiveVerify(ring: number[][]): Promise<WhispLiveVerdict> {
  const key = process.env.WHISP_API_KEY;
  if (!key) throw new Error("WHISP_API_KEY absent");

  const res = await fetch(`${WHISP_API_BASE}/submit/geojson`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": key,
    },
    body: JSON.stringify(featureCollectionPour(ring)),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Whisp HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as unknown;
  const risqueBrut = extraireRisque(data);
  return { statut: risqueVersVerdict(risqueBrut), risqueBrut };
}

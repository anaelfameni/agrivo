/**
 * Cache CLIENT des dernières réponses IA générées EN DIRECT par Gemini (localStorage).
 * Filet anti-quota pour la démonstration : en free tier, Google plafonne par adresse IP et les
 * IP de sortie Vercel sont partagées → un appel live peut répondre 429 par intermittence. Si un
 * nouvel appel échoue, on ré-affiche la DERNIÈRE rédaction produite par Gemini pour la MÊME
 * demande (même payload), étiquetée avec son heure de génération — jamais un contenu inventé,
 * jamais un autre payload. Ne stocke que des réponses `live: true`.
 */

const PREFIX = "agrivo:ia-live:";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // le cache ne sert que le jour même (démo, répétition)

export interface ReponseLiveCachee<T> {
  data: T;
  at: number; // Date.now() de la génération live
}

/** Clé de cache déterministe : même route + même payload → même entrée. */
export function cleLive(route: string, payload: unknown): string {
  return PREFIX + route + ":" + JSON.stringify(payload);
}

/** Mémorise une réponse générée live (appelée UNIQUEMENT quand `live === true`). */
export function sauverLive<T>(route: string, payload: unknown, data: T): void {
  try {
    localStorage.setItem(cleLive(route, payload), JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* localStorage indisponible (SSR, quota) : le cache est un bonus, jamais bloquant */
  }
}

/** Relit la dernière réponse live pour ce payload exact (null si absente, invalide ou trop vieille). */
export function chargerLive<T>(route: string, payload: unknown): ReponseLiveCachee<T> | null {
  try {
    const raw = localStorage.getItem(cleLive(route, payload));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReponseLiveCachee<T>;
    if (typeof parsed.at !== "number" || parsed.data === undefined) return null;
    if (Date.now() - parsed.at > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Heure locale courte (« 14:32 ») pour l'étiquette honnête « Rédigé par Gemini à … ». */
export function heureCache(at: number, lang: "fr" | "en"): string {
  try {
    return new Date(at).toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

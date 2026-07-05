/**
 * Configuration du mode démonstration IA (module PUR, partagé serveur/route).
 *
 * MOCK_MODE — sécurisation ABSOLUE de la démo devant le jury : aucun appel réseau live ne
 * part de l'application. Les routes API renvoient des résultats pré-enregistrés en simulant
 * une latence réaliste (sensation d'appel réel). Ne JAMAIS dépendre d'un appel non testé en live.
 *
 * ⚠️ Forcé ON. Le toggle visuel de MOCK_MODE est présenté dans le dashboard exportateur (Prompt 5).
 */
export const MOCK_MODE = true;

/** Latence simulée (ms) d'un appel Whisp, pour un ressenti d'appel réseau réel. */
export const SIMULATED_LATENCY_MS: [number, number] = [1200, 1800];

export function simulatedLatency(): number {
  const [a, b] = SIMULATED_LATENCY_MS;
  return Math.round(a + Math.random() * (b - a));
}

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Centre du jeu de démonstration (région de Soubré). Si les coordonnées reçues en tombent
 * proches, la route Whisp court-circuite tout appel réseau et renvoie le résultat pré-enregistré.
 */
export const DEMO_CENTER = { lon: -6.6039, lat: 5.7853 };
export function isDemoCoords(lon: number, lat: number, radiusDeg = 1.5): boolean {
  return Math.abs(lat - DEMO_CENTER.lat) < radiusDeg && Math.abs(lon - DEMO_CENTER.lon) < radiusDeg;
}

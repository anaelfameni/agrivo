/**
 * Client Gemini RÉEL (serveur uniquement — jamais importé côté client).
 *
 * Activé quand `GEMINI_API_KEY` est présent dans l'environnement (.env.local / Vercel).
 * Chaque appelant DOIT prévoir un repli déterministe (mock) : si la clé manque, si l'appel
 * échoue ou si la réponse ne se valide pas, on retombe sur le comportement pré-enregistré.
 * La démo ne dépend JAMAIS d'un appel live non testé.
 *
 * Garde-fous charte : les verdicts et chiffres restent DÉTERMINISTES (calculés sur les données) ;
 * Gemini ne fait que la mise en mots. Statuts figés, « évaluation » jamais « garantie »,
 * aucun pourcentage de précision inventé.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function geminiLiveEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

/** Appel générique generateContent. Lève une erreur en cas d'échec (l'appelant replie sur le mock). */
export async function callGemini(
  parts: GeminiPart[],
  opts?: { system?: string; json?: boolean; maxOutputTokens?: number },
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY absent");

  const res = await fetch(`${API_BASE}/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      ...(opts?.system
        ? { systemInstruction: { parts: [{ text: opts.system }] } }
        : {}),
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: opts?.maxOutputTokens ?? 1024,
        ...(opts?.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
    // Un appel live ne doit jamais bloquer la démo : timeout court, repli mock derrière.
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new Error("Réponse Gemini vide");
  return text;
}

/** Extrait le premier objet JSON d'une réponse (tolère les clôtures markdown). */
export function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?/m, "").replace(/```\s*$/m, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Pas de JSON dans la réponse Gemini");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

/** Règles de charte injectées dans chaque prompt de rédaction. */
export const CHARTE_SYSTEM = `Tu es l'assistant de rédaction d'AGRIVO, plateforme ivoirienne d'évaluation de conformité RDUE (Règlement UE 2023/1115).
Règles STRICTES et non négociables :
- Écris en français professionnel, clair, une idée par phrase.
- Les statuts sont FIGÉS, jamais reformulés : « Conforme », « Anomalie détectée », « Données insuffisantes ».
- Dis toujours « évaluation », JAMAIS « garantie » de conformité.
- N'invente AUCUN chiffre, pourcentage ou fait : utilise uniquement les données fournies.
- Le micro-crédit est un prêt remboursable (50 000 à 250 000 FCFA), jamais « gratuit ».
- N'utilise pas le tiret cadratin. Pas de jargon marketing (disruptif, révolutionnaire).`;

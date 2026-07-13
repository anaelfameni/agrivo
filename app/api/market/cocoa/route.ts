import { NextResponse } from "next/server";
import { normaliseCocoa, snapshotFallback, rangeParams, type RangeCode } from "@/lib/market/cocoa";

/**
 * Cours du cacao ICE US (New York), symbole `CC=F`, coté en USD/tonne.
 * Récupère le VRAI cours (différé ~15 min) auprès de Yahoo Finance côté serveur (évite CORS et
 * masque le User-Agent), le normalise, et le met en cache 5 min. En cas d'échec (réseau, format,
 * rate-limit), renvoie le DERNIER COURS CONNU avec `stale:true` — jamais d'écran cassé en démo.
 *
 * Charte : donnée réelle mais DIFFÉRÉE, jamais « temps réel ». `?range=1J|1S|1M|1A`.
 */
export const revalidate = 300;

const HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = (url.searchParams.get("range") ?? "1M").toUpperCase() as RangeCode;
  const { range, interval } = rangeParams(code);

  for (const host of HOSTS) {
    try {
      const res = await fetch(
        `https://${host}/v8/finance/chart/CC=F?range=${range}&interval=${interval}`,
        {
          headers: { "User-Agent": UA, Accept: "application/json" },
          next: { revalidate },
        },
      );
      if (!res.ok) continue;
      const json = await res.json();
      const quote = normaliseCocoa(json, code);
      return NextResponse.json(quote, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
      });
    } catch {
      /* on tente l'hôte suivant, puis le repli */
    }
  }

  // Repli : dernier cours connu (indicatif) — la marketplace ne montre jamais un graphique vide.
  return NextResponse.json(snapshotFallback(code), {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
}

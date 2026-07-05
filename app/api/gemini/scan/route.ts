import { NextResponse } from "next/server";
import { scannerCarteProducteur } from "@/lib/ai/gemini";
import { MOCK_MODE, sleep } from "@/lib/ai/config";

/** OCR de la carte producteur (Gemini Vision, stub). Latence simulée pour un ressenti réel. */
export async function POST(req: Request) {
  await req.json().catch(() => ({}));
  if (MOCK_MODE) await sleep(1300);
  const result = await scannerCarteProducteur();
  return NextResponse.json(result);
}

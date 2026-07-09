"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, Leaf, Info } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/**
 * Diagnostic agronomique VISUEL — au champ, l'agent photographie la plantation ; Gemini Vision
 * décrit ce qu'il OBSERVE (culture, canopée, ombrage, agroforesterie). Additif : n'interfère
 * jamais avec le verdict Whisp. Charte : observation qualitative, jamais un verdict de conformité.
 */
const COPY = {
  fr: {
    cta: "Ajouter une photo terrain",
    analyzing: "Analyse visuelle en cours…",
    title: "Diagnostic visuel (IA)",
    live: "Diagnostic IA · en direct",
    demo: "Mode démonstration",
    disclaimer: "Observation terrain qualitative. N'établit pas le verdict de déforestation, qui reste défini par l'analyse satellite.",
    retake: "Reprendre une photo",
    error: "Analyse indisponible. Réessayez.",
  },
  en: {
    cta: "Add a field photo",
    analyzing: "Visual analysis in progress…",
    title: "Visual diagnostic (AI)",
    live: "AI diagnosis · live",
    demo: "Demo mode",
    disclaimer: "Qualitative field observation. Does not establish the deforestation verdict, which remains defined by the satellite analysis.",
    retake: "Retake a photo",
    error: "Analysis unavailable. Please try again.",
  },
} as const;

function fileToBase64(file: File): Promise<{ data: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result);
      const comma = res.indexOf(",");
      resolve({ data: comma >= 0 ? res.slice(comma + 1) : res, mime: file.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoTerrain() {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [observations, setObservations] = React.useState<string[] | null>(null);
  const [live, setLive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function onFile(file: File) {
    setError(false);
    setObservations(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const { data, mime } = await fileToBase64(file);
      const r = await fetch("/api/gemini/parcelle-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: data, mimeType: mime, lang }),
      });
      const res = (await r.json()) as { observations?: string[]; live?: boolean };
      if (res.observations && res.observations.length > 0) {
        setObservations(res.observations);
        setLive(Boolean(res.live));
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-green-signal/25 bg-green-signal/[0.06] px-3.5 py-2 text-xs font-medium text-green-signal outline-none transition-colors hover:bg-green-signal/[0.12] focus-visible:ring-2 focus-visible:ring-green-signal/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden /> : <Camera size={14} strokeWidth={2} aria-hidden />}
        {loading ? t.analyzing : observations ? t.retake : t.cta}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />

      <AnimatePresence>
        {(observations || error) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 rounded-xl border border-green-signal/20 bg-green-signal/[0.04] p-3.5"
          >
            {error ? (
              <p className="text-xs text-red-block" role="alert">{t.error}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forest-950">
                    <Leaf size={13} strokeWidth={2} aria-hidden className="text-green-signal" />
                    {t.title}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-stone-500 ring-1 ring-black/[0.06]">
                    {live ? t.live : t.demo}
                  </span>
                </div>
                <div className="mt-2.5 flex gap-3">
                  {preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-black/[0.06]" />
                  )}
                  <ul className="flex flex-col gap-1">
                    {observations!.map((o, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed text-stone-600">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-green-signal" aria-hidden />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-2.5 flex items-start gap-1.5 border-t border-green-signal/15 pt-2.5 text-[0.68rem] leading-relaxed text-stone-500">
                  <Info size={12} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0 text-stone-400" />
                  {t.disclaimer}
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

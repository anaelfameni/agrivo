"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Camera, RotateCcw, ScanLine } from "lucide-react";
import { PinMark } from "@/components/ui/pin-mark";
import { FILIERE_LABEL, type Filiere } from "@/data/mock-parcelles";
import type { ScanResult } from "@/lib/ai/gemini";

const EASE = [0.16, 1, 0.3, 1] as const;
type Phase = "aim" | "scanning" | "review";

/**
 * Étape 2 — scan de la carte producteur. Cadre de visée animé (caméra du navigateur si autorisée,
 * sinon mock élégant), puis OCR (stub Gemini Vision) → formulaire pré-rempli éditable. Fallback
 * propre si la caméra est inaccessible : le scan fonctionne toujours (démo sûre).
 */
export function StepScan({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: (scan: ScanResult) => void;
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("aim");
  const [cameraOn, setCameraOn] = useState(false);
  const [form, setForm] = useState<ScanResult | null>(null);
  // Le scan caméra + OCR est réservé à l'application mobile. Sur le web (pointeur fin), on bascule
  // en saisie manuelle : pas de caméra, pas de bouton « Scanner ».
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    try {
      const mq = window.matchMedia("(pointer: coarse)");
      setIsMobile(mq.matches);
      const handler = () => setIsMobile(mq.matches);
      mq.addEventListener?.("change", handler);
      return () => mq.removeEventListener?.("change", handler);
    } catch {
      /* matchMedia indisponible */
    }
  }, []);

  function saisirManuellement() {
    setForm({ producteurNom: "", numeroCartePro: "", localite: "", filiere: "cacao" });
    setPhase("review");
  }

  async function activerCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
    } catch {
      // Caméra refusée/indisponible → on garde le mode démonstration (mock).
      setCameraOn(false);
    }
  }
  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  /** Capture l'image du viseur (base64 JPEG, sans préfixe data:) pour l'OCR Gemini Vision live. */
  function captureFrame(): string | undefined {
    const v = videoRef.current;
    if (!cameraOn || !v || !v.videoWidth) return undefined;
    try {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1280 / v.videoWidth);
      canvas.width = Math.round(v.videoWidth * scale);
      canvas.height = Math.round(v.videoHeight * scale);
      canvas.getContext("2d")?.drawImage(v, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
    } catch {
      return undefined;
    }
  }

  async function scanner() {
    setPhase("scanning");
    const imageBase64 = captureFrame();
    try {
      const r = await fetch("/api/gemini/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageBase64 ? { imageBase64, mimeType: "image/jpeg" } : {}),
      });
      const data: ScanResult = await r.json();
      setForm(data);
    } catch {
      setForm({ producteurNom: "", numeroCartePro: "", localite: "", filiere: "cacao" });
    }
    stopCamera();
    setCameraOn(false);
    setPhase("review");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Viseur */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/[0.08] bg-forest-950">
        {cameraOn ? (
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        ) : (
          <>
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(to right,#eafff2 1px,transparent 1px),linear-gradient(to bottom,#eafff2 1px,transparent 1px)",
                backgroundSize: "28px 28px",
              }}
              aria-hidden
            />
            {/* Carte producteur mock */}
            <div className="absolute inset-0 grid place-items-center p-8">
              <div className="w-full max-w-[240px] rounded-lg bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <PinMark size={20} color="#eafff2" leafColor="rgba(224,166,75,0.9)" />
                  <span className="text-[0.6rem] uppercase tracking-widest text-white/60">Carte producteur</span>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="h-2 w-3/4 rounded bg-white/15" />
                  <div className="h-2 w-1/2 rounded bg-white/10" />
                  <div className="h-2 w-2/3 rounded bg-white/10" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Cadre de visée (coins) */}
        <div className="pointer-events-none absolute inset-5" aria-hidden>
          {(["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "left-0 bottom-0 border-l-2 border-b-2", "right-0 bottom-0 border-r-2 border-b-2"] as const).map((c) => (
            <span key={c} className={`absolute h-7 w-7 rounded-[3px] border-green-signal ${c}`} />
          ))}
        </div>

        {/* Ligne de balayage pendant le scan */}
        {phase === "scanning" && !reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-5"
            initial={{ top: "8%" }}
            animate={{ top: "92%" }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="h-0.5 w-full bg-green-signal shadow-[0_0_14px_2px_rgba(22,163,74,0.7)]" />
          </motion.div>
        )}

        {/* Étiquette d'état */}
        <div className="absolute left-3 top-3">
          <span className="eyebrow rounded-full bg-black/35 px-2.5 py-1 text-[0.6rem] text-white/85 backdrop-blur-sm">
            {phase === "scanning"
              ? "Lecture en cours…"
              : cameraOn
                ? "Caméra active"
                : isMobile
                  ? "Mode démonstration"
                  : "Scan sur mobile uniquement"}
          </span>
        </div>
      </div>

      {/* Panneau */}
      <div className="flex flex-col rounded-2xl border border-black/[0.05] bg-white p-5 shadow-[0_1px_2px_rgba(10,31,20,0.04)]">
        <div className="flex items-center gap-2">
          <ScanLine size={16} strokeWidth={2} className="text-green-signal" aria-hidden />
          <p className="eyebrow text-green-signal">Scan · Gemini Vision</p>
        </div>
        <h2 className="mt-2 font-display text-2xl leading-tight text-forest-950">Carte producteur</h2>

        {phase !== "review" ? (
          <div className="mt-4 flex flex-1 flex-col">
            {isMobile ? (
              <>
                <p className="text-sm leading-relaxed text-stone-500">
                  Positionnez la carte du producteur dans le cadre. La lecture extrait le nom, le numéro de
                  carte et la localité, que vous pourrez corriger avant de continuer.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={phase === "scanning"}
                    onClick={scanner}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform,opacity] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ScanLine size={16} strokeWidth={2} aria-hidden />
                    {phase === "scanning" ? "Lecture en cours…" : "Scanner la carte"}
                  </button>
                  {!cameraOn && phase === "aim" && (
                    <button
                      type="button"
                      onClick={activerCamera}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
                    >
                      <Camera size={15} strokeWidth={2} aria-hidden />
                      Activer la caméra
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-stone-500">
                  Le scan de la carte producteur (caméra + OCR Gemini Vision) est réservé à
                  l&apos;application mobile Agrivo, au bord du champ. Sur le web, saisissez les
                  informations de la carte manuellement.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={saisirManuellement}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
                    Saisir manuellement
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          form && (
            <motion.form
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              onSubmit={(e) => {
                e.preventDefault();
                onConfirm(form);
              }}
              className="mt-4 flex flex-1 flex-col gap-3.5"
            >
              <p className="text-sm text-stone-500">Informations extraites · vérifiez et corrigez si besoin.</p>
              <Field label="Nom du producteur" value={form.producteurNom} onChange={(v) => setForm({ ...form, producteurNom: v })} />
              <Field label="N° de carte producteur" value={form.numeroCartePro} mono onChange={(v) => setForm({ ...form, numeroCartePro: v })} />
              <Field label="Localité" value={form.localite} onChange={(v) => setForm({ ...form, localite: v })} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-stone-500" htmlFor="filiere">Filière</label>
                <select
                  id="filiere"
                  value={form.filiere}
                  onChange={(e) => setForm({ ...form, filiere: e.target.value as Filiere })}
                  className="h-11 rounded-xl border border-black/[0.08] bg-white px-3 text-sm text-forest-950 outline-none transition-colors focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15"
                >
                  {(Object.keys(FILIERE_LABEL) as Filiere[]).map((f) => (
                    <option key={f} value={f}>{FILIERE_LABEL[f]}</option>
                  ))}
                </select>
              </div>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Confirmer
                  <ArrowRight size={16} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(null); setPhase("aim"); }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-3.5 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
                >
                  <RotateCcw size={15} strokeWidth={2} aria-hidden />
                  Rescanner
                </button>
              </div>
            </motion.form>
          )
        )}

        <button
          type="button"
          onClick={onBack}
          className="mt-5 border-t border-black/[0.05] pt-4 text-center text-sm text-stone-400 outline-none transition-colors hover:text-forest-950 focus-visible:text-forest-950"
        >
          Retour
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  const id = label.replace(/[^a-z]/gi, "");
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-stone-500" htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 rounded-xl border border-black/[0.08] bg-white px-3 text-sm text-forest-950 outline-none transition-colors focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15 ${mono ? "num" : ""}`}
      />
    </div>
  );
}

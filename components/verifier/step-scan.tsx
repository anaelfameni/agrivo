"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Camera, PenLine, RotateCcw, ScanLine, Wand2 } from "lucide-react";
import { PinMark } from "@/components/ui/pin-mark";
import { useLanguage } from "@/components/language-provider";
import { FILIERE_LABEL, PARCELLES, type Filiere } from "@/data/mock-parcelles";
import type { ScanResult } from "@/lib/ai/gemini";

const EASE = [0.16, 1, 0.3, 1] as const;
type Phase = "aim" | "scanning" | "review";
/** Seuil de netteté (variance du Laplacien sur miniature 160 px) : en dessous, la photo est reprise. */
const SEUIL_NETTETE = 20;

const COPY = {
  fr: {
    cardLabel: "Carte producteur",
    reading: "Lecture en cours…",
    cameraActive: "Caméra active",
    demoMode: "Caméra inactive",
    mobileOnly: "Scan sur mobile uniquement",
    eyebrow: "Scan",
    title: "Carte producteur",
    aimHelp:
      "Activez la caméra, puis positionnez la carte du producteur dans le cadre. La lecture tente d'abord le QR code, puis l'OCR des champs imprimés : toutes les générations de cartes sont couvertes, avec ou sans QR. La photo est conservée comme pièce justificative.",
    scanBtn: "Scanner la carte",
    enableCamera: "Activer la caméra",
    webHelp:
      "Le scan de la carte producteur (caméra + lecture automatique) se fait depuis un téléphone, au bord du champ. Sur cet écran, saisissez les informations de la carte manuellement.",
    manualEntry: "Saisir manuellement",
    manualEntryMobile: "Saisir manuellement la carte producteur",
    cameraError:
      "Impossible d'accéder à la caméra. Autorisez la caméra dans les réglages du navigateur, puis réessayez.",
    blurry: "Image floue : rapprochez-vous de la carte, stabilisez le téléphone et reprenez la photo.",
    unreadable:
      "La lecture n'a pas abouti. Reprenez la photo plus près et bien à plat, ou saisissez la carte manuellement.",
    demoFill: "Remplir un exemple (démo)",
    extracted: "Informations extraites · vérifiez et corrigez si besoin.",
    viaQr: "Lues depuis le QR code de la carte",
    knownProducer: (nom: string) => `Producteur reconnu : dossier de ${nom} rattaché, aucun doublon créé.`,
    newProducer: "Nouveau matricule : unicité vérifiée dans le registre de la coopérative.",
    fieldName: "Nom du producteur",
    fieldCard: "N° de carte producteur",
    fieldLocality: "Localité",
    fieldFiliere: "Filière",
    confirm: "Confirmer",
    rescan: "Rescanner",
    back: "Retour",
  },
  en: {
    cardLabel: "Farmer card",
    reading: "Reading…",
    cameraActive: "Camera active",
    demoMode: "Camera off",
    mobileOnly: "Scanning on mobile only",
    eyebrow: "Scan",
    title: "Farmer card",
    aimHelp:
      "Enable the camera, then position the farmer's card inside the frame. The reading tries the QR code first, then OCR of the printed fields: every card generation is covered, with or without QR. The photo is kept as supporting evidence.",
    scanBtn: "Scan the card",
    enableCamera: "Enable camera",
    webHelp:
      "Scanning the farmer card (camera + automatic reading) happens on a phone, at the edge of the field. On this screen, enter the card details manually.",
    manualEntry: "Enter manually",
    manualEntryMobile: "Enter the farmer card manually",
    cameraError: "Could not access the camera. Allow camera access in your browser settings, then try again.",
    blurry: "Blurry image: move closer to the card, hold the phone steady and take the photo again.",
    unreadable: "The reading failed. Take the photo again, closer and flat, or enter the card manually.",
    demoFill: "Fill a sample (demo)",
    extracted: "Extracted information · review and correct if needed.",
    viaQr: "Read from the card's QR code",
    knownProducer: (nom: string) => `Known farmer: ${nom}'s file attached, no duplicate created.`,
    newProducer: "New card number: uniqueness checked against the cooperative register.",
    fieldName: "Farmer name",
    fieldCard: "Farmer card number",
    fieldLocality: "Locality",
    fieldFiliere: "Commodity",
    confirm: "Confirm",
    rescan: "Rescan",
    back: "Back",
  },
} as const;

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
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [phase, setPhase] = useState<Phase>("aim");
  const [cameraOn, setCameraOn] = useState(false);
  const [hint, setHint] = useState<null | "cameraError" | "blurry" | "unreadable">(null);
  const [form, setForm] = useState<ScanResult | null>(null);
  const [viaQr, setViaQr] = useState(false);
  // Le scan caméra + OCR vit sur téléphone (pointeur grossier), y compris la version mobile du site
  // web. Sur desktop (pointeur fin) : saisie manuelle, pas de caméra ni de bouton « Scanner ».
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

  // La <video> n'est montée qu'une fois cameraOn : attacher le flux APRÈS le montage (sinon écran noir).
  useEffect(() => {
    if (!cameraOn) return;
    const v = videoRef.current;
    const s = streamRef.current;
    if (v && s && v.srcObject !== s) {
      v.srcObject = s;
      v.play().catch(() => {});
    }
  }, [cameraOn]);

  function saisirManuellement() {
    setForm({ producteurNom: "", numeroCartePro: "", localite: "", filiere: "cacao" });
    setPhase("review");
  }

  /** Démo : pré-remplit le formulaire avec un producteur fictif réaliste (zone de Soubré). */
  function remplirDemo() {
    setViaQr(false);
    setForm({ producteurNom: "Tanoh Michel", numeroCartePro: "CI-CCC-024600", localite: "Soubré", filiere: "cacao" });
    setPhase("review");
  }

  async function activerCamera() {
    setHint(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true); // le flux est attaché par l'effet ci-dessus, une fois la <video> montée
    } catch {
      stopCamera();
      setCameraOn(false);
      setHint("cameraError");
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

  /**
   * Netteté du viseur (variance du Laplacien sur une miniature en niveaux de gris) : détecte les
   * photos franchement floues AVANT l'OCR pour demander une reprise. Renvoie null si la mesure
   * échoue — dans ce cas le scan n'est jamais bloqué.
   */
  function mesurerNettete(): number | null {
    const v = videoRef.current;
    if (!cameraOn || !v || !v.videoWidth) return null;
    try {
      const w = 160;
      const h = Math.max(2, Math.round((v.videoHeight / v.videoWidth) * w));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(v, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      const gris = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) gris[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
      let somme = 0;
      let somme2 = 0;
      let n = 0;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          const lap = 4 * gris[i] - gris[i - 1] - gris[i + 1] - gris[i - w] - gris[i + w];
          somme += lap;
          somme2 += lap * lap;
          n++;
        }
      }
      const moyenne = somme / n;
      return somme2 / n - moyenne * moyenne;
    } catch {
      return null;
    }
  }

  /**
   * Tente de décoder le QR code de la carte (BarcodeDetector natif, mobile). Silencieux si l'API
   * est absente ou si la carte n'a pas de QR : le repli OCR couvre toutes les générations de cartes.
   */
  async function lireQr(): Promise<ScanResult | null> {
    const v = videoRef.current;
    if (!cameraOn || !v || !v.videoWidth) return null;
    try {
      const BD = (
        window as unknown as {
          BarcodeDetector?: new (o: { formats: string[] }) => {
            detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]>;
          };
        }
      ).BarcodeDetector;
      if (!BD) return null;
      const codes = await new BD({ formats: ["qr_code"] }).detect(v);
      const raw = codes[0]?.rawValue;
      if (!raw) return null;
      const j = JSON.parse(raw) as Partial<ScanResult>;
      if (!j.producteurNom && !j.numeroCartePro) return null;
      return {
        producteurNom: j.producteurNom ?? "",
        numeroCartePro: j.numeroCartePro ?? "",
        localite: j.localite ?? "",
        filiere: (j.filiere as Filiere) ?? "cacao",
      };
    } catch {
      return null;
    }
  }

  async function scanner() {
    setHint(null);
    setPhase("scanning");
    // QR d'abord (instantané, zéro coût) : un QR décodé prouve que l'image est lisible.
    const qr = await lireQr();
    if (qr) {
      setViaQr(true);
      setForm(qr);
      stopCamera();
      setCameraOn(false);
      setPhase("review");
      return;
    }
    // Pas de QR → contrôle de netteté avant l'OCR : une photo floue est reprise, pas envoyée.
    const nettete = mesurerNettete();
    if (nettete !== null && nettete < SEUIL_NETTETE) {
      setHint("blurry");
      setPhase("aim"); // caméra laissée active pour reprendre immédiatement
      return;
    }
    const imageBase64 = captureFrame();
    setViaQr(false);
    try {
      const r = await fetch("/api/gemini/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageBase64 ? { imageBase64, mimeType: "image/jpeg" } : {}),
      });
      const data: ScanResult = await r.json();
      if (!data.producteurNom && !data.numeroCartePro) {
        setHint("unreadable");
        setPhase("aim");
        return;
      }
      setForm(data);
    } catch {
      setHint("unreadable");
      setPhase("aim");
      return;
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
          <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
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
                  <span className="text-[0.6rem] uppercase tracking-widest text-white/60">{t.cardLabel}</span>
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
              ? t.reading
              : cameraOn
                ? t.cameraActive
                : isMobile
                  ? t.demoMode
                  : t.mobileOnly}
          </span>
        </div>
      </div>

      {/* Panneau */}
      <div className="flex flex-col rounded-2xl border border-black/[0.05] bg-white p-5 shadow-[0_1px_2px_rgba(10,31,20,0.04)]">
        <div className="flex items-center gap-2">
          <ScanLine size={16} strokeWidth={2} className="text-green-signal" aria-hidden />
          <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        </div>
        <h2 className="mt-2 font-display text-2xl leading-tight text-forest-950">{t.title}</h2>

        {phase !== "review" ? (
          <div className="mt-4 flex flex-1 flex-col">
            {isMobile ? (
              <>
                <p className="text-sm leading-relaxed text-stone-500">{t.aimHelp}</p>
                {hint && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg border border-amber-soft/50 bg-amber-soft/10 px-3 py-2 text-xs leading-relaxed text-stone-700"
                  >
                    {t[hint]}
                  </p>
                )}
                <div className="mt-6 flex flex-col gap-3">
                  {cameraOn ? (
                    <button
                      type="button"
                      disabled={phase === "scanning"}
                      onClick={scanner}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform,opacity] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ScanLine size={16} strokeWidth={2} aria-hidden />
                      {phase === "scanning" ? t.reading : t.scanBtn}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={activerCamera}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform,opacity] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      <Camera size={16} strokeWidth={2} aria-hidden />
                      {t.enableCamera}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={phase === "scanning"}
                    onClick={saisirManuellement}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PenLine size={15} strokeWidth={2} aria-hidden />
                    {t.manualEntryMobile}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-stone-500">{t.webHelp}</p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={saisirManuellement}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
                    {t.manualEntry}
                  </button>
                  <button
                    type="button"
                    onClick={remplirDemo}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
                  >
                    <Wand2 size={15} strokeWidth={2} aria-hidden />
                    {t.demoFill}
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
              <p className="text-sm text-stone-500">{t.extracted}</p>
              {viaQr && (
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-green-signal">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-signal" aria-hidden />
                  {t.viaQr}
                </p>
              )}
              {form.numeroCartePro && (
                <p className="flex items-start gap-1.5 rounded-lg bg-ivory-deep/60 px-3 py-2 text-xs leading-relaxed text-stone-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-signal" aria-hidden />
                  {(() => {
                    const connu = PARCELLES.find((p) => p.numeroCartePro === form.numeroCartePro);
                    return connu ? t.knownProducer(connu.producteurNom) : t.newProducer;
                  })()}
                </p>
              )}
              <Field label={t.fieldName} value={form.producteurNom} onChange={(v) => setForm({ ...form, producteurNom: v })} />
              <Field label={t.fieldCard} value={form.numeroCartePro} mono onChange={(v) => setForm({ ...form, numeroCartePro: v })} />
              <Field label={t.fieldLocality} value={form.localite} onChange={(v) => setForm({ ...form, localite: v })} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-stone-500" htmlFor="filiere">{t.fieldFiliere}</label>
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
                  {t.confirm}
                  <ArrowRight size={16} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(null); setPhase("aim"); }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-3.5 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
                >
                  <RotateCcw size={15} strokeWidth={2} aria-hidden />
                  {t.rescan}
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
          {t.back}
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

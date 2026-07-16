"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ScanLine, Loader2, Check, AlertTriangle, Plus, X } from "lucide-react";
import {
  TYPES_DOCUMENT,
  TYPE_DOCUMENT_LABEL,
  type ExtractionDocument,
  type TypeDocument,
} from "@/lib/ai/scan-document";
import type { JalonPossession, PossessionCode } from "@/data/mock-expeditions";

/**
 * « Scanner un document » — le geste qui remplit le registre de possession en une photo :
 * bordereau d'achat → jalon « Achat bord champ », connaissement → « Transport · connaissement »,
 * ticket de pesée → « Pesée ». Photo/upload → lecture IA (route scan-document, anti-invention)
 * → formulaire PRÉ-REMPLI ÉDITABLE (l'humain valide toujours) → jalon ajouté au journal de
 * session (les constantes ne sont jamais mutées). Repli honnête : « Mode démonstration » sans
 * clé, « illisible » = on redemande une photo, jamais un champ inventé.
 */

const TYPE_VERS_JALON: Record<TypeDocument, PossessionCode> = {
  "bordereau-achat": "achat-bord-champ",
  "connaissement": "transport-connaissement",
  "ticket-pesee": "pesee",
};

const TR = {
  fr: {
    open: "Scanner un document",
    intro: "Une photo du document suffit : l'IA lit le numéro, la date, l'acteur et le tonnage. Vous validez avant l'ajout.",
    type: "Type de document",
    photo: "Prendre / choisir la photo",
    lecture: "Lecture du document…",
    live: "Lu par Gemini · IA en direct",
    demo: "Mode démonstration",
    unreadable: "Document illisible : reprenez la photo (nette, à plat, bien éclairée).",
    error: "La lecture n'a pas abouti. Réessayez dans un instant.",
    numero: "Numéro du document",
    date: "Date",
    acteur: "Acteur (transporteur, pisteur, magasinier)",
    tonnes: "Tonnage (t)",
    ajouter: "Ajouter au journal",
    ajoute: "Jalon ajouté au journal de ce lot (session de démonstration).",
    fermer: "Fermer",
  },
  en: {
    open: "Scan a document",
    intro: "One photo is enough: the AI reads the number, date, actor and tonnage. You validate before adding.",
    type: "Document type",
    photo: "Take / choose the photo",
    lecture: "Reading the document…",
    live: "Read by Gemini · live AI",
    demo: "Demo mode",
    unreadable: "Unreadable document: retake the photo (sharp, flat, well lit).",
    error: "The reading failed. Try again in a moment.",
    numero: "Document number",
    date: "Date",
    acteur: "Actor (carrier, field buyer, warehouse keeper)",
    tonnes: "Tonnage (t)",
    ajouter: "Add to journal",
    ajoute: "Milestone added to this lot's journal (demo session).",
    fermer: "Close",
  },
} as const;

type Phase = "ferme" | "choix" | "lecture" | "formulaire" | "ajoute";

export function ScanDocument({
  lang = "fr",
  onAjout,
}: {
  lang?: "fr" | "en";
  onAjout: (jalon: JalonPossession) => void;
}) {
  const t = TR[lang];
  const reduce = useReducedMotion() ?? false;
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("ferme");
  const [type, setType] = useState<TypeDocument>("bordereau-achat");
  const [message, setMessage] = useState<"" | "unreadable" | "error">("");
  const [badge, setBadge] = useState<"live" | "demo" | "">("");
  const [form, setForm] = useState({ numero: "", date: "", acteur: "", tonnes: "" });

  const lirePhoto = (file: File) => {
    setPhase("lecture");
    setMessage("");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = String(reader.result ?? "");
        const base64 = dataUrl.split(",")[1] ?? "";
        const res = await fetch("/api/gemini/scan-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ typeDocument: type, imageBase64: base64, mimeType: file.type || "image/jpeg" }),
        });
        const data = (await res.json()) as ExtractionDocument & { live?: boolean; demo?: boolean; unreadable?: boolean; error?: boolean };
        if (data.error) {
          setMessage("error");
          setPhase("choix");
          return;
        }
        if (data.unreadable) {
          setMessage("unreadable");
          setPhase("choix");
          return;
        }
        setBadge(data.demo ? "demo" : "live");
        setForm({
          numero: data.numero ?? "",
          date: data.date ?? "",
          acteur: data.acteur ?? "",
          tonnes: data.tonnes != null ? String(data.tonnes) : "",
        });
        setPhase("formulaire");
      } catch {
        setMessage("error");
        setPhase("choix");
      }
    };
    reader.readAsDataURL(file);
  };

  const ajouter = () => {
    const tonnes = Number(form.tonnes.replace(",", "."));
    onAjout({
      code: TYPE_VERS_JALON[type],
      date: form.date || new Date().toISOString().slice(0, 10),
      acteur: form.acteur.trim() || undefined,
      connaissement: type === "connaissement" ? form.numero.trim() || undefined : undefined,
      tonnes: Number.isFinite(tonnes) && tonnes > 0 ? Math.round(tonnes * 100) / 100 : undefined,
    });
    setPhase("ajoute");
  };

  const inputCls =
    "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-forest-950 outline-none transition focus:border-green-signal/60 focus:ring-2 focus:ring-green-signal/20";

  if (phase === "ferme") {
    return (
      <button
        onClick={() => setPhase("choix")}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-signal/35 bg-green-signal/[0.07] px-3.5 py-1.5 text-xs font-semibold text-green-signal transition hover:bg-green-signal/15"
      >
        <ScanLine size={13} /> {t.open}
      </button>
    );
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="mt-3 rounded-xl border border-black/[0.07] bg-white p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-forest-950">
          <ScanLine size={13} className="text-green-signal" /> {t.open}
        </p>
        <button onClick={() => setPhase("ferme")} aria-label={t.fermer} className="text-forest-950/40 transition hover:text-forest-950">
          <X size={14} />
        </button>
      </div>

      {phase === "ajoute" ? (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-green-signal/30 bg-green-signal/10 px-3 py-2 text-xs font-medium text-green-signal">
          <Check size={13} /> {t.ajoute}
        </p>
      ) : (
        <>
          <p className="mt-1.5 text-xs leading-relaxed text-forest-950/55">{t.intro}</p>

          {/* Type de document */}
          <p className="mt-3 text-[0.66rem] font-semibold uppercase tracking-wide text-forest-950/45">{t.type}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {TYPES_DOCUMENT.map((d) => (
              <button
                key={d}
                onClick={() => setType(d)}
                aria-pressed={type === d}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  type === d
                    ? "border-forest-950 bg-forest-950 text-white"
                    : "border-black/10 bg-white text-forest-950/65 hover:border-black/25"
                }`}
              >
                {TYPE_DOCUMENT_LABEL[d][lang]}
              </button>
            ))}
          </div>

          {phase === "lecture" ? (
            <p className="mt-4 flex items-center gap-2 text-xs font-medium text-forest-950/60">
              <Loader2 size={14} className="animate-spin text-green-signal" /> {t.lecture}
            </p>
          ) : phase === "formulaire" ? (
            <div className="mt-4 space-y-2.5">
              {badge && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide ${
                    badge === "live"
                      ? "border-green-signal/40 bg-green-signal/10 text-green-signal"
                      : "border-amber-cacao/40 bg-amber-cacao/10 text-amber-cacao"
                  }`}
                >
                  {badge === "live" ? t.live : t.demo}
                </span>
              )}
              <label className="block text-xs text-forest-950/60">
                {t.numero}
                <input value={form.numero} onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))} className={`${inputCls} num mt-1`} />
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <label className="block text-xs text-forest-950/60">
                  {t.date}
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={`${inputCls} num mt-1`} />
                </label>
                <label className="block text-xs text-forest-950/60">
                  {t.tonnes}
                  <input inputMode="decimal" value={form.tonnes} onChange={(e) => setForm((f) => ({ ...f, tonnes: e.target.value }))} className={`${inputCls} num mt-1`} />
                </label>
              </div>
              <label className="block text-xs text-forest-950/60">
                {t.acteur}
                <input value={form.acteur} onChange={(e) => setForm((f) => ({ ...f, acteur: e.target.value }))} className={`${inputCls} mt-1`} />
              </label>
              <button onClick={ajouter} className="btn-green mt-1 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold">
                <Plus size={13} /> {t.ajouter}
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <AnimatePresence>
                {message && (
                  <motion.p
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-2 flex items-start gap-1.5 text-xs leading-relaxed text-amber-cacao"
                  >
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    {message === "unreadable" ? t.unreadable : t.error}
                  </motion.p>
                )}
              </AnimatePresence>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) lirePhoto(file);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="btn-green inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
              >
                <ScanLine size={13} /> {t.photo}
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

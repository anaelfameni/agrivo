"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, KeyRound, Lock, Server, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { MOCK_MODE } from "@/lib/ai/config";
import { useLanguage } from "@/components/language-provider";

const EASE = [0.16, 1, 0.3, 1] as const;

const SERVICES = [
  { name: "Whisp API (FAO)", desc: { fr: "Détection satellite de déforestation", en: "Satellite deforestation detection" }, status: "ok" as const },
  { name: "Gemini API (Google)", desc: { fr: "Vision, langage, copilote", en: "Vision, language, copilot" }, status: "ok" as const },
  { name: "Copernicus / Sentinel-2", desc: { fr: "Imagerie satellite", en: "Satellite imagery" }, status: "ok" as const },
  { name: "TRACES NT", desc: { fr: "Dépôt des déclarations (DDS)", en: "Declaration filing (DDS)" }, status: "ok" as const },
];

const API_KEYS = ["WHISP_API_KEY", "GEMINI_API_KEY", "GOOGLE_EARTH_ENGINE_KEY"];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { lang } = useLanguage();
  const en = lang === "en";
  const router = useRouter();
  const reduce = useReducedMotion();

  // Réservé au rôle admin : un gérant connecté est renvoyé vers son tableau de bord.
  useEffect(() => {
    if (!loading && user && user.role !== "admin") router.replace("/app/dashboard");
  }, [loading, user, router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-block/10">
            <ShieldAlert size={24} className="text-red-block" aria-hidden />
          </span>
          <p className="text-sm text-stone-500">
            {en ? "Restricted to administrators. Redirecting…" : "Espace réservé aux administrateurs. Redirection…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête admin (panneau sombre, distinct de l'espace coopérative) */}
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="panel-forest relative overflow-hidden rounded-3xl border border-white/10 p-6 shadow-[0_30px_70px_-40px_rgba(10,31,20,0.8)] sm:p-8"
      >
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-green-signal/25 blur-3xl" />
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.05]" />
        <div className="relative">
          <p className="eyebrow flex items-center gap-2 text-green-signal">
            <ShieldCheck size={14} strokeWidth={2.5} aria-hidden />
            {en ? "Administration" : "Administration"}
          </p>
          <h1 className="mt-2.5 font-display text-3xl leading-tight text-white sm:text-[2.4rem]">
            {en ? "Admin console" : "Console admin"}
          </h1>
          <p className="mt-1.5 text-sm text-white/55">
            {en
              ? "API keys, demo mode and external service status. Restricted access."
              : "Clés d'API, mode de démonstration et état des services externes. Accès restreint."}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Clés d'API (masquées, injectées côté serveur) */}
        <section className="card-premium p-5">
          <div className="flex items-center gap-2">
            <span className="chip-green grid h-9 w-9 place-items-center rounded-xl" aria-hidden>
              <KeyRound size={17} strokeWidth={2} className="text-green-signal" />
            </span>
            <h2 className="text-sm font-semibold text-forest-950">{en ? "API keys" : "Clés d'API"}</h2>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            {en
              ? "Injected server-side, never exposed to the client. The flow always goes through an API route."
              : "Injectées côté serveur, jamais exposées au client. Le parcours passe toujours par une route API."}
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            {API_KEYS.map((k) => (
              <div key={k} className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-ivory/50 px-3 py-2.5">
                <Lock size={14} strokeWidth={2} className="shrink-0 text-stone-400" aria-hidden />
                <span className="num flex-1 text-xs text-stone-600">{k}</span>
                <span className="num tracking-widest text-stone-400" aria-label={en ? "Hidden value" : "Valeur masquée"}>••••••••••</span>
              </div>
            ))}
          </div>
        </section>

        {/* MOCK_MODE */}
        <section className="card-premium p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
                <span className="chip-green grid h-9 w-9 place-items-center rounded-xl" aria-hidden>
                  <ShieldCheck size={17} strokeWidth={2} className="text-green-signal" />
                </span>
                {en ? "Demo mode" : "Mode démonstration"}
              </h2>
              <p className="mt-2 max-w-sm text-xs text-stone-500">
                {MOCK_MODE
                  ? en
                    ? "Active (no API key): no live network call leaves the application. Results are pre-recorded with simulated latency. The demo depends on no external service."
                    : "Actif (aucune clé posée) : aucun appel réseau live ne part de l'application. Les résultats sont pré-enregistrés avec une latence simulée. La démo ne dépend d'aucun service externe."
                  : en
                    ? "Off: the Gemini key is set. Card OCR, the audit action plan, the DDS memo, the premium brief and the copilot call Gemini live, with an automatic demo fallback if a call fails. Whisp detection remains pre-recorded (FAO API on registration)."
                    : "Désactivé : la clé Gemini est posée. L'OCR de carte, le plan d'action d'audit, le mémo DDS, l'argumentaire de prime et le copilote appellent réellement Gemini, avec repli démonstration automatique si un appel échoue. La détection Whisp reste pré-enregistrée (API FAO sur inscription)."}
              </p>
              <p className="num mt-2 text-[0.7rem] text-stone-400">MOCK_MODE = {String(MOCK_MODE)}</p>
            </div>
            <div
              role="switch"
              aria-checked={MOCK_MODE}
              aria-disabled="true"
              aria-label={
                MOCK_MODE
                  ? en ? "MOCK_MODE on (no API key)" : "MOCK_MODE actif (aucune clé)"
                  : en ? "MOCK_MODE off (live AI, demo fallback)" : "MOCK_MODE désactivé (IA live, repli démonstration)"
              }
              className={`relative mt-0.5 h-6 w-11 shrink-0 cursor-not-allowed rounded-full ${MOCK_MODE ? "bg-green-signal" : "bg-stone-300"}`}
              title={en ? "Driven by the server environment (GEMINI_API_KEY)" : "Piloté par l'environnement serveur (GEMINI_API_KEY)"}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ${MOCK_MODE ? "right-0.5" : "left-0.5"}`} />
            </div>
          </div>
        </section>

        {/* État des services */}
        <section className="card-premium p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
              <span className="chip-green grid h-9 w-9 place-items-center rounded-xl" aria-hidden>
                <Server size={17} strokeWidth={2} className="text-green-signal" />
              </span>
              {en ? "Service status" : "État des services"}
            </h2>
            <span className="flex items-center gap-1.5 text-[0.7rem] text-stone-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-signal/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-signal" />
              </span>
              {en ? "operational" : "opérationnel"}
            </span>
          </div>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <li key={s.name} className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-3.5 py-3">
                <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-green-signal/10">
                  <Activity size={15} strokeWidth={2} className="text-green-signal" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-forest-950">{s.name}</p>
                  <p className="truncate text-xs text-stone-500">{en ? s.desc.en : s.desc.fr}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-signal/12 px-2.5 py-1 text-[0.7rem] font-semibold text-green-signal">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-signal" /> OK
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

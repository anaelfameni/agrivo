"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, KeyRound, Loader2, Lock, Server, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";
import { auditerRegistre, parserRegistre } from "@/lib/registre/audit";
import { resumerAudit } from "@/lib/registre/plan";
import { sauverLive } from "@/lib/ai/live-cache";

const EASE = [0.16, 1, 0.3, 1] as const;

const SERVICES = [
  { name: "Whisp API (FAO)", desc: { fr: "Détection satellite de déforestation", en: "Satellite deforestation detection" }, status: "ok" as const },
  { name: "Gemini API (Google)", desc: { fr: "Vision, langage, copilote", en: "Vision, language, copilot" }, status: "ok" as const },
  { name: "Copernicus / Sentinel-2", desc: { fr: "Imagerie satellite", en: "Satellite imagery" }, status: "ok" as const },
  { name: "TRACES NT", desc: { fr: "Dépôt des déclarations (DDS)", en: "Declaration filing (DDS)" }, status: "ok" as const },
];

const API_KEYS = ["WHISP_API_KEY", "GEMINI_API_KEY", "GOOGLE_EARTH_ENGINE_KEY"];

type EtatChauffe = "live" | "repli" | "erreur";
interface ResultatChauffe {
  plan: EtatChauffe;
  memo: EtatChauffe;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { lang } = useLanguage();
  const en = lang === "en";
  const router = useRouter();
  const reduce = useReducedMotion();
  // État système RÉEL, servi par l'API (l'env n'existe pas côté client : importer MOCK_MODE
  // ici afficherait toujours « true », même quand l'IA est live — bug corrigé en v1.2.1).
  const [mock, setMock] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/etat")
      .then((r) => r.json())
      .then((j: { mock?: boolean }) => {
        if (alive) setMock(typeof j.mock === "boolean" ? j.mock : null);
      })
      .catch(() => {
        if (alive) setMock(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Réservé au rôle admin : un gérant connecté est renvoyé vers son tableau de bord.
  useEffect(() => {
    if (!loading && user && user.role !== "admin") router.replace("/app/dashboard");
  }, [loading, user, router]);

  // Préchauffage démo : appelle les 2 features IA signatures avec les payloads EXACTS du déroulé
  // (registre de démonstration → plan ; parcelle fil rouge p01 → argumentaire). Une réponse live
  // est mémorisée dans CE navigateur (cache client) : si Gemini plafonne (429 free tier sur IP
  // partagées) pendant la démo, la dernière rédaction live se ré-affiche, étiquetée de son heure.
  const [chauffe, setChauffe] = useState<"idle" | "running" | ResultatChauffe>("idle");

  async function prechauffer() {
    setChauffe("running");
    const res: ResultatChauffe = { plan: "erreur", memo: "erreur" };
    try {
      const texte = await (await fetch("/registre-demo.geojson")).text();
      const payload = {
        resume: resumerAudit(auditerRegistre(parserRegistre("registre-demo.geojson", texte))),
        lang: "fr" as const,
      };
      const r = await fetch("/api/gemini/audit-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = (await r.json()) as { live?: boolean };
      if (r.ok && d.live) {
        sauverLive("audit-plan", payload, d);
        res.plan = "live";
      } else if (r.ok) res.plan = "repli";
    } catch {
      /* res.plan reste « erreur » */
    }
    try {
      const payload = { parcelleId: "p01", lang: "fr" as const };
      const r = await fetch("/api/gemini/valorisation-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = (await r.json()) as { live?: boolean };
      if (r.ok && d.live) {
        sauverLive("valorisation-memo", payload, d);
        res.memo = "live";
      } else if (r.ok) res.memo = "repli";
    } catch {
      /* res.memo reste « erreur » */
    }
    setChauffe(res);
  }

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
                {mock === null
                  ? en
                    ? "Checking the live system state…"
                    : "Vérification de l'état réel du système…"
                  : mock
                    ? en
                      ? "Active (no API key): no live network call leaves the application. Results are pre-recorded with simulated latency. The demo depends on no external service."
                      : "Actif (aucune clé posée) : aucun appel réseau live ne part de l'application. Les résultats sont pré-enregistrés avec une latence simulée. La démo ne dépend d'aucun service externe."
                    : en
                      ? "Off: the Gemini key is set. Card OCR, the audit action plan, the DDS memo, the premium brief and the copilot call Gemini live, with an automatic demo fallback if a call fails. Whisp detection remains pre-recorded (FAO API on registration)."
                      : "Désactivé : la clé Gemini est posée. L'OCR de carte, le plan d'action d'audit, le mémo DDS, l'argumentaire de prime et le copilote appellent réellement Gemini, avec repli démonstration automatique si un appel échoue. La détection Whisp reste pré-enregistrée (API FAO sur inscription)."}
              </p>
              <p className="num mt-2 text-[0.7rem] text-stone-400">
                MOCK_MODE = {mock === null ? "…" : String(mock)}
              </p>
            </div>
            <div
              role="switch"
              aria-checked={mock === true}
              aria-disabled="true"
              aria-label={
                mock === null
                  ? en ? "Checking system state" : "Vérification de l'état"
                  : mock
                    ? en ? "MOCK_MODE on (no API key)" : "MOCK_MODE actif (aucune clé)"
                    : en ? "MOCK_MODE off (live AI, demo fallback)" : "MOCK_MODE désactivé (IA live, repli démonstration)"
              }
              className={`relative mt-0.5 h-6 w-11 shrink-0 cursor-not-allowed rounded-full transition-colors ${mock === true ? "bg-green-signal" : "bg-stone-300"}`}
              title={en ? "Driven by the server environment (GEMINI_API_KEY)" : "Piloté par l'environnement serveur (GEMINI_API_KEY)"}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[left,right] ${mock === true ? "right-0.5" : "left-0.5"}`} />
            </div>
          </div>
        </section>

        {/* Préparation démo : préchauffe les 2 features IA signatures (cache client anti-quota) */}
        <section className="card-premium p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="chip-green grid h-9 w-9 place-items-center rounded-xl" aria-hidden>
              <Sparkles size={17} strokeWidth={2} className="text-green-signal" />
            </span>
            <h2 className="text-sm font-semibold text-forest-950">
              {en ? "Demo warm-up (AI)" : "Préparation démo (IA)"}
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-stone-500">
            {en
              ? "Calls the two signature AI features with the exact payloads of the demo run-through. A response generated live is kept in THIS browser: if Gemini hits its free-tier cap during the demo, the latest live wording is shown again, labelled with its generation time. Click backstage before going on stage."
              : "Appelle les deux features IA signatures avec les payloads exacts du déroulé de démonstration. Une réponse générée en direct est mémorisée dans CE navigateur : si Gemini plafonne (free tier) pendant la démo, la dernière rédaction live se ré-affiche, étiquetée de son heure. À cliquer en coulisses, avant de monter sur scène."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={chauffe === "running"}
              onClick={prechauffer}
              className="inline-flex items-center gap-2 rounded-full border border-green-signal/30 bg-green-signal/[0.06] px-4 py-2 text-xs font-semibold text-green-signal outline-none transition-colors hover:bg-green-signal/[0.12] focus-visible:ring-2 focus-visible:ring-green-signal disabled:cursor-not-allowed disabled:opacity-60"
            >
              {chauffe === "running" ? (
                <Loader2 size={13} strokeWidth={2} className="animate-spin" aria-hidden />
              ) : (
                <Sparkles size={13} strokeWidth={2} aria-hidden />
              )}
              {chauffe === "running"
                ? en
                  ? "Warming up…"
                  : "Préchauffage…"
                : en
                  ? "Warm up the AI (demo)"
                  : "Préchauffer l'IA (démo)"}
            </button>
            {typeof chauffe === "object" && (
              <div className="flex flex-wrap gap-2" aria-live="polite">
                <ChipChauffe label={en ? "Action plan" : "Plan d'action"} etat={chauffe.plan} en={en} />
                <ChipChauffe label={en ? "Premium brief" : "Argumentaire de prime"} etat={chauffe.memo} en={en} />
              </div>
            )}
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

/** Pastille d'état du préchauffage : live (vert) · repli démonstration (ambre) · erreur (rouge). */
function ChipChauffe({ label, etat, en }: { label: string; etat: EtatChauffe; en: boolean }) {
  const style =
    etat === "live"
      ? "bg-green-signal/12 text-green-signal"
      : etat === "repli"
        ? "bg-amber-cacao/15 text-amber-cacao"
        : "bg-red-block/10 text-red-block";
  const txt =
    etat === "live"
      ? en
        ? "live AI"
        : "IA en direct"
      : etat === "repli"
        ? en
          ? "demo fallback"
          : "repli démonstration"
        : en
          ? "network error"
          : "erreur réseau";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label} · {txt}
    </span>
  );
}

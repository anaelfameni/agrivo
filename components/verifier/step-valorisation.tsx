"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Award, BadgeCheck, Check, ClipboardCopy, FileCheck2, Loader2, Send, Sparkles } from "lucide-react";
import type { ArgumentairePrime } from "@/lib/ai/argumentaire";
import { chargerLive, heureCache, sauverLive } from "@/lib/ai/live-cache";

/** Argumentaire affiché : celui de l'API, ou la dernière rédaction live re-servie (cachedAt). */
type ArgumentaireAffiche = ArgumentairePrime & { cachedAt?: number };
import { PinMark } from "@/components/ui/pin-mark";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLanguage } from "@/components/language-provider";
import { fmtHa, parcellesForCoop, type Parcelle } from "@/data/mock-parcelles";

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  fr: {
    eyebrow: "Valorisation",
    title: (nom: string) => `La parcelle de ${nom} rejoint le dossier de valorisation`,
    desc: "Sa conformité est prouvée. Elle renforce le dossier que la coopérative présente à son exportateur et à ses acheteurs : c'est la base de négociation des primes de durabilité et de l'accès aux marchés exigeants.",
    portfolioLabel: "Portefeuille de la coopérative",
    portfolioValue: (c: number, t: number) => `${c} parcelles conformes sur ${t} vérifiées`,
    arguments: [
      { t: "Prime de durabilité négociable", d: "Une conformité prouvée parcelle par parcelle est l'argument des primes, hors marge plafonnée." },
      { t: "Accès aux acheteurs premium", d: "Les acheteurs européens exigeants demandent exactement ces preuves : certificat vérifiable par QR." },
      { t: "Dossier prêt pour TRACES NT", d: "Géolocalisation, sources satellite et diligence : l'exportateur reçoit un dossier exploitable." },
    ],
    back: "Retour",
    sharing: "Partage du dossier…",
    share: "Partager le dossier avec l'exportateur",
    shared: "Dossier partagé",
    sharedDesc: (nom: string, ha: string) =>
      `La parcelle vérifiée de ${nom} (${ha}) a été ajoutée au dossier de conformité transmis à l'exportateur.`,
    motto: "Le vert prouve, la preuve se négocie.",
    backToDashboard: "Retour au tableau de bord",
    memoCta: "Générer l'argumentaire de prime (IA)",
    memoLoading: "Rédaction de l'argumentaire…",
    memoLive: "Rédigé par Gemini · IA en direct",
    memoCache: (h: string) => `Rédigé par Gemini à ${h}`,
    memoDemo: "Mode démonstration",
    memoError: "L'argumentaire n'a pas pu être généré. Réessayez.",
    memoCopy: "Copier",
    memoCopied: "Copié",
  },
  en: {
    eyebrow: "Valorisation",
    title: (nom: string) => `${nom}'s plot joins the valorisation file`,
    desc: "Its compliance is proven. It strengthens the file the cooperative presents to its exporter and buyers: the basis for negotiating sustainability premiums and accessing demanding markets.",
    portfolioLabel: "Cooperative portfolio",
    portfolioValue: (c: number, t: number) => `${c} compliant plots out of ${t} verified`,
    arguments: [
      { t: "Negotiable sustainability premium", d: "Plot-by-plot proven compliance is the argument for premiums, outside the capped margin." },
      { t: "Access to premium buyers", d: "Demanding European buyers ask for exactly this proof: a QR-verifiable certificate." },
      { t: "File ready for TRACES NT", d: "Geolocation, satellite sources and due diligence: the exporter receives a usable file." },
    ],
    back: "Back",
    sharing: "Sharing the file…",
    share: "Share the file with the exporter",
    shared: "File shared",
    sharedDesc: (nom: string, ha: string) =>
      `${nom}'s verified plot (${ha}) has been added to the compliance file sent to the exporter.`,
    motto: "Green proves, and proof negotiates.",
    backToDashboard: "Back to the dashboard",
    memoCta: "Generate the premium brief (AI)",
    memoLoading: "Writing the brief…",
    memoLive: "Written by Gemini · live AI",
    memoCache: (h: string) => `Written by Gemini at ${h}`,
    memoDemo: "Demo mode",
    memoError: "The brief could not be generated. Try again.",
    memoCopy: "Copy",
    memoCopied: "Copied",
  },
} as const;

const ARG_ICONS = [Award, BadgeCheck, FileCheck2] as const;

/**
 * Étape 6 — Valorisation (uniquement si conforme). La parcelle vérifiée alimente le dossier de
 * conformité du portefeuille de la coopérative : primes de durabilité négociables, accès aux
 * acheteurs premium, partage du dossier avec l'exportateur (simulation). AUCUN crédit, score
 * financier ni montant : la valorisation passe par la preuve, la négociation reste humaine.
 */
export function StepValorisation({
  parcelle,
  onFinish,
  onBack,
}: {
  parcelle: Parcelle;
  onFinish: () => void;
  onBack: () => void;
}) {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [status, setStatus] = useState<"idle" | "sharing" | "done">("idle");
  const [memo, setMemo] = useState<ArgumentaireAffiche | null>(null);
  const [memoStatus, setMemoStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [copied, setCopied] = useState(false);

  const coop = parcellesForCoop(parcelle.cooperative);
  const total = coop.length;
  const conformes = coop.filter((p) => p.statut === "conforme").length;

  async function partager() {
    setStatus("sharing");
    await new Promise((r) => setTimeout(r, reduce ? 300 : 1400));
    setStatus("done");
  }

  async function genererMemo() {
    setMemoStatus("loading");
    const payload = { parcelleId: parcelle.id, lang };
    // Filet anti-quota (429 free tier sur IP partagées) : si le live échoue, on re-sert la
    // DERNIÈRE rédaction produite par Gemini pour cette même parcelle, étiquetée avec son heure.
    const repli = () => {
      const cache = chargerLive<ArgumentairePrime>("valorisation-memo", payload);
      if (cache) {
        setMemo({ ...cache.data, cachedAt: cache.at });
        setMemoStatus("done");
        return true;
      }
      return false;
    };
    try {
      const r = await fetch("/api/gemini/valorisation-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as ArgumentairePrime;
      if (data.live) sauverLive("valorisation-memo", payload, data);
      else if (repli()) return;
      setMemo(data);
      setMemoStatus("done");
    } catch {
      if (!repli()) setMemoStatus("error");
    }
  }

  async function copierMemo() {
    if (!memo) return;
    try {
      await navigator.clipboard.writeText(`${memo.titre}\n\n${memo.paragraphes.join("\n\n")}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible : on n'affiche simplement pas la confirmation */
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center gap-2">
        <Award size={16} strokeWidth={2} className="text-amber-cacao" aria-hidden />
        <p className="eyebrow text-amber-cacao">{t.eyebrow}</p>
      </div>

      <AnimatePresence mode="wait">
        {status !== "done" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(10,31,20,0.04)]"
          >
            <h2 className="font-display text-2xl leading-tight text-forest-950">
              {t.title(parcelle.producteurNom)}
            </h2>
            {/* Rappel de la parcelle en cours : ancre visuelle du moment final de la démo. */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge statut={parcelle.statut} size="sm" lang={lang} />
              <span className="num rounded-full border border-black/[0.06] bg-ivory-deep/50 px-2.5 py-1 text-[0.72rem] text-stone-600">
                {parcelle.numeroCertificat}
              </span>
              <span className="num rounded-full border border-black/[0.06] bg-ivory-deep/50 px-2.5 py-1 text-[0.72rem] text-stone-600">
                {fmtHa(parcelle.superficieHa)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-500">{t.desc}</p>

            <div className="mt-5 flex items-baseline justify-between rounded-xl bg-ivory-deep/40 px-4 py-3">
              <span className="eyebrow text-stone-400">{t.portfolioLabel}</span>
              <span className="num text-sm font-semibold text-forest-950">
                {t.portfolioValue(conformes, total)}
              </span>
            </div>

            <ul className="mt-5 flex flex-col gap-3">
              {t.arguments.map((a, i) => {
                const Icon = ARG_ICONS[i];
                return (
                  <li key={a.t} className="flex items-start gap-3">
                    <span className="chip-green mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl" aria-hidden>
                      <Icon size={15} strokeWidth={2} className="text-green-signal" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-forest-950">{a.t}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{a.d}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onBack}
                className="rounded-full px-3 py-1 text-sm text-stone-400 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {t.back}
              </button>
              <button
                type="button"
                onClick={partager}
                disabled={status === "sharing"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-12px_rgba(22,163,74,0.75)] outline-none transition-[filter,transform,opacity] hover:brightness-105 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sharing" ? (
                  <>
                    <Loader2 size={16} strokeWidth={2} className="animate-spin" />
                    {t.sharing}
                  </>
                ) : (
                  <>
                    <Send size={16} strokeWidth={2} aria-hidden />
                    {t.share}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative overflow-hidden rounded-2xl border border-green-signal/20 bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(10,31,20,0.4)]"
          >
            <div className="glow-radial pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            <motion.div
              initial={reduce ? { scale: 1 } : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: reduce ? 0 : 0.1 }}
              className="relative mx-auto grid h-20 w-20 place-items-center"
            >
              <span className="absolute inset-0 rounded-full bg-green-signal/12" />
              <PinMark size={52} color="var(--color-green-signal)" leafColor="var(--color-amber-soft)" />
              <motion.span
                initial={reduce ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: reduce ? 0 : 0.35, type: "spring", stiffness: 300, damping: 15 }}
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-green-signal text-white ring-4 ring-white"
              >
                <Check size={16} strokeWidth={3} />
              </motion.span>
            </motion.div>

            <h2 className="relative mt-5 font-display text-2xl text-forest-950">{t.shared}</h2>
            <p className="relative mt-1.5 text-sm text-stone-500">
              {t.sharedDesc(parcelle.producteurNom, fmtHa(parcelle.superficieHa))}
            </p>
            <p className="relative mt-3 font-display text-sm text-amber-cacao">{t.motto}</p>

            {/* Argumentaire de prime IA : Gemini rédige le brief que le gérant apporte à la table de négociation. */}
            <div className="relative mt-6 text-left">
              {memoStatus !== "done" && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    disabled={memoStatus === "loading"}
                    onClick={genererMemo}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-cacao/30 bg-amber-cacao/[0.07] px-4 py-2.5 text-xs font-semibold text-amber-cacao outline-none transition-colors hover:bg-amber-cacao/[0.14] focus-visible:ring-2 focus-visible:ring-amber-cacao/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {memoStatus === "loading" ? (
                      <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden />
                    ) : (
                      <Sparkles size={14} strokeWidth={2} aria-hidden />
                    )}
                    {memoStatus === "loading" ? t.memoLoading : t.memoCta}
                  </button>
                  {memoStatus === "error" && (
                    <p className="text-xs text-red-block" role="alert">{t.memoError}</p>
                  )}
                </div>
              )}
              {memoStatus === "done" && memo && (
                <motion.div
                  initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="rounded-2xl border border-black/[0.07] bg-ivory-deep/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold text-forest-950">
                      <Sparkles size={14} strokeWidth={2} aria-hidden className="text-amber-cacao" />
                      {memo.titre}
                    </h3>
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-stone-500 ring-1 ring-black/[0.06]">
                        {memo.live ? t.memoLive : memo.cachedAt ? t.memoCache(heureCache(memo.cachedAt, lang)) : t.memoDemo}
                      </span>
                      <button
                        type="button"
                        onClick={copierMemo}
                        className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2.5 py-1 text-[0.68rem] font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
                      >
                        <ClipboardCopy size={11} strokeWidth={2} aria-hidden />
                        {copied ? t.memoCopied : t.memoCopy}
                      </button>
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2.5">
                    {memo.paragraphes.map((par, i) => (
                      <motion.p
                        key={i}
                        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE, delay: reduce ? 0 : i * 0.09 }}
                        className="text-xs leading-relaxed text-stone-600"
                      >
                        {par}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <button
              type="button"
              onClick={onFinish}
              className="group relative mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-forest-950 px-6 py-3.5 text-sm font-semibold text-white outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              {t.backToDashboard}
              <ArrowRight size={16} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

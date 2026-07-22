"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Mail, Store } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { Reveal } from "@/components/landing/reveal";

/**
 * Capture « membres fondateurs », CTA FINAL SOMBRE (v2.4) : pleine largeur bg-forest-950 avec
 * orbes mesh + grain (écho du héros signature), formulaire en panneau glass. Collecte d'email en
 * état LOCAL (aucun backend sur cette version), animation de succès. Sert la traction
 * investisseur : « qui veut acheter/vendre du conforme ».
 */
const TR = {
  fr: {
    eyebrow: "Membres fondateurs",
    title: "Rejoignez les premiers acheteurs et vendeurs de conforme.",
    sub: "Recevez les nouveaux lots scellés en avant-première et participez à façonner la marketplace. Sans engagement.",
    ph: "Votre adresse e-mail professionnelle",
    cta: "Rejoindre",
    ok: "Merci ! Vous faites partie des membres fondateurs. Nous revenons vers vous très vite.",
    sell: "Je veux vendre mes lots",
    invalid: "Veuillez saisir une adresse e-mail valide.",
  },
  en: {
    eyebrow: "Founding members",
    title: "Join the first buyers and sellers of compliant lots.",
    sub: "Get new sealed lots in preview and help shape the marketplace. No commitment.",
    ph: "Your business email address",
    cta: "Join",
    ok: "Thank you! You're a founding member. We'll be in touch very soon.",
    sell: "I want to sell my lots",
    invalid: "Please enter a valid email address.",
  },
} as const;

export function FoundingSignup({ wrap = "mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12" }: { wrap?: string }) {
  const { lang } = useLanguage();
  const t = TR[lang === "en" ? "en" : "fr"];
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr(true); return; }
    setErr(false);
    setDone(true);
  };

  return (
    <section className="relative isolate overflow-hidden bg-forest-950 text-white">
      {/* Fond signature : orbes mesh + grain (écho du héros) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="mesh-a absolute -left-[10%] top-[-40%] h-[480px] w-[480px] rounded-full bg-green-signal/20 blur-[120px]" />
        <div className="mesh-b absolute bottom-[-45%] right-[-8%] h-[440px] w-[440px] rounded-full bg-amber-cacao/15 blur-[120px]" />
        <div className="grain absolute inset-0 opacity-[0.05]" />
      </div>

      <div className={`${wrap} py-20 md:py-24`}>
        <Reveal>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <span className="eyebrow text-green-signal">{t.eyebrow}</span>
              <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">{t.title}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">{t.sub}</p>
              <Link href="/marketplace/vendre" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 transition hover:text-green-signal">
                <Store size={15} /> {t.sell} <ArrowRight size={14} />
              </Link>
            </div>

            <div>
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="liquid-glass-strong flex items-start gap-3 rounded-2xl p-5"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-signal text-white">
                      <Check size={18} />
                    </span>
                    <p className="text-sm leading-relaxed text-white/85">{t.ok}</p>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="liquid-glass-strong rounded-2xl p-2">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="flex flex-1 items-center gap-2 rounded-xl px-3">
                        <Mail size={16} className="shrink-0 text-white/45" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setErr(false); }}
                          placeholder={t.ph}
                          aria-label={t.ph}
                          aria-invalid={err}
                          className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-white/45 outline-none"
                        />
                      </div>
                      <button type="submit" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-signal px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(22,163,74,0.8)] transition hover:brightness-110">
                        {t.cta} <ArrowRight size={15} />
                      </button>
                    </div>
                    {err && <p className="px-3 pb-1 pt-2 text-xs font-medium text-red-300" role="alert">{t.invalid}</p>}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

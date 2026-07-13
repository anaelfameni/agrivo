"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Mail, Store } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { Reveal } from "@/components/landing/reveal";

/**
 * Capture « membres fondateurs » — collecte d'email en état LOCAL (aucun backend sur cette version).
 * Animation de succès. Sert la traction investisseur : « qui veut acheter/vendre du conforme ».
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
    <section className={`${wrap} pb-24 pt-4`}>
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-green-signal/20 bg-gradient-to-br from-green-signal/[0.10] via-white to-white p-8 md:p-12">
          <div aria-hidden className="glow-radial absolute -right-16 top-0 h-56 w-96 opacity-60" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="eyebrow text-green-signal">{t.eyebrow}</span>
              <h2 className="mt-3 font-display text-2xl font-semibold text-forest-950 md:text-3xl">{t.title}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-forest-950/65">{t.sub}</p>
              <Link href="/marketplace/vendre" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-950/70 transition hover:text-green-signal">
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
                    className="flex items-start gap-3 rounded-2xl border border-green-signal/30 bg-white p-5 shadow-sm"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-signal text-white">
                      <Check size={18} />
                    </span>
                    <p className="text-sm leading-relaxed text-forest-950/80">{t.ok}</p>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-black/[0.07] bg-white p-2 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="flex flex-1 items-center gap-2 rounded-xl px-3">
                        <Mail size={16} className="shrink-0 text-forest-950/40" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setErr(false); }}
                          placeholder={t.ph}
                          aria-label={t.ph}
                          aria-invalid={err}
                          className="w-full bg-transparent py-2.5 text-sm text-forest-950 placeholder:text-forest-950/40 outline-none"
                        />
                      </div>
                      <button type="submit" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-signal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-signal/90">
                        {t.cta} <ArrowRight size={15} />
                      </button>
                    </div>
                    {err && <p className="px-3 pb-1 pt-2 text-xs text-red-block" role="alert">{t.invalid}</p>}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

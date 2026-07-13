"use client";

/**
 * Accueil AGRIVO Market — v2.4 « signature hybride ».
 *
 * Héros : EXACTEMENT le fond animé de la page d'accueil du site (HeroBg : orbes mesh +
 * grille masquée + grain) + glow curseur + mot rotatif ; à droite, le terminal glass du
 * cours cacao. Le corps alterne sections claires (stats bento, vedettes, catalogue,
 * confiance, timeline, origines, FAQ) et sombres (« Marché en direct », CTA final).
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { Store, ChevronDown, ScanLine, Landmark, Activity } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { HeroBg } from "@/components/landing/hero-bg";
import { CursorGlow } from "@/components/ui/motion-primitives";
import { MarketSearch } from "@/components/marketplace/market-search";
import { CocoaTerminal } from "@/components/marketplace/cocoa-terminal";
import { MarketStats } from "@/components/marketplace/market-stats";
import { MarketLive } from "@/components/marketplace/market-live";
import { MarketCatalog } from "@/components/marketplace/market-catalog";
import { TrustSection } from "@/components/marketplace/trust-section";
import { JourneyTimeline } from "@/components/marketplace/journey-timeline";
import { OriginsMap } from "@/components/marketplace/origins-map";
import { MarketFaq } from "@/components/marketplace/market-faq";
import { FoundingSignup } from "@/components/marketplace/founding-signup";

const WRAP = "mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12";
const EASE = [0.16, 1, 0.3, 1] as const;

const TR = {
  fr: {
    line1: "Le cacao conforme,",
    words: ["vérifié", "scellé", "tracé", "prouvé"],
    line2: "à la source.",
    sub: "AGRIVO Market est la place de marché où l'exportateur publie ses lots déjà tracés et où l'acheteur premium n'achète que du conforme scellé. La confiance d'abord, le prix ensuite.",
    sell: "Vendre un lot",
    proofs: [
      { Icon: Landmark, t: "RDUE · UE 2023/1115" },
      { Icon: ScanLine, t: "Sceau AGRIVO double verrou" },
      { Icon: Activity, t: "Cours ICE différé, source affichée" },
    ],
  },
  en: {
    line1: "Compliant cocoa,",
    words: ["verified", "sealed", "traced", "proven"],
    line2: "at the source.",
    sub: "AGRIVO Market is the marketplace where exporters list already-traced lots and premium buyers only buy sealed-compliant. Trust first, price second.",
    sell: "Sell a lot",
    proofs: [
      { Icon: Landmark, t: "EUDR · EU 2023/1115" },
      { Icon: ScanLine, t: "AGRIVO double-lock seal" },
      { Icon: Activity, t: "Delayed ICE price, source shown" },
    ],
  },
} as const;

export default function MarketHomePage() {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion();
  const catalogueRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  const goCatalogue = (q: string) => {
    setQuery(q);
    requestAnimationFrame(() => catalogueRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  return (
    <>
      {/* -------------------- HÉROS signature (fond identique à l'accueil du site) -------------------- */}
      <section className="relative isolate overflow-hidden bg-forest-950 text-white">
        <HeroBg />

        <CursorGlow className="relative z-10">
          <div className={`grid items-center gap-12 pb-20 pt-14 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pb-24 ${WRAP}`}>
            {/* Colonne gauche : discours + recherche */}
            <div>
              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: EASE }}
                className="font-brand-serif max-w-2xl text-4xl leading-[1.06] tracking-[-0.03em] md:text-6xl"
                style={{ fontWeight: 700 }}
              >
                <span className="block">{t.line1}</span>
                <span className="block">
                  <RotatingWord reduced={reduce ?? false} words={t.words} /> {t.line2}
                </span>
              </motion.h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
                className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg"
              >
                {t.sub}
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16, ease: EASE }}
                className="mt-8 flex flex-col items-start gap-4"
              >
                <MarketSearch onSubmit={goCatalogue} tone="dark" />
                <Link
                  href="/marketplace/vendre"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  <Store size={15} /> {t.sell}
                </Link>
              </motion.div>

              {/* Micro-preuves */}
              <motion.ul
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24, ease: EASE }}
                className="mt-9 flex flex-wrap items-center gap-2"
              >
                {t.proofs.map((p) => (
                  <li key={p.t} className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[0.7rem] font-medium text-white/70">
                    <p.Icon size={12} className="text-green-signal" /> {p.t}
                  </li>
                ))}
              </motion.ul>
            </div>

            {/* Colonne droite : terminal du cours cacao (flottaison douce) */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 26, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.18, ease: EASE }}
              className="relative w-full"
            >
              <div aria-hidden className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.4rem] bg-green-signal/20 blur-3xl" />
              <motion.div
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <CocoaTerminal />
              </motion.div>
            </motion.div>
          </div>
        </CursorGlow>

        <ScrollHint reduced={reduce ?? false} />
      </section>

      {/* Catalogue complet, vedettes en tête (recherche pilotée par le héros) */}
      <div ref={catalogueRef}>
        <MarketCatalog query={query} onQueryChange={setQuery} wrap={WRAP} />
      </div>

      {/* Bandeau stats bento */}
      <MarketStats wrap={WRAP} />

      {/* Marché en direct (section sombre, grand graphique) */}
      <MarketLive wrap={WRAP} />

      {/* Confiance : double verrou + méthodes (section unifiée) */}
      <TrustSection />

      {/* Le parcours d'un lot (timeline animée) */}
      <JourneyTimeline wrap={WRAP} />

      {/* Carte des origines */}
      <OriginsMap wrap={WRAP} />

      {/* FAQ */}
      <MarketFaq />

      {/* Membres fondateurs (CTA final sombre) */}
      <FoundingSignup wrap={WRAP} />
    </>
  );
}

/* ------------------- Mot rotatif (même effet que l'accueil du site) ------------------- */
function RotatingWord({ reduced, words }: { reduced: boolean; words: readonly string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setI((p) => (p + 1) % words.length), 2200);
    return () => clearInterval(timer);
  }, [reduced, words.length]);

  if (reduced) return <span className="text-green-signal">{words[0]}</span>;

  return (
    <span className="relative inline-flex align-baseline">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -20, opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.42, ease: EASE }}
          className="text-green-signal"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ------------------- Indicateur de scroll (même effet que l'accueil) ------------------- */
function ScrollHint({ reduced }: { reduced: boolean }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setHidden(v > 100));

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2"
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, 6, 0] }}
        transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-white/40"
      >
        <ChevronDown size={22} />
      </motion.div>
    </motion.div>
  );
}

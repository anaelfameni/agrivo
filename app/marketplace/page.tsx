"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Store, ShieldCheck, Handshake } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { StatNumber } from "@/components/ui/stat-number";
import { Reveal } from "@/components/landing/reveal";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche } from "@/data/mock-marketplace";
import { MarketSearch } from "@/components/marketplace/market-search";
import { CocoaChart } from "@/components/marketplace/cocoa-price";
import { FeaturedLots } from "@/components/marketplace/featured-lots";
import { MarketCatalog } from "@/components/marketplace/market-catalog";
import { TrustSection } from "@/components/marketplace/trust-section";
import { OriginsMap } from "@/components/marketplace/origins-map";
import { MarketFaq } from "@/components/marketplace/market-faq";
import { FoundingSignup } from "@/components/marketplace/founding-signup";

const WRAP = "mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12";
const EASE = [0.16, 1, 0.3, 1] as const;

const TR = {
  fr: {
    title: "Le cacao conforme,\nvérifié à la source.",
    sub: "AGRIVO Market est la place de marché où l'exportateur publie ses lots déjà tracés et où l'acheteur premium n'achète que du conforme scellé. La confiance d'abord, le prix ensuite.",
    sell: "Vendre un lot",
    statLots: "lots scellés", statTonnes: "tonnes conformes", statCoops: "coopératives", statRegions: "régions",
    howEyebrow: "Comment ça marche",
    steps: [
      { Icon: Store, t: "L'exportateur publie", b: "Depuis un dossier de traçabilité déjà constitué (parcelle → conteneur), le vendeur met un lot en vente avec son prix indicatif." },
      { Icon: ShieldCheck, t: "AGRIVO scelle", b: "Le lot n'est vendable que s'il porte le sceau : conformité, carte producteur, intégrité, dossier complet." },
      { Icon: Handshake, t: "L'acheteur réserve en direct", b: "L'acheteur premium réserve le lot scellé ; AGRIVO prélève une commission sur la transaction, jamais sur le producteur." },
    ],
  },
  en: {
    title: "Compliant cocoa,\nverified at the source.",
    sub: "AGRIVO Market is the marketplace where exporters list already-traced lots and premium buyers only buy sealed-compliant. Trust first, price second.",
    sell: "Sell a lot",
    statLots: "sealed lots", statTonnes: "compliant tonnes", statCoops: "cooperatives", statRegions: "regions",
    howEyebrow: "How it works",
    steps: [
      { Icon: Store, t: "The exporter lists", b: "From an existing traceability file (plot → container), the seller lists a lot with an indicative price." },
      { Icon: ShieldCheck, t: "AGRIVO seals", b: "A lot can only be sold if it carries the seal: compliance, producer card, integrity, complete file." },
      { Icon: Handshake, t: "The buyer reserves directly", b: "The premium buyer reserves the sealed lot; AGRIVO takes a commission on the transaction, never on the producer." },
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

  const stats = useMemo(() => {
    const lots = lotsMarche(PARCELLES);
    const scelles = lots.filter((x) => x.sceau.statut === "verifie");
    return {
      lots: scelles.length,
      tonnes: Math.round(scelles.reduce((s, x) => s + x.tonnage, 0)),
      coops: new Set(lots.flatMap((x) => x.cooperatives)).size,
      regions: new Set(lots.flatMap((x) => x.regions)).size,
    };
  }, []);

  const goCatalogue = (q: string) => {
    setQuery(q);
    requestAnimationFrame(() => catalogueRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  const stat = [
    { v: stats.lots, k: t.statLots },
    { v: stats.tonnes, k: t.statTonnes },
    { v: stats.coops, k: t.statCoops },
    { v: stats.regions, k: t.statRegions },
  ];

  return (
    <>
      {/* ---------------------------------- HERO (fond vert + cacao) ---------------------------------- */}
      <section className="relative overflow-hidden bg-forest-950 text-white">
        <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-[0.22]" style={{ backgroundImage: "url('/filieres/cacao-v2.webp')" }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-forest-950 via-forest-950/92 to-forest-900/80" />
        <div aria-hidden className="glow-radial absolute -right-24 -top-16 h-[520px] w-[620px]" />
        <div aria-hidden className="grain absolute inset-0 opacity-[0.06]" />

        <div className={`relative grid items-center gap-10 py-16 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 ${WRAP}`}>
          {/* Colonne gauche : titre + recherche + stats */}
          <div>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="max-w-2xl whitespace-pre-line font-display text-4xl font-semibold leading-[1.04] tracking-tight md:text-6xl"
            >
              {t.title}
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg"
            >
              {t.sub}
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
              className="mt-8 flex flex-col items-start gap-4"
            >
              <MarketSearch onSubmit={goCatalogue} />
              <Link href="/marketplace/vendre" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                <Store size={15} /> {t.sell}
              </Link>
            </motion.div>

            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 border-t border-white/12 pt-8 sm:grid-cols-4">
              {stat.map((s) => (
                <div key={s.k}>
                  <StatNumber value={s.v} className="num text-3xl font-bold text-white" />
                  <dd className="mt-1 text-[0.68rem] uppercase tracking-wide text-white/45">{s.k}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Colonne droite : aperçu du cours du cacao */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="w-full"
          >
            <CocoaChart className="shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]" />
          </motion.div>
        </div>
      </section>

      {/* Lots en vedette */}
      <FeaturedLots wrap={WRAP} />

      {/* Catalogue complet (recherche pilotée par le héros) */}
      <div ref={catalogueRef}>
        <MarketCatalog query={query} onQueryChange={setQuery} wrap={WRAP} />
      </div>

      {/* Confiance : double verrou + méthodes (section unifiée) */}
      <TrustSection />

      {/* Comment ça marche */}
      <section className={`${WRAP} py-20`}>
        <Reveal><span className="eyebrow text-forest-950/45">{t.howEyebrow}</span></Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {t.steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <div className="relative h-full overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(10,31,20,0.5)]">
                <span className="num text-sm font-bold text-amber-cacao">0{i + 1}</span>
                <s.Icon size={24} className="mt-3 text-green-signal" />
                <h3 className="mt-3 font-display text-lg font-semibold text-forest-950">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-950/60">{s.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Carte des origines */}
      <OriginsMap wrap={WRAP} />

      {/* FAQ */}
      <MarketFaq />

      {/* Membres fondateurs */}
      <FoundingSignup wrap={WRAP} />
    </>
  );
}

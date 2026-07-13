"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ScanLine, MapPinned, Scale, Store, Handshake, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { StatNumber } from "@/components/ui/stat-number";
import { Reveal } from "@/components/landing/reveal";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche } from "@/data/mock-marketplace";
import { MarketSearch } from "@/components/marketplace/market-search";
import { CocoaTicker, CocoaChart } from "@/components/marketplace/cocoa-price";
import { FiliereBrowser } from "@/components/marketplace/filiere-browser";
import { FeaturedLots } from "@/components/marketplace/featured-lots";
import { MarketCatalog } from "@/components/marketplace/market-catalog";
import { TrustStrip } from "@/components/marketplace/trust-strip";
import { OriginsMap } from "@/components/marketplace/origins-map";
import { ActivityTicker } from "@/components/marketplace/activity-ticker";
import { MarketFaq } from "@/components/marketplace/market-faq";
import { FoundingSignup } from "@/components/marketplace/founding-signup";

const TR = {
  fr: {
    title: "Le cacao conforme,\nvérifié à la source.",
    sub: "AGRIVO Market est la place de marché où l'exportateur publie ses lots déjà tracés et où l'acheteur premium n'achète que du conforme scellé. La confiance d'abord — le prix ensuite.",
    sell: "Vendre un lot",
    statLots: "lots scellés", statTonnes: "tonnes conformes", statCoops: "coopératives", statRegions: "régions",
    trustEyebrow: "Match → Trust → Transact",
    trustTitle: "Un lot ne se vend ici que scellé.",
    trustSub: "Le sceau AGRIVO est un double verrou anti-fraude, calculé depuis les données du lot — jamais affirmé sans preuve.",
    pillars: [
      { Icon: ScanLine, t: "Carte producteur", b: "Identité et parcelle déjà vérifiées par l'État (Conseil Café-Cacao) : l'ancre anti-fraude." },
      { Icon: MapPinned, t: "Polygone hors-déforestation", b: "Chaque parcelle évaluée « Conforme » par l'analyse satellite (méthode Whisp, FAO)." },
      { Icon: Scale, t: "Intégrité de volume", b: "Le tonnage reste sous le plafond superficie × rendement : l'anti-blanchiment de l'origine." },
    ],
    method: "Comprendre le sceau",
    howEyebrow: "Comment ça marche",
    steps: [
      { Icon: Store, t: "L'exportateur publie", b: "Depuis un dossier de traçabilité déjà constitué (parcelle → conteneur), le vendeur met un lot en vente avec son prix indicatif." },
      { Icon: ShieldCheck, t: "AGRIVO scelle", b: "Le lot n'est vendable que s'il porte le sceau : conformité, carte producteur, intégrité, dossier complet." },
      { Icon: Handshake, t: "L'acheteur réserve en direct", b: "L'acheteur premium réserve le lot scellé ; AGRIVO prélève une commission sur la transaction, jamais sur le producteur." },
    ],
    marketTitle: "Le marché en direct",
    marketSub: "Le cours mondial de référence, et son rapport aux prix des lots du catalogue.",
  },
  en: {
    title: "Compliant cocoa,\nverified at the source.",
    sub: "AGRIVO Market is the marketplace where exporters list already-traced lots and premium buyers only buy sealed-compliant. Trust first — price second.",
    sell: "Sell a lot",
    statLots: "sealed lots", statTonnes: "compliant tonnes", statCoops: "cooperatives", statRegions: "regions",
    trustEyebrow: "Match → Trust → Transact",
    trustTitle: "A lot only sells here once it's sealed.",
    trustSub: "The AGRIVO seal is a double anti-fraud lock, computed from the lot's data — never asserted without proof.",
    pillars: [
      { Icon: ScanLine, t: "Producer card", b: "Identity and plot already verified by the State (Coffee-Cocoa Council): the anti-fraud anchor." },
      { Icon: MapPinned, t: "Deforestation-free polygon", b: "Every plot assessed “Compliant” by satellite analysis (Whisp method, FAO)." },
      { Icon: Scale, t: "Volume integrity", b: "Tonnage stays under the area × yield cap: origin anti-laundering." },
    ],
    method: "Understand the seal",
    howEyebrow: "How it works",
    steps: [
      { Icon: Store, t: "The exporter lists", b: "From an existing traceability file (plot → container), the seller lists a lot with an indicative price." },
      { Icon: ShieldCheck, t: "AGRIVO seals", b: "A lot can only be sold if it carries the seal: compliance, producer card, integrity, complete file." },
      { Icon: Handshake, t: "The buyer reserves directly", b: "The premium buyer reserves the sealed lot; AGRIVO takes a commission on the transaction, never on the producer." },
    ],
    marketTitle: "The market, live",
    marketSub: "The global benchmark price, and how it relates to the catalog's lot prices.",
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

  return (
    <>
      {/* ---------------------------------- HERO (recherche) ---------------------------------- */}
      <section className="relative overflow-hidden border-b border-black/[0.06] bg-white">
        <div aria-hidden className="glow-radial absolute inset-x-0 -top-10 h-[440px] opacity-70" />
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-[0.05]"
          style={{ backgroundImage: "url('/textures/sat-soubre-rural.jpg')" }}
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-16 md:px-8 md:pb-16 md:pt-24">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl whitespace-pre-line font-display text-4xl font-semibold leading-[1.05] tracking-tight text-forest-950 md:text-6xl"
          >
            {t.title}
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-forest-950/65 md:text-lg"
          >
            {t.sub}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col items-start gap-4"
          >
            <MarketSearch onSubmit={goCatalogue} />
            <div className="flex flex-wrap items-center gap-3">
              <CocoaTicker />
              <Link href="/marketplace/vendre" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-forest-950 transition hover:bg-black/[0.03]">
                <Store size={15} /> {t.sell}
              </Link>
            </div>
          </motion.div>

          {/* Compteurs animés */}
          <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-black/[0.06] pt-8 sm:grid-cols-4">
            {[
              { v: stats.lots, k: t.statLots },
              { v: stats.tonnes, k: t.statTonnes },
              { v: stats.coops, k: t.statCoops },
              { v: stats.regions, k: t.statRegions },
            ].map((s) => (
              <div key={s.k}>
                <StatNumber value={s.v} className="num text-3xl font-bold text-forest-950" />
                <dd className="mt-1 text-xs uppercase tracking-wide text-forest-950/45">{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Ticker d'activité (illustratif) */}
      <ActivityTicker />

      {/* Navigateur par filière */}
      <FiliereBrowser onPick={goCatalogue} />

      {/* Lots en vedette */}
      <FeaturedLots />

      {/* Marché en direct (graphique ICE) */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <Reveal>
          <div className="mb-6">
            <span className="eyebrow text-green-signal">{t.marketTitle}</span>
            <p className="mt-2 max-w-2xl text-sm text-forest-950/55">{t.marketSub}</p>
          </div>
          <CocoaChart />
        </Reveal>
      </section>

      {/* Catalogue complet (recherche pilotée par le héros) */}
      <div ref={catalogueRef}>
        <MarketCatalog query={query} onQueryChange={setQuery} />
      </div>

      {/* Sceau / double verrou */}
      <section className="border-y border-black/[0.06] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <span className="eyebrow text-green-signal">{t.trustEyebrow}</span>
            <h2 className="mt-3 max-w-2xl font-display text-2xl font-semibold text-forest-950 md:text-4xl">{t.trustTitle}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-forest-950/60 md:text-base">{t.trustSub}</p>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {t.pillars.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-black/[0.06] bg-ivory p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-signal/12 text-green-signal">
                    <p.Icon size={22} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-forest-950">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest-950/60">{p.b}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <Link href="/methodologie" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-green-signal transition hover:gap-2.5">
              {t.method} <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Bandeau de confiance / partenaires */}
      <TrustStrip />

      {/* Comment ça marche */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <Reveal><span className="eyebrow text-forest-950/45">{t.howEyebrow}</span></Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {t.steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <div className="relative h-full rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
                <span className="num text-sm font-bold text-amber-cacao">0{i + 1}</span>
                <s.Icon size={22} className="mt-3 text-green-signal" />
                <h3 className="mt-3 font-display text-lg font-semibold text-forest-950">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-950/60">{s.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Carte des origines */}
      <OriginsMap />

      {/* FAQ */}
      <MarketFaq />

      {/* Membres fondateurs */}
      <FoundingSignup />
    </>
  );
}

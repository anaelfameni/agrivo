"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight, ScanLine, MapPinned, Scale, ShieldCheck, Store, Handshake, ChevronDown, Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche } from "@/data/mock-marketplace";
import { MarketCatalog } from "@/components/marketplace/market-catalog";

const TR = {
  fr: {
    eyebrow: "Place de marché · matières premières conformes RDUE",
    title: "Achetez du cacao conforme,\nà la source.",
    sub: "AGRIVO Market est la place de marché où l'exportateur publie ses lots déjà tracés et où l'acheteur premium n'achète que du conforme scellé. La confiance d'abord — le prix ensuite.",
    browse: "Parcourir les lots",
    sell: "Vendre un lot",
    statLots: "lots scellés",
    statTonnes: "tonnes conformes",
    statCoops: "coopératives",
    statRegions: "régions",
    trustEyebrow: "Match → Trust → Transact",
    trustTitle: "Un lot ne se vend ici que scellé.",
    trustSub: "Le sceau AGRIVO est un double verrou anti-fraude, calculé depuis les données du lot — jamais affirmé sans preuve.",
    pillars: [
      { Icon: ScanLine, t: "Carte producteur", b: "Identité et parcelle déjà vérifiées par l'État (Conseil Café-Cacao) : l'ancre anti-fraude." },
      { Icon: MapPinned, t: "Polygone hors-déforestation", b: "Chaque parcelle évaluée « Conforme » par l'analyse satellite (méthode Whisp, FAO)." },
      { Icon: Scale, t: "Intégrité de volume", b: "Le tonnage reste sous le plafond superficie × rendement : l'anti-blanchiment de l'origine." },
    ],
    howEyebrow: "Comment ça marche",
    steps: [
      { Icon: Store, t: "L'exportateur publie", b: "Depuis un dossier de traçabilité déjà constitué (parcelle → conteneur), le vendeur met un lot en vente avec son prix indicatif." },
      { Icon: ShieldCheck, t: "AGRIVO scelle", b: "Le lot n'est vendable que s'il porte le sceau : conformité, carte producteur, intégrité, dossier complet." },
      { Icon: Handshake, t: "L'acheteur réserve en direct", b: "L'acheteur premium réserve le lot scellé ; AGRIVO prélève une commission sur la transaction, jamais sur le producteur." },
    ],
    sellEyebrow: "Vous êtes exportateur ?",
    sellTitle: "Transformez vos lots conformes en avantage commercial.",
    sellSub: "Publiez vos lots scellés, touchez des acheteurs qui paient la conformité, et gardez la maîtrise de votre donnée.",
    sellCta: "Vendre sur AGRIVO Market",
    method: "Comprendre le sceau",
  },
  en: {
    eyebrow: "Marketplace · EUDR-compliant commodities",
    title: "Buy compliant cocoa,\nat the source.",
    sub: "AGRIVO Market is the marketplace where exporters list already-traced lots and premium buyers only buy sealed-compliant. Trust first — price second.",
    browse: "Browse lots",
    sell: "Sell a lot",
    statLots: "sealed lots",
    statTonnes: "compliant tonnes",
    statCoops: "cooperatives",
    statRegions: "regions",
    trustEyebrow: "Match → Trust → Transact",
    trustTitle: "A lot only sells here once it's sealed.",
    trustSub: "The AGRIVO seal is a double anti-fraud lock, computed from the lot's data — never asserted without proof.",
    pillars: [
      { Icon: ScanLine, t: "Producer card", b: "Identity and plot already verified by the State (Coffee-Cocoa Council): the anti-fraud anchor." },
      { Icon: MapPinned, t: "Deforestation-free polygon", b: "Every plot assessed “Compliant” by satellite analysis (Whisp method, FAO)." },
      { Icon: Scale, t: "Volume integrity", b: "Tonnage stays under the area × yield cap: origin anti-laundering." },
    ],
    howEyebrow: "How it works",
    steps: [
      { Icon: Store, t: "The exporter lists", b: "From an existing traceability file (plot → container), the seller lists a lot with an indicative price." },
      { Icon: ShieldCheck, t: "AGRIVO seals", b: "A lot can only be sold if it carries the seal: compliance, producer card, integrity, complete file." },
      { Icon: Handshake, t: "The buyer reserves directly", b: "The premium buyer reserves the sealed lot; AGRIVO takes a commission on the transaction, never on the producer." },
    ],
    sellEyebrow: "Are you an exporter?",
    sellTitle: "Turn your compliant lots into a commercial edge.",
    sellSub: "List your sealed lots, reach buyers who pay for compliance, and keep control of your data.",
    sellCta: "Sell on AGRIVO Market",
    method: "Understand the seal",
  },
} as const;

const nf = (n: number, lang: "fr" | "en") => n.toLocaleString(lang === "en" ? "en" : "fr-FR");

export default function MarketHomePage() {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];

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

  return (
    <>
      {/* ---------------------------------- HERO ---------------------------------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-[0.14]"
          style={{ backgroundImage: "url('/textures/sat-soubre-rural.jpg')" }}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/90 to-forest-950" />
        <div aria-hidden className="glow-radial absolute inset-x-0 top-0 h-[420px]" />
        <div aria-hidden className="grain absolute inset-0 opacity-[0.05]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-20 md:px-8 md:pb-20 md:pt-28">
          <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/70">
            <Sparkles size={13} className="text-amber-soft" /> {t.eyebrow}
          </span>
          <h1 className="mt-6 max-w-3xl whitespace-pre-line font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
            {t.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">{t.sub}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#catalogue"
              className="inline-flex items-center gap-2 rounded-full bg-green-signal px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-signal/20 transition hover:bg-green-signal/90"
            >
              {t.browse} <ChevronDown size={16} />
            </a>
            <Link
              href="/marketplace/vendre"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Store size={16} /> {t.sell}
            </Link>
          </div>

          {/* Bandeau de crédibilité */}
          <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4">
            {[
              { v: stats.lots, k: t.statLots },
              { v: stats.tonnes, k: t.statTonnes },
              { v: stats.coops, k: t.statCoops },
              { v: stats.regions, k: t.statRegions },
            ].map((s) => (
              <div key={s.k}>
                <dt className="num text-3xl font-bold text-white">{nf(s.v, l)}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-white/45">{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --------------------------------- CATALOGUE --------------------------------- */}
      <MarketCatalog />

      {/* ------------------------------ SCEAU / DOUBLE VERROU ------------------------------ */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
          <span className="eyebrow text-green-signal">{t.trustEyebrow}</span>
          <h2 className="mt-3 max-w-2xl font-display text-2xl font-semibold text-white md:text-4xl">{t.trustTitle}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">{t.trustSub}</p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {t.pillars.map((p) => (
              <div key={p.t} className="rounded-2xl border border-white/10 bg-forest-950 p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-signal/15 text-green-signal">
                  <p.Icon size={22} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{p.b}</p>
              </div>
            ))}
          </div>

          <Link
            href="/methodologie"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-green-signal transition hover:gap-2.5"
          >
            {t.method} <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* -------------------------------- COMMENT ÇA MARCHE -------------------------------- */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <span className="eyebrow text-white/45">{t.howEyebrow}</span>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {t.steps.map((s, i) => (
            <div key={s.t} className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className="num text-sm font-bold text-amber-soft">0{i + 1}</span>
              <s.Icon size={22} className="mt-3 text-green-signal" />
              <h3 className="mt-3 font-display text-lg font-semibold text-white">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------- CTA VENDEUR --------------------------------- */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-green-signal/25 bg-gradient-to-br from-green-signal/[0.12] via-forest-900 to-forest-950 p-8 md:p-12">
          <div aria-hidden className="glow-radial absolute -right-20 top-0 h-64 w-96" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="eyebrow text-amber-soft">{t.sellEyebrow}</span>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white md:text-3xl">{t.sellTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">{t.sellSub}</p>
            </div>
            <Link
              href="/marketplace/vendre"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-forest-950 transition hover:scale-105"
            >
              {t.sellCta} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import Link from "next/link";
import { ShieldCheck, Store, Handshake, ScanLine, MapPinned, Scale, FileCheck2, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/landing/page-hero";
import { Reveal } from "@/components/landing/reveal";
import { useLanguage } from "@/components/language-provider";

const COPY = {
  fr: {
    eyebrow: "Marketplace du cacao conforme",
    title: "Vendez vos fèves conformes, en direct.",
    sub: "La place de marché où l'exportateur publie ses lots déjà tracés et l'acheteur premium n'achète que du conforme vérifié. AGRIVO fait le commerce des fèves, jamais le financement.",
    cta: "Ouvrir la marketplace",
    founding: "Rejoindre les membres fondateurs",
    howTitle: "Comment ça marche",
    steps: [
      { Icon: Store, t: "L'exportateur publie", b: "Depuis un dossier d'expédition déjà tracé (parcelle → conteneur), l'exportateur met un lot en vente avec son prix indicatif." },
      { Icon: ShieldCheck, t: "Le sceau AGRIVO", b: "Le lot n'est vendable que s'il porte le sceau : conformité, carte producteur, intégrité de volume, références complètes." },
      { Icon: Handshake, t: "L'acheteur achète en direct", b: "L'acheteur premium réserve le lot conforme ; AGRIVO prélève une commission sur la transaction, jamais sur le producteur." },
    ],
    sceauTitle: "Le sceau AGRIVO : un double verrou que personne d'autre n'offre",
    sceauLead: "Une transaction n'est possible que si le lot est scellé. Le sceau est calculé depuis les données du lot, jamais affirmé sans preuve.",
    criteres: [
      { Icon: ScanLine, t: "Carte producteur", b: "Chaque producteur est carté : identité et parcelle déjà vérifiées par l'État (Conseil Café-Cacao)." },
      { Icon: MapPinned, t: "Polygone hors-déforestation", b: "Chaque parcelle est évaluée « Conforme » par l'analyse satellite (segregation stricte, pas de bilan de masse)." },
      { Icon: Scale, t: "Intégrité de volume", b: "Le tonnage déclaré reste sous le plafond superficie × rendement : l'anti-blanchiment de l'origine." },
      { Icon: FileCheck2, t: "Dossier complet", b: "Références DDR au dossier et vérifications satellites à jour." },
    ],
    ownTitle: "La coopérative possède sa donnée",
    ownBody: "Au lieu d'être désintermédiée par des traders opaques et récoltée par des data-brokers étrangers, la coopérative garde la propriété de son registre vérifié et capte la valeur de ses fèves conformes.",
    note: "Marketplace en lancement. Lots de démonstration dérivés des expéditions ; aucune transaction réelle.",
  },
  en: {
    eyebrow: "Compliant cocoa marketplace",
    title: "Sell your compliant beans, directly.",
    sub: "The marketplace where exporters list already-traced lots and premium buyers only buy verified-compliant. AGRIVO handles the bean trade, never financing.",
    cta: "Open the marketplace",
    founding: "Join the founding members",
    howTitle: "How it works",
    steps: [
      { Icon: Store, t: "The exporter lists", b: "From an already-traced shipment file (plot → container), the exporter lists a lot with an indicative price." },
      { Icon: ShieldCheck, t: "The AGRIVO seal", b: "A lot can only be sold if it carries the seal: compliance, producer card, volume integrity, complete references." },
      { Icon: Handshake, t: "The buyer buys directly", b: "The premium buyer reserves the compliant lot; AGRIVO takes a commission on the transaction, never on the producer." },
    ],
    sceauTitle: "The AGRIVO seal: a double lock no one else offers",
    sceauLead: "A transaction is only possible if the lot is sealed. The seal is computed from the lot's data, never asserted without proof.",
    criteres: [
      { Icon: ScanLine, t: "Producer card", b: "Every farmer is carded: identity and plot already verified by the State (Coffee-Cocoa Council)." },
      { Icon: MapPinned, t: "Deforestation-free polygon", b: "Every plot is assessed “Compliant” by satellite analysis (strict segregation, no mass balance)." },
      { Icon: Scale, t: "Volume integrity", b: "Declared tonnage stays under the area × yield cap: origin anti-laundering." },
      { Icon: FileCheck2, t: "Complete file", b: "DDR references on file and satellite checks up to date." },
    ],
    ownTitle: "The cooperative owns its data",
    ownBody: "Instead of being disintermediated by opaque traders and harvested by foreign data-brokers, the cooperative keeps ownership of its verified registry and captures the value of its compliant beans.",
    note: "Marketplace launching. Demonstration lots derived from shipments; no real transaction.",
  },
} as const;

export default function MarketplacePublicPage() {
  const { lang } = useLanguage();
  const t = COPY[lang === "en" ? "en" : "fr"];

  return (
    <>
      <SiteHeader variant="overlay" />
      <PageHero eyebrow={t.eyebrow} title={t.title} sub={t.sub}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/app/exportateur/marketplace"
            className="inline-flex items-center gap-2 rounded-full bg-green-signal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-signal/90"
          >
            <Store size={16} /> {t.cta}
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {t.founding} <ArrowRight size={16} />
          </Link>
        </div>
      </PageHero>

      <main className="bg-ivory">
        <section className="mx-auto max-w-5xl px-6 py-16 md:px-8">
          <Reveal>
            <span className="eyebrow text-green-signal">{t.howTitle}</span>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {t.steps.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-green-signal/15 bg-white p-6 shadow-sm">
                  <s.Icon className="text-green-signal" size={24} />
                  <h3 className="mt-3 font-semibold text-forest-950">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest-950/70">{s.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16 md:px-8">
          <Reveal>
            <div className="rounded-3xl border border-green-signal/20 bg-green-signal/5 p-8 md:p-10">
              <ShieldCheck className="text-green-signal" size={28} />
              <h2 className="mt-3 font-display text-2xl text-forest-950 md:text-3xl">{t.sceauTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forest-950/70">{t.sceauLead}</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {t.criteres.map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <c.Icon className="mt-0.5 shrink-0 text-green-signal" size={20} />
                    <div>
                      <h4 className="font-semibold text-forest-950">{c.t}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-forest-950/70">{c.b}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20 md:px-8">
          <Reveal>
            <div className="rounded-2xl border border-amber-cacao/25 bg-amber-cacao/5 p-8">
              <h2 className="font-display text-xl text-forest-950 md:text-2xl">{t.ownTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-forest-950/70">{t.ownBody}</p>
              <p className="mt-4 text-xs text-forest-950/50">{t.note}</p>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

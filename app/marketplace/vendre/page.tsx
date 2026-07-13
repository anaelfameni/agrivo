"use client";

import Link from "next/link";
import {
  ArrowRight, Store, ShieldCheck, Database, TrendingUp, FileStack, ScanLine, Handshake, Percent,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";
import { TAUX_COMMISSION_MIN, TAUX_COMMISSION_MAX } from "@/data/mock-marketplace";

const pct = (t: number) => `${Math.round(t * 100)} %`;

const TR = {
  fr: {
    eyebrow: "Espace vendeur · exportateur",
    title: "Vendez vos lots conformes,\nscellés, en direct.",
    sub: "Publiez sur AGRIVO Market les lots que vous avez déjà tracés. Touchez des acheteurs premium qui paient la conformité — sans intermédiaire opaque, sans céder votre donnée.",
    cockpit: "Ouvrir « Mes lots »", browse: "Voir la marketplace",
    whyTitle: "Pourquoi vendre sur AGRIVO Market",
    why: [
      { Icon: TrendingUp, t: "Valorisez la conformité", b: "Le sceau AGRIVO transforme votre travail de traçabilité en argument commercial : un lot scellé se distingue et se négocie mieux." },
      { Icon: Handshake, t: "Vendez en direct", b: "Mise en relation directe avec l'acheteur premium. AGRIVO fait le commerce des fèves — jamais le financement ni le crédit." },
      { Icon: Database, t: "Gardez votre donnée", b: "Vous restez propriétaire de votre registre vérifié. Pas de désintermédiation par des data-brokers étrangers." },
    ],
    howTitle: "Publier un lot en 3 étapes",
    how: [
      { Icon: FileStack, t: "Constituez le dossier", b: "Depuis votre espace exportateur, composez le lot à partir de parcelles conformes déjà vérifiées (parcelle → conteneur)." },
      { Icon: ScanLine, t: "Le sceau se calcule", b: "AGRIVO évalue le double verrou : carte producteur, polygone hors-déforestation, intégrité de volume, dossier complet." },
      { Icon: Store, t: "Publiez sur le marché", b: "Un lot scellé devient visible des acheteurs. Vous fixez le prix indicatif ; vous retirez le lot quand vous voulez." },
    ],
    feeTitle: "Un modèle simple et aligné",
    feeBody: `AGRIVO prélève une commission de ${pct(TAUX_COMMISSION_MIN)} à ${pct(TAUX_COMMISSION_MAX)} sur la transaction — uniquement quand la vente se conclut. Le producteur ne paie jamais.`,
    ctaTitle: "Prêt à publier votre premier lot ?",
    ctaSub: "L'espace « Mes lots » vit dans votre tableau de bord exportateur.",
    cta: "Accéder à mon espace",
  },
  en: {
    eyebrow: "Seller space · exporter",
    title: "Sell your compliant lots,\nsealed, directly.",
    sub: "List on AGRIVO Market the lots you have already traced. Reach premium buyers who pay for compliance — without opaque middlemen, without giving up your data.",
    cockpit: "Open “My lots”", browse: "See the marketplace",
    whyTitle: "Why sell on AGRIVO Market",
    why: [
      { Icon: TrendingUp, t: "Monetise compliance", b: "The AGRIVO seal turns your traceability work into a selling point: a sealed lot stands out and negotiates better." },
      { Icon: Handshake, t: "Sell directly", b: "Direct connection with the premium buyer. AGRIVO trades beans — never financing or credit." },
      { Icon: Database, t: "Keep your data", b: "You remain the owner of your verified registry. No disintermediation by foreign data-brokers." },
    ],
    howTitle: "List a lot in 3 steps",
    how: [
      { Icon: FileStack, t: "Build the file", b: "From your exporter space, compose the lot from already-verified compliant plots (plot → container)." },
      { Icon: ScanLine, t: "The seal computes", b: "AGRIVO assesses the double lock: producer card, deforestation-free polygon, volume integrity, complete file." },
      { Icon: Store, t: "List on the market", b: "A sealed lot becomes visible to buyers. You set the indicative price; you remove the lot whenever you want." },
    ],
    feeTitle: "A simple, aligned model",
    feeBody: `AGRIVO takes a ${pct(TAUX_COMMISSION_MIN)}–${pct(TAUX_COMMISSION_MAX)} commission on the transaction — only when the sale closes. The producer never pays.`,
    ctaTitle: "Ready to list your first lot?",
    ctaSub: "The “My lots” space lives in your exporter dashboard.",
    cta: "Go to my space",
  },
} as const;

export default function VendrePage() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const cockpitHref = user ? "/app/exportateur/marketplace" : "/connexion?next=/app/exportateur/marketplace";

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="glow-radial absolute inset-x-0 top-0 h-[380px]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-20 md:px-8 md:pb-16 md:pt-28">
          <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/70">
            <Store size={13} className="text-amber-soft" /> {t.eyebrow}
          </span>
          <h1 className="mt-6 max-w-3xl whitespace-pre-line font-display text-4xl font-semibold leading-[1.06] tracking-tight text-white md:text-5xl">{t.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65">{t.sub}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={cockpitHref} className="inline-flex items-center gap-2 rounded-full bg-green-signal px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-signal/20 transition hover:bg-green-signal/90">
              <Store size={16} /> {t.cockpit}
            </Link>
            <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              {t.browse} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">{t.whyTitle}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {t.why.map((w) => (
            <div key={w.t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-signal/15 text-green-signal"><w.Icon size={22} /></span>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">{w.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{w.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment publier */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
          <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">{t.howTitle}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {t.how.map((s, i) => (
              <div key={s.t} className="rounded-2xl border border-white/10 bg-forest-950 p-6">
                <span className="num text-sm font-bold text-amber-soft">0{i + 1}</span>
                <s.Icon size={22} className="mt-3 text-green-signal" />
                <h3 className="mt-3 font-display text-lg font-semibold text-white">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modèle / commission */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="flex flex-col gap-5 rounded-2xl border border-green-signal/25 bg-green-signal/[0.07] p-6 md:flex-row md:items-center md:p-8">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-signal/20 text-green-signal"><Percent size={24} /></span>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">{t.feeTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">{t.feeBody}</p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.06] via-forest-900 to-forest-950 p-8 md:p-12">
          <div aria-hidden className="glow-radial absolute -left-16 bottom-0 h-56 w-96" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-green-signal"><ShieldCheck size={18} /><span className="eyebrow text-green-signal">AGRIVO Market</span></div>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white md:text-3xl">{t.ctaTitle}</h2>
              <p className="mt-2 text-sm text-white/60">{t.ctaSub}</p>
            </div>
            <Link href={cockpitHref} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-forest-950 transition hover:scale-105">
              {t.cta} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

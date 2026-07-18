"use client";
import * as React from "react";
import Link from "next/link";
import { Check, Minus, X, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { PageHero } from "@/components/landing/page-hero";
import { useLanguage } from "@/components/language-provider";

type Billing = "monthly" | "annual";

const PLANS = [
  {
    name: { fr: "Coopérative", en: "Cooperative" },
    monthly: 100_000,
    from: false,
    unit: { fr: "FCFA / mois", en: "FCFA / month" },
    desc: {
      fr: "Pour les gérants de coopérative qui valident les lots au bord du champ. Base ≈ 1 200 FCFA par producteur vérifié et par an (coopérative d'environ 1 000 producteurs).",
      en: "For cooperative managers who validate lots at the edge of the field. Basis ≈ 1,200 FCFA per verified producer per year (cooperative of about 1,000 producers).",
    },
    features: {
      fr: ["Vérifications illimitées · analyse satellite FAO (Whisp) en direct", "Certificats d'évaluation vérifiables par QR (PDF)", "Import & audit RDUE du registre", "Mode hors connexion", "Support"],
      en: ["Unlimited verifications · live FAO (Whisp) satellite analysis", "QR-verifiable assessment certificates (PDF)", "Register import & EUDR audit", "Offline mode", "Support"],
    },
    roi: {
      fr: "Au plus l'équivalent d'un kilo de cacao par producteur et par an.",
      en: "At most the equivalent of one kilo of cocoa per producer per year.",
    },
    note: {
      fr: "Jusqu'à 1 000 producteurs · +50 000 FCFA/mois par tranche de 1 000 supplémentaires.",
      en: "Up to 1,000 producers · +50,000 FCFA/month per additional 1,000.",
    },
    href: "/app/dashboard",
    highlight: false,
    cta: { fr: "Commencer", en: "Get started" },
  },
  {
    name: { fr: "Exportateur Essentiel", en: "Exporter Essential" },
    monthly: 500_000,
    from: false,
    unit: { fr: "FCFA / mois", en: "FCFA / month" },
    desc: {
      fr: "Pour les exportateurs qui pilotent la conformité d'un réseau de coopératives, sans intégration technique.",
      en: "For exporters steering the compliance of a cooperative network, without technical integration.",
    },
    features: {
      fr: ["Portefeuille multi-coopératives", "Coopératives & producteurs consolidés", "Registre satellite (tableau ↔ carte)", "Dossiers acheteurs & alertes", "5 dossiers d'expédition par mois (parcelle → conteneur)", "Support prioritaire"],
      en: ["Multi-cooperative portfolio", "Consolidated cooperatives & farmers", "Satellite register (table ↔ map)", "Buyer files & alerts", "5 shipment files per month (plot → container)", "Priority support"],
    },
    roi: {
      fr: "Moins qu'un poste de chargé de conformité, pour tout votre réseau.",
      en: "Less than one compliance officer, for your entire network.",
    },
    note: {
      fr: "Abonnement d'1 coopérative de votre réseau inclus.",
      en: "Subscription for 1 cooperative in your network included.",
    },
    href: "/contact",
    highlight: false,
    cta: { fr: "Nous contacter", en: "Contact us" },
  },
  {
    name: { fr: "Exportateur Pro", en: "Exporter Pro" },
    monthly: 1_000_000,
    from: false,
    unit: { fr: "FCFA / mois", en: "FCFA / month" },
    desc: {
      fr: "Pour les exportateurs qui alimentent les DDS de leurs opérateurs et intègrent AGRIVO à leur système d'information.",
      en: "For exporters feeding their operators' due diligence statements and integrating AGRIVO into their IT systems.",
    },
    features: {
      fr: ["Tout Essentiel, plus :", "Dossiers d'expédition illimités · GeoJSON TRACES NT par conteneur", "API REST & export en masse", "Déclarations TRACES NT intégrées", "Assistant IA de portefeuille", "Engagement de disponibilité (SLA) · état des services public"],
      en: ["Everything in Essential, plus:", "Unlimited shipment files · TRACES NT GeoJSON per container", "REST API & batch export", "Built-in TRACES NT declarations", "Portfolio AI assistant", "Availability commitment (SLA) · public service status"],
    },
    roi: {
      fr: "Une fraction de la valeur d'un seul conteneur sécurisé.",
      en: "A fraction of the value of a single secured container.",
    },
    note: {
      fr: "Abonnements de 3 coopératives inclus · coopérative supplémentaire : 100 000 FCFA/mois.",
      en: "Subscriptions for 3 cooperatives included · additional cooperative: 100,000 FCFA/month.",
    },
    href: "/contact",
    highlight: true,
    cta: { fr: "Nous contacter", en: "Contact us" },
  },
];

const ROWS = [
  { label: { fr: "Conformité RDUE", en: "EUDR compliance" }, vals: ["x", "check", "check", "check"] },
  { label: { fr: "Score de santé des sols", en: "Soil health score" }, vals: ["x", "partial", "x", "check"] },
  { label: { fr: "Valorisation commerciale (primes)", en: "Commercial valorisation (premiums)" }, vals: ["x", "check", "partial", "check"] },
  { label: { fr: "Les trois combinés", en: "All three combined" }, vals: ["x", "x", "x", "check"] },
  { label: { fr: "Mode hors connexion", en: "Offline mode" }, vals: ["x", "check", "check", "check"] },
  { label: { fr: "Ancrage local ivoirien", en: "Local Ivorian roots" }, vals: ["partial", "partial", "partial", "check"] },
];
const COLS = ["Excel / WhatsApp", "Koltiva", "Farmerline", "AGRIVO"];

function Cell({ v }: { v: string }) {
  if (v === "check") return <Check size={17} className="mx-auto text-green-signal" />;
  if (v === "partial") return <Minus size={17} className="mx-auto text-amber-cacao" />;
  return <X size={17} className="mx-auto text-stone-300" />;
}

export default function Tarifs() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const [billing, setBilling] = React.useState<Billing>("monthly");
  const factor = billing === "annual" ? 0.8 : 1;
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));

  return (
    <div className="min-h-screen bg-ivory text-forest-950">
      <SiteHeader variant="overlay" />
      <main>
        <PageHero
          center
          eyebrow={en ? "Pricing" : "Tarifs"}
          title={en ? "A subscription, not a container stuck at the port." : "Un abonnement, pas un conteneur bloqué au port."}
          sub={
            en
              ? "Manual certification costs 20 to 40 million FCFA per year. AGRIVO replaces that process with a clear subscription."
              : "La certification manuelle coûte 20 à 40 millions FCFA par an. AGRIVO remplace ce processus par un abonnement clair."
          }
        >
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-sm">
            {(["monthly", "annual"] as Billing[]).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${billing === b ? "bg-white text-forest-950" : "text-white/70 hover:text-white"}`}
              >
                {b === "monthly" ? (en ? "Monthly" : "Mensuel") : en ? "Annual" : "Annuel"}
                {b === "annual" && <span className="ml-1.5 text-xs text-green-signal">-20%</span>}
              </button>
            ))}
          </div>
        </PageHero>

        <section className="mx-auto max-w-5xl px-6 py-10 md:px-8">
          <p className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-cacao/25 bg-amber-cacao/[0.07] px-3.5 py-1.5 text-xs font-semibold text-amber-cacao">
              {en ? "Launch pricing · first partner cooperatives and exporters" : "Tarifs de lancement · premières coopératives et premiers exportateurs partenaires"}
            </span>
          </p>

          {/* Étage 1 · Le service par lot (le premier produit commercial, avant l'abonnement) */}
          <Reveal>
            <div className="mb-8 rounded-2xl border border-green-signal/35 bg-forest-950 p-8 text-white shadow-[0_40px_90px_-40px_rgba(22,163,74,0.5)] md:p-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-signal/15 px-3 py-1 text-xs font-semibold text-green-signal">
                    {en ? "Start here · service per lot" : "Commencez ici · service par lot"}
                  </span>
                  <h2 className="mt-4 font-display text-2xl text-white md:text-3xl">
                    {en ? "The Sealed Lot file, prepared for you." : "Le dossier « Lot scellé », préparé pour vous."}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {en
                      ? "Before any subscription: our team prepares, per lot, the complete file your European buyer expects. Producer cards checked, per-plot satellite assessment, chain of custody, reconciled volumes, TRACES NT GeoJSON and the sealed-lot PDF, mapped line by line onto the buyer's due diligence. The deliverable includes the DDS file ready to report in TRACES NT: statement draft plus risk assessment report."
                      : "Avant tout abonnement : notre équipe prépare, lot par lot, le dossier complet que votre acheteur européen attend. Cartes producteur vérifiées, évaluation satellite par parcelle, chaîne de possession, volumes réconciliés, GeoJSON TRACES NT et PDF du lot scellé, mappé ligne à ligne sur la diligence raisonnée de l'acheteur. Le livrable inclut le dossier DDS prêt à reporter dans TRACES NT : brouillon de déclaration plus rapport d'évaluation de risque."}
                  </p>
                  <ul className="mt-4 grid gap-2 text-sm text-white/80 sm:grid-cols-2">
                    {(en
                      ? ["Billed per lot or per season", "No commitment, no subscription required", "Your first sealed lot in days", "The producer never pays"]
                      : ["Facturé par lot ou par campagne", "Sans engagement, sans abonnement requis", "Votre premier lot scellé en quelques jours", "Le producteur ne paie jamais"]
                    ).map((f) => (
                      <li key={f} className="flex items-start gap-2"><Check size={15} className="mt-0.5 shrink-0 text-green-signal" /> {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-start gap-3">
                  <div>
                    <p className="num text-3xl font-semibold text-amber-soft">{en ? "On quote" : "Sur devis"}</p>
                    <p className="mt-1 text-xs text-white/55">{en ? "per lot · price set with the first partners" : "par lot · prix fixé avec les premiers partenaires"}</p>
                  </div>
                  <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-green-signal px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                    {en ? "Request a sealed-lot file" : "Demander un dossier lot scellé"} <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Étage 1 bis · Le diagnostic de registre 30 jours (l'entrée la plus légère) */}
          <Reveal>
            <div className="mb-8 rounded-2xl border border-amber-cacao/30 bg-white p-8 md:p-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-cacao/10 px-3 py-1 text-xs font-semibold text-amber-cacao">
                    {en ? "Or start even lighter · 30-day diagnostic" : "Ou commencez encore plus léger · diagnostic 30 jours"}
                  </span>
                  <h2 className="mt-4 font-display text-2xl text-forest-950">
                    {en ? "The registry diagnostic: know where you stand." : "Le diagnostic de registre : sachez où vous en êtes."}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {en
                      ? "In 30 days, we audit your existing plot registry: usable plots, missing or unreliable data, farmers without cards, volume inconsistencies. Deliverable: a full audit report, a measured baseline (time, errors, share of export-ready plots) and a prioritised action plan. No subscription required; the diagnostic fee is deducted if you continue."
                      : "En 30 jours, nous auditons votre registre de parcelles existant : parcelles exploitables, données manquantes ou peu fiables, producteurs non cartés, incohérences de volumes. Livrable : un rapport d'audit complet, une base de référence mesurée (temps, erreurs, part de parcelles prêtes à l'export) et un plan d'action priorisé. Sans abonnement requis ; le montant du diagnostic est déduit si vous poursuivez."}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3">
                  <div>
                    <p className="num text-3xl font-semibold text-amber-cacao">{en ? "From 750,000 FCFA" : "Dès 750 000 FCFA"}</p>
                    <p className="mt-1 text-xs text-stone-500">{en ? "launch pricing · per registry" : "tarif de lancement · par registre"}</p>
                  </div>
                  <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-amber-cacao/40 px-6 py-3 text-sm font-semibold text-amber-cacao transition hover:bg-amber-cacao/10">
                    {en ? "Request a diagnostic" : "Demander un diagnostic"} <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-wide text-forest-950/45">
            {en ? "Then, by subscription: steer your whole network" : "Ensuite, par abonnement : pilotez tout votre réseau"}
          </p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((p, i) => (
              <Reveal key={p.name.fr} delay={i * 0.1}>
                <div className={`flex h-full flex-col rounded-2xl border p-8 ${p.highlight ? "border-green-signal/40 bg-forest-950 text-white shadow-[0_40px_90px_-40px_rgba(22,163,74,0.5)]" : "border-black/[0.06] bg-white"}`}>
                  {p.highlight && (
                    <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-green-signal/15 px-3 py-1 text-xs font-semibold text-green-signal">
                      {en ? "Most complete" : "Le plus complet"}
                    </span>
                  )}
                  <div className={`font-display text-2xl ${p.highlight ? "text-white" : "text-forest-950"}`}>{en ? p.name.en : p.name.fr}</div>
                  <p className={`mt-2 text-sm ${p.highlight ? "text-white/65" : "text-stone-500"}`}>{en ? p.desc.en : p.desc.fr}</p>
                  <div className="mt-6 flex items-end gap-2">
                    {p.from && (
                      <span className={`mb-1.5 text-xs font-medium ${p.highlight ? "text-white/60" : "text-stone-500"}`}>{en ? "from" : "dès"}</span>
                    )}
                    <span className="num text-4xl font-semibold" style={{ color: p.highlight ? "var(--color-amber-soft)" : "var(--color-forest-950)" }}>
                      {fmt(p.monthly * factor)}
                    </span>
                    <span className={`mb-1.5 text-xs ${p.highlight ? "text-white/60" : "text-stone-500"}`}>{en ? p.unit.en : p.unit.fr}</span>
                  </div>
                  {billing === "annual" && (
                    <span className="num mt-1 text-xs text-green-signal">{en ? "Billed annually" : "Facturé annuellement"}</span>
                  )}
                  <p className={`mt-1.5 text-xs ${p.highlight ? "text-white/60" : "text-stone-500"}`}>
                    {en ? p.note.en : p.note.fr}
                  </p>
                  <p className={`mt-2 text-xs font-medium ${p.highlight ? "text-amber-soft" : "text-amber-cacao"}`}>
                    {en ? p.roi.en : p.roi.fr}
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {(en ? p.features.en : p.features.fr).map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 ${p.highlight ? "text-white/80" : "text-stone-600"}`}>
                        <Check size={16} className="mt-0.5 shrink-0 text-green-signal" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={p.href}
                    className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-95 ${p.highlight ? "bg-green-signal text-white" : "bg-forest-950 text-white"}`}
                  >
                    {en ? p.cta.en : p.cta.fr} <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.12}>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-forest-950 p-6 text-white">
              <div>
                <p className="text-sm font-semibold">Enterprise</p>
                <p className="mt-1 max-w-xl text-sm text-white/65">
                  {en
                    ? "Multi-country, SSO, IT-system integrations, high volumes: a plan sized to your organisation, on request."
                    : "Multi-pays, SSO, intégrations à votre SI, gros volumes : une offre à la taille de votre organisation, sur devis."}
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-green-signal hover:text-green-signal"
              >
                {en ? "Talk to the team" : "Parler à l'équipe"} <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-green-signal/25 bg-green-signal/[0.06] p-6">
              <div>
                <p className="text-sm font-semibold text-forest-950">
                  {en ? "And when you sell: marketplace commission" : "Et quand vous vendez : commission marketplace"}
                </p>
                <p className="mt-1 max-w-xl text-sm text-stone-600">
                  {en
                    ? "When a verified lot is sold on the marketplace, AGRIVO takes a 1 to 3% commission on the transaction, only when the sale closes. Never a fee to the producer, never credit."
                    : "Quand un lot vérifié se vend sur la marketplace, AGRIVO prélève une commission de 1 à 3 % sur la transaction, uniquement quand la vente se conclut. Jamais de frais au producteur, jamais de crédit."}
                </p>
              </div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-full bg-green-signal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-signal/90"
              >
                {en ? "See the marketplace" : "Voir la marketplace"} <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-6 text-center">
              <p className="mx-auto max-w-2xl text-sm text-stone-600">
                <span className="font-semibold text-forest-950">{en ? "Is it free for the farmer?" : "Et pour le producteur ?"}</span>{" "}
                {en
                  ? "AGRIVO charges the farmer nothing: verification is covered by their cooperative's subscription. Our revenue comes from the cooperative subscription and the exporter plans. No lock-in, and your data remains the property of the cooperative (Ivorian law no. 2013-450, ARTCI)."
                  : "AGRIVO ne facture rien au producteur : la vérification est prise en charge par l'abonnement de sa coopérative. Notre revenu vient de l'abonnement coopérative et des offres exportateur. Sans engagement, et vos données restent la propriété de la coopérative (loi ivoirienne n° 2013-450, ARTCI)."}
              </p>
            </div>
          </Reveal>
        </section>

        {/* Comparatif */}
        <section className="bg-ivory-deep/40">
          <div className="mx-auto max-w-5xl px-6 py-20 md:px-8">
            <Reveal>
              <h2 className="font-display text-3xl">{en ? "The real differentiator is not the price." : "Le vrai différenciateur n'est pas le prix."}</h2>
              <p className="mt-3 max-w-2xl text-sm text-stone-500">
                {en
                  ? "Other platforms exist and are serious. AGRIVO is the only one combining compliance, soil health and commercial valorisation, with local roots."
                  : "D'autres plateformes existent et sont sérieuses. AGRIVO est la seule à combiner conformité, santé des sols et valorisation commerciale, avec un ancrage local."}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[560px] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-sm">
                  <thead>
                    <tr>
                      <th className="p-4 text-left font-medium text-stone-500"> </th>
                      {COLS.map((c) => (
                        <th
                          key={c}
                          className={`p-4 text-center font-semibold ${c === "AGRIVO" ? "bg-forest-950 text-white" : "text-stone-600"}`}
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((r, ri) => (
                      <tr key={r.label.fr} className={ri % 2 ? "bg-ivory-deep/30" : ""}>
                        <td className="p-4 text-left font-medium text-forest-950">{en ? r.label.en : r.label.fr}</td>
                        {r.vals.map((v, ci) => (
                          <td key={ci} className={`p-4 ${COLS[ci] === "AGRIVO" ? "bg-green-signal/[0.06]" : ""}`}>
                            <Cell v={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

"use client";
import * as React from "react";
import Link from "next/link";
import { Check, Minus, X, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { useLanguage } from "@/components/language-provider";

type Billing = "monthly" | "annual";

const PLANS = [
  {
    name: { fr: "Coopérative", en: "Cooperative" },
    monthly: 125_000,
    unit: { fr: "FCFA / mois", en: "FCFA / month" },
    desc: {
      fr: "Pour les gérants de coopérative qui valident les lots au bord du champ. Base ≈ 1 500 FCFA par producteur vérifié et par an (coopérative d'environ 1 000 producteurs).",
      en: "For cooperative managers who validate lots at the edge of the field. Basis ≈ 1,500 FCFA per verified producer per year (cooperative of about 1,000 producers).",
    },
    features: {
      fr: ["Vérifications illimitées", "Certificats PDF", "Mode hors connexion", "Sélecteur de langue", "Support"],
      en: ["Unlimited verifications", "PDF certificates", "Offline mode", "Language switcher", "Support"],
    },
    highlight: false,
    cta: { fr: "Commencer", en: "Get started" },
  },
  {
    name: { fr: "API exportateur", en: "Exporter API" },
    monthly: 1_500_000,
    unit: { fr: "FCFA / mois", en: "FCFA / month" },
    desc: {
      fr: "Pour les exportateurs qui gèrent des milliers de parcelles et déposent des DDR.",
      en: "For exporters managing thousands of plots and filing due diligence statements.",
    },
    features: {
      fr: ["Tout Coopérative, plus :", "API REST & export batch", "Déclarations TRACES NT intégrées", "Assistant conversationnel", "SLA garanti"],
      en: ["Everything in Cooperative, plus:", "REST API & batch export", "Built-in TRACES NT declarations", "Conversational assistant", "SLA commitment"],
    },
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
const COLS = ["Excel / WhatsApp", "Koltiva", "Farmerline", "Agrivo"];

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
      <SiteHeader variant="solid" />
      <main>
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-20 text-center md:px-8">
          <Reveal>
            <span className="eyebrow text-amber-cacao">{en ? "Pricing" : "Tarifs"}</span>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              {en ? "A subscription, not a container stuck at the port." : "Un abonnement, pas un conteneur bloqué au port."}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
              {en
                ? "Manual certification costs 20 to 40 million FCFA per year. Agrivo replaces that process with a clear subscription."
                : "La certification manuelle coûte 20 à 40 millions FCFA par an. Agrivo remplace ce processus par un abonnement clair."}
            </p>
            <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-white p-1">
              {(["monthly", "annual"] as Billing[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${billing === b ? "bg-forest-950 text-white" : "text-stone-500 hover:text-forest-950"}`}
                >
                  {b === "monthly" ? (en ? "Monthly" : "Mensuel") : en ? "Annual" : "Annuel"}
                  {b === "annual" && <span className="ml-1.5 text-xs text-green-signal">-20%</span>}
                </button>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-10 md:px-8">
          <div className="grid gap-5 md:grid-cols-2">
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
                    <span className="num text-4xl font-semibold" style={{ color: p.highlight ? "var(--color-amber-soft)" : "var(--color-forest-950)" }}>
                      {fmt(p.monthly * factor)}
                    </span>
                    <span className={`mb-1.5 text-xs ${p.highlight ? "text-white/60" : "text-stone-500"}`}>{en ? p.unit.en : p.unit.fr}</span>
                  </div>
                  {billing === "annual" && (
                    <span className="num mt-1 text-xs text-green-signal">{en ? "Billed annually" : "Facturé annuellement"}</span>
                  )}
                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {(en ? p.features.en : p.features.fr).map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 ${p.highlight ? "text-white/80" : "text-stone-600"}`}>
                        <Check size={16} className="mt-0.5 shrink-0 text-green-signal" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/app/dashboard"
                    className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-95 ${p.highlight ? "bg-green-signal text-white" : "bg-forest-950 text-white"}`}
                  >
                    {en ? p.cta.en : p.cta.fr} <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15}>
            <div className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-6 text-center">
              <p className="mx-auto max-w-2xl text-sm text-stone-600">
                <span className="font-semibold text-forest-950">{en ? "Is it free for the farmer?" : "Et pour le producteur ?"}</span>{" "}
                {en
                  ? "AGRIVO charges the farmer nothing: verification is covered by their cooperative's subscription. Our revenue comes from the cooperative subscription and the exporter API."
                  : "AGRIVO ne facture rien au producteur : la vérification est prise en charge par l'abonnement de sa coopérative. Notre revenu vient de l'abonnement coopérative et de l'API exportateur."}
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
                  ? "Other platforms exist and are serious. Agrivo is the only one combining compliance, soil health and commercial valorisation, with local roots."
                  : "D'autres plateformes existent et sont sérieuses. Agrivo est la seule à combiner conformité, santé des sols et valorisation commerciale, avec un ancrage local."}
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
                          className={`p-4 text-center font-semibold ${c === "Agrivo" ? "bg-forest-950 text-white" : "text-stone-600"}`}
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
                          <td key={ci} className={`p-4 ${COLS[ci] === "Agrivo" ? "bg-green-signal/[0.06]" : ""}`}>
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

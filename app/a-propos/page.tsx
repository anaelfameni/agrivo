"use client";
import Link from "next/link";
import { ShieldCheck, Sprout, Coins, ArrowRight, Radar, Network } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { PageHero } from "@/components/landing/page-hero";
import { HeroBg } from "@/components/landing/hero-bg";
import { useLanguage } from "@/components/language-provider";

const ROADMAP = [
  { step: "01", title: { fr: "Pilote", en: "Pilot" }, body: { fr: "Déployer le parcours complet avec une première coopérative pilote à Soubré, du scan à la valorisation.", en: "Deploy the full journey with a first pilot cooperative in Soubré, from scan to valorisation." } },
  { step: "02", title: { fr: "Conformité", en: "Compliance" }, body: { fr: "Produire un certificat d'évaluation de conformité pour chaque parcelle vérifiée et des dossiers prêts pour la déclaration européenne.", en: "Produce a compliance-assessment certificate for every verified plot and files ready for the European declaration." } },
  { step: "03", title: { fr: "Lancement", en: "Launch" }, body: { fr: "Ouvrir aux coopératives et exportateurs cacao, avec le sélecteur de langue et le mode hors connexion.", en: "Open to cocoa cooperatives and exporters, with the language switcher and offline mode." } },
  { step: "04", title: { fr: "Expansion", en: "Expansion" }, body: { fr: "Étendre au café, à l'hévéa et au palmier à huile, puis aux autres pays de l'UMOA.", en: "Extend to coffee, rubber and oil palm, then to the other WAEMU countries." } },
];

const NEXT = [
  { icon: <Radar size={20} className="text-green-signal" />, title: { fr: "Monitoring continu", en: "Continuous monitoring" }, body: { fr: "Surveillance satellite répétée et alertes précoces sur les parcelles à risque.", en: "Repeated satellite monitoring and early alerts on at-risk plots." } },
  { icon: <Network size={20} className="text-amber-cacao" />, title: { fr: "Mise en relation acheteurs premium", en: "Premium buyer matching" }, body: { fr: "Mise en relation des coopératives au portefeuille conforme avec les acheteurs européens exigeants.", en: "Connecting cooperatives with compliant portfolios to demanding European buyers." } },
];

const TEAM = [
  { name: "Anael", role: { fr: "Fondateur & chef de projet · Produit & plateforme web", en: "Founder & project lead · Product & web platform" }, initials: "AN", grad: "linear-gradient(135deg,#16a34a,#0c2519)" },
  { name: "Christ", role: { fr: "Ingénieur application mobile", en: "Mobile app engineer" }, initials: "CH", grad: "linear-gradient(135deg,#1b4a39,#0a1f14)" },
  { name: "Gaddiel", role: { fr: "Ingénieur backend & API", en: "Backend & API engineer" }, initials: "GA", grad: "linear-gradient(135deg,#2D7A4B,#0c2519)" },
  { name: "Domy", role: { fr: "Responsable conformité & réglementaire", en: "Compliance & regulatory lead" }, initials: "DO", grad: "linear-gradient(135deg,#c8861d,#5a3a0e)" },
];

export default function APropos() {
  const { lang } = useLanguage();
  const en = lang === "en";
  return (
    <div className="min-h-screen bg-ivory text-forest-950">
      <SiteHeader variant="overlay" />
      <main>
        <PageHero
          eyebrow={en ? "About" : "À propos"}
          title={
            en
              ? "Turning a European constraint into an opportunity for the farmer."
              : "Transformer une contrainte européenne en opportunité pour le producteur."
          }
          sub={
            en
              ? "The new deforestation regulation is not only a threat. It is also the gateway to provable, better-paid agriculture. The National Traceability System identifies farmers; Agrivo builds on top of it to make each lot provable and sellable: the commerce layer for West African export commodities."
              : "La nouvelle réglementation sur la déforestation n'est pas seulement une menace. C'est aussi la porte d'entrée vers une agriculture prouvable et mieux rémunérée. Le Système national de traçabilité identifie les producteurs ; Agrivo construit au-dessus pour rendre chaque lot prouvable et vendable : la couche commerce des filières d'exportation d'Afrique de l'Ouest."
          }
        />

        {/* Le moat */}
        <section className="divide-fluid bg-ivory">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-8">
            <Reveal>
              <h2 className="max-w-2xl font-display text-3xl">
                {en ? "Our difference rests on three inseparable pillars." : "Notre différence tient en trois piliers, indissociables."}
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { icon: <ShieldCheck size={22} className="text-green-signal" />, t: en ? "Compliance" : "Conformité", d: en ? "The satellite verdict and the compliance-assessment certificate, ready for Europe." : "Le verdict satellite et le certificat d'évaluation de conformité, prêts pour l'Europe." },
                { icon: <Sprout size={22} className="text-forest-700" />, t: en ? "Soil health" : "Santé des sols", d: en ? "A resilience score, methodology inspired by recognized standards such as Kubeko." : "Un score de résilience, méthodologie inspirée de standards reconnus type Kubeko." },
                { icon: <Coins size={22} className="text-amber-cacao" />, t: en ? "Valorisation" : "Valorisation", d: en ? "Proven compliance turned into premiums and market access." : "La conformité prouvée transformée en primes et en accès aux marchés." },
              ].map((p, i) => (
                <Reveal key={p.t} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-7">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-ivory-deep/60">{p.icon}</div>
                    <h3 className="mt-4 font-display text-xl">{p.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{p.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="bg-ivory-deep/40">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-8">
            <Reveal>
              <span className="eyebrow text-green-signal">{en ? "Roadmap" : "Feuille de route"}</span>
              <h2 className="mt-3 font-display text-3xl">{en ? "From pilot to regional expansion." : "Du pilote à l\u2019expansion régionale."}</h2>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ROADMAP.map((r, i) => (
                <Reveal key={r.step} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-6">
                    <span className="num text-sm text-amber-cacao">{r.step}</span>
                    <h3 className="mt-2 font-display text-xl">{en ? r.title.en : r.title.fr}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{en ? r.body.en : r.body.fr}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Ce qui arrive ensuite, fond animé signature du hero */}
        <section className="relative isolate overflow-hidden bg-forest-950 text-white">
          <HeroBg />
          <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-8">
            <Reveal>
              <h2 className="font-display text-3xl">{en ? "What comes next" : "Ce qui arrive ensuite"}</h2>
              <p className="mt-3 max-w-2xl text-sm text-white/60">
                {en
                  ? "Our roadmap beyond launch: the services we are preparing for cooperatives and exporters."
                  : "Notre feuille de route au-delà du lancement : les services que nous préparons pour les coopératives et les exportateurs."}
              </p>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {NEXT.map((n, i) => (
                <Reveal key={n.title.fr} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-white/12 bg-white/[0.04] p-7 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">{n.icon}</div>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                        Roadmap
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-xl text-white">{en ? n.title.en : n.title.fr}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{en ? n.body.en : n.body.fr}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Équipe */}
        <section className="divide-fluid bg-ivory">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
            <Reveal>
              <h2 className="font-display text-3xl">{en ? "An Ivorian team, rooted in the field." : "Une équipe ivoirienne, ancrée dans le terrain."}</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {TEAM.map((m, i) => (
                <Reveal key={m.name} delay={i * 0.06}>
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-6 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl font-display text-xl text-white" style={{ background: m.grad }}>
                      {m.initials}
                    </div>
                    <div>
                      <div className="font-display text-lg">{m.name}</div>
                      <div className="mt-0.5 text-xs text-stone-500">{en ? m.role.en : m.role.fr}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-forest-950 text-white">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center md:px-8">
            <Reveal>
              <h2 className="font-display text-3xl">{en ? "Time to execute." : "Le temps de l\u2019exécution."}</h2>
              <p className="mx-auto mt-3 max-w-lg text-white/70">
                {en
                  ? "A regulatory calendar that will not wait, a local team, a product already up and running."
                  : "Un calendrier réglementaire qui n'attend pas, une équipe locale, un produit déjà opérationnel."}
              </p>
              <Link href="/app/dashboard" className="mt-8 inline-flex items-center gap-3 rounded-full bg-green-signal px-7 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95">
                {en ? "Go to the dashboard" : "Accéder au tableau de bord"} <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

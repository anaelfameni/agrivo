"use client";
import Link from "next/link";
import { ShieldCheck, Sprout, Coins, ArrowRight, Radar, Network } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";

const ROADMAP = [
  { step: "01", title: "Pilote", body: "Valider le parcours sur une coopérative de démonstration à Soubré, du scan au micro-crédit." },
  { step: "02", title: "Conformité", body: "Brancher l'API Whisp en production et générer des certificats prêts pour TRACES NT." },
  { step: "03", title: "Lancement", body: "Ouvrir aux coopératives et exportateurs cacao, avec le sélecteur de langue et le mode hors connexion." },
  { step: "04", title: "Expansion", body: "Étendre au café, à l'hévéa et au palmier à huile, puis aux autres pays de l'UMOA." },
];

const NEXT = [
  { icon: <Radar size={20} className="text-green-signal" />, title: "Monitoring continu", body: "Surveillance satellite répétée et alertes précoces sur les parcelles à risque." },
  { icon: <Network size={20} className="text-amber-cacao" />, title: "Matching coopérative ↔ IMF", body: "Mise en relation automatisée des coopératives solides avec les institutions de micro-finance." },
];

const TEAM = [
  { name: "Anael", role: "Lead build, pitch & marque", initials: "AN", grad: "linear-gradient(135deg,#16a34a,#0c2519)" },
  { name: "Christ", role: "Backend & données", initials: "CH", grad: "linear-gradient(135deg,#1b4a39,#0a1f14)" },
  { name: "Gaddiel", role: "Intégration IA", initials: "GA", grad: "linear-gradient(135deg,#2D7A4B,#0c2519)" },
  { name: "Domy", role: "Conformité & réglementaire", initials: "DO", grad: "linear-gradient(135deg,#c8861d,#5a3a0e)" },
  { name: "Fatim", role: "Stratégie & design", initials: "FA", grad: "linear-gradient(135deg,#4A6b1f,#0c2519)" },
];

export default function APropos() {
  return (
    <div className="min-h-screen bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main>
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 md:px-8">
          <Reveal>
            <span className="eyebrow text-amber-cacao">À propos</span>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Transformer une contrainte européenne en opportunité pour le producteur.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              La nouvelle réglementation sur la déforestation n'est pas seulement une menace. C'est aussi la
              porte d'entrée vers une agriculture prouvable et financée. Agrivo veut devenir l'outil de
              référence de la conformité et de l'accès au crédit pour les filières d'exportation d'Afrique de
              l'Ouest.
            </p>
          </Reveal>
        </section>

        {/* Le moat */}
        <section className="divide-fluid bg-ivory">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-8">
            <Reveal>
              <h2 className="max-w-2xl font-display text-3xl">
                Notre différence tient en trois piliers, indissociables.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { icon: <ShieldCheck size={22} className="text-green-signal" />, t: "Conformité", d: "Le verdict satellite et le certificat, prêts pour l'Europe." },
                { icon: <Sprout size={22} className="text-forest-700" />, t: "Santé des sols", d: "Un score de résilience, méthodologie inspirée de standards reconnus type Kubeko." },
                { icon: <Coins size={22} className="text-amber-cacao" />, t: "Inclusion", d: "Le crédit rendu accessible au producteur conforme." },
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
              <span className="eyebrow text-amber-cacao">Feuille de route</span>
              <h2 className="mt-3 font-display text-3xl">Du pilote à l'expansion régionale.</h2>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ROADMAP.map((r, i) => (
                <Reveal key={r.step} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-6">
                    <span className="num text-sm text-amber-cacao">{r.step}</span>
                    <h3 className="mt-2 font-display text-xl">{r.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{r.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Ce qui arrive ensuite */}
        <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
          <Reveal>
            <h2 className="font-display text-3xl">Ce qui arrive ensuite</h2>
            <p className="mt-3 max-w-2xl text-sm text-stone-500">
              Une vision produit au-delà du MVP. Ces briques ne sont pas encore construites, elles balisent la
              suite.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {NEXT.map((n, i) => (
              <Reveal key={n.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-dashed border-black/[0.12] bg-white/60 p-7 opacity-90">
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-ivory-deep/60">{n.icon}</div>
                    <span className="rounded-full bg-ivory-deep px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                      Roadmap
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl">{n.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{n.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Équipe */}
        <section className="divide-fluid bg-ivory">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
            <Reveal>
              <h2 className="font-display text-3xl">Une équipe ivoirienne, ancrée dans le terrain.</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {TEAM.map((m, i) => (
                <Reveal key={m.name} delay={i * 0.06}>
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-6 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl font-display text-xl text-white" style={{ background: m.grad }}>
                      {m.initials}
                    </div>
                    <div>
                      <div className="font-display text-lg">{m.name}</div>
                      <div className="mt-0.5 text-xs text-stone-500">{m.role}</div>
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
              <h2 className="font-display text-3xl">Le temps de l'exécution.</h2>
              <p className="mx-auto mt-3 max-w-lg text-white/70">
                Une fenêtre d'opportunité réglementaire, une équipe locale, un produit prêt à démontrer.
              </p>
              <Link href="/app/dashboard" className="mt-8 inline-flex items-center gap-3 rounded-full bg-green-signal px-7 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95">
                Accéder au tableau de bord <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

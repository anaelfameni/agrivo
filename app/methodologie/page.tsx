"use client";
import Link from "next/link";
import { Satellite, Sparkles, Layers, CloudOff, CheckCircle2, AlertTriangle, ArrowRight, ArrowDown, Database, BadgeCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Term } from "@/components/ui/term";
import { useLanguage } from "@/components/language-provider";

const STATES = [
  {
    icon: <CheckCircle2 size={20} className="text-green-signal" />,
    title: { fr: "Conforme", en: "Compliant" },
    phrase: {
      fr: "Aucune déforestation détectée après le 31 décembre 2020.",
      en: "No deforestation detected after 31 December 2020.",
    },
    color: "var(--color-green-signal)",
  },
  {
    icon: <AlertTriangle size={20} className="text-red-block" />,
    title: { fr: "Anomalie détectée", en: "Anomaly detected" },
    phrase: {
      fr: "Une perte de couverture forestière a été identifiée sur cette zone.",
      en: "A loss of forest cover was identified on this area.",
    },
    color: "var(--color-red-block)",
  },
  {
    icon: <CloudOff size={20} className="text-amber-cacao" />,
    title: { fr: "Données insuffisantes", en: "Insufficient data" },
    phrase: {
      fr: "Présence de nuages ou données satellites insuffisantes pour statuer.",
      en: "Clouds or insufficient satellite data to decide.",
    },
    color: "var(--color-amber-cacao)",
  },
];

export default function Methodologie() {
  const { lang } = useLanguage();
  const en = lang === "en";
  return (
    <div className="min-h-screen bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main>
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 md:px-8">
          <Reveal>
            <span className="eyebrow text-amber-cacao">{en ? "Methodology" : "Méthodologie"}</span>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              {en ? "How Agrivo assesses a plot, with no black box." : "Comment Agrivo évalue une parcelle, sans boîte noire."}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              {en
                ? "Agrivo does not invent deforestation detection. It orchestrates public reference satellite data and a generative AI to make the result understandable and actionable. Here is exactly how."
                : "Agrivo n'invente pas la détection de déforestation. Il orchestre des données satellites publiques de référence et une IA générative pour rendre le résultat compréhensible et actionnable. Voici exactement comment."}
            </p>
          </Reveal>
        </section>

        {/* Le flux en un schéma : Donnée, IA, Résultat */}
        <section className="mx-auto max-w-6xl px-6 pb-4 md:px-8">
          <Reveal>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 md:p-10">
              <span className="eyebrow text-green-signal">{en ? "The flow, in one diagram" : "Le flux, en un schéma"}</span>
              <h2 className="mt-3 font-display text-2xl text-forest-950 sm:text-3xl">
                {en ? "Data, artificial intelligence, result." : "Donnée, intelligence artificielle, résultat."}
              </h2>
              <div className="mt-8 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <div className="rounded-xl bg-ivory p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-forest-950/[0.06] text-forest-950">
                    <Database size={20} />
                  </div>
                  <h3 className="mt-3 font-display text-lg text-forest-950">{en ? "1. The data" : "1. La donnée"}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {en
                      ? "The photo of the farmer's card and the GeoJSON polygon of their plot (WGS-84, six decimals), captured at the edge of the field with their consent."
                      : "La photo de la carte du producteur et le polygone GeoJSON de sa parcelle (WGS-84, six décimales), relevés au bord du champ avec son consentement."}
                  </p>
                </div>
                <div className="hidden items-center md:flex" aria-hidden>
                  <ArrowRight size={22} className="text-green-signal" />
                </div>
                <div className="flex justify-center md:hidden" aria-hidden>
                  <ArrowDown size={22} className="text-green-signal" />
                </div>
                <div className="rounded-xl bg-ivory p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-signal/12 text-green-signal">
                    <Satellite size={20} />
                  </div>
                  <h3 className="mt-3 font-display text-lg text-forest-950">{en ? "2. The AI" : "2. L\u2019IA"}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {en
                      ? "Whisp (FAO) compares the plot against satellite archives since 31 December 2020. Gemini reads the card and puts the result into words. Each has its role, never confused."
                      : "Whisp (FAO) compare la parcelle aux archives satellites depuis le 31 décembre 2020. Gemini lit la carte et met le résultat en mots. Chacune son rôle, jamais confondus."}
                  </p>
                </div>
                <div className="hidden items-center md:flex" aria-hidden>
                  <ArrowRight size={22} className="text-green-signal" />
                </div>
                <div className="flex justify-center md:hidden" aria-hidden>
                  <ArrowDown size={22} className="text-green-signal" />
                </div>
                <div className="rounded-xl bg-ivory p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-cacao/12 text-amber-cacao">
                    <BadgeCheck size={20} />
                  </div>
                  <h3 className="mt-3 font-display text-lg text-forest-950">{en ? "3. The result" : "3. Le résultat"}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {en
                      ? "A verdict among three states, a PDF certificate verifiable by QR code, a file ready for TRACES NT, and access to micro-credit if the plot is compliant."
                      : "Un verdict parmi trois états, un certificat PDF vérifiable par QR code, un dossier prêt pour TRACES NT, et l'accès au micro-crédit si la parcelle est conforme."}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Deux IA */}
        <section className="divide-fluid bg-ivory">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-8">
            <Reveal>
              <h2 className="max-w-2xl font-display text-3xl text-forest-950">
                {en ? "Two intelligences, never confused." : "Deux intelligences, jamais confondues."}
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-8">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-signal/12 text-green-signal">
                    <Satellite size={22} />
                  </div>
                  <h3 className="mt-4 font-display text-2xl">{en ? "Whisp, the detection" : "Whisp, la détection"}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    <Term def={en ? '"What is in that plot?", FAO open-source tool designed specifically for the EUDR, crossing several reference satellite datasets.' : "« What is in that plot ? », outil open-source de la FAO conçu spécifiquement pour le RDUE, qui croise plusieurs jeux de données satellites de référence."}>Whisp</Term>{" "}
                    {en
                      ? "is FAO's reference tool for the EUDR. It is not a home-made model: it is already used in production, notably on a pilot of over 6,000 plots in Kenya. It, and it alone, renders the compliance verdict."
                      : "est l'outil de référence de la FAO pour le RDUE. Ce n'est pas un modèle maison : il est déjà utilisé en production, notamment sur un pilote de plus de 6 000 parcelles au Kenya. C'est lui, et lui seul, qui rend le verdict de conformité."}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-8">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-cacao/12 text-amber-cacao">
                    <Sparkles size={22} />
                  </div>
                  <h3 className="mt-4 font-display text-2xl">{en ? "Gemini, the language" : "Gemini, le langage"}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {en
                      ? "Google's generative AI reads the farmer's card, explains the verdict in plain language, and answers the exporter's questions. It assists reading and action, never detection. It never decides whether a plot is compliant."
                      : "L'IA générative de Google lit la carte du producteur, explique le verdict en langage clair, et répond aux questions de l'exportateur. Elle assiste la lecture et l'action, jamais la détection. Elle ne décide jamais si une parcelle est conforme."}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Convergence de preuves */}
        <section className="bg-ivory-deep/40">
          <div className="mx-auto max-w-3xl px-6 py-20 md:px-8">
            <Reveal>
              <h2 className="font-display text-3xl text-forest-950">{en ? "Convergence of evidence" : "La convergence de preuves"}</h2>
              <p className="mt-5 leading-relaxed text-stone-600">
                {en ? "Rather than relying on a single source, Whisp applies a " : "Plutôt que de se fier à une seule source, Whisp applique une "}
                <Term def={en ? "Crossing several independent satellite datasets rather than a single source, for a robust verdict that is hard to contest." : "Croiser plusieurs jeux de données satellites indépendants plutôt qu'une seule source, pour un verdict robuste, difficile à contester."}>{en ? "convergence of evidence" : "convergence de preuves"}</Term>
                {en ? ": it crosses several independent geospatial datasets (including Copernicus) and compares them against the " : " : il croise plusieurs jeux de données géospatiales indépendants (dont Copernicus) et les compare à la date pivot du "}
                <span className="num">{en ? "31 December 2020" : "31 décembre 2020"}</span>{en ? " cut-off date. The plot is described in the " : ". La parcelle est décrite au format "}
                <Term def={en ? "Standardized format (RFC 7946) describing geographic shapes. The only format accepted by TRACES NT, with 6-decimal precision." : "Format standardisé (RFC 7946) décrivant des formes géographiques. Seul format accepté par TRACES NT, avec 6 décimales de précision."}>GeoJSON</Term>{en ? " format, with six-decimal coordinates." : ", avec ses coordonnées à six décimales."}
              </p>
              <p className="mt-4 leading-relaxed text-stone-600">
                {en ? "The verdict then feeds the " : "Le verdict alimente ensuite la "}
                <Term def={en ? "Due Diligence Statement, filed by the European importer on the TRACES NT portal." : "Déclaration de Diligence Raisonnée, déposée par l'importateur européen sur le portail TRACES NT."}>{en ? "DDS" : "DDR"}</Term>
                {en ? " that the importer files on " : " que l'importateur dépose sur "}
                <Term def={en ? "European Commission digital portal where due diligence statements are filed." : "Portail numérique de la Commission européenne où sont déposées les déclarations de diligence raisonnée."}>TRACES NT</Term>.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Trois états */}
        <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
          <Reveal>
            <h2 className="max-w-2xl font-display text-3xl text-forest-950">
              {en ? 'Three result states, and why "insufficient data" exists.' : "Trois états de résultat, et pourquoi « données insuffisantes » existe."}
            </h2>
            <p className="mt-4 max-w-2xl text-stone-600">
              {en
                ? 'A binary verdict would lie. When cloud cover prevents a conclusion, Agrivo says so frankly rather than guessing. The honesty of "I do not know yet" is a strength, not a weakness.'
                : "Un verdict binaire mentirait. Quand la couverture nuageuse empêche de conclure, Agrivo le dit franchement plutôt que de deviner. L'honnêteté du « je ne sais pas encore » est une force, pas une faiblesse."}
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STATES.map((s, i) => (
              <Reveal key={s.title.fr} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-6" style={{ borderTop: `3px solid ${s.color}` }}>
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <h3 className="font-display text-lg text-forest-950">{en ? s.title.en : s.title.fr}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{en ? s.phrase.en : s.phrase.fr}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-forest-950 text-white">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center md:px-8">
            <Reveal>
              <div className="mb-3 grid place-items-center">
                <Layers size={28} className="text-green-signal" />
              </div>
              <h2 className="font-display text-3xl">{en ? "See the method at work" : "Voir la méthode à l\u2019œuvre"}</h2>
              <p className="mx-auto mt-3 max-w-lg text-white/70">
                {en
                  ? "The demo runs the full journey: card scan, plot mapping, satellite verdict, certificate, micro-credit."
                  : "La démo déroule le parcours complet : scan de la carte, cartographie de la parcelle, verdict satellite, certificat, micro-crédit."}
              </p>
              <Link
                href="/app/dashboard"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-green-signal px-7 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
              >
                {en ? "Open the demo" : "Ouvrir la démo"} <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

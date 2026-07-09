"use client";
import * as React from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { useLanguage } from "@/components/language-provider";
import { CopiloteRdue } from "@/components/app/copilote-rdue";

const QA: { q: { fr: string; en: string }; a: { fr: string; en: string } }[] = [
  {
    q: { fr: "Le RDUE peut-il encore être reporté ?", en: "Can the EUDR still be postponed?" },
    a: {
      fr: "Non. Une révision ciblée adoptée en décembre 2025 a repoussé et simplifié le règlement, mais confirmé l'échéance : 30 décembre 2026 pour les grands et moyens opérateurs, 30 juin 2027 pour les petites entreprises. Le calendrier ne bouge plus.",
      en: "No. A targeted revision adopted in December 2025 delayed and simplified the regulation, but confirmed the deadline: 30 December 2026 for large and medium operators, 30 June 2027 for small businesses. The timeline is now fixed.",
    },
  },
  {
    q: { fr: "Qu'est-ce que le RDUE, en une phrase ?", en: "What is the EUDR, in one sentence?" },
    a: {
      fr: "Le règlement européen (UE) 2023/1115 interdit d'importer dans l'Union des produits issus de terres déforestées après le 31 décembre 2020, avec une traçabilité géolocalisée obligatoire.",
      en: "EU Regulation 2023/1115 bans importing into the Union products grown on land deforested after 31 December 2020, with mandatory geolocated traceability.",
    },
  },
  {
    q: { fr: "La Côte d'Ivoire est-elle vraiment concernée par la géolocalisation ?", en: "Is Côte d'Ivoire really concerned by geolocation?" },
    a: {
      fr: "Oui. La Côte d'Ivoire est classée « risque standard ». Que le pays soit à risque standard ou élevé, la géolocalisation complète des parcelles reste obligatoire. Seuls les pays à « faible risque » bénéficient d'une diligence simplifiée, et la Côte d'Ivoire n'en fait pas partie.",
      en: "Yes. Côte d'Ivoire is classified as \"standard risk\". Whether a country is standard or high risk, full plot geolocation remains mandatory. Only \"low risk\" countries benefit from simplified due diligence, and Côte d'Ivoire is not one of them.",
    },
  },
  {
    q: { fr: "Agrivo signe-t-il la déclaration de conformité à ma place ?", en: "Does Agrivo sign the compliance declaration for me?" },
    a: {
      fr: "Non. C'est l'importateur européen qui dépose sa Déclaration de Diligence Raisonnée sur TRACES NT. Agrivo fournit l'évaluation technique et le certificat qui alimentent cette déclaration. Nous parlons d'évaluation, jamais de garantie légale.",
      en: "No. The European importer files their Due Diligence Statement on TRACES NT. Agrivo provides the technical assessment and the certificate that feed this declaration. We speak of assessment, never of legal guarantee.",
    },
  },
  {
    q: { fr: "La conformité rapporte-t-elle vraiment à la coopérative ?", en: "Does compliance really pay off for the cooperative?" },
    a: {
      fr: "Oui, par la valorisation — jamais par du crédit. En Côte d'Ivoire le prix bord champ est fixé à 1 200 FCFA/kg, quand le prix de référence pour un revenu vital atteint 1 758 FCFA/kg (+47 %). Une parcelle conforme est l'argument pour négocier primes de durabilité et acheteurs premium au-dessus du prix garanti.",
      en: "Yes, through valorisation — never through credit. In Côte d'Ivoire the farmgate price is set at 1,200 FCFA/kg while the living-income reference price reaches 1,758 FCFA/kg (+47%). A compliant plot is the argument to negotiate sustainability premiums and premium buyers above the guaranteed price.",
    },
  },
  {
    q: { fr: "Quelle est la fiabilité de la détection ?", en: "How reliable is the detection?" },
    a: {
      fr: "La détection repose sur la méthode de référence de la FAO pour le RDUE (analyse satellite), déjà utilisée en production. Sa convergence de preuves croise plusieurs jeux de données satellites indépendants. Quand les données ne permettent pas de conclure, Agrivo affiche « Données insuffisantes » plutôt que de deviner.",
      en: "Detection relies on the FAO's reference method for the EUDR (satellite analysis), already used in production. Its convergence of evidence crosses several independent satellite datasets. When the data does not allow a conclusion, Agrivo displays \"Insufficient data\" rather than guessing.",
    },
  },
  {
    q: { fr: "Agrivo couvre-t-il d'autres filières que le cacao ?", en: "Does Agrivo cover commodities other than cocoa?" },
    a: {
      fr: "Oui. Le moteur est multi-filières : cacao, café, hévéa et palmier à huile. Le déploiement commence par le cacao, la filière la plus urgente.",
      en: "Yes. The engine is multi-commodity: cocoa, coffee, rubber and oil palm. Deployment starts with cocoa, the most urgent commodity.",
    },
  },
  {
    q: { fr: "En quoi Agrivo se distingue de Koltiva ou Farmerline ?", en: "How is Agrivo different from Koltiva or Farmerline?" },
    a: {
      fr: "Ce sont de vraies plateformes numériques sérieuses. La différence d'Agrivo n'est pas « SaaS contre service » : c'est la combinaison, en un seul outil, de la conformité RDUE, du score de santé des sols et de la valorisation commerciale de la conformité, avec un ancrage local ivoirien.",
      en: "Those are serious digital platforms. Agrivo's difference is not \"SaaS versus service\": it is the combination, in a single tool, of EUDR compliance, soil health scoring and commercial valorisation of compliance, with local Ivorian roots.",
    },
  },
  {
    q: { fr: "Mes données restent-elles protégées ?", en: "Is my data protected?" },
    a: {
      fr: "Agrivo est conçu conforme à la loi ivoirienne n°2013-450 sous le contrôle de l'ARTCI : consentement éclairé du producteur, registre des traitements tenu à jour et chiffrement des échanges. Pendant la phase pilote, l'application est hébergée par Vercel ; un hébergement régional est prévu à la mise en production. Un écran de consentement précède toute vérification.",
      en: "Agrivo is designed to comply with Ivorian law no. 2013-450 under ARTCI oversight: informed farmer consent, a maintained processing register and encrypted exchanges. During the pilot phase the app is hosted on Vercel; regional hosting is planned for production. A consent screen precedes every verification.",
    },
  },
];

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-black/[0.08]">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-display text-lg text-forest-950">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-green-signal">
          <Plus size={22} strokeWidth={1.75} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-5 text-sm leading-relaxed text-stone-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className="min-h-screen bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main>
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-20 md:px-8">
          <Reveal>
            <span className="eyebrow text-amber-cacao">{en ? "Frequently asked questions" : "Questions fréquentes"}</span>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              {en
                ? "Everything an exporter or a cooperative wants to know."
                : "Tout ce qu'un exportateur ou une coopérative se demande."}
            </h1>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-10 md:px-8">
          <Reveal>
            <div>
              {QA.map((item, i) => (
                <Item key={item.q.fr} q={en ? item.q.en : item.q.fr} a={en ? item.a.en : item.a.fr} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
              ))}
            </div>
          </Reveal>
        </section>

        <section className="bg-forest-950 text-white">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center md:px-8">
            <Reveal>
              <h2 className="font-display text-3xl">{en ? "Another question?" : "Une autre question ?"}</h2>
              <p className="mx-auto mt-3 max-w-md text-white/70">
                {en ? "The simplest thing is to see the product running." : "Le plus simple reste de voir le produit tourner."}
              </p>
              <Link href="/app/dashboard" className="mt-7 inline-flex items-center gap-3 rounded-full bg-green-signal px-7 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95">
                {en ? "Go to the dashboard" : "Accéder au tableau de bord"} <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
      <CopiloteRdue />
    </div>
  );
}

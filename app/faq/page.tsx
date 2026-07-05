"use client";
import * as React from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";

const QA = [
  {
    q: "Le RDUE peut-il encore être reporté ?",
    a: "Non. Une révision ciblée adoptée en décembre 2025 a repoussé et simplifié le règlement, mais confirmé l'échéance : 30 décembre 2026 pour les grands et moyens opérateurs, 30 juin 2027 pour les petites entreprises. Le calendrier ne bouge plus.",
  },
  {
    q: "Qu'est-ce que le RDUE, en une phrase ?",
    a: "Le règlement européen (UE) 2023/1115 interdit d'importer dans l'Union des produits issus de terres déforestées après le 31 décembre 2020, avec une traçabilité géolocalisée obligatoire.",
  },
  {
    q: "La Côte d'Ivoire est-elle vraiment concernée par la géolocalisation ?",
    a: "Oui. La Côte d'Ivoire est classée « risque standard ». Que le pays soit à risque standard ou élevé, la géolocalisation complète des parcelles reste obligatoire. Seuls les pays à « faible risque » bénéficient d'une diligence simplifiée, et la Côte d'Ivoire n'en fait pas partie.",
  },
  {
    q: "Agrivo signe-t-il la déclaration de conformité à ma place ?",
    a: "Non. C'est l'importateur européen qui dépose sa Déclaration de Diligence Raisonnée sur TRACES NT. Agrivo fournit l'évaluation technique et le certificat qui alimentent cette déclaration. Nous parlons d'évaluation, jamais de garantie légale.",
  },
  {
    q: "Quelle est la fiabilité de la détection ?",
    a: "La détection repose sur Whisp, l'outil open-source de référence de la FAO pour le RDUE, déjà utilisé en production. Sa méthode de convergence de preuves croise plusieurs jeux de données satellites indépendants. Quand les données ne permettent pas de conclure, Agrivo affiche « Données insuffisantes » plutôt que de deviner.",
  },
  {
    q: "Comment fonctionne le micro-crédit ?",
    a: "Quand une parcelle est conforme, le producteur peut recevoir une proposition de micro-crédit versée en Mobile Money. Agrivo reste un fournisseur de technologie : le prêt est accordé par une institution de micro-finance partenaire. Le service est gratuit pour le producteur.",
  },
  {
    q: "Agrivo couvre-t-il d'autres filières que le cacao ?",
    a: "Oui. Le moteur est multi-filières : cacao, café, hévéa et palmier à huile. La démonstration se concentre sur le cacao, la filière la plus documentée et la plus urgente.",
  },
  {
    q: "En quoi Agrivo se distingue de Koltiva ou Farmerline ?",
    a: "Ce sont de vraies plateformes numériques sérieuses. La différence d'Agrivo n'est pas « SaaS contre service » : c'est la combinaison, en un seul outil, de la conformité RDUE, du score de santé des sols et de l'inclusion financière du producteur, avec un ancrage local ivoirien.",
  },
  {
    q: "Mes données restent-elles protégées ?",
    a: "Agrivo est conçu conforme à la loi ivoirienne n°2013-450 sous le contrôle de l'ARTCI : consentement éclairé du producteur, hébergement souverain et chiffrement. Un écran de consentement précède toute vérification.",
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
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className="min-h-screen bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main>
        <section className="mx-auto max-w-3xl px-6 pb-6 pt-20 md:px-8">
          <Reveal>
            <span className="eyebrow text-amber-cacao">Questions fréquentes</span>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Tout ce qu'un jury, un exportateur ou une coopérative se demande.
            </h1>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-10 md:px-8">
          <Reveal>
            <div>
              {QA.map((item, i) => (
                <Item key={item.q} q={item.q} a={item.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
              ))}
            </div>
          </Reveal>
        </section>

        <section className="bg-forest-950 text-white">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center md:px-8">
            <Reveal>
              <h2 className="font-display text-3xl">Une autre question ?</h2>
              <p className="mx-auto mt-3 max-w-md text-white/70">
                Le plus simple reste de voir le produit tourner.
              </p>
              <Link href="/app/dashboard" className="mt-7 inline-flex items-center gap-3 rounded-full bg-green-signal px-7 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95">
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

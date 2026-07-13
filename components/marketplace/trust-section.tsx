"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ScanLine, MapPinned, Scale, ArrowRight, Satellite, IdCard, Landmark, Radar,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/**
 * Section CONFIANCE unifiée (fusion de « Match → Trust → Transact » et « prouvée par la méthode »).
 * D'abord le récit du double verrou (les 3 piliers du sceau), puis les référentiels/méthodes qui
 * l'étayent (Whisp·FAO, carte CCC, RDUE, Sentinel-2). Aucun faux témoignage : des faits et des
 * régulateurs. Animations d'entrée en cascade, sous prefers-reduced-motion.
 */
const TR = {
  fr: {
    eyebrow: "Match · Trust · Transact",
    title: "Un lot ne se vend ici que scellé.",
    sub: "Le sceau AGRIVO est un double verrou anti-fraude, calculé depuis les données du lot, jamais affirmé sans preuve. Et cette preuve s'appuie sur des sources publiques et des référentiels officiels.",
    method: "Comprendre le sceau",
    pillars: [
      { Icon: ScanLine, t: "Carte producteur", b: "Identité et parcelle déjà vérifiées par l'État (Conseil Café-Cacao) : l'ancre anti-fraude." },
      { Icon: MapPinned, t: "Polygone hors-déforestation", b: "Chaque parcelle évaluée « Conforme » par l'analyse satellite (méthode Whisp, FAO)." },
      { Icon: Scale, t: "Intégrité de volume", b: "Le tonnage reste sous le plafond superficie × rendement : l'anti-blanchiment de l'origine." },
    ],
    proofLabel: "La preuve s'appuie sur",
    proofs: [
      { Icon: Satellite, t: "Whisp · FAO", b: "Analyse satellite de déforestation (méthode Open Foris)." },
      { Icon: IdCard, t: "Carte producteur · CCC", b: "Identité et parcelle vérifiées par le Conseil du Café-Cacao." },
      { Icon: Landmark, t: "RDUE · UE 2023/1115", b: "Aligné sur le règlement européen anti-déforestation." },
      { Icon: Radar, t: "Copernicus Sentinel-2", b: "Imagerie satellite européenne, sources ouvertes et traçables." },
    ],
  },
  en: {
    eyebrow: "Match · Trust · Transact",
    title: "A lot only sells here once it's sealed.",
    sub: "The AGRIVO seal is a double anti-fraud lock, computed from the lot's data, never asserted without proof. And that proof relies on public sources and official frameworks.",
    method: "Understand the seal",
    pillars: [
      { Icon: ScanLine, t: "Producer card", b: "Identity and plot already verified by the State (Coffee-Cocoa Council): the anti-fraud anchor." },
      { Icon: MapPinned, t: "Deforestation-free polygon", b: "Every plot assessed “Compliant” by satellite analysis (Whisp method, FAO)." },
      { Icon: Scale, t: "Volume integrity", b: "Tonnage stays under the area × yield cap: origin anti-laundering." },
    ],
    proofLabel: "The proof relies on",
    proofs: [
      { Icon: Satellite, t: "Whisp · FAO", b: "Satellite deforestation analysis (Open Foris method)." },
      { Icon: IdCard, t: "Producer card · CCC", b: "Identity and plot verified by the Coffee-Cocoa Council." },
      { Icon: Landmark, t: "EUDR · EU 2023/1115", b: "Aligned with the EU deforestation regulation." },
      { Icon: Radar, t: "Copernicus Sentinel-2", b: "European satellite imagery, open and traceable sources." },
    ],
  },
} as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export function TrustSection() {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion();

  return (
    <section className="border-y border-black/[0.06] bg-white">
      <div className="mx-auto w-full max-w-[1760px] px-5 py-20 sm:px-8 lg:px-12 md:py-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-3xl"
        >
          <span className="eyebrow text-green-signal">{t.eyebrow}</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-forest-950 md:text-5xl">{t.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-forest-950/60">{t.sub}</p>
        </motion.div>

        {/* Les 3 piliers du double verrou */}
        <motion.div
          className="mt-12 grid gap-5 md:grid-cols-3"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          {t.pillars.map((p, i) => (
            <motion.div
              key={p.t}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
              className="group relative overflow-hidden rounded-3xl border border-black/[0.06] bg-ivory p-7 transition-colors hover:border-green-signal/30"
            >
              <span className="absolute right-5 top-5 num text-5xl font-bold text-forest-950/[0.05]">0{i + 1}</span>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-signal/12 text-green-signal transition-transform group-hover:scale-110">
                <p.Icon size={24} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-forest-950">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-950/60">{p.b}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Les référentiels / méthodes qui étayent la preuve */}
        <div className="mt-12 rounded-3xl border border-black/[0.06] bg-ivory p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-950/45">{t.proofLabel}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.proofs.map((it, i) => (
              <motion.div
                key={it.t}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-signal/10 text-green-signal">
                  <it.Icon size={19} />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-forest-950">{it.t}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-forest-950/55">{it.b}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Link href="/methodologie" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-green-signal transition-all hover:gap-2.5">
          {t.method} <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

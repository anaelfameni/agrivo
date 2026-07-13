"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ScanLine, MapPinned, Scale, ArrowRight, Satellite, IdCard, Landmark, Radar, ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Tilt } from "@/components/ui/motion-primitives";

/**
 * Section CONFIANCE unifiée (v2.5, mise en scène interactive) : la SÉQUENCE DU SCELLAGE —
 * trois verrous qui s'allument en cascade au scroll, reliés par des segments qui se
 * remplissent, et le badge Sceau AGRIVO qui « claque » au bout. Piliers en cartes Tilt
 * avec balayage lumineux au survol. Puis les référentiels/méthodes qui étayent la preuve
 * (Whisp·FAO, carte CCC, RDUE, Sentinel-2). Aucun faux témoignage : des faits et des
 * régulateurs. Tout est neutralisé sous prefers-reduced-motion.
 */
const TR = {
  fr: {
    eyebrow: "Match · Trust · Transact",
    title: "Un lot ne se vend ici que scellé.",
    sub: "Le sceau AGRIVO est un double verrou anti-fraude, calculé depuis les données du lot, jamais affirmé sans preuve. Et cette preuve s'appuie sur des sources publiques et des référentiels officiels.",
    sealed: "Scellé",
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
    sealed: "Sealed",
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

/** Variants de la séquence du scellage (rail au-dessus des piliers). Les délais sont
 *  explicites (`custom` = index) : verrou i → segment i → verrou suivant → … → sceau. */
const STEP = 0.55;
function railVariants(reduced: boolean): { node: Variants; seg: Variants; seal: Variants } {
  if (reduced) {
    const shown: Variants = { hidden: {}, show: {} };
    return { node: shown, seg: { hidden: { scaleX: 1 }, show: { scaleX: 1 } }, seal: shown };
  }
  return {
    node: {
      hidden: { scale: 0.4, opacity: 0 },
      show: (i: number) => ({
        scale: 1,
        opacity: 1,
        transition: { duration: 0.4, ease: EASE, delay: i * STEP },
      }),
    },
    seg: {
      hidden: { scaleX: 0 },
      show: (i: number) => ({
        scaleX: 1,
        transition: { duration: 0.45, ease: "easeInOut", delay: i * STEP + 0.28 },
      }),
    },
    seal: {
      hidden: { scale: 0.4, opacity: 0 },
      show: (i: number) => ({
        scale: [0.4, 1.12, 1],
        opacity: 1,
        transition: { duration: 0.55, times: [0, 0.7, 1], ease: "easeOut", delay: i * STEP },
      }),
    },
  };
}

export function TrustSection() {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion() ?? false;
  const V = railVariants(reduce);

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

        {/* La séquence du scellage : 3 verrous qui s'allument, puis le sceau qui claque */}
        <motion.div
          aria-hidden
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          className="mt-12 hidden items-center md:flex"
        >
          {t.pillars.map((p, i) => (
            <div key={p.t} className="flex flex-1 items-center">
              <motion.span
                variants={V.node}
                custom={i}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-green-signal/35 bg-green-signal/10 text-green-signal"
              >
                <p.Icon size={18} />
              </motion.span>
              <motion.span
                variants={V.seg}
                custom={i}
                className="h-[2.5px] flex-1 origin-left rounded-full bg-gradient-to-r from-green-signal/70 to-green-signal/25"
              />
              {i === t.pillars.length - 1 && (
                <motion.span
                  variants={V.seal}
                  custom={t.pillars.length}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-signal px-4 py-2 text-xs font-bold text-white shadow-[0_12px_35px_-10px_rgba(22,163,74,0.9)]"
                >
                  <ShieldCheck size={14} /> {t.sealed}
                </motion.span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Les 3 piliers du double verrou : cartes Tilt + balayage lumineux */}
        <motion.div
          className="mt-8 grid gap-5 md:mt-6 md:grid-cols-3"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          {t.pillars.map((p, i) => (
            <motion.div
              key={p.t}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
              className="h-full"
            >
              <Tilt max={5} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-3xl border border-black/[0.06] bg-ivory p-7 transition-[border-color,box-shadow] duration-300 hover:border-green-signal/35 hover:shadow-[0_28px_60px_-32px_rgba(22,163,74,0.5)]">
                  {/* Balayage lumineux au survol */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-3/4 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[350%]"
                  />
                  <span className="absolute right-5 top-4 num text-7xl font-bold text-forest-950/[0.05] transition-colors duration-300 group-hover:text-green-signal/10">0{i + 1}</span>
                  <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-signal/12 text-green-signal transition-all duration-300 group-hover:scale-110 group-hover:bg-green-signal group-hover:text-white group-hover:shadow-[0_10px_28px_-8px_rgba(22,163,74,0.8)]">
                    <p.Icon size={24} />
                  </span>
                  <h3 className="relative mt-5 font-display text-lg font-semibold text-forest-950">{p.t}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-forest-950/60">{p.b}</p>
                </div>
              </Tilt>
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
                className="group flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(10,31,20,0.45)]"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-signal/10 text-green-signal transition-colors duration-300 group-hover:bg-green-signal group-hover:text-white">
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

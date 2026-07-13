"use client";

/**
 * « Le parcours d'un lot » : timeline verticale animée au scroll qui remplace
 * l'ancienne grille « Comment ça marche ». La ligne centrale se dessine avec le
 * défilement (scaleY lié à useScroll), chaque étape s'allume en entrant dans le
 * viewport. Desktop : étapes alternées gauche/droite ; mobile : colonne à gauche.
 * Reduced-motion : ligne pleine, contenu visible sans animation.
 */

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Store, ShieldCheck, Handshake, Ship } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const EASE = [0.16, 1, 0.3, 1] as const;

const TR = {
  fr: {
    eyebrow: "Le parcours d'un lot",
    title: "De la parcelle au conteneur, sans angle mort.",
    steps: [
      { Icon: Store, t: "L'exportateur publie", b: "Depuis un dossier de traçabilité déjà constitué (parcelle → conteneur), le vendeur met un lot en vente avec son prix indicatif." },
      { Icon: ShieldCheck, t: "AGRIVO scelle", b: "Le lot n'est vendable que s'il porte le sceau : conformité des parcelles, carte producteur, intégrité des pesées, dossier complet." },
      { Icon: Handshake, t: "L'acheteur réserve en direct", b: "L'acheteur premium réserve le lot scellé ; AGRIVO prélève une commission sur la transaction, jamais sur le producteur." },
      { Icon: Ship, t: "Le lot embarque, la preuve suit", b: "Le dossier de confiance (parcelles, certificats, références DDR) accompagne le lot jusqu'au port : l'acheteur repart avec la preuve, pas une promesse." },
    ],
  },
  en: {
    eyebrow: "A lot's journey",
    title: "From plot to container, no blind spot.",
    steps: [
      { Icon: Store, t: "The exporter lists", b: "From an existing traceability file (plot → container), the seller lists a lot with an indicative price." },
      { Icon: ShieldCheck, t: "AGRIVO seals", b: "A lot can only be sold if it carries the seal: plot compliance, producer card, weighing integrity, complete file." },
      { Icon: Handshake, t: "The buyer reserves directly", b: "The premium buyer reserves the sealed lot; AGRIVO takes a commission on the transaction, never on the producer." },
      { Icon: Ship, t: "The lot ships, the proof follows", b: "The trust file (plots, certificates, DDS references) travels with the lot to the port: the buyer leaves with proof, not a promise." },
    ],
  },
} as const;

export function JourneyTimeline({ wrap = "mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12" }: { wrap?: string }) {
  const { lang } = useLanguage();
  const t = TR[lang === "en" ? "en" : "fr"];
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  // La ligne se dessine pendant que la timeline traverse l'écran.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 0.8", "end 0.45"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className={`${wrap} py-20 md:py-24`}>
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 22 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="eyebrow text-forest-950/45">{t.eyebrow}</span>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-forest-950 md:text-4xl">{t.title}</h2>
      </motion.div>

      <div ref={trackRef} className="relative mx-auto mt-14 max-w-4xl">
        {/* Rail : fond + ligne qui se dessine */}
        <div aria-hidden className="absolute bottom-4 left-[19px] top-4 w-px bg-black/[0.08] md:left-1/2 md:-translate-x-1/2" />
        <motion.div
          aria-hidden
          style={reduce ? undefined : { scaleY }}
          className="absolute bottom-4 left-[19px] top-4 w-px origin-top bg-gradient-to-b from-green-signal via-green-signal to-amber-cacao md:left-1/2 md:-translate-x-1/2"
        />

        <ol className="space-y-10 md:space-y-14">
          {t.steps.map((s, i) => {
            const right = i % 2 === 1; // desktop : alternance gauche/droite
            return (
              <li key={s.t} className="relative md:grid md:grid-cols-2 md:gap-14">
                {/* Nœud : icône qui s'allume */}
                <motion.span
                  initial={reduce ? undefined : { scale: 0.6, opacity: 0 }}
                  whileInView={reduce ? undefined : { scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-20% 0px" }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="absolute left-0 top-1 z-10 grid h-10 w-10 place-items-center rounded-full border border-green-signal/30 bg-white text-green-signal shadow-[0_0_0_5px_rgba(247,243,234,1),0_10px_30px_-10px_rgba(22,163,74,0.7)] md:left-1/2 md:-translate-x-1/2"
                >
                  <s.Icon size={17} />
                </motion.span>

                {/* Carte de l'étape */}
                <motion.div
                  initial={reduce ? undefined : { opacity: 0, y: 24 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className={`ml-14 md:ml-0 ${right ? "md:col-start-2 md:pl-2" : "md:pr-2 md:text-right"}`}
                >
                  <div className={`inline-block rounded-3xl border border-black/[0.06] bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(10,31,20,0.5)] ${right ? "" : "md:ml-auto"}`}>
                    <span className="num text-xs font-bold text-amber-cacao">0{i + 1}</span>
                    <h3 className="mt-2 font-display text-lg font-semibold text-forest-950">{s.t}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-forest-950/60">{s.b}</p>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

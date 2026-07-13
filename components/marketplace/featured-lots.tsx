"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsVedette } from "@/data/mock-marketplace";
import { LotCard } from "@/components/marketplace/lot-card";
import { useCocoaSpot } from "@/components/marketplace/cocoa-price";

/** Lots « à la une » — vitrine des lots scellés de plus forte valeur, entrée en cascade. */
const TR = {
  fr: { eyebrow: "À la une", title: "Lots scellés en vedette", all: "Voir tout le catalogue" },
  en: { eyebrow: "Featured", title: "Featured sealed lots", all: "See the full catalog" },
} as const;

export function FeaturedLots({ wrap = "mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12" }: { wrap?: string }) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion();
  const iceUsdT = useCocoaSpot();
  const lots = useMemo(() => lotsVedette(PARCELLES, 3), []);
  if (lots.length === 0) return null;

  return (
    <section className="border-b border-black/[0.06] bg-white">
      <div className={`${wrap} py-16`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow inline-flex items-center gap-1.5 text-green-signal"><Sparkles size={13} /> {t.eyebrow}</span>
            <h2 className="mt-2 font-display text-2xl font-semibold text-forest-950 md:text-3xl">{t.title}</h2>
          </div>
          <Link href="#catalogue" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-signal transition hover:gap-2.5">
            {t.all} <ArrowRight size={15} />
          </Link>
        </div>

        <motion.div
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {lots.map((lot) => (
            <motion.div key={lot.ref} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }}>
              <LotCard lot={lot} lang={l} iceUsdT={iceUsdT} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

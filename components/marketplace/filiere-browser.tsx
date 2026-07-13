"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { FILIERES } from "@/config/filieres";
import { PARCELLES } from "@/data/mock-parcelles";
import { comptageParFiliere } from "@/data/mock-marketplace";

/**
 * Navigateur par filière (les 7 denrées RDUE). Chaque carte affiche le nombre de lots au catalogue ;
 * une filière sans lot est marquée « bientôt ». Cliquer applique le filtre (via `onPick`).
 * Entrée en cascade (stagger), hover-lift.
 */
const TR = {
  fr: { title: "Parcourir par filière", sub: "Les 7 matières premières couvertes par le règlement européen (RDUE).", lots: (n: number) => `${n} lot${n > 1 ? "s" : ""}`, soon: "Bientôt" },
  en: { title: "Browse by commodity", sub: "The 7 commodities covered by the EU deforestation regulation (EUDR).", lots: (n: number) => `${n} lot${n > 1 ? "s" : ""}`, soon: "Soon" },
} as const;

export function FiliereBrowser({ onPick }: { onPick: (filiere: string) => void }) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion();
  const counts = useMemo(() => comptageParFiliere(PARCELLES), []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
      <h2 className="font-display text-2xl font-semibold text-forest-950 md:text-3xl">{t.title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-forest-950/55">{t.sub}</p>

      <motion.div
        className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      >
        {FILIERES.map((f) => {
          const n = counts[f.id] ?? 0;
          const has = n > 0;
          const Comp = has ? motion.button : motion.div;
          return (
            <Comp
              key={f.id}
              {...(has ? { onClick: () => onPick(f.id), type: "button" as const } : {})}
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }}
              whileHover={has && !reduce ? { y: -4 } : undefined}
              className={`group relative flex flex-col items-start overflow-hidden rounded-2xl border p-5 text-left transition-colors ${has ? "cursor-pointer border-black/[0.06] bg-white shadow-sm hover:border-green-signal/30" : "cursor-default border-dashed border-black/10 bg-white/50"}`}
            >
              <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: has ? f.couleur : "transparent" }} aria-hidden />
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${f.couleur}14`, color: f.couleur }}>
                <f.icone size={22} />
              </span>
              <h3 className="mt-3 font-display text-base font-semibold text-forest-950">{f.label}</h3>
              <p className="mt-0.5 text-xs text-forest-950/50">{f.position}</p>
              <span className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${has ? "text-green-signal" : "text-forest-950/40"}`}>
                {has ? <>{t.lots(n)} <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5" /></> : t.soon}
              </span>
            </Comp>
          );
        })}
      </motion.div>
    </section>
  );
}

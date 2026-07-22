"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Reveal } from "@/components/landing/reveal";

/** Mini-FAQ acheteur/vendeur — accordéon animé (AnimatePresence). Répond aux objections clés. */
const TR = {
  fr: {
    title: "Questions fréquentes",
    items: [
      { q: "Le sceau AGRIVO est-il une garantie ?", a: "Non. C'est une évaluation calculée depuis les données du lot (conformité satellite, carte producteur, intégrité de volume, dossier). Elle ne remplace pas la déclaration de diligence raisonnée (DDS) de l'opérateur au sens du règlement UE 2023/1115." },
      { q: "Pourquoi payer plus cher un lot scellé ?", a: "Parce que le marché le fait déjà : sur les contrats à terme, le cacao vérifié zéro déforestation se négocie 80 à 150 $ la tonne au-dessus du standard (presse sectorielle cacao, mai 2026). Et un lot sans dossier de traçabilité risque de rester à quai : le sceau achète la certitude que le lot passera la diligence raisonnée." },
      { q: "Comment se passe le paiement ?", a: "AGRIVO ne gère ni le paiement ni le financement. La marketplace met en relation acheteur et exportateur ; la transaction se règle en direct entre eux. AGRIVO fait le commerce des fèves, jamais le crédit." },
      { q: "Qui paie la commission ?", a: "La commission (1 à 3 % selon le lot) porte sur la transaction, côté commerce. Le producteur ne paie jamais." },
      { q: "Le cours du cacao affiché est-il en temps réel ?", a: "Il s'agit du cours ICE US (New York, contrat CC=F) réel mais différé d'environ 15 minutes, via une source publique. En cas d'indisponibilité, le dernier cours connu est affiché et clairement libellé." },
      { q: "Puis-je vendre d'autres filières que le cacao ?", a: "AGRIVO couvre les 7 matières premières du RDUE (cacao, café, hévéa, palmier, bovins, soja, bois). Le catalogue s'ouvre filière par filière ; le cacao et le café sont les premiers actifs." },
    ],
  },
  en: {
    title: "Frequently asked questions",
    items: [
      { q: "Is the AGRIVO seal a guarantee?", a: "No. It is an assessment computed from the lot's data (satellite compliance, producer card, volume integrity, file). It does not replace the operator's due diligence statement (DDS) under EU Regulation 2023/1115." },
      { q: "Why pay more for a sealed lot?", a: "Because the market already does: on forward contracts, verified deforestation-free cocoa trades 80 to 150 $ per tonne above standard grade (cocoa trade press, May 2026). And a lot without a traceability file risks staying at the quay: the seal buys the certainty that the lot will pass due diligence." },
      { q: "How does payment work?", a: "AGRIVO handles neither payment nor financing. The marketplace connects buyer and exporter; the transaction is settled directly between them. AGRIVO trades beans, never credit." },
      { q: "Who pays the commission?", a: "The commission (1 to 3% per lot) applies to the transaction, on the trade side. The producer never pays." },
      { q: "Is the displayed cocoa price real-time?", a: "It is the real ICE US price (New York, CC=F contract), delayed by about 15 minutes, from a public source. If unavailable, the last known price is shown and clearly labelled." },
      { q: "Can I sell commodities other than cocoa?", a: "AGRIVO covers the 7 EUDR commodities (cocoa, coffee, rubber, oil palm, cattle, soya, wood). The catalog opens commodity by commodity; cocoa and coffee are live first." },
    ],
  },
} as const;

export function MarketFaq() {
  const { lang } = useLanguage();
  const t = TR[lang === "en" ? "en" : "fr"];
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <Reveal><h2 className="text-center font-display text-2xl font-semibold text-forest-950 md:text-3xl">{t.title}</h2></Reveal>
      <div className="mt-8 space-y-3">
        {t.items.map((it, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={i} delay={i * 0.05}>
              <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-forest-950">{it.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-green-signal">
                    <Plus size={18} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-forest-950/65">{it.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

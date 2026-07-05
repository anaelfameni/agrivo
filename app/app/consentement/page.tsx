"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, MapPin, ScrollText, ShieldCheck } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const POINTS = [
  {
    Icon: MapPin,
    title: "Données de localisation",
    body: "Les coordonnées GPS de la parcelle sont analysées pour attester l'absence de déforestation, comme l'exige la réglementation européenne.",
  },
  {
    Icon: ScrollText,
    title: "Finalité unique",
    body: "Ces données servent exclusivement à l'évaluation de conformité et à la génération du certificat. Aucune revente, aucun autre usage.",
  },
  {
    Icon: ShieldCheck,
    title: "Souveraineté & droits",
    body: "Traitement conforme à la loi ivoirienne n°2013-450 sous contrôle de l'ARTCI. Le producteur conserve un droit d'accès et de retrait.",
  },
];

export default function ConsentementPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/app/dashboard"
        className="inline-flex w-fit items-center gap-1.5 rounded-full text-sm text-stone-500 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        <ArrowLeft size={15} strokeWidth={2} aria-hidden />
        Tableau de bord
      </Link>

      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_20px_60px_-30px_rgba(10,31,20,0.4)]"
      >
        {/* Bandeau confiance */}
        <div className="relative overflow-hidden border-b border-black/[0.06] bg-forest-950 px-6 py-7 text-white sm:px-8">
          <div className="glow-radial pointer-events-none absolute inset-0 opacity-70" aria-hidden />
          <div className="relative flex items-center gap-4">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{ background: "rgba(22,163,74,0.18)" }}
              aria-hidden
            >
              <ShieldCheck size={24} strokeWidth={1.75} className="text-green-signal" />
            </span>
            <div>
              <p className="eyebrow text-green-signal/90">Protection des données · ARTCI</p>
              <h1 className="mt-1 font-display text-2xl leading-tight sm:text-3xl">Avant de continuer</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-6 py-7 sm:px-8">
          <p className="max-w-prose text-[0.95rem] leading-relaxed text-stone-600">
            La vérification d&apos;une parcelle traite des données personnelles et de localisation du
            producteur. AGRIVO est conçu conforme dès le départ : voici précisément ce que cela implique.
          </p>

          <ul className="flex flex-col gap-4">
            {POINTS.map((pt) => (
              <li key={pt.title} className="flex gap-3.5">
                <span
                  className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: "rgba(22,163,74,0.10)" }}
                  aria-hidden
                >
                  <pt.Icon size={17} strokeWidth={2} className="text-green-signal" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-forest-950">{pt.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-stone-500">{pt.body}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Déclaration de consentement */}
          <div className="rounded-2xl border border-green-signal/20 bg-green-signal/[0.05] p-4">
            <p className="text-sm font-medium italic text-forest-800">
              « Le producteur a donné son consentement éclairé pour ce traitement. »
            </p>
          </div>

          {/* Case à cocher (obligatoire) */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-stone-300 bg-white text-white transition-colors peer-checked:border-green-signal peer-checked:bg-green-signal peer-focus-visible:ring-2 peer-focus-visible:ring-green-signal peer-focus-visible:ring-offset-2"
            >
              {agreed && <Check size={15} strokeWidth={3} />}
            </span>
            <span className="text-sm leading-relaxed text-forest-950">
              Je confirme avoir recueilli le consentement éclairé du producteur pour la vérification de sa
              parcelle, conformément à la loi n°2013-450 (ARTCI).
            </span>
          </label>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-black/[0.05] pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/app/dashboard"
              className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium text-stone-500 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              Annuler
            </Link>
            <button
              type="button"
              disabled={!agreed}
              aria-disabled={!agreed}
              onClick={() => agreed && router.push("/app/verifier")}
              className="btn-green group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuer
              <ArrowRight
                size={16}
                strokeWidth={2.25}
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

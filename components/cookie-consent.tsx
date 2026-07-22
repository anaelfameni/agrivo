"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cookie } from "lucide-react";

const KEY = "agrivo:cookie-consent";

/** Bandeau de consentement cookies, sobre et non bloquant. Mémorisé en localStorage. */
export function CookieConsent() {
  const reduce = useReducedMotion() ?? false;
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const decide = (v: "accepte" | "refuse") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-label="Consentement cookies"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl rounded-2xl border border-black/10 bg-white p-4 shadow-[0_20px_50px_-20px_rgba(10,31,20,0.35)] sm:flex sm:items-center sm:gap-4"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ivory-deep/60 text-amber-cacao">
              <Cookie size={18} />
            </span>
            <p className="text-sm text-stone-600">
              Nous utilisons des cookies strictement nécessaires au fonctionnement et, avec votre accord, à la
              mesure d&apos;audience.{" "}
              <a href="/confidentialite" className="font-medium text-forest-950 underline-offset-4 hover:underline">
                En savoir plus
              </a>
              .
            </p>
          </div>
          <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
            <button type="button" onClick={() => decide("refuse")} className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:text-forest-950">
              Refuser
            </button>
            <button type="button" onClick={() => decide("accepte")} className="rounded-full bg-forest-950 px-4 py-2 text-sm font-semibold text-white">
              Accepter
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

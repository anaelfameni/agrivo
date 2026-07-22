"use client";
/**
 * Entrée premium de la page d'accueil après l'écran de bienvenue.
 *
 * L'écran de bienvenue recouvre déjà la page et, à la sortie, REMONTE comme un rideau
 * (balayage vertical transform-only, voir splash-screen.tsx). PageReveal accompagne ce
 * balayage : le contenu de la page monte doucement depuis le bas, en parallaxe avec le
 * rideau qui s'efface — une seule et même motion, fluide.
 *
 * Déclenchement : évènement `agrivo:enter` (clic « Entrer ») ou flag sessionStorage
 * `agrivo_from_splash` au montage. prefers-reduced-motion : simple fondu d'opacité.
 */

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const KEY = "agrivo_from_splash";

export function PageReveal({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    const trigger = () => {
      try {
        sessionStorage.removeItem(KEY);
      } catch {
        /* ignore */
      }
      setRevealing(true);
    };
    let flagged = false;
    try {
      flagged = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* ignore */
    }
    if (flagged) trigger();
    window.addEventListener("agrivo:enter", trigger);
    return () => window.removeEventListener("agrivo:enter", trigger);
  }, []);

  if (reduced) {
    return (
      <motion.div
        initial={false}
        animate={revealing ? { opacity: [0, 1] } : { opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={revealing ? { opacity: [0, 1], y: [44, 0] } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.08, ease: EASE }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

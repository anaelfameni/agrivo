"use client";
import { motion, useReducedMotion } from "framer-motion";
/**
 * Transition de page de l'espace applicatif : chaque navigation remonte le template,
 * le contenu entre en fondu + léger glissement (240 ms). `prefers-reduced-motion` = fondu seul.
 * Discret par design (charte : rapide & discret hors moments signature).
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

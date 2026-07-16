"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/**
 * Bandeau hors connexion de l'espace applicatif : au bord du champ, le réseau tombe.
 * Le bandeau dit la vérité utile (« votre travail est enregistré sur cet appareil »)
 * puis confirme brièvement le retour du réseau. Discret, jamais bloquant, reduced-motion.
 */
const TR = {
  fr: {
    off: "Hors connexion : votre travail est enregistré sur cet appareil et reprendra ici.",
    back: "Connexion rétablie.",
  },
  en: {
    off: "Offline: your work is saved on this device and will resume here.",
    back: "Connection restored.",
  },
} as const;

export function BandeauHorsLigne() {
  const { lang } = useLanguage();
  const t = TR[lang === "en" ? "en" : "fr"];
  const reduce = useReducedMotion() ?? false;
  const [online, setOnline] = useState(true);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const off = () => {
      setOnline(false);
      setShowBack(false);
    };
    const on = () => {
      setOnline(true);
      setShowBack(true);
      const timer = setTimeout(() => setShowBack(false), 3500);
      return () => clearTimeout(timer);
    };
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    return () => {
      window.removeEventListener("offline", off);
      window.removeEventListener("online", on);
    };
  }, []);

  return (
    <AnimatePresence>
      {(!online || showBack) && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white ${
            online ? "bg-green-signal" : "bg-amber-cacao"
          }`}
        >
          {online ? <Wifi size={13} /> : <WifiOff size={13} />}
          {online ? t.back : t.off}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

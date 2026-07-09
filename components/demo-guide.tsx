"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Keyboard } from "lucide-react";

/**
 * Guide de démonstration présentateur — ouvert avec Ctrl+Shift+D (fermé : Échap ou clic extérieur).
 * Anti-sèche discrète pour le jury : déroulé des 5 étapes, comptes, phrases clés, plan B.
 * Invisible pour un visiteur normal ; aucun bouton ne le déclenche.
 */
const ETAPES = [
  { t: "1 · Connexion", d: "client@test.com / 123client123 (Amadou, Coopérative de Soubré). Un clic sur « Entrer avec le compte de démonstration »." },
  { t: "2 · Nouvelle vérification", d: "Dashboard → « Nouvelle vérification » → écran de consentement ARTCI (cocher, insister : conçu conforme dès le départ)." },
  { t: "3 · Scan de la carte", d: "Sur mobile : viser la carte producteur (lecture automatique pré-remplit). Sur desktop : « Saisir manuellement » ou « Remplir un exemple (démo) »." },
  { t: "4 · Analyse satellite", d: "LE moment signature : le polygone se dessine, le moteur satellite (FAO) rend le verdict, badge sols, certificat PDF téléchargeable (QR de vérification publique)." },
  { t: "5 · Valorisation", d: "Si Conforme : la parcelle rejoint le dossier de la coopérative → « Partager le dossier avec l'exportateur ». Dire « primes de durabilité et acheteurs premium », jamais crédit ni financement." },
];

const PHRASES = [
  "« Nous combinons l'outil de référence de la FAO pour la détection, et une IA générative pour rendre la conformité compréhensible par tous. »",
  "« Que la Côte d'Ivoire soit à risque standard ou élevé, la géolocalisation complète reste obligatoire pour le cacao ivoirien. »",
  "« C'est une évaluation, pas une garantie : l'opérateur reste responsable de sa déclaration. »",
];

export function DemoGuide() {
  const [open, setOpen] = useState(false);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      setOpen((o) => !o);
    }
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9990] flex items-center justify-center bg-forest-950/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Guide de démonstration"
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-forest-950 p-6 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50">
                  <Keyboard className="h-4 w-4" strokeWidth={1.75} aria-hidden /> Guide présentateur · Ctrl+Shift+D
                </p>
                <h2 className="font-display mt-1 text-xl font-semibold">Déroulé de la démonstration</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <ol className="mt-5 space-y-3">
              {ETAPES.map((e) => (
                <li key={e.t} className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                  <p className="text-sm font-semibold text-emerald-300">{e.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/75">{e.d}</p>
                </li>
              ))}
            </ol>

            <h3 className="mt-6 text-[11px] uppercase tracking-widest text-white/50">Phrases clés jury</h3>
            <ul className="mt-2 space-y-2">
              {PHRASES.map((p) => (
                <li key={p} className="text-sm italic leading-relaxed text-white/75">{p}</li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-amber-soft/30 bg-amber-soft/10 p-3.5 text-sm leading-relaxed text-amber-soft">
              Plan B : si le live plante, basculer sur la vidéo de secours (voir GUIDE_DEMO_JURY.md).
              Le MOCK_MODE garantit qu&apos;aucune étape ne dépend du réseau. Compte admin :
              admin@agrivo.com / 123admin123. Vérification publique : /verifier-certificat.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

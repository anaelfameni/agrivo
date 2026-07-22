"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Terme technique avec définition en popover léger (survol + focus clavier).
 * Accessible : bouton focusable, aria-describedby, fermeture à Échap.
 */
export function Term({ children, def }: { children: React.ReactNode; def: string }) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="cursor-help font-medium text-forest-950 underline decoration-dotted decoration-amber-cacao/70 decoration-2 underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2"
      >
        {children}
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-xl border border-black/[0.08] bg-forest-950 px-4 py-3 text-left text-xs font-normal leading-relaxed text-white/85 shadow-[0_20px_50px_-20px_rgba(10,31,20,0.6)]"
          >
            {def}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-forest-950" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

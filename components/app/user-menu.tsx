"use client";

/**
 * Menu utilisateur de l'espace /app : avatar à initiales + panneau (nom, e-mail, organisation)
 * et action « Se déconnecter ». Pilotable au clic extérieur / Échap. Respecte reduced-motion.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";

function initials(nom: string): string {
  const parts = nom.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const out = parts.map((s) => s[0]?.toUpperCase() ?? "").join("");
  return out || "AG";
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 py-1 pl-1 pr-2 text-sm outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-forest-950 text-[11px] font-semibold text-white">
          {initials(user.nom)}
        </span>
        <span className="hidden max-w-[9rem] truncate text-forest-950 sm:inline">{user.nom}</span>
        <ChevronDown size={14} className="text-stone-400" aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_20px_50px_-20px_rgba(10,31,20,0.35)]"
          >
            <div className="border-b border-black/[0.06] px-4 py-3">
              <div className="text-sm font-semibold text-forest-950">{user.nom}</div>
              <div className="truncate text-xs text-stone-500">{user.email}</div>
              <div className="mt-0.5 truncate text-xs text-stone-400">{user.organisation}</div>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                logout();
                setOpen(false);
                router.push("/");
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-stone-600 outline-none transition-colors hover:bg-ivory-deep/60 hover:text-forest-950 focus-visible:bg-ivory-deep/60"
            >
              <LogOut size={15} aria-hidden /> {lang === "en" ? "Sign out" : "Se déconnecter"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

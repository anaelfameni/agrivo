"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, ShoppingBag, Store, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AGRIVO_PIN_PATH, AGRIVO_LEAF_PATH, AGRIVO_GLOSS_PATH, AGRIVO_VEIN_PATH } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";

/**
 * En-tête de AGRIVO MARKET (v2.5) : UN SEUL état, LIQUID GLASS clair (`.liquid-glass-light`),
 * identique en haut de page et au défilement. Chrome PROPRE, dédié à la place de marché
 * (≠ site vitrine et ≠ espace applicatif). Un lien discret ramène au site principal.
 */

const NAV = [
  { href: "/marketplace", fr: "Parcourir", en: "Browse" },
  { href: "/marketplace/vendre", fr: "Vendre", en: "Sell" },
] as const;

const TR = {
  fr: { home: "AGRIVO Market · accueil", nav: "Navigation AGRIVO Market", login: "Connexion", mesLots: "Mes lots", site: "agrivo.io", open: "Ouvrir le menu", close: "Fermer le menu" },
  en: { home: "AGRIVO Market · home", nav: "AGRIVO Market navigation", login: "Log in", mesLots: "My lots", site: "agrivo.io", open: "Open menu", close: "Close menu" },
} as const;

/** Lockup de marque « AGRIVO Market » (pin AGRIVO + wordmark), version claire. */
function MarketWordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <defs>
          <linearGradient id="mkt-pin" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22c55e" />
            <stop offset="1" stopColor="#0f5a2e" />
          </linearGradient>
          <linearGradient id="mkt-leaf" x1="8.5" y1="12.4" x2="15.5" y2="5.6" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ecc06e" />
            <stop offset="1" stopColor="#c8861d" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="#16a34a" opacity="0.14" />
        <path d={AGRIVO_PIN_PATH} fill="url(#mkt-pin)" />
        <path d={AGRIVO_GLOSS_PATH} stroke="#eafff2" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d={AGRIVO_LEAF_PATH} fill="url(#mkt-leaf)" />
        <path d={AGRIVO_VEIN_PATH} stroke="#fff7e6" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.6" />
      </svg>
      <span className="font-brand-serif text-xl not-italic text-forest-950" style={{ fontWeight: 600 }}>
        Agrivo <span className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.22em] text-green-signal align-middle">Market</span>
      </span>
    </span>
  );
}

export function MarketHeader() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();
  const t = TR[lang === "en" ? "en" : "fr"];
  const isActive = (href: string) => (href === "/marketplace" ? pathname === href : pathname.startsWith(href));

  return (
    <header className="liquid-glass-light sticky top-0 z-50">
      <div className="mx-auto flex h-16 w-full max-w-[1760px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <Link href="/marketplace" aria-label={t.home} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-green-signal/60">
          <MarketWordmark />
        </Link>

        <nav aria-label={t.nav} className="hidden items-center gap-8 text-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`relative transition-colors ${isActive(item.href) ? "text-forest-950" : "text-stone-500 hover:text-forest-950"}`}
            >
              {item[lang === "en" ? "en" : "fr"]}
              {isActive(item.href) && <span className="absolute -bottom-[21px] left-0 h-0.5 w-full rounded-full bg-green-signal" aria-hidden />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/" className="hidden items-center gap-1 text-xs font-medium text-stone-400 transition-colors hover:text-forest-950 lg:inline-flex">
            {t.site} <ArrowUpRight size={12} />
          </Link>
          <LanguageSwitcher tone="dark" />
          {user ? (
            <Link href="/app/exportateur/marketplace" className="hidden items-center gap-2 rounded-full bg-green-signal px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-signal/90 md:inline-flex">
              <Store size={15} /> {t.mesLots}
            </Link>
          ) : (
            <Link href="/connexion" className="hidden items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-forest-950 transition hover:bg-black/[0.04] md:inline-flex">
              <ShoppingBag size={15} /> {t.login}
            </Link>
          )}
          <button
            type="button"
            aria-label={open ? t.close : t.open}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-forest-950 transition-colors hover:bg-black/5 md:hidden"
          >
            {open ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label={t.nav}
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-black/[0.06] bg-ivory md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-black/[0.03] hover:text-forest-950"
                >
                  {item[lang === "en" ? "en" : "fr"]}
                </Link>
              ))}
              <Link
                href={user ? "/app/exportateur/marketplace" : "/connexion"}
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-5 py-3 text-sm font-semibold text-white"
              >
                {user ? <><Store size={15} /> {t.mesLots}</> : <><ShoppingBag size={15} /> {t.login}</>}
              </Link>
              <Link href="/" onClick={() => setOpen(false)} className="mt-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-stone-400">
                {t.site} <ArrowUpRight size={12} />
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

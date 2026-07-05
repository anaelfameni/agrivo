"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";

const NAV_HREFS = ["/methodologie", "/a-propos", "/tarifs", "/faq"] as const;
const NAV_LABELS = {
  fr: ["Méthodologie", "À propos", "Tarifs", "FAQ"],
  en: ["Method", "About", "Pricing", "FAQ"],
} as const;
const HEADER_TR = {
  fr: { dashboard: "Tableau de bord", login: "Connexion", signup: "Créer un compte", home: "Agrivo — accueil", nav: "Navigation principale", navMobile: "Navigation principale (mobile)", openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu" },
  en: { dashboard: "Dashboard", login: "Log in", signup: "Create account", home: "Agrivo — home", nav: "Main navigation", navMobile: "Main navigation (mobile)", openMenu: "Open menu", closeMenu: "Close menu" },
} as const;

/**
 * En-tête partagé du site vitrine.
 * variant "overlay" : transparent, texte blanc, posé sur le hero sombre (landing).
 * variant "solid"   : collant, fond ivoire flouté, texte forêt (pages intérieures claires).
 */
export function SiteHeader({ variant = "solid" }: { variant?: "overlay" | "solid" }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const reduce = useReducedMotion();
  const overlay = variant === "overlay";
  const isActive = (href: string) => pathname === href;
  const t = HEADER_TR[lang === "en" ? "en" : "fr"];
  const labels = NAV_LABELS[lang === "en" ? "en" : "fr"];
  const NAV = NAV_HREFS.map((href, i) => ({ href, label: labels[i] }));

  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-50"
          : "sticky top-0 z-50 border-b border-black/[0.06] bg-ivory/85 backdrop-blur-md"
      }
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:px-8 lg:px-12">
        <Link
          href="/"
          aria-label={t.home}
          className={`rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${overlay ? "text-white focus-visible:ring-white/70 focus-visible:ring-offset-forest-950" : "text-forest-950 focus-visible:ring-green-signal focus-visible:ring-offset-ivory"}`}
        >
          <Logo />
        </Link>

        <nav aria-label={t.nav} className="hidden items-center gap-8 text-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={
                overlay
                  ? `transition-colors ${isActive(item.href) ? "text-white" : "text-white/65 hover:text-white"}`
                  : `transition-colors ${isActive(item.href) ? "text-forest-950" : "text-stone-500 hover:text-forest-950"}`
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher tone={overlay ? "light" : "dark"} />
          {user ? (
            <Link
              href="/app/dashboard"
              className={`hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105 active:scale-95 md:inline-flex ${overlay ? "bg-white text-forest-950 shadow-lg shadow-black/20" : "bg-forest-950 text-white"}`}
            >
              {t.dashboard} <ArrowRight size={14} />
            </Link>
          ) : (
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/connexion"
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${overlay ? "text-white/80 hover:text-white" : "text-stone-600 hover:text-forest-950"}`}
              >
                {t.login}
              </Link>
              <Link
                href="/inscription"
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105 active:scale-95 ${overlay ? "bg-white text-forest-950 shadow-lg shadow-black/20" : "bg-forest-950 text-white"}`}
              >
                {t.signup} <ArrowRight size={14} />
              </Link>
            </div>
          )}
          <button
            type="button"
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors md:hidden ${overlay ? "text-white hover:bg-white/10" : "text-forest-950 hover:bg-black/5"}`}
          >
            {mobileOpen ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            aria-label={t.navMobile}
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-black/[0.06] bg-ivory md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-ivory-deep/60 hover:text-forest-950"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <Link
                  href="/app/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-forest-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {t.dashboard} <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/connexion"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-ivory-deep/60 hover:text-forest-950"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-950 px-5 py-3 text-sm font-semibold text-white"
                  >
                    {t.signup} <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

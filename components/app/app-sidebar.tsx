"use client";

/**
 * Navigation de l'espace applicatif AGRIVO. Sidebar verticale sur desktop, barre horizontale
 * défilante sur mobile. La vue courante (usePathname) est signalée par un fond vert qui GLISSE
 * d'un item à l'autre (framer-motion layoutId) + une puce d'icône verte pleine : l'identité de
 * marque (vert) est réaffirmée dans toute la navigation.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Map, Globe, Settings, ShieldCheck, type LucideIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const NAV: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/app/dashboard", label: "Vue d'ensemble", Icon: LayoutDashboard },
  { href: "/app/producteurs", label: "Producteurs", Icon: Users },
  { href: "/app/parcelles", label: "Parcelles", Icon: Map },
  { href: "/app/exportateur", label: "Exportateur", Icon: Globe },
  { href: "/app/parametres", label: "Paramètres", Icon: Settings },
];

const ADMIN_ITEM = { href: "/app/admin", label: "Admin", Icon: ShieldCheck };

const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

function useIsActive() {
  const path = usePathname() ?? "";
  return (href: string) => path === href || path.startsWith(href + "/");
}

/** NAV enrichie de l'entrée « Admin » uniquement pour le rôle admin. */
function useNav() {
  const { user } = useAuth();
  return user?.role === "admin" ? [...NAV, ADMIN_ITEM] : NAV;
}

export function AppSidebar() {
  const isActive = useIsActive();
  const nav = useNav();
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="sticky top-24 flex flex-col gap-1.5" aria-label="Navigation de l'espace">
        {nav.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory ${
                active ? "text-forest-950" : "text-stone-500 hover:text-forest-950"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="app-nav-active"
                  transition={SPRING}
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-xl border border-green-signal/25 bg-gradient-to-r from-green-signal/16 via-green-signal/[0.07] to-transparent shadow-[0_10px_24px_-16px_rgba(22,163,74,0.6)]"
                />
              )}
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-300 ${
                  active
                    ? "bg-green-signal text-white shadow-[0_8px_18px_-6px_rgba(22,163,74,0.85)]"
                    : "bg-ivory-deep/70 text-stone-500 group-hover:bg-green-signal/12 group-hover:text-green-signal"
                }`}
              >
                <Icon size={16} strokeWidth={2} aria-hidden />
              </span>
              {label}
            </Link>
          );
        })}

        {/* Signature discrète bas de sidebar */}
        <div className="mt-4 rounded-xl border border-green-signal/15 bg-green-signal/[0.05] p-3">
          <p className="text-xs font-semibold text-forest-950">Prêt pour le RDUE</p>
          <p className="mt-0.5 text-[11px] leading-snug text-stone-500">
            Chaque parcelle vérifiée, chaque certificat prêt pour TRACES NT.
          </p>
        </div>
      </nav>
    </aside>
  );
}

export function AppMobileNav() {
  const isActive = useIsActive();
  const nav = useNav();
  return (
    <nav
      aria-label="Navigation de l'espace"
      className="sticky top-16 z-30 -mx-5 flex gap-1.5 overflow-x-auto border-b border-black/[0.06] bg-ivory/90 px-5 py-2.5 backdrop-blur md:hidden"
    >
      {nav.map(({ href, label, Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold outline-none transition-colors ${
              active ? "text-white" : "border border-black/[0.06] bg-white text-stone-600"
            }`}
          >
            {active && (
              <motion.span
                layoutId="app-nav-active-mobile"
                transition={SPRING}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-green-signal to-[#0f7f39] shadow-[0_8px_18px_-8px_rgba(22,163,74,0.9)]"
              />
            )}
            <Icon size={14} aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

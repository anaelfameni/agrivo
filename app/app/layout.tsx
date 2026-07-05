import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { AppSidebar, AppMobileNav } from "@/components/app/app-sidebar";
import { RouteGuard } from "@/components/app/route-guard";
import { UserMenu } from "@/components/app/user-menu";
import { BackToSiteLink } from "@/components/app/back-to-site-link";
import { AppEyebrow } from "@/components/app/app-eyebrow";
import { BRAND_NAME } from "@/config/brand";

/**
 * Coquille de l'espace applicatif AGRIVO (dashboard coopérative, parcelle, consentement,
 * parcours). Fond ivoire, topbar sobre : la navbar du site vitrine n'apparaît jamais ici.
 * Composant serveur — la seule île client est le sélecteur de langue.
 */
export const metadata: Metadata = {
  title: `Espace coopérative · ${BRAND_NAME}`,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
    <div className="relative min-h-dvh bg-ivory text-forest-950">
      {/* Aurore de marque : halos vert/or + grille discrète — le fond n'est plus jamais plat. */}
      <div aria-hidden className="app-aurora pointer-events-none fixed inset-0 -z-10" />

      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-ivory/75 backdrop-blur-xl">
        {/* Fine ligne verte : signature de marque sous la topbar */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-signal/45 to-transparent" />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/app/dashboard"
              aria-label={`${BRAND_NAME} · tableau de bord`}
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              <Logo />
            </Link>
            <span aria-hidden className="hidden h-5 w-px bg-black/10 sm:block" />
            <AppEyebrow />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitcher tone="dark" />
            <UserMenu />
            <BackToSiteLink label="Site" />
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 pb-24 md:px-8">
        <AppMobileNav />
        <div className="flex gap-6 pt-4 md:pt-9">
          <AppSidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
    </RouteGuard>
  );
}

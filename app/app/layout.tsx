import type { Metadata } from "next";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { AppSidebar, AppMobileNav } from "@/components/app/app-sidebar";
import { RouteGuard } from "@/components/app/route-guard";
import { UserMenu } from "@/components/app/user-menu";
import { TourButton } from "@/components/app/tour-button";
import { OnboardingTour } from "@/components/app/onboarding-tour";
import { AppHomeLink } from "@/components/app/app-home-link";
import { CopiloteRdue } from "@/components/app/copilote-rdue";
import { BackToSiteLink } from "@/components/app/back-to-site-link";
import { BandeauHorsLigne } from "@/components/app/bandeau-hors-ligne";
import { AppEyebrow } from "@/components/app/app-eyebrow";
import { BRAND_NAME } from "@/config/brand";

/**
 * Coquille de l'espace applicatif AGRIVO (dashboards coopérative & exportateur, parcelle,
 * consentement, parcours). Fond ivoire, topbar sobre : la navbar du site vitrine n'apparaît
 * jamais ici. Composant serveur — les îlots clients sont le sélecteur de langue, le logo
 * route-aware, le guide interactif et l'Assistant AGRIVO (présent sur TOUTES les pages).
 */
export const metadata: Metadata = {
  title: `Espace · ${BRAND_NAME}`,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
    <div className="relative min-h-dvh bg-ivory text-forest-950">
      {/* Bandeau hors connexion : le travail terrain est enregistré sur l'appareil. */}
      <BandeauHorsLigne />
      {/* Aurore de marque : halos vert/or + grille discrète, le fond n'est plus jamais plat. */}
      <div aria-hidden className="app-aurora pointer-events-none fixed inset-0 -z-10" />

      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-ivory/75 backdrop-blur-xl">
        {/* Fine ligne verte : signature de marque sous la topbar */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-signal/45 to-transparent" />
        <div className="flex h-16 w-full items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <AppHomeLink />
            <span aria-hidden className="hidden h-5 w-px bg-black/10 sm:block" />
            <AppEyebrow />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <TourButton />
            <LanguageSwitcher tone="dark" />
            <UserMenu />
            <BackToSiteLink label="Retour à la page d'accueil" />
          </div>
        </div>
      </header>

      <div className="relative w-full px-5 pb-24 md:px-8">
        <AppMobileNav />
        <div className="flex gap-6 pt-4 md:pt-9">
          <AppSidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      {/* Guide interactif d'accueil (1re visite + bouton « ? ») */}
      <OnboardingTour />
      {/* L'Assistant AGRIVO suit l'utilisateur sur TOUTES les pages de l'espace */}
      <CopiloteRdue />
    </div>
    </RouteGuard>
  );
}

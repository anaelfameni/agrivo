"use client";

/**
 * Garde les routes /app/* : redirige vers /connexion tant que l'utilisateur n'est pas connecté,
 * en mémorisant la route demandée (?redirect=). Affiche un écran de chargement on-brand le temps
 * de l'hydratation, pour ne jamais laisser filtrer le contenu protégé.
 */

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";

/** Pages accessibles au rôle EXPORTATEUR (son tableau de bord + ses paramètres). Toute autre
 *  page /app/* le renvoie vers son espace : il ne voit jamais l'espace coopérative. */
const EXPORTER_ALLOWED = ["/app/exportateur", "/app/parametres"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const exporterBlocked =
    !!user &&
    user.role === "exporter" &&
    !EXPORTER_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"));

  React.useEffect(() => {
    if (!loading && !user) {
      const redirect = encodeURIComponent(pathname || "/app/dashboard");
      router.replace(`/connexion?redirect=${redirect}`);
    }
  }, [loading, user, pathname, router]);

  React.useEffect(() => {
    if (!loading && exporterBlocked) router.replace("/app/exportateur");
  }, [loading, exporterBlocked, router]);

  if (loading || !user || exporterBlocked) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ivory text-forest-950">
        <div className="flex flex-col items-center gap-3">
          <span className="glow-pulse">
            <Logo size={30} showWord={false} />
          </span>
          <span className="text-sm text-stone-500">
            {lang === "en" ? "Loading your workspace…" : "Chargement de votre espace…"}
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

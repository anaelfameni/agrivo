"use client";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useAuth, landingFor } from "@/components/auth-provider";
import { BRAND_NAME } from "@/config/brand";
/** Logo de la topbar /app : mène à l'accueil de l'ESPACE de l'utilisateur
 * (tableau de bord coopérative ou exportateur, selon le rôle). */
export function AppHomeLink() {
  const { user } = useAuth();
  return (
    <Link
      href={landingFor(user?.role)}
      aria-label={`${BRAND_NAME} · tableau de bord`}
      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
    >
      <Logo />
    </Link>
  );
}

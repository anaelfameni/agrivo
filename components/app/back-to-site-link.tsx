"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Lien « Site » de la topbar de l'espace applicatif → page d'accueil.
 * Pose un drapeau de session pour que <SplashScreen> NE réaffiche PAS l'écran de bienvenue :
 * l'utilisateur qui revient depuis son espace arrive directement sur l'accueil.
 */
export function BackToSiteLink({ label }: { label: string }) {
  const skipSplash = () => {
    try {
      sessionStorage.setItem("agrivo_skip_splash", "1");
    } catch {
      /* stockage indisponible */
    }
  };

  return (
    <Link
      href="/"
      onClick={skipSplash}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/10 px-3.5 text-sm text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
    >
      <ArrowLeft size={14} strokeWidth={2} aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

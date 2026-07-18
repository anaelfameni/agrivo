"use client";

/**
 * Identité + déconnexion de la topbar /app : avatar à initiales + nom, suivis d'un bouton
 * « Déconnexion » VISIBLE (plus de menu déroulant — la déconnexion est à un clic, à côté du nom).
 * L'e-mail et l'organisation restent consultables dans /app/parametres.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
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

  if (!user) return null;

  const firstName = user.nom.trim().split(/\s+/)[0] || user.nom;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 py-1 pl-1 pr-1 sm:pr-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-forest-950 text-[11px] font-semibold text-white">
          {initials(user.nom)}
        </span>
        <span className="hidden max-w-[9rem] truncate text-sm text-forest-950 sm:inline">{firstName}</span>
      </span>

      <button
        type="button"
        data-tour="deconnexion"
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-2.5 text-sm text-stone-600 outline-none transition-colors hover:border-red-block/40 hover:text-red-block focus-visible:ring-2 focus-visible:ring-red-block/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory sm:px-3.5"
      >
        <LogOut size={15} strokeWidth={2} aria-hidden />
        <span className="hidden sm:inline">{lang === "en" ? "Sign out" : "Déconnexion"}</span>
      </button>
    </div>
  );
}

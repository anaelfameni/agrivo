"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useLanguage } from "@/components/language-provider";

const COLS_FR = [
  { title: "Produit", links: [{ label: "Méthodologie", href: "/methodologie" }, { label: "Tarifs", href: "/tarifs" }, { label: "Application mobile", href: "/application" }, { label: "Vérifier un certificat", href: "/verifier-certificat" }, { label: "Tableau de bord", href: "/app/dashboard" }] },
  { title: "Ressources", links: [{ label: "FAQ", href: "/faq" }, { label: "Centre d'aide", href: "/aide" }, { label: "À propos", href: "/a-propos" }, { label: "État des services", href: "/status" }, { label: "Contact", href: "/contact" }] },
  { title: "Légal", links: [{ label: "Vos données", href: "/vos-donnees" }, { label: "Confidentialité", href: "/confidentialite" }, { label: "Conditions d'utilisation", href: "/cgu" }, { label: "Mentions légales", href: "/mentions-legales" }] },
];

const COLS_EN = [
  { title: "Product", links: [{ label: "Method", href: "/methodologie" }, { label: "Pricing", href: "/tarifs" }, { label: "Mobile app", href: "/application" }, { label: "Verify a certificate", href: "/verifier-certificat" }, { label: "Dashboard", href: "/app/dashboard" }] },
  { title: "Resources", links: [{ label: "FAQ", href: "/faq" }, { label: "Help center", href: "/aide" }, { label: "About", href: "/a-propos" }, { label: "Service status", href: "/status" }, { label: "Contact", href: "/contact" }] },
  { title: "Legal", links: [{ label: "Your data", href: "/vos-donnees" }, { label: "Privacy", href: "/confidentialite" }, { label: "Terms of use", href: "/cgu" }, { label: "Legal notice", href: "/mentions-legales" }] },
];

const FOOTER_TR = {
  fr: {
    tagline: "La conformité agricole, simplifiée. Vérifier une parcelle, prouver la conformité, négocier la prime.",
    rights: "Agrivo © 2026. Tous droits réservés.",
    reg: "RDUE · Règlement (UE) 2023/1115 · échéance 30 décembre 2026",
  },
  en: {
    tagline: "Agricultural compliance, simplified. Verify a plot, prove compliance, negotiate the premium.",
    rights: "Agrivo © 2026. All rights reserved.",
    reg: "EUDR · Regulation (EU) 2023/1115 · deadline 30 December 2026",
  },
};

/** Pied de page partagé des pages du site vitrine. */
export function SiteFooter() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const cols = en ? COLS_EN : COLS_FR;
  const t = FOOTER_TR[en ? "en" : "fr"];
  return (
    <footer className="bg-forest-950 text-white/70">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-white/55">{t.tagline}</p>
            <a href="mailto:support@agrivo.ci" className="num mt-3 inline-block text-sm text-white/65 transition-colors hover:text-white">
              support@agrivo.ci
            </a>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold text-white">{col.title}</div>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/65 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>{t.rights}</span>
          <span className="num">{t.reg}</span>
        </div>
      </div>
    </footer>
  );
}

import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/** Coquille « document » partagée des pages légales/crédibilité (en-tête, titre, prose, footer). */
export function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated?: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-16 md:px-8 md:pt-20">
        <p className="eyebrow text-amber-cacao">Informations légales</p>
        <h1 className="mt-3 font-display text-4xl text-forest-950">{title}</h1>
        {updated && <p className="num mt-2 text-xs text-stone-500">Dernière mise à jour : {updated}</p>}
        {intro && <p className="mt-6 leading-relaxed text-stone-600">{intro}</p>}
        <div className="mt-8 flex flex-col gap-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-forest-950">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-stone-600">{children}</div>
    </section>
  );
}

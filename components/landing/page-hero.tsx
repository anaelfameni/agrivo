"use client";
import type { ReactNode } from "react";
import { HeroBg } from "@/components/landing/hero-bg";
import { Reveal } from "@/components/landing/reveal";

/**
 * Hero unifié des pages intérieures (Méthodologie, À propos, Tarifs) : même fond signature
 * que le hero de la page d'accueil (forest-950 + mesh gradients + grille + grain), texte
 * blanc. Se pose sous un <SiteHeader variant="overlay" /> — le padding haut absorbe l'en-tête.
 */
export function PageHero({
  eyebrow,
  title,
  sub,
  center = false,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  center?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-forest-950 text-white">
      <HeroBg />
      <div className={`relative mx-auto max-w-3xl px-6 pb-16 pt-32 md:px-8 ${center ? "text-center" : ""}`}>
        <Reveal>
          <span className="eyebrow text-amber-soft">{eyebrow}</span>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
          {sub && <p className={`mt-5 text-lg leading-relaxed text-white/70 ${center ? "mx-auto max-w-xl" : "max-w-2xl"}`}>{sub}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}

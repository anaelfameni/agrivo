"use client";

/**
 * Fond signature du HERO de la page d'accueil — mesh gradients animés (orbes lents, GPU),
 * grille masquée et grain — réutilisé par les sections sombres de l'accueil et par les
 * heros des pages intérieures (Méthodologie, À propos, Tarifs) pour une identité unifiée.
 */
export function HeroBg() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="mesh-a absolute -left-[12%] top-[-18%] h-[620px] w-[620px] rounded-full bg-green-signal/20 blur-[120px]" />
      <div className="mesh-b absolute right-[-10%] top-[8%] h-[500px] w-[500px] rounded-full bg-amber-cacao/15 blur-[120px]" />
      <div className="mesh-c absolute bottom-[-22%] left-[28%] h-[540px] w-[540px] rounded-full bg-forest-700/45 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 75% 60% at 40% 35%, #000 20%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 60% at 40% 35%, #000 20%, transparent 78%)",
        }}
      />
      <div className="grain absolute inset-0 opacity-[0.05]" />
    </div>
  );
}

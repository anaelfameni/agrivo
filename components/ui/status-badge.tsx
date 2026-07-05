import { CircleCheck, TriangleAlert, CloudOff } from "lucide-react";
import { STATUT_LABEL, type Statut } from "@/data/mock-parcelles";

/**
 * Pastille de statut (charte AGRIVO). Réutilisée par le dashboard coopérative (Prompt 3),
 * le parcours (Prompt 4) et le dashboard exportateur (Prompt 5).
 *
 * Statuts figés : « Conforme » · « Anomalie détectée » · « Données insuffisantes ».
 * Le sens n'est JAMAIS porté par la couleur seule : icône + libellé texte toujours présents
 * (règle a11y color-not-only). Texte foncé sur teinte claire → contraste AAA.
 * Module PUR (pas de "use client") : utilisable dans un composant serveur.
 */
const STYLE: Record<Statut, { bg: string; text: string; icon: string; Icon: typeof CircleCheck }> = {
  conforme: { bg: "rgba(22,163,74,0.13)", text: "#0d4f27", icon: "var(--color-green-signal)", Icon: CircleCheck },
  anomalie: { bg: "rgba(180,35,30,0.12)", text: "#8a1712", icon: "var(--color-red-block)", Icon: TriangleAlert },
  insuffisant: { bg: "rgba(200,134,29,0.16)", text: "#6b4610", icon: "var(--color-amber-cacao)", Icon: CloudOff },
};

export function StatusBadge({
  statut,
  size = "md",
  className = "",
}: {
  statut: Statut;
  size?: "sm" | "md";
  className?: string;
}) {
  const s = STYLE[statut];
  const compact = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ${
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[0.8125rem]"
      } ${className}`}
      style={{ background: s.bg, color: s.text }}
    >
      <s.Icon size={compact ? 13 : 15} strokeWidth={2.25} aria-hidden style={{ color: s.icon }} />
      {STATUT_LABEL[statut]}
    </span>
  );
}

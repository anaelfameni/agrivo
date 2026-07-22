import { AGRIVO_PIN_PATH, AGRIVO_LEAF_PATH } from "@/components/ui/logo";

/**
 * Glyphe signature AGRIVO en monochrome : le repère (pin) portant sa feuille.
 * Sert de marqueur d'état (statut, alerte), d'indicateur de chargement (`pulse`),
 * et de marqueur de carte. Module PUR (pas de "use client") : réutilisable côté serveur.
 *
 * `color` teinte le pin ; `leafColor` la feuille (défaut : blanc translucide pour lisibilité
 * sur un pin coloré). En variante « alerte », passer color = red-block.
 */
export function PinMark({
  size = 20,
  color = "var(--color-green-signal)",
  leafColor = "rgba(255,255,255,0.9)",
  pulse = false,
  className = "",
}: {
  size?: number;
  color?: string;
  leafColor?: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`${pulse ? "subtle-pulse" : ""} ${className}`}
    >
      <path d={AGRIVO_PIN_PATH} fill={color} />
      <path d={AGRIVO_LEAF_PATH} fill={leafColor} />
    </svg>
  );
}

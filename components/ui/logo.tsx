import { BRAND_NAME } from "@/config/brand";

/**
 * Logo AGRIVO — « la culture géolocalisée ».
 *
 * Un repère de géolocalisation (pin) portant une feuille inclinée Or, en volume : dégradés
 * (vert clair→forêt, or clair→cacao), reflet glossy sur le bord du pin, nervure claire.
 * Vert Cacaoyer + Or Récolte, lisible dès 16 px. Version animée (tracé + reflet scintillant +
 * éclat) sur l'écran de bienvenue : voir <SplashLogo> dans splash-screen.tsx.
 *
 * IDs de dégradé fixes : plusieurs <Logo> sur une page référencent la même définition (identique),
 * ce qui rend correctement sans collision.
 */
export const AGRIVO_PIN_PATH =
  "M12 21 C 12 21 5.5 14.6 5.5 9.5 A 6.5 6.5 0 1 1 18.5 9.5 C 18.5 14.6 12 21 12 21 Z";
export const AGRIVO_LEAF_PATH =
  "M9 12.3 C 8.3 9 10.8 6.2 15.6 6 C 15.3 9.6 12.7 12.4 9 12.3 Z";
export const AGRIVO_VEIN_PATH = "M9.9 11.4 C 11.5 10.1 13.4 8.3 14.9 6.6";
export const AGRIVO_GLOSS_PATH = "M6.6 9.4 C 6.9 7 8.3 5.4 10.2 5";
/** Sommet de la feuille (ancre de l'éclat scintillant). */
export const AGRIVO_SPARKLE = { x: 15.6, y: 6 };

export function Logo({
  size = 22,
  className = "",
  showWord = true,
}: {
  size?: number;
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <defs>
          <linearGradient id="agrivo-pin-grad" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22c55e" />
            <stop offset="1" stopColor="#0f5a2e" />
          </linearGradient>
          <linearGradient id="agrivo-leaf-grad" x1="8.5" y1="12.4" x2="15.5" y2="5.6" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ecc06e" />
            <stop offset="1" stopColor="#c8861d" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="var(--color-green-signal)" opacity="0.16" />
        <path d={AGRIVO_PIN_PATH} fill="url(#agrivo-pin-grad)" />
        <path
          d={AGRIVO_GLOSS_PATH}
          stroke="#eafff2"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path d={AGRIVO_LEAF_PATH} fill="url(#agrivo-leaf-grad)" />
        <path
          d={AGRIVO_VEIN_PATH}
          stroke="#fff7e6"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </svg>
      {showWord && (
        <span
          className="font-display text-xl not-italic"
          style={{ fontStyle: "normal", fontWeight: 600 }}
        >
          {BRAND_NAME}
        </span>
      )}
    </span>
  );
}

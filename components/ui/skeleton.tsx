/**
 * Blocs de chargement « squelette » (module PUR, serveur ou client). Pulsation sobre,
 * neutralisée par prefers-reduced-motion (globals.css coupe les animations).
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-lg bg-black/[0.06] ${className}`}
    />
  );
}

/** Ligne de liste (avatar + deux lignes de texte) — dashboards et listes /app. */
export function SkeletonRow() {
  return (
    <span className="flex items-center gap-3 py-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-2.5 w-3/5" />
      </span>
      <Skeleton className="h-3 w-16 shrink-0" />
    </span>
  );
}

/** Carte KPI (icône + chiffre + libellé). */
export function SkeletonKpi() {
  return (
    <span className="flex flex-col gap-3 rounded-2xl border border-black/[0.05] bg-white p-5">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-2.5 w-24" />
    </span>
  );
}

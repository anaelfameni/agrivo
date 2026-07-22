import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

/** État réutilisable pour une erreur de chargement, avec chemin de récupération. */
export function ErrorState({
  title = "Une erreur est survenue",
  description = "Impossible d'afficher ces données pour le moment. Réessayez dans un instant.",
  action,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-black/[0.06] bg-white px-6 py-12 text-center ${className}`}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: "rgba(180,35,30,0.10)" }}
        aria-hidden
      >
        <AlertTriangle size={24} strokeWidth={1.75} className="text-red-block" />
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="font-display text-lg text-forest-950">{title}</h3>
        <p className="text-sm text-stone-500">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

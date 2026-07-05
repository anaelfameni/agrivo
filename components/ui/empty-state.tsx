import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

/** État réutilisable pour une liste/vue vide. À prévoir dès qu'une vue affiche des données. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-black/[0.08] bg-white/50 px-6 py-12 text-center ${className}`}
    >
      <div className="opacity-45">{icon ?? <Logo size={40} showWord={false} />}</div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="font-display text-lg text-forest-950">{title}</h3>
        {description && <p className="text-sm text-stone-500">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

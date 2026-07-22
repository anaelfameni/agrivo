"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-10">
      <ErrorState
        title="Cette vue n'a pas pu se charger"
        description="Une erreur est survenue dans votre espace. Réessayez, ou revenez au tableau de bord."
        action={
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="rounded-full bg-green-signal px-5 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-105">
              Réessayer
            </button>
            <Link href="/app/dashboard" className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-forest-950 transition-colors hover:border-green-signal/40">
              Tableau de bord
            </Link>
          </div>
        }
      />
    </div>
  );
}

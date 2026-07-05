"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";
import { SiteHeader } from "@/components/site-header";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main className="mx-auto flex max-w-2xl flex-col px-6 pb-24 pt-24 md:px-8">
        <ErrorState
          title="Quelque chose s'est mal passé"
          description="Une erreur inattendue est survenue. Vous pouvez réessayer ou revenir à l'accueil."
          action={
            <div className="flex gap-2">
              <button type="button" onClick={reset} className="rounded-full bg-green-signal px-5 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-105">
                Réessayer
              </button>
              <Link href="/" className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-forest-950 transition-colors hover:border-green-signal/40">
                Accueil
              </Link>
            </div>
          }
        />
      </main>
    </div>
  );
}

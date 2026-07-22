import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Hors connexion · Agrivo" };

/** Page servie par le service worker quand le réseau est indisponible (PWA). */
export default function HorsConnexionPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-forest-950 px-6 text-center text-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06]">
        <WifiOff className="h-6 w-6 text-amber-soft" strokeWidth={1.75} aria-hidden />
      </div>
      <h1 className="font-display mt-6 text-2xl font-semibold">Vous êtes hors connexion</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
        Cette page n&apos;est pas encore disponible sans réseau. Les écrans déjà visités restent
        consultables ; reconnectez-vous pour lancer une nouvelle vérification.
      </p>
      {/* Page servie hors ligne par le SW : pas de contexte de langue fiable → rappel bilingue. */}
      <p className="mt-4 max-w-md text-xs leading-relaxed text-white/45">
        You are offline. Screens you already visited remain available; reconnect to start a new
        verification.
      </p>
    </main>
  );
}

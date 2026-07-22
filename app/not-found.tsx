import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ivory px-6 text-center text-forest-950">
      <Logo size={40} showWord={false} />
      <div>
        <p className="num text-sm uppercase tracking-widest text-stone-400">Erreur 404</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Cette parcelle est introuvable</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone-500">
          La page que vous cherchez n&apos;existe pas ou n&apos;a pas encore été construite.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-forest-950 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}

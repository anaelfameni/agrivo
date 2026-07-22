import { Award, Check, X, Minus } from "lucide-react";
import type { Valorisation } from "@/lib/ai/gemini";

/**
 * Carte de valorisation commerciale explicable. Composant PUR (serveur) : les signaux sont
 * calculés par `evaluerValorisation`. Aucun score de crédit, plafond ni montant : la conformité
 * vérifiée ouvre primes de durabilité et acheteurs premium — la négociation reste humaine.
 */
function SignalIcon({ sens }: { sens: Valorisation["signaux"][number]["sens"] }) {
  if (sens === "positif") return <Check size={14} strokeWidth={2.5} className="text-green-signal" aria-hidden />;
  if (sens === "négatif") return <X size={14} strokeWidth={2.5} className="text-red-block" aria-hidden />;
  return <Minus size={14} strokeWidth={2.5} className="text-stone-400" aria-hidden />;
}

export function ValorisationCard({ valorisation, lang = "fr" }: { valorisation: Valorisation; lang?: "fr" | "en" }) {
  const en = lang === "en";
  return (
    <div className="card-premium p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
          <span className="chip-green grid h-8 w-8 place-items-center rounded-xl" aria-hidden>
            <Award size={16} strokeWidth={2} className="text-green-signal" />
          </span>
          {en ? "Commercial valorisation" : "Valorisation commerciale"}
        </h2>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-medium"
          style={
            valorisation.pret
              ? { background: "rgba(22,163,74,0.12)", color: "var(--color-green-signal)" }
              : { background: "rgba(107,98,86,0.12)", color: "var(--color-stone-600)" }
          }
        >
          {valorisation.pret
            ? en ? "Ready for the exporter file" : "Prête pour le dossier exportateur"
            : en ? "Not in the file yet" : "Hors dossier pour l'instant"}
        </span>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {valorisation.signaux.map((s) => (
          <li key={s.label} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 shrink-0">
              <SignalIcon sens={s.sens} />
            </span>
            <span className="text-stone-600">{s.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-black/[0.05] pt-3 text-xs leading-relaxed text-stone-400">
        {valorisation.explication}
      </p>
    </div>
  );
}

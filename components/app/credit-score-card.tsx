import { Coins, Check, X, Minus } from "lucide-react";
import { fmtFCFA } from "@/data/mock-parcelles";
import type { CreditScore } from "@/lib/ai/gemini";

/**
 * Carte de scoring de crédit explicable (inclusion financière). Composant PUR (serveur) : le score et
 * les signaux sont calculés par `scorerCreditProducteur`. Aide à la décision, jamais automatisation.
 */
function SignalIcon({ sens }: { sens: CreditScore["signaux"][number]["sens"] }) {
  if (sens === "positif") return <Check size={14} strokeWidth={2.5} className="text-green-signal" aria-hidden />;
  if (sens === "négatif") return <X size={14} strokeWidth={2.5} className="text-red-block" aria-hidden />;
  return <Minus size={14} strokeWidth={2.5} className="text-stone-400" aria-hidden />;
}

export function CreditScoreCard({ score }: { score: CreditScore }) {
  const eligible = score.eligible;
  return (
    <div className="card-premium p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
          <span className="chip-green grid h-8 w-8 place-items-center rounded-xl" aria-hidden>
            <Coins size={16} strokeWidth={2} className="text-green-signal" />
          </span>
          Score de crédit
          <span className="inline-flex items-center rounded-full bg-green-signal/12 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-green-signal">
            IA
          </span>
        </h2>
        <span
          className="grid h-9 min-w-9 place-items-center rounded-xl px-2 text-sm font-bold"
          style={
            eligible
              ? { background: "rgba(22,163,74,0.12)", color: "var(--color-green-signal)" }
              : { background: "rgba(107,98,86,0.12)", color: "var(--color-stone-600)" }
          }
          aria-label={`Classe ${score.classe}`}
        >
          {score.classe}
        </span>
      </div>

      {eligible && (
        <div className="mt-3 flex items-end gap-2">
          <span className="num text-2xl font-semibold text-forest-950">{fmtFCFA(score.plafondFcfa)}</span>
          <span className="mb-0.5 text-xs text-stone-500">plafond recommandé</span>
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {score.signaux.map((s) => (
          <li key={s.label} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 shrink-0">
              <SignalIcon sens={s.sens} />
            </span>
            <span className="text-stone-600">{s.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-black/[0.05] pt-3 text-xs leading-relaxed text-stone-400">
        {score.explication}
      </p>
    </div>
  );
}

import { ShieldCheck, ShieldQuestion, ShieldAlert, Check, X, Minus, type LucideIcon } from "lucide-react";
import type { RiskAssessment, RiskLevel } from "@/lib/ai/gemini";

/**
 * Carte d'analyse de risque RDUE expliquée (aide à la décision). Composant PUR (serveur) : le niveau
 * et les facteurs sont calculés par `analyserRisque` côté serveur, jamais un pourcentage inventé.
 */
const LEVEL: Record<RiskLevel, { color: string; tint: string; Icon: LucideIcon }> = {
  Faible: { color: "var(--color-green-signal)", tint: "rgba(22,163,74,0.12)", Icon: ShieldCheck },
  Modéré: { color: "var(--color-amber-cacao)", tint: "rgba(200,134,29,0.14)", Icon: ShieldQuestion },
  Élevé: { color: "#d9601a", tint: "rgba(217,96,26,0.14)", Icon: ShieldAlert },
  Bloquant: { color: "var(--color-red-block)", tint: "rgba(180,35,30,0.12)", Icon: ShieldAlert },
};

function FactorIcon({ sens }: { sens: RiskAssessment["facteurs"][number]["sens"] }) {
  if (sens === "positif") return <Check size={14} strokeWidth={2.5} className="text-green-signal" aria-hidden />;
  if (sens === "négatif") return <X size={14} strokeWidth={2.5} className="text-red-block" aria-hidden />;
  return <Minus size={14} strokeWidth={2.5} className="text-stone-400" aria-hidden />;
}

export function RiskCard({ risk }: { risk: RiskAssessment }) {
  const l = LEVEL[risk.niveau];
  return (
    <div className="card-premium p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
          <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: l.tint }} aria-hidden>
            <l.Icon size={16} strokeWidth={2} style={{ color: l.color }} />
          </span>
          Analyse de risque RDUE
          <span className="inline-flex items-center rounded-full bg-green-signal/12 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-green-signal">
            IA
          </span>
        </h2>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: l.tint, color: l.color }}>
          Risque {risk.niveau}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-stone-600">{risk.synthese}</p>

      <ul className="mt-4 flex flex-col gap-2">
        {risk.facteurs.map((f) => (
          <li key={f.label} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 shrink-0">
              <FactorIcon sens={f.sens} />
            </span>
            <span className="text-stone-600">{f.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl border p-3.5" style={{ borderColor: `${l.color}33`, background: l.tint }}>
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide" style={{ color: l.color }}>
          Recommandation
        </p>
        <p className="mt-1 text-sm leading-relaxed text-forest-800">{risk.recommandation}</p>
      </div>
    </div>
  );
}

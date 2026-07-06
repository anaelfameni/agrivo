"use client";

import { Check } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const STEPS = {
  fr: ["Confirmation", "Scan", "Cartographie", "Analyse", "Certificat", "Valorisation"],
  en: ["Confirmation", "Scan", "Mapping", "Analysis", "Certificate", "Valorisation"],
} as const;

/** En-tête de progression du parcours (golden path). Compact sur mobile, complet sur desktop. */
export function VerifierStepper({ current }: { current: number }) {
  const { lang } = useLanguage();
  const steps = STEPS[lang];
  const total = steps.length;
  return (
    <div>
      {/* Mobile : étape courante + barre */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-forest-950">{steps[current - 1]}</span>
          <span className="num text-xs text-stone-400">
            {lang === "en" ? "Step" : "Étape"} {current}/{total}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/[0.07]">
          <div
            className="h-full rounded-full bg-green-signal transition-[width] duration-500"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop : stepper à pastilles */}
      <ol className="hidden max-w-4xl items-center gap-1 sm:flex">
        {steps.map((label, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors ${
                    done
                      ? "bg-green-signal text-white"
                      : active
                        ? "border-2 border-green-signal bg-white text-green-signal"
                        : "border border-black/10 bg-white text-stone-400"
                  }`}
                >
                  {done ? <Check size={14} strokeWidth={3} aria-hidden /> : <span className="num">{n}</span>}
                </span>
                <span
                  className={`text-sm ${active ? "font-semibold text-forest-950" : done ? "text-forest-950" : "text-stone-400"}`}
                >
                  {label}
                </span>
              </div>
              {n < total && (
                <span
                  aria-hidden
                  className={`mx-2 h-px flex-1 ${done ? "bg-green-signal/50" : "bg-black/10"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

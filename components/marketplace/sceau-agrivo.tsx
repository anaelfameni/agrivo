"use client";

import { ShieldCheck, ShieldAlert, Check, AlertTriangle } from "lucide-react";
import type { Sceau } from "@/data/mock-marketplace";
import type { Language } from "@/lib/i18n";

/**
 * Le SCEAU AGRIVO — le moteur de confiance de la marketplace (double verrou anti-fraude).
 * Affiche le verdict global + le détail des 4 critères (calculés, jamais affirmés).
 * Vocabulaire charte : « vérifié » / « en préparation », jamais « garanti ».
 */
export function SceauAgrivo({
  sceau,
  lang = "fr",
  detaille = false,
  tone = "light",
}: {
  sceau: Sceau;
  lang?: Language;
  detaille?: boolean;
  /** "dark" : posé sur un fond forêt (AGRIVO Market). */
  tone?: "light" | "dark";
}) {
  const verifie = sceau.statut === "verifie";
  const en = lang === "en";
  const dark = tone === "dark";

  const titre = verifie
    ? en
      ? "AGRIVO seal · verified"
      : "Sceau AGRIVO · vérifié"
    : en
      ? "AGRIVO seal · in preparation"
      : "Sceau AGRIVO · en préparation";

  return (
    <div className="w-full">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
          verifie
            ? "border-green-signal/40 bg-green-signal/10 text-green-signal"
            : dark
              ? "border-amber-cacao/40 bg-amber-cacao/10 text-amber-soft"
              : "border-amber-cacao/40 bg-amber-cacao/10 text-amber-cacao"
        }`}
      >
        {verifie ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
        {titre}
      </span>

      {detaille && (
        <ul className="mt-3 space-y-2">
          {sceau.criteres.map((c) => (
            <li key={c.code} className="flex items-start gap-2 text-sm">
              <span className={`mt-0.5 shrink-0 ${c.ok ? "text-green-signal" : dark ? "text-amber-soft" : "text-amber-cacao"}`}>
                {c.ok ? <Check size={16} /> : <AlertTriangle size={16} />}
              </span>
              <span className={dark ? "text-white/80" : "text-forest-950/85"}>{en ? c.en : c.fr}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

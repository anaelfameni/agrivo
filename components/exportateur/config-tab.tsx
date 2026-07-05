"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Bell, ChevronRight } from "lucide-react";
import { PinMark } from "@/components/ui/pin-mark";
import { alertesParCoop, FILIERE_LABEL, type Parcelle } from "@/data/mock-parcelles";
import { type LogEntry } from "@/components/exportateur/types";

const PINGS = [
  { service: "Whisp API", label: "Convergence de preuves vérifiée", range: [700, 1200] as const },
  { service: "Gemini API", label: "Explication de verdict générée", range: [400, 900] as const },
  { service: "Copernicus", label: "Tuile Sentinel-2 récupérée", range: [900, 1600] as const },
  { service: "TRACES NT", label: "État de dépôt interrogé", range: [300, 700] as const },
];

export function ConfigTab({
  parcelles,
  log,
  pushLog,
}: {
  parcelles: Parcelle[];
  log: LogEntry[];
  pushLog: (e: { service: string; label: string; ms?: number; status?: "ok" | "warn" }) => void;
}) {
  const groupes = alertesParCoop(parcelles);
  const totalAlertes = groupes.reduce((s, g) => s + g.items.length, 0);
  const seeded = useRef(false);

  // Journal réseau « vivant » : quelques pings simulés pendant que l'onglet est ouvert.
  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      pushLog({ service: "Whisp API", label: "Connexion établie (MOCK_MODE)", ms: 214, status: "ok" });
    }
    const timer = setInterval(() => {
      const p = PINGS[Math.floor(Math.random() * PINGS.length)];
      const ms = Math.round(p.range[0] + Math.random() * (p.range[1] - p.range[0]));
      pushLog({ service: p.service, label: p.label, ms, status: "ok" });
    }, 4200);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Colonne gauche : journal réseau (les clés d'API et MOCK_MODE sont désormais réservés au compte admin) */}
      <div className="flex flex-col gap-5">
        {/* Journal réseau simulé (preuve de vie technique) */}
        <section className="rounded-2xl border border-black/[0.05] bg-white p-5 shadow-[0_1px_2px_rgba(10,31,20,0.04)]">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
              <Activity size={16} strokeWidth={2} className="text-forest-800" aria-hidden />
              Journal réseau
            </h3>
            <span className="flex items-center gap-1.5 text-[0.7rem] text-stone-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-signal/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-signal" />
              </span>
              en direct
            </span>
          </div>

          <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-black/[0.05] bg-forest-950 p-2">
            {log.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-white/40">En attente de trafic réseau…</p>
            ) : (
              <ul className="flex flex-col">
                <AnimatePresence initial={false}>
                  {log.slice(0, 30).map((e) => (
                    <motion.li
                      key={e.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.72rem]"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: e.status === "ok" ? "#16a34a" : "#e0a64b" }}
                        aria-hidden
                      />
                      <span className="num shrink-0 text-white/80">{e.service}</span>
                      <span className="min-w-0 flex-1 truncate text-white/50">{e.label}</span>
                      <span className="num shrink-0 text-white/70">{e.ms} ms</span>
                      <span className="num hidden shrink-0 text-white/30 sm:inline">{e.time}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Colonne droite : centre d'alertes (cohérent avec le dashboard coopérative) */}
      <section id="alertes" className="rounded-2xl border border-black/[0.05] bg-white p-5 shadow-[0_1px_2px_rgba(10,31,20,0.04)]">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
            <span className="relative grid h-8 w-8 place-items-center rounded-xl" style={{ background: "rgba(180,35,30,0.10)" }} aria-hidden>
              <Bell size={16} strokeWidth={2} className="text-red-block" />
            </span>
            Centre d'alertes
          </h3>
          {totalAlertes > 0 && (
            <span className="num inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-red-block px-1.5 text-xs font-semibold text-white">
              {totalAlertes}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-stone-500">Parcelles en anomalie, regroupées par coopérative.</p>

        {groupes.length === 0 ? (
          <p className="mt-5 text-sm text-stone-500">Aucune alerte active sur le portefeuille.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {groupes.map((g) => (
              <div key={g.cooperative}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{g.cooperative}</span>
                  <span className="num text-xs text-red-block">{g.items.length}</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {g.items.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/app/parcelle/${p.id}`}
                        className="group flex items-start gap-3 rounded-xl border border-red-block/15 bg-red-block/[0.04] p-3 outline-none transition-colors hover:bg-red-block/[0.07] focus-visible:ring-2 focus-visible:ring-red-block/40"
                      >
                        <PinMark size={22} color="var(--color-red-block)" pulse className="mt-0.5 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-forest-950">Nouvelle anomalie détectée</span>
                          <span className="mt-0.5 block text-xs text-stone-500">
                            {p.producteurNom} · {p.region} · {FILIERE_LABEL[p.filiere]}
                          </span>
                        </span>
                        <ChevronRight size={16} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0 text-red-block/50 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

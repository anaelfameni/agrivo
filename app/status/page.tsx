"use client";
import * as React from "react";
import { Activity, CheckCircle2, CircleAlert, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { PageHero } from "@/components/landing/page-hero";
import { useLanguage } from "@/components/language-provider";

/**
 * État des services AGRIVO — page publique. Chaque carte exécute un VRAI appel vers le service
 * concerné depuis le navigateur du visiteur (aucune valeur pré-enregistrée) : moteur de verdicts,
 * assistant IA, API REST exportateur, vérification publique de certificat. Preuve de sérieux pour
 * l'engagement de disponibilité (SLA) de l'offre Exportateur Pro.
 */

type Etat = "pending" | "ok" | "degraded";

interface Service {
  id: string;
  nom: { fr: string; en: string };
  detail: { fr: string; en: string };
  verifier: () => Promise<string>;
}

const SERVICES: Service[] = [
  {
    id: "verdicts",
    nom: { fr: "Moteur de verdicts (détection satellite)", en: "Verdict engine (satellite detection)" },
    detail: { fr: "POST /api/whisp/verify — parcelle témoin", en: "POST /api/whisp/verify — reference plot" },
    verifier: async () => {
      const r = await fetch("/api/whisp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parcelleId: "p01" }),
      });
      const d = (await r.json()) as { statut?: string; live?: boolean };
      if (!r.ok || !d.statut) throw new Error(`HTTP ${r.status}`);
      return d.live ? "Whisp (FAO) en direct" : `verdict « ${d.statut} »`;
    },
  },
  {
    id: "assistant",
    nom: { fr: "Assistant AGRIVO (IA)", en: "AGRIVO Assistant (AI)" },
    detail: { fr: "POST /api/gemini/rdue-qa", en: "POST /api/gemini/rdue-qa" },
    verifier: async () => {
      const r = await fetch("/api/gemini/rdue-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Combien coûte AGRIVO ?", lang: "fr" }),
      });
      const d = (await r.json()) as { reponse?: string; live?: boolean };
      if (!r.ok || !d.reponse) throw new Error(`HTTP ${r.status}`);
      return d.live ? "IA en direct" : "repli vérifié actif";
    },
  },
  {
    id: "api",
    nom: { fr: "API REST exportateur", en: "Exporter REST API" },
    detail: { fr: "GET /api/exporteur/portefeuille", en: "GET /api/exporteur/portefeuille" },
    verifier: async () => {
      const r = await fetch("/api/exporteur/portefeuille?statut=conforme");
      const d = (await r.json()) as { type?: string; features?: unknown[] };
      if (!r.ok || d.type !== "FeatureCollection") throw new Error(`HTTP ${r.status}`);
      return `${d.features?.length ?? 0} parcelles conformes servies`;
    },
  },
  {
    id: "verif",
    nom: { fr: "Vérification publique de certificat", en: "Public certificate verification" },
    detail: { fr: "/verifier-certificat (QR des PDF)", en: "/verifier-certificat (PDF QR)" },
    verifier: async () => {
      const r = await fetch("/verifier-certificat?ref=AGV-2026-0417");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return "page accessible";
    },
  },
];

const COPY = {
  fr: {
    eyebrow: "État des services",
    titre: "Tous les services, vérifiés en direct.",
    sous: "Chaque carte exécute un appel réel depuis votre navigateur, à l'instant où vous ouvrez cette page. C'est la base de l'engagement de disponibilité (SLA) de l'offre Exportateur Pro.",
    ok: "Opérationnel",
    degraded: "Dégradé",
    pending: "Vérification…",
    relancer: "Relancer les vérifications",
    horodatage: (d: string) => `Dernière vérification : ${d}`,
  },
  en: {
    eyebrow: "Service status",
    titre: "Every service, checked live.",
    sous: "Each card runs a real call from your browser, the moment you open this page. This underpins the availability commitment (SLA) of the Exporter Pro plan.",
    ok: "Operational",
    degraded: "Degraded",
    pending: "Checking…",
    relancer: "Re-run checks",
    horodatage: (d: string) => `Last check: ${d}`,
  },
} as const;

export default function StatusPage() {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [etats, setEtats] = React.useState<Record<string, { etat: Etat; note: string }>>({});
  const [quand, setQuand] = React.useState<string | null>(null);

  const lancer = React.useCallback(async () => {
    setEtats(Object.fromEntries(SERVICES.map((s) => [s.id, { etat: "pending" as Etat, note: "" }])));
    await Promise.all(
      SERVICES.map(async (s) => {
        try {
          const note = await s.verifier();
          setEtats((prev) => ({ ...prev, [s.id]: { etat: "ok", note } }));
        } catch (e) {
          setEtats((prev) => ({ ...prev, [s.id]: { etat: "degraded", note: String(e).slice(0, 60) } }));
        }
      }),
    );
    setQuand(new Date().toLocaleTimeString(lang === "en" ? "en-GB" : "fr-FR"));
  }, [lang]);

  React.useEffect(() => {
    void lancer();
  }, [lancer]);

  return (
    <div className="min-h-screen bg-ivory text-forest-950">
      <SiteHeader variant="overlay" />
      <main>
        <PageHero eyebrow={t.eyebrow} title={t.titre} sub={t.sous} />

        <section className="mx-auto max-w-3xl px-6 py-12 md:px-8">
          <Reveal>
            <ul className="flex flex-col gap-3">
              {SERVICES.map((s) => {
                const e = etats[s.id];
                const etat: Etat = e?.etat ?? "pending";
                return (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-5">
                    {etat === "ok" ? (
                      <CheckCircle2 size={20} strokeWidth={2} className="shrink-0 text-green-signal" aria-hidden />
                    ) : etat === "degraded" ? (
                      <CircleAlert size={20} strokeWidth={2} className="shrink-0 text-amber-cacao" aria-hidden />
                    ) : (
                      <Activity size={20} strokeWidth={2} className="shrink-0 animate-pulse text-stone-400" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-forest-950">{s.nom[lang]}</p>
                      <p className="num mt-0.5 text-xs text-stone-400">{s.detail[lang]}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        etat === "ok"
                          ? "bg-green-signal/10 text-green-signal"
                          : etat === "degraded"
                            ? "bg-amber-soft/20 text-amber-cacao"
                            : "bg-black/[0.04] text-stone-500"
                      }`}
                    >
                      {t[etat]}
                    </span>
                    {e?.note && <span className="w-full pl-8 text-xs text-stone-500 sm:w-auto sm:pl-0">{e.note}</span>}
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => void lancer()}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal"
              >
                <RefreshCw size={14} strokeWidth={2} aria-hidden />
                {t.relancer}
              </button>
              {quand && <span className="num text-xs text-stone-400">{t.horodatage(quand)}</span>}
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

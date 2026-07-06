"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, CalendarDays, FileCheck2, Layers, MapPin, MapPinOff, Ruler, Satellite } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { ErrorState } from "@/components/ui/error-state";
import { useLanguage } from "@/components/language-provider";
import { lireProducteursLocaux, type ProducteurLocal } from "@/lib/producteurs-locaux";
import { FILIERE_LABEL, fmtHa, type Parcelle } from "@/data/mock-parcelles";

const ParcelleMapSat = dynamic(() => import("@/components/app/parcelle-map-sat"), {
  ssr: false,
  loading: () => (
    <div className="grid aspect-[16/10] place-items-center rounded-2xl border border-black/[0.08] bg-forest-950">
      <span className="glow-pulse inline-block h-2.5 w-2.5 rounded-full bg-green-signal" aria-hidden />
    </div>
  ),
});

const COPY = {
  fr: {
    back: "Tableau de bord",
    eyebrow: "Producteur ajouté par la coopérative",
    pending: "En attente de vérification satellite : lancez le parcours de vérification pour obtenir un verdict et un certificat.",
    infos: "Informations producteur",
    filiere: "Filière", region: "Région", superficie: "Superficie", carte: "N° de carte", ajoute: "Ajouté",
    coords: "Coordonnées fournies",
    noCoordsTitle: "Coordonnées à compléter",
    noCoords: "La coopérative n'a pas encore fourni la géolocalisation de cette parcelle. Ajoutez-la lors de la vérification (saisie directe ou capture au champ).",
    verify: "Lancer la vérification",
    notFoundTitle: "Cette parcelle est introuvable",
    notFoundDesc: "Elle n'existe pas ou a été ajoutée depuis un autre navigateur (les producteurs ajoutés en démonstration sont stockés localement).",
    backList: "Retour aux producteurs",
  },
  en: {
    back: "Dashboard",
    eyebrow: "Farmer added by the cooperative",
    pending: "Awaiting satellite verification: run the verification journey to get a verdict and a certificate.",
    infos: "Farmer information",
    filiere: "Commodity", region: "Region", superficie: "Area", carte: "Card no.", ajoute: "Added",
    coords: "Provided coordinates",
    noCoordsTitle: "Coordinates to complete",
    noCoords: "The cooperative has not provided this plot's geolocation yet. Add it during verification (direct entry or field capture).",
    verify: "Start the verification",
    notFoundTitle: "This plot cannot be found",
    notFoundDesc: "It does not exist, or it was added from another browser (demo farmers are stored locally).",
    backList: "Back to farmers",
  },
} as const;

/**
 * Fiche d'un producteur ajouté par la coopérative (stocké côté navigateur) : rendue quand l'id
 * n'existe pas dans les parcelles de démonstration. Affiche la carte satellite si la coop a
 * fourni des coordonnées, sinon invite à les compléter via le parcours de vérification.
 */
export function ParcelleLocale({ id }: { id: string }) {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [state, setState] = useState<"loading" | "found" | "missing">("loading");
  const [p, setP] = useState<ProducteurLocal | null>(null);

  useEffect(() => {
    const found = lireProducteursLocaux().find((x) => x.id === id || x.linkId === id) ?? null;
    setP(found);
    setState(found ? "found" : "missing");
  }, [id]);

  if (state === "loading") {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <span className="glow-pulse inline-block h-2.5 w-2.5 rounded-full bg-green-signal" aria-hidden />
      </div>
    );
  }

  if (state === "missing" || !p) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <ErrorState
          title={t.notFoundTitle}
          description={t.notFoundDesc}
          action={
            <Link
              href="/app/producteurs"
              className="btn-green inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              {t.backList}
            </Link>
          }
        />
      </div>
    );
  }

  const hasCoords = typeof p.lat === "number" && typeof p.lon === "number";
  // Objet minimal compatible avec la carte satellite (point central fourni par la coopérative).
  const pseudo = hasCoords
    ? ({
        ...p,
        geojson: { type: "Point", coordinates: [p.lon!, p.lat!] },
      } as unknown as Parcelle)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/dashboard"
        className="inline-flex w-fit items-center gap-1.5 rounded-full text-sm text-stone-500 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        <ArrowLeft size={15} strokeWidth={2} aria-hidden />
        {t.back}
      </Link>

      <header className="flex flex-col gap-2">
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl leading-tight text-forest-950 sm:text-4xl">{p.producteurNom}</h1>
          <StatusBadge statut={p.statut} lang={lang} />
        </div>
        <p className="num text-sm text-stone-500">
          {p.numeroCartePro} · {p.cooperative}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col gap-5">
          {pseudo ? (
            <ParcelleMapSat parcelle={pseudo} className="aspect-[16/10]" />
          ) : (
            <div className="grid aspect-[16/10] place-items-center rounded-2xl border border-dashed border-black/15 bg-ivory-deep/40 p-6 text-center">
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm" aria-hidden>
                  <MapPinOff size={22} strokeWidth={1.75} className="text-stone-400" />
                </span>
                <p className="mt-3 text-sm font-semibold text-forest-950">{t.noCoordsTitle}</p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-stone-500">{t.noCoords}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-amber-cacao/25 bg-amber-cacao/[0.05] p-4">
            <Satellite size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-amber-cacao" aria-hidden />
            <p className="text-sm leading-relaxed text-stone-600">{t.pending}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="card-premium p-5">
            <h2 className="text-sm font-semibold text-forest-950">{t.infos}</h2>
            <dl className="mt-4 flex flex-col divide-y divide-black/[0.05]">
              <InfoRow icon={<Layers size={16} strokeWidth={2} />} label={t.filiere} value={FILIERE_LABEL[p.filiere]} />
              <InfoRow icon={<MapPin size={16} strokeWidth={2} />} label={t.region} value={p.region} />
              <InfoRow icon={<Ruler size={16} strokeWidth={2} />} label={t.superficie} value={fmtHa(p.superficieHa)} mono />
              <InfoRow icon={<FileCheck2 size={16} strokeWidth={2} />} label={t.carte} value={p.numeroCartePro} mono />
              {hasCoords && (
                <InfoRow
                  icon={<CalendarDays size={16} strokeWidth={2} />}
                  label={t.coords}
                  value={`${p.lat!.toFixed(4)}, ${p.lon!.toFixed(4)}`}
                  mono
                />
              )}
            </dl>
          </div>

          <Link
            href="/app/verifier"
            className="btn-green group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            {t.verify}
            <ArrowRight size={16} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <dt className="flex items-center gap-2 text-sm text-stone-500">
        <span className="text-green-signal/70" aria-hidden>{icon}</span>
        {label}
      </dt>
      <dd className={`text-right text-sm font-medium text-forest-950 ${mono ? "num" : ""}`}>{value}</dd>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Store, Tag, MapPin, Boxes, ArrowRight, Check, ExternalLink, Ship } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { SceauAgrivo } from "@/components/marketplace/sceau-agrivo";
import { PARCELLES } from "@/data/mock-parcelles";
import {
  lotsMarche,
  takeRate,
  TAUX_COMMISSION_MIN,
  TAUX_COMMISSION_MAX,
  type MarketLot,
} from "@/data/mock-marketplace";

/**
 * « Mes lots » — le COCKPIT VENDEUR de l'exportateur (côté OFFRE uniquement).
 * La découverte et la réservation côté acheteur vivent désormais sur la VITRINE PUBLIQUE
 * AGRIVO Market (/marketplace). Ici, l'exportateur publie / retire / suit ses lots scellés,
 * et bascule vers la fiche publique de chacun. AGRIVO fait le commerce des fèves, jamais le
 * financement : aucune donnée de crédit ici.
 */
const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
const pct = (t: number) => `${Math.round(t * 100)} %`;

type Copy = Record<
  | "eyebrow" | "title" | "lead" | "demo" | "vitrine" | "tonnage" | "prix" | "valeur" | "commission"
  | "parcelles" | "publier" | "retirer" | "publie" | "nonVendable" | "reserve" | "reserveBy"
  | "fiche" | "tauxNote",
  string
>;

const COPY: Record<"fr" | "en", Copy> = {
  fr: {
    eyebrow: "Espace exportateur · AGRIVO Market",
    title: "Mes lots",
    lead: "Publiez vos lots scellés sur la vitrine publique, suivez-les, retirez-les. Un lot n'est publiable que s'il porte le sceau AGRIVO (double verrou).",
    demo: "Lots de démonstration dérivés de vos expéditions. Aucune transaction réelle.",
    vitrine: "Voir la vitrine publique",
    tonnage: "Tonnage",
    prix: "Prix indicatif",
    valeur: "Valeur du lot",
    commission: "Commission AGRIVO estimée",
    parcelles: "parcelles d'origine",
    publier: "Publier sur la marketplace",
    retirer: "Retirer de la marketplace",
    publie: "Publié",
    nonVendable: "Sceau en préparation — non publiable tant que le double verrou n'est pas vérifié.",
    reserve: "Réservé",
    reserveBy: "Réservé par",
    fiche: "Voir la fiche publique",
    tauxNote: `Take-rate ${pct(TAUX_COMMISSION_MIN)}–${pct(TAUX_COMMISSION_MAX)} selon le lot ; estimation à ${pct(0.02)}.`,
  },
  en: {
    eyebrow: "Exporter space · AGRIVO Market",
    title: "My lots",
    lead: "List your sealed lots on the public marketplace, track them, remove them. A lot can only be listed if it carries the AGRIVO seal (double lock).",
    demo: "Demonstration lots derived from your shipments. No real transaction.",
    vitrine: "See the public marketplace",
    tonnage: "Tonnage",
    prix: "Indicative price",
    valeur: "Lot value",
    commission: "Estimated AGRIVO commission",
    parcelles: "source plots",
    publier: "List on the marketplace",
    retirer: "Remove from the marketplace",
    publie: "Listed",
    nonVendable: "Seal in preparation — cannot be listed until the double lock is verified.",
    reserve: "Reserved",
    reserveBy: "Reserved by",
    fiche: "View public file",
    tauxNote: `Take-rate ${pct(TAUX_COMMISSION_MIN)}–${pct(TAUX_COMMISSION_MAX)} per lot; estimate at ${pct(0.02)}.`,
  },
} as const;

export default function MesLotsPage() {
  const { lang } = useLanguage();
  const t = COPY[lang === "en" ? "en" : "fr"];
  const lots = useMemo(() => lotsMarche(PARCELLES), []);
  // État de session : lots retirés du marché (les constantes ne sont jamais mutées).
  const [retires, setRetires] = useState<Set<string>>(new Set());

  return (
    <div className="mx-auto max-w-6xl px-1 py-2">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-signal">{t.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold text-forest-950 md:text-3xl">{t.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-forest-950/70">{t.lead}</p>
          <p className="mt-2 text-xs text-amber-cacao">{t.demo}</p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-forest-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-900"
        >
          <Store size={15} /> {t.vitrine} <ArrowRight size={14} />
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {lots.map((lot) => (
          <LotCard
            key={lot.ref}
            lot={lot}
            lang={lang === "en" ? "en" : "fr"}
            t={t}
            retire={retires.has(lot.ref)}
            onToggle={() =>
              setRetires((prev) => {
                const next = new Set(prev);
                if (next.has(lot.ref)) next.delete(lot.ref);
                else next.add(lot.ref);
                return next;
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

function LotCard({
  lot,
  lang,
  t,
  retire,
  onToggle,
}: {
  lot: MarketLot;
  lang: "fr" | "en";
  t: Copy;
  retire: boolean;
  onToggle: () => void;
}) {
  const vendable = lot.sceau.statut === "verifie";
  const isReserved = lot.statutMarche === "reserve";
  const publie = !retire;

  return (
    <article className="flex flex-col rounded-2xl border border-green-signal/15 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="font-semibold text-forest-950">{lot.nomLot}</h2>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-forest-950/60">
          <Tag size={12} /> {lot.filiereLabel}
          <span className="mx-1">·</span>
          <MapPin size={12} /> {lot.regions.join(", ")}
        </p>
      </div>

      <SceauAgrivo sceau={lot.sceau} lang={lang} detaille />

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-forest-950/55">{t.tonnage}</dt>
          <dd className="font-medium text-forest-950">{lot.tonnage.toFixed(1)} t</dd>
        </div>
        <div>
          <dt className="text-xs text-forest-950/55">{t.prix}</dt>
          <dd className="font-medium text-forest-950">{fcfa(lot.prixIndicatifFcfaKg)} FCFA/kg</dd>
        </div>
        <div>
          <dt className="text-xs text-forest-950/55">{t.valeur}</dt>
          <dd className="font-medium text-forest-950">{fcfa(lot.valeurFcfa)} FCFA</dd>
        </div>
        <div>
          <dt className="text-xs text-forest-950/55">{t.commission}</dt>
          <dd className="font-medium text-green-signal">{fcfa(takeRate(lot.valeurFcfa))} FCFA</dd>
        </div>
      </dl>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-forest-950/45">
        <Boxes size={11} /> {lot.nbParcelles} {t.parcelles} · {t.tauxNote}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {isReserved ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-forest-950/15 bg-forest-950/[0.04] px-3 py-2 text-sm font-medium text-forest-950/70">
            <Ship size={15} /> {t.reserve}{lot.acheteur ? ` · ${t.reserveBy} ${lot.acheteur}` : ""}
          </span>
        ) : !vendable ? (
          <p className="text-xs text-amber-cacao">{t.nonVendable}</p>
        ) : (
          <button
            onClick={onToggle}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              publie
                ? "border border-green-signal/40 bg-green-signal/10 text-green-signal hover:bg-green-signal/15"
                : "bg-green-signal text-white hover:bg-green-signal/90"
            }`}
          >
            {publie ? <Check size={15} /> : <Store size={15} />}
            {publie ? t.publie : t.publier}
            {!publie && <ArrowRight size={15} />}
          </button>
        )}

        <Link
          href={`/marketplace/lot/${lot.ref}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-950/60 transition hover:text-forest-950"
        >
          <ExternalLink size={13} /> {t.fiche}
        </Link>
      </div>
    </article>
  );
}

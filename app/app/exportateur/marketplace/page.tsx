"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Store, Tag, MapPin, Boxes, ArrowRight, Check, Ship, ExternalLink } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { SceauAgrivo } from "@/components/marketplace/sceau-agrivo";
import { PARCELLES } from "@/data/mock-parcelles";
import {
  lotsMarche,
  takeRate,
  estVendable,
  TAUX_COMMISSION_MIN,
  TAUX_COMMISSION_MAX,
  type MarketLot,
} from "@/data/mock-marketplace";

type Vue = "offre" | "demande";

const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
const pct = (t: number) => `${Math.round(t * 100)} %`;

type Copy = Record<
  | "eyebrow" | "title" | "lead" | "demo" | "offre" | "demande" | "tonnage" | "prix" | "valeur"
  | "commission" | "parcelles" | "publier" | "retirer" | "nonVendable" | "publie" | "reserver"
  | "reserve" | "reserveNote" | "verifier" | "aucun" | "tauxNote",
  string
>;

const COPY: Record<"fr" | "en", Copy> = {
  fr: {
    eyebrow: "Marketplace du cacao conforme",
    title: "La place de marché des lots vérifiés",
    lead:
      "L'exportateur publie ses lots déjà tracés ; l'acheteur premium ne voit que des lots portant le sceau AGRIVO. AGRIVO fait le commerce des fèves, jamais le financement.",
    demo: "Lots de démonstration (dérivés de vos expéditions). Aucune transaction réelle.",
    offre: "Offre · vendeur",
    demande: "Demande · acheteur",
    tonnage: "Tonnage",
    prix: "Prix indicatif",
    valeur: "Valeur du lot",
    commission: "Commission AGRIVO estimée",
    parcelles: "parcelles d'origine",
    publier: "Publier sur la marketplace",
    retirer: "Retirer de la marketplace",
    nonVendable: "Sceau en préparation — non publiable tant que le double verrou n'est pas vérifié.",
    publie: "Publié",
    reserver: "Réserver ce lot",
    reserve: "Lot réservé",
    reserveNote: "Demande d'achat enregistrée. La commission est prélevée sur la transaction, jamais sur le producteur.",
    verifier: "Vérifier le dossier public",
    aucun: "Aucun lot vérifié n'est publié pour le moment.",
    tauxNote: `Take-rate ${pct(TAUX_COMMISSION_MIN)}–${pct(TAUX_COMMISSION_MAX)} selon le lot ; estimation à ${pct(0.02)}.`,
  },
  en: {
    eyebrow: "Compliant cocoa marketplace",
    title: "The marketplace of verified lots",
    lead:
      "Exporters list their already-traced lots; premium buyers only see lots carrying the AGRIVO seal. AGRIVO handles the bean trade, never financing.",
    demo: "Demonstration lots (derived from your shipments). No real transaction.",
    offre: "Supply · seller",
    demande: "Demand · buyer",
    tonnage: "Tonnage",
    prix: "Indicative price",
    valeur: "Lot value",
    commission: "Estimated AGRIVO commission",
    parcelles: "source plots",
    publier: "List on the marketplace",
    retirer: "Remove from the marketplace",
    nonVendable: "Seal in preparation — cannot be listed until the double lock is verified.",
    publie: "Listed",
    reserver: "Reserve this lot",
    reserve: "Lot reserved",
    reserveNote: "Purchase request recorded. The commission is taken on the transaction, never on the producer.",
    verifier: "Verify the public file",
    aucun: "No verified lot is listed at the moment.",
    tauxNote: `Take-rate ${pct(TAUX_COMMISSION_MIN)}–${pct(TAUX_COMMISSION_MAX)} per lot; estimate at ${pct(0.02)}.`,
  },
} as const;

export default function MarketplacePage() {
  const { lang } = useLanguage();
  const t = COPY[lang === "en" ? "en" : "fr"];
  const [vue, setVue] = useState<Vue>("offre");
  // État de session : lots retirés du marché + lots réservés (les constantes ne sont jamais mutées).
  const [retires, setRetires] = useState<Set<string>>(new Set());
  const [reserves, setReserves] = useState<Set<string>>(new Set());

  const lots = useMemo(() => lotsMarche(PARCELLES), []);
  const enVente = lots.filter((l) => estVendable(l) && !retires.has(l.ref));

  return (
    <div className="mx-auto max-w-6xl px-1 py-2">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-signal">{t.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold text-forest-950 md:text-3xl">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-forest-950/70">{t.lead}</p>
        <p className="mt-2 text-xs text-amber-cacao">{t.demo}</p>
      </header>

      <div className="mb-6 inline-flex rounded-full border border-green-signal/30 bg-green-signal/5 p-1 text-sm">
        {(["offre", "demande"] as Vue[]).map((v) => (
          <button
            key={v}
            onClick={() => setVue(v)}
            className={`rounded-full px-4 py-1.5 font-medium transition ${
              vue === v ? "bg-green-signal text-white" : "text-forest-950/70 hover:text-forest-950"
            }`}
          >
            {v === "offre" ? t.offre : t.demande}
          </button>
        ))}
      </div>

      {vue === "offre" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {lots.map((lot) => (
            <LotCard key={lot.ref} lot={lot} lang={lang} t={t}>
              <OffreActions
                lot={lot}
                retire={retires.has(lot.ref)}
                onToggle={() =>
                  setRetires((prev) => {
                    const next = new Set(prev);
                    if (next.has(lot.ref)) next.delete(lot.ref);
                    else next.add(lot.ref);
                    return next;
                  })
                }
                t={t}
              />
            </LotCard>
          ))}
        </div>
      ) : enVente.length === 0 ? (
        <p className="rounded-xl border border-green-signal/20 bg-green-signal/5 p-6 text-sm text-forest-950/70">
          {t.aucun}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {enVente.map((lot) => (
            <LotCard key={lot.ref} lot={lot} lang={lang} t={t}>
              <DemandeActions
                lot={lot}
                reserve={reserves.has(lot.ref)}
                onReserve={() => setReserves((prev) => new Set(prev).add(lot.ref))}
                t={t}
              />
            </LotCard>
          ))}
        </div>
      )}
    </div>
  );
}

function LotCard({
  lot,
  lang,
  t,
  children,
}: {
  lot: MarketLot;
  lang: string;
  t: Copy;
  children: React.ReactNode;
}) {
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

      <SceauAgrivo sceau={lot.sceau} lang={lang as "fr" | "en"} detaille />

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

      <div className="mt-4">{children}</div>
    </article>
  );
}

function OffreActions({
  lot,
  retire,
  onToggle,
  t,
}: {
  lot: MarketLot;
  retire: boolean;
  onToggle: () => void;
  t: Copy;
}) {
  const vendable = lot.sceau.statut === "verifie";
  if (!vendable) {
    return <p className="text-xs text-amber-cacao">{t.nonVendable}</p>;
  }
  const publie = !retire;
  return (
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
  );
}

function DemandeActions({
  lot,
  reserve,
  onReserve,
  t,
}: {
  lot: MarketLot;
  reserve: boolean;
  onReserve: () => void;
  t: Copy;
}) {
  if (reserve) {
    return (
      <div className="rounded-xl border border-green-signal/30 bg-green-signal/5 p-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-green-signal">
          <Check size={15} /> {t.reserve}
        </p>
        <p className="mt-1 text-xs text-forest-950/70">{t.reserveNote}</p>
        <Link
          href={`/verifier-expedition?ref=${encodeURIComponent(lot.ref)}`}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-green-signal hover:underline"
        >
          <ExternalLink size={13} /> {t.verifier}
        </Link>
      </div>
    );
  }
  return (
    <button
      onClick={onReserve}
      className="inline-flex items-center gap-2 rounded-full bg-green-signal px-4 py-2 text-sm font-medium text-white transition hover:bg-green-signal/90"
    >
      <Ship size={15} /> {t.reserver} <ArrowRight size={15} />
    </button>
  );
}

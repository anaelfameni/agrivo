"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck, ShieldAlert, Boxes, Building2 } from "lucide-react";
import { getFiliere } from "@/config/filieres";
import { type MarketLot } from "@/data/mock-marketplace";
import { VsIceChip } from "@/components/marketplace/cocoa-price";

/** Formatage FCFA compact (18,3 M FCFA) pour les cartes du catalogue. */
function fcfaCompact(n: number, lang: "fr" | "en"): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString(lang === "en" ? "en" : "fr-FR", { maximumFractionDigits: 1 })} M`;
  return n.toLocaleString(lang === "en" ? "en" : "fr-FR");
}
const fcfa = (n: number, lang: "fr" | "en") => n.toLocaleString(lang === "en" ? "en" : "fr-FR");

/**
 * Carte d'un lot du catalogue AGRIVO Market, direction PREMIUM (thème clair).
 * Bandeau d'origine coloré par filière en tête, sceau proéminent, hiérarchie prix/valeur nette,
 * hover-lift + révélation d'une barre d'action. Le sceau domine (Match → Trust → Transact).
 */
export function LotCard({ lot, lang, iceUsdT = null }: { lot: MarketLot; lang: "fr" | "en"; iceUsdT?: number | null }) {
  const en = lang === "en";
  const f = getFiliere(lot.filiere);
  const verifie = lot.sceau.statut === "verifie";
  const reserve = lot.statutMarche === "reserve";

  return (
    <Link
      href={`/marketplace/lot/${lot.ref}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-[0_2px_10px_-6px_rgba(10,31,20,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-green-signal/30 hover:shadow-[0_28px_60px_-30px_rgba(10,31,20,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-signal/60"
    >
      {/* Bandeau d'origine coloré par filière */}
      <div className="relative h-24 overflow-hidden" style={{ background: `linear-gradient(120deg, ${f.couleur}26, ${f.couleur}0d 60%, transparent)` }}>
        <div aria-hidden className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: `radial-gradient(140px 90px at 85% 20%, ${f.couleur}30, transparent)` }} />
        <div className="absolute inset-x-5 top-5 flex items-start justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm" style={{ color: f.couleur }}>
            <f.icone size={13} /> {lot.filiereLabel}
          </span>
          {verifie ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-signal px-2.5 py-1 text-[0.68rem] font-semibold text-white shadow-sm">
              <ShieldCheck size={12} /> {en ? "Sealed" : "Scellé"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-cacao px-2.5 py-1 text-[0.68rem] font-semibold text-white shadow-sm">
              <ShieldAlert size={12} /> {en ? "In prep." : "En prépa."}
            </span>
          )}
        </div>
        <span aria-hidden className="absolute -bottom-6 left-5 text-forest-950/[0.06]"><f.icone size={72} /></span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-forest-950">{lot.nomLot}</h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-forest-950/55">
          <span className="inline-flex items-center gap-1"><MapPin size={12} /> {lot.regions.join(", ")}</span>
          <span className="inline-flex items-center gap-1"><Building2 size={12} /> {lot.cooperatives.length} {en ? (lot.cooperatives.length > 1 ? "coops" : "coop") : lot.cooperatives.length > 1 ? "coops" : "coop"}</span>
          <span className="inline-flex items-center gap-1"><Boxes size={12} /> {lot.nbParcelles} {en ? "plots" : "parcelles"}</span>
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-ivory p-3.5">
          <div>
            <dt className="text-[0.64rem] uppercase tracking-wide text-forest-950/40">{en ? "Tonnage" : "Tonnage"}</dt>
            <dd className="num mt-0.5 text-sm font-semibold text-forest-950">{lot.tonnage.toFixed(1)} t</dd>
          </div>
          <div>
            <dt className="text-[0.64rem] uppercase tracking-wide text-forest-950/40">{en ? "Price" : "Prix indicatif"}</dt>
            <dd className="num mt-0.5 text-sm font-semibold text-forest-950">{fcfa(lot.prixIndicatifFcfaKg, lang)}<span className="text-forest-950/45"> F/kg</span></dd>
          </div>
        </dl>

        {iceUsdT ? <div className="mt-2.5"><VsIceChip prixFcfaKg={lot.prixIndicatifFcfaKg} iceUsdT={iceUsdT} /></div> : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-[0.64rem] uppercase tracking-wide text-forest-950/40">{en ? "Lot value" : "Valeur du lot"}</p>
            <p className="num text-xl font-bold text-forest-950">{fcfaCompact(lot.valeurFcfa, lang)}<span className="text-sm font-semibold text-forest-950/45"> FCFA</span></p>
          </div>
          {reserve ? (
            <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 text-xs font-semibold text-forest-950/60">
              {en ? "Reserved" : "Réservé"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-950 px-3.5 py-2 text-xs font-semibold text-white transition-all group-hover:bg-green-signal">
              {en ? "View file" : "Voir le dossier"} <ArrowUpRight size={14} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

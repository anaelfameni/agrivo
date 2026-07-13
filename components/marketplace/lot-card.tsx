"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck, ShieldAlert, Scale, Boxes } from "lucide-react";
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
 * Carte d'un lot dans le catalogue AGRIVO Market (thème B2B clair).
 * Le SCEAU domine : la confiance avant le prix (« Match → Trust → Transact »). L'entrée animée
 * (stagger) est portée par la grille parente ; ici, hover-lift léger en CSS (transform/opacity).
 */
export function LotCard({ lot, lang, iceUsdT = null }: { lot: MarketLot; lang: "fr" | "en"; iceUsdT?: number | null }) {
  const en = lang === "en";
  const f = getFiliere(lot.filiere);
  const verifie = lot.sceau.statut === "verifie";
  const reserve = lot.statutMarche === "reserve";

  return (
    <Link
      href={`/marketplace/lot/${lot.ref}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-signal/30 hover:shadow-[0_18px_40px_-24px_rgba(10,31,20,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-signal/60"
    >
      <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: f.couleur }} aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${f.couleur}1a`, color: f.couleur }}>
          <f.icone size={13} /> {lot.filiereLabel}
        </span>
        {verifie ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-green-signal/30 bg-green-signal/10 px-2 py-1 text-[0.68rem] font-semibold text-green-signal">
            <ShieldCheck size={12} /> {en ? "Sealed" : "Scellé"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-cacao/30 bg-amber-cacao/10 px-2 py-1 text-[0.68rem] font-semibold text-amber-cacao">
            <ShieldAlert size={12} /> {en ? "In preparation" : "En préparation"}
          </span>
        )}
      </div>

      <h3 className="mt-3.5 font-display text-lg font-semibold leading-snug text-forest-950">{lot.nomLot}</h3>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-forest-950/55">
        <MapPin size={12} /> {lot.regions.join(" · ")}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-black/[0.05] pt-4">
        <div>
          <dt className="text-[0.66rem] uppercase tracking-wide text-forest-950/40">{en ? "Tonnage" : "Tonnage"}</dt>
          <dd className="num mt-0.5 text-sm font-semibold text-forest-950">{lot.tonnage.toFixed(1)} t</dd>
        </div>
        <div>
          <dt className="text-[0.66rem] uppercase tracking-wide text-forest-950/40">{en ? "Indicative price" : "Prix indicatif"}</dt>
          <dd className="num mt-0.5 text-sm font-semibold text-forest-950">{fcfa(lot.prixIndicatifFcfaKg, lang)}<span className="text-forest-950/45"> F/kg</span></dd>
        </div>
      </dl>

      {iceUsdT ? <div className="mt-2"><VsIceChip prixFcfaKg={lot.prixIndicatifFcfaKg} iceUsdT={iceUsdT} /></div> : null}

      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <div>
          <p className="text-[0.66rem] uppercase tracking-wide text-forest-950/40">{en ? "Lot value" : "Valeur du lot"}</p>
          <p className="num text-lg font-bold text-amber-cacao">{fcfaCompact(lot.valeurFcfa, lang)}<span className="text-sm font-semibold text-forest-950/45"> FCFA</span></p>
        </div>
        {reserve ? (
          <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 text-xs font-semibold text-forest-950/60">
            {en ? "Reserved" : "Réservé"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-signal transition-transform group-hover:translate-x-0.5">
            {en ? "View file" : "Voir le dossier"} <ArrowUpRight size={16} />
          </span>
        )}
      </div>

      <p className="mt-3 flex items-center gap-3 text-[0.66rem] text-forest-950/40">
        <span className="inline-flex items-center gap-1"><Boxes size={11} /> {lot.nbParcelles} {en ? "plots" : "parcelles"}</span>
        <span className="inline-flex items-center gap-1"><Scale size={11} /> {lot.cooperatives.length} {en ? (lot.cooperatives.length > 1 ? "coops" : "coop") : lot.cooperatives.length > 1 ? "coopératives" : "coopérative"}</span>
      </p>
    </Link>
  );
}

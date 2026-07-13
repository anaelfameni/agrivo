"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, ShieldCheck, ShieldAlert, Scale, Boxes } from "lucide-react";
import { getFiliere } from "@/config/filieres";
import { type MarketLot } from "@/data/mock-marketplace";

/** Formatage FCFA compact et lisible (18,3 M FCFA) pour les cartes du catalogue. */
function fcfaCompact(n: number, lang: "fr" | "en"): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString(lang === "en" ? "en" : "fr-FR", { maximumFractionDigits: 1 })} M`;
  return n.toLocaleString(lang === "en" ? "en" : "fr-FR");
}
const fcfa = (n: number, lang: "fr" | "en") => n.toLocaleString(lang === "en" ? "en" : "fr-FR");

/**
 * Carte d'un lot dans le catalogue AGRIVO Market (direction premium sombre).
 * Le SCEAU est l'élément dominant : la confiance avant le prix (« Match → Trust → Transact »).
 */
export function LotCard({ lot, lang }: { lot: MarketLot; lang: "fr" | "en" }) {
  const en = lang === "en";
  const f = getFiliere(lot.filiere);
  const verifie = lot.sceau.statut === "verifie";
  const reserve = lot.statutMarche === "reserve";

  return (
    <Link
      href={`/marketplace/lot/${lot.ref}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-signal/70"
    >
      {/* Filet de filière en haut de carte */}
      <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: f.couleur }} aria-hidden />

      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: `${f.couleur}22`, color: f.couleur }}
        >
          <f.icone size={13} /> {lot.filiereLabel}
        </span>
        {verifie ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-green-signal/40 bg-green-signal/15 px-2 py-1 text-[0.68rem] font-semibold text-green-signal">
            <ShieldCheck size={12} /> {en ? "Sealed" : "Scellé"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-cacao/40 bg-amber-cacao/15 px-2 py-1 text-[0.68rem] font-semibold text-amber-soft">
            <ShieldAlert size={12} /> {en ? "In preparation" : "En préparation"}
          </span>
        )}
      </div>

      <h3 className="mt-3.5 font-display text-lg font-semibold leading-snug text-white">{lot.nomLot}</h3>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/55">
        <MapPin size={12} /> {lot.regions.join(" · ")}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
        <div>
          <dt className="text-[0.66rem] uppercase tracking-wide text-white/40">{en ? "Tonnage" : "Tonnage"}</dt>
          <dd className="num mt-0.5 text-sm font-semibold text-white">{lot.tonnage.toFixed(1)} t</dd>
        </div>
        <div>
          <dt className="text-[0.66rem] uppercase tracking-wide text-white/40">{en ? "Indicative price" : "Prix indicatif"}</dt>
          <dd className="num mt-0.5 text-sm font-semibold text-white">{fcfa(lot.prixIndicatifFcfaKg, lang)}<span className="text-white/50"> F/kg</span></dd>
        </div>
      </dl>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-[0.66rem] uppercase tracking-wide text-white/40">{en ? "Lot value" : "Valeur du lot"}</p>
          <p className="num text-lg font-bold text-amber-soft">{fcfaCompact(lot.valeurFcfa, lang)}<span className="text-sm font-semibold text-white/50"> FCFA</span></p>
        </div>
        {reserve ? (
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
            {en ? "Reserved" : "Réservé"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-signal transition-transform group-hover:translate-x-0.5">
            {en ? "View file" : "Voir le dossier"} <ArrowUpRight size={16} />
          </span>
        )}
      </div>

      <p className="mt-3 flex items-center gap-3 text-[0.66rem] text-white/40">
        <span className="inline-flex items-center gap-1"><Boxes size={11} /> {lot.nbParcelles} {en ? "plots" : "parcelles"}</span>
        <span className="inline-flex items-center gap-1"><Scale size={11} /> {lot.cooperatives.length} {en ? (lot.cooperatives.length > 1 ? "coops" : "coop") : lot.cooperatives.length > 1 ? "coopératives" : "coopérative"}</span>
      </p>
    </Link>
  );
}

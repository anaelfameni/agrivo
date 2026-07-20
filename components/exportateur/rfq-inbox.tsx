"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, ExternalLink, Inbox, Mail, Phone } from "lucide-react";
import { formatDate } from "@/data/mock-parcelles";
import {
  lireDemandes,
  ecrireDemandes,
  marquerRepondue,
  resumeDemandes,
  type DemandeCotation,
} from "@/lib/marketplace/rfq";

/**
 * Boîte de réception des demandes de cotation (RFQ) de l'exportateur : les demandes
 * déposées par les acheteurs sur la vitrine publique arrivent ici. L'exportateur
 * répond EN DIRECT (email/téléphone de l'acheteur) puis marque la demande traitée.
 * Démo : persistance localStorage, même navigateur que la vitrine.
 */
const TR = {
  fr: {
    title: "Demandes de cotation",
    lead: "Les demandes déposées par les acheteurs sur la vitrine publique arrivent ici. Répondez-leur en direct : AGRIVO met en relation, aucun paiement sur la plateforme.",
    demo: "Démo : les demandes vivent dans ce navigateur (celles de la vitrine publique du même navigateur).",
    nouvelles: "nouvelles", total: "au total", volume: "t demandées",
    lot: "Lot", volumeCourt: "Volume", incoterm: "Incoterm", pays: "Pays",
    statutNouvelle: "Nouvelle", statutRepondue: "Répondue",
    repondre: "Marquer répondue", fiche: "Fiche du lot",
    empty: "Aucune demande pour l'instant. Elles arrivent dès qu'un acheteur demande une cotation sur une fiche publique.",
  },
  en: {
    title: "Quote requests",
    lead: "Requests submitted by buyers on the public marketplace land here. Reply to them directly: AGRIVO connects both sides, no payment on the platform.",
    demo: "Demo: requests live in this browser (those from the public marketplace in the same browser).",
    nouvelles: "new", total: "in total", volume: "t requested",
    lot: "Lot", volumeCourt: "Volume", incoterm: "Incoterm", pays: "Country",
    statutNouvelle: "New", statutRepondue: "Answered",
    repondre: "Mark as answered", fiche: "Lot file",
    empty: "No request yet. They arrive as soon as a buyer requests a quote on a public lot file.",
  },
} as const;

export function RfqInbox({ lang }: { lang: "fr" | "en" }) {
  const t = TR[lang];
  const reduce = useReducedMotion();
  const [demandes, setDemandes] = useState<DemandeCotation[]>([]);
  useEffect(() => {
    setDemandes(lireDemandes());
  }, []);

  const repondre = (id: string) => {
    setDemandes((prev) => {
      const next = marquerRepondue(prev, id);
      ecrireDemandes(next);
      return next;
    });
  };

  const r = resumeDemandes(demandes);
  const estEmail = (c: string) => c.includes("@");

  return (
    <section className="mt-6 rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Inbox size={17} className="text-green-signal" />
          <h2 className="font-display text-base font-semibold text-forest-950">{t.title}</h2>
          {r.nouvelles > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green-signal px-1.5 text-[0.68rem] font-bold text-white">
              {r.nouvelles}
            </span>
          )}
        </div>
        {r.total > 0 && (
          <p className="num text-xs text-forest-950/50">
            {r.nouvelles} {t.nouvelles} · {r.total} {t.total} · {r.volumeTotalT.toLocaleString(lang === "en" ? "en" : "fr-FR")} {t.volume}
          </p>
        )}
      </div>
      <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-forest-950/55">{t.lead}</p>

      {demandes.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-black/10 bg-ivory/60 p-5 text-center text-xs text-forest-950/50">{t.empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          <AnimatePresence initial={false}>
            {demandes.map((d) => (
              <motion.li
                key={d.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-4 ${d.statut === "nouvelle" ? "border-green-signal/25 bg-green-signal/[0.04]" : "border-black/[0.06] bg-ivory/50"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-forest-950">
                      {d.societe}
                      <span className="ml-2 text-xs font-normal text-forest-950/50">{d.pays}</span>
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-forest-950/60">
                      <span>{t.lot} : <span className="font-medium text-forest-950/80">{d.nomLot}</span> <span className="num text-forest-950/40">({d.refLot})</span></span>
                      <span>{t.volumeCourt} : <span className="num font-semibold text-forest-950">{d.volumeT.toLocaleString(lang === "en" ? "en" : "fr-FR")} t</span></span>
                      <span>{t.incoterm} : {d.incoterm}</span>
                      <span className="num text-forest-950/40">{formatDate(d.dateIso, lang)}</span>
                    </p>
                  </div>
                  {d.statut === "nouvelle" ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-green-signal/30 bg-green-signal/10 px-2.5 py-1 text-[0.68rem] font-semibold text-green-signal">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-signal" /> {t.statutNouvelle}
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-[0.68rem] font-semibold text-forest-950/55">
                      <Check size={11} /> {t.statutRepondue}
                    </span>
                  )}
                </div>

                {d.message && <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs italic leading-relaxed text-forest-950/65">« {d.message} »</p>}

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a
                    href={estEmail(d.contact) ? `mailto:${d.contact}` : `tel:${d.contact.replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-forest-950 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-green-signal"
                  >
                    {estEmail(d.contact) ? <Mail size={13} /> : <Phone size={13} />} {d.contact}
                  </a>
                  {d.statut === "nouvelle" && (
                    <button onClick={() => repondre(d.id)} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-xs font-semibold text-forest-950/70 transition hover:border-green-signal/40 hover:text-green-signal">
                      <Check size={13} /> {t.repondre}
                    </button>
                  )}
                  <Link href={`/marketplace/lot/${d.refLot}`} className="inline-flex items-center gap-1 text-xs font-medium text-forest-950/50 transition hover:text-forest-950">
                    <ExternalLink size={12} /> {t.fiche}
                  </Link>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      <p className="mt-3 text-[0.7rem] text-forest-950/40">{t.demo}</p>
    </section>
  );
}

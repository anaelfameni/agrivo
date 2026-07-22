"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, MessageSquareQuote, Send } from "lucide-react";
import {
  INCOTERMS,
  ajouterDemande,
  construireDemande,
  validerDemande,
  type ErreursDemande,
} from "@/lib/marketplace/rfq";

/**
 * Demande de cotation (RFQ) sur la fiche publique d'un lot : l'acheteur laisse
 * société + contact + volume + incoterm, l'exportateur la retrouve dans « Mes lots ».
 * AGRIVO met en relation : aucun paiement, aucun crédit sur la plateforme.
 */
const TR = {
  fr: {
    title: "Demander une cotation",
    lead: "L'exportateur vous répond en direct. AGRIVO met en relation, aucun paiement sur la plateforme.",
    societe: "Société", societePh: "Ex. Négoce Cacao SA",
    contact: "Email ou téléphone", contactPh: "achats@societe.com",
    pays: "Pays (optionnel)", paysPh: "Ex. France",
    volume: "Volume souhaité (t)", incoterm: "Incoterm",
    message: "Message (optionnel)", messagePh: "Fenêtre de livraison, exigences qualité…",
    send: "Envoyer la demande",
    doneTitle: "Demande transmise",
    doneBody: "Votre demande est dans la boîte de réception de l'exportateur, qui vous recontacte directement avec sa cotation.",
    another: "Nouvelle demande",
  },
  en: {
    title: "Request a quote",
    lead: "The exporter replies to you directly. AGRIVO connects both sides, no payment on the platform.",
    societe: "Company", societePh: "E.g. Cocoa Trading Ltd",
    contact: "Email or phone", contactPh: "buying@company.com",
    pays: "Country (optional)", paysPh: "E.g. Netherlands",
    volume: "Requested volume (t)", incoterm: "Incoterm",
    message: "Message (optional)", messagePh: "Delivery window, quality requirements…",
    send: "Send the request",
    doneTitle: "Request sent",
    doneBody: "Your request is in the exporter's inbox; they will contact you directly with their quote.",
    another: "New request",
  },
} as const;

const fieldCls =
  "w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-sm text-forest-950 placeholder:text-forest-950/35 outline-none transition focus:border-green-signal/60 focus:ring-2 focus:ring-green-signal/15";
const labelCls = "text-[0.68rem] font-semibold uppercase tracking-wide text-forest-950/45";
const errCls = "mt-1 text-xs font-medium text-red-block";

export function RfqPanel({
  refLot,
  nomLot,
  tonnage,
  lang,
}: {
  refLot: string;
  nomLot: string;
  tonnage: number;
  lang: "fr" | "en";
}) {
  const t = TR[lang];
  const reduce = useReducedMotion();

  const [societe, setSociete] = useState("");
  const [contact, setContact] = useState("");
  const [pays, setPays] = useState("");
  const [volume, setVolume] = useState("");
  const [incoterm, setIncoterm] = useState<string>(INCOTERMS[0]);
  const [message, setMessage] = useState("");
  const [erreurs, setErreurs] = useState<ErreursDemande>({});
  const [envoyee, setEnvoyee] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const volumeT = Number(volume.replace(",", "."));
    const errs = validerDemande({ societe, contact, volumeT }, tonnage, lang);
    setErreurs(errs);
    if (Object.keys(errs).length > 0) return;
    ajouterDemande(
      construireDemande({ refLot, nomLot, societe, contact, pays, volumeT, incoterm, message }),
    );
    setEnvoyee(true);
  };

  return (
    <div className="mt-5 rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-green-signal">
        <MessageSquareQuote size={17} />
        <h3 className="font-display text-base font-semibold text-forest-950">{t.title}</h3>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-forest-950/55">{t.lead}</p>

      <AnimatePresence mode="wait" initial={false}>
        {envoyee ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl border border-green-signal/30 bg-green-signal/10 p-4"
          >
            <p className="flex items-center gap-1.5 text-sm font-semibold text-green-signal">
              <Check size={16} /> {t.doneTitle}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-forest-950/60">{t.doneBody}</p>
            <button
              onClick={() => {
                setEnvoyee(false);
                setVolume("");
                setMessage("");
              }}
              className="mt-3 text-xs font-semibold text-forest-950/55 underline-offset-2 transition hover:text-forest-950 hover:underline"
            >
              {t.another}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            noValidate
            className="mt-4 space-y-3"
          >
            <div>
              <label className={labelCls} htmlFor={`rfq-societe-${refLot}`}>{t.societe}</label>
              <input id={`rfq-societe-${refLot}`} value={societe} onChange={(e) => setSociete(e.target.value)} placeholder={t.societePh} className={`mt-1 ${fieldCls}`} />
              {erreurs.societe && <p className={errCls}>{erreurs.societe}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor={`rfq-contact-${refLot}`}>{t.contact}</label>
              <input id={`rfq-contact-${refLot}`} value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t.contactPh} className={`mt-1 ${fieldCls}`} />
              {erreurs.contact && <p className={errCls}>{erreurs.contact}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor={`rfq-volume-${refLot}`}>{t.volume}</label>
                <input id={`rfq-volume-${refLot}`} value={volume} onChange={(e) => setVolume(e.target.value)} inputMode="decimal" placeholder={tonnage.toFixed(1)} className={`num mt-1 ${fieldCls}`} />
              </div>
              <div>
                <label className={labelCls} htmlFor={`rfq-incoterm-${refLot}`}>{t.incoterm}</label>
                <select id={`rfq-incoterm-${refLot}`} value={incoterm} onChange={(e) => setIncoterm(e.target.value)} className={`mt-1 ${fieldCls}`}>
                  {INCOTERMS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            {erreurs.volumeT && <p className={errCls}>{erreurs.volumeT}</p>}
            <div>
              <label className={labelCls} htmlFor={`rfq-pays-${refLot}`}>{t.pays}</label>
              <input id={`rfq-pays-${refLot}`} value={pays} onChange={(e) => setPays(e.target.value)} placeholder={t.paysPh} className={`mt-1 ${fieldCls}`} />
            </div>
            <div>
              <label className={labelCls} htmlFor={`rfq-message-${refLot}`}>{t.message}</label>
              <textarea id={`rfq-message-${refLot}`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.messagePh} rows={3} className={`mt-1 resize-none ${fieldCls}`} />
            </div>
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-signal">
              <Send size={15} /> {t.send}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

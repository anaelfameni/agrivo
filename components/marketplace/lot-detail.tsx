"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft, ShieldCheck, MapPin, Boxes, FileDown, Handshake, Lock, Check, ExternalLink,
  Ship, CalendarDays, ClipboardCheck, AlertTriangle, Building2, Anchor, ArrowRight, ScanLine,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/components/auth-provider";
import { getFiliere } from "@/config/filieres";
import { PARCELLES, STATUT_LABEL, STATUT_PHRASE, STATUT_PHRASE_EN, fmtHa, type Statut } from "@/data/mock-parcelles";
import { controleEmbarquement } from "@/data/mock-expeditions";
import {
  findMarketLot, findMarketExpedition, parcellesDuLot, takeRate, estVendable,
} from "@/data/mock-marketplace";
import { SceauAgrivo } from "@/components/marketplace/sceau-agrivo";

const LotMap = dynamic(() => import("@/components/exportateur/portfolio-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" aria-hidden />,
});

const STATUT_LABEL_EN: Record<Statut, string> = { conforme: "Compliant", anomalie: "Anomaly detected", insuffisant: "Insufficient data" };

const TR = {
  fr: {
    back: "Retour au catalogue", campagne: "Campagne", port: "Port de départ", vessel: "Navire · conteneur",
    mapTitle: "Parcelles d'origine", mapSub: "Chaque polygone est une parcelle géolocalisée et évaluée par satellite.",
    dossierTitle: "Dossier de confiance", dossierSub: "Le double verrou, parcelle par parcelle : carte producteur (État) + polygone hors-déforestation.",
    farmer: "Producteur", card: "Carte producteur", cert: "Certificat", area: "Superficie", status: "Statut",
    controlTitle: "Contrôle d'intégrité (pré-embarquement)", controlSub: "Faits recalculés depuis les données du lot — jamais un score inventé.",
    logisticsTitle: "Origine & logistique", coops: "Coopératives", regions: "Régions", sh: "Code SH",
    txTitle: "Transaction", price: "Prix indicatif", tonnage: "Tonnage", value: "Valeur du lot",
    commission: "Commission AGRIVO estimée", commissionNote: "Take-rate 1–3 % selon le lot · estimation à 2 %. La commission porte sur la transaction, jamais sur le producteur.",
    reserve: "Réserver ce lot", reserved: "Lot déjà réservé", reservedBy: "Réservé par",
    prep: "Sceau en préparation — ce lot n'est pas réservable tant que le double verrou n'est pas vérifié.",
    loginTitle: "Connectez-vous pour réserver", loginBody: "Parcourir la marketplace est libre. La réservation d'un lot demande un compte, pour vous mettre en relation avec l'exportateur.",
    login: "Se connecter", createAccount: "Créer un compte",
    doneTitle: "Réservation enregistrée", doneBody: "AGRIVO vous met en relation avec l'exportateur pour finaliser la transaction en direct. Aucun paiement n'a lieu sur la plateforme.",
    pdfFiche: "Télécharger le dossier lot (PDF)", pdfReserve: "Bon de réservation (PDF)",
    verify: "Vérifier la référence", notFound: "Lot introuvable", notFoundBody: "Ce lot n'existe pas ou n'est plus au catalogue.",
    producerNeverPays: "Le producteur ne paie jamais.",
  },
  en: {
    back: "Back to catalog", campagne: "Harvest", port: "Departure port", vessel: "Vessel · container",
    mapTitle: "Plots of origin", mapSub: "Each polygon is a geolocated plot assessed by satellite.",
    dossierTitle: "Trust dossier", dossierSub: "The double lock, plot by plot: producer card (State) + deforestation-free polygon.",
    farmer: "Farmer", card: "Producer card", cert: "Certificate", area: "Area", status: "Status",
    controlTitle: "Integrity control (pre-shipment)", controlSub: "Facts recomputed from the lot's data — never an invented score.",
    logisticsTitle: "Origin & logistics", coops: "Cooperatives", regions: "Regions", sh: "HS code",
    txTitle: "Transaction", price: "Indicative price", tonnage: "Tonnage", value: "Lot value",
    commission: "Estimated AGRIVO commission", commissionNote: "Take-rate 1–3% per lot · estimate at 2%. The commission applies to the transaction, never to the producer.",
    reserve: "Reserve this lot", reserved: "Lot already reserved", reservedBy: "Reserved by",
    prep: "Seal in preparation — this lot cannot be reserved until the double lock is verified.",
    loginTitle: "Log in to reserve", loginBody: "Browsing the marketplace is free. Reserving a lot requires an account, to connect you with the exporter.",
    login: "Log in", createAccount: "Create account",
    doneTitle: "Reservation recorded", doneBody: "AGRIVO connects you with the exporter to finalise the transaction directly. No payment takes place on the platform.",
    pdfFiche: "Download lot file (PDF)", pdfReserve: "Reservation voucher (PDF)",
    verify: "Verify the reference", notFound: "Lot not found", notFoundBody: "This lot does not exist or is no longer in the catalog.",
    producerNeverPays: "The producer never pays.",
  },
} as const;

const fcfa = (n: number, lang: "fr" | "en") => n.toLocaleString(lang === "en" ? "en" : "fr-FR");

export function LotDetail({ refLot }: { refLot: string }) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];

  const lot = useMemo(() => findMarketLot(refLot, PARCELLES), [refLot]);
  const exp = useMemo(() => findMarketExpedition(refLot), [refLot]);
  const parcelles = useMemo(() => (lot ? parcellesDuLot(lot) : []), [lot]);
  const controle = useMemo(() => (exp ? controleEmbarquement(exp, PARCELLES) : null), [exp]);

  const [reserved, setReserved] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (!lot || !exp) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-white">{t.notFound}</h1>
        <p className="mt-3 text-white/60">{t.notFoundBody}</p>
        <Link href="/marketplace" className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-signal px-5 py-2.5 text-sm font-semibold text-white">
          <ArrowLeft size={16} /> {t.back}
        </Link>
      </div>
    );
  }

  const f = getFiliere(lot.filiere);
  const isReserved = lot.statutMarche === "reserve";
  const vendable = estVendable(lot);
  const buyerName = user?.organisation || user?.nom;

  const onPdf = async (kind: "fiche" | "reservation") => {
    const { telechargerLotPdf } = await import("@/components/marketplace/lot-pdf");
    await telechargerLotPdf(exp, lot, l, kind, kind === "reservation" ? buyerName : undefined);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition hover:text-white">
        <ArrowLeft size={16} /> {t.back}
      </Link>

      {/* En-tête du lot */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${f.couleur}22`, color: f.couleur }}>
          <f.icone size={14} /> {lot.filiereLabel}
        </span>
        <SceauAgrivo sceau={lot.sceau} lang={l} tone="dark" />
        {isReserved && <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">{t.reserved}</span>}
      </div>
      <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">{lot.nomLot}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/55">
        <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {lot.regions.join(" · ")}</span>
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {t.campagne} {lot.campagne}</span>
        <span className="inline-flex items-center gap-1.5"><Boxes size={14} /> {lot.nbParcelles} {l === "en" ? "plots" : "parcelles"}</span>
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ------------------------------ COLONNE PRINCIPALE ------------------------------ */}
        <div className="space-y-8">
          {/* Sceau détaillé */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-2 text-green-signal">
              <ShieldCheck size={18} />
              <h2 className="font-display text-lg font-semibold text-white">{l === "en" ? "The AGRIVO seal" : "Le sceau AGRIVO"}</h2>
            </div>
            <div className="mt-4"><SceauAgrivo sceau={lot.sceau} lang={l} tone="dark" detaille /></div>
          </section>

          {/* Mini-carte */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-2 text-green-signal">
              <MapPin size={18} />
              <h2 className="font-display text-lg font-semibold text-white">{t.mapTitle}</h2>
            </div>
            <p className="mt-1.5 text-sm text-white/55">{t.mapSub}</p>
            <div className="mt-4 h-[340px] w-full overflow-hidden rounded-2xl border border-white/10">
              <LotMap parcelles={parcelles} selectedId={null} hoveredId={null} onSelect={() => {}} onHover={() => {}} />
            </div>
          </section>

          {/* Dossier de confiance — tableau parcelles */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-2 text-green-signal">
              <ScanLine size={18} />
              <h2 className="font-display text-lg font-semibold text-white">{t.dossierTitle}</h2>
            </div>
            <p className="mt-1.5 text-sm text-white/55">{t.dossierSub}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[0.68rem] uppercase tracking-wide text-white/45">
                    <th className="py-2 pr-3 font-semibold">{t.farmer}</th>
                    <th className="py-2 pr-3 font-semibold">{t.card}</th>
                    <th className="py-2 pr-3 font-semibold">{t.cert}</th>
                    <th className="py-2 pr-3 font-semibold">DDR</th>
                    <th className="py-2 pr-3 font-semibold">{t.area}</th>
                    <th className="py-2 font-semibold">{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {parcelles.map((p) => (
                    <tr key={p.id} className="border-b border-white/[0.06] last:border-0">
                      <td className="py-2.5 pr-3 text-white/90">{p.producteurNom}</td>
                      <td className="num py-2.5 pr-3 text-white/70">{p.numeroCartePro}</td>
                      <td className="num py-2.5 pr-3 text-white/70">{p.numeroCertificat}</td>
                      <td className="num py-2.5 pr-3 text-white/70">{p.referenceDDR ?? "—"}</td>
                      <td className="num py-2.5 pr-3 text-white/70">{fmtHa(p.superficieHa)}</td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${p.statut === "conforme" ? "text-green-signal" : p.statut === "anomalie" ? "text-red-block" : "text-amber-soft"}`}>
                          {p.statut === "conforme" ? <Check size={13} /> : <AlertTriangle size={13} />}
                          {(l === "en" ? STATUT_LABEL_EN : STATUT_LABEL)[p.statut]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-white/45">
              {l === "en" ? STATUT_PHRASE_EN.conforme : STATUT_PHRASE.conforme}
            </p>
          </section>

          {/* Contrôle d'intégrité */}
          {controle && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center gap-2 text-green-signal">
                <ClipboardCheck size={18} />
                <h2 className="font-display text-lg font-semibold text-white">{t.controlTitle}</h2>
              </div>
              <p className="mt-1.5 text-sm text-white/55">{t.controlSub}</p>
              <ul className="mt-4 space-y-2.5">
                {controle.points.map((pt) => (
                  <li key={pt.code} className="flex items-start gap-2.5 text-sm">
                    <span className={`mt-0.5 shrink-0 ${pt.niveau === "ok" ? "text-green-signal" : "text-amber-soft"}`}>
                      {pt.niveau === "ok" ? <Check size={16} /> : <AlertTriangle size={16} />}
                    </span>
                    <span className="text-white/75">{l === "en" ? pt.en : pt.fr}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Origine & logistique */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-lg font-semibold text-white">{t.logisticsTitle}</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
              <Field icon={<Building2 size={14} />} label={t.coops} value={lot.cooperatives.join(", ")} />
              <Field icon={<MapPin size={14} />} label={t.regions} value={lot.regions.join(", ")} />
              <Field icon={<Anchor size={14} />} label={t.port} value={lot.portDepart} />
              <Field icon={<CalendarDays size={14} />} label={t.campagne} value={lot.campagne} />
              <Field icon={<Ship size={14} />} label={t.vessel} value={exp.navire ? `${exp.navire}${exp.numeroConteneur ? ` · ${exp.numeroConteneur}` : ""}` : "—"} mono />
              <Field label={t.sh} value={exp.codeSH} mono />
            </dl>
          </section>
        </div>

        {/* ------------------------------ COLONNE TRANSACTION ------------------------------ */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6">
            <span className="eyebrow text-white/45">{t.txTitle}</span>

            <div className="mt-4 space-y-3">
              <Line label={t.price} value={`${fcfa(lot.prixIndicatifFcfaKg, l)} FCFA/kg`} />
              <Line label={t.tonnage} value={`${lot.tonnage.toFixed(1)} t`} />
              <div className="border-t border-white/10 pt-3">
                <p className="text-[0.66rem] uppercase tracking-wide text-white/45">{t.value}</p>
                <p className="num mt-1 text-2xl font-bold text-amber-soft">{fcfa(lot.valeurFcfa, l)}<span className="text-base font-semibold text-white/50"> FCFA</span></p>
              </div>
              <div className="rounded-xl border border-green-signal/25 bg-green-signal/[0.08] p-3">
                <p className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{t.commission}</span>
                  <span className="num font-semibold text-green-signal">{fcfa(takeRate(lot.valeurFcfa), l)} F</span>
                </p>
                <p className="mt-1.5 text-[0.7rem] leading-relaxed text-white/45">{t.commissionNote}</p>
              </div>
            </div>

            {/* Action de réservation (gatée) */}
            <div className="mt-5">
              {isReserved ? (
                <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-sm">
                  <p className="font-semibold text-white/80">{t.reserved}</p>
                  {lot.acheteur && <p className="mt-1 text-white/55">{t.reservedBy} {lot.acheteur}{lot.paysAcheteur && lot.paysAcheteur !== "—" ? ` · ${lot.paysAcheteur}` : ""}</p>}
                </div>
              ) : !vendable ? (
                <p className="rounded-xl border border-amber-cacao/30 bg-amber-cacao/10 p-4 text-xs leading-relaxed text-amber-soft">{t.prep}</p>
              ) : reserved ? (
                <div className="rounded-xl border border-green-signal/30 bg-green-signal/10 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-green-signal"><Check size={16} /> {t.doneTitle}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/60">{t.doneBody}</p>
                  <button onClick={() => onPdf("reservation")} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-signal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-signal/90">
                    <FileDown size={15} /> {t.pdfReserve}
                  </button>
                </div>
              ) : showLogin && !user ? (
                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-white"><Lock size={15} /> {t.loginTitle}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/60">{t.loginBody}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <Link href={`/connexion?next=${encodeURIComponent(`/marketplace/lot/${lot.ref}`)}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-green-signal px-4 py-2.5 text-sm font-semibold text-white">
                      {t.login} <ArrowRight size={15} />
                    </Link>
                    <Link href="/inscription" className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/5">
                      {t.createAccount}
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => (user ? setReserved(true) : setShowLogin(true))}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-signal px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-signal/20 transition hover:bg-green-signal/90"
                >
                  <Handshake size={16} /> {t.reserve}
                </button>
              )}
            </div>

            <p className="mt-3 text-center text-[0.7rem] font-medium text-white/40">{t.producerNeverPays}</p>

            {/* Documents publics */}
            <div className="mt-5 space-y-2 border-t border-white/10 pt-5">
              <button onClick={() => onPdf("fiche")} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5">
                <FileDown size={15} /> {t.pdfFiche}
              </button>
              <Link href={`/verifier-expedition?ref=${encodeURIComponent(lot.ref)}`} className="inline-flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-white/50 transition hover:text-white">
                <ExternalLink size={13} /> {t.verify}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ icon, label, value, mono }: { icon?: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-wide text-white/45">{icon}{label}</dt>
      <dd className={`mt-1 text-white/85 ${mono ? "num text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center justify-between text-sm">
      <span className="text-white/60">{label}</span>
      <span className="num font-semibold text-white">{value}</span>
    </p>
  );
}

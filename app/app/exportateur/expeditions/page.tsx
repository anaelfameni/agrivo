"use client";

/**
 * Expéditions (espace exportateur) — traçabilité DOCUMENTAIRE de la parcelle au conteneur.
 *
 * Chaque lot est composé EXCLUSIVEMENT de parcelles évaluées « Conforme » (ségrégation RDUE :
 * le bilan de masse est interdit) et chaque tonnage est réconcilié contre le plafond anti-fraude
 * (superficie × rendement régional). Le dossier du conteneur : GeoJSON TRACES NT des parcelles
 * d'origine, certificats vérifiables, 5 jalons DÉCLARATIFS (saisis — AGRIVO ne suit pas
 * physiquement les sacs, terrain du SNT national), QR de vérification publique, résumé IA.
 */

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Anchor,
  CheckCircle2,
  ChevronRight,
  Container,
  Download,
  FileCheck2,
  Plus,
  QrCode,
  Ship,
  Sparkles,
  Warehouse,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  EXPEDITIONS,
  JALONS_ORDRE,
  JALON_LABEL,
  composerExpedition,
  expeditionFeatureCollection,
  parcellesExpedition,
  plafondTonnes,
  progressionExpedition,
  statutExpedition,
  tonnageExpedition,
  type Expedition,
  type JalonCode,
} from "@/data/mock-expeditions";
import { PARCELLES, FILIERE_LABEL, fmtHa, formatDate, type Parcelle } from "@/data/mock-parcelles";

const PortfolioMap = dynamic(() => import("@/components/exportateur/portfolio-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-forest-950/10" aria-hidden />,
});

const COPY = {
  fr: {
    eyebrow: "Espace exportateur",
    titre: "Expéditions",
    sous: "Le dossier RDUE de chaque conteneur : parcelles d'origine géolocalisées, volumes réconciliés, jalons documentaires — prêt pour votre déclaration TRACES NT.",
    segregation: "Ségrégation stricte : seules des parcelles évaluées « Conforme » peuvent composer un lot. Jalons déclaratifs, saisis à chaque étape.",
    lots: "Dossiers d'expédition",
    composer: "Composer une expédition",
    fermer: "Fermer",
    parcellesDuLot: "Parcelles d'origine du lot",
    producteur: "Producteur",
    cooperative: "Coopérative",
    certificat: "Certificat",
    tonnage: "Tonnage",
    plafond: "plafond",
    reconciliation: "Réconciliation des volumes",
    reconciliationOk: "Chaque tonnage prélevé est inférieur ou égal au plafond anti-fraude de sa parcelle (superficie × rendement régional) et 100 % des parcelles du lot sont évaluées « Conforme ».",
    jalons: "Jalons documentaires",
    exporterGeojson: "GeoJSON du lot (TRACES NT)",
    voirQr: "QR de vérification publique",
    masquerQr: "Masquer le QR",
    qrLegende: "Scannez : la page publique confirme le dossier — parcelles, tonnage, jalons.",
    resumeIa: "Générer le résumé exécutif (IA)",
    resumeEnCours: "Rédaction du résumé…",
    live: "Rédigé par Gemini · IA en direct",
    demo: "Mode démonstration",
    total: "Total",
    parcelles: "parcelles",
    navire: "Navire",
    conteneur: "Conteneur",
    acheteur: "Acheteur",
    codeSH: "Code SH",
    ports: "Trajet",
    creeLe: "Composé le",
    carteTitre: "Les parcelles du lot, vues du ciel",
    composerTitre: "Composer une expédition (démonstration)",
    composerSous: "Sélectionnez des parcelles : la ségrégation se voit — les parcelles non conformes sont refusées d'office, et chaque tonnage est borné par le plafond de sa parcelle.",
    nomLot: "Nom du lot",
    nomLotDefaut: "Nouveau lot cacao",
    refuse: "Refusée :",
    refusNonConforme: "statut non conforme (ségrégation)",
    creerLot: "Créer le dossier du lot",
    lotCree: "Dossier créé (session de démonstration) — il apparaît dans la liste ci-dessus.",
    session: "Session",
    t: "t",
    disclaimer: "Suivi documentaire : les jalons sont déclarés par vos équipes. AGRIVO trace le dossier de conformité — l'opérateur reste seul responsable de sa déclaration de diligence raisonnée (DDS).",
  },
  en: {
    eyebrow: "Exporter workspace",
    titre: "Shipments",
    sous: "The EUDR file of every container: geolocated plots of origin, reconciled volumes, documentary milestones — ready for your TRACES NT statement.",
    segregation: "Strict segregation: only plots assessed \"Compliant\" can compose a lot. Declarative milestones, recorded at each step.",
    lots: "Shipment files",
    composer: "Compose a shipment",
    fermer: "Close",
    parcellesDuLot: "Plots of origin in this lot",
    producteur: "Farmer",
    cooperative: "Cooperative",
    certificat: "Certificate",
    tonnage: "Tonnage",
    plafond: "cap",
    reconciliation: "Volume reconciliation",
    reconciliationOk: "Every tonnage drawn is at or below its plot's anti-fraud cap (area × regional yield) and 100% of the lot's plots are assessed \"Compliant\".",
    jalons: "Documentary milestones",
    exporterGeojson: "Lot GeoJSON (TRACES NT)",
    voirQr: "Public verification QR",
    masquerQr: "Hide QR",
    qrLegende: "Scan it: the public page confirms the file — plots, tonnage, milestones.",
    resumeIa: "Generate the executive summary (AI)",
    resumeEnCours: "Writing the summary…",
    live: "Written by Gemini · live AI",
    demo: "Demo mode",
    total: "Total",
    parcelles: "plots",
    navire: "Vessel",
    conteneur: "Container",
    acheteur: "Buyer",
    codeSH: "HS code",
    ports: "Route",
    creeLe: "Composed on",
    carteTitre: "The lot's plots, seen from above",
    composerTitre: "Compose a shipment (demo)",
    composerSous: "Select plots: segregation is visible — non-compliant plots are rejected outright, and each tonnage is capped by its plot.",
    nomLot: "Lot name",
    nomLotDefaut: "New cocoa lot",
    refuse: "Rejected:",
    refusNonConforme: "non-compliant status (segregation)",
    creerLot: "Create the lot file",
    lotCree: "File created (demo session) — it now appears in the list above.",
    session: "Session",
    t: "t",
    disclaimer: "Documentary tracking: milestones are declared by your teams. AGRIVO traces the compliance file — the operator remains solely responsible for its due diligence statement (DDS).",
  },
} as const;

const JALON_ICONS: Record<JalonCode, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  "compose": FileCheck2,
  "depart-coop": ChevronRight,
  "recu-port": Warehouse,
  "embarque": Ship,
  "arrive-ue": Anchor,
};

export default function ExpeditionsPage() {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const reduce = useReducedMotion() ?? false;
  const [locales, setLocales] = React.useState<Expedition[]>([]);
  const toutes = React.useMemo(() => [...locales, ...EXPEDITIONS], [locales]);
  const [selId, setSelId] = React.useState<string>(EXPEDITIONS[0].id);
  const sel = toutes.find((e) => e.id === selId) ?? EXPEDITIONS[0];
  const [composerOuvert, setComposerOuvert] = React.useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow text-green-signal">{t.eyebrow}</p>
        <h1 className="mt-1.5 font-display text-3xl leading-tight text-forest-950">{t.titre}</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-stone-500">{t.sous}</p>
        <p className="mt-2 inline-flex max-w-2xl items-start gap-2 rounded-lg bg-green-signal/10 px-3 py-2 text-xs leading-relaxed text-forest-950">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-signal" strokeWidth={2} aria-hidden />
          {t.segregation}
        </p>
      </div>

      {/* Liste des dossiers */}
      <section aria-label={t.lots}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-forest-950">{t.lots}</h2>
          <button
            type="button"
            onClick={() => setComposerOuvert((v) => !v)}
            className="btn-green inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal"
          >
            {composerOuvert ? <X size={14} strokeWidth={2.25} aria-hidden /> : <Plus size={14} strokeWidth={2.25} aria-hidden />}
            {composerOuvert ? t.fermer : t.composer}
          </button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {toutes.map((exp) => {
            const prog = progressionExpedition(exp);
            const actif = exp.id === sel.id;
            return (
              <button
                key={exp.id}
                type="button"
                onClick={() => setSelId(exp.id)}
                aria-pressed={actif}
                className={`card-premium rounded-2xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-green-signal ${
                  actif ? "border-green-signal/60 bg-white shadow-md" : "border-black/[0.07] bg-white/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-xs text-forest-950">{exp.ref}</p>
                  {locales.some((l) => l.id === exp.id) && (
                    <span className="rounded-full bg-amber-cacao/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-cacao">
                      {t.session}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-1 text-sm font-semibold text-forest-950">{exp.nomLot}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {tonnageExpedition(exp)} {t.t} · {exp.parcelleIds.length} {t.parcelles} · {FILIERE_LABEL[exp.filiere]}
                </p>
                <div className="mt-3 flex items-center gap-1" aria-hidden>
                  {JALONS_ORDRE.map((code, i) => (
                    <span
                      key={code}
                      className={`h-1.5 flex-1 rounded-full ${i < prog ? "bg-green-signal" : "bg-forest-950/10"}`}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-green-signal">
                  {JALON_LABEL[statutExpedition(exp).code][lang]}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {composerOuvert && <Composer t={t} lang={lang} onCree={(exp) => { setLocales((l) => [exp, ...l]); setSelId(exp.id); setComposerOuvert(false); }} />}

      <DetailExpedition key={sel.id} exp={sel} t={t} lang={lang} reduce={reduce} />

      <p className="max-w-3xl text-xs leading-relaxed text-stone-500">{t.disclaimer}</p>
    </div>
  );
}

/* ------------------------------- Détail d'un dossier ------------------------------- */

function DetailExpedition({
  exp,
  t,
  lang,
  reduce,
}: {
  exp: Expedition;
  t: (typeof COPY)[keyof typeof COPY];
  lang: "fr" | "en";
  reduce: boolean;
}) {
  const parcelles = parcellesExpedition(exp);
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [mapSel, setMapSel] = React.useState<string | null>(null);
  const [qr, setQr] = React.useState<string | null>(null);
  const [qrVisible, setQrVisible] = React.useState(false);
  const [resume, setResume] = React.useState<{ texte: string; live: boolean } | null>(null);
  const [resumeEnCours, setResumeEnCours] = React.useState(false);
  const urlPublique = `https://agrivo-io.vercel.app/verifier-expedition?ref=${exp.ref}`;

  const montrerQr = React.useCallback(async () => {
    if (!qr) {
      const QRCode = (await import("qrcode")).default;
      setQr(await QRCode.toDataURL(urlPublique, { width: 240, margin: 1, color: { dark: "#0a1f14", light: "#ffffff" } }));
    }
    setQrVisible((v) => !v);
  }, [qr, urlPublique]);

  const telechargerGeojson = React.useCallback(() => {
    const fc = expeditionFeatureCollection(exp);
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/geo+json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `agrivo-expedition-${exp.ref}.geojson`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [exp]);

  const genererResume = React.useCallback(async () => {
    setResumeEnCours(true);
    try {
      const r = await fetch("/api/gemini/expedition-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: exp.ref, lang }),
      });
      const data = (await r.json()) as { resume?: string; live?: boolean };
      if (data.resume) setResume({ texte: data.resume, live: data.live === true });
    } catch {
      /* silencieux : le bouton reste disponible */
    } finally {
      setResumeEnCours(false);
    }
  }, [exp.ref, lang]);

  return (
    <motion.section
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={exp.ref}
      className="rounded-2xl border border-black/[0.07] bg-white p-5"
    >
      {/* En-tête du dossier */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-forest-950">{exp.ref}</p>
          <h2 className="mt-0.5 font-display text-xl text-forest-950">{exp.nomLot}</h2>
          <p className="mt-1 text-xs text-stone-500">
            {t.acheteur} : <span className="font-medium text-forest-950">{exp.acheteur}</span>
            {exp.paysAcheteur !== "—" ? ` · ${exp.paysAcheteur}` : ""} · {t.codeSH} {exp.codeSH} · {t.creeLe}{" "}
            {formatDate(exp.creeLe, lang)}
          </p>
          <p className="mt-0.5 text-xs text-stone-500">
            {t.ports} : {exp.portDepart} → {exp.portArrivee}
            {exp.navire ? ` · ${t.navire} ${exp.navire}` : ""}
            {exp.numeroConteneur ? ` · ${t.conteneur} ${exp.numeroConteneur}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="num text-2xl font-semibold text-forest-950">
            {tonnageExpedition(exp)} {t.t}
          </p>
          <p className="text-xs text-stone-500">
            {exp.parcelleIds.length} {t.parcelles} · {FILIERE_LABEL[exp.filiere]}
          </p>
        </div>
      </div>

      {/* Jalons */}
      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t.jalons}</h3>
        <ol className="mt-2 grid gap-2 sm:grid-cols-5">
          {JALONS_ORDRE.map((code, i) => {
            const jalon = exp.jalons.find((j) => j.code === code);
            const atteint = Boolean(jalon);
            const Icon = JALON_ICONS[code];
            return (
              <li
                key={code}
                className={`rounded-xl border p-2.5 ${atteint ? "border-green-signal/40 bg-green-signal/[0.07]" : "border-black/[0.06] bg-ivory/60"}`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={14} strokeWidth={2} className={atteint ? "text-green-signal" : "text-stone-400"} aria-hidden />
                  <p className={`text-[11px] font-semibold leading-tight ${atteint ? "text-forest-950" : "text-stone-400"}`}>
                    {i + 1}. {JALON_LABEL[code][lang]}
                  </p>
                </div>
                {jalon && (
                  <p className="mt-1 text-[10px] leading-snug text-stone-500">
                    {formatDate(jalon.date, lang)}
                    {jalon.note ? ` · ${jalon.note[lang]}` : ""}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Parcelles + carte */}
      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t.parcellesDuLot}</h3>
          <div className="scroll-slim mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-[11px] uppercase tracking-wide text-stone-500">
                  <th className="py-2 pr-3 font-medium">{t.producteur}</th>
                  <th className="py-2 pr-3 font-medium">{t.cooperative}</th>
                  <th className="py-2 pr-3 font-medium">{t.certificat}</th>
                  <th className="py-2 pr-3 text-right font-medium">
                    {t.tonnage} <span className="normal-case">({t.plafond})</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {parcelles.map((p) => (
                  <tr
                    key={p.id}
                    onMouseEnter={() => setHoverId(p.id)}
                    onMouseLeave={() => setHoverId(null)}
                    className={`border-b border-black/[0.04] transition-colors ${hoverId === p.id ? "bg-green-signal/[0.06]" : ""}`}
                  >
                    <td className="py-2 pr-3">
                      <p className="font-medium text-forest-950">{p.producteurNom}</p>
                      <p className="text-[11px] text-stone-500">{fmtHa(p.superficieHa)}</p>
                    </td>
                    <td className="max-w-[11rem] truncate py-2 pr-3 text-stone-600">{p.cooperative}</td>
                    <td className="py-2 pr-3">
                      <Link
                        href={`/verifier-certificat?ref=${p.numeroCertificat}`}
                        className="font-mono text-xs text-green-signal underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-green-signal"
                      >
                        {p.numeroCertificat}
                      </Link>
                    </td>
                    <td className="num py-2 pr-1 text-right text-forest-950">
                      {exp.tonnages[p.id] ?? 0} {t.t}
                      <span className="ml-1 text-[11px] text-stone-400">
                        (≤ {Math.round(plafondTonnes(p) * 100) / 100})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-xl border border-green-signal/25 bg-green-signal/[0.06] p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-forest-950">
              <CheckCircle2 size={14} className="text-green-signal" strokeWidth={2.25} aria-hidden />
              {t.reconciliation}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-stone-600">{t.reconciliationOk}</p>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={telechargerGeojson}
              className="btn-green inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal"
            >
              <Download size={14} strokeWidth={2.25} aria-hidden />
              {t.exporterGeojson}
            </button>
            <button
              type="button"
              onClick={montrerQr}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest-950/20 px-4 py-2 text-xs font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal focus-visible:ring-2 focus-visible:ring-green-signal"
            >
              <QrCode size={14} strokeWidth={2.25} aria-hidden />
              {qrVisible ? t.masquerQr : t.voirQr}
            </button>
            <button
              type="button"
              onClick={genererResume}
              disabled={resumeEnCours}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest-950/20 px-4 py-2 text-xs font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal focus-visible:ring-2 focus-visible:ring-green-signal disabled:opacity-60"
            >
              <Sparkles size={14} strokeWidth={2.25} aria-hidden />
              {resumeEnCours ? t.resumeEnCours : t.resumeIa}
            </button>
          </div>

          {qrVisible && qr && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-black/[0.07] bg-ivory/70 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt={`QR — ${urlPublique}`} className="h-28 w-28 rounded-lg border border-black/[0.06] bg-white" />
              <div>
                <p className="text-xs font-medium text-forest-950">{t.qrLegende}</p>
                <p className="mt-1 break-all font-mono text-[10px] text-stone-500">{urlPublique}</p>
              </div>
            </div>
          )}

          {resume && (
            <div className="mt-3 rounded-xl border border-black/[0.07] bg-white p-3.5">
              <p
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                  resume.live ? "bg-green-signal/15 text-green-signal" : "bg-forest-950/[0.06] text-stone-500"
                }`}
              >
                <Sparkles size={11} strokeWidth={2.25} aria-hidden />
                {resume.live ? t.live : t.demo}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">{resume.texte}</p>
            </div>
          )}
        </div>

        <div className="min-h-[320px]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t.carteTitre}</h3>
          <div className="mt-2 h-[320px] xl:h-[calc(100%-1.75rem)]">
            <PortfolioMap
              parcelles={parcelles}
              selectedId={mapSel}
              hoveredId={hoverId}
              onSelect={(id: string) => setMapSel(id)}
              onHover={(id: string | null) => setHoverId(id)}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------- Composeur de lot ------------------------------- */

function Composer({
  t,
  lang,
  onCree,
}: {
  t: (typeof COPY)[keyof typeof COPY];
  lang: "fr" | "en";
  onCree: (exp: Expedition) => void;
}) {
  const [nom, setNom] = React.useState("");
  const [choix, setChoix] = React.useState<Record<string, number>>({});
  // Un échantillon lisible : les parcelles cacao de la coopérative de démo (conformes ET refusées,
  // pour montrer la ségrégation à l'écran), puis quelques conformes d'autres coopératives.
  const candidates = React.useMemo(() => {
    const soubre = PARCELLES.filter((p) => p.cooperative === "Coopérative Agricole de Soubré").slice(0, 8);
    const autres = PARCELLES.filter((p) => p.statut === "conforme" && p.cooperative !== "Coopérative Agricole de Soubré").slice(0, 4);
    return [...soubre, ...autres];
  }, []);

  const entrees = Object.entries(choix).map(([parcelleId, tonnes]) => ({ parcelleId, tonnes }));
  const resultat = composerExpedition(entrees);
  const nbChoisies = entrees.length;

  const creer = () => {
    if (nbChoisies === 0 || !resultat.ok) return;
    const n = Math.floor(1000 + Math.random() * 9000);
    const exp: Expedition = {
      id: `local-${n}`,
      ref: `EXP-2026-${n}`,
      nomLot: nom.trim() || t.nomLotDefaut,
      acheteur: "— (en négociation)",
      paysAcheteur: "—",
      portDepart: "San Pédro",
      portArrivee: "—",
      codeSH: "1801",
      filiere: "cacao",
      parcelleIds: entrees.map((e) => e.parcelleId),
      tonnages: Object.fromEntries(entrees.map((e) => [e.parcelleId, e.tonnes])),
      jalons: [{ code: "compose", date: new Date().toISOString().slice(0, 10) }],
      creeLe: new Date().toISOString().slice(0, 10),
    };
    onCree(exp);
  };

  return (
    <section className="rounded-2xl border border-amber-cacao/30 bg-white p-5" aria-label={t.composerTitre}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
        <Container size={16} className="text-amber-cacao" strokeWidth={2} aria-hidden />
        {t.composerTitre}
      </h2>
      <p className="mt-1 max-w-2xl text-xs text-stone-500">{t.composerSous}</p>

      <label className="mt-3 block max-w-sm">
        <span className="text-[11px] font-medium uppercase tracking-wide text-stone-500">{t.nomLot}</span>
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder={t.nomLotDefaut}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-forest-950 outline-none transition focus:border-green-signal focus:ring-2 focus:ring-green-signal/25"
        />
      </label>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {candidates.map((p) => {
          const conforme = p.statut === "conforme";
          const coche = p.id in choix;
          const plafond = Math.round(plafondTonnes(p) * 100) / 100;
          return (
            <li
              key={p.id}
              className={`rounded-xl border p-3 ${
                conforme ? (coche ? "border-green-signal/50 bg-green-signal/[0.06]" : "border-black/[0.07] bg-white") : "border-black/[0.05] bg-ivory/50 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <label className={`flex items-start gap-2 ${conforme ? "cursor-pointer" : "cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    disabled={!conforme}
                    checked={coche}
                    onChange={(e) => {
                      setChoix((c) => {
                        const next = { ...c };
                        if (e.target.checked) next[p.id] = Math.min(1, plafond);
                        else delete next[p.id];
                        return next;
                      });
                    }}
                    className="mt-0.5 h-4 w-4 accent-[#16a34a]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-forest-950">{p.producteurNom}</span>
                    <span className="block text-[11px] text-stone-500">
                      {fmtHa(p.superficieHa)} · {FILIERE_LABEL[p.filiere]} · {p.cooperative}
                    </span>
                  </span>
                </label>
                <StatusBadge statut={p.statut} lang={lang} />
              </div>
              {!conforme && (
                <p className="mt-1.5 text-[11px] font-medium text-red-block">
                  {t.refuse} {t.refusNonConforme}
                </p>
              )}
              {conforme && coche && (
                <label className="mt-2 flex items-center gap-2 text-xs text-stone-600">
                  {t.tonnage}
                  <input
                    type="number"
                    min={0.1}
                    max={plafond}
                    step={0.1}
                    value={choix[p.id]}
                    onChange={(e) => {
                      const v = Math.max(0.1, Math.min(plafond, Number(e.target.value) || 0.1));
                      setChoix((c) => ({ ...c, [p.id]: v }));
                    }}
                    className="w-20 rounded-md border border-black/10 px-2 py-1 text-sm text-forest-950 outline-none focus:border-green-signal"
                  />
                  <span className="text-[11px] text-stone-400">
                    / {t.plafond} {plafond} {t.t}
                  </span>
                </label>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={creer}
          disabled={nbChoisies === 0 || !resultat.ok}
          className="btn-green inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal disabled:opacity-50"
        >
          <Plus size={14} strokeWidth={2.25} aria-hidden />
          {t.creerLot}
        </button>
        <p className="text-xs text-stone-500">
          {t.total} : <span className="num font-semibold text-forest-950">{resultat.tonnageTotal} {t.t}</span> · {nbChoisies} {t.parcelles}
        </p>
      </div>
    </section>
  );
}

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
  ClipboardCheck,
  Container,
  Download,
  FileCheck2,
  Plus,
  QrCode,
  Ship,
  Sparkles,
  Trash2,
  TriangleAlert,
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
  controleEmbarquement,
  expeditionFeatureCollection,
  parcellesExpedition,
  plafondTonnes,
  progressionExpedition,
  statutExpedition,
  tonnageExpedition,
  type Expedition,
  type Jalon,
  type JalonCode,
  type PointControle,
} from "@/data/mock-expeditions";
import { PARCELLES, FILIERE_LABEL, fmtHa, formatDate, type Parcelle } from "@/data/mock-parcelles";
import { DossierDdsPanel } from "@/components/exportateur/dossier-dds-panel";

const PortfolioMap = dynamic(() => import("@/components/exportateur/portfolio-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-forest-950/10" aria-hidden />,
});

const COPY = {
  fr: {
    eyebrow: "Espace exportateur",
    titre: "Expéditions",
    sous: "Le dossier RDUE de chaque conteneur : parcelles d'origine géolocalisées, volumes réconciliés, jalons documentaires, prêt pour votre déclaration TRACES NT.",
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
    qrLegende: "Scannez : la page publique confirme le dossier, parcelles, tonnage, jalons.",
    resumeIa: "Générer le résumé exécutif (IA)",
    resumeEnCours: "Rédaction du résumé…",
    controleIa: "Contrôle pré-embarquement (IA)",
    controleEnCours: "Contrôle en cours…",
    controlePret: "Prêt à embarquer",
    controleAttention: "Points d'attention avant embarquement",
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
    composerTitre: "Composer une expédition",
    composerSous: "Sélectionnez des parcelles : la ségrégation se voit, les parcelles non conformes sont refusées d'office, et chaque tonnage est borné par le plafond de sa parcelle.",
    etapes: ["Parcelles & tonnages", "Informations du lot", "Récapitulatif & contrôle"],
    etapeDe: (i: number) => `Étape ${i} sur 3`,
    suivant: "Suivant",
    retour: "Retour",
    nomLot: "Nom du lot",
    nomLotDefaut: "Nouveau lot cacao",
    acheteurLbl: "Acheteur",
    acheteurPh: "Ex. Chocolats Meridia SAS",
    paysLbl: "Pays de l'acheteur",
    paysPh: "Ex. France",
    portDepartLbl: "Port de départ",
    portArriveeLbl: "Port d'arrivée",
    portArriveePh: "Ex. Le Havre",
    navireLbl: "Navire (optionnel à ce stade)",
    navirePh: "Ex. MSC Amboise",
    conteneurLbl: "N° de conteneur (optionnel)",
    conteneurPh: "Ex. MSKU-483920-1",
    logistiqueAide: "Navire et conteneur pourront être renseignés au moment du jalon « Embarqué ».",
    recapParcelles: "Parcelles du lot",
    recapControle: "Contrôle pré-embarquement automatique",
    refuse: "Refusée :",
    refusNonConforme: "statut non conforme (ségrégation)",
    creerLot: "Créer le dossier du lot",
    lotCree: "Dossier créé, il s'ouvre ci-dessous. Déclarez ses jalons au fil de l'expédition.",
    session: "Session",
    t: "t",
    declarerJalon: "Déclarer le jalon suivant",
    jalonDeclare: (nom: string) => `Jalon déclaré : ${nom}`,
    embarqueBesoin: "Pour déclarer « Embarqué », renseignez le navire et le n° de conteneur :",
    valider: "Valider",
    annuler: "Annuler",
    dossierPdf: "Dossier d'expédition (PDF)",
    pdfEnCours: "Génération du PDF…",
    csvParcelles: "Liste des parcelles (CSV)",
    supprimerLot: "Supprimer ce lot (session)",
    disclaimer: "Suivi documentaire : les jalons sont déclarés par vos équipes. AGRIVO trace le dossier de conformité, l'opérateur reste seul responsable de sa déclaration de diligence raisonnée (DDS).",
  },
  en: {
    eyebrow: "Exporter workspace",
    titre: "Shipments",
    sous: "The EUDR file of every container: geolocated plots of origin, reconciled volumes, documentary milestones, ready for your TRACES NT statement.",
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
    qrLegende: "Scan it: the public page confirms the file, plots, tonnage, milestones.",
    resumeIa: "Generate the executive summary (AI)",
    resumeEnCours: "Writing the summary…",
    controleIa: "Pre-shipment check (AI)",
    controleEnCours: "Checking…",
    controlePret: "Ready to load",
    controleAttention: "Attention points before loading",
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
    composerTitre: "Compose a shipment",
    composerSous: "Select plots: segregation is visible, non-compliant plots are rejected outright, and each tonnage is capped by its plot.",
    etapes: ["Plots & tonnages", "Lot information", "Summary & check"],
    etapeDe: (i: number) => `Step ${i} of 3`,
    suivant: "Next",
    retour: "Back",
    nomLot: "Lot name",
    nomLotDefaut: "New cocoa lot",
    acheteurLbl: "Buyer",
    acheteurPh: "E.g. Chocolats Meridia SAS",
    paysLbl: "Buyer country",
    paysPh: "E.g. France",
    portDepartLbl: "Port of departure",
    portArriveeLbl: "Port of arrival",
    portArriveePh: "E.g. Le Havre",
    navireLbl: "Vessel (optional at this stage)",
    navirePh: "E.g. MSC Amboise",
    conteneurLbl: "Container no. (optional)",
    conteneurPh: "E.g. MSKU-483920-1",
    logistiqueAide: "Vessel and container can be filled in when declaring the \"Loaded\" milestone.",
    recapParcelles: "Plots in this lot",
    recapControle: "Automatic pre-shipment check",
    refuse: "Rejected:",
    refusNonConforme: "non-compliant status (segregation)",
    creerLot: "Create the lot file",
    lotCree: "File created, it opens below. Declare its milestones as the shipment progresses.",
    session: "Session",
    t: "t",
    declarerJalon: "Declare the next milestone",
    jalonDeclare: (nom: string) => `Milestone declared: ${nom}`,
    embarqueBesoin: "To declare \"Loaded\", fill in the vessel and container number:",
    valider: "Confirm",
    annuler: "Cancel",
    dossierPdf: "Shipment file (PDF)",
    pdfEnCours: "Generating the PDF…",
    csvParcelles: "Plot list (CSV)",
    supprimerLot: "Delete this lot (session)",
    disclaimer: "Documentary tracking: milestones are declared by your teams. AGRIVO traces the compliance file, the operator remains solely responsible for its due diligence statement (DDS).",
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
  // Jalons déclarés et infos logistiques complétées EN SESSION (les constantes de démo ne sont
  // jamais mutées : on fusionne à l'affichage — même doctrine que les lots de session).
  const [jalonsExtra, setJalonsExtra] = React.useState<Record<string, Jalon[]>>({});
  const [infosExtra, setInfosExtra] = React.useState<Record<string, { navire?: string; numeroConteneur?: string }>>({});

  const fusionner = React.useCallback(
    (exp: Expedition): Expedition => ({
      ...exp,
      navire: infosExtra[exp.id]?.navire ?? exp.navire,
      numeroConteneur: infosExtra[exp.id]?.numeroConteneur ?? exp.numeroConteneur,
      jalons: [...exp.jalons, ...(jalonsExtra[exp.id] ?? [])],
    }),
    [jalonsExtra, infosExtra],
  );

  const toutes = React.useMemo(() => [...locales, ...EXPEDITIONS].map(fusionner), [locales, fusionner]);
  const [selId, setSelId] = React.useState<string>(EXPEDITIONS[0].id);
  const sel = toutes.find((e) => e.id === selId) ?? toutes[0];
  const [composerOuvert, setComposerOuvert] = React.useState(false);

  /** Déclare le jalon suivant (avec navire/conteneur si le passage à « Embarqué » l'exige). */
  const declarerJalon = React.useCallback(
    (exp: Expedition, logistique?: { navire: string; numeroConteneur: string }) => {
      const prochain = JALONS_ORDRE[progressionExpedition(exp)];
      if (!prochain) return;
      if (logistique) {
        setInfosExtra((prev) => ({ ...prev, [exp.id]: { navire: logistique.navire, numeroConteneur: logistique.numeroConteneur } }));
      }
      setJalonsExtra((prev) => ({
        ...prev,
        [exp.id]: [...(prev[exp.id] ?? []), { code: prochain, date: new Date().toISOString().slice(0, 10) }],
      }));
    },
    [],
  );

  const supprimerLot = React.useCallback((id: string) => {
    setLocales((l) => l.filter((e) => e.id !== id));
    setSelId(EXPEDITIONS[0].id);
  }, []);

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

      <DetailExpedition
        key={sel.id}
        exp={sel}
        t={t}
        lang={lang}
        reduce={reduce}
        estSession={locales.some((l) => l.id === sel.id)}
        onDeclarerJalon={declarerJalon}
        onSupprimer={supprimerLot}
      />

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
  estSession,
  onDeclarerJalon,
  onSupprimer,
}: {
  exp: Expedition;
  t: (typeof COPY)[keyof typeof COPY];
  lang: "fr" | "en";
  reduce: boolean;
  estSession: boolean;
  onDeclarerJalon: (exp: Expedition, logistique?: { navire: string; numeroConteneur: string }) => void;
  onSupprimer: (id: string) => void;
}) {
  const parcelles = parcellesExpedition(exp);
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [mapSel, setMapSel] = React.useState<string | null>(null);
  const [qr, setQr] = React.useState<string | null>(null);
  const [qrVisible, setQrVisible] = React.useState(false);
  const [resume, setResume] = React.useState<{ texte: string; live: boolean } | null>(null);
  const [resumeEnCours, setResumeEnCours] = React.useState(false);
  const [controle, setControle] = React.useState<{ niveau: "pret" | "attention"; points: PointControle[]; note: string; live: boolean } | null>(null);
  const [controleEnCours, setControleEnCours] = React.useState(false);
  const [formEmbarque, setFormEmbarque] = React.useState(false);
  const [navireSaisi, setNavireSaisi] = React.useState("");
  const [conteneurSaisi, setConteneurSaisi] = React.useState("");
  const [pdfEnCours, setPdfEnCours] = React.useState(false);
  const [jalonToast, setJalonToast] = React.useState<string | null>(null);
  const urlPublique = `https://agrivo-io.vercel.app/verifier-expedition?ref=${exp.ref}`;

  const prog = progressionExpedition(exp);
  const prochainJalon: JalonCode | undefined = JALONS_ORDRE[prog];

  const declarer = React.useCallback(() => {
    if (!prochainJalon) return;
    // Le jalon « Embarqué » exige navire + conteneur (exigence documentaire du dossier).
    if (prochainJalon === "embarque" && (!exp.navire || !exp.numeroConteneur)) {
      setNavireSaisi(exp.navire ?? "");
      setConteneurSaisi(exp.numeroConteneur ?? "");
      setFormEmbarque(true);
      return;
    }
    onDeclarerJalon(exp);
    setJalonToast(t.jalonDeclare(JALON_LABEL[prochainJalon][lang]));
  }, [prochainJalon, exp, onDeclarerJalon, t, lang]);

  const telechargerPdf = React.useCallback(async () => {
    setPdfEnCours(true);
    try {
      const { telechargerExpeditionPdf } = await import("@/components/exportateur/expedition-pdf");
      await telechargerExpeditionPdf(exp, lang);
    } catch {
      /* génération annulée : le bouton reste disponible */
    } finally {
      setPdfEnCours(false);
    }
  }, [exp, lang]);

  const telechargerCsv = React.useCallback(() => {
    const sep = ";";
    const entetes = ["producteur", "carte_producteur", "certificat", "cooperative", "region", "superficie_ha", "tonnes_prelevees", "reference_ddr"];
    const lignes = parcellesExpedition(exp).map((p) =>
      [p.producteurNom, p.numeroCartePro, p.numeroCertificat, p.cooperative, p.region, String(p.superficieHa).replace(".", ","), String(exp.tonnages[p.id] ?? 0).replace(".", ","), p.referenceDDR ?? ""].join(sep),
    );
    const csv = "﻿" + [entetes.join(sep), ...lignes].join("\r\n"); // BOM : accents corrects dans Excel
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `agrivo-expedition-${exp.ref}-parcelles.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }, [exp]);

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
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
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

  const lancerControle = React.useCallback(async () => {
    setControleEnCours(true);
    try {
      const r = await fetch("/api/gemini/controle-embarquement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: exp.ref, lang }),
      });
      const data = (await r.json()) as { niveau?: "pret" | "attention"; points?: PointControle[]; note?: string; live?: boolean };
      if (data.niveau && data.points && data.note) {
        setControle({ niveau: data.niveau, points: data.points, note: data.note, live: data.live === true });
      }
    } catch {
      /* silencieux : le bouton reste disponible */
    } finally {
      setControleEnCours(false);
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
            {exp.paysAcheteur !== "À confirmer" ? ` · ${exp.paysAcheteur}` : ""} · {t.codeSH} {exp.codeSH} · {t.creeLe}{" "}
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t.jalons}</h3>
          {prochainJalon && !formEmbarque && (
            <button
              type="button"
              onClick={declarer}
              className="inline-flex items-center gap-1.5 rounded-full border border-green-signal/40 bg-green-signal/[0.08] px-3.5 py-1.5 text-xs font-semibold text-forest-950 outline-none transition-colors hover:bg-green-signal/[0.16] focus-visible:ring-2 focus-visible:ring-green-signal"
            >
              <ChevronRight size={13} strokeWidth={2.5} aria-hidden />
              {t.declarerJalon} · {JALON_LABEL[prochainJalon][lang]}
            </button>
          )}
        </div>
        {jalonToast && (
          <p role="status" className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-green-signal/10 px-3 py-1.5 text-xs font-medium text-forest-950">
            <CheckCircle2 size={13} className="text-green-signal" strokeWidth={2.25} aria-hidden />
            {jalonToast}
          </p>
        )}
        {formEmbarque && (
          <div className="mt-2 rounded-xl border border-amber-cacao/30 bg-amber-cacao/[0.06] p-3">
            <p className="text-xs font-medium text-forest-950">{t.embarqueBesoin}</p>
            <div className="mt-2 grid max-w-xl gap-2 sm:grid-cols-2">
              <input
                value={navireSaisi}
                onChange={(e) => setNavireSaisi(e.target.value)}
                placeholder={t.navirePh}
                aria-label={t.navireLbl}
                className="h-9 rounded-lg border border-black/10 bg-white px-3 text-sm text-forest-950 outline-none focus:border-green-signal focus:ring-2 focus:ring-green-signal/20"
              />
              <input
                value={conteneurSaisi}
                onChange={(e) => setConteneurSaisi(e.target.value)}
                placeholder={t.conteneurPh}
                aria-label={t.conteneurLbl}
                className="num h-9 rounded-lg border border-black/10 bg-white px-3 text-sm text-forest-950 outline-none focus:border-green-signal focus:ring-2 focus:ring-green-signal/20"
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                disabled={!navireSaisi.trim() || !conteneurSaisi.trim()}
                onClick={() => {
                  onDeclarerJalon(exp, { navire: navireSaisi.trim(), numeroConteneur: conteneurSaisi.trim() });
                  setFormEmbarque(false);
                  setJalonToast(t.jalonDeclare(JALON_LABEL.embarque[lang]));
                }}
                className="btn-green rounded-full px-4 py-1.5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal disabled:opacity-50"
              >
                {t.valider}
              </button>
              <button
                type="button"
                onClick={() => setFormEmbarque(false)}
                className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-medium text-stone-600 outline-none hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
              >
                {t.annuler}
              </button>
            </div>
          </div>
        )}
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
            <button
              type="button"
              onClick={lancerControle}
              disabled={controleEnCours}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest-950/20 px-4 py-2 text-xs font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal focus-visible:ring-2 focus-visible:ring-green-signal disabled:opacity-60"
            >
              <ClipboardCheck size={14} strokeWidth={2.25} aria-hidden />
              {controleEnCours ? t.controleEnCours : t.controleIa}
            </button>
            <button
              type="button"
              onClick={telechargerPdf}
              disabled={pdfEnCours}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest-950/20 px-4 py-2 text-xs font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal focus-visible:ring-2 focus-visible:ring-green-signal disabled:opacity-60"
            >
              <FileCheck2 size={14} strokeWidth={2.25} aria-hidden />
              {pdfEnCours ? t.pdfEnCours : t.dossierPdf}
            </button>
            <button
              type="button"
              onClick={telechargerCsv}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest-950/20 px-4 py-2 text-xs font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal focus-visible:ring-2 focus-visible:ring-green-signal"
            >
              <Download size={14} strokeWidth={2.25} aria-hidden />
              {t.csvParcelles}
            </button>
            {estSession && (
              <button
                type="button"
                onClick={() => onSupprimer(exp.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-block/30 px-4 py-2 text-xs font-semibold text-red-block outline-none transition-colors hover:bg-red-block/[0.06] focus-visible:ring-2 focus-visible:ring-red-block/50"
              >
                <Trash2 size={14} strokeWidth={2.25} aria-hidden />
                {t.supprimerLot}
              </button>
            )}
          </div>

          {qrVisible && qr && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-black/[0.07] bg-ivory/70 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt={`QR, ${urlPublique}`} className="h-28 w-28 rounded-lg border border-black/[0.06] bg-white" />
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

          {/* Contrôle pré-embarquement : verdict qualitatif + les 5 points de contrôle factuels */}
          {controle && (
            <div className="mt-3 rounded-xl border border-black/[0.07] bg-white p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    controle.niveau === "pret" ? "bg-green-signal/15 text-green-signal" : "bg-amber-cacao/15 text-amber-cacao"
                  }`}
                >
                  {controle.niveau === "pret" ? (
                    <CheckCircle2 size={13} strokeWidth={2.25} aria-hidden />
                  ) : (
                    <TriangleAlert size={13} strokeWidth={2.25} aria-hidden />
                  )}
                  {controle.niveau === "pret" ? t.controlePret : t.controleAttention}
                </p>
                <p
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    controle.live ? "bg-green-signal/15 text-green-signal" : "bg-forest-950/[0.06] text-stone-500"
                  }`}
                >
                  <Sparkles size={11} strokeWidth={2.25} aria-hidden />
                  {controle.live ? t.live : t.demo}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">{controle.note}</p>
              <ul className="mt-3 space-y-1.5">
                {controle.points.map((p) => (
                  <li key={p.code} className="flex items-start gap-2 text-xs leading-relaxed">
                    {p.niveau === "ok" ? (
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-signal" strokeWidth={2.25} aria-hidden />
                    ) : (
                      <TriangleAlert size={14} className="mt-0.5 shrink-0 text-amber-cacao" strokeWidth={2.25} aria-hidden />
                    )}
                    <span className="text-stone-600">{p[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dossier DDS : le livrable TRACES NT (GeoJSON + brouillon + rapport), gaté honnêtement */}
          <DossierDdsPanel exp={exp} lang={lang} />
        </div>

        <div className="min-h-[320px]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t.carteTitre}</h3>
          <div className="mt-2 h-[420px] xl:h-[calc(100%-1.75rem)]">
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


/* --------------------------- Composeur de lot : assistant en 3 étapes --------------------------- */

function Composer({
  t,
  lang,
  onCree,
}: {
  t: (typeof COPY)[keyof typeof COPY];
  lang: "fr" | "en";
  onCree: (exp: Expedition) => void;
}) {
  const [etape, setEtape] = React.useState(1);
  const [nom, setNom] = React.useState("");
  const [acheteur, setAcheteur] = React.useState("");
  const [pays, setPays] = React.useState("");
  const [portDepart, setPortDepart] = React.useState<"San Pédro" | "Abidjan">("San Pédro");
  const [portArrivee, setPortArrivee] = React.useState("");
  const [navire, setNavire] = React.useState("");
  const [conteneur, setConteneur] = React.useState("");
  const [choix, setChoix] = React.useState<Record<string, number>>({});

  // Échantillon lisible : les parcelles cacao de la coopérative de démo (conformes ET refusées,
  // pour montrer la ségrégation à l'écran), puis quelques conformes d'autres coopératives.
  const candidates = React.useMemo(() => {
    const soubre = PARCELLES.filter((p) => p.cooperative === "Coopérative Agricole de Soubré").slice(0, 8);
    const autres = PARCELLES.filter((p) => p.statut === "conforme" && p.cooperative !== "Coopérative Agricole de Soubré").slice(0, 4);
    return [...soubre, ...autres];
  }, []);

  const entrees = Object.entries(choix).map(([parcelleId, tonnes]) => ({ parcelleId, tonnes }));
  const resultat = composerExpedition(entrees);
  const nbChoisies = entrees.length;
  // Clé stable dérivée du contenu de `choix` (dépendance simple exigée par le linter).
  const choixKey = JSON.stringify(choix);

  // Brouillon du lot : sert au récapitulatif ET au contrôle pré-embarquement AUTOMATIQUE
  // (moteur pur exécuté côté client — mêmes règles que l'API, zéro réseau à cette étape).
  const brouillon = React.useMemo<Expedition>(
    () => ({
      id: "brouillon",
      ref: "EXP-2026-…",
      nomLot: nom.trim() || t.nomLotDefaut,
      acheteur: acheteur.trim() || "En négociation",
      paysAcheteur: pays.trim() || "À confirmer",
      portDepart,
      portArrivee: portArrivee.trim() || "À confirmer",
      navire: navire.trim() || undefined,
      numeroConteneur: conteneur.trim() || undefined,
      codeSH: "1801",
      filiere: "cacao",
      parcelleIds: entrees.map((e) => e.parcelleId),
      tonnages: Object.fromEntries(entrees.map((e) => [e.parcelleId, e.tonnes])),
      jalons: [{ code: "compose" as const, date: new Date().toISOString().slice(0, 10) }],
      creeLe: new Date().toISOString().slice(0, 10),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nom, acheteur, pays, portDepart, portArrivee, navire, conteneur, choixKey, t.nomLotDefaut],
  );
  const controleAuto = React.useMemo(
    () => (etape === 3 && nbChoisies > 0 ? controleEmbarquement(brouillon, PARCELLES) : null),
    [etape, nbChoisies, brouillon],
  );

  const creer = () => {
    if (nbChoisies === 0 || !resultat.ok) return;
    const n = Math.floor(1000 + Math.random() * 9000);
    onCree({ ...brouillon, id: `local-${n}`, ref: `EXP-2026-${n}` });
  };

  const champ =
    "h-10 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 text-sm text-forest-950 outline-none transition-colors placeholder:text-stone-400 focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15";

  return (
    <section className="rounded-2xl border border-amber-cacao/30 bg-white p-5" aria-label={t.composerTitre}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
        <Container size={16} className="text-amber-cacao" strokeWidth={2} aria-hidden />
        {t.composerTitre}
      </h2>

      {/* Barre d'étapes 1-2-3 */}
      <ol className="mt-3 flex items-center gap-2" aria-label={t.etapeDe(etape)}>
        {t.etapes.map((label, i) => {
          const n = i + 1;
          const actif = n === etape;
          const fait = n < etape;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                  fait ? "bg-green-signal text-white" : actif ? "bg-forest-950 text-white" : "bg-forest-950/10 text-stone-500"
                }`}
                aria-hidden
              >
                {fait ? "✓" : n}
              </span>
              <span className={`hidden text-xs sm:block ${actif ? "font-semibold text-forest-950" : "text-stone-400"}`}>{label}</span>
              {n < 3 && <span className={`h-px flex-1 ${fait ? "bg-green-signal/50" : "bg-black/[0.08]"}`} aria-hidden />}
            </li>
          );
        })}
      </ol>

      {/* Étape 1 · Parcelles & tonnages (la ségrégation SE VOIT) */}
      {etape === 1 && (
        <>
          <p className="mt-3 max-w-2xl text-xs text-stone-500">{t.composerSous}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {candidates.map((p) => {
              const conforme = p.statut === "conforme";
              const coche = p.id in choix;
              const plafond = Math.round(plafondTonnes(p) * 100) / 100;
              return (
                <li
                  key={p.id}
                  className={`rounded-xl border p-3 ${
                    conforme
                      ? coche
                        ? "border-green-signal/50 bg-green-signal/[0.06]"
                        : "border-black/[0.07] bg-white"
                      : "border-black/[0.05] bg-ivory/50 opacity-70"
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
        </>
      )}

      {/* Étape 2 · Informations du lot */}
      {etape === 2 && (
        <div className="mt-4 grid max-w-2xl gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.nomLot}
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder={t.nomLotDefaut} className={champ} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.acheteurLbl}
            <input value={acheteur} onChange={(e) => setAcheteur(e.target.value)} placeholder={t.acheteurPh} className={champ} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.paysLbl}
            <input value={pays} onChange={(e) => setPays(e.target.value)} placeholder={t.paysPh} className={champ} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.portDepartLbl}
            <select value={portDepart} onChange={(e) => setPortDepart(e.target.value as "San Pédro" | "Abidjan")} className={champ}>
              <option value="San Pédro">San Pédro</option>
              <option value="Abidjan">Abidjan</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.portArriveeLbl}
            <input value={portArrivee} onChange={(e) => setPortArrivee(e.target.value)} placeholder={t.portArriveePh} className={champ} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.navireLbl}
            <input value={navire} onChange={(e) => setNavire(e.target.value)} placeholder={t.navirePh} className={champ} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.conteneurLbl}
            <input value={conteneur} onChange={(e) => setConteneur(e.target.value)} placeholder={t.conteneurPh} className={`num ${champ}`} />
          </label>
          <p className="self-end pb-2 text-[0.7rem] text-stone-400 sm:col-span-1">{t.logistiqueAide}</p>
        </div>
      )}

      {/* Étape 3 · Récapitulatif & contrôle pré-embarquement automatique */}
      {etape === 3 && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-black/[0.07] bg-ivory/50 p-4">
            <p className="text-sm font-semibold text-forest-950">{brouillon.nomLot}</p>
            <p className="mt-1 text-xs text-stone-500">
              {t.acheteurLbl} : {brouillon.acheteur}
              {brouillon.paysAcheteur !== "À confirmer" ? ` · ${brouillon.paysAcheteur}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              {t.ports} : {brouillon.portDepart} → {brouillon.portArrivee}
              {brouillon.navire ? ` · ${brouillon.navire}` : ""}
              {brouillon.numeroConteneur ? ` · ${brouillon.numeroConteneur}` : ""}
            </p>
            <p className="mt-2 text-sm text-forest-950">
              <span className="num font-semibold">
                {resultat.tonnageTotal} {t.t}
              </span>{" "}
              · {nbChoisies} {t.parcelles}
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-stone-500">{t.recapParcelles}</p>
            <ul className="mt-1.5 space-y-1">
              {parcellesExpedition(brouillon).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-forest-950">{p.producteurNom}</span>
                  <span className="num shrink-0 text-stone-500">
                    {choix[p.id]} {t.t}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-black/[0.07] bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{t.recapControle}</p>
            {controleAuto && (
              <>
                <p
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    controleAuto.niveau === "pret" ? "bg-green-signal/15 text-green-signal" : "bg-amber-cacao/15 text-amber-cacao"
                  }`}
                >
                  {controleAuto.niveau === "pret" ? (
                    <CheckCircle2 size={13} strokeWidth={2.25} aria-hidden />
                  ) : (
                    <TriangleAlert size={13} strokeWidth={2.25} aria-hidden />
                  )}
                  {controleAuto.niveau === "pret" ? t.controlePret : t.controleAttention}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {controleAuto.points.map((p) => (
                    <li key={p.code} className="flex items-start gap-2 text-xs leading-relaxed">
                      {p.niveau === "ok" ? (
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-signal" strokeWidth={2.25} aria-hidden />
                      ) : (
                        <TriangleAlert size={14} className="mt-0.5 shrink-0 text-amber-cacao" strokeWidth={2.25} aria-hidden />
                      )}
                      <span className="text-stone-600">{p[lang]}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation Retour / Suivant / Créer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.05] pt-4">
        <p className="text-xs text-stone-500">
          {t.total} :{" "}
          <span className="num font-semibold text-forest-950">
            {resultat.tonnageTotal} {t.t}
          </span>{" "}
          · {nbChoisies} {t.parcelles}
        </p>
        <div className="flex items-center gap-2">
          {etape > 1 && (
            <button
              type="button"
              onClick={() => setEtape((e) => e - 1)}
              className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
            >
              {t.retour}
            </button>
          )}
          {etape < 3 ? (
            <button
              type="button"
              disabled={nbChoisies === 0 || !resultat.ok}
              onClick={() => setEtape((e) => e + 1)}
              className="btn-green inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal disabled:opacity-50"
            >
              {t.suivant}
              <ChevronRight size={15} strokeWidth={2.5} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              disabled={nbChoisies === 0 || !resultat.ok}
              onClick={creer}
              className="btn-green inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal disabled:opacity-50"
            >
              <Plus size={15} strokeWidth={2.5} aria-hidden />
              {t.creerLot}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

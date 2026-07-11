"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Building2, ClipboardList, FileUp, Loader2, MapPin, Paperclip, Trash2, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { FILIERES, type FiliereId } from "@/config/filieres";
import { ZONE_CI, auditerRegistre, parserRegistre, type AuditRegistre } from "@/lib/registre/audit";
import { ajouterCoopLocale, type CoopLocale } from "@/lib/coops-locales";

/**
 * « Ajouter une coopérative » (espace exportateur) — la fonctionnalité demandée par Anael :
 * l'exportateur enregistre un partenaire avec les informations que la coopérative lui a
 * PARTAGÉES (contact, siège, effectif, filières), et peut joindre le registre de parcelles
 * partagé (GeoJSON, CSV ou KML). Le registre est audité IMMÉDIATEMENT selon la règle RDUE,
 * 100 % côté navigateur : le fichier ne quitte jamais le poste, seul le résumé d'audit est
 * conservé (localStorage, lib/coops-locales).
 */

const EASE = [0.16, 1, 0.3, 1] as const;

const COPY = {
  fr: {
    titre: "Ajouter une coopérative",
    sous: "Renseignez les informations que la coopérative vous a partagées. Seuls le nom et la région sont obligatoires.",
    fermer: "Fermer le panneau",
    nom: "Nom de la coopérative *",
    nomPh: "Ex. SCOOPS Cacao de Vavoua",
    region: "Région *",
    regionPh: "Ex. Haut-Sassandra",
    ville: "Ville du siège",
    villePh: "Ex. Vavoua",
    gerant: "Gérant / contact",
    gerantPh: "Ex. Mariam Ouattara",
    telephone: "Téléphone",
    telephonePh: "+225 07 00 00 00 00",
    effectif: "Producteurs déclarés",
    effectifPh: "Ex. 450",
    siege: "Position du siège (optionnelle)",
    siegeAide: "Latitude, longitude en Côte d'Ivoire (lat 4 à 11, lon −9 à −2). Un point sur la carte, jamais une superficie.",
    lat: "Latitude",
    lon: "Longitude",
    siegeInvalide: "Coordonnées hors de l'emprise ivoirienne (lat 4 à 11, lon −9 à −2).",
    filieres: "Filières de la coopérative",
    checklistTitre: "Ce dont AGRIVO a besoin pour bien analyser une coopérative",
    checklist: [
      "Le registre de parcelles (GeoJSON, CSV ou KML) — audité immédiatement selon la règle RDUE ; c'est la pièce clé.",
      "L'agrément ou les statuts de la coopérative (PDF).",
      "La liste des producteurs avec leurs numéros de carte (CSV ou Excel).",
      "Les certificats de durabilité en cours (Rainforest Alliance, Fairtrade…).",
      "Un modèle de la carte producteur utilisée (photo).",
      "Les attestations de consentement des producteurs (loi ivoirienne n° 2013-450, ARTCI).",
    ],
    checklistNote: "Seuls le nom et la région bloquent l'ajout : les pièces peuvent être complétées plus tard, mais plus le dossier est complet, plus l'analyse est fiable.",
    pieces: "Pièces du dossier (optionnelles)",
    piecesAide: "Joignez les documents ci-dessus (PDF, images, CSV, Excel). Les fichiers restent sur votre poste : seule la liste des pièces est conservée au dossier.",
    ajouterPieces: "Joindre des documents",
    retirerPiece: "Retirer cette pièce",
    registre: "Registre de parcelles partagé (optionnel)",
    registreAide: "GeoJSON, CSV ou KML. Audité immédiatement selon la règle RDUE — le fichier ne quitte jamais votre navigateur.",
    choisir: "Choisir un fichier",
    analyse: "Audit du registre…",
    auditOk: (pct: number, total: number, anomalies: number) =>
      `Registre audité : ${pct} % prêt RDUE (${total} parcelles, ${anomalies} anomalie${anomalies > 1 ? "s" : ""}).`,
    auditVide: "Aucune parcelle exploitable dans ce fichier.",
    auditErreur: "Fichier illisible. Formats acceptés : GeoJSON, CSV, KML.",
    retirerFichier: "Retirer le fichier",
    nomRequis: "Le nom de la coopérative est obligatoire.",
    regionRequise: "La région est obligatoire.",
    annuler: "Annuler",
    ajouter: "Ajouter au portefeuille",
    confidentialite: "Les données restent la propriété de la coopérative qui vous les a partagées.",
  },
  en: {
    titre: "Add a cooperative",
    sous: "Fill in the information the cooperative shared with you. Only the name and region are required.",
    fermer: "Close the panel",
    nom: "Cooperative name *",
    nomPh: "E.g. SCOOPS Cacao de Vavoua",
    region: "Region *",
    regionPh: "E.g. Haut-Sassandra",
    ville: "Headquarters city",
    villePh: "E.g. Vavoua",
    gerant: "Manager / contact",
    gerantPh: "E.g. Mariam Ouattara",
    telephone: "Phone",
    telephonePh: "+225 07 00 00 00 00",
    effectif: "Declared farmers",
    effectifPh: "E.g. 450",
    siege: "Headquarters position (optional)",
    siegeAide: "Latitude, longitude in Côte d'Ivoire (lat 4 to 11, lon −9 to −2). A point on the map, never an area.",
    lat: "Latitude",
    lon: "Longitude",
    siegeInvalide: "Coordinates outside the Ivorian extent (lat 4 to 11, lon −9 to −2).",
    filieres: "Cooperative's commodities",
    checklistTitre: "What AGRIVO needs to properly analyse a cooperative",
    checklist: [
      "The plot register (GeoJSON, CSV or KML) — audited immediately against the EUDR rule; the key document.",
      "The cooperative's licence or statutes (PDF).",
      "The farmer list with card numbers (CSV or Excel).",
      "Current sustainability certificates (Rainforest Alliance, Fairtrade…).",
      "A sample of the farmer card in use (photo).",
      "Farmer consent attestations (Ivorian law No. 2013-450, ARTCI).",
    ],
    checklistNote: "Only the name and region block the addition: documents can be completed later, but the more complete the file, the more reliable the analysis.",
    pieces: "File attachments (optional)",
    piecesAide: "Attach the documents above (PDF, images, CSV, Excel). Files stay on your computer: only the list of attachments is kept in the record.",
    ajouterPieces: "Attach documents",
    retirerPiece: "Remove this attachment",
    registre: "Shared plot register (optional)",
    registreAide: "GeoJSON, CSV or KML. Audited immediately against the EUDR rule — the file never leaves your browser.",
    choisir: "Choose a file",
    analyse: "Auditing the register…",
    auditOk: (pct: number, total: number, anomalies: number) =>
      `Register audited: ${pct}% EUDR-ready (${total} plots, ${anomalies} anomal${anomalies > 1 ? "ies" : "y"}).`,
    auditVide: "No usable plot in this file.",
    auditErreur: "Unreadable file. Accepted formats: GeoJSON, CSV, KML.",
    retirerFichier: "Remove the file",
    nomRequis: "The cooperative name is required.",
    regionRequise: "The region is required.",
    annuler: "Cancel",
    ajouter: "Add to portfolio",
    confidentialite: "The data remains the property of the cooperative that shared it with you.",
  },
} as const;

function champCls(invalid = false) {
  return `h-10 w-full rounded-xl border bg-white px-3.5 text-sm text-forest-950 outline-none transition-colors placeholder:text-stone-400 focus:ring-2 ${
    invalid
      ? "border-red-block/50 focus:border-red-block/60 focus:ring-red-block/15"
      : "border-black/[0.08] focus:border-green-signal/50 focus:ring-green-signal/15"
  }`;
}

export function AjouterCooperative({
  onAjoutee,
  onFermer,
}: {
  onAjoutee: (coop: CoopLocale) => void;
  onFermer: () => void;
}) {
  const reduce = useReducedMotion();
  const { lang } = useLanguage();
  const t = COPY[lang];

  const [nom, setNom] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [ville, setVille] = React.useState("");
  const [gerant, setGerant] = React.useState("");
  const [telephone, setTelephone] = React.useState("");
  const [effectif, setEffectif] = React.useState("");
  const [lat, setLat] = React.useState("");
  const [lon, setLon] = React.useState("");
  const [filieres, setFilieres] = React.useState<FiliereId[]>(["cacao"]);
  const [erreurs, setErreurs] = React.useState<{ nom?: string; region?: string; siege?: string }>({});

  const [fichierNom, setFichierNom] = React.useState<string | null>(null);
  const [audit, setAudit] = React.useState<AuditRegistre | null>(null);
  const [auditErr, setAuditErr] = React.useState<string | null>(null);
  const [analyse, setAnalyse] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [pieces, setPieces] = React.useState<{ nom: string; taille: number; categorie: string }[]>([]);
  const piecesRef = React.useRef<HTMLInputElement>(null);

  /** Catégorie lisible déduite de l'extension — pour la liste des pièces au dossier. */
  function categoriePiece(nom: string): string {
    const ext = nom.toLowerCase().split(".").pop() ?? "";
    if (["pdf"].includes(ext)) return "PDF";
    if (["jpg", "jpeg", "png", "webp", "heic"].includes(ext)) return lang === "en" ? "Photo" : "Photo";
    if (["csv", "xlsx", "xls"].includes(ext)) return lang === "en" ? "Spreadsheet" : "Tableur";
    if (["geojson", "json", "kml"].includes(ext)) return lang === "en" ? "Geodata" : "Géodonnées";
    return lang === "en" ? "Document" : "Document";
  }

  function onPieces(e: React.ChangeEvent<HTMLInputElement>) {
    const fichiers = Array.from(e.target.files ?? []);
    if (fichiers.length === 0) return;
    setPieces((prev) => {
      const existants = new Set(prev.map((p) => p.nom));
      const nouveaux = fichiers
        .filter((f) => !existants.has(f.name))
        .map((f) => ({ nom: f.name, taille: f.size, categorie: categoriePiece(f.name) }));
      return [...prev, ...nouveaux];
    });
    if (piecesRef.current) piecesRef.current.value = "";
  }

  function toggleFiliere(id: FiliereId) {
    setFilieres((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }

  /** Parse [lat, lon] saisis ; null si vides, "invalide" si hors emprise CI. */
  function siegeSaisi(): [number, number] | null | "invalide" {
    const sl = lat.trim();
    const so = lon.trim();
    if (!sl && !so) return null;
    const nl = Number(sl.replace(",", "."));
    const no = Number(so.replace(",", "."));
    if (!Number.isFinite(nl) || !Number.isFinite(no)) return "invalide";
    if (nl < ZONE_CI.latMin || nl > ZONE_CI.latMax || no < ZONE_CI.lonMin || no > ZONE_CI.lonMax) return "invalide";
    return [nl, no];
  }

  async function onFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAnalyse(true);
    setAudit(null);
    setAuditErr(null);
    setFichierNom(f.name);
    try {
      const texte = await f.text();
      const parcelles = parserRegistre(f.name, texte);
      if (parcelles.length === 0) {
        setAuditErr(t.auditVide);
      } else {
        setAudit(auditerRegistre(parcelles));
      }
    } catch {
      setAuditErr(t.auditErreur);
    } finally {
      setAnalyse(false);
    }
  }

  function retirerFichier() {
    setFichierNom(null);
    setAudit(null);
    setAuditErr(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof erreurs = {};
    if (!nom.trim()) errs.nom = t.nomRequis;
    if (!region.trim()) errs.region = t.regionRequise;
    const siege = siegeSaisi();
    if (siege === "invalide") errs.siege = t.siegeInvalide;
    setErreurs(errs);
    if (Object.keys(errs).length > 0) return;

    const coop = ajouterCoopLocale({
      nom: nom.trim(),
      region: region.trim(),
      ville: ville.trim() || undefined,
      siege: siege === "invalide" ? undefined : (siege ?? undefined),
      gerant: gerant.trim() || undefined,
      telephone: telephone.trim() || undefined,
      producteursDeclares: effectif.trim() ? Math.max(0, Math.round(Number(effectif))) || undefined : undefined,
      filieres: filieres.length ? filieres : ["cacao"],
      audit: audit ? { pretPct: audit.pretPct, total: audit.total, anomalies: audit.anomalies.length } : undefined,
      documents: pieces.length > 0 ? pieces : undefined,
    });
    onAjoutee(coop);
  }

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="overflow-hidden"
    >
      <form onSubmit={soumettre} className="card-premium relative p-5 sm:p-6" noValidate>
        <button
          type="button"
          onClick={onFermer}
          aria-label={t.fermer}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-stone-400 outline-none transition-colors hover:bg-black/5 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
        >
          <X size={16} strokeWidth={2} />
        </button>

        <h2 className="flex items-center gap-2 text-sm font-semibold text-forest-950">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-green-signal/10" aria-hidden>
            <Building2 size={16} strokeWidth={2} className="text-green-signal" />
          </span>
          {t.titre}
        </h2>
        <p className="mt-1.5 max-w-2xl text-xs text-stone-500">{t.sous}</p>

        {/* Check-list documentaire : ce qu'AGRIVO attend pour une analyse fiable */}
        <div className="mt-4 rounded-xl border border-green-signal/25 bg-green-signal/[0.05] p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-forest-950">
            <ClipboardList size={14} strokeWidth={2} className="text-green-signal" aria-hidden />
            {t.checklistTitre}
          </p>
          <ol className="mt-2 space-y-1 pl-1">
            {t.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-stone-600">
                <span className="num mt-px shrink-0 text-[10px] font-semibold text-green-signal">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[0.7rem] italic text-stone-500">{t.checklistNote}</p>
        </div>

        {/* Identité */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.nom}
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder={t.nomPh} className={champCls(Boolean(erreurs.nom))} />
            {erreurs.nom && <span className="text-[0.7rem] font-normal text-red-block">{erreurs.nom}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.region}
            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder={t.regionPh} className={champCls(Boolean(erreurs.region))} />
            {erreurs.region && <span className="text-[0.7rem] font-normal text-red-block">{erreurs.region}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.ville}
            <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder={t.villePh} className={champCls()} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.gerant}
            <input value={gerant} onChange={(e) => setGerant(e.target.value)} placeholder={t.gerantPh} className={champCls()} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.telephone}
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder={t.telephonePh} inputMode="tel" className={`num ${champCls()}`} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
            {t.effectif}
            <input value={effectif} onChange={(e) => setEffectif(e.target.value)} placeholder={t.effectifPh} inputMode="numeric" className={`num ${champCls()}`} />
          </label>
        </div>

        {/* Siège (un point) */}
        <fieldset className="mt-5">
          <legend className="flex items-center gap-1.5 text-xs font-medium text-forest-950">
            <MapPin size={13} strokeWidth={2} aria-hidden className="text-green-signal" />
            {t.siege}
          </legend>
          <p className="mt-1 text-[0.7rem] text-stone-400">{t.siegeAide}</p>
          <div className="mt-2 grid max-w-md grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
              {t.lat}
              <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="5.7836" inputMode="decimal" className={`num ${champCls(Boolean(erreurs.siege))}`} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-forest-950">
              {t.lon}
              <input value={lon} onChange={(e) => setLon(e.target.value)} placeholder="-6.5933" inputMode="decimal" className={`num ${champCls(Boolean(erreurs.siege))}`} />
            </label>
          </div>
          {erreurs.siege && <p className="mt-1.5 text-[0.7rem] text-red-block">{erreurs.siege}</p>}
        </fieldset>

        {/* Filières */}
        <fieldset className="mt-5">
          <legend className="text-xs font-medium text-forest-950">{t.filieres}</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {FILIERES.map((f) => {
              const active = filieres.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleFiliere(f.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-green-signal ${
                    active ? "border-green-signal/40 bg-green-signal/[0.1] text-forest-950" : "border-black/[0.08] bg-white text-stone-500 hover:text-forest-950"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: f.couleur, opacity: active ? 1 : 0.4 }} aria-hidden />
                  {f.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Registre partagé → audit RDUE immédiat */}
        <fieldset className="mt-5">
          <legend className="flex items-center gap-1.5 text-xs font-medium text-forest-950">
            <FileUp size={13} strokeWidth={2} aria-hidden className="text-green-signal" />
            {t.registre}
          </legend>
          <p className="mt-1 max-w-xl text-[0.7rem] text-stone-400">{t.registreAide}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <input ref={fileRef} type="file" accept=".geojson,.json,.csv,.kml" onChange={onFichier} className="sr-only" id="registre-coop-file" />
            <label
              htmlFor="registre-coop-file"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-within:ring-2 focus-within:ring-green-signal"
            >
              <FileUp size={13} strokeWidth={2} aria-hidden />
              {t.choisir}
            </label>
            {fichierNom && (
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <span className="num max-w-[14rem] truncate">{fichierNom}</span>
                <button
                  type="button"
                  onClick={retirerFichier}
                  aria-label={t.retirerFichier}
                  title={t.retirerFichier}
                  className="grid h-6 w-6 place-items-center rounded-full text-stone-400 outline-none transition-colors hover:bg-red-block/10 hover:text-red-block focus-visible:ring-2 focus-visible:ring-red-block/40"
                >
                  <Trash2 size={12} strokeWidth={2} />
                </button>
              </span>
            )}
          </div>
          {analyse && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500" role="status">
              <Loader2 size={13} strokeWidth={2} className="animate-spin" aria-hidden />
              {t.analyse}
            </p>
          )}
          {audit && !analyse && (
            <p className="mt-2 rounded-xl border border-green-signal/25 bg-green-signal/[0.06] px-3.5 py-2.5 text-xs text-forest-950" role="status">
              {t.auditOk(audit.pretPct, audit.total, audit.anomalies.length)}
            </p>
          )}
          {auditErr && !analyse && (
            <p className="mt-2 rounded-xl border border-red-block/25 bg-red-block/[0.05] px-3.5 py-2.5 text-xs text-red-block" role="alert">
              {auditErr}
            </p>
          )}
        </fieldset>

        {/* Pièces du dossier : multi-fichiers, métadonnées seules conservées */}
        <fieldset className="mt-5">
          <legend className="flex items-center gap-1.5 text-xs font-medium text-forest-950">
            <Paperclip size={13} strokeWidth={2} aria-hidden className="text-green-signal" />
            {t.pieces}
          </legend>
          <p className="mt-1 max-w-xl text-[0.7rem] text-stone-400">{t.piecesAide}</p>
          <div className="mt-2">
            <input
              ref={piecesRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,.csv,.xlsx,.xls,.geojson,.json,.kml"
              onChange={onPieces}
              className="sr-only"
              id="pieces-coop-files"
            />
            <label
              htmlFor="pieces-coop-files"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-within:ring-2 focus-within:ring-green-signal"
            >
              <Paperclip size={13} strokeWidth={2} aria-hidden />
              {t.ajouterPieces}
            </label>
          </div>
          {pieces.length > 0 && (
            <ul className="mt-2.5 space-y-1.5">
              {pieces.map((p) => (
                <li key={p.nom} className="flex items-center justify-between gap-2 rounded-lg border border-black/[0.06] bg-white px-3 py-2 text-xs">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 rounded bg-green-signal/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-signal">{p.categorie}</span>
                    <span className="num truncate text-forest-950">{p.nom}</span>
                    <span className="num shrink-0 text-stone-400">{Math.max(1, Math.round(p.taille / 1024))} Ko</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPieces((prev) => prev.filter((x) => x.nom !== p.nom))}
                    aria-label={t.retirerPiece}
                    title={t.retirerPiece}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-stone-400 outline-none transition-colors hover:bg-red-block/10 hover:text-red-block focus-visible:ring-2 focus-visible:ring-red-block/40"
                  >
                    <Trash2 size={12} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.05] pt-4">
          <p className="text-[0.7rem] text-stone-400">{t.confidentialite}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onFermer}
              className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
            >
              {t.annuler}
            </button>
            <button
              type="submit"
              className="btn-green inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              {t.ajouter}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

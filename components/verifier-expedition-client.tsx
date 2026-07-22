"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Anchor, CheckCircle2, FileSearch, Search, Ship } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useLanguage } from "@/components/language-provider";
import {
  findExpedition,
  parcellesExpedition,
  tonnageExpedition,
  progressionExpedition,
  JALONS_ORDRE,
  JALON_LABEL,
  type Expedition,
} from "@/data/mock-expeditions";
import { FILIERE_LABEL, formatDate } from "@/data/mock-parcelles";

/**
 * Vérification PUBLIQUE d'un dossier d'expédition Agrivo : un acheteur européen (ou le jury)
 * scanne le QR du dossier conteneur et confirme parcelles d'origine, tonnage et jalons.
 * Aucune donnée personnelle au-delà du dossier lui-même. Préremplissage via ?ref=.
 */
export function VerifierExpeditionClient() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const params = useSearchParams();
  const initial = (params.get("ref") ?? "").toUpperCase();
  const [query, setQuery] = useState(initial);
  const [searched, setSearched] = useState(initial);

  const result: Expedition | undefined = useMemo(() => findExpedition(searched), [searched]);
  const notFound = Boolean(searched.trim()) && !result;

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <SiteHeader variant="solid" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14 sm:py-20">
        <p className="text-[11px] uppercase tracking-widest text-stone-500">
          {en ? "Public verification" : "Vérification publique"}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-forest-950 sm:text-4xl">
          {en ? "Verify an Agrivo shipment" : "Vérifier une expédition Agrivo"}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
          {en
            ? "Enter the reference printed on the shipment file (or scan its QR code) to confirm the plots of origin, the tonnage and the documentary milestones of the lot."
            : "Saisissez la référence imprimée sur le dossier d'expédition (ou scannez son QR code) pour confirmer les parcelles d'origine, le tonnage et les jalons documentaires du lot."}
        </p>

        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setSearched(query);
          }}
        >
          <label className="sr-only" htmlFor="exp-ref">
            {en ? "Shipment reference" : "Référence d'expédition"}
          </label>
          <input
            id="exp-ref"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="EXP-2026-0001"
            autoComplete="off"
            spellCheck={false}
            className="w-full flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 font-mono text-sm text-forest-950 outline-none transition focus:border-green-signal focus:ring-2 focus:ring-green-signal/25"
          />
          <button
            type="submit"
            className="btn-green inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {en ? "Verify" : "Vérifier"}
          </button>
        </form>

        <div aria-live="polite" className="mt-8">
          {result && <ResultatExpedition exp={result} en={en} lang={lang} />}

          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-2xl border border-red-block/25 bg-red-block/[0.06] p-5"
            >
              <FileSearch className="mt-0.5 h-5 w-5 shrink-0 text-red-block" strokeWidth={1.75} aria-hidden />
              <div>
                <p className="text-sm font-semibold text-forest-950">
                  {en ? "Shipment not found" : "Expédition introuvable"}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  {en
                    ? `No shipment file matches the reference "${searched.trim()}". Check the input (format EXP-YYYY-NNNN) or contact the exporter.`
                    : `Aucun dossier d'expédition ne correspond à la référence « ${searched.trim()} ». Vérifiez la saisie (format EXP-AAAA-NNNN) ou contactez l'exportateur.`}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <section className="mt-12 border-t border-black/[0.06] pt-8">
          <h2 className="text-[11px] uppercase tracking-widest text-stone-500">
            {en ? "What this page confirms" : "Ce que cette page confirme"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
            {en
              ? "Every Agrivo shipment file is composed exclusively of plots assessed \"Compliant\" by satellite (Whisp method, FAO), with volumes reconciled plot by plot. Milestones are documentary (declared at each step). This is a compliance assessment, not a guarantee: the operator remains solely responsible for its due diligence statement (DDS) under Regulation (EU) 2023/1115."
              : "Chaque dossier d'expédition Agrivo est composé exclusivement de parcelles évaluées « Conforme » par satellite (méthode Whisp, FAO), avec des volumes réconciliés parcelle par parcelle. Les jalons sont documentaires (déclarés à chaque étape). Il s'agit d'une évaluation de conformité, non d'une garantie : l'opérateur reste seul responsable de sa déclaration de diligence raisonnée (DDS) au sens du règlement (UE) 2023/1115."}
          </p>
          <Link
            href="/methodologie"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-green-signal outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
          >
            {en ? "How these files are assembled (methodology)" : "Comment ces dossiers sont assemblés (méthodologie)"}
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ResultatExpedition({ exp, en, lang }: { exp: Expedition; en: boolean; lang: "fr" | "en" }) {
  const parcelles = parcellesExpedition(exp);
  const prog = progressionExpedition(exp);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Ship className="h-6 w-6 text-green-signal" strokeWidth={1.75} aria-hidden />
          <p className="font-mono text-sm text-forest-950">{exp.ref}</p>
        </div>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-green-signal/12 px-3 py-1 text-xs font-semibold text-green-signal">
          <CheckCircle2 size={13} strokeWidth={2.25} aria-hidden />
          {en ? "100% of plots assessed Compliant" : "100 % des parcelles évaluées Conformes"}
        </p>
      </div>

      <p className="mt-3 text-sm font-semibold text-forest-950">{exp.nomLot}</p>

      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-black/[0.06] pt-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-stone-500">{en ? "Commodity" : "Filière"}</dt>
          <dd className="mt-0.5 text-forest-950">{FILIERE_LABEL[exp.filiere]} · SH {exp.codeSH}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-stone-500">{en ? "Tonnage" : "Tonnage"}</dt>
          <dd className="mt-0.5 font-mono text-forest-950">{tonnageExpedition(exp)} t</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-stone-500">{en ? "Plots of origin" : "Parcelles d'origine"}</dt>
          <dd className="mt-0.5 font-mono text-forest-950">{parcelles.length}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-stone-500">{en ? "Route" : "Trajet"}</dt>
          <dd className="mt-0.5 text-forest-950">
            {exp.portDepart} → {exp.portArrivee}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-stone-500">{en ? "Composed on" : "Composé le"}</dt>
          <dd className="mt-0.5 font-mono text-forest-950">{formatDate(exp.creeLe, lang)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-stone-500">{en ? "Cooperatives" : "Coopératives"}</dt>
          <dd className="mt-0.5 text-forest-950">{[...new Set(parcelles.map((p) => p.cooperative))].length}</dd>
        </div>
      </dl>

      {/* Jalons documentaires */}
      <div className="mt-5 border-t border-black/[0.06] pt-5">
        <p className="text-[11px] uppercase tracking-wide text-stone-500">
          {en ? "Documentary milestones" : "Jalons documentaires"}
        </p>
        <ol className="mt-2 space-y-1.5">
          {JALONS_ORDRE.map((code, i) => {
            const jalon = exp.jalons.find((j) => j.code === code);
            const atteint = i < prog;
            return (
              <li key={code} className="flex items-center gap-2 text-sm">
                {atteint ? (
                  <CheckCircle2 size={15} className="shrink-0 text-green-signal" strokeWidth={2.25} aria-hidden />
                ) : (
                  <Anchor size={15} className="shrink-0 text-stone-300" strokeWidth={1.75} aria-hidden />
                )}
                <span className={atteint ? "text-forest-950" : "text-stone-400"}>
                  {JALON_LABEL[code][lang]}
                  {jalon ? <span className="ml-1.5 font-mono text-xs text-stone-500">{formatDate(jalon.date, lang)}</span> : null}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mt-5 rounded-lg bg-ivory px-3.5 py-2.5 text-xs leading-relaxed text-stone-500">
        {en
          ? "This result reflects Agrivo's assessment of the lot's plots of origin at composition time. Milestones are declarative. It is not a guarantee and does not replace the operator's due diligence statement (DDS) under Regulation (EU) 2023/1115."
          : "Ce résultat reflète l'évaluation par Agrivo des parcelles d'origine du lot au moment de sa composition. Les jalons sont déclaratifs. Il ne constitue pas une garantie et ne remplace pas la déclaration de diligence raisonnée (DDS) de l'opérateur au sens du règlement (UE) 2023/1115."}
      </p>
    </motion.div>
  );
}

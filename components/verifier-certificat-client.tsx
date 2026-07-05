"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ShieldCheck, ShieldAlert, ShieldQuestion, FileSearch } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  PARCELLES,
  STATUT_PHRASE,
  FILIERE_LABEL,
  fmtHa,
  formatDateFr,
  type Parcelle,
} from "@/data/mock-parcelles";

/**
 * Vérification PUBLIQUE d'un certificat Agrivo : un acheteur (ou le jury) saisit ou scanne
 * (QR du PDF) un numéro AGV-… et obtient le statut réel de la parcelle. Aucune donnée
 * personnelle au-delà de ce que le certificat porte déjà. Préremplissage via ?ref=.
 */
export function VerifierCertificatClient() {
  const params = useSearchParams();
  const initial = (params.get("ref") ?? "").toUpperCase();
  const [query, setQuery] = useState(initial);
  const [searched, setSearched] = useState(initial);

  const result: Parcelle | undefined = useMemo(() => {
    const q = searched.trim().toUpperCase();
    if (!q) return undefined;
    return PARCELLES.find((p) => p.numeroCertificat.toUpperCase() === q);
  }, [searched]);

  const notFound = Boolean(searched.trim()) && !result;

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <SiteHeader variant="solid" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14 sm:py-20">
        <p className="text-[11px] uppercase tracking-widest text-stone-500">Vérification publique</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-forest-950 sm:text-4xl">
          Vérifier un certificat Agrivo
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
          Saisissez le numéro imprimé sur le certificat (ou scannez son QR code) pour confirmer
          son authenticité et le statut de la parcelle au moment de l&apos;émission.
        </p>

        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setSearched(query);
          }}
        >
          <label className="sr-only" htmlFor="cert-ref">
            Numéro de certificat
          </label>
          <input
            id="cert-ref"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="AGV-2026-0417"
            autoComplete="off"
            spellCheck={false}
            className="w-full flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 font-mono text-sm text-forest-950 outline-none transition focus:border-green-signal focus:ring-2 focus:ring-green-signal/25"
          />
          <button
            type="submit"
            className="btn-green inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Vérifier
          </button>
        </form>

        <div aria-live="polite" className="mt-8">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {result.statut === "conforme" ? (
                    <ShieldCheck className="h-6 w-6 text-green-signal" strokeWidth={1.75} aria-hidden />
                  ) : result.statut === "anomalie" ? (
                    <ShieldAlert className="h-6 w-6 text-red-block" strokeWidth={1.75} aria-hidden />
                  ) : (
                    <ShieldQuestion className="h-6 w-6 text-amber-cacao" strokeWidth={1.75} aria-hidden />
                  )}
                  <p className="font-mono text-sm text-forest-950">{result.numeroCertificat}</p>
                </div>
                <StatusBadge statut={result.statut} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">{STATUT_PHRASE[result.statut]}</p>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-black/[0.06] pt-5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-stone-500">Producteur</dt>
                  <dd className="mt-0.5 font-medium text-forest-950">{result.producteurNom}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-stone-500">Coopérative</dt>
                  <dd className="mt-0.5 text-forest-950">{result.cooperative}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-stone-500">Filière</dt>
                  <dd className="mt-0.5 text-forest-950">{FILIERE_LABEL[result.filiere]}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-stone-500">Superficie</dt>
                  <dd className="mt-0.5 font-mono text-forest-950">{fmtHa(result.superficieHa)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-stone-500">Vérifiée le</dt>
                  <dd className="mt-0.5 font-mono text-forest-950">{formatDateFr(result.dateVerification)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-stone-500">Date pivot</dt>
                  <dd className="mt-0.5 font-mono text-forest-950">{formatDateFr(result.datePivotAnalyse)}</dd>
                </div>
              </dl>
              <p className="mt-5 rounded-lg bg-ivory px-3.5 py-2.5 text-xs leading-relaxed text-stone-500">
                Ce résultat reflète l&apos;évaluation au moment de l&apos;émission du certificat. Il ne
                constitue pas une garantie et ne se substitue pas à la déclaration de diligence de
                l&apos;opérateur.
              </p>
            </motion.div>
          )}

          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-2xl border border-red-block/25 bg-red-block/[0.06] p-5"
            >
              <FileSearch className="mt-0.5 h-5 w-5 shrink-0 text-red-block" strokeWidth={1.75} aria-hidden />
              <div>
                <p className="text-sm font-semibold text-forest-950">Certificat introuvable</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  Aucun certificat ne correspond au numéro « {searched.trim()} ». Vérifiez la saisie
                  (format AGV-AAAA-NNNN) ou contactez la coopérative émettrice.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

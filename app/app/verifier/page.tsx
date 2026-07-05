"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { VerifierStepper } from "@/components/verifier/verifier-stepper";
import { StepScan } from "@/components/verifier/step-scan";
import { StepAnalysis } from "@/components/verifier/step-analysis";
import { StepCertificate } from "@/components/verifier/step-certificate";
import { StepCredit } from "@/components/verifier/step-credit";
import { StatusBadge } from "@/components/ui/status-badge";
import { PinMark } from "@/components/ui/pin-mark";
import { buildCertificat } from "@/lib/certificat-data";
import {
  COOP_DEMO,
  MANAGER_DEMO,
  PARCELLES,
  getParcelle,
  type Parcelle,
} from "@/data/mock-parcelles";
import type { ScanResult } from "@/lib/ai/gemini";
import type { WhispResult } from "@/lib/ai/whisp";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function VerifierPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1); // 1-5 ; 6 = écran de fin
  const [, setScan] = useState<ScanResult | null>(null);
  const [parcelle, setParcelle] = useState<Parcelle | null>(null);
  const [whisp, setWhisp] = useState<WhispResult | null>(null);

  const certData = useMemo(
    () =>
      parcelle
        ? buildCertificat(
            parcelle,
            whisp ? { statut: whisp.statut, phrase: whisp.phrase, sources: whisp.sources } : undefined,
          )
        : null,
    [parcelle, whisp],
  );

  function onScanConfirm(scan: ScanResult) {
    setScan(scan);
    const found = PARCELLES.find((p) => p.numeroCartePro === scan.numeroCartePro) ?? getParcelle("p01")!;
    setParcelle(found);
    setStep(3);
  }

  function afterAnalysis() {
    setStep(whisp?.statut === "insuffisant" ? 6 : 4);
  }
  function afterCertificate() {
    setStep(whisp?.statut === "conforme" ? 5 : 6);
  }

  function finalize() {
    try {
      if (parcelle && whisp) {
        sessionStorage.setItem(
          "agrivo_verifie",
          JSON.stringify({ id: parcelle.id, nom: parcelle.producteurNom, statut: whisp.statut, at: Date.now() }),
        );
      }
    } catch {
      /* ignore */
    }
    router.push("/app/dashboard");
  }

  function reset() {
    setScan(null);
    setParcelle(null);
    setWhisp(null);
    setStep(1);
  }

  const stepperCurrent = Math.min(step, 5);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <Link
          href="/app/dashboard"
          className="inline-flex w-fit items-center gap-1.5 rounded-full text-sm text-stone-500 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
        >
          <ArrowLeft size={15} strokeWidth={2} aria-hidden />
          Tableau de bord
        </Link>
        <div>
          <p className="eyebrow text-green-signal">Parcours de vérification</p>
          <h1 className="mt-1 font-display text-3xl leading-tight text-forest-950 sm:text-4xl">
            Nouvelle vérification
          </h1>
        </div>
        {step <= 5 && <VerifierStepper current={stepperCurrent} />}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.32, ease: EASE }}
        >
          {step === 1 && (
            <StepConfirm onStart={() => setStep(2)} />
          )}

          {step === 2 && <StepScan onBack={() => setStep(1)} onConfirm={onScanConfirm} />}

          {step === 3 && parcelle && (
            <StepAnalysis
              parcelle={parcelle}
              onVerdict={setWhisp}
              onNext={afterAnalysis}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && certData && whisp && (
            <StepCertificate
              data={certData}
              nextLabel={whisp.statut === "conforme" ? "Proposer un crédit" : "Terminer"}
              onNext={afterCertificate}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && parcelle && (
            <StepCredit
              producteurNom={parcelle.producteurNom}
              onFinish={finalize}
              onBack={() => setStep(4)}
            />
          )}

          {step === 6 && (
            <StepDone parcelle={parcelle} whisp={whisp} onFinish={finalize} onReset={reset} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------- Étape 1 : Confirmation --------------------------------- */
function StepConfirm({ onStart }: { onStart: () => void }) {
  return (
    <div className="card-premium mx-auto max-w-xl p-6 sm:p-8">
      <span className="chip-green grid h-12 w-12 place-items-center rounded-2xl" aria-hidden>
        <ShieldCheck size={24} strokeWidth={1.75} className="text-green-signal" />
      </span>
      <h2 className="mt-4 font-display text-2xl leading-tight text-forest-950">Consentement enregistré</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-500">
        Vous vérifiez une parcelle pour la {COOP_DEMO}. Le consentement éclairé du producteur a été
        recueilli. La vérification se déroule en trois temps : scan de la carte, cartographie satellite,
        puis verdict et suites (certificat, crédit).
      </p>

      <dl className="mt-5 flex flex-col divide-y divide-black/[0.05] rounded-xl bg-ivory-deep/40 px-4">
        <Row label="Coopérative" value={COOP_DEMO} />
        <Row label="Gérant" value={MANAGER_DEMO} />
        <Row label="Consentement ARTCI" value="Recueilli" />
      </dl>

      <button
        type="button"
        onClick={onStart}
        className="btn-green group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        Commencer le scan
        <ArrowRight size={16} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className="text-sm font-medium text-forest-950">{value}</dd>
    </div>
  );
}

/* --------------------------------- Étape finale --------------------------------- */
function StepDone({
  parcelle,
  whisp,
  onFinish,
  onReset,
}: {
  parcelle: Parcelle | null;
  whisp: WhispResult | null;
  onFinish: () => void;
  onReset: () => void;
}) {
  const statut = whisp?.statut ?? "conforme";
  const message =
    statut === "anomalie"
      ? "L'anomalie a été signalée. Le certificat documente la perte de couverture détectée pour la suite du dossier."
      : statut === "insuffisant"
        ? "L'analyse n'est pas concluante : un nouveau passage satellite est nécessaire. Aucun certificat n'est émis à ce stade."
        : "La parcelle est conforme, le certificat est prêt pour TRACES NT.";

  return (
    <div className="card-premium mx-auto max-w-xl p-8 text-center">
      <div className="chip-green mx-auto grid h-16 w-16 place-items-center rounded-2xl" aria-hidden>
        {statut === "insuffisant" ? (
          <PinMark size={40} color="var(--color-amber-cacao)" leafColor="rgba(255,255,255,0.9)" />
        ) : (
          <CheckCircle2 size={34} strokeWidth={1.75} className="text-green-signal" />
        )}
      </div>
      <h2 className="mt-5 font-display text-2xl text-forest-950">Vérification terminée</h2>
      {parcelle && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-sm text-stone-500">{parcelle.producteurNom}</span>
          <StatusBadge statut={statut} size="sm" />
        </div>
      )}
      <p className="mx-auto mt-3 max-w-prose text-sm leading-relaxed text-stone-500">{message}</p>

      <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onFinish}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-forest-950 px-6 py-3.5 text-sm font-semibold text-white outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Retour au tableau de bord
          <ArrowRight size={16} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal"
        >
          <RotateCcw size={15} strokeWidth={2} aria-hidden />
          Nouvelle vérification
        </button>
      </div>
    </div>
  );
}

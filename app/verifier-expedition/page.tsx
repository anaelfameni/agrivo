import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifierExpeditionClient } from "@/components/verifier-expedition-client";

export const metadata: Metadata = {
  title: "Vérifier une expédition",
  description:
    "Vérifiez publiquement le dossier de conformité RDUE d'une expédition Agrivo : parcelles d'origine, tonnage et jalons documentaires, à partir de sa référence.",
};

/** Page PUBLIQUE de vérification d'un dossier d'expédition (cible du QR du dossier conteneur). */
export default function VerifierExpeditionPage() {
  return (
    <Suspense>
      <VerifierExpeditionClient />
    </Suspense>
  );
}

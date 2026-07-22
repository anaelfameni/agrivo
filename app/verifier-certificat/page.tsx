import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifierCertificatClient } from "@/components/verifier-certificat-client";

export const metadata: Metadata = {
  title: "Vérifier un certificat",
  description:
    "Vérifiez publiquement l'authenticité d'un certificat de conformité RDUE émis par Agrivo à partir de son numéro.",
};

/** Page PUBLIQUE de vérification d'un certificat (cible du QR code imprimé dans le PDF). */
export default function VerifierCertificatPage() {
  return (
    <Suspense>
      <VerifierCertificatClient />
    </Suspense>
  );
}

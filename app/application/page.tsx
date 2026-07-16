import type { Metadata } from "next";
import { ApplicationClient } from "@/components/application-client";

export const metadata: Metadata = {
  title: "Application mobile",
  description:
    "Téléchargez l'application mobile AGRIVO pour Android : vérification des parcelles au champ, analyse satellite en direct, certificats et dossiers d'expédition, la conformité RDUE dans votre poche.",
};

/** Page publique de téléchargement de l'application mobile (APK Android signé). */
export default function ApplicationPage() {
  return <ApplicationClient />;
}

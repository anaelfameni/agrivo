"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Download,
  MapPinned,
  Satellite,
  ScrollText,
  Ship,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useLanguage } from "@/components/language-provider";

/** Lien direct de téléchargement de l'APK signé (hébergement dédié). */
const APK_URL = "https://agri-feda-gi.vercel.app/AGRIVO_App.apk";

const COPY = {
  fr: {
    eyebrow: "Application mobile",
    titre: "AGRIVO dans votre poche, jusqu'au bord du champ.",
    sous: "L'application Android officielle : la même plateforme, pensée pour le terrain, cartographie GPS de la parcelle, analyse satellite en direct, certificats et dossiers d'expédition.",
    bouton: "Télécharger l'application mobile",
    boutonSub: "APK Android officiel, signé numériquement · gratuit",
    versionNote: "Compatible avec les téléphones Android récents · installation directe, sans Play Store.",
    featuresTitre: "Tout AGRIVO, optimisé pour le terrain",
    features: [
      { titre: "Cartographie au champ", texte: "Tour de champ GPS réel ou point central : la parcelle se capture avec un simple téléphone, précision affichée en direct." },
      { titre: "Le satellite juge, en direct", texte: "Chaque parcelle est analysée par Whisp (FAO) sur Google Earth Engine, verdict expliqué en langage clair." },
      { titre: "Scan de la carte producteur", texte: "La caméra lit la carte : identité rattachée au dossier, anti-doublon automatique." },
      { titre: "Certificats vérifiables", texte: "Certificat PDF avec QR code : n'importe quel acheteur vérifie publiquement, sans compte." },
      { titre: "Assistant IA intégré", texte: "Prix, verdicts, réglementation : l'assistant répond en direct, en français et en anglais." },
      { titre: "Pensée pour le terrain ivoirien", texte: "Conçue pour les téléphones d'entrée de gamme et les zones à connexion irrégulière." },
    ],
    installTitre: "Installation en 3 gestes",
    install: [
      "Téléchargez le fichier AGRIVO_App.apk avec le bouton ci-dessus.",
      "Ouvrez le fichier : Android vous demande d'autoriser l'installation, acceptez.",
      "L'icône AGRIVO apparaît sur votre écran d'accueil. Connectez-vous, c'est prêt.",
    ],
    installNote: "L'application est signée numériquement par AGRIVO. À l'ouverture, elle s'affiche en plein écran, comme n'importe quelle application native.",
    demoTitre: "Envie d'essayer sans installer ?",
    demoTexte: "La plateforme web offre exactement la même expérience :",
    demoLien: "Ouvrir la plateforme web",
  },
  en: {
    eyebrow: "Mobile app",
    titre: "AGRIVO in your pocket, all the way to the field.",
    sous: "The official Android app: the same platform, built for the field, GPS plot mapping, live satellite analysis, certificates and shipment files.",
    bouton: "Download the mobile app",
    boutonSub: "Official, digitally signed Android APK · free",
    versionNote: "Compatible with recent Android phones · direct install, no Play Store needed.",
    featuresTitre: "All of AGRIVO, optimised for the field",
    features: [
      { titre: "Field mapping", texte: "Real GPS field walk or centre point: the plot is captured with a simple phone, accuracy displayed live." },
      { titre: "The satellite judges, live", texte: "Every plot is analysed by Whisp (FAO) on Google Earth Engine, verdict explained in plain language." },
      { titre: "Farmer card scan", texte: "The camera reads the card: identity attached to the file, automatic duplicate check." },
      { titre: "Verifiable certificates", texte: "PDF certificate with QR code: any buyer verifies publicly, no account needed." },
      { titre: "Built-in AI assistant", texte: "Pricing, verdicts, regulation: the assistant answers live, in French and English." },
      { titre: "Built for the Ivorian field", texte: "Designed for entry-level phones and areas with irregular connectivity." },
    ],
    installTitre: "Install in 3 steps",
    install: [
      "Download the AGRIVO_App.apk file with the button above.",
      "Open the file: Android asks you to allow the installation, accept.",
      "The AGRIVO icon appears on your home screen. Sign in, you're ready.",
    ],
    installNote: "The app is digitally signed by AGRIVO. It opens full screen, like any native application.",
    demoTitre: "Want to try without installing?",
    demoTexte: "The web platform offers exactly the same experience:",
    demoLien: "Open the web platform",
  },
} as const;

const ICONS = [MapPinned, Satellite, ScrollText, Ship, Sparkles, WifiOff];

export function ApplicationClient() {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <SiteHeader variant="solid" />
      <main className="flex-1">
        {/* Héro + bouton de téléchargement */}
        <section className="relative isolate overflow-hidden bg-forest-950 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-signal/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-amber-cacao/10 blur-3xl" />
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-24">
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <p className="eyebrow text-amber-soft">{t.eyebrow}</p>
              <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{t.titre}</h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">{t.sous}</p>

              <div className="mt-8 flex flex-col items-start gap-3">
                <a
                  href={APK_URL}
                  download="AGRIVO_App.apk"
                  className="btn-green group inline-flex items-center gap-3 rounded-full px-7 py-4 text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950"
                >
                  <Download size={20} strokeWidth={2.25} aria-hidden className="transition-transform group-hover:translate-y-0.5" />
                  {t.bouton}
                </a>
                <p className="flex items-center gap-2 text-sm text-white/60">
                  <ShieldCheck size={15} className="text-green-signal" strokeWidth={2} aria-hidden />
                  {t.boutonSub}
                </p>
                <p className="text-xs text-white/40">{t.versionNote}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Fonctionnalités */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
          <h2 className="font-display text-2xl text-forest-950 sm:text-3xl">{t.featuresTitre}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.map((f, i) => {
              const Icon = ICONS[i];
              return (
                <motion.div
                  key={f.titre}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.06 }}
                  className="card-premium rounded-2xl p-5"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-signal/10" aria-hidden>
                    <Icon size={19} strokeWidth={1.9} className="text-green-signal" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-forest-950">{f.titre}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{f.texte}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Installation */}
        <section className="bg-ivory-deep/40">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8">
            <div className="grid items-start gap-10 lg:grid-cols-2">
              <div>
                <h2 className="flex items-center gap-2.5 font-display text-2xl text-forest-950">
                  <Smartphone size={24} strokeWidth={1.75} className="text-green-signal" aria-hidden />
                  {t.installTitre}
                </h2>
                <ol className="mt-6 space-y-4">
                  {t.install.map((etape, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-950 text-xs font-bold text-green-signal" aria-hidden>
                        {i + 1}
                      </span>
                      <p className="pt-1 text-sm leading-relaxed text-stone-700">{etape}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 max-w-lg rounded-xl border border-green-signal/25 bg-green-signal/[0.06] px-4 py-3 text-xs leading-relaxed text-forest-950">
                  {t.installNote}
                </p>
              </div>
              <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
                <h3 className="text-sm font-semibold text-forest-950">{t.demoTitre}</h3>
                <p className="mt-1.5 text-sm text-stone-600">{t.demoTexte}</p>
                <a
                  href="/app/dashboard"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-forest-950/20 px-5 py-2.5 text-sm font-semibold text-forest-950 outline-none transition-colors hover:border-green-signal focus-visible:ring-2 focus-visible:ring-green-signal"
                >
                  {t.demoLien}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

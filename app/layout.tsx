import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SplashScreen } from "@/components/splash-screen";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/components/auth-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { DemoGuide } from "@/components/demo-guide";
import { PwaRegister } from "@/components/pwa-register";
import { BRAND_NAME } from "@/config/brand";

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Police des TITRES (décision Anael Session 9) — Space Grotesk : grotesque géométrique à fort
// caractère, ne « ressemble pas à l'IA », s'accorde avec les chiffres mono. Remplace Newsreader + Fraunces.
const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Signature serif de marque (demande Anael) — Newsreader restaurée UNIQUEMENT sur le wordmark
// « Agrivo », le titre hero et l'écran de bienvenue via la classe `.font-brand-serif`. Les autres
// titres restent en Space Grotesk.
const brandSerif = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://agrivo-io.vercel.app";
const DESCRIPTION =
  "AGRIVO vérifie la conformité RDUE d'une parcelle agricole en quelques secondes, génère le certificat et transforme la conformité prouvée en primes négociables.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND_NAME} · Prêt à exporter`,
    template: `%s · ${BRAND_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: BRAND_NAME,
  keywords: ["RDUE", "EUDR", "conformité", "déforestation", "cacao", "Côte d'Ivoire", "traçabilité", "primes de durabilité"],
  icons: { icon: "/icons/icon.svg" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} · La conformité agricole, simplifiée`,
    description: DESCRIPTION,
    locale: "fr_FR",
    images: [{ url: "/textures/sat-soubre-rural.jpg", width: 1200, height: 800, alt: "Parcelle agricole vérifiée par satellite près de Soubré, Côte d'Ivoire" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} · La conformité agricole, simplifiée`,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${display.variable} ${brandSerif.variable} ${sans.variable} ${mono.variable} antialiased`}
    >
      <head>
        {/* Données structurées Organization : identité de marque pour moteurs et IA génératives. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Agrivo",
              url: "https://agrivo-io.vercel.app",
              description:
                "La place de marché des lots agricoles conformes vérifiés (RDUE). Le SNT identifie. AGRIVO rend vendable : preuve satellite par parcelle, sceau du lot, dossier prêt pour la diligence raisonnée de l'acheteur européen.",
              areaServed: "Côte d'Ivoire",
              knowsAbout: ["RDUE", "EUDR", "traçabilité cacao", "Système national de traçabilité", "carte producteur", "TRACES NT"],
              email: "support@agrivo.ci",
            }),
          }}
        />
        {/* Anti-flash : pose un masque forest sur « / » AVANT le premier paint.
            Retiré par <SplashScreen> dès qu'il prend le relai à l'écran. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.pathname==='/'){document.documentElement.style.backgroundColor='#0a1f14';var m=document.createElement('div');m.id='splash-mask';m.style.cssText='position:fixed;inset:0;z-index:9998;background:#0a1f14';document.documentElement.appendChild(m);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
          {/* Splash + bandeau cookies DANS le provider : ils consomment la langue (useLanguage). */}
          <SplashScreen />
          <CookieConsent />
          <DemoGuide />
          <PwaRegister />
        </LanguageProvider>
      </body>
    </html>
  );
}

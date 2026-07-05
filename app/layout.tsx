import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SplashScreen } from "@/components/splash-screen";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/components/auth-provider";
import { CookieConsent } from "@/components/cookie-consent";
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

export const metadata: Metadata = {
  title: `${BRAND_NAME} · Prêt à exporter`,
  description:
    "AGRIVO vérifie la conformité RDUE d'une parcelle de cacao en quelques secondes, génère le certificat et ouvre l'accès au micro-crédit du producteur.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} antialiased`}
    >
      <head>
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
        </LanguageProvider>
      </body>
    </html>
  );
}

import type { NextConfig } from "next";
import path from "node:path";

/**
 * En-têtes de sécurité (audit Webisafe du 18/07/2026 : CSP, X-Frame-Options,
 * X-Content-Type-Options, Referrer-Policy, Permissions-Policy manquants).
 *
 * CSP calibrée pour la stack réelle :
 * - script 'unsafe-inline'/'unsafe-eval' : requis par l'hydratation Next.js et les JSON-LD
 *   inline (FAQ/Organization) ; aucun script TIERS n'est chargé (supply chain 0 externe).
 * - img : tuiles Esri (imagerie + noms de lieux) chargées par Leaflet, data:/blob: pour les
 *   QR codes et les aperçus photo.
 * - connect 'self' uniquement : tous les appels (Whisp, Gemini, cours ICE) passent par nos
 *   routes API côté serveur, jamais depuis le navigateur.
 * - worker blob: : service worker PWA et génération PDF (@react-pdf) dans le navigateur.
 * - frame-ancestors 'self' : anti-clickjacking (équivalent moderne de X-Frame-Options).
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://server.arcgisonline.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Caméra et géolocalisation autorisées pour NOTRE origine seulement (scan de carte, GPS terrain).
  { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Fixe la racine du workspace (plusieurs lockfiles possibles sur la machine).
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;

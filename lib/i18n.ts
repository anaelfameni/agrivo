/**
 * Dictionnaire de traduction AGRIVO. Deux langues d'INTERFACE : Français (défaut) et Anglais.
 * (Le Dioula et le Baoulé ne sont plus des langues d'interface : seule l'IA VOCALE les parle.)
 * Les 3 statuts de conformité restent les mots figés de la charte côté français.
 */
export const LANGUAGES = ["fr", "en"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "fr";

export const LANGUAGE_META: Record<Language, { label: string; native: string; short: string }> = {
  fr: { label: "Français", native: "Français", short: "FR" },
  en: { label: "Anglais", native: "English", short: "EN" },
};

export type TranslationKey =
  | "welcome"
  | "verify"
  | "viewDemo"
  | "contact"
  | "statusConforme"
  | "statusAnomalie"
  | "statusInsuffisant"
  | "verdictsTitle"
  | "language";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  fr: {
    welcome: "De la parcelle vérifiée à la prime négociée.",
    verify: "Commencer la vérification",
    viewDemo: "Voir le tableau de bord",
    contact: "Nous contacter",
    statusConforme: "Conforme",
    statusAnomalie: "Anomalie détectée",
    statusInsuffisant: "Données insuffisantes",
    verdictsTitle: "Les trois verdicts",
    language: "Langue",
  },
  en: {
    welcome: "From the verified plot to the negotiated premium.",
    verify: "Start verification",
    viewDemo: "View the dashboard",
    contact: "Contact us",
    statusConforme: "Compliant",
    statusAnomalie: "Anomaly detected",
    statusInsuffisant: "Insufficient data",
    verdictsTitle: "The three verdicts",
    language: "Language",
  },
};

export function translate(lang: Language, key: TranslationKey): string {
  return translations[lang]?.[key] ?? translations.fr[key];
}

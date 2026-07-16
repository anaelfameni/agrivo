"use client";
import Link from "next/link";
import { Database, ShieldCheck, Download, EyeOff, Landmark, ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { PageHero } from "@/components/landing/page-hero";
import { useLanguage } from "@/components/language-provider";

/**
 * « Vos données vous appartiennent » : la politique de propriété des données, en une page.
 * Réponse produit à la méfiance documentée par l'étude de marché (peur de la désintermédiation
 * et de la captation du registre par des plateformes étrangères). Ton charte : concret, honnête,
 * jamais de promesse invérifiable.
 */
const TR = {
  fr: {
    eyebrow: "Propriété des données",
    title: "Vos données vous appartiennent.",
    sub: "Le registre de votre coopérative, les parcelles de vos producteurs et vos dossiers d'expédition restent votre propriété. AGRIVO les héberge, les vérifie et les met en valeur ; il ne les possède jamais.",
    principesTitle: "Cinq engagements, en clair",
    principes: [
      { icon: Database, t: "Le registre reste à la coopérative", d: "Les données importées ou saisies (producteurs, parcelles, documents) restent la propriété de la coopérative qui les a fournies, conformément à la loi ivoirienne n° 2013-450 sur la protection des données (ARTCI)." },
      { icon: Download, t: "Vous repartez avec tout", d: "À tout moment, vous exportez l'intégralité de votre registre dans des formats ouverts (GeoJSON RFC 7946, CSV, PDF). Aucune donnée n'est retenue en cas de départ." },
      { icon: EyeOff, t: "Jamais revendues, jamais partagées sans vous", d: "AGRIVO ne vend pas vos données et ne les transmet à un tiers (acheteur, exportateur, administration) qu'avec votre action explicite : c'est vous qui partagez un dossier, jamais nous." },
      { icon: ShieldCheck, t: "Le producteur consent, et ça se voit", d: "Chaque vérification commence par un écran de consentement. La photo de la carte producteur est conservée comme pièce justificative, pour le dossier du producteur, pas pour autre chose." },
      { icon: Landmark, t: "Compatible avec le dispositif national", d: "AGRIVO travaille au-dessus du Système national de traçabilité, jamais à sa place : vos obligations envers le Conseil du Café-Cacao restent les vôtres, nos exports vous aident à les remplir." },
    ],
    pourquoiTitle: "Pourquoi c'est important",
    pourquoi: "La donnée de traçabilité est en train de devenir la ressource stratégique de la filière. Des plateformes étrangères la collectent pour la revendre aux acheteurs : la coopérative perd alors la valeur de son propre travail. AGRIVO prend le parti inverse : la donnée reste à l'origine, et c'est l'origine qui la monnaie.",
    cta: "Une question sur vos données ?",
    ctaBtn: "Écrire à l'équipe",
    legal: "Détail juridique complet dans notre",
    legalLink: "politique de confidentialité",
  },
  en: {
    eyebrow: "Data ownership",
    title: "Your data belongs to you.",
    sub: "Your cooperative's register, your farmers' plots and your shipment files remain your property. AGRIVO hosts, verifies and valorises them; it never owns them.",
    principesTitle: "Five commitments, in plain words",
    principes: [
      { icon: Database, t: "The register stays with the cooperative", d: "Imported or entered data (farmers, plots, documents) remain the property of the cooperative that provided them, in line with Ivorian law no. 2013-450 on data protection (ARTCI)." },
      { icon: Download, t: "You leave with everything", d: "At any time, you can export your entire register in open formats (GeoJSON RFC 7946, CSV, PDF). No data is withheld if you leave." },
      { icon: EyeOff, t: "Never sold, never shared without you", d: "AGRIVO does not sell your data and only transmits it to a third party (buyer, exporter, administration) through your explicit action: you share a file, never us." },
      { icon: ShieldCheck, t: "The farmer consents, visibly", d: "Every verification starts with a consent screen. The producer card photo is kept as supporting evidence for the farmer's file, nothing else." },
      { icon: Landmark, t: "Compatible with the national system", d: "AGRIVO works on top of the National Traceability System, never instead of it: your obligations to the Conseil du Café-Cacao remain yours, our exports help you meet them." },
    ],
    pourquoiTitle: "Why it matters",
    pourquoi: "Traceability data is becoming the strategic resource of the cocoa sector. Foreign platforms collect it to resell it to buyers: the cooperative then loses the value of its own work. AGRIVO takes the opposite stance: the data stays at origin, and origin monetises it.",
    cta: "A question about your data?",
    ctaBtn: "Write to the team",
    legal: "Full legal detail in our",
    legalLink: "privacy policy",
  },
} as const;

export default function VosDonnees() {
  const { lang } = useLanguage();
  const t = TR[lang === "en" ? "en" : "fr"];
  return (
    <div className="min-h-screen bg-ivory text-forest-950">
      <SiteHeader variant="overlay" />
      <main>
        <PageHero eyebrow={t.eyebrow} title={t.title} sub={t.sub} />

        <section className="mx-auto max-w-6xl px-6 py-16 md:px-8">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl">{t.principesTitle}</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {t.principes.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-7">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-green-signal/10 text-green-signal">
                    <p.icon size={20} />
                  </div>
                  <h3 className="mt-4 font-display text-lg">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{p.d}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-green-signal/25 bg-forest-950 p-7 text-white">
                <div>
                  <h3 className="font-display text-lg">{t.pourquoiTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{t.pourquoi}</p>
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-green-signal">
                  <Check size={14} /> {lang === "en" ? "Written into our terms" : "Inscrit dans nos conditions"}
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white p-6">
              <div>
                <p className="text-sm font-semibold">{t.cta}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {t.legal}{" "}
                  <Link href="/confidentialite" className="font-medium text-green-signal hover:underline">{t.legalLink}</Link>.
                </p>
              </div>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-forest-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-950/90">
                {t.ctaBtn} <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

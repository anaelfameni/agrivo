"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Ship,
  ShieldAlert,
  Receipt,
  Landmark,
  Building2,
  FileUp,
  SearchCheck,
  MapPinned,
  Satellite,
  HandCoins,
  ShieldCheck,
  Sprout,
  Coins,
  Percent,
  Boxes,
  Check,
  ScrollText,
  Download,
  Languages,
  WifiOff,
} from "lucide-react";
import { FILIERES, STATUT_FILIERE_LABEL } from "@/config/filieres";
import { SiteHeader } from "@/components/site-header";
import { PageReveal } from "@/components/page-reveal";
import { Hero } from "@/components/landing/hero";
import { HeroBg } from "@/components/landing/hero-bg";
import { Reveal } from "@/components/landing/reveal";
import { StatNumber } from "@/components/ui/stat-number";
import { Tilt, Magnetic, CursorGlow } from "@/components/ui/motion-primitives";
import { Logo } from "@/components/ui/logo";
import { useLanguage } from "@/components/language-provider";
import type { Language } from "@/lib/i18n";

const EASE = [0.16, 1, 0.3, 1] as const;
const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Contenu bilingue de l'accueil (FR par défaut · EN). Un seul point de vérité par section. */
const COPY = {
  fr: {
    probleme: {
      eyebrow: "Pourquoi c'est urgent",
      title: "Trois pressions convergent, sur l'exportateur comme sur le producteur.",
      items: [
        { suffix: " déc. 2026", title: "Le RDUE bloque l'accès au marché", body: "Dès le 30 décembre 2026, un lot sans preuve de zéro déforestation ne peut plus entrer dans l'Union européenne. Amendes jusqu'à 4 % du chiffre d'affaires réalisé en Europe." },
        { prefix: "20 à ", suffix: " M FCFA", title: "La certification manuelle coûte une fortune", body: "Vérifier une coopérative à la main coûte 20 à 40 millions FCFA par an. 94 % de ce coût finit par réduire le revenu réel des producteurs." },
        { suffix: " %", title: "Des données terrain inexploitables", body: "Environ 30 % des données de parcelles collectées sur le terrain ne sont pas assez fiables pour la RDUE : polygones ouverts, doublons, points aberrants. Avoir des fichiers ne suffit pas." },
      ],
    },
    goldenPath: {
      eyebrow: "Comment ça marche",
      title: "Vos données existent déjà. AGRIVO les rend prouvables.",
      sub: "De vos fichiers existants au conteneur prouvé, en 6 étapes.",
      steps: [
        { title: "Importez votre registre", body: "Fichiers de certification, cartographies financées par vos exportateurs : chargez ce que la coopérative détient déjà (.geojson, .kml, .csv)." },
        { title: "AGRIVO l'audite", body: "Chaque parcelle est passée au crible de la règle RDUE : polygones ouverts, doublons, chevauchements, points seuls au-delà de 4 ha." },
        { title: "Complétez les trous", body: "Seules les parcelles manquantes ou rejetées repassent par le terrain : scan de la carte, capture GPS guidée, contrôles d'intégrité." },
        { title: "Le satellite juge", body: "Chaque parcelle est comparée aux images satellites de référence : Conforme, Anomalie détectée ou Données insuffisantes. Chaque verdict est expliqué et certifié." },
        { title: "Valorisez", body: "Certificats vérifiables et dossier DDS prêt pour TRACES NT : la coopérative négocie primes de durabilité et acheteurs premium." },
        { title: "Expédiez, prouvé", body: "L'exportateur compose ses lots à partir de parcelles conformes uniquement : chaque conteneur part avec son dossier RDUE — parcelles d'origine géolocalisées, volumes réconciliés, GeoJSON prêt pour TRACES NT." },
      ],
    },
    triptyque: {
      eyebrow: "Le différenciateur",
      title: "La seule solution qui combine conformité, santé des sols et valorisation commerciale.",
      pillars: [
        { t: "Conformité RDUE", d: "La vérification satellite de chaque parcelle et le certificat d'évaluation de conformité, prêt pour TRACES NT." },
        { t: "Santé des sols", d: "Un score de résilience des sols, méthodologie inspirée de standards reconnus type Kubeko." },
        { t: "Valorisation commerciale", d: "La conformité prouvée devient l'argument des primes de durabilité et des acheteurs premium." },
      ],
    },
    fonctionnalites: {
      eyebrow: "La plateforme",
      title: "Tout ce qu'il faut pour exporter conforme, réuni.",
      features: [
        { t: "Vérification satellite", d: "La vérification satellite (méthode FAO) de chaque parcelle, comparée à la date pivot du 31 décembre 2020." },
        { t: "Certificat d'évaluation de conformité", d: "Un certificat d'évaluation de conformité (PDF horodaté), aligné sur le format de déclaration TRACES NT." },
        { t: "Export des parcelles", d: "Vos parcelles au format géographique officiel, prêtes pour vos systèmes et la déclaration européenne." },
        { t: "Valorisation commerciale", d: "La conformité prouvée devient l'argument des primes de durabilité et des acheteurs premium." },
        { t: "Français et Anglais", d: "Une interface bilingue, et le verdict lu à voix haute pour l'expliquer simplement au producteur." },
        { t: "Mode hors connexion", d: "Le contrôle avance au bord du champ, même sans réseau ; la synchronisation suit." },
      ],
    },
    filieres: {
      eyebrow: "Pas seulement le cacao",
      title: "Un moteur multi-filières pour les 7 matières premières du RDUE.",
      body: "Le déploiement commence par le cacao, la filière la plus urgente. Le produit couvre l'ensemble des matières premières soumises au règlement européen.",
      derives: { badge: "+ dérivés", title: "Produits dérivés", sub: "Chocolat, cuir, papier, pneus…" },
    },
    cartographie: {
      eyebrow: "Cartographie satellite",
      title: "Chaque parcelle, prouvée depuis le ciel.",
      body: "Le contour de la parcelle est comparé aux images satellites depuis la date pivot du 31 décembre 2020. Superficie calculée, verdict rendu, certificat prêt pour TRACES NT.",
      bullets: ["Fond satellite haute résolution", "Contour de parcelle précis (± 11 cm)", "Verdict satellite (méthode FAO) en quelques secondes"],
      badge: "Conforme",
    },
    enjeu: {
      eyebrow: "L'enjeu, à l'échelle du pays",
      title: "Le premier producteur mondial de cacao joue son premier débouché.",
      stats: [
        { value: "1ᵉʳ", label: "producteur mondial de cacao (~45 % de l'offre)" },
        { value: "6 M+", label: "de personnes vivent du cacao en Côte d'Ivoire" },
        { value: "66 %", label: "du cacao ivoirien exporté vers l'Union européenne" },
      ],
      body: "Dès le 30 décembre 2026, ce débouché exigera une preuve de zéro déforestation, parcelle par parcelle. Sans elle, l'accès au marché européen se referme. AGRIVO outille les coopératives pour garder cette porte ouverte.",
      source: "Sources : USDA FAS 2025 ; Trase ; production de cacao en Côte d'Ivoire.",
    },
    chiffres: {
      eyebrow: "La fenêtre d'opportunité",
      title: "Un marché immense, déjà en mouvement.",
      stats: [
        { suffix: " M", label: "hectares géolocalisés par le Conseil Café-Cacao" },
        { suffix: " K", label: "cartes professionnelles déjà distribuées" },
        { suffix: " K+", label: "tonnes de cacao tracées (oct. 2025 – mars 2026)" },
        { suffix: " M€", label: "de financement européen pour un cacao durable" },
      ],
      source: "Source : Conseil Café-Cacao.",
    },
    calendrier: {
      eyebrow: "Le calendrier ne bouge plus",
      before: "avant l'entrée en application du RDUE",
      milestones: [
        { date: "12 juin 2026", label: "Carte producteur active", sub: "Le SNT ivoirien est lancé" },
        { date: "1 sept. 2026", label: "Carte obligatoire", sub: "Pour toute transaction cacao" },
        { date: "30 déc. 2026", label: "RDUE applicable", sub: "DDR obligatoire pour importer dans l'UE" },
      ],
    },
    personas: {
      eyebrow: "Pour qui",
      title: "On parle de personnes, pas d'« utilisateurs ».",
      people: [
        { name: "Amadou", role: "Gérant de coopérative · Soubré", quote: "Je gère 600 producteurs avec un smartphone. Je veux valider un lot en quelques secondes, au bord du champ." },
        { name: "Marc", role: "Directeur durabilité · Abidjan", quote: "Chaque conteneur vers l'Europe doit être 100 % conforme. Je dois vérifier des milliers de parcelles." },
        { name: "Yao", role: "Productrice de café · Man", quote: "Je cultive 2 hectares. Je veux vendre ma récolte au juste prix et garder l'accès au marché européen." },
      ],
    },
    modele: {
      eyebrow: "Modèle économique",
      title: "Trois offres, un modèle transparent.",
      revenues: [
        { name: "Abonnement coopérative", price: "100 000", unit: "FCFA / mois", desc: "Vérifications illimitées, certificats d'évaluation de conformité (PDF), import & audit RDUE du registre, mode hors connexion, support." },
        { name: "Exportateur Essentiel", price: "500 000", unit: "FCFA / mois", desc: "Portefeuille multi-coopératives : tableau de bord, coopératives et producteurs consolidés, registre satellite, dossiers acheteurs, alertes." },
        { name: "Exportateur Pro", price: "1 000 000", unit: "FCFA / mois", desc: "Tout Essentiel, plus : API REST, export en masse, déclarations TRACES NT intégrées, assistant IA de portefeuille, engagement de disponibilité (SLA)." },
      ],
      note: "Le service AGRIVO est gratuit pour le producteur : il ne paie aucun frais pour être vérifié. Le modèle repose sur l'abonnement coopérative et les offres exportateur.",
    },
    verdicts: {
      eyebrow: "Jamais un simple oui / non",
      title: "Trois verdicts, toujours expliqués.",
      sub: "Chaque parcelle reçoit l'un de ces trois verdicts, toujours accompagné d'une explication en langage clair.",
      phrases: [
        "Aucune déforestation détectée après le 31 décembre 2020.",
        "Une perte de couverture forestière a été identifiée sur cette zone.",
        "Présence de nuages ou données satellites insuffisantes pour statuer.",
      ],
    },
    equipe: {
      eyebrow: "L'équipe",
      title: "Une équipe ivoirienne, ancrée dans le terrain.",
      roles: ["Fondateur & chef de projet · Produit & plateforme web", "Ingénieur application mobile", "Ingénieur backend & API", "Responsable conformité & réglementaire"],
    },
    cta: {
      title: "La conformité, prouvée en quelques secondes.",
      body: "Déroulez le parcours complet, du scan de la carte du producteur au dossier de valorisation : chaque parcelle vérifiée, chaque certificat prêt pour TRACES NT.",
      primary: "Créer un compte",
      secondary: "Comprendre la méthode",
      rights: "Agrivo © 2026. Tous droits réservés.",
    },
  },
  en: {
    probleme: {
      eyebrow: "Why it's urgent",
      title: "Three pressures converge, on the exporter and the farmer alike.",
      items: [
        { suffix: " Dec 2026", title: "The EUDR blocks market access", body: "From 30 December 2026, a lot without proof of zero deforestation can no longer enter the European Union. Fines of up to 4% of turnover generated in Europe." },
        { prefix: "20 to ", suffix: "M FCFA", title: "Manual certification costs a fortune", body: "Verifying a cooperative by hand costs 20 to 40 million FCFA per year. 94% of that cost ends up cutting into farmers' real income." },
        { suffix: " %", title: "Field data unfit for use", body: "Around 30% of plot data collected in the field is not reliable enough for the EUDR: open polygons, duplicates, outlier points. Having files is not enough." },
      ],
    },
    goldenPath: {
      eyebrow: "How it works",
      title: "Your data already exists. AGRIVO makes it provable.",
      sub: "From your existing files to a proven container, in 6 steps.",
      steps: [
        { title: "Import your register", body: "Certification files, exporter-funded mapping campaigns: load what the cooperative already owns (.geojson, .kml, .csv)." },
        { title: "AGRIVO audits it", body: "Every plot is checked against the EUDR rule: open polygons, duplicates, overlaps, lone points above 4 ha." },
        { title: "Fill the gaps", body: "Only missing or rejected plots go back to the field: card scan, guided GPS capture, integrity checks." },
        { title: "The satellite judges", body: "Every plot is compared against reference satellite imagery: Compliant, Anomaly detected or Insufficient data. Every verdict is explained and certified." },
        { title: "Valorise", body: "Verifiable certificates and a DDS file ready for TRACES NT: the cooperative negotiates sustainability premiums and premium buyers." },
        { title: "Ship it, proven", body: "The exporter composes lots from compliant plots only: every container leaves with its EUDR file — geolocated plots of origin, reconciled volumes, GeoJSON ready for TRACES NT." },
      ],
    },
    triptyque: {
      eyebrow: "The differentiator",
      title: "The only solution that combines compliance, soil health and commercial valorisation.",
      pillars: [
        { t: "EUDR compliance", d: "Satellite verification of every plot and a compliance-assessment certificate ready for TRACES NT." },
        { t: "Soil health", d: "A soil resilience score, methodology inspired by recognised standards such as Kubeko." },
        { t: "Commercial valorisation", d: "Proven compliance becomes the argument for sustainability premiums and premium buyers." },
      ],
    },
    fonctionnalites: {
      eyebrow: "The platform",
      title: "Everything you need to export compliant, in one place.",
      features: [
        { t: "Satellite verification", d: "Satellite verification (FAO method) on every plot, compared to the 31 December 2020 cut-off date." },
        { t: "Compliance-assessment certificate", d: "A timestamped compliance-assessment certificate (PDF), aligned with the TRACES NT declaration format." },
        { t: "Plot export", d: "Your plots in the official geographic format, ready for your systems and the European declaration." },
        { t: "Commercial valorisation", d: "Proven compliance becomes the argument for sustainability premiums and premium buyers." },
        { t: "French and English", d: "A bilingual interface, with the verdict read aloud to explain it plainly to the farmer." },
        { t: "Offline mode", d: "The check moves forward at the edge of the field, even without a network; syncing follows." },
      ],
    },
    filieres: {
      eyebrow: "Not just cocoa",
      title: "A multi-commodity engine for the 7 EUDR raw materials.",
      body: "Deployment starts with cocoa, the most urgent commodity. The product covers all raw materials subject to the European regulation.",
      derives: { badge: "+ derivatives", title: "Derived products", sub: "Chocolate, leather, paper, tyres…" },
    },
    cartographie: {
      eyebrow: "Satellite mapping",
      title: "Every plot, proven from the sky.",
      body: "The plot outline is compared to satellite imagery from the 31 December 2020 cut-off date. Area computed, verdict issued, certificate ready for TRACES NT.",
      bullets: ["High-resolution satellite base", "Plot outline accurate to ± 11 cm", "Satellite verdict (FAO method) in seconds"],
      badge: "Compliant",
    },
    enjeu: {
      eyebrow: "The stakes, at national scale",
      title: "The world's top cocoa producer is risking its first market.",
      stats: [
        { value: "#1", label: "cocoa producer worldwide (~45% of global supply)" },
        { value: "6M+", label: "people depend on cocoa in Côte d'Ivoire" },
        { value: "66%", label: "of Ivorian cocoa is exported to the European Union" },
      ],
      body: "From 30 December 2026, this market will require proof of zero deforestation, plot by plot. Without it, access to the European market closes. AGRIVO equips cooperatives to keep that door open.",
      source: "Sources: USDA FAS 2025; Trase; cocoa production in Côte d'Ivoire.",
    },
    chiffres: {
      eyebrow: "The window of opportunity",
      title: "A vast market, already in motion.",
      stats: [
        { suffix: " M", label: "hectares geolocated by the Coffee-Cocoa Council" },
        { suffix: " K", label: "professional cards already distributed" },
        { suffix: " K+", label: "tonnes of cocoa traced (Oct 2025 – Mar 2026)" },
        { suffix: " M€", label: "in European funding for sustainable cocoa" },
      ],
      source: "Source: Coffee-Cocoa Council.",
    },
    calendrier: {
      eyebrow: "The calendar won't move",
      before: "until the EUDR takes effect",
      milestones: [
        { date: "12 Jun 2026", label: "Farmer card live", sub: "Côte d'Ivoire's NTS goes live" },
        { date: "1 Sep 2026", label: "Card mandatory", sub: "For every cocoa transaction" },
        { date: "30 Dec 2026", label: "EUDR applicable", sub: "DDS required to import into the EU" },
      ],
    },
    personas: {
      eyebrow: "Who it's for",
      title: "We talk about people, not “users”.",
      people: [
        { name: "Amadou", role: "Cooperative manager · Soubré", quote: "I manage 600 farmers with a smartphone. I want to validate a lot in seconds, at the edge of the field." },
        { name: "Marc", role: "Sustainability Director · Abidjan", quote: "Every container to Europe must be 100% compliant. I have to verify thousands of plots." },
        { name: "Yao", role: "Coffee farmer · Man", quote: "I farm 2 hectares. I want to sell my harvest at a fair price and keep access to the European market." },
      ],
    },
    modele: {
      eyebrow: "Business model",
      title: "Three plans, one transparent model.",
      revenues: [
        { name: "Cooperative subscription", price: "100,000", unit: "FCFA / month", desc: "Unlimited verifications, compliance-assessment certificates (PDF), register import & EUDR audit, offline mode, support." },
        { name: "Exporter Essential", price: "500,000", unit: "FCFA / month", desc: "Multi-cooperative portfolio: dashboard, consolidated cooperatives and farmers, satellite register, buyer files, alerts." },
        { name: "Exporter Pro", price: "1,000,000", unit: "FCFA / month", desc: "Everything in Essential, plus: REST API, batch export, built-in TRACES NT declarations, portfolio AI assistant, SLA commitment." },
      ],
      note: "The AGRIVO service is free for the farmer: they pay no fee to be verified. The model relies on the cooperative subscription and the exporter plans.",
    },
    verdicts: {
      eyebrow: "Never a plain yes / no",
      title: "Three verdicts, always explained.",
      sub: "Every plot receives one of these three verdicts, always with a plain-language explanation.",
      phrases: [
        "No deforestation detected after 31 December 2020.",
        "A loss of forest cover was identified on this area.",
        "Clouds or insufficient satellite data to decide.",
      ],
    },
    equipe: {
      eyebrow: "The team",
      title: "An Ivorian team, rooted in the field.",
      roles: ["Founder & project lead · Product & web platform", "Mobile app engineer", "Backend & API engineer", "Compliance & regulatory lead"],
    },
    cta: {
      title: "Compliance, proven in seconds.",
      body: "Run the full journey, from scanning the farmer's card to the valorisation file: every plot verified, every certificate ready for TRACES NT.",
      primary: "Create an account",
      secondary: "Understand the method",
      rights: "Agrivo © 2026. All rights reserved.",
    },
  },
} as const;

function useCopy() {
  const { lang } = useLanguage();
  return COPY[lang as Language] ?? COPY.fr;
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`eyebrow ${light ? "text-amber-soft" : "text-amber-cacao"}`}>{children}</span>;
}

export default function Landing() {
  return (
    <PageReveal>
      <div className="overflow-x-hidden bg-ivory text-forest-950">
        <SiteHeader variant="overlay" />
        <Hero />

        <ProblemeSection />
        <GoldenPathSection />
        <TriptyqueSection />
        <FonctionnalitesSection />
        <FilieresSection />
        <CartographieSection />
        <MarketplaceSection />
        <ChiffresSection />
        <EnjeuSection />
        <CalendrierSection />
        <PersonasSection />
        <ModeleSection />
        <VerdictsSection />
        <EquipeSection />
        <CtaFooter />
      </div>
    </PageReveal>
  );
}

/* ------------------------------------------------------------------ Problème */
function ProblemeSection() {
  const c = useCopy().probleme;
  const icons = [
    <ShieldAlert key="0" size={22} className="text-red-block" />,
    <Receipt key="1" size={22} className="text-amber-cacao" />,
    <Landmark key="2" size={22} className="text-forest-700" />,
  ];
  const values = [30, 40, 30];
  return (
    <section className="divide-fluid bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
        <Reveal>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-premium text-4xl text-forest-950">{c.title}</h2>
        </Reveal>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="mt-12 grid gap-5 md:grid-cols-3">
          {c.items.map((it, i) => (
            <motion.div key={it.title} variants={rise} className="h-full">
              <Tilt max={5} className="h-full">
                <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="group flex h-full flex-col rounded-2xl border border-black/[0.06] bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_44px_-32px_rgba(10,31,20,0.3)]">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-ivory-deep/60 transition-transform duration-300 group-hover:scale-110">{icons[i]}</div>
                  <div className="num mt-5 text-4xl font-semibold text-forest-950">
                    {"prefix" in it ? it.prefix : ""}
                    <StatNumber value={values[i]} format={(n) => `${Math.round(n)}`} />
                    <span className="text-2xl">{it.suffix}</span>
                  </div>
                  <h3 className="mt-3 font-premium text-xl text-forest-950">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{it.body}</p>
                </motion.div>
              </Tilt>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Golden path (signature) */
function GoldenPathSection() {
  const c = useCopy().goldenPath;
  const icons = [<FileUp key="0" size={22} />, <SearchCheck key="1" size={22} />, <MapPinned key="2" size={22} />, <Satellite key="3" size={22} />, <HandCoins key="4" size={22} />, <Ship key="5" size={22} />];
  const nums = ["01", "02", "03", "04", "05", "06"];
  const reduce = useReducedMotion();
  return (
    <section id="produit" className="relative overflow-hidden bg-ivory-deep/40 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
        <Reveal className="max-w-2xl">
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-premium text-4xl text-forest-950">{c.title}</h2>
          <p className="mt-4 text-stone-600">{c.sub}</p>
        </Reveal>

        <div className="relative mt-16">
          <motion.div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px origin-left bg-gradient-to-r from-green-signal/50 via-amber-cacao/40 to-green-signal/50 md:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.4, ease: EASE }}
          />
          <motion.ol variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} className="grid gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-6">
            {c.steps.map((s, i) => (
              <motion.li key={nums[i]} variants={rise} className="group relative">
                <motion.div whileHover={reduce ? undefined : { y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex flex-col items-start">
                  <div className="relative z-10 grid h-12 w-12 place-items-center rounded-2xl bg-forest-950 text-green-signal shadow-[0_10px_30px_-10px_rgba(10,31,20,0.6)] transition-all duration-300 group-hover:bg-green-signal group-hover:text-white">
                    {icons[i]}
                  </div>
                  <span className="num mt-4 text-xs font-semibold tracking-widest text-amber-cacao">{nums[i]}</span>
                  <h3 className="mt-1 font-premium text-xl text-forest-950">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
                </motion.div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Triptyque (immersif, sombre) */
function TriptyqueSection() {
  const c = useCopy().triptyque;
  const icons = [<ShieldCheck key="0" size={24} />, <Sprout key="1" size={24} />, <Coins key="2" size={24} />];
  return (
    <section className="relative isolate overflow-hidden bg-forest-950 text-white">
      <HeroBg />
      <CursorGlow className="mx-auto max-w-7xl px-6 py-28 md:px-8 lg:px-12">
        <Reveal>
          <Eyebrow light>{c.eyebrow}</Eyebrow>
          <h2 className="mt-4 max-w-4xl font-premium text-3xl leading-[1.2] sm:text-4xl md:text-5xl">{c.title}</h2>
        </Reveal>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} className="mt-14 grid gap-5 lg:grid-cols-3">
          {c.pillars.map((p, i) => (
            <motion.div key={p.t} variants={rise} className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-colors hover:border-green-signal/30">
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-signal/0 blur-2xl transition-all duration-500 group-hover:bg-green-signal/25" />
              <div className="relative">
                <motion.div whileHover={{ scale: 1.08, rotate: -4 }} transition={{ type: "spring", stiffness: 320, damping: 15 }} className="grid h-12 w-12 place-items-center rounded-xl bg-green-signal/15 text-green-signal">
                  {icons[i]}
                </motion.div>
                <h3 className="mt-5 font-premium text-xl">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{p.d}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CursorGlow>
    </section>
  );
}

/* ------------------------------------------------------------------ Fonctionnalités (la plateforme) */
function FonctionnalitesSection() {
  const c = useCopy().fonctionnalites;
  const icons = [<Satellite key="0" size={22} />, <ScrollText key="1" size={22} />, <Download key="2" size={22} />, <HandCoins key="3" size={22} />, <Languages key="4" size={22} />, <WifiOff key="5" size={22} />];
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
        <Reveal className="max-w-2xl">
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-premium text-4xl text-forest-950">{c.title}</h2>
        </Reveal>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.features.map((f, i) => (
            <motion.div key={f.t} variants={rise} className="h-full">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-[border-color,box-shadow] duration-300 hover:border-green-signal/25 hover:shadow-[0_32px_64px_-36px_rgba(10,31,20,0.45)]"
              >
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-signal/0 blur-2xl transition-colors duration-500 group-hover:bg-green-signal/15" />
                <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-green-signal to-amber-cacao transition-transform duration-500 group-hover:scale-x-100" />
                <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-green-signal/15 to-green-signal/5 text-green-signal ring-1 ring-green-signal/15 transition-transform duration-300 group-hover:scale-110">{icons[i]}</div>
                <h3 className="relative mt-4 font-premium text-lg text-forest-950">{f.t}</h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-stone-600">{f.d}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Filières (7 denrées RDUE) */
function FilieresSection() {
  const c = useCopy().filieres;
  return (
    <section className="divide-fluid bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
        <Reveal>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-premium text-4xl text-forest-950">{c.title}</h2>
          <p className="mt-4 max-w-2xl text-stone-600">{c.body}</p>
        </Reveal>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.12 }} className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FILIERES.map((f) => {
            const Icon = f.icone;
            const enProd = f.statut === "production";
            return (
              <motion.div key={f.id} variants={rise}>
                <Tilt max={9} className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 25%, ${f.couleur} 0%, #0c2519 72%)` }} />
                  <Image
                    src={f.image}
                    alt={`Filière ${f.label}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/45 to-forest-950/5" />
                  <div className="grain absolute inset-0 opacity-[0.06]" />
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: f.couleur }} />
                  <div className="absolute right-3 top-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${enProd ? "bg-green-signal/85 text-white" : "bg-white/85 text-forest-950"}`}>
                      {STATUT_FILIERE_LABEL[f.statut]}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end gap-2.5 p-4" style={{ transform: "translateZ(40px)" }}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">{f.label}</div>
                      <div className="truncate text-[11px] text-white/65">{f.position}</div>
                    </div>
                  </div>
                </Tilt>
              </motion.div>
            );
          })}

          {/* 8e tuile : produits dérivés, avec photo */}
          <motion.div variants={rise}>
            <Tilt max={9} className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-forest-900" />
              <Image
                src="/filieres/derives-v2.webp"
                alt={c.derives.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/55 to-forest-950/15" />
              <div className="grain absolute inset-0 opacity-[0.06]" />
              <div className="absolute inset-x-0 top-0 h-1 bg-amber-soft" />
              <div className="absolute right-3 top-3">
                <span className="inline-flex items-center rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-forest-950">{c.derives.badge}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-2.5 p-4" style={{ transform: "translateZ(40px)" }}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
                  <Boxes size={16} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{c.derives.title}</div>
                  <div className="truncate text-[11px] text-white/65">{c.derives.sub}</div>
                </div>
              </div>
            </Tilt>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Cartographie satellite (aperçu, sombre) */
function CartographieSection() {
  const c = useCopy().cartographie;
  const reduce = useReducedMotion();
  const pts: [number, number][] = [[120, 58], [252, 44], [304, 120], [236, 202], [128, 190], [88, 118]];
  const d = `M${pts.map((p) => p.join(",")).join(" L")} Z`;
  return (
    <section className="relative isolate overflow-hidden bg-forest-950 text-white">
      <HeroBg />
      <CursorGlow className="mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-[42fr_58fr]">
          <Reveal>
            <Eyebrow light>{c.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-premium text-3xl leading-[1.15] sm:text-4xl">{c.title}</h2>
            <p className="mt-4 max-w-md text-white/65">{c.body}</p>
            <ul className="mt-6 flex flex-col gap-2.5 text-sm text-white/75">
              {c.bullets.map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-signal/20 text-green-signal">
                    <Check size={12} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7)]">
              <div className="relative aspect-[16/10]">
                <Image src="/textures/sat-soubre-rural.jpg" alt="Vue satellite de parcelles agricoles près de Soubré, Côte d'Ivoire" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
                <div className="absolute inset-0 bg-forest-950/15" />
                {/* Ligne de balayage satellite */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-green-signal/20 to-transparent"
                  initial={{ top: "-12%" }}
                  animate={reduce ? undefined : { top: ["-12%", "112%"] }}
                  transition={reduce ? undefined : { duration: 4.2, repeat: Infinity, ease: "linear" }}
                />
                <svg viewBox="0 0 400 250" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
                  <motion.path
                    d={d}
                    fill="rgba(22,163,74,0.16)"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    initial={reduce ? { opacity: 1 } : { pathLength: 0, opacity: 0 }}
                    whileInView={reduce ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, ease: EASE }}
                  />
                  {pts.map(([x, y], i) => (
                    <motion.circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={4}
                      fill="#fff"
                      stroke="#16a34a"
                      strokeWidth={2}
                      initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: reduce ? 0 : 0.7 + i * 0.08, duration: 0.3 }}
                    />
                  ))}
                </svg>
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-forest-950/80 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                  <span className="glow-pulse h-2 w-2 rounded-full bg-green-signal" /> {c.badge}
                </div>
                <div className="num absolute bottom-4 left-4 rounded-lg bg-forest-950/75 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur-sm">
                  5.7853° N · 6.6039° O · 3,2 ha
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </CursorGlow>
    </section>
  );
}

/* ------------------------------------------------------------------ Marketplace du cacao conforme */
function MarketplaceSection() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const items = en
    ? [
        { Icon: ShieldCheck, t: "The AGRIVO seal", d: "A lot is only sellable if it carries the seal: compliance, producer card, volume integrity." },
        { Icon: Boxes, t: "Sell in direct", d: "The exporter lists already-traced lots; the premium buyer buys verified-compliant." },
        { Icon: Percent, t: "Take-rate 1–3%", d: "A commission on the trade — revenue that grows with volume, never a fee to the producer." },
      ]
    : [
        { Icon: ShieldCheck, t: "Le sceau AGRIVO", d: "Un lot n'est vendable que s'il porte le sceau : conformité, carte producteur, intégrité de volume." },
        { Icon: Boxes, t: "Vendre en direct", d: "L'exportateur publie ses lots déjà tracés ; l'acheteur premium achète du conforme vérifié." },
        { Icon: Percent, t: "Take-rate 1–3 %", d: "Une commission sur le négoce — un revenu qui monte avec le volume, jamais de frais au producteur." },
      ];
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
        <Reveal className="max-w-2xl">
          <Eyebrow>{en ? "Compliant cocoa marketplace" : "Marketplace du cacao conforme"}</Eyebrow>
          <h2 className="mt-3 font-premium text-4xl text-forest-950">
            {en ? "The compliance is the door. The marketplace is the house." : "La conformité est la porte. La marketplace est la maison."}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            {en
              ? "Once a lot is traced and sealed, the exporter sells it in direct to premium buyers — and the cooperative owns its data instead of being disintermediated."
              : "Une fois le lot tracé et scellé, l'exportateur le vend en direct aux acheteurs premium — et la coopérative possède sa donnée au lieu d'être désintermédiée."}
          </p>
        </Reveal>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="mt-12 grid gap-5 sm:grid-cols-3">
          {items.map((f) => (
            <motion.div key={f.t} variants={rise} className="h-full rounded-2xl border border-green-signal/15 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-green-signal/15 to-green-signal/5 text-green-signal ring-1 ring-green-signal/15">
                <f.Icon size={22} />
              </div>
              <h3 className="mt-4 font-premium text-lg text-forest-950">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{f.d}</p>
            </motion.div>
          ))}
        </motion.div>
        <Reveal delay={0.1}>
          <Link
            href="/marketplace"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-green-signal px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
          >
            {en ? "Discover the marketplace" : "Découvrir la marketplace"} <ArrowRight size={15} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Marché en chiffres (sombre) */
function ChiffresSection() {
  const c = useCopy().chiffres;
  const values = [3, 900, 160, 450];
  return (
    <section className="relative overflow-hidden bg-forest-950 text-white">
      <div className="glow-radial pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
        <Reveal>
          <Eyebrow light>{c.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-premium text-3xl">{c.title}</h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {c.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="num font-premium text-4xl font-semibold text-amber-soft sm:text-5xl">
                <StatNumber value={values[i]} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm text-white/65">{s.label}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="num mt-8 text-xs text-white/40">{c.source}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Enjeu national (sourcé) */
function EnjeuSection() {
  const e = useCopy().enjeu;
  return (
    <section className="relative overflow-hidden border-y border-amber-cacao/15 bg-amber-cacao/[0.06]">
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
        <Reveal>
          <Eyebrow>{e.eyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-premium text-3xl leading-tight text-forest-950">{e.title}</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {e.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-amber-cacao/20 bg-white/70 p-6">
                <div className="font-premium text-5xl font-semibold text-amber-cacao">{s.value}</div>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-forest-950">{e.body}</p>
          <p className="num mt-3 text-xs text-stone-400">{e.source}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Calendrier RDUE */
function CalendrierSection() {
  const c = useCopy().calendrier;
  const now = Date.now();
  const jours = Math.max(0, Math.ceil((new Date("2026-12-30").getTime() - now) / 86_400_000));
  const ts = [new Date("2026-06-12").getTime(), new Date("2026-09-01").getTime(), new Date("2026-12-30").getTime()];
  const colors = ["var(--color-green-signal)", "var(--color-amber-cacao)", "var(--color-red-block)"];
  const milestones = c.milestones.map((m, i) => ({ ...m, color: colors[i], done: now >= ts[i] }));
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 md:px-8 lg:px-12">
      <Reveal className="text-center">
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h2 className="mt-3 font-premium text-3xl text-forest-950">
          <span className="num text-5xl font-semibold text-amber-cacao">J-{jours}</span>
          <br />
          {c.before}
        </h2>
      </Reveal>
      <div className="relative mt-14 flex flex-col gap-0 md:flex-row md:items-start md:justify-between">
        <div className="absolute left-4 bottom-4 top-4 w-0.5 bg-black/[0.08] md:left-0 md:right-0 md:top-4 md:bottom-auto md:h-0.5 md:w-full" />
        {milestones.map((m, i) => (
          <Reveal key={m.date} delay={i * 0.15} className="relative z-10 flex gap-4 pb-10 md:w-1/3 md:flex-col md:items-center md:gap-2 md:pb-0">
            <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full md:mt-0" style={{ background: m.color, boxShadow: `0 0 0 5px ${m.color}18` }}>
              <span className="h-2 w-2 rounded-full bg-white" />
            </div>
            <div className="md:text-center">
              <div className="num text-xs font-bold uppercase tracking-wide" style={{ color: m.color }}>{m.date}</div>
              <div className="mt-0.5 font-semibold text-forest-950">{m.label}</div>
              <div className="mt-0.5 text-xs text-stone-500">{m.sub}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Personas */
function PersonasSection() {
  const c = useCopy().personas;
  const initials = ["AM", "MA", "YA"];
  const grads = ["linear-gradient(135deg,#16a34a,#0c2519)", "linear-gradient(135deg,#1b4a39,#0a1f14)", "linear-gradient(135deg,#c8861d,#5a3a0e)"];
  return (
    <section className="divide-fluid bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
        <Reveal>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-premium text-4xl text-forest-950">{c.title}</h2>
        </Reveal>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="mt-12 grid gap-5 md:grid-cols-3">
          {c.people.map((p, i) => (
            <motion.div key={p.name} variants={rise} className="h-full">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-7 transition-[border-color,box-shadow] duration-300 hover:border-black/[0.12] hover:shadow-[0_32px_64px_-36px_rgba(10,31,20,0.4)]"
              >
                <span aria-hidden className="pointer-events-none absolute -top-3 right-5 select-none font-premium text-[92px] leading-none text-forest-950/[0.05] transition-colors duration-500 group-hover:text-green-signal/10">”</span>
                <div className="relative flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl font-premium text-lg text-white shadow-[0_10px_24px_-10px_rgba(10,31,20,0.55)] ring-2 ring-white" style={{ background: grads[i] }}>{initials[i]}</div>
                  <div>
                    <div className="font-premium text-lg text-forest-950">{p.name}</div>
                    <div className="text-xs text-stone-500">{p.role}</div>
                  </div>
                </div>
                <p className="relative mt-5 font-premium text-lg italic leading-relaxed text-forest-950/80">« {p.quote} »</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Modèle économique */
function ModeleSection() {
  const c = useCopy().modele;
  const icons = [<Building2 key="0" size={22} className="text-green-signal" />, <Satellite key="1" size={22} className="text-amber-cacao" />, <Percent key="2" size={22} className="text-forest-700" />];
  const highlight = [false, false, true];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
      <Reveal>
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-premium text-4xl text-forest-950">{c.title}</h2>
      </Reveal>
      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="mt-12 grid gap-5 md:grid-cols-3">
        {c.revenues.map((r, i) => (
          <motion.div key={r.name} variants={rise} className="h-full">
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className={`flex h-full flex-col rounded-2xl border p-7 transition-[border-color,box-shadow] duration-300 ${highlight[i] ? "border-green-signal/40 bg-forest-950 text-white shadow-[0_30px_70px_-30px_rgba(22,163,74,0.5)]" : "border-black/[0.06] bg-white hover:border-green-signal/25 hover:shadow-[0_32px_64px_-36px_rgba(10,31,20,0.4)]"}`}
            >
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${highlight[i] ? "bg-white/10" : "bg-ivory-deep/60 ring-1 ring-black/[0.05]"}`}>{icons[i]}</div>
              <div className={`mt-5 font-premium text-xl ${highlight[i] ? "text-white" : "text-forest-950"}`}>{r.name}</div>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="num text-2xl font-semibold" style={{ color: highlight[i] ? "var(--color-amber-soft)" : "var(--color-forest-950)" }}>{r.price}</span>
                <span className={`mb-1 text-xs ${highlight[i] ? "text-white/60" : "text-stone-500"}`}>{r.unit}</span>
              </div>
              <p className={`mt-4 text-sm leading-relaxed ${highlight[i] ? "text-white/70" : "text-stone-600"}`}>{r.desc}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
      <Reveal delay={0.15}>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-stone-500">{c.note}</p>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ Verdicts (démo i18n) */
function VerdictsSection() {
  const { t } = useLanguage();
  const c = useCopy().verdicts;
  const verdicts = [
    { key: "statusConforme" as const, color: "var(--color-green-signal)", bg: "rgba(22,163,74,0.10)", text: "#1C5A3A" },
    { key: "statusAnomalie" as const, color: "var(--color-red-block)", bg: "rgba(180,35,30,0.10)", text: "#8E1F1F" },
    { key: "statusInsuffisant" as const, color: "var(--color-amber-cacao)", bg: "rgba(200,134,29,0.12)", text: "#7a520f" },
  ];
  return (
    <section className="divide-fluid bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-8 lg:px-12">
        <Reveal>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-premium text-4xl text-forest-950">{c.title}</h2>
          <p className="mt-3 max-w-xl text-sm text-stone-500">{c.sub}</p>
        </Reveal>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="mt-10 grid gap-5 md:grid-cols-3">
          {verdicts.map((v, i) => (
            <motion.div key={v.key} variants={rise} className="h-full">
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative h-full overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-6 transition-shadow duration-300 hover:shadow-[0_28px_56px_-32px_rgba(10,31,20,0.4)]"
                style={{ borderTop: `3px solid ${v.color}` }}
              >
                <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: v.bg }} />
                <span className="relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ background: v.bg, color: v.text }}>
                  <Logo size={15} showWord={false} />
                  {t(v.key)}
                </span>
                <p className="relative mt-4 text-sm leading-relaxed text-stone-600">{c.phrases[i]}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Équipe */
function EquipeSection() {
  const c = useCopy().equipe;
  const team = [
    { name: "Anael", initials: "AN", grad: "linear-gradient(135deg,#16a34a,#0c2519)" },
    { name: "Christ", initials: "CH", grad: "linear-gradient(135deg,#1b4a39,#0a1f14)" },
    { name: "Gaddiel", initials: "GA", grad: "linear-gradient(135deg,#2D7A4B,#0c2519)" },
    { name: "Domy", initials: "DO", grad: "linear-gradient(135deg,#c8861d,#5a3a0e)" },
  ];
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-7xl px-6 pb-24 md:px-8 lg:px-12">
        <Reveal>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-premium text-4xl text-forest-950">{c.title}</h2>
        </Reveal>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {team.map((m, i) => (
            <motion.div key={m.name} variants={rise} className="h-full">
              <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="flex h-full flex-col items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-6 text-center transition-[border-color,box-shadow] duration-300 hover:border-green-signal/25 hover:shadow-[0_24px_48px_-28px_rgba(10,31,20,0.35)]">
                <div className="grid h-16 w-16 place-items-center rounded-2xl font-premium text-xl text-white shadow-[0_12px_28px_-12px_rgba(10,31,20,0.55)] ring-2 ring-white" style={{ background: m.grad }}>{m.initials}</div>
                <div>
                  <div className="font-premium text-lg text-forest-950">{m.name}</div>
                  <div className="mt-0.5 text-xs text-stone-500">{c.roles[i]}</div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ CTA + footer (sombre) */
function CtaFooter() {
  const c = useCopy().cta;
  return (
    <>
      <section className="relative overflow-hidden bg-forest-950 text-white">
        {/* Fond aérien conservé, légèrement visible (masque vert à 0,22). */}
        <Image src="/textures/aerial-canopy-v2.webp" alt="" aria-hidden fill sizes="100vw" className="pointer-events-none absolute inset-0 object-cover opacity-[0.22]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-950/72 via-forest-950/80 to-forest-950" />
        <div className="grain pointer-events-none absolute inset-0 opacity-[0.07]" />
        <div className="glow-radial pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-6 py-28 text-center md:px-8">
          <Reveal>
            <h2 className="font-premium text-4xl leading-tight sm:text-5xl">{c.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">{c.body}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Magnetic strength={0.35} className="inline-flex">
                <Link href="/inscription" className="inline-flex items-center gap-3 rounded-full bg-green-signal px-8 py-4 text-sm font-semibold text-white shadow-[0_14px_44px_-12px_rgba(22,163,74,0.85)] transition-[filter] hover:brightness-110">
                  {c.primary} <ArrowRight size={16} />
                </Link>
              </Magnetic>
              <Link href="/methodologie" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-sm font-medium text-white/90 transition-colors hover:border-white/40">
                {c.secondary}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="bg-forest-950 text-white/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-8 md:flex-row md:px-8 lg:px-12">
          <Logo />
          <p className="text-center text-xs md:text-right">{c.rights}</p>
        </div>
      </footer>
    </>
  );
}

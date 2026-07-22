"use client";
import Link from "next/link";
import { Satellite, Layers, CloudOff, CheckCircle2, AlertTriangle, ArrowRight, ArrowDown, Database, BadgeCheck, CalendarClock, Ruler, FileCheck2, Landmark, Store } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { PageHero } from "@/components/landing/page-hero";
import { HeroBg } from "@/components/landing/hero-bg";
import { useLanguage } from "@/components/language-provider";

const STATES = [
  {
    icon: <CheckCircle2 size={20} className="text-green-signal" />,
    title: { fr: "Conforme", en: "Compliant" },
    phrase: {
      fr: "Aucune déforestation détectée après le 31 décembre 2020.",
      en: "No deforestation detected after 31 December 2020.",
    },
    color: "var(--color-green-signal)",
  },
  {
    icon: <AlertTriangle size={20} className="text-red-block" />,
    title: { fr: "Anomalie détectée", en: "Anomaly detected" },
    phrase: {
      fr: "Une perte de couverture forestière a été identifiée sur cette zone.",
      en: "A loss of forest cover was identified on this area.",
    },
    color: "var(--color-red-block)",
  },
  {
    icon: <CloudOff size={20} className="text-amber-cacao" />,
    title: { fr: "Données insuffisantes", en: "Insufficient data" },
    phrase: {
      fr: "Présence de nuages ou données satellites insuffisantes pour statuer.",
      en: "Clouds or insufficient satellite data to decide.",
    },
    color: "var(--color-amber-cacao)",
  },
];

const ALIGN = [
  {
    icon: <CalendarClock size={20} className="text-green-signal" />,
    title: { fr: "La bonne date de référence", en: "The right reference date" },
    body: {
      fr: "Chaque parcelle est comparée à la date pivot du 31 décembre 2020, celle fixée par le règlement européen. Pas une autre.",
      en: "Every plot is compared against the 31 December 2020 cut-off date, the one set by the European regulation. No other.",
    },
  },
  {
    icon: <Ruler size={20} className="text-amber-cacao" />,
    title: { fr: "Le bon format", en: "The right format" },
    body: {
      fr: "La parcelle est décrite dans le format géographique officiel accepté par l'Union européenne, avec une précision de l'ordre du centimètre.",
      en: "The plot is described in the official geographic format accepted by the European Union, with centimetre-level precision.",
    },
  },
  {
    icon: <FileCheck2 size={20} className="text-forest-700" />,
    title: { fr: "Le bon livrable", en: "The right deliverable" },
    body: {
      fr: "Un certificat d'évaluation de conformité et un dossier directement exploitables pour la déclaration déposée sur TRACES NT.",
      en: "A compliance-assessment certificate and a file that plug straight into the declaration filed on TRACES NT.",
    },
  },
];

export default function Methodologie() {
  const { lang } = useLanguage();
  const en = lang === "en";
  return (
    <div className="min-h-screen bg-ivory text-forest-950">
      <SiteHeader variant="overlay" />
      <main>
        <PageHero
          eyebrow={en ? "Methodology" : "Méthodologie"}
          title={en ? "How AGRIVO assesses a plot, with no black box." : "Comment AGRIVO évalue une parcelle, sans boîte noire."}
          sub={
            en
              ? "AGRIVO assesses every plot from recognised satellite references and delivers a clear, explained and verifiable result, aligned directly with the requirements of European Regulation (EU) 2023/1115. Here, simply, is how."
              : "AGRIVO évalue chaque parcelle à partir de références satellites reconnues et livre un résultat clair, expliqué et vérifiable, aligné directement sur les exigences du règlement européen (UE) 2023/1115. Voici, simplement, comment."
          }
        />

        {/* Le flux en un schéma : Donnée, Évaluation, Résultat */}
        <section className="mx-auto max-w-6xl px-6 pb-4 pt-16 md:px-8">
          <Reveal>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 md:p-10">
              <span className="eyebrow text-green-signal">{en ? "The flow, in one diagram" : "Le flux, en un schéma"}</span>
              <h2 className="mt-3 font-display text-2xl text-forest-950 sm:text-3xl">
                {en ? "Data, assessment, result." : "Donnée, évaluation, résultat."}
              </h2>
              <div className="mt-8 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                <div className="rounded-xl bg-ivory p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-forest-950/[0.06] text-forest-950">
                    <Database size={20} />
                  </div>
                  <h3 className="mt-3 font-display text-lg text-forest-950">{en ? "1. Your information" : "1. Vos informations"}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {en
                      ? "The farmer's card and the outline of their plot, provided by the cooperative with the farmer's consent."
                      : "La carte du producteur et le contour de sa parcelle, fournis par la coopérative avec le consentement du producteur."}
                  </p>
                </div>
                <div className="hidden items-center md:flex" aria-hidden>
                  <ArrowRight size={22} className="text-green-signal" />
                </div>
                <div className="flex justify-center md:hidden" aria-hidden>
                  <ArrowDown size={22} className="text-green-signal" />
                </div>
                <div className="rounded-xl bg-ivory p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-signal/12 text-green-signal">
                    <Satellite size={20} />
                  </div>
                  <h3 className="mt-3 font-display text-lg text-forest-950">{en ? "2. The assessment" : "2. L’évaluation"}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {en
                      ? "The plot is compared against reference satellite imagery since 31 December 2020, following the method recognised by the European authorities. Every result is explained in plain language."
                      : "La parcelle est comparée aux images satellites de référence depuis le 31 décembre 2020, selon la méthode reconnue par les autorités européennes. Chaque résultat est expliqué en langage clair."}
                  </p>
                </div>
                <div className="hidden items-center md:flex" aria-hidden>
                  <ArrowRight size={22} className="text-green-signal" />
                </div>
                <div className="flex justify-center md:hidden" aria-hidden>
                  <ArrowDown size={22} className="text-green-signal" />
                </div>
                <div className="rounded-xl bg-ivory p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-cacao/12 text-amber-cacao">
                    <BadgeCheck size={20} />
                  </div>
                  <h3 className="mt-3 font-display text-lg text-forest-950">{en ? "3. The result" : "3. Le résultat"}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {en
                      ? "A clear verdict, a compliance-assessment certificate verifiable by QR code, a file ready for the European declaration, and a valorisation file if the plot is compliant."
                      : "Un verdict clair, un certificat d'évaluation de conformité vérifiable par QR code, un dossier prêt pour la déclaration européenne, et un dossier de valorisation si la parcelle est conforme."}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Le SNT identifie. AGRIVO rend vendable. */}
        <section className="mx-auto max-w-6xl px-6 pb-4 pt-10 md:px-8">
          <Reveal>
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 md:p-10">
              <span className="eyebrow text-green-signal">{en ? "Above the National Traceability System" : "Au-dessus du Système national de traçabilité"}</span>
              <h2 className="mt-3 font-display text-2xl text-forest-950 sm:text-3xl">
                {en ? "The SNT identifies. AGRIVO makes it sellable." : "Le SNT identifie. AGRIVO rend vendable."}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600">
                {en
                  ? "From 1 September 2026, the producer card and the National Traceability System (Conseil du Café-Cacao) become mandatory: over 1.1 million farmers enrolled, about 900,000 cards produced, about 3 million hectares geolocated, and over 160,000 tonnes already traced field-to-ship during the pilot (CCC, June 2026). AGRIVO is not their competitor: it is the layer on top."
                  : "Dès le 1er septembre 2026, la carte producteur et le Système national de traçabilité (Conseil du Café-Cacao) deviennent obligatoires : plus de 1,1 million de producteurs enrôlés, environ 900 000 cartes produites, environ 3 millions d'hectares géolocalisés, et plus de 160 000 tonnes déjà tracées du champ au navire pendant le pilote (CCC, juin 2026). AGRIVO n'est pas leur concurrent : c'est la couche au-dessus."}
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-ivory p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-forest-950/[0.06] text-forest-950"><Landmark size={20} /></div>
                    <h3 className="font-display text-lg text-forest-950">{en ? "What the SNT provides" : "Ce que le SNT fournit"}</h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-stone-600">
                    <li>· {en ? "The farmer's identity (producer card)" : "L'identité du producteur (carte producteur)"}</li>
                    <li>· {en ? "Base geolocation of plots" : "La géolocalisation de base des parcelles"}</li>
                    <li>· {en ? "Secured payment of the farm-gate price" : "La sécurisation du paiement bord champ"}</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-green-signal/25 bg-green-signal/[0.05] p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-green-signal/12 text-green-signal"><Store size={20} /></div>
                    <h3 className="font-display text-lg text-forest-950">{en ? "What AGRIVO adds" : "Ce qu'AGRIVO ajoute"}</h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-stone-600">
                    <li>· {en ? "Per-plot deforestation assessment (FAO satellite analysis)" : "L'évaluation de non-déforestation par parcelle (analyse satellite FAO)"}</li>
                    <li>· {en ? "The lot seal: segregation, volumes, chain of custody" : "Le sceau du lot : ségrégation, volumes, chaîne de possession"}</li>
                    <li>· {en ? "The DDR-ready file for the European buyer" : "Le dossier prêt pour la diligence raisonnée de l'acheteur européen"}</li>
                    <li>· {en ? "The marketplace where sealed lots get picked first" : "La place de marché où les lots scellés sont choisis en premier"}</li>
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Directement aligné sur les normes européennes */}
        <section className="divide-fluid bg-ivory">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-8">
            <Reveal>
              <span className="eyebrow text-green-signal">{en ? "Aligned with Europe" : "Aligné sur l’Europe"}</span>
              <h2 className="mt-3 max-w-2xl font-display text-3xl text-forest-950">
                {en ? "We don't reinvent the rule. We follow it, exactly." : "Nous ne réinventons pas la règle. Nous la suivons, exactement."}
              </h2>
              <p className="mt-4 max-w-2xl text-stone-600">
                {en
                  ? "Our compliance assessment follows directly the requirements of Regulation (EU) 2023/1115. The technical “how” is our know-how; the “what” is 100% aligned with Europe."
                  : "Notre évaluation de conformité suit directement les exigences du règlement (UE) 2023/1115. Le « comment » technique est notre savoir-faire ; le « quoi » est 100 % aligné sur l'Europe."}
              </p>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {ALIGN.map((a, i) => (
                <Reveal key={a.title.fr} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-7">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-ivory-deep/60">{a.icon}</div>
                    <h3 className="mt-4 font-display text-xl">{en ? a.title.en : a.title.fr}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{en ? a.body.en : a.body.fr}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Convergence de preuves, fond animé signature du hero */}
        <section className="relative isolate overflow-hidden bg-forest-950 text-white">
          <HeroBg />
          <div className="relative mx-auto max-w-3xl px-6 py-20 md:px-8">
            <Reveal>
              <span className="eyebrow text-amber-soft">{en ? "Convergence of evidence" : "La convergence de preuves"}</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl">
                {en ? "Never a single source." : "Jamais une seule source."}
              </h2>
              <p className="mt-5 leading-relaxed text-white/75">
                {en
                  ? "Rather than relying on a single source, AGRIVO applies a convergence of evidence: it crosses several independent satellite sources (including Copernicus, the European Earth-observation programme) and compares them against the "
                  : "Plutôt que de se fier à une seule source, AGRIVO applique une convergence de preuves : il croise plusieurs sources satellites indépendantes (dont Copernicus, le programme européen d'observation de la Terre) et les compare à la date pivot du "}
                <span className="num">{en ? "31 December 2020" : "31 décembre 2020"}</span>
                {en
                  ? " cut-off date. The plot is described in the official geographic format accepted by the European Union, with centimetre-level precision."
                  : ". La parcelle est décrite dans le format géographique officiel accepté par l'Union européenne, avec une précision de l'ordre du centimètre."}
              </p>
              <p className="mt-4 leading-relaxed text-white/75">
                {en
                  ? "The verdict then feeds the due diligence statement filed on TRACES NT, the European Commission's portal."
                  : "Le verdict alimente ensuite la déclaration de diligence raisonnée déposée sur TRACES NT, le portail de la Commission européenne."}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Trois états */}
        <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
          <Reveal>
            <h2 className="max-w-2xl font-display text-3xl text-forest-950">
              {en ? "Three possible verdicts, always explained." : "Trois verdicts possibles, toujours expliqués."}
            </h2>
            <p className="mt-4 max-w-2xl text-stone-600">
              {en
                ? "When cloud cover prevents a conclusion, AGRIVO tells you clearly rather than guessing. You always know where you stand, and what to do next."
                : "Quand la couverture nuageuse empêche de conclure, AGRIVO vous l'indique clairement plutôt que de deviner. Vous savez toujours où vous en êtes, et quoi faire ensuite."}
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STATES.map((s, i) => (
              <Reveal key={s.title.fr} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-black/[0.06] bg-white p-6" style={{ borderTop: `3px solid ${s.color}` }}>
                  <div className="flex items-center gap-2">
                    {s.icon}
                    <h3 className="font-display text-lg text-forest-950">{en ? s.title.en : s.title.fr}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{en ? s.phrase.en : s.phrase.fr}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Du certificat au dossier d'expédition (traçabilité documentaire) */}
        <section className="bg-ivory">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-8">
            <Reveal>
              <span className="eyebrow text-green-signal">
                {en ? "From certificate to container" : "Du certificat au conteneur"}
              </span>
              <h2 className="mt-3 max-w-2xl font-display text-3xl text-forest-950">
                {en ? "The shipment file: what the DDS actually requires." : "Le dossier d'expédition : ce que la DDS exige vraiment."}
              </h2>
              <p className="mt-4 max-w-3xl leading-relaxed text-stone-600">
                {en
                  ? "For every shipment, Regulation (EU) 2023/1115 requires the due diligence statement (DDS) to carry the geolocation of ALL plots of origin, and mass balance is not allowed. AGRIVO therefore composes each lot exclusively from plots assessed \"Compliant\" (strict segregation), reconciles every tonnage against the plot's cap (area × regional yield, the same anti-fraud lock used at verification), and generates the lot's GeoJSON (RFC 7946) ready for TRACES NT. Milestones (departure, port, vessel, EU arrival) are documentary: declared at each step by your teams, AGRIVO traces the compliance file, it does not physically track bags."
                  : "Pour chaque expédition, le règlement (UE) 2023/1115 exige que la déclaration de diligence raisonnée (DDS) porte la géolocalisation de TOUTES les parcelles d'origine, et le bilan de masse n'est pas admis. AGRIVO compose donc chaque lot exclusivement à partir de parcelles évaluées « Conforme » (ségrégation stricte), réconcilie chaque tonnage contre le plafond de la parcelle (superficie × rendement régional, le même verrou anti-fraude qu'à la vérification), et génère le GeoJSON du lot (RFC 7946) prêt pour TRACES NT. Les jalons (départ, port, navire, arrivée UE) sont documentaires : déclarés à chaque étape par vos équipes, AGRIVO trace le dossier de conformité, il ne suit pas physiquement les sacs."}
              </p>
              <p className="mt-4 max-w-3xl leading-relaxed text-stone-600">
                {en
                  ? "And from the container to the DDS: when every check passes (geolocation, segregation, farmer identity, DDR references, chain of custody, pre-shipment control), AGRIVO delivers the due diligence file in one click: the TRACES NT GeoJSON, a statement draft with the factual fields (commodity, HS code, net mass, country of production, harvest period) and a report of the elements gathered for the operator's risk assessment (articles 9 and 10). The operator files, the exporter proves: AGRIVO prepares. The operator is the first placer on the Union market (usually the EU importer); the Ivorian exporter supplies the evidence this operator consumes, unless it has its own EU entity. The filing on TRACES remains the operator's act, who stays solely responsible."
                  : "Et du conteneur à la DDS : quand toutes les vérifications passent (géolocalisation, ségrégation, identité des producteurs, références DDR, chaîne de possession, contrôle pré-embarquement), AGRIVO délivre le dossier de diligence raisonnée en un clic : le GeoJSON au format TRACES NT, un brouillon de déclaration avec les champs factuels (denrée, code SH, masse nette, pays de production, période de récolte) et un rapport des éléments réunis pour l'évaluation de risque de l'opérateur (articles 9 et 10). L'opérateur dépose, l'exportateur prouve : AGRIVO prépare. L'opérateur est le premier metteur sur le marché de l'Union (en général l'importateur européen) ; l'exportateur ivoirien fournit la preuve que cet opérateur consomme, sauf s'il dispose de sa propre entité dans l'UE. Le dépôt dans TRACES reste l'acte de l'opérateur, qui en demeure seul responsable."}
              </p>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ivory">
          <div className="mx-auto max-w-5xl px-6 py-20 md:px-8">
            <Reveal>
              <span className="eyebrow text-green-signal">{en ? "Anti-fraud" : "Anti-fraude"}</span>
              <h2 className="mt-3 font-display text-3xl text-forest-950">
                {en ? "The double lock behind the AGRIVO seal" : "Le double verrou derrière le sceau AGRIVO"}
              </h2>
              <p className="mt-3 max-w-2xl text-stone-600">
                {en
                  ? "A lot can only be sold on the marketplace if it is sealed. The seal is the anti-laundering safeguard, and it takes two independent locks."
                  : "Un lot n'est vendable sur la marketplace que s'il est scellé. Le sceau est le verrou anti-blanchiment, et il faut deux contrôles indépendants."}
              </p>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-2xl border border-green-signal/20 bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-signal">{en ? "Lock 1 · The State" : "Verrou 1 · l'État"}</p>
                  <h3 className="mt-2 font-premium text-lg text-forest-950">{en ? "Producer card" : "Carte producteur"}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                    {en
                      ? "AGRIVO only analyses carded producers: the card proves an identity and a plot already declared and verified by the State (Coffee-Cocoa Council). No ghost producers, no inflated volumes."
                      : "AGRIVO n'analyse que des producteurs cartés : la carte prouve une identité et une parcelle déjà déclarées et vérifiées par l'État (Conseil Café-Cacao). Aucun producteur fantôme, aucun volume gonflé."}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="h-full rounded-2xl border border-green-signal/20 bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-signal">{en ? "Lock 2 · AGRIVO" : "Verrou 2 · AGRIVO"}</p>
                  <h3 className="mt-2 font-premium text-lg text-forest-950">{en ? "Polygon + volume" : "Polygone + volume"}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                    {en
                      ? "A card is not compliance: AGRIVO turns the point into a verified polygon, checks it is deforestation-free by satellite, and reconciles the declared volume against the area × yield cap."
                      : "Une carte ne vaut pas conformité : AGRIVO transforme le point en polygone vérifié, contrôle par satellite qu'il est hors-déforestation, et réconcilie le volume déclaré au plafond superficie × rendement."}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-forest-950 text-white">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center md:px-8">
            <Reveal>
              <div className="mb-3 grid place-items-center">
                <Layers size={28} className="text-green-signal" />
              </div>
              <h2 className="font-display text-3xl">{en ? "See the method at work" : "Voir la méthode à l’œuvre"}</h2>
              <p className="mx-auto mt-3 max-w-lg text-white/70">
                {en
                  ? "The application runs the full journey: card scan, plot mapping, satellite verdict, certificate, valorisation."
                  : "L'application déroule le parcours complet : scan de la carte, cartographie de la parcelle, verdict satellite, certificat, valorisation."}
              </p>
              <Link
                href="/app/dashboard"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-green-signal px-7 py-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
              >
                {en ? "Open the application" : "Ouvrir l'application"} <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

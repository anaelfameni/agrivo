import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight, ShieldCheck, CalendarClock, Landmark, Store } from "lucide-react";

/**
 * Page catégorie « compliance-to-commerce » : la réponse de référence à la question
 * « comment vendre du cacao conforme RDUE depuis la Côte d'Ivoire ? ». Composant SERVEUR
 * (le texte est dans le HTML servi : lisible par les moteurs ET par les IA génératives),
 * avec données structurées FAQPage. Tous les chiffres viennent du registre sourcé de
 * l'étude de marché AGRIVO (juillet 2026) : rien d'inventé.
 */

export const metadata: Metadata = {
  title: "Vendre du cacao conforme RDUE depuis la Côte d'Ivoire · le guide AGRIVO",
  description:
    "RDUE au 30 décembre 2026, SNT et carte producteur au 1er septembre 2026 : comment un exportateur ou une coopérative ivoirienne prouve la conformité d'un lot de cacao et le vend à un acheteur européen. Par AGRIVO, la place de marché des lots conformes vérifiés.",
  alternates: { canonical: "/cacao-rdue-cote-divoire" },
};

const FAQ = [
  {
    q: "Quand la RDUE s'applique-t-elle au cacao ivoirien ?",
    a: "Les grands et moyens opérateurs européens doivent être conformes au 30 décembre 2026, les micro et petites entreprises au 30 juin 2027 (règlement (UE) 2023/1115, modifié par le règlement (UE) 2025/2650). Concrètement, les acheteurs européens exigent dès maintenant des lots dont chaque parcelle d'origine est géolocalisée et évaluée sans déforestation après le 31 décembre 2020.",
  },
  {
    q: "Que change le Système national de traçabilité (SNT) au 1er septembre 2026 ?",
    a: "La carte du producteur et le SNT (Conseil du Café-Cacao) deviennent obligatoires : plus d'un million de producteurs enrôlés et environ 3 millions d'hectares géolocalisés. Le SNT crée l'identité et la géolocalisation de base ; il ne produit ni l'analyse de non-déforestation par parcelle, ni le dossier de diligence raisonnée de l'acheteur, ni la mise en marché. C'est exactement la couche qu'ajoute AGRIVO : le SNT identifie, AGRIVO rend vendable.",
  },
  {
    q: "Qu'est-ce qu'un lot de cacao « scellé » chez AGRIVO ?",
    a: "Un lot porte le sceau AGRIVO quand cinq gages calculés (jamais déclarés) sont réunis : toutes les parcelles évaluées « Conforme » (ségrégation, le bilan de masse est interdit) ; tous les producteurs cartés (carte producteur de l'État) ; volumes réconciliés avec les superficies (contrôle d'intégrité) ; références de diligence raisonnée au dossier ; et chaîne de possession continue du bord champ à la composition (achat, transport sous connaissement, réception, pesée). Un lot non scellé ne peut pas être vendu sur la place de marché.",
  },
  {
    q: "Comment un acheteur européen utilise-t-il le dossier AGRIVO pour sa DDS ?",
    a: "Chaque gage du sceau correspond à une exigence de la due diligence de l'importateur (information fournisseur, géolocalisation, évaluation du risque, traçabilité de la chaîne). Le dossier du lot (PDF + GeoJSON RFC 7946 prêt pour TRACES NT) se lit ligne à ligne face à ces exigences. Le sceau appuie la diligence raisonnée de l'opérateur ; il ne remplace jamais sa déclaration (DDS), dont il reste seul responsable.",
  },
  {
    q: "Combien coûte AGRIVO pour un exportateur ivoirien ?",
    a: "Trois étages, dans cet ordre : un service « dossier lot scellé » facturé par lot (sur devis, sans abonnement requis) ; des abonnements pour piloter un réseau de coopératives ; et une commission de 1 à 3 % sur les transactions conclues via la place de marché. Le producteur ne paie jamais.",
  },
  {
    q: "Quelle part du cacao ivoirien est concernée ?",
    a: "L'Union européenne absorbe 55 à 66 % des exports de cacao ivoirien selon le périmètre (6,67 milliards de dollars d'importations UE en 2024). Selon Trase, seuls 48 % des exports 2024 étaient traçables jusqu'aux coopératives : le flux indirect (pisteurs, traitants) est le segment le plus exposé à l'exclusion du marché européen, et celui qu'AGRIVO outille en priorité.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function CacaoRdueCoteDivoire() {
  return (
    <div className="min-h-screen bg-ivory text-forest-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader variant="solid" />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-16 md:px-8">
        <p className="eyebrow text-green-signal">Le guide AGRIVO · juillet 2026</p>
        <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
          Vendre du cacao conforme RDUE depuis la Côte d&apos;Ivoire
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone-600">
          La Côte d&apos;Ivoire est le premier producteur mondial de cacao et l&apos;Union européenne
          absorbe plus de la moitié de ses exports. Avec le règlement européen contre la déforestation
          (RDUE) et le Système national de traçabilité, la campagne 2026-27 est celle où les acheteurs
          trient leurs fournisseurs sur la preuve. Voici, simplement, ce qui change et comment vendre.
        </p>

        {/* Les 3 repères */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { Icon: CalendarClock, t: "30 décembre 2026", d: "Échéance RDUE des grands et moyens opérateurs européens (règlement (UE) 2023/1115, report fixé par le règlement (UE) 2025/2650)." },
            { Icon: Landmark, t: "1er septembre 2026", d: "Carte producteur et Système national de traçabilité obligatoires en Côte d'Ivoire (Conseil du Café-Cacao)." },
            { Icon: Store, t: "48 % traçable", d: "Part des exports 2024 traçables jusqu'aux coopératives (Trase) : le flux indirect est le segment à outiller." },
          ].map((r) => (
            <div key={r.t} className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <r.Icon size={20} className="text-green-signal" />
              <p className="num mt-3 text-lg font-bold">{r.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{r.d}</p>
            </div>
          ))}
        </div>

        {/* FAQ (contenu servi, données structurées) */}
        <h2 className="mt-14 font-display text-2xl">Les questions que tout exportateur se pose</h2>
        <div className="mt-6 space-y-4">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-black/[0.06] bg-white p-6 open:shadow-sm">
              <summary className="cursor-pointer list-none font-display text-base font-semibold text-forest-950 marker:content-none">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{f.a}</p>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-forest-950 p-8 text-white">
          <div>
            <p className="flex items-center gap-2 font-display text-lg font-semibold"><ShieldCheck size={18} className="text-green-signal" /> Voir des lots conformes vérifiés, aujourd&apos;hui</p>
            <p className="mt-1 max-w-xl text-sm text-white/65">
              AGRIVO Market référence des lots dont le sceau (5 gages calculés) est vérifiable publiquement, fiche par fiche.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-full bg-green-signal px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110">
              Parcourir la marketplace <ArrowRight size={15} />
            </Link>
            <Link href="/tarifs" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50">
              Voir les offres
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-stone-400">
          Sources : Parlement européen et Conseil de l&apos;UE (décembre 2025), Conseil du Café-Cacao via
          AIP et KOACI (juin 2026), Trase (2026), Trading Economics (2024). Chiffres réactualisés en
          juillet 2026 ; AGRIVO publie une évaluation, jamais une garantie.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

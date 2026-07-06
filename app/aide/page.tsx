"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Sparkles, Satellite, ScrollText, HandCoins, Shield, ArrowRight, type LucideIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useLanguage } from "@/components/language-provider";

interface Article {
  cat: string;
  Icon: LucideIcon;
  title: { fr: string; en: string };
  href: string;
}

const ARTICLES: Article[] = [
  { cat: "demarrer", Icon: Sparkles, title: { fr: "Créer un compte et se connecter", en: "Create an account and sign in" }, href: "/inscription" },
  { cat: "demarrer", Icon: Sparkles, title: { fr: "Sélectionner sa coopérative", en: "Select your cooperative" }, href: "/app/dashboard" },
  { cat: "demarrer", Icon: Sparkles, title: { fr: "Comprendre le parcours en 5 étapes", en: "Understand the 5-step journey" }, href: "/methodologie" },
  { cat: "verifier", Icon: Satellite, title: { fr: "Scanner la carte d'un producteur", en: "Scan a farmer's card" }, href: "/app/verifier" },
  { cat: "verifier", Icon: Satellite, title: { fr: "Cartographier et valider une parcelle", en: "Map and validate a plot" }, href: "/app/verifier" },
  { cat: "verifier", Icon: Satellite, title: { fr: "Lire un verdict Whisp (Conforme, Anomalie, Données insuffisantes)", en: "Read a Whisp verdict (Compliant, Anomaly, Insufficient data)" }, href: "/methodologie" },
  { cat: "certificats", Icon: ScrollText, title: { fr: "Générer un certificat PDF", en: "Generate a PDF certificate" }, href: "/app/verifier" },
  { cat: "certificats", Icon: ScrollText, title: { fr: "Exporter au format GeoJSON pour TRACES NT", en: "Export GeoJSON for TRACES NT" }, href: "/app/exportateur" },
  { cat: "credit", Icon: HandCoins, title: { fr: "Proposer un micro-crédit à un producteur conforme", en: "Offer a micro-credit to a compliant farmer" }, href: "/app/verifier" },
  { cat: "credit", Icon: HandCoins, title: { fr: "Comment fonctionne le remboursement", en: "How repayment works" }, href: "/faq" },
  { cat: "securite", Icon: Shield, title: { fr: "Modifier son mot de passe", en: "Change your password" }, href: "/app/parametres" },
  { cat: "securite", Icon: Shield, title: { fr: "Gérer les filières couvertes", en: "Manage covered commodities" }, href: "/app/parametres" },
];

const CATS: { id: string; fr: string; en: string }[] = [
  { id: "demarrer", fr: "Démarrer", en: "Getting started" },
  { id: "verifier", fr: "Vérifier une parcelle", en: "Verify a plot" },
  { id: "certificats", fr: "Certificats", en: "Certificates" },
  { id: "credit", fr: "Micro-crédit", en: "Micro-credit" },
  { id: "securite", fr: "Compte & sécurité", en: "Account & security" },
];

export default function AidePage() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ARTICLES;
    return ARTICLES.filter((a) => (en ? a.title.en : a.title.fr).toLowerCase().includes(q));
  }, [query, en]);

  return (
    <div className="min-h-dvh bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 md:px-8 md:pt-20">
        <p className="eyebrow text-amber-cacao">{en ? "Help center" : "Centre d'aide"}</p>
        <h1 className="mt-3 font-display text-4xl text-forest-950">{en ? "How can we help you?" : "Comment pouvons-nous vous aider ?"}</h1>
        <div className="relative mt-6 max-w-xl">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label={en ? "Search the help center" : "Rechercher dans l'aide"}
            placeholder={en ? "Search a help article…" : "Rechercher un article d'aide…"}
            className="h-12 w-full rounded-full border border-black/[0.08] bg-white pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15" />
        </div>

        <div className="mt-10 flex flex-col gap-8">
          {CATS.map((cat) => {
            const items = filtered.filter((a) => a.cat === cat.id);
            if (items.length === 0) return null;
            const Icon = items[0].Icon;
            return (
              <section key={cat.id}>
                <h2 className="flex items-center gap-2.5 font-display text-xl text-forest-950">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-ivory-deep/60 text-green-signal"><Icon size={16} /></span>
                  {en ? cat.en : cat.fr}
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {items.map((a) => (
                    <li key={a.title.fr}>
                      <Link href={a.href} className="group flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-sm text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal/40">
                        <span>{en ? a.title.en : a.title.fr}</span>
                        <ArrowRight size={15} className="shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-green-signal" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-stone-500">
              {en ? <>No article matches &quot;{query.trim()}&quot;. Try the </> : <>Aucun article ne correspond à « {query.trim()} ». Essayez la </>}
              <Link href="/faq" className="font-medium text-forest-950 underline-offset-4 hover:underline">FAQ</Link>
              {en ? " or the contact page." : " ou la page contact."}
            </p>
          )}
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 rounded-2xl border border-black/[0.06] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg text-forest-950">{en ? "Can't find it?" : "Vous ne trouvez pas ?"}</h2>
            <p className="mt-1 text-sm text-stone-600">{en ? "Check the FAQ or write to us, we reply within 48 hours." : "Consultez la FAQ ou écrivez-nous, nous répondons sous 48 h."}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/faq" className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-forest-950 transition-colors hover:border-green-signal/40">FAQ</Link>
            <Link href="/contact" className="rounded-full bg-forest-950 px-4 py-2 text-sm font-semibold text-white">{en ? "Contact us" : "Nous contacter"}</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

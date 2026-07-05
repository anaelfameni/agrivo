"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Sparkles, Satellite, ScrollText, HandCoins, Shield, ArrowRight, type LucideIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

interface Article {
  cat: string;
  Icon: LucideIcon;
  title: string;
  href: string;
}

const ARTICLES: Article[] = [
  { cat: "Démarrer", Icon: Sparkles, title: "Créer un compte et se connecter", href: "/inscription" },
  { cat: "Démarrer", Icon: Sparkles, title: "Sélectionner sa coopérative", href: "/app/dashboard" },
  { cat: "Démarrer", Icon: Sparkles, title: "Comprendre le parcours en 5 étapes", href: "/methodologie" },
  { cat: "Vérifier une parcelle", Icon: Satellite, title: "Scanner la carte d'un producteur", href: "/app/verifier" },
  { cat: "Vérifier une parcelle", Icon: Satellite, title: "Cartographier et valider une parcelle", href: "/app/verifier" },
  { cat: "Vérifier une parcelle", Icon: Satellite, title: "Lire un verdict Whisp (Conforme, Anomalie, Données insuffisantes)", href: "/methodologie" },
  { cat: "Certificats", Icon: ScrollText, title: "Générer un certificat PDF", href: "/app/verifier" },
  { cat: "Certificats", Icon: ScrollText, title: "Exporter au format GeoJSON pour TRACES NT", href: "/app/exportateur" },
  { cat: "Micro-crédit", Icon: HandCoins, title: "Proposer un micro-crédit à un producteur conforme", href: "/app/verifier" },
  { cat: "Micro-crédit", Icon: HandCoins, title: "Comment fonctionne le remboursement", href: "/faq" },
  { cat: "Compte & sécurité", Icon: Shield, title: "Modifier son mot de passe", href: "/app/parametres" },
  { cat: "Compte & sécurité", Icon: Shield, title: "Gérer les filières couvertes", href: "/app/parametres" },
];

const CATS = ["Démarrer", "Vérifier une parcelle", "Certificats", "Micro-crédit", "Compte & sécurité"];

export default function AidePage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ARTICLES;
    return ARTICLES.filter((a) => a.title.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-dvh bg-ivory text-forest-950">
      <SiteHeader variant="solid" />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-16 md:px-8 md:pt-20">
        <p className="eyebrow text-amber-cacao">Centre d&apos;aide</p>
        <h1 className="mt-3 font-display text-4xl text-forest-950">Comment pouvons-nous vous aider ?</h1>
        <div className="relative mt-6 max-w-xl">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher dans l'aide"
            placeholder="Rechercher un article d'aide…"
            className="h-12 w-full rounded-full border border-black/[0.08] bg-white pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-green-signal/50 focus:ring-2 focus:ring-green-signal/15" />
        </div>

        <div className="mt-10 flex flex-col gap-8">
          {CATS.map((cat) => {
            const items = filtered.filter((a) => a.cat === cat);
            if (items.length === 0) return null;
            const Icon = items[0].Icon;
            return (
              <section key={cat}>
                <h2 className="flex items-center gap-2.5 font-display text-xl text-forest-950">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-ivory-deep/60 text-green-signal"><Icon size={16} /></span>
                  {cat}
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {items.map((a) => (
                    <li key={a.title}>
                      <Link href={a.href} className="group flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-sm text-forest-950 outline-none transition-colors hover:border-green-signal/40 focus-visible:ring-2 focus-visible:ring-green-signal/40">
                        <span>{a.title}</span>
                        <ArrowRight size={15} className="shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-green-signal" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-stone-500">Aucun article ne correspond à « {query.trim()} ». Essayez la <Link href="/faq" className="font-medium text-forest-950 underline-offset-4 hover:underline">FAQ</Link> ou la page contact.</p>
          )}
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 rounded-2xl border border-black/[0.06] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg text-forest-950">Vous ne trouvez pas ?</h2>
            <p className="mt-1 text-sm text-stone-600">Consultez la FAQ ou écrivez-nous, nous répondons sous 48 h.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/faq" className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-forest-950 transition-colors hover:border-green-signal/40">FAQ</Link>
            <Link href="/contact" className="rounded-full bg-forest-950 px-4 py-2 text-sm font-semibold text-white">Nous contacter</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

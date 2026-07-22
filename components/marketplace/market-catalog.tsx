"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, SlidersHorizontal, ShieldCheck, X, ArrowDownWideNarrow, Sparkles, Heart, BellPlus, BellRing } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { getFiliere } from "@/config/filieres";
import { PARCELLES } from "@/data/mock-parcelles";
import { lotsMarche, lotsVedette, type MarketLot } from "@/data/mock-marketplace";
import { LotCard } from "@/components/marketplace/lot-card";
import { CompareBar } from "@/components/marketplace/compare-bar";
import { useCocoaSpot } from "@/components/marketplace/cocoa-price";
import {
  basculerFavori, lireFavoris, ecrireFavoris,
  construireAlerte, alerteExiste, lotsCorrespondants, lireAlertes, ecrireAlertes,
  type AlerteMarche,
} from "@/lib/marketplace/interet";

/**
 * Catalogue vivant de AGRIVO Market (thème clair) : l'acheteur est le héros. Grille filtrable
 * (filière · région · sceau · recherche) + tri, entrée en cascade (stagger), barre de recherche
 * et de filtres STATIQUE (ne suit pas le défilement). Recherche pilotable depuis le héros
 * via les props contrôlées `query`/`onQueryChange`.
 *
 * Vedettes intégrées (v2.5) : les 3 lots « à la une » (scellés, plus forte valeur) sont
 * ÉPINGLÉS en tête quand la vue est neutre (tri pertinence, aucun filtre) et portent un badge
 * ambre partout ; dès qu'un filtre/tri/recherche est actif, l'ordre demandé prime.
 */
type SortKey = "pertinence" | "prix-asc" | "prix-desc" | "tonnage";

const TR = {
  fr: {
    title: "Lots disponibles",
    lead: "Chaque lot est dérivé d'un dossier de traçabilité réel. Le sceau AGRIVO est recalculé à l'affichage, jamais affirmé sans preuve.",
    featuredFirst: "À la une en tête",
    search: "Rechercher un lot, une coopérative, une région…",
    all: "Toutes filières", allRegions: "Toutes régions", sealedOnly: "Scellés uniquement",
    results: (n: number) => `${n} lot${n > 1 ? "s" : ""}`,
    empty: "Aucun lot ne correspond à ces filtres.", reset: "Réinitialiser", filters: "Filtres", sort: "Trier",
    sortOpts: { pertinence: "Pertinence", "prix-asc": "Prix ↑", "prix-desc": "Prix ↓", tonnage: "Tonnage" } as Record<SortKey, string>,
    favoris: "Mes favoris",
    alertBtn: "M'alerter sur ces critères", alertSaved: "Alerte enregistrée",
    alertsTitle: "Vos alertes de marché",
    alertsNote: "Les correspondances sont recalculées à chaque visite du catalogue. L'envoi par email arrivera avec le backend.",
    alertAll: "Tous lots", alertSealed: "Scellés seulement",
    matches: (n: number) => `${n} lot${n > 1 ? "s" : ""} correspondant${n > 1 ? "s" : ""}`,
    removeAlert: "Supprimer l'alerte",
  },
  en: {
    title: "Available lots",
    lead: "Every lot is derived from a real traceability file. The AGRIVO seal is recomputed on display, never asserted without proof.",
    featuredFirst: "Featured first",
    search: "Search a lot, a cooperative, a region…",
    all: "All commodities", allRegions: "All regions", sealedOnly: "Sealed only",
    results: (n: number) => `${n} lot${n > 1 ? "s" : ""}`,
    empty: "No lot matches these filters.", reset: "Reset", filters: "Filters", sort: "Sort",
    sortOpts: { pertinence: "Relevance", "prix-asc": "Price ↑", "prix-desc": "Price ↓", tonnage: "Tonnage" } as Record<SortKey, string>,
    favoris: "My favourites",
    alertBtn: "Alert me on these criteria", alertSaved: "Alert saved",
    alertsTitle: "Your market alerts",
    alertsNote: "Matches are recomputed on every catalog visit. Email delivery will come with the backend.",
    alertAll: "All lots", alertSealed: "Sealed only",
    matches: (n: number) => `${n} matching lot${n > 1 ? "s" : ""}`,
    removeAlert: "Delete alert",
  },
} as const;

function rank(lot: MarketLot): number {
  if (lot.sceau.statut === "verifie" && lot.statutMarche === "liste") return 0;
  if (lot.sceau.statut === "verifie") return 1;
  return 2;
}

export function MarketCatalog({
  query,
  onQueryChange,
  wrap = "mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12",
}: {
  query?: string;
  onQueryChange?: (q: string) => void;
  wrap?: string;
}) {
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "fr";
  const t = TR[l];
  const reduce = useReducedMotion();
  const iceUsdT = useCocoaSpot();

  const all = useMemo(() => lotsMarche(PARCELLES), []);
  const filieres = useMemo(() => [...new Set(all.map((x) => x.filiere))], [all]);
  const regions = useMemo(() => [...new Set(all.flatMap((x) => x.regions))].sort(), [all]);
  const vedetteRefs = useMemo(() => new Set(lotsVedette(PARCELLES, 3).map((x) => x.ref)), []);

  const [filiere, setFiliere] = useState("");
  const [region, setRegion] = useState("");
  const [sealedOnly, setSealedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("pertinence");
  const [innerQ, setInnerQ] = useState("");
  const q = query !== undefined ? query : innerQ;
  const setQ = (v: string) => (onQueryChange ? onQueryChange(v) : setInnerQ(v));

  // Favoris + alertes + comparateur : hydratés APRÈS montage (localStorage, anti-mismatch SSR).
  const [favoris, setFavoris] = useState<string[]>([]);
  const [favOnly, setFavOnly] = useState(false);
  const [alertes, setAlertes] = useState<AlerteMarche[]>([]);
  const [alerteConfirmee, setAlerteConfirmee] = useState(false);
  const [compareRefs, setCompareRefs] = useState<string[]>([]);
  useEffect(() => {
    setFavoris(lireFavoris());
    setAlertes(lireAlertes());
  }, []);

  const toggleFavori = (ref: string) => {
    setFavoris((prev) => {
      const next = basculerFavori(prev, ref);
      ecrireFavoris(next);
      return next;
    });
  };
  const toggleCompare = (ref: string) => {
    setCompareRefs((prev) =>
      prev.includes(ref) ? prev.filter((r) => r !== ref) : prev.length >= 3 ? prev : [...prev, ref],
    );
  };
  const criteresActifs = Boolean(filiere || region || sealedOnly);
  const enregistrerAlerte = () => {
    const criteres = { filiere, region, scellesSeul: sealedOnly };
    setAlertes((prev) => {
      if (alerteExiste(prev, criteres)) return prev;
      const next = [...prev, construireAlerte(criteres)];
      ecrireAlertes(next);
      return next;
    });
    setAlerteConfirmee(true);
    window.setTimeout(() => setAlerteConfirmee(false), 2500);
  };
  const supprimerAlerte = (id: string) => {
    setAlertes((prev) => {
      const next = prev.filter((a) => a.id !== id);
      ecrireAlertes(next);
      return next;
    });
  };

  const active = Boolean(filiere || region || sealedOnly || q || favOnly);
  // Vue neutre (pertinence, aucun filtre) : les vedettes ouvrent la grille.
  const pinFeatured = sort === "pertinence" && !active;

  const lots = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = all.filter((x) => {
      if (favOnly && !favoris.includes(x.ref)) return false;
      if (filiere && x.filiere !== filiere) return false;
      if (region && !x.regions.includes(region)) return false;
      if (sealedOnly && x.sceau.statut !== "verifie") return false;
      if (needle) {
        const hay = `${x.nomLot} ${x.regions.join(" ")} ${x.cooperatives.join(" ")} ${x.filiereLabel}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const by: Record<SortKey, (a: MarketLot, b: MarketLot) => number> = {
      pertinence: (a, b) =>
        (pinFeatured ? Number(vedetteRefs.has(b.ref)) - Number(vedetteRefs.has(a.ref)) : 0) ||
        rank(a) - rank(b) ||
        b.valeurFcfa - a.valeurFcfa,
      "prix-asc": (a, b) => a.prixIndicatifFcfaKg - b.prixIndicatifFcfaKg,
      "prix-desc": (a, b) => b.prixIndicatifFcfaKg - a.prixIndicatifFcfaKg,
      tonnage: (a, b) => b.tonnage - a.tonnage,
    };
    return [...filtered].sort(by[sort]);
  }, [all, filiere, region, sealedOnly, q, sort, pinFeatured, vedetteRefs, favOnly, favoris]);

  const lotsCompares = useMemo(
    () => compareRefs.map((ref) => all.find((x) => x.ref === ref)).filter((x): x is MarketLot => Boolean(x)),
    [compareRefs, all],
  );

  return (
    <section id="catalogue" className={`${wrap} scroll-mt-20 py-16 md:py-20`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest-950 md:text-3xl">{t.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-forest-950/55">{t.lead}</p>
        </div>
        <span className="flex shrink-0 items-center gap-2">
          {pinFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-cacao/25 bg-amber-cacao/[0.08] px-3 py-1.5 text-xs font-semibold text-amber-cacao">
              <Sparkles size={12} /> {t.featuredFirst}
            </span>
          )}
          <span className="rounded-full border border-black/[0.06] bg-white px-3 py-1.5 text-xs font-semibold text-forest-950/70">
            {t.results(lots.length)}
          </span>
        </span>
      </div>

      {/* Toolbar de recherche/filtres : statique (ne suit pas le défilement) */}
      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-black/[0.05] bg-ivory p-3 md:p-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest-950/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="w-full rounded-full border border-black/[0.08] bg-white py-3 pl-11 pr-4 text-sm text-forest-950 placeholder:text-forest-950/35 shadow-sm outline-none transition focus:border-green-signal/60 focus:ring-2 focus:ring-green-signal/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-950/45">
            <SlidersHorizontal size={13} /> {t.filters}
          </span>

          <button onClick={() => setFiliere("")} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filiere === "" ? "bg-forest-950 text-white" : "border border-black/10 text-forest-950/70 hover:border-forest-950/30"}`}>
            {t.all}
          </button>
          {filieres.map((id) => {
            const f = getFiliere(id);
            const on = filiere === id;
            return (
              <button key={id} onClick={() => setFiliere(on ? "" : id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition"
                style={on ? { background: f.couleur, color: "#fff" } : undefined}>
                <span className={on ? "" : "text-forest-950/70"}><f.icone size={13} /></span>
                <span className={on ? "" : "text-forest-950/70"}>{f.label}</span>
              </button>
            );
          })}

          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label={t.allRegions}
            className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-forest-950/80 outline-none transition focus:border-green-signal/60">
            <option value="">{t.allRegions}</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <button onClick={() => setSealedOnly((v) => !v)} aria-pressed={sealedOnly}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${sealedOnly ? "border border-green-signal/40 bg-green-signal/10 text-green-signal" : "border border-black/10 text-forest-950/70 hover:border-forest-950/30"}`}>
            <ShieldCheck size={13} /> {t.sealedOnly}
          </button>

          <button onClick={() => setFavOnly((v) => !v)} aria-pressed={favOnly}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${favOnly ? "border border-red-block/30 bg-red-block/[0.06] text-red-block" : "border border-black/10 text-forest-950/70 hover:border-forest-950/30"}`}>
            <Heart size={13} fill={favOnly ? "currentColor" : "none"} /> {t.favoris}{favoris.length > 0 ? ` (${favoris.length})` : ""}
          </button>

          {criteresActifs && (
            <button onClick={enregistrerAlerte}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${alerteConfirmee ? "border border-green-signal/40 bg-green-signal/10 text-green-signal" : "border border-amber-cacao/30 bg-amber-cacao/[0.06] text-amber-cacao hover:border-amber-cacao/50"}`}>
              {alerteConfirmee ? <BellRing size={13} /> : <BellPlus size={13} />} {alerteConfirmee ? t.alertSaved : t.alertBtn}
            </button>
          )}

          <span className="ml-auto inline-flex items-center gap-1.5">
            <ArrowDownWideNarrow size={13} className="text-forest-950/45" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label={t.sort}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-forest-950/80 outline-none transition focus:border-green-signal/60">
              {(Object.keys(t.sortOpts) as SortKey[]).map((k) => <option key={k} value={k}>{t.sortOpts[k]}</option>)}
            </select>
          </span>

          {active && (
            <button onClick={() => { setFiliere(""); setRegion(""); setSealedOnly(false); setQ(""); setFavOnly(false); }}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-forest-950/50 transition hover:text-forest-950">
              <X size={13} /> {t.reset}
            </button>
          )}
        </div>
      </div>

      {/* Alertes de marché enregistrées : correspondances recalculées à chaque visite */}
      <AnimatePresence initial={false}>
        {alertes.length > 0 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-2xl border border-amber-cacao/20 bg-amber-cacao/[0.05] p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-forest-950">
                <BellRing size={13} className="text-amber-cacao" /> {t.alertsTitle}
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {alertes.map((a) => {
                  const n = lotsCorrespondants(a, all).length;
                  const label = [
                    // AlerteMarche stocke la filière en string ; les critères viennent des ids du catalogue
                    a.filiere ? getFiliere(a.filiere as MarketLot["filiere"]).label : t.all,
                    a.region || t.allRegions,
                    a.scellesSeul ? t.alertSealed : t.alertAll,
                  ].join(" · ");
                  return (
                    <li key={a.id} className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3 py-1.5 text-xs">
                      <span className="font-medium text-forest-950/75">{label}</span>
                      <span className={`num font-semibold ${n > 0 ? "text-green-signal" : "text-forest-950/40"}`}>{t.matches(n)}</span>
                      <button onClick={() => supprimerAlerte(a.id)} aria-label={t.removeAlert} title={t.removeAlert}
                        className="text-forest-950/35 transition hover:text-red-block">
                        <X size={12} />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2.5 text-[0.7rem] leading-relaxed text-forest-950/45">{t.alertsNote}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {lots.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-sm text-forest-950/55">{t.empty}</p>
      ) : (
        <motion.div
          key={`${filiere}-${region}-${sealedOnly}-${sort}-${q}-${favOnly}`}
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        >
          {lots.map((lot) => (
            <motion.div key={lot.ref} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }}>
              <LotCard
                lot={lot}
                lang={l}
                iceUsdT={iceUsdT}
                vedette={vedetteRefs.has(lot.ref)}
                favori={favoris.includes(lot.ref)}
                onToggleFavori={toggleFavori}
                compare={compareRefs.includes(lot.ref)}
                onToggleCompare={toggleCompare}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <CompareBar
        lots={lotsCompares}
        lang={l}
        onRemove={(ref) => setCompareRefs((prev) => prev.filter((r) => r !== ref))}
        onClear={() => setCompareRefs([])}
      />
    </section>
  );
}

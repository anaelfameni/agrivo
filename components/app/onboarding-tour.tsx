"use client";

/**
 * Guide interactif d'accueil v2 — visite guidée en « spotlight » (coach marks).
 *
 * Fini le simple carrousel : le guide SURLIGNE les vrais éléments de la page (découpe lumineuse
 * sur l'élément ciblé via `data-tour`, le reste de l'écran s'assombrit), un anneau pulse autour
 * de la cible, et une carte explicative se positionne à côté. Les étapes marquées `pointer`
 * laissent l'élément surligné RÉELLEMENT cliquable (« c'est ici qu'on clique ») : cliquer dessus
 * quitte le guide et exécute l'action pour de vrai.
 *
 * Mécanique : ouverture automatique à l'arrivée sur le tableau de bord tant que le drapeau
 * « visite vue » (localStorage par rôle, clé v2, posé à la fermeture) est absent. Les comptes de
 * démonstration effacent ce drapeau à CHAQUE connexion (auth-provider → lib/tour) : la visite se
 * rejoue à toutes les connexions démo, sans se rouvrir à chaque navigation pendant la session.
 * Relance manuelle via le bouton « ? » (événement `agrivo:tour:open`),
 * clavier (Échap ferme, ←/→ naviguent), `prefers-reduced-motion` respecté (aucune pulsation,
 * défilement instantané). Si l'élément ciblé n'existe pas (mobile, page différente), l'étape
 * se replie en carte centrée : le guide ne casse jamais.
 */

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  Building2,
  CloudOff,
  Download,
  FileText,
  FileUp,
  LayoutDashboard,
  Layers,
  Map,
  MapPinned,
  MessageSquareText,
  MousePointerClick,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Sprout,
  Table2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";
import { tourKey } from "@/lib/tour";

const EASE = [0.16, 1, 0.3, 1] as const;
const PAD = 10; // marge du halo autour de l'élément ciblé (px)
const TOOLTIP_W = 360;
const TOOLTIP_H_EST = 250; // estimation pour choisir dessus/dessous

interface Etape {
  /** Ancre `data-tour` de l'élément à surligner ; absent = carte centrée. */
  target?: string;
  /** L'élément surligné reste cliquable : le guide invite à cliquer. */
  pointer?: boolean;
  Icon: LucideIcon;
  accent: string;
  titre: { fr: string; en: string };
  corps: { fr: string; en: string };
}

const ETAPES_COOP: Etape[] = [
  {
    Icon: Sprout,
    accent: "#16a34a",
    titre: { fr: "Bienvenue sur AGRIVO", en: "Welcome to AGRIVO" },
    corps: {
      fr: "Visite guidée interactive de 2 minutes : nous surlignons les vrais éléments de votre espace et nous vous montrons où cliquer. Naviguez avec les flèches du clavier, quittez avec Échap — le bouton « ? » en haut de page relance la visite à tout moment.",
      en: "A 2-minute interactive guided tour: we highlight the real elements of your workspace and show you where to click. Navigate with the arrow keys, leave with Escape — the \"?\" button at the top of the page replays the tour anytime.",
    },
  },
  {
    target: "kpis",
    Icon: LayoutDashboard,
    accent: "#16a34a",
    titre: { fr: "Vos indicateurs, en direct", en: "Your indicators, live" },
    corps: {
      fr: "Parcelles vérifiées, taux de conformité, dossiers partagés avec l'exportateur et alertes actives : la santé de votre coopérative tient en quatre cartes.",
      en: "Plots verified, compliance rate, files shared with the exporter and active alerts: your cooperative's health fits in four cards.",
    },
  },
  {
    target: "nouvelle-verification",
    pointer: true,
    Icon: MapPinned,
    accent: "#c8861d",
    titre: { fr: "Tout commence ici", en: "Everything starts here" },
    corps: {
      fr: "« Nouvelle vérification » lance le parcours complet : consentement du producteur, coordonnées de la parcelle (4 sommets minimum), analyse satellite, verdict expliqué, certificat. Vous pouvez cliquer dès maintenant — ou continuer la visite.",
      en: "\"New verification\" starts the full journey: farmer consent, plot coordinates (at least 4 vertices), satellite analysis, explained verdict, certificate. You can click right now — or continue the tour.",
    },
  },
  {
    target: "repartition",
    Icon: ShieldCheck,
    accent: "#16a34a",
    titre: { fr: "Trois verdicts, jamais de boîte noire", en: "Three verdicts, never a black box" },
    corps: {
      fr: "« Conforme », « Anomalie détectée » ou « Données insuffisantes » : chaque verdict est expliqué — causes réelles et prochaines étapes comprises. Cette barre montre la santé de votre portefeuille d'un coup d'œil.",
      en: "\"Compliant\", \"Anomaly detected\" or \"Insufficient data\": every verdict is explained — real causes and next steps included. This bar shows your portfolio's health at a glance.",
    },
  },
  {
    target: "registre-import",
    Icon: FileUp,
    accent: "#16a34a",
    titre: { fr: "Vos fichiers existants ont de la valeur", en: "Your existing files have value" },
    corps: {
      fr: "Importez votre registre (GeoJSON, CSV ou KML) : AGRIVO l'audite selon la règle RDUE et l'IA génère un plan d'action priorisé — quoi corriger au bureau, quoi compléter au champ. Le fichier ne quitte jamais votre navigateur.",
      en: "Import your register (GeoJSON, CSV or KML): AGRIVO audits it against the EUDR rule and the AI generates a prioritised action plan — what to fix at the office, what to complete in the field. The file never leaves your browser.",
    },
  },
  {
    target: "alertes",
    Icon: Bell,
    accent: "#b4231e",
    titre: { fr: "Les anomalies vous trouvent", en: "Anomalies find you" },
    corps: {
      fr: "Le centre d'alertes regroupe les parcelles en anomalie : chaque alerte ouvre la fiche complète de la parcelle, avec la carte satellite et l'explication du verdict.",
      en: "The alert centre gathers flagged plots: each alert opens the plot's full record, with the satellite map and the verdict explanation.",
    },
  },
  {
    target: "reverifier",
    Icon: CloudOff,
    accent: "#c8861d",
    titre: { fr: "« À re-vérifier » n'est pas un échec", en: "\"To re-verify\" is not a failure" },
    corps: {
      fr: "Ces parcelles sont en « Données insuffisantes » : ombrage, nuages ou tracé imprécis. La file est déjà prête — relancez-les en saison sèche, quand les passages satellites redeviennent exploitables.",
      en: "These plots are \"Insufficient data\": shade, clouds or an imprecise outline. The queue is ready — re-run them in the dry season, when satellite passes become usable again.",
    },
  },
  {
    target: "sidebar-certificats",
    pointer: true,
    Icon: ScrollText,
    accent: "#c8861d",
    titre: { fr: "Vos certificats, vérifiables par tous", en: "Your certificates, verifiable by anyone" },
    corps: {
      fr: "La page Certificats liste tous vos certificats émis : numéro, référence DDR et lien de vérification publique — n'importe quel acheteur peut scanner le QR code, sans compte.",
      en: "The Certificates page lists every issued certificate: number, DDR reference and public verification link — any buyer can scan the QR code, no account needed.",
    },
  },
  {
    target: "assistant",
    pointer: true,
    Icon: Sparkles,
    accent: "#16a34a",
    titre: { fr: "L'Assistant AGRIVO, partout", en: "The AGRIVO Assistant, everywhere" },
    corps: {
      fr: "Cette bulle verte vous suit sur toutes les pages : prix, verdicts, réglementation, où cliquer — elle répond à tout. Pour une demande complexe, notre équipe répond à support@agrivo.ci.",
      en: "This green bubble follows you on every page: pricing, verdicts, regulation, where to click — it answers everything. For complex requests, our team answers at support@agrivo.ci.",
    },
  },
  {
    Icon: Sprout,
    accent: "#16a34a",
    titre: { fr: "À vous de jouer", en: "Over to you" },
    corps: {
      fr: "Vous savez l'essentiel. Relancez cette visite à tout moment avec le bouton « ? » en haut de page — bonne vérification !",
      en: "You know the essentials. Replay this tour anytime with the \"?\" button at the top of the page — happy verifying!",
    },
  },
];

const ETAPES_EXPORT: Etape[] = [
  {
    Icon: Sprout,
    accent: "#16a34a",
    titre: { fr: "Bienvenue sur votre espace exportateur", en: "Welcome to your exporter workspace" },
    corps: {
      fr: "Visite guidée interactive : nous surlignons les vrais éléments de votre tableau de bord et chaque section de votre espace. Flèches pour naviguer, Échap pour quitter, bouton « ? » pour relancer.",
      en: "An interactive guided tour: we highlight the real elements of your dashboard and every section of your workspace. Arrows to navigate, Escape to leave, \"?\" to replay.",
    },
  },
  {
    target: "kpis",
    Icon: LayoutDashboard,
    accent: "#16a34a",
    titre: { fr: "Les quatre indicateurs officiels", en: "The four official indicators" },
    corps: {
      fr: "Producteurs audités, taux de conformité, superficie cartographiée et volume validé : le pilotage RDUE de tout votre réseau d'approvisionnement, en un coup d'œil.",
      en: "Farmers audited, compliance rate, area mapped and validated volume: EUDR steering for your whole sourcing network, at a glance.",
    },
  },
  {
    target: "export-geojson",
    pointer: true,
    Icon: Download,
    accent: "#c8861d",
    titre: { fr: "Un clic pour TRACES NT", en: "One click for TRACES NT" },
    corps: {
      fr: "Ce bouton télécharge tout votre portefeuille au format GeoJSON officiel (RFC 7946, WGS-84, 6 décimales) : le fichier attendu pour la déclaration de diligence raisonnée.",
      en: "This button downloads your whole portfolio in the official GeoJSON format (RFC 7946, WGS-84, 6 decimals): the file expected for the due diligence statement.",
    },
  },
  {
    target: "sidebar-cooperatives",
    pointer: true,
    Icon: Building2,
    accent: "#16a34a",
    titre: { fr: "Vos coopératives, sièges sur carte", en: "Your cooperatives, headquarters on a map" },
    corps: {
      fr: "Une fiche par coopérative (contact, effectif, conformité) et la position exacte de chaque siège — un point, jamais une superficie. « Ajouter une coopérative » enregistre un partenaire et audite immédiatement le registre qu'il vous a partagé (CSV, GeoJSON, KML).",
      en: "One card per cooperative (contact, headcount, compliance) and each headquarters' exact position — a point, never an area. \"Add a cooperative\" registers a partner and immediately audits the register it shared with you (CSV, GeoJSON, KML).",
    },
  },
  {
    target: "sidebar-producteurs",
    pointer: true,
    Icon: Users,
    accent: "#16a34a",
    titre: { fr: "Tous les producteurs du réseau", en: "Every farmer in the network" },
    corps: {
      fr: "La page Producteurs consolide tous les producteurs de vos coopératives, filtrables par coopérative et par statut. Chaque ligne ouvre la parcelle correspondante sur la carte satellite.",
      en: "The Farmers page consolidates every farmer across your cooperatives, filterable by cooperative and status. Each row opens the matching plot on the satellite map.",
    },
  },
  {
    target: "sidebar-parcelles",
    pointer: true,
    Icon: Map,
    accent: "#16a34a",
    titre: { fr: "Le registre satellite", en: "The satellite register" },
    corps: {
      fr: "La page Parcelles lie un tableau triable et la carte satellite : cliquez d'un côté, ça se surligne de l'autre. Activez le masque « Zones sensibles » pour comprendre visuellement les anomalies, et exportez en GeoJSON.",
      en: "The Plots page links a sortable table with the satellite map: click on one side, it highlights on the other. Toggle the \"Sensitive areas\" mask to visually understand anomalies, and export as GeoJSON.",
    },
  },
  {
    target: "sidebar-rapports",
    pointer: true,
    Icon: FileText,
    accent: "#c8861d",
    titre: { fr: "Dossiers acheteurs & alertes", en: "Buyer files & alerts" },
    corps: {
      fr: "Dossiers & rapports consolide vos parcelles conformes pour l'acheteur européen : résumé exécutif rédigé par l'IA, certificats vérifiables, centre d'alertes par coopérative et journal d'activité.",
      en: "Files & reports consolidates your compliant plots for the European buyer: an AI-written executive summary, verifiable certificates, a per-cooperative alert centre and the activity log.",
    },
  },
  {
    target: "sidebar-assistant",
    pointer: true,
    Icon: MessageSquareText,
    accent: "#16a34a",
    titre: { fr: "Interrogez vos données", en: "Query your data" },
    corps: {
      fr: "L'Assistant IA répond en langage naturel : « Quelles parcelles présentent un risque à Soubré ? ». Chaque réponse est calculée sur votre portefeuille et cite les parcelles concernées, cliquables.",
      en: "The AI Assistant answers in natural language: \"Which plots are at risk in Soubré?\". Every answer is computed on your portfolio and cites the plots involved, clickable.",
    },
  },
  {
    target: "assistant",
    pointer: true,
    Icon: Sparkles,
    accent: "#16a34a",
    titre: { fr: "L'Assistant AGRIVO, partout", en: "The AGRIVO Assistant, everywhere" },
    corps: {
      fr: "La bulle verte répond à toutes vos questions sur AGRIVO et la RDUE, sur toutes les pages. Pour une demande complexe : support@agrivo.ci.",
      en: "The green bubble answers all your questions about AGRIVO and the EUDR, on every page. For complex requests: support@agrivo.ci.",
    },
  },
  {
    Icon: Sprout,
    accent: "#16a34a",
    titre: { fr: "À vous de jouer", en: "Over to you" },
    corps: {
      fr: "Vous savez l'essentiel. Relancez cette visite à tout moment avec le bouton « ? » en haut de page — bonne analyse !",
      en: "You know the essentials. Replay this tour anytime with the \"?\" button at the top of the page — happy analysing!",
    },
  },
];

const UI = {
  fr: {
    passer: "Passer le guide",
    precedent: "Précédent",
    suivant: "Suivant",
    go: "C'est parti !",
    etape: (i: number, n: number) => `Étape ${i} sur ${n}`,
    aller: (i: number) => `Aller à l'étape ${i}`,
    cliquez: "C'est ici que vous cliquerez",
  },
  en: {
    passer: "Skip the guide",
    precedent: "Back",
    suivant: "Next",
    go: "Let's go!",
    etape: (i: number, n: number) => `Step ${i} of ${n}`,
    aller: (i: number) => `Go to step ${i}`,
    cliquez: "This is where you'll click",
  },
} as const;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Premier élément VISIBLE portant l'ancre (desktop et mobile peuvent partager une ancre). */
function findTarget(id: string): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`);
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > 4 && r.height > 4) return el;
  }
  return null;
}

export function OnboardingTour() {
  const { user, loading } = useAuth();
  const { lang } = useLanguage();
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion() ?? false;
  const t = UI[lang];

  const [open, setOpen] = React.useState(false);
  const [idx, setIdx] = React.useState(0);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [chercheEchouee, setChercheEchouee] = React.useState(false);
  const cheminOuverture = React.useRef<string>("");

  const role = user?.role === "exporter" ? "exporter" : "coop";
  const etapes = role === "exporter" ? ETAPES_EXPORT : ETAPES_COOP;
  // Le guide ne s'ouvre que sur la page d'accueil de l'espace (jamais au milieu d'une vérification).
  const surAccueil = role === "exporter" ? pathname === "/app/exportateur" : pathname === "/app/dashboard";

  const fermer = React.useCallback(() => {
    setOpen(false);
    setRect(null);
    try {
      localStorage.setItem(tourKey(role), "1");
    } catch {
      /* stockage indisponible */
    }
  }, [role]);

  // Ouverture automatique tant que la visite n'a pas été vue. Les comptes démo effacent le
  // drapeau à chaque connexion (auth-provider) : la visite se rejoue à chaque login démo.
  React.useEffect(() => {
    if (loading || !user || !surAccueil || open) return;
    try {
      if (localStorage.getItem(tourKey(role))) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => {
      setIdx(0);
      cheminOuverture.current = pathname;
      setOpen(true);
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, surAccueil, role]);

  // Relance manuelle depuis le bouton « ? ».
  React.useEffect(() => {
    const relancer = () => {
      setIdx(0);
      cheminOuverture.current = window.location.pathname;
      setOpen(true);
    };
    window.addEventListener("agrivo:tour:open", relancer);
    return () => window.removeEventListener("agrivo:tour:open", relancer);
  }, []);

  // Une étape « pointer » laisse l'élément cliquable : si l'utilisateur navigue, le guide se retire.
  React.useEffect(() => {
    if (open && cheminOuverture.current && pathname !== cheminOuverture.current) fermer();
  }, [open, pathname, fermer]);

  // Clavier : Échap ferme, flèches naviguent.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermer();
      else if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, etapes.length - 1));
      else if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, etapes.length, fermer]);

  const etape = etapes[idx];

  // Suivi de l'élément ciblé : recherche (avec patience), scroll en vue, re-mesure en continu
  // (scroll fluide, redimensionnement, contenus qui bougent) tant que le guide est ouvert.
  React.useEffect(() => {
    if (!open) return;
    let annule = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    setChercheEchouee(false);
    setRect(null);
    if (!etape.target) return;

    const mesurer = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    let essais = 0;
    const chercher = () => {
      if (annule) return;
      const el = findTarget(etape.target!);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
        mesurer(el);
        interval = setInterval(() => {
          const suivi = findTarget(etape.target!);
          if (suivi) mesurer(suivi);
        }, 180);
      } else if (essais < 15) {
        essais += 1;
        setTimeout(chercher, 120);
      } else {
        setRect(null);
        setChercheEchouee(true); // repli : carte centrée, le guide ne casse jamais
      }
    };
    chercher();

    return () => {
      annule = true;
      if (interval) clearInterval(interval);
    };
  }, [open, idx, etape.target, reduce]);

  if (!user) return null;

  const derniere = idx === etapes.length - 1;
  const spotlight = Boolean(etape.target) && rect !== null && !chercheEchouee;
  const centre = !etape.target || chercheEchouee;

  // Position de la carte explicative : sous la cible si la place le permet, sinon au-dessus ;
  // horizontalement centrée sur la cible et bornée à l'écran.
  let tipStyle: React.CSSProperties = {};
  if (spotlight && rect) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const w = Math.min(TOOLTIP_W, vw - 16);
    const dessous = rect.top + rect.height + PAD + TOOLTIP_H_EST < vh || rect.top < TOOLTIP_H_EST + 24;
    const left = Math.min(Math.max(8, rect.left + rect.width / 2 - w / 2), vw - w - 8);
    tipStyle = dessous
      ? { top: Math.min(rect.top + rect.height + PAD + 12, vh - 96), left, width: w }
      : { top: Math.max(8, rect.top - PAD - 12 - TOOLTIP_H_EST), left, width: w };
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[900]"
          data-tour-overlay
        >
          {spotlight && rect ? (
            <>
              {/* Bloqueurs de clic autour de la découpe : la page est figée, SAUF l'élément surligné. */}
              {(() => {
                const top = rect.top - PAD;
                const left = rect.left - PAD;
                const right = rect.left + rect.width + PAD;
                const bottom = rect.top + rect.height + PAD;
                const strip = "fixed z-[901]";
                return (
                  <>
                    <div className={strip} style={{ top: 0, left: 0, right: 0, height: Math.max(0, top) }} onClick={fermer} aria-hidden />
                    <div className={strip} style={{ top: Math.max(0, top), left: 0, width: Math.max(0, left), bottom: 0 }} onClick={fermer} aria-hidden />
                    <div className={strip} style={{ top: Math.max(0, top), left: right, right: 0, bottom: 0 }} onClick={fermer} aria-hidden />
                    <div className={strip} style={{ top: bottom, left: Math.max(0, left), width: Math.max(0, rect.width + PAD * 2), bottom: 0 }} onClick={fermer} aria-hidden />
                  </>
                );
              })()}

              {/* Découpe lumineuse : tout s'assombrit sauf l'élément ciblé. */}
              <motion.div
                aria-hidden
                initial={false}
                animate={{
                  top: rect.top - PAD,
                  left: rect.left - PAD,
                  width: rect.width + PAD * 2,
                  height: rect.height + PAD * 2,
                }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 32 }}
                className="pointer-events-none fixed z-[902] rounded-2xl"
                style={{ boxShadow: "0 0 0 9999px rgba(6, 20, 13, 0.72)" }}
              >
                {/* Anneau pulsant « regardez ici » */}
                {!reduce && (
                  <motion.span
                    aria-hidden
                    className="absolute -inset-1 rounded-2xl border-2"
                    style={{ borderColor: etape.accent }}
                    animate={{ opacity: [0.9, 0.25, 0.9], scale: [1, 1.03, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <span aria-hidden className="absolute -inset-1 rounded-2xl border" style={{ borderColor: `${etape.accent}80` }} />
              </motion.div>

              {/* Carte explicative ancrée à la cible */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`tip-${idx}`}
                  role="dialog"
                  aria-modal="true"
                  aria-label={etape.titre[lang]}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="fixed z-[903] overflow-hidden rounded-2xl border border-white/10 bg-forest-950 text-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]"
                  style={tipStyle}
                >
                  <TourCardContent
                    etape={etape}
                    idx={idx}
                    total={etapes.length}
                    lang={lang}
                    t={t}
                    reduce={reduce}
                    derniere={derniere}
                    onPrev={() => setIdx((i) => Math.max(i - 1, 0))}
                    onNext={() => (derniere ? fermer() : setIdx((i) => i + 1))}
                    onSkip={fermer}
                    onDot={setIdx}
                    compact
                  />
                </motion.div>
              </AnimatePresence>
            </>
          ) : centre ? (
            <>
              {/* Étape centrée (bienvenue / fin / repli) */}
              <button type="button" aria-label={t.passer} onClick={fermer} className="absolute inset-0 cursor-default bg-forest-950/70 backdrop-blur-[3px]" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`center-${idx}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label={etape.titre[lang]}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-forest-950 text-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]"
                  >
                    <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-green-signal/25 blur-3xl" />
                    <div aria-hidden className="pointer-events-none absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-amber-cacao/15 blur-3xl" />
                    <TourCardContent
                      etape={etape}
                      idx={idx}
                      total={etapes.length}
                      lang={lang}
                      t={t}
                      reduce={reduce}
                      derniere={derniere}
                      onPrev={() => setIdx((i) => Math.max(i - 1, 0))}
                      onNext={() => (derniere ? fermer() : setIdx((i) => i + 1))}
                      onSkip={fermer}
                      onDot={setIdx}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Cible en cours de localisation : voile léger, sans carte (évite tout éclair de contenu) */
            <div className="absolute inset-0 bg-forest-950/40" aria-hidden />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Contenu commun de la carte du guide (version ancrée compacte ou centrée). */
function TourCardContent({
  etape,
  idx,
  total,
  lang,
  t,
  reduce,
  derniere,
  onPrev,
  onNext,
  onSkip,
  onDot,
  compact = false,
}: {
  etape: Etape;
  idx: number;
  total: number;
  lang: "fr" | "en";
  t: (typeof UI)[keyof typeof UI];
  reduce: boolean;
  derniere: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onDot: (i: number) => void;
  compact?: boolean;
}) {
  const iconColor = etape.accent === "#b4231e" ? "#ff8f88" : etape.accent === "#c8861d" ? "#e0a64b" : "#4ade80";
  return (
    <div className={compact ? "relative p-4" : "relative p-6 pt-8"}>
      <div className={compact ? "flex items-start gap-3" : "flex flex-col items-center text-center"}>
        <motion.span
          key={idx}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: -12 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className={`grid shrink-0 place-items-center rounded-xl ${compact ? "h-10 w-10" : "mb-3 h-14 w-14 rounded-2xl"}`}
          style={{ background: `${etape.accent}26`, color: iconColor }}
        >
          <etape.Icon size={compact ? 19 : 26} strokeWidth={1.9} aria-hidden />
        </motion.span>
        <div className={compact ? "min-w-0 flex-1" : ""}>
          <p className="num text-[0.62rem] uppercase tracking-[0.18em] text-white/45">{t.etape(idx + 1, total)}</p>
          <h2 className={`font-display leading-tight text-white ${compact ? "mt-0.5 text-lg" : "mt-1 text-2xl"}`}>{etape.titre[lang]}</h2>
        </div>
        <button
          type="button"
          onClick={onSkip}
          aria-label={t.passer}
          className={`${compact ? "" : "absolute right-3 top-3"} shrink-0 rounded-full p-1.5 text-white/50 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/60`}
        >
          <X size={15} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <p className={`text-[0.83rem] leading-relaxed text-white/75 ${compact ? "mt-2.5" : "mt-3 text-center"}`}>{etape.corps[lang]}</p>

      {etape.pointer && (
        <motion.p
          initial={reduce ? { opacity: 1 } : { opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.3, ease: EASE }}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-green-signal/40 bg-green-signal/15 px-3 py-1.5 text-xs font-semibold text-green-signal"
        >
          <MousePointerClick size={13} strokeWidth={2.25} aria-hidden />
          {t.cliquez}
        </motion.p>
      )}

      {/* Points de progression */}
      <div className={`flex items-center gap-1 ${compact ? "mt-3" : "mt-4 justify-center"}`} role="tablist" aria-label={t.etape(idx + 1, total)}>
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-label={t.aller(i + 1)}
            onClick={() => onDot(i)}
            className="group grid h-5 place-items-center px-0.5 outline-none"
          >
            <motion.span
              animate={{ width: i === idx ? 20 : 6, backgroundColor: i === idx ? "#16a34a" : "rgba(255,255,255,0.25)" }}
              transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
              className="block h-[6px] rounded-full group-focus-visible:ring-2 group-focus-visible:ring-green-signal"
            />
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className={`flex items-center justify-between gap-3 ${compact ? "mt-3.5" : "mt-5"}`}>
        <button
          type="button"
          onClick={onPrev}
          disabled={idx === 0}
          className="rounded-full border border-white/15 px-3.5 py-2 text-xs font-medium text-white/70 outline-none transition-colors hover:border-green-signal/50 hover:text-white focus-visible:ring-2 focus-visible:ring-green-signal disabled:invisible"
        >
          {t.precedent}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn-green inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950"
        >
          {derniere ? t.go : t.suivant}
        </button>
      </div>
    </div>
  );
}

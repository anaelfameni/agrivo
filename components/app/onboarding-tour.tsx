"use client";

/**
 * Guide interactif d'accueil — pop-up animé qui explique AGRIVO pas à pas au client.
 *
 * S'ouvre automatiquement à la PREMIÈRE arrivée sur le tableau de bord (coopérative ou
 * exportateur — contenu adapté au rôle), puis plus jamais (drapeau localStorage). Relançable à
 * tout moment via le bouton « ? » de la topbar (événement `agrivo:tour:open`). Étapes animées
 * (icône en ressort, contenu glissé, points de progression), clavier (Échap ferme, flèches
 * naviguent), `prefers-reduced-motion` respecté.
 */

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  FileUp,
  LayoutDashboard,
  Layers,
  MapPinned,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Sprout,
  Table2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Etape {
  Icon: LucideIcon;
  accent: string; // couleur de l'icône / des accents
  titre: { fr: string; en: string };
  corps: { fr: string; en: string };
}

const ETAPES_COOP: Etape[] = [
  {
    Icon: Sprout,
    accent: "#16a34a",
    titre: { fr: "Bienvenue sur AGRIVO", en: "Welcome to AGRIVO" },
    corps: {
      fr: "Votre espace coopérative, expliqué en 2 minutes. Ce guide vous montre l'essentiel pour vérifier vos parcelles et prouver votre conformité RDUE. Vous pourrez le relancer à tout moment avec le bouton « ? » en haut de page.",
      en: "Your cooperative workspace, explained in 2 minutes. This guide shows you the essentials to verify your plots and prove your EUDR compliance. You can relaunch it anytime with the \"?\" button at the top of the page.",
    },
  },
  {
    Icon: LayoutDashboard,
    accent: "#16a34a",
    titre: { fr: "Votre tableau de bord", en: "Your dashboard" },
    corps: {
      fr: "En un coup d'œil : vos parcelles vérifiées, votre taux de conformité, la répartition des trois statuts et le centre d'alertes. Chaque vérification récente est cliquable pour ouvrir la fiche complète de la parcelle.",
      en: "At a glance: your verified plots, your compliance rate, the three-status breakdown and the alert centre. Every recent verification is clickable to open the plot's full record.",
    },
  },
  {
    Icon: MapPinned,
    accent: "#c8861d",
    titre: { fr: "Vérifier une parcelle", en: "Verify a plot" },
    corps: {
      fr: "Cliquez « Nouvelle vérification » : recueil du consentement du producteur, puis saisie des coordonnées de la parcelle — au minimum 4 sommets (Point A, B, C, D…). La superficie est calculée automatiquement, puis l'analyse satellite est lancée.",
      en: "Click \"New verification\": collect the farmer's consent, then enter the plot's coordinates — at least 4 vertices (Point A, B, C, D…). The area is computed automatically, then the satellite analysis runs.",
    },
  },
  {
    Icon: ShieldCheck,
    accent: "#16a34a",
    titre: { fr: "Trois verdicts, toujours expliqués", en: "Three verdicts, always explained" },
    corps: {
      fr: "Chaque analyse rend l'un de trois verdicts : « Conforme » (vert), « Anomalie détectée » (rouge) ou « Données insuffisantes » (ambre). Sur les cartes, le bouton « Zones sensibles » affiche les aires protégées pour comprendre visuellement le verdict.",
      en: "Every analysis returns one of three verdicts: \"Compliant\" (green), \"Anomaly detected\" (red) or \"Insufficient data\" (amber). On the maps, the \"Sensitive areas\" button shows protected areas to understand the verdict visually.",
    },
  },
  {
    Icon: ScrollText,
    accent: "#c8861d",
    titre: { fr: "Le certificat vérifiable", en: "The verifiable certificate" },
    corps: {
      fr: "Une parcelle conforme reçoit un certificat d'évaluation de conformité en PDF, avec un QR code : n'importe quel acheteur peut le scanner et vérifier le verdict en direct sur la page publique, sans compte.",
      en: "A compliant plot receives a compliance-assessment certificate as a PDF, with a QR code: any buyer can scan it and verify the verdict live on the public page, without an account.",
    },
  },
  {
    Icon: FileUp,
    accent: "#16a34a",
    titre: { fr: "Importez votre registre", en: "Import your register" },
    corps: {
      fr: "Vos fichiers de certification ou de cartographie existent déjà ? Le bloc « Importer mon registre » les audite selon la règle RDUE et l'IA génère un plan d'action priorisé : quoi corriger au bureau, quoi compléter sur le terrain.",
      en: "Your certification or mapping files already exist? The \"Import my register\" block audits them against the EUDR rule and the AI generates a prioritised action plan: what to fix at the office, what to complete in the field.",
    },
  },
  {
    Icon: Sparkles,
    accent: "#16a34a",
    titre: { fr: "L'Assistant AGRIVO, toujours là", en: "The AGRIVO Assistant, always there" },
    corps: {
      fr: "La bulle verte en bas à droite répond à toutes vos questions : prix, verdicts, réglementation, comment utiliser le site. Et pour une demande complexe, notre équipe répond à support@agrivo.ci. Bonne vérification !",
      en: "The green bubble at the bottom right answers all your questions: pricing, verdicts, regulation, how to use the site. For complex requests, our team answers at support@agrivo.ci. Happy verifying!",
    },
  },
];

const ETAPES_EXPORT: Etape[] = [
  {
    Icon: Sprout,
    accent: "#16a34a",
    titre: { fr: "Bienvenue sur votre espace exportateur", en: "Welcome to your exporter workspace" },
    corps: {
      fr: "Pilotez la conformité RDUE de tout votre portefeuille de coopératives depuis un seul tableau de bord. Ce guide vous montre l'essentiel — relancez-le à tout moment avec le bouton « ? » en haut de page.",
      en: "Steer the EUDR compliance of your whole portfolio of cooperatives from a single dashboard. This guide shows you the essentials — relaunch it anytime with the \"?\" button at the top of the page.",
    },
  },
  {
    Icon: Table2,
    accent: "#16a34a",
    titre: { fr: "Votre portefeuille, table et carte liées", en: "Your portfolio, linked table and map" },
    corps: {
      fr: "L'onglet Analytique montre vos indicateurs (producteurs audités, taux de conformité, superficie, volume validé) et un tableau triable relié à la carte satellite : cliquez une parcelle d'un côté, elle se surligne de l'autre.",
      en: "The Analytics tab shows your indicators (farmers audited, compliance rate, area, validated volume) and a sortable table linked to the satellite map: click a plot on one side, it highlights on the other.",
    },
  },
  {
    Icon: Layers,
    accent: "#b4231e",
    titre: { fr: "Le masque des zones sensibles", en: "The sensitive-areas mask" },
    corps: {
      fr: "Sur la carte, activez « Zones sensibles » pour afficher les aires protégées et forêts classées (tracés indicatifs, sources publiques) : vous voyez immédiatement pourquoi une parcelle est en anomalie.",
      en: "On the map, toggle \"Sensitive areas\" to display protected areas and classified forests (indicative outlines, public sources): you immediately see why a plot is flagged as an anomaly.",
    },
  },
  {
    Icon: Sparkles,
    accent: "#c8861d",
    titre: { fr: "Interrogez votre portefeuille", en: "Query your portfolio" },
    corps: {
      fr: "L'onglet Assistant IA répond en langage naturel : « Quelles parcelles présentent un risque à Soubré ? », « Quel volume est validé ? ». Chaque réponse est calculée sur vos données et cite les parcelles concernées.",
      en: "The AI Assistant tab answers in natural language: \"Which plots are at risk in Soubré?\", \"What volume is validated?\". Every answer is computed on your data and cites the plots involved.",
    },
  },
  {
    Icon: ScrollText,
    accent: "#16a34a",
    titre: { fr: "Le dossier acheteur", en: "The buyer file" },
    corps: {
      fr: "L'onglet Dossier consolide vos parcelles conformes en un dossier prêt pour l'acheteur européen : résumé exécutif rédigé par l'IA, certificats vérifiables et géométries GeoJSON prêtes pour TRACES NT.",
      en: "The File tab consolidates your compliant plots into a file ready for the European buyer: an AI-written executive summary, verifiable certificates and GeoJSON geometries ready for TRACES NT.",
    },
  },
  {
    Icon: Bell,
    accent: "#b4231e",
    titre: { fr: "Alertes & Assistant AGRIVO", en: "Alerts & AGRIVO Assistant" },
    corps: {
      fr: "L'onglet Configuration regroupe les anomalies par coopérative et journalise l'activité. Et la bulle verte en bas à droite répond à toutes vos questions — pour le reste, support@agrivo.ci. Bonne analyse !",
      en: "The Settings tab groups anomalies by cooperative and logs activity. And the green bubble at the bottom right answers all your questions — for anything else, support@agrivo.ci. Happy analysing!",
    },
  },
];

const UI = {
  fr: { passer: "Passer le guide", precedent: "Précédent", suivant: "Suivant", go: "C'est parti !", etape: (i: number, n: number) => `Étape ${i} sur ${n}`, aller: (i: number) => `Aller à l'étape ${i}` },
  en: { passer: "Skip the guide", precedent: "Back", suivant: "Next", go: "Let's go!", etape: (i: number, n: number) => `Step ${i} of ${n}`, aller: (i: number) => `Go to step ${i}` },
} as const;

function tourKey(role: string): string {
  return role === "exporter" ? "agrivo:tour:v1:exporter" : "agrivo:tour:v1:coop";
}

export function OnboardingTour() {
  const { user, loading } = useAuth();
  const { lang } = useLanguage();
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion() ?? false;
  const t = UI[lang];

  const [open, setOpen] = React.useState(false);
  const [idx, setIdx] = React.useState(0);

  const role = user?.role === "exporter" ? "exporter" : "coop";
  const etapes = role === "exporter" ? ETAPES_EXPORT : ETAPES_COOP;
  // Le guide ne s'ouvre que sur la page d'accueil de l'espace (jamais au milieu d'une vérification).
  const surAccueil = role === "exporter" ? pathname === "/app/exportateur" : pathname === "/app/dashboard";

  // Ouverture automatique à la première visite (drapeau localStorage par rôle).
  React.useEffect(() => {
    if (loading || !user || !surAccueil || open) return;
    try {
      if (localStorage.getItem(tourKey(role))) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => {
      setIdx(0);
      setOpen(true);
    }, 650);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, surAccueil, role]);

  // Relance manuelle depuis le bouton « ? » de la topbar.
  React.useEffect(() => {
    const relancer = () => {
      setIdx(0);
      setOpen(true);
    };
    window.addEventListener("agrivo:tour:open", relancer);
    return () => window.removeEventListener("agrivo:tour:open", relancer);
  }, []);

  const fermer = React.useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(tourKey(role), "1");
    } catch {
      /* stockage indisponible */
    }
  }, [role]);

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

  if (!user) return null;

  const etape = etapes[idx];
  const derniere = idx === etapes.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[900] flex items-center justify-center px-4"
          data-tour
        >
          {/* Scrim */}
          <button type="button" aria-label={t.passer} onClick={fermer} className="absolute inset-0 cursor-default bg-forest-950/60 backdrop-blur-[3px]" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={etape.titre[lang]}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-black/[0.08] bg-ivory shadow-[0_40px_120px_-30px_rgba(10,31,20,0.65)]"
          >
            {/* Bandeau sombre : icône animée + progression */}
            <div className="relative flex flex-col items-center bg-forest-950 px-6 pb-8 pt-10 text-white">
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-green-signal/25 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-amber-cacao/15 blur-3xl" />
              <button
                type="button"
                onClick={fermer}
                className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white/60 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {t.passer}
                <X size={14} strokeWidth={2} aria-hidden />
              </button>

              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={idx}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: -12 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="grid h-16 w-16 place-items-center rounded-2xl"
                  style={{ background: `${etape.accent}26`, color: etape.accent === "#b4231e" ? "#ff8f88" : etape.accent === "#c8861d" ? "#e0a64b" : "#4ade80" }}
                >
                  <etape.Icon size={30} strokeWidth={1.9} aria-hidden />
                </motion.span>
              </AnimatePresence>

              <p className="num mt-4 text-[0.65rem] uppercase tracking-[0.18em] text-white/50">{t.etape(idx + 1, etapes.length)}</p>
            </div>

            {/* Contenu de l'étape */}
            <div className="px-6 pb-6 pt-5 sm:px-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={idx}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 26 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -18 }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  <h2 className="font-display text-2xl leading-tight text-forest-950">{etape.titre[lang]}</h2>
                  <p className="mt-2.5 min-h-[5.5rem] text-sm leading-relaxed text-stone-600">{etape.corps[lang]}</p>
                </motion.div>
              </AnimatePresence>

              {/* Points de progression */}
              <div className="mt-4 flex items-center justify-center gap-1.5" role="tablist" aria-label={t.etape(idx + 1, etapes.length)}>
                {etapes.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === idx}
                    aria-label={t.aller(i + 1)}
                    onClick={() => setIdx(i)}
                    className="group grid h-5 place-items-center px-0.5 outline-none"
                  >
                    <motion.span
                      animate={{ width: i === idx ? 22 : 7, backgroundColor: i === idx ? "#16a34a" : "#d6d3ce" }}
                      transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
                      className="block h-[7px] rounded-full group-focus-visible:ring-2 group-focus-visible:ring-green-signal"
                    />
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIdx((i) => Math.max(i - 1, 0))}
                  disabled={idx === 0}
                  className="rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium text-stone-600 outline-none transition-colors hover:border-green-signal/40 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-green-signal disabled:invisible"
                >
                  {t.precedent}
                </button>
                <button
                  type="button"
                  onClick={() => (derniere ? fermer() : setIdx((i) => i + 1))}
                  className="btn-green inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-green-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                >
                  {derniere ? t.go : t.suivant}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

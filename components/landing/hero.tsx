"use client";
/**
 * HERO de la page d'accueil AGRIVO — niveau Linear / Loom / Stripe.
 *
 * Split asymétrique 55/45 : discours à gauche, tableau de bord flottant à droite.
 * Entrée staggerée déclenchée par l'évènement `agrivo:enter` (clic « Entrer » du
 * splash) pour enchaîner avec <PageReveal>. Filet de sécurité : révélation forcée
 * après un délai si l'évènement ne vient pas.
 *
 * Fond : mesh gradient animé (orbes lents, GPU) + grille + grain.
 * prefers-reduced-motion respecté (fades simples, aucun effet pointeur).
 */

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useAnimationControls,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type Variants,
} from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Magnetic, CursorGlow } from "@/components/ui/motion-primitives";
import { FILIERES } from "@/config/filieres";
import { useLanguage } from "@/components/language-provider";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Contenu bilingue du hero (FR par défaut · EN). */
const HERO_TR = {
  fr: {
    verbs: ["vérifie", "prouve", "certifie", "simplifie"],
    line2: "votre conformité RDUE",
    sub: "Vérifiez chaque parcelle en quelques secondes, générez le certificat et ouvrez l'accès au crédit du producteur. Toutes vos filières d'exportation, prêtes avant le 30 décembre 2026.",
    cta1: "Commencer la vérification",
    cta2: "Accéder au tableau de bord",
    meta: ["Les 7 matières premières du RDUE", "Aligné sur le SNT ivoirien", "Whisp (FAO) + IA générative"],
    badgeReq: "Conformité RDUE requise",
    badgeCountdown: (j: number) => `J-${j} · Conformité RDUE requise`,
    live: "EN DIRECT",
    portfolio: "Portefeuille",
    kConforme: "Conformes",
    kAnomalie: "Anomalies",
    kSuperficie: "Superficie",
    deadline: "Échéance RDUE",
    deadlineDate: "30 décembre 2026",
    tags: { Conforme: "Conforme", Insuffisant: "Insuffisant", Anomalie: "Anomalie" } as Record<string, string>,
  },
  en: {
    verbs: ["verifies", "proves", "certifies", "simplifies"],
    line2: "your EUDR compliance",
    sub: "Verify every plot in seconds, generate the certificate and open access to the farmer's credit. All your export commodities, ready before 30 December 2026.",
    cta1: "Start verification",
    cta2: "Go to the dashboard",
    meta: ["The 7 EUDR raw materials", "Aligned with Côte d'Ivoire's NTS", "Whisp (FAO) + generative AI"],
    badgeReq: "EUDR compliance required",
    badgeCountdown: (j: number) => `D-${j} · EUDR compliance required`,
    live: "LIVE",
    portfolio: "Portfolio",
    kConforme: "Compliant",
    kAnomalie: "Anomalies",
    kSuperficie: "Area",
    deadline: "EUDR deadline",
    deadlineDate: "30 December 2026",
    tags: { Conforme: "Compliant", Insuffisant: "Insufficient", Anomalie: "Anomaly" } as Record<string, string>,
  },
};
type HeroTr = (typeof HERO_TR)["fr"];

/* --------------------------- Données de démonstration (mock) --------------------------- */
const STATS = { conforme: 32, anomalie: 5, total: 45, superficieHa: 1240 };

const ROWS = [
  { name: "COOP-SOU · Soubré", dep: "Cacao · Nawa", comp: 96, color: "var(--color-green-signal)", tag: "Conforme" },
  { name: "UCACO · Man", dep: "Café · Tonkpi", comp: 63, color: "var(--color-amber-cacao)", tag: "Insuffisant" },
  { name: "COOP-HEV · Aboisso", dep: "Hévéa · Sud-Comoé", comp: 28, color: "var(--color-red-block)", tag: "Anomalie" },
  { name: "COOP-PALM · Dabou", dep: "Palmier · Grands-Ponts", comp: 89, color: "var(--color-green-signal)", tag: "Conforme" },
];

function joursAvantRDUE(now: Date): number {
  const target = new Date("2026-12-30").getTime();
  return Math.max(0, Math.ceil((target - now.getTime()) / 86_400_000));
}

const fmtHa = (n: number) => `${new Intl.NumberFormat("fr-FR").format(n)} ha`;

/** Variants d'entrée par élément (réduits à un simple fondu en reduced-motion). */
function buildVariants(reduced: boolean): Record<string, Variants> {
  if (reduced) {
    const fade = (delay: number): Variants => ({
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.4, delay } },
    });
    return {
      badge: fade(0),
      line1: fade(0.1),
      line2: fade(0.2),
      sub: fade(0.3),
      ctas: fade(0.4),
      mockup: fade(0.5),
      bar: { hidden: { opacity: 1 }, show: { opacity: 1 } },
    };
  }
  return {
    badge: {
      hidden: { opacity: 0, y: 16 },
      show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0, ease: EASE } },
    },
    line1: {
      hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, delay: 0.15, ease: EASE } },
    },
    line2: {
      hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, delay: 0.35, ease: EASE } },
    },
    sub: {
      hidden: { opacity: 0, y: 12 },
      show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.5, ease: EASE } },
    },
    ctas: {
      hidden: { opacity: 0, scale: 0.96 },
      show: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.65, ease: EASE } },
    },
    mockup: {
      hidden: { opacity: 0, x: 40 },
      show: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.8, ease: EASE } },
    },
    bar: {
      hidden: { scaleX: 0 },
      show: { scaleX: 1, transition: { duration: 0.8, delay: 1.1, ease: EASE } },
    },
  };
}

export function Hero() {
  const reduced = useReducedMotion() ?? false;
  const controls = useAnimationControls();
  const V = buildVariants(reduced);
  const { lang } = useLanguage();
  const tr = HERO_TR[lang === "en" ? "en" : "fr"];

  useEffect(() => {
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      controls.start("show");
    };
    window.addEventListener("agrivo:enter", play);
    const fallback = setTimeout(play, 12000);
    return () => {
      window.removeEventListener("agrivo:enter", play);
      clearTimeout(fallback);
    };
  }, [controls]);

  return (
    <section className="relative isolate overflow-hidden bg-forest-950 text-white">
      {/* Arrière-plan : mesh gradient animé + grille + grain. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="mesh-a absolute -left-[12%] top-[-18%] h-[620px] w-[620px] rounded-full bg-green-signal/20 blur-[120px]" />
        <div className="mesh-b absolute right-[-10%] top-[8%] h-[500px] w-[500px] rounded-full bg-amber-cacao/15 blur-[120px]" />
        <div className="mesh-c absolute bottom-[-22%] left-[28%] h-[540px] w-[540px] rounded-full bg-forest-700/45 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 75% 60% at 40% 35%, #000 20%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 60% at 40% 35%, #000 20%, transparent 78%)",
          }}
        />
        <div className="grain absolute inset-0 opacity-[0.05]" />
      </div>

      <CursorGlow className="relative z-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pt-32 pb-24 lg:grid-cols-[55fr_45fr] lg:gap-10">
          {/* ---------- Colonne gauche (55 %) : discours ---------- */}
          <div className="text-center lg:text-left">
            <motion.div variants={V.badge} initial="hidden" animate={controls} className="inline-flex">
              <RdueBadge reduced={reduced} tr={tr} />
            </motion.div>

            <h1
              className="font-brand-serif mt-6 leading-[1.04] tracking-[-0.03em] text-4xl md:text-6xl"
              style={{ fontWeight: 700 }}
            >
              <motion.span variants={V.line1} initial="hidden" animate={controls} className="block">
                <span className="text-green-signal">Agrivo</span> <RotatingVerb reduced={reduced} verbs={tr.verbs} />
              </motion.span>
              <motion.span variants={V.line2} initial="hidden" animate={controls} className="block">
                {tr.line2}
              </motion.span>
            </h1>

            <motion.p
              variants={V.sub}
              initial="hidden"
              animate={controls}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70 lg:mx-0"
            >
              {tr.sub}
            </motion.p>

            <motion.div
              variants={V.ctas}
              initial="hidden"
              animate={controls}
              className="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <Magnetic strength={0.35} className="inline-flex">
                <motion.div whileHover={reduced ? undefined : { scale: 1.02 }} className="inline-flex">
                  <Link
                    href="/app/verifier"
                    className="group inline-flex items-center gap-3 rounded-full bg-green-signal px-7 py-4 text-sm font-semibold text-white shadow-[0_14px_44px_-12px_rgba(22,163,74,0.85)] transition-[filter,box-shadow] hover:brightness-110 hover:shadow-[0_18px_56px_-12px_rgba(22,163,74,0.95)]"
                  >
                    {tr.cta1}
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                </motion.div>
              </Magnetic>

              <Link
                href="/app/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-amber-soft px-6 py-4 text-sm font-semibold text-forest-950 shadow-[0_14px_44px_-14px_rgba(224,166,75,0.85)] transition-[filter,transform] hover:brightness-105 hover:-translate-y-0.5"
              >
                {tr.cta2}
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
              <div className="flex flex-wrap items-center justify-center gap-1.5 lg:justify-start">
                {FILIERES.map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/75"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.couleur }} />
                    {f.label}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-white/45 lg:justify-start">
                <span>{tr.meta[0]}</span>
                <span className="hidden sm:inline">·</span>
                <span>{tr.meta[1]}</span>
                <span className="hidden sm:inline">·</span>
                <span>{tr.meta[2]}</span>
              </div>
            </div>
          </div>

          {/* ---------- Colonne droite (45 %) : tableau de bord flottant ---------- */}
          <motion.div variants={V.mockup} initial="hidden" animate={controls}>
            <HeroMockup reduced={reduced} controls={controls} barVariant={V.bar} tr={tr} />
          </motion.div>
        </div>
      </CursorGlow>

      <ScrollIndicator reduced={reduced} />
    </section>
  );
}

/* ----------------------------- Badge RDUE ----------------------------- */
function RdueBadge({ reduced, tr }: { reduced: boolean; tr: HeroTr }) {
  const [jours, setJours] = useState<number | null>(null);
  useEffect(() => setJours(joursAvantRDUE(new Date())), []);
  return (
    <motion.span
      animate={reduced ? undefined : { scale: [1, 1.03, 1] }}
      transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="inline-flex items-center gap-2 rounded-full border border-green-signal/40 bg-green-signal/10 px-4 py-2 text-xs font-semibold text-green-signal"
    >
      <span className="glow-pulse h-1.5 w-1.5 rounded-full bg-green-signal" />
      {jours === null ? tr.badgeReq : tr.badgeCountdown(jours)}
    </motion.span>
  );
}

/* ------------------- Verbe rotatif ------------------- */
function RotatingVerb({ reduced, verbs }: { reduced: boolean; verbs: readonly string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((p) => (p + 1) % verbs.length), 2200);
    return () => clearInterval(t);
  }, [reduced, verbs.length]);

  if (reduced) return <span className="text-green-signal">{verbs[0]}</span>;

  return (
    <span className="relative inline-flex align-baseline">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={verbs[i]}
          initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -20, opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.42, ease: EASE }}
          className="text-green-signal"
        >
          {verbs[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ----------------------- Tableau de bord flottant ----------------------- */
function HeroMockup({
  reduced,
  controls,
  barVariant,
  tr,
}: {
  reduced: boolean;
  controls: ReturnType<typeof useAnimationControls>;
  barVariant: Variants;
  tr: HeroTr;
}) {
  const tiltRef = useRef<HTMLDivElement>(null);

  // Flottaison douce (amplitude ~8 px, période 4 s).
  const floatTarget = useMotionValue(0);
  const floatY = useSpring(floatTarget, { stiffness: 45, damping: 12, mass: 0.6 });
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const start = performance.now();
    const loop = (t: number) => {
      floatTarget.set(Math.sin(((t - start) / 4000) * Math.PI * 2) * 8);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, floatTarget]);

  // Parallax au scroll : 0 -> -40 px.
  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, [0, 800], [0, -40]);

  // Rotation 3D au curseur : rotateX ±6°, rotateY ±8°.
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 2 * 8);
    rx.set(-(py - 0.5) * 2 * 6);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const card = (
    <>
      {/* Glow vert diffus sous le tableau de bord. */}
      <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.2rem] bg-green-signal/25 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_40px_120px_-30px_rgba(22,163,74,0.45)]">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-black/[0.06] bg-black/[0.015] px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo size={15} showWord={false} />
            <span className="text-xs font-semibold text-forest-950">
              Agrivo <span className="text-stone-400">· {tr.portfolio}</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-signal/12 px-2 py-0.5 text-[10px] font-semibold text-green-signal">
            <span className="glow-pulse h-1.5 w-1.5 rounded-full bg-green-signal" /> {tr.live}
          </span>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-3 gap-px bg-black/[0.06]">
          <Kpi value={`${STATS.conforme}/${STATS.total}`} label={tr.kConforme} color="var(--color-green-signal)" />
          <Kpi value={`${STATS.anomalie}`} label={tr.kAnomalie} color="var(--color-red-block)" />
          <Kpi value={fmtHa(STATS.superficieHa)} label={tr.kSuperficie} color="var(--color-amber-cacao)" small />
        </div>

        {/* Mini-graphe : conformité par coopérative */}
        <div className="space-y-2 p-4">
          {ROWS.map((r) => (
            <div
              key={r.name}
              className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-3 py-2.5 shadow-sm"
              style={{ borderLeft: `3px solid ${r.color}` }}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: r.color }} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-forest-950">{r.name}</div>
                <div className="text-[10px] text-stone-400">{r.dep}</div>
              </div>
              <span
                className="hidden rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline"
                style={{ background: `${r.color}1f`, color: r.color }}
              >
                {tr.tags[r.tag] ?? r.tag}
              </span>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/[0.06] sm:w-24">
                <motion.div
                  variants={barVariant}
                  initial="hidden"
                  animate={controls}
                  className="h-full origin-left rounded-full"
                  style={{ width: `${r.comp}%`, background: r.color }}
                />
              </div>
              <span className="num w-8 text-right text-[11px] font-medium text-stone-500">{r.comp}%</span>
            </div>
          ))}
        </div>

        {/* Pied : échéance */}
        <div className="flex items-center justify-between border-t border-black/[0.06] bg-black/[0.015] px-4 py-2.5 text-[11px]">
          <span className="text-stone-500">{tr.deadline}</span>
          <span className="num font-semibold text-amber-cacao">{tr.deadlineDate}</span>
        </div>
      </div>
    </>
  );

  if (reduced) {
    return <div className="relative">{card}</div>;
  }

  return (
    <motion.div style={{ y: parallax }} className="relative">
      <motion.div
        ref={tiltRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ y: floatY, rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
        className="relative"
      >
        {card}
      </motion.div>
    </motion.div>
  );
}

function Kpi({ value, label, color, small }: { value: string; label: string; color: string; small?: boolean }) {
  return (
    <div className="bg-white px-3 py-4 text-center">
      <div className={`num font-semibold ${small ? "text-base" : "text-xl"}`} style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[10px] text-stone-500">{label}</div>
    </div>
  );
}

/* --------------------------- Indicateur de scroll --------------------------- */
function ScrollIndicator({ reduced }: { reduced: boolean }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setHidden(v > 100));

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, 6, 0] }}
        transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-white/40"
      >
        <ChevronDown size={22} />
      </motion.div>
    </motion.div>
  );
}

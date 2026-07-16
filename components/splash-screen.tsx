"use client";
/**
 * Écran de bienvenue AGRIVO (BLOC 1) — niveau Linear / Vercel launch screen.
 *
 * Combine 3 niveaux d'interaction de façon cohérente :
 *  A. Curseur    : champ de particules vertes qui FUIENT le curseur en temps réel
 *                  (canvas + requestAnimationFrame, position du curseur en useMotionValue).
 *  B. Typographie : les mots du tagline se révèlent au fil de la progression,
 *                  et le survol d'un mot le révèle instantanément (accélérateur).
 *  C. Countdown  : barre verte qui se remplit seule, que l'on accélère en cliquant
 *                  n'importe où (feedback haptique visuel : ondulation + éclatement).
 *
 * Le bouton « Entrer » apparaît à 100 % (ou immédiatement en reduced-motion), il est
 * MAGNÉTIQUE (attire le curseur dans un rayon de 80 px), et déclenche une sortie premium
 * (remontée en rideau) qui révèle la page d'accueil.
 *
 * Affiché à CHAQUE arrivée sur « / » (refresh et retours de navigation compris), et
 * forçable partout via `?splash=1` (démo). Au clic « Entrer », relais à <PageReveal> via
 * sessionStorage `agrivo_from_splash` + évènement `agrivo:enter`.
 * prefers-reduced-motion : pas de particules ni de countdown, contenu + bouton immédiats.
 */

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  AGRIVO_PIN_PATH,
  AGRIVO_LEAF_PATH,
  AGRIVO_VEIN_PATH,
  AGRIVO_GLOSS_PATH,
} from "@/components/ui/logo";
import { useLanguage } from "@/components/language-provider";

/** useLayoutEffect côté client (évite le warning SSR), sinon useEffect. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const EASE = [0.16, 1, 0.3, 1] as const;

const SPLASH_TR = {
  fr: {
    line1: ["Bienvenue", "dans", "Agrivo"],
    line2: ["De", "la", "parcelle", "vérifiée", "à", "la", "prime", "négociée."],
    hint: "Cliquez n'importe où pour entrer plus vite",
    enter: "Entrer",
    aria: "Écran de bienvenue Agrivo",
  },
  en: {
    line1: ["Welcome", "to", "Agrivo"],
    line2: ["From", "the", "verified", "plot", "to", "the", "negotiated", "premium."],
    hint: "Click anywhere to enter faster",
    enter: "Enter",
    aria: "Agrivo welcome screen",
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  amber: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function SplashScreen() {
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;
  const { lang } = useLanguage();
  const TR = SPLASH_TR[lang === "en" ? "en" : "fr"];
  const LINE1 = TR.line1;
  const LINE2 = TR.line2;

  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(true);

  // ----- Curseur (useMotionValue) : alimente le halo, les particules et l'aimant -----
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const sx = useSpring(mx, { stiffness: 90, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 90, damping: 18, mass: 0.4 });
  const glowX = useTransform(sx, (v) => v - 260);
  const glowY = useTransform(sy, (v) => v - 260);

  useEffect(() => {
    if (!active || reduced) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [active, reduced, mx, my]);

  // ----- Countdown (C) : progression auto, accélérable au clic -----
  const [progress, setProgress] = useState(0);
  const boostRef = useRef(0);
  const ready = progress >= 100;

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setProgress(100);
      return;
    }
    let raf = 0;
    let mounted = true;
    const start = performance.now();
    const tick = (t: number) => {
      if (!mounted) return;
      const elapsed = t - start;
      // 600 ms laissés au tracé du logo, puis ~5,2 s pour atteindre 100 % en passif.
      const base = Math.max(0, elapsed - 600) * (100 / 5200);
      const val = Math.min(100, base + boostRef.current);
      setProgress(val);
      if (val < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, [active, reduced]);

  // ----- Champ de particules (A) : fuite du curseur + éclatement au clic -----
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active || reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const count = Math.min(64, Math.max(28, Math.round((w * h) / 26000)));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 1 + Math.random() * 2.2,
      alpha: 0.25 + Math.random() * 0.4,
      amber: Math.random() < 0.16,
    }));

    let raf = 0;
    const LINK_DIST = 120;
    const FLEE_DIST = 150;

    const frame = () => {
      const ps = particlesRef.current;
      const cx = mx.get();
      const cy = my.get();
      ctx.clearRect(0, 0, w, h);

      for (const p of ps) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.hypot(dx, dy);
        if (d < FLEE_DIST && d > 0.001) {
          const f = (1 - d / FLEE_DIST) * 1.1;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.vx += (Math.random() - 0.5) * 0.04;
        p.vy += (Math.random() - 0.5) * 0.04;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.amber
          ? `rgba(224, 166, 75, ${p.alpha})`
          : `rgba(22, 163, 74, ${p.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(22, 163, 74, ${0.12 * (1 - d / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active, reduced, mx, my]);

  // ----- Bouton magnétique (rayon 80 px) -----
  const btnRef = useRef<HTMLButtonElement>(null);
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const sbx = useSpring(bx, { stiffness: 150, damping: 12, mass: 0.3 });
  const sby = useSpring(by, { stiffness: 150, damping: 12, mass: 0.3 });

  useEffect(() => {
    if (!active || reduced || !ready) return;
    const onMove = (e: PointerEvent) => {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = 80 + r.width / 2;
      if (dist < radius) {
        const pull = 1 - dist / radius;
        bx.set(dx * pull * 0.6);
        by.set(dy * pull * 0.6);
      } else {
        bx.set(0);
        by.set(0);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      bx.set(0);
      by.set(0);
    };
  }, [active, reduced, ready, bx, by]);

  // ----- Sortie premium + passage de relais à <PageReveal> -----
  const enter = useCallback(() => {
    try {
      sessionStorage.setItem("agrivo_from_splash", "1");
    } catch {
      /* ignore */
    }
    try {
      window.dispatchEvent(new Event("agrivo:enter"));
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);
  const finalize = useCallback(() => setActive(false), []);

  // Clavier : Échap passe ; Entrée/Espace entrent quand le bouton est prêt.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") enter();
      if (ready && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, ready, enter]);

  useEffect(() => {
    if (ready) btnRef.current?.focus();
  }, [ready]);

  // ----- Interactions (B + C) : survol des mots, clics accélérateurs -----
  const [hovered, setHovered] = useState<Set<number>>(new Set());
  const revealWord = useCallback((i: number) => {
    setHovered((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  }, []);

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  const onSurfacePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduced || ready) {
        enter();
        return;
      }
      boostRef.current = Math.min(100, boostRef.current + 14);
      const id = rippleId.current++;
      const x = e.clientX;
      const y = e.clientY;
      setRipples((prev) => [...prev, { id, x, y }]);
      for (const p of particlesRef.current) {
        const dx = p.x - x;
        const dy = p.y - y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 240) {
          const f = (1 - d / 240) * 7;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }
    },
    [reduced, ready, enter],
  );

  // ----- Décision d'affichage : à CHAQUE arrivée sur « / » (ou ?splash=1), sans cache. -----
  useIsoLayoutEffect(() => {
    let force = false;
    try {
      force = new URLSearchParams(window.location.search).has("splash");
    } catch {
      /* ignore */
    }
    // Retour depuis l'espace applicatif via le bouton « Site » : on saute l'écran de bienvenue
    // pour arriver directement sur l'accueil (drapeau posé par <BackToSiteLink>).
    let skip = false;
    try {
      skip = sessionStorage.getItem("agrivo_skip_splash") === "1";
      if (skip) sessionStorage.removeItem("agrivo_skip_splash");
    } catch {
      /* ignore */
    }

    if ((pathname === "/" || force) && !(skip && !force)) {
      boostRef.current = 0;
      setProgress(0);
      setHovered(new Set());
      setVisible(true);
      setActive(true);
    } else {
      setActive(false);
      try {
        document.getElementById("splash-mask")?.remove();
      } catch {
        /* ignore */
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (!active) return;
    try {
      document.getElementById("splash-mask")?.remove();
    } catch {
      /* ignore */
    }
  }, [active]);

  if (!active) return null;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence onExitComplete={finalize}>
        {visible && (
          <motion.div
            key="agrivo-splash"
            role="dialog"
            aria-modal="true"
            aria-label={TR.aria}
            onPointerDown={onSurfacePointerDown}
            initial={{ opacity: 1, y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{ willChange: "transform" }}
            className="fixed inset-0 z-[9999] flex select-none flex-col items-center justify-center overflow-hidden bg-forest-950 text-white"
          >
            {/* Fond de profondeur (halos + grille + grain), jamais une couleur plate. */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-[-10%] h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-green-signal/12 blur-[90px]" />
              <div className="absolute bottom-[2%] right-[6%] h-[340px] w-[340px] rounded-full bg-amber-cacao/10 blur-[80px]" />
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
                  backgroundSize: "64px 64px",
                  maskImage:
                    "radial-gradient(ellipse 70% 55% at 50% 40%, #000 20%, transparent 75%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 70% 55% at 50% 40%, #000 20%, transparent 75%)",
                }}
              />
              <div className="grain absolute inset-0 opacity-[0.05]" />
            </div>

            {/* Particules (A) */}
            {!reduced && (
              <canvas
                ref={canvasRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
            )}

            {/* Halo qui suit le curseur */}
            {!reduced && (
              <motion.div
                aria-hidden
                style={{ x: glowX, y: glowY }}
                className="pointer-events-none absolute left-0 top-0 h-[520px] w-[520px] rounded-full"
              >
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(22,163,74,0.16) 0%, transparent 62%)",
                  }}
                />
              </motion.div>
            )}

            {/* Contenu central */}
            <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 text-center">
              <SplashLogo reduced={reduced} />

              {/* Ligne 1 : reveal staggeré mot par mot (espaces réels entre les mots) */}
              <h1 className="mt-9 font-brand-serif text-4xl font-semibold leading-tight sm:text-5xl">
                {LINE1.map((word, i) => (
                  <Fragment key={word}>
                    <motion.span
                      initial={
                        reduced ? { opacity: 1 } : { opacity: 0, y: 24, filter: "blur(8px)" }
                      }
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        duration: 1.4,
                        delay: reduced ? 0 : 1.0 + i * 0.28,
                        ease: EASE,
                      }}
                      className={`inline-block ${i === 2 ? "text-green-signal" : "text-white"}`}
                    >
                      {word}
                    </motion.span>
                    {i < LINE1.length - 1 ? " " : null}
                  </Fragment>
                ))}
              </h1>

              {/* Ligne 2 : mots révélés au fil de la progression (B) + survol, tout en blanc */}
              <p className="mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
                {LINE2.map((word, i) => {
                  const lit =
                    reduced || hovered.has(i) || progress >= ((i + 1) / LINE2.length) * 90;
                  return (
                    <Fragment key={word + i}>
                      <motion.span
                        onPointerEnter={() => revealWord(i)}
                        animate={{
                          opacity: lit ? 1 : 0.22,
                          filter: lit ? "blur(0px)" : "blur(3px)",
                        }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className={`inline-block cursor-default ${lit ? "text-white" : "text-white/40"}`}
                      >
                        {word}
                      </motion.span>
                      {i < LINE2.length - 1 ? " " : null}
                    </Fragment>
                  );
                })}
              </p>

              {/* Countdown (C) ou bouton magnétique */}
              <div className="mt-10 flex h-16 items-center justify-center">
                <AnimatePresence mode="wait">
                  {!ready ? (
                    <motion.div
                      key="countdown"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="h-1 w-56 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-green-signal"
                          style={{ width: `${progress}%` }}
                          transition={{ ease: "linear" }}
                        />
                      </div>
                      <span className="text-xs text-white/45">{TR.hint}</span>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="enter"
                      ref={btnRef}
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={enter}
                      style={reduced ? undefined : { x: sbx, y: sby }}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className="group inline-flex items-center gap-3 rounded-full bg-green-signal px-8 py-4 text-sm font-semibold text-white shadow-[0_18px_50px_-12px_rgba(22,163,74,0.7)] outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      {TR.enter}
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                        <ArrowRight size={14} />
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Ondulations haptiques au clic */}
            {!reduced &&
              ripples.map((r) => (
                <motion.span
                  key={r.id}
                  aria-hidden
                  initial={{ opacity: 0.5, scale: 0 }}
                  animate={{ opacity: 0, scale: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  onAnimationComplete={() =>
                    setRipples((prev) => prev.filter((x) => x.id !== r.id))
                  }
                  style={{ left: r.x, top: r.y }}
                  className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-green-signal/50"
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

/* Logo AGRIVO animé : tracé (pin -> feuille -> nervure) + remplissage dégradé + reflet glossy,
   puis une LUEUR douce qui respire et un REFLET SPÉCULAIRE lent qui glisse (professionnel, pas clinquant). */
function SplashLogo({ reduced }: { reduced: boolean }) {
  const drawn = { pathLength: 1, fillOpacity: 1 };
  const fromStroke = reduced ? { pathLength: 1, fillOpacity: 1 } : { pathLength: 0, fillOpacity: 0 };

  return (
    <motion.svg
      width={88}
      height={88}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Agrivo"
      initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: EASE }}
    >
      <defs>
        <linearGradient id="splash-pin" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22c55e" />
          <stop offset="1" stopColor="#0f5a2e" />
        </linearGradient>
        <linearGradient id="splash-leaf" x1="8.5" y1="12.4" x2="15.5" y2="5.6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ecc06e" />
          <stop offset="1" stopColor="#c8861d" />
        </linearGradient>
        <linearGradient id="splash-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="splash-glow" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#16a34a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#16a34a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="splash-clip">
          <path d={AGRIVO_PIN_PATH} />
          <path d={AGRIVO_LEAF_PATH} />
        </clipPath>
      </defs>

      {/* Lueur verte douce qui respire derrière le logo (luit, professionnel). */}
      {!reduced && (
        <motion.circle
          cx="12"
          cy="12"
          r="13"
          fill="url(#splash-glow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.22, 0.5, 0.22], scale: [1, 1.05, 1] }}
          transition={{ duration: 3.8, delay: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        />
      )}

      <motion.circle
        cx="12"
        cy="12"
        r="11"
        fill="var(--color-green-signal)"
        initial={reduced ? { opacity: 0.16, scale: 1 } : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 0.16, scale: 1 }}
        transition={{ duration: 1.4, delay: reduced ? 0 : 0.3, ease: EASE }}
        style={{ transformOrigin: "center" }}
      />

      {/* Pin : contour qui se dessine puis remplissage dégradé. */}
      <motion.path
        d={AGRIVO_PIN_PATH}
        fill="url(#splash-pin)"
        stroke="#22c55e"
        strokeWidth="0.6"
        strokeLinejoin="round"
        initial={fromStroke}
        animate={drawn}
        transition={{
          pathLength: { duration: 1.9, delay: reduced ? 0 : 0.4, ease: EASE },
          fillOpacity: { duration: 1, delay: reduced ? 0 : 1.7 },
        }}
      />

      {/* Reflet glossy sur le bord du pin. */}
      <motion.path
        d={AGRIVO_GLOSS_PATH}
        stroke="#eafff2"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
        initial={{ opacity: reduced ? 0.5 : 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.6, delay: reduced ? 0 : 1.9 }}
      />

      {/* Feuille : contour puis remplissage dégradé. */}
      <motion.path
        d={AGRIVO_LEAF_PATH}
        fill="url(#splash-leaf)"
        stroke="#c8861d"
        strokeWidth="0.5"
        strokeLinejoin="round"
        initial={fromStroke}
        animate={drawn}
        transition={{
          pathLength: { duration: 1.1, delay: reduced ? 0 : 1.0, ease: EASE },
          fillOpacity: { duration: 0.9, delay: reduced ? 0 : 1.95 },
        }}
      />

      {/* Nervure. */}
      <motion.path
        d={AGRIVO_VEIN_PATH}
        stroke="#fff7e6"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
        initial={{ opacity: reduced ? 0.6 : 0, pathLength: reduced ? 1 : 0 }}
        animate={{ opacity: 0.6, pathLength: 1 }}
        transition={{ duration: 0.6, delay: reduced ? 0 : 2.2, ease: EASE }}
      />

      {/* Reflet spéculaire doux qui glisse sur le logo : une passe lente et élégante, puis pause. */}
      {!reduced && (
        <g clipPath="url(#splash-clip)">
          <motion.g
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: [-16, 22], opacity: [0, 0.55, 0] }}
            transition={{
              duration: 1.7,
              delay: 2.4,
              repeat: Infinity,
              repeatDelay: 4.4,
              times: [0, 0.5, 1],
              ease: "easeInOut",
            }}
          >
            <rect x="8" y="-8" width="6" height="40" fill="url(#splash-sheen)" transform="rotate(22 12 12)" />
          </motion.g>
        </g>
      )}
    </motion.svg>
  );
}

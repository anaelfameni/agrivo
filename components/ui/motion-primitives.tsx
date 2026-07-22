"use client";
/**
 * Primitives d'interaction premium (niveau Linear / Stripe / Vercel).
 *
 * Implémentation 100% vanilla (pas de lib externe) :
 *  - requestAnimationFrame pour le lissage (zéro jank)
 *  - uniquement transform / opacity (pas de repaint)
 *  - garde-fou prefers-reduced-motion (désactive tout)
 *  - responsive : désactivé sur tactile (hover:none)
 *
 * Trois composants :
 *  - <Magnetic>  : élément attiré vers le curseur (CTAs signature)
 *  - <CursorGlow>: halo radial qui suit la souris (hero immersif)
 *  - <Tilt>      : inclinaison 3D au survol (cartes produit)
 */

import {
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type ElementType,
  type CSSProperties,
} from "react";

/** Hook : lit la préférence reduced-motion (une fois au montage). */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

/** Hook : mode performance (?perf=1 dans l'URL) → coupe les effets lourds. */
function usePerfMode(): boolean {
  const [perf, setPerf] = useState(false);
  useEffect(() => {
    try {
      setPerf(new URLSearchParams(window.location.search).has("perf"));
    } catch {
      /* ignore */
    }
  }, []);
  return perf;
}

/** Hook : détecte un appareil sans hover précis (tactile) → on désactive les effets pointeur. */
function useFinePointer(): boolean {
  const [fine, setFine] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFine(mq.matches);
    const handler = () => setFine(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return fine;
}

/* ================================ Magnetic ================================ */

interface MagneticProps {
  children: ReactNode;
  /** Force de l'attraction (défaut 0.4 = 40% du déplacement curseur). */
  strength?: number;
  className?: string;
  as?: ElementType;
  href?: string;
}

/** Enveloppe un élément pour qu'il soit attiré vers le curseur au survol. */
export function Magnetic({
  children,
  strength = 0.4,
  className = "",
  as,
  href,
}: MagneticProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const perf = usePerfMode();
  const enabled = !reduced && fine && !perf;

  const rafRef = useRef<number>(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.15;
      current.current.y += (target.current.y - current.current.y) * 0.15;
      el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      if (
        Math.abs(target.current.x - current.current.x) > 0.1 ||
        Math.abs(target.current.y - current.current.y) > 0.1
      ) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      target.current = { x: relX * strength, y: relY * strength };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    const onLeave = () => {
      target.current = { x: 0, y: 0 };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, strength]);

  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      ref={ref}
      href={href}
      className={`${className} ${enabled ? "cursor-magnetic will-change-transform" : ""}`}
      style={{ transition: "transform 0.2s ease-out" }}
    >
      {children}
    </Tag>
  );
}

/* =============================== CursorGlow =============================== */

/** Halo radial qui suit le curseur à l'intérieur d'un conteneur (hero immersif). */
export function CursorGlow({
  children,
  className = "",
  color = "rgba(22, 163, 74, 0.18)",
  size = 480,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const perf = usePerfMode();
  const enabled = !reduced && fine && !perf;
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const animate = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      glow.style.transform = `translate3d(${current.x - size / 2}px, ${current.y - size / 2}px, 0)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    };

    container.addEventListener("pointermove", onMove);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      container.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, size]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {enabled && (
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-0 rounded-full will-change-transform"
          style={{
            width: size,
            height: size,
            background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
            opacity: 0,
            animation: "fadeIn 0.6s ease-out 0.3s forwards",
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ================================== Tilt ================================== */

interface TiltProps {
  children: ReactNode;
  className?: string;
  /** Intensité de l'inclinaison en degrés (défaut 8). */
  max?: number;
  style?: CSSProperties;
}

/** Inclinaison 3D au survol (cartes produit). perspective + rotateX/rotateY. */
export function Tilt({ children, className = "", max = 8, style }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const perf = usePerfMode();
  const enabled = !reduced && fine && !perf;
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const target = { rx: 0, ry: 0 };
    const current = { rx: 0, ry: 0 };

    const animate = () => {
      current.rx += (target.rx - current.rx) * 0.15;
      current.ry += (target.ry - current.ry) * 0.15;
      el.style.transform = `rotateX(${current.rx}deg) rotateY(${current.ry}deg)`;
      if (Math.abs(target.rx - current.rx) > 0.05 || Math.abs(target.ry - current.ry) > 0.05) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      target.ry = (px - 0.5) * 2 * max;
      target.rx = -(py - 0.5) * 2 * max;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    const onLeave = () => {
      target.rx = 0;
      target.ry = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, max]);

  // La className du caller (ex. `h-full`, `aspect-[4/5]`) doit vivre sur le CONTENEUR extérieur pour
  // que la hauteur s'étire dans une grille ; l'élément incliné remplit ce conteneur (`h-full`).
  // Sinon, quand l'effet est actif, le wrapper « perspective » retombait à la hauteur du contenu et
  // les cartes d'une même rangée n'étaient plus égales.
  return (
    <div className={`${className} ${enabled ? "perspective" : ""}`} style={style}>
      <div
        ref={ref}
        className="preserve-3d h-full transition-transform duration-200 ease-out will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}

/* Animation fadeIn injectée une fois (utilisée par CursorGlow). */
const styleEl = typeof document !== "undefined" ? document.createElement("style") : null;
if (styleEl && typeof document !== "undefined" && !document.getElementById("motion-primitives-style")) {
  styleEl.id = "motion-primitives-style";
  styleEl.textContent = `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
  document.head.appendChild(styleEl);
}

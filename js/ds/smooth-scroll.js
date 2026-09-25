// Inertial scrolling via Lenis, plus a tiny pub/sub so other modules can react
// to every scroll frame without each one adding its own listener.
// Falls back to native scrolling when the visitor prefers reduced motion.
import Lenis from "./vendor/lenis.mjs";

const listeners = new Set();
let lenis = null;

export const onScroll = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

const emit = (state) => listeners.forEach((fn) => fn(state));

export function initSmoothScroll({ offset = -88 } = {}) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    const tick = () => emit({ y: scrollY, velocity: 0, direction: 0 });
    addEventListener("scroll", tick, { passive: true });
    tick();
    return null;
  }

  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });

  // In-page anchors glide instead of jumping. Hashes that aren't element ids
  // (e.g. "#project/slug") are left to whoever else handles them.
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');           // may be an SVG <a>, which has no .hash
    const target = link && document.getElementById(decodeURIComponent(link.getAttribute("href").slice(1)));
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { offset });
  });
  lenis.on("scroll", (l) => emit({ y: l.scroll, velocity: l.velocity, direction: l.direction }));

  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  emit({ y: scrollY, velocity: 0, direction: 0 });
  return lenis;
}

// Modal UIs call these so the page underneath stops moving.
export const lockScroll = () => lenis?.stop();
export const unlockScroll = () => lenis?.start();

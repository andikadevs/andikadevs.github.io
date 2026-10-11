// Inertial scrolling via Lenis, plus a tiny pub/sub so other modules can react
// to every scroll frame without each one adding its own listener.
//
// Listeners run in two phases so a frame costs one layout, not one per module:
// each listener reads what it needs (getBoundingClientRect, offsetHeight…) and
// may return a function; those returned functions run after every listener has
// read, and are where the style writes go.
// Falls back to native scrolling when the visitor prefers reduced motion.
import Lenis from "./vendor/lenis.mjs";

const listeners = new Set();
let lenis = null;

export const onScroll = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

const emit = (state) => {
  const writes = [];
  listeners.forEach((fn) => { const write = fn(state); if (typeof write === "function") writes.push(write); });
  writes.forEach((write) => write());
};

export function initSmoothScroll({ offset = -88 } = {}) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(pointer: coarse), (max-width: 820px)").matches || ("ontouchstart" in window && !matchMedia("(pointer: fine)").matches);

  if (reduced || isTouch) {
    let ticking = false;
    let lastY = scrollY;
    const tick = () => {
      const y = scrollY;
      const velocity = y - lastY;
      lastY = y;
      emit({ y, velocity, direction: Math.sign(velocity) });
      ticking = false;
    };
    const onScrollNative = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tick);
      }
    };
    addEventListener("scroll", onScrollNative, { passive: true });
    tick();

    // In-page anchors glide natively
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      const target = link && document.getElementById(decodeURIComponent(link.getAttribute("href").slice(1)));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });

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
export const lockScroll = () => {
  if (lenis) lenis.stop();
  else document.documentElement.classList.add("scroll-locked");
};
export const unlockScroll = () => {
  if (lenis) lenis.start();
  else document.documentElement.classList.remove("scroll-locked");
};


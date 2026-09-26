// The mascot rests beside the hero headline and, as you scroll, glides to the
// nav's top-left corner, shrinking to nav size; there it stays as the home link.
// On a fresh load it first says hello: drops in from above to the middle of the
// screen, hops with a speech bubble, then flies back to its spot. Scrolling
// during the welcome sends it home straight away, from wherever it is.
import { onScroll } from "../ds/smooth-scroll.js";

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const ease = (t) => t * t * (3 - 2 * t);                                   // smoothstep
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;    // lands with a small overshoot
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), size: lerp(a.size, b.size, t) });

const DROP = 1100, HOLD = 1500, HOME = 1100;                                // welcome timeline, ms

export function initMascotFly(fly, anchor, dock, bubble) {
  if (!fly || !anchor || !dock) return;
  const skies = [...document.querySelectorAll(".blueprint")];
  const hero = anchor.closest(".hero");

  // Where the mascot rests, in page coordinates, measured without the hero's
  // scroll-lift, so the flight is one clean glide across the screen instead of
  // following the spot as it scrolls away.
  let rest = null;
  const measure = () => {
    hero?.classList.add("is-measuring");
    const r = anchor.getBoundingClientRect();
    hero?.classList.remove("is-measuring");
    rest = { left: r.left + scrollX, top: r.top + scrollY, width: r.width };
  };

  // Scroll pose: from the resting spot (t = 0) to the nav dock (t = 1).
  const scrollPose = () => {
    if (!rest) measure();
    const d = dock.getBoundingClientRect();
    const t = ease(clamp01(scrollY / (innerHeight * 0.45)));
    return { x: lerp(rest.left, d.left, t), y: lerp(rest.top, d.top, t), size: lerp(rest.width, d.width, t), t };
  };

  const apply = ({ x, y, size }, t) => {
    fly.style.width = `${rest.width}px`;
    fly.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(size / rest.width).toFixed(4)})`;
    const cx = x + size / 2, cy = y + size / 2;                              // white over sky, shadowed over paper
    const onSky = skies.some((el) => { const r = el.getBoundingClientRect(); return cx > r.left && cx < r.right && cy > r.top && cy < r.bottom; });
    fly.classList.toggle("is-on-paper", !onSky);
    fly.classList.toggle("is-docked", t > 0.98);
    fly.classList.add("is-placed");
  };

  // ---- Welcome ------------------------------------------------------------
  let intro = null;                                                        // { start, from? }
  const stage = () => {
    const size = Math.min(Math.max(rest.width * 1.6, 200), innerWidth * 0.62, innerHeight * 0.52, 520);   // big for the hello; shrinks back on the way home
    return { x: innerWidth / 2 - size / 2, y: innerHeight / 2 - size / 2 + size * 0.12, size };
  };
  const introPose = (home) => {
    const e = performance.now() - intro.start, s = stage();
    const above = { ...s, y: -s.size * 1.4 };
    const hello = e >= DROP && e < DROP + HOLD;
    fly.classList.toggle("is-hello", hello);
    if (bubble) {
      bubble.classList.toggle("is-on", hello && e < DROP + HOLD - 200);
      bubble.style.left = `${(s.x + s.size * 0.38).toFixed(1)}px`;          // left/top, so the pop-in scale doesn't move it
      bubble.style.top = `${(s.y - s.size * 0.1).toFixed(1)}px`;            // clear of the packet above its head
      bubble.style.fontSize = `${Math.min(Math.max(s.size * 0.075, 17), 30).toFixed(1)}px`;   // grows with the mascot
    }
    if (e < DROP) return mix(above, s, easeOutBack(clamp01(e / DROP)));
    if (e < DROP + HOLD) return s;
    const k = (e - DROP - HOLD) / HOME;
    if (k < 1) return mix(intro.from ?? s, home, easeInOut(k));
    intro = null;
    return home;
  };
  const cutToHome = () => {                                                // user scrolled: go home now, no jump
    if (!intro) return;
    const e = performance.now() - intro.start;
    if (e >= DROP + HOLD) return;
    const s = stage();
    intro.from = e < DROP ? mix({ ...s, y: -s.size * 1.4 }, s, easeOutBack(clamp01(e / DROP))) : s;
    intro.start = performance.now() - DROP - HOLD;
  };

  const place = () => {
    const home = scrollPose();
    apply(intro ? introPose(home) : home, intro ? 0 : home.t);
  };

  const remeasure = () => { rest = null; place(); };
  onScroll(() => { if (scrollY > 4) cutToHome(); place(); });
  addEventListener("resize", remeasure);
  new ResizeObserver(remeasure).observe(anchor);
  document.fonts?.ready.then(remeasure);

  const welcome = !matchMedia("(prefers-reduced-motion: reduce)").matches && scrollY < 4 && !location.hash;
  if (welcome) {
    intro = { start: performance.now() + 250 };                            // a beat after first paint
    const tick = () => { place(); if (intro) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  } else {
    fly.classList.add("is-entering");
  }
  place();
}

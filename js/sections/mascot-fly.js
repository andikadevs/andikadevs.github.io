// The mascot rests beside the hero headline and, as you scroll, glides to the
// nav's top-left corner, shrinking to nav size; there it stays as the home link.
// On a fresh load it first says hello: drops in from above to the middle of the
// screen, hops with a speech bubble, then flies back to its spot. Scrolling
// during the welcome sends it home straight away, from wherever it is. At the
// end of the page it leaves the dock again and glides down into the footer
// wordmark, where it becomes the wordmark's mark (the drawn one hides), so there
// is only ever one of it. Both flights are tied to the scroll, so they run as
// smoothly as the scroll itself and reverse when you scroll back.
// Sounds follow the flight: falling in, the whoosh home, landing, and a whoosh
// whenever scrolling carries it off to the nav or back.
import { onScroll } from "../ds/smooth-scroll.js";
import { placeBubble } from "./mascot-bubble.js";
import { sfx } from "./sound-fx.js";

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const ease = (t) => t * t * (3 - 2 * t);                                   // smoothstep
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;    // lands with a small overshoot
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), size: lerp(a.size, b.size, t) });

const DROP = 1100, HOLD = 1500, HOME = 1100;                                // welcome timeline, ms
// The welcome's sounds, in ms on the same timeline. fall-in hits 0.66 s in and
// the drop reaches the stage about 0.5 s in, so it starts a little early.
const BEATS = [[-160, "fall-in"], [DROP + HOLD, "whoosh"], [DROP + HOLD + HOME - 60, "land", { volume: 0.6 }]];
const panAt = (x, size) => ((x + size / 2) / innerWidth - 0.5) * 0.8;       // left/right follows the mascot

export function initMascotFly(fly, anchor, dock, bubble, ready = Promise.resolve()) {
  if (!fly || !anchor || !dock) return;
  const skies = [...document.querySelectorAll(".blueprint, .footer")];   // white over the sky and the sea
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

  // The footer wordmark's mark, in viewport pixels, as a pose for the mascot:
  // both are the same drawing, so line up their rings (centre and radius),
  // read from the SVGs' own geometry (viewBox + group transform + circle).
  const wm = document.querySelector(".wm");
  const ringOf = (svg) => {
    const ring = svg?.querySelector(".mk-ring");
    if (!ring) return null;
    const m = ring.parentNode.transform?.baseVal.consolidate()?.matrix ?? { e: 0, f: 0 };
    const vb = svg.viewBox.baseVal;
    return { x: ring.cx.baseVal.value + m.e - vb.x, y: ring.cy.baseVal.value + m.f - vb.y, r: ring.r.baseVal.value, w: vb.width };
  };
  const own = ringOf(fly.querySelector("svg")), mark = ringOf(wm);
  if (own && mark) wm.classList.add("has-tejo");
  const footerPose = () => {
    const box = wm.getBoundingClientRect(), k = box.width / mark.w;       // px per wordmark unit
    const size = (mark.r * k) / (own.r / own.w);                           // same ring radius
    return { x: box.left + mark.x * k - (own.x / own.w) * size, y: box.top + mark.y * k - (own.y / own.w) * size, size };
  };
  const FOOTER = 0.8;                                                      // of a screen: how long the glide down lasts

  // Scroll pose: from the resting spot (t = 0) to the nav dock (t = 1), then,
  // over the page's last FOOTER screens, from the dock into the wordmark (f = 0 → 1).
  const scrollPose = () => {
    if (!rest) measure();
    const d = dock.getBoundingClientRect();
    const t = ease(clamp01(scrollY / (innerHeight * 0.45)));
    const home = { x: lerp(rest.left, d.left, t), y: lerp(rest.top, d.top, t), size: lerp(rest.width, d.width, t), t, f: 0 };
    if (!own || !mark) return home;
    const left = document.documentElement.scrollHeight - innerHeight - scrollY;
    const f = easeInOut(clamp01(1 - left / (innerHeight * FOOTER)));
    return f > 0 ? { ...mix(home, footerPose(), f), t, f } : home;
  };

  // Reads (layout) and writes (styles) are kept apart, so a scroll frame costs one layout.
  const onSkyAt = ({ x, y, size }) => {                                      // white over sky, shadowed over paper
    const cx = x + size / 2, cy = y + size / 2;
    return skies.some((el) => { const r = el.getBoundingClientRect(); return cx > r.left && cx < r.right && cy > r.top && cy < r.bottom; });
  };
  const write = ({ x, y, size, f = 0 }, t, onSky) => {
    fly.style.width = `${rest.width}px`;
    fly.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(size / rest.width).toFixed(4)})`;
    fly.classList.toggle("is-on-paper", !onSky);
    fly.classList.toggle("is-docked", t > 0.98 && f < 0.02);
    fly.classList.toggle("is-in-footer", f > 0.6);                          // takes on the wordmark's colours
    fly.classList.add("is-placed");
  };
  const apply = (pose, t) => write(pose, t, onSkyAt(pose));

  // ---- Welcome ------------------------------------------------------------
  let intro = null;                                                        // { start, from?, beat }
  const stage = () => {
    const size = Math.min(Math.max(rest.width * 1.6, 200), innerWidth * 0.62, innerHeight * 0.52, 520);   // big for the hello; shrinks back on the way home
    return { x: innerWidth / 2 - size / 2, y: innerHeight / 2 - size / 2 + size * 0.12, size };
  };
  const introPose = (home) => {
    const e = performance.now() - intro.start, s = stage();
    const above = { ...s, y: -s.size * 1.4 };
    const hello = e >= DROP && e < DROP + HOLD;
    fly.classList.toggle("is-hello", hello);
    while (BEATS[intro.beat] && e >= BEATS[intro.beat][0]) {
      const [, name, options] = BEATS[intro.beat++];
      sfx(name, options);
    }
    if (bubble) {
      const was = bubble.classList.contains("is-on");
      bubble.classList.toggle("is-on", hello && e < DROP + HOLD - 200);
      if (!was && bubble.classList.contains("is-on")) sfx("bubble-pop");
      if (hello) placeBubble(bubble, s);
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
    intro.beat = 1;                                                        // skip the fall-in, play the whoosh home
  };

  const place = () => {
    const home = scrollPose();
    apply(intro ? introPose(home) : home, intro ? 0 : home.t);
  };

  const remeasure = () => { rest = null; place(); };
  // Scrolling off the resting spot or out of the dock is a flight: one whoosh
  // per trip (it can't restart for a moment), and a soft landing in the nav.
  let lastT = scrollY < 4 ? 0 : null, flewAt = 0;                         // a fresh load starts at the resting spot
  const flightSound = ({ x, size, t }) => {
    const left = lastT !== null && ((lastT < 0.03 && t >= 0.03) || (lastT > 0.97 && t <= 0.97));
    if (left && performance.now() - flewAt > 1200) { flewAt = performance.now(); sfx("whoosh", { volume: 0.55, pan: panAt(x, size) }); }
    if (lastT !== null && lastT <= 0.98 && t > 0.98) sfx("land", { volume: 0.35, pan: panAt(x, size) });
    lastT = t;
  };
  onScroll(() => {
    if (scrollY > 4) cutToHome();
    if (intro) return;                                                     // the welcome's own loop is placing it
    const home = scrollPose(), onSky = onSkyAt(home);                      // read…
    flightSound(home);
    return () => write(home, home.t, onSky);                               // …then write
  });
  addEventListener("resize", remeasure);
  new ResizeObserver(remeasure).observe(anchor);
  document.fonts?.ready.then(remeasure);

  const welcome = !matchMedia("(prefers-reduced-motion: reduce)").matches && scrollY < 4 && !location.hash;
  if (welcome) {
    intro = { start: Infinity, beat: 0 };                                          // waits above the screen until the loader is done
    ready.then(() => { if (intro && intro.start === Infinity) intro.start = performance.now() + 700; });   // once the wipe has mostly cleared
    const tick = () => { place(); if (intro) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  } else {
    fly.classList.add("is-entering");
  }
  place();
}

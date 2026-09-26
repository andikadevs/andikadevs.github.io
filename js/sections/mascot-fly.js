// The mascot rests above the hero headline and, as you scroll, glides to the
// nav's top-left corner, shrinking to nav size; there it stays as the home link.
// Over the sky it's white; docked over the cream page it turns dark.
import { onScroll } from "../ds/smooth-scroll.js";

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const ease = (t) => t * t * (3 - 2 * t);                    // smoothstep
const lerp = (a, b, t) => a + (b - a) * t;

export function initMascotFly(fly, anchor, dock) {
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

  const place = () => {
    if (!rest) measure();
    const a = rest;
    const d = dock.getBoundingClientRect();
    const t = ease(clamp01(scrollY / (innerHeight * 0.45)));
    const size = lerp(a.width, d.width, t);
    fly.style.width = `${a.width}px`;
    fly.style.transform = `translate(${lerp(a.left, d.left, t).toFixed(1)}px, ${lerp(a.top, d.top, t).toFixed(1)}px) scale(${(size / a.width).toFixed(4)})`;

    // Dark when the spot it's sitting on isn't sky.
    const cx = lerp(a.left, d.left, t) + size / 2, cy = lerp(a.top, d.top, t) + size / 2;
    const onSky = skies.some((el) => { const r = el.getBoundingClientRect(); return cx > r.left && cx < r.right && cy > r.top && cy < r.bottom; });
    fly.classList.toggle("is-on-paper", !onSky);
    fly.classList.toggle("is-docked", t > 0.98);
  };

  const remeasure = () => { rest = null; place(); };
  onScroll(place);
  addEventListener("resize", remeasure);
  new ResizeObserver(remeasure).observe(anchor);
  document.fonts?.ready.then(remeasure);
  place();
}

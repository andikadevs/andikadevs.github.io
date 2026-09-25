// Writes scroll position into CSS so effects can be authored in stylesheets:
//   [data-scroll]         --p 0 → 1 while the element travels up through the viewport
//   [data-scroll="exit"]  --p 0 → 1 as an element that starts on screen scrolls away
//   :root                 --page (0 → 1) and --velocity (−1 → 1, eased)
// Call watchScroll() again after rendering new [data-scroll] elements.
import { onScroll } from "./smooth-scroll.js";

const round = (n) => Math.round(n * 1000) / 1000;
const clamp01 = (n) => Math.min(1, Math.max(0, n));

const PROGRESS = {
  exit: (top, height) => -top / height,
  default: (top, height, vh) => (vh - top) / (vh + height),
};

const active = new Set();
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => (e.isIntersecting ? active.add(e.target) : active.delete(e.target))),
  { rootMargin: "25% 0px" },
);

function measure(el, vh) {
  const { top, height } = el.getBoundingClientRect();
  const progress = PROGRESS[el.dataset.scroll] ?? PROGRESS.default;
  el.style.setProperty("--p", round(clamp01(progress(top, height, vh))));
}

export function watchScroll(root = document) {
  root.querySelectorAll("[data-scroll]").forEach((el) => {
    io.observe(el);
    measure(el, innerHeight);   // correct value before the first frame
  });
}

export function initScrollProgress() {
  const html = document.documentElement;
  let velocity = 0;

  onScroll(({ y, velocity: v }) => {
    const vh = innerHeight;
    active.forEach((el) => measure(el, vh));
    velocity += (Math.max(-1, Math.min(1, v / 40)) - velocity) * 0.2;
    html.style.setProperty("--velocity", round(velocity));
    html.style.setProperty("--page", round(clamp01(y / Math.max(html.scrollHeight - vh, 1))));
  });
  watchScroll();
}

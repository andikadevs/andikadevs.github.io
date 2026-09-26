// Writes scroll position into CSS so effects can be authored in stylesheets:
//   [data-scroll]         --p 0 → 1 while the element travels up through the viewport
//   [data-scroll="exit"]  --p 0 → 1 as an element that starts on screen scrolls away
//   [data-scroll-page]    --page (0 → 1 down the whole document)
//   [data-scroll-velocity] --velocity (−1 → 1, eased)
// (Page-wide values go only on the elements that ask for them: written on :root
// they'd restyle the entire document every frame.)
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

const progressOf = (el, vh) => {
  const { top, height } = el.getBoundingClientRect();
  return round(clamp01((PROGRESS[el.dataset.scroll] ?? PROGRESS.default)(top, height, vh)));
};
const last = new WeakMap();                     // skip writes when nothing changed
const write = (el, name, value) => {
  if (last.get(el)?.[name] === value) return;
  last.set(el, { ...last.get(el), [name]: value });
  el.style.setProperty(name, value);
};
const measure = (el, vh) => write(el, "--p", progressOf(el, vh));

export function watchScroll(root = document) {
  root.querySelectorAll("[data-scroll]").forEach((el) => {
    io.observe(el);
    measure(el, innerHeight);   // correct value before the first frame
  });
}

export function initScrollProgress() {
  const html = document.documentElement;
  const pageEls = [...document.querySelectorAll("[data-scroll-page]")];
  const velocityEls = [...document.querySelectorAll("[data-scroll-velocity]")];
  let velocity = 0;

  onScroll(({ y, velocity: v }) => {
    const vh = innerHeight;
    const progress = [...active].map((el) => [el, progressOf(el, vh)]);          // read…
    const page = round(clamp01(y / Math.max(html.scrollHeight - vh, 1)));
    velocity += (Math.max(-1, Math.min(1, v / 40)) - velocity) * 0.2;
    const vel = round(velocity);
    return () => {                                                               // …then write
      progress.forEach(([el, p]) => write(el, "--p", p));
      pageEls.forEach((el) => write(el, "--page", page));
      velocityEls.forEach((el) => write(el, "--velocity", vel));
    };
  });
  watchScroll();
}

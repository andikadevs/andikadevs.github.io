// Horizontal scroll with jelly cards.
//   Wide screens: the section pins while vertical scroll drives its track
//   sideways (eased, so it glides with Lenis). Narrow screens: the track is a
//   native swipeable row. Either way every card hangs on its own spring: track
//   speed pushes a skew, and the spring overshoots and settles when it stops.
//
//   <section data-hscroll>
//     <div class="hscroll__sticky">
//       … [data-hscroll-count] … <span class="hscroll__bar"></span>
//       <div class="hscroll__viewport"><div class="hscroll__track">cards…</div></div>
//     </div>
//   </section>
import { onScroll } from "./smooth-scroll.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad = (n) => String(n).padStart(2, "0");
const WIDE = "(min-width: 761px)";

function springsFor(cards, springs) {
  while (springs.length < cards.length) {
    const i = springs.length;
    springs.push({ s: 0, v: 0, k: 0.08 + (i % 3) * 0.02, d: 0.82 + (i % 2) * 0.04 });   // each card a bit different
  }
  return springs;
}

export function initHScroll(section) {
  if (!section) return;
  const viewport = section.querySelector(".hscroll__viewport");
  const track = section.querySelector(".hscroll__track");
  const bar = section.querySelector(".hscroll__bar");
  const count = section.querySelector("[data-hscroll-count]");
  if (!viewport || !track) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const springs = [];
  let dist = 0, x = 0, target = 0, last = 0, lastRow = 0;

  const setMeta = (p) => {
    const cards = track.children.length;
    bar?.style.setProperty("--p", p.toFixed(4));
    if (count) count.textContent = `${pad(Math.min(cards, 1 + Math.floor(p * cards * 0.999)))} / ${pad(cards)}`;
  };

  const jiggle = (velocity) => {
    const cards = [...track.children];
    springsFor(cards, springs);
    const push = clamp(-velocity * 0.35, -9, 9);   // lean into the direction of travel
    cards.forEach((card, i) => {
      const sp = springs[i];
      sp.v = (sp.v + (push - sp.s) * sp.k) * sp.d;
      sp.s += sp.v;
      const still = Math.abs(sp.s) < 0.01 && Math.abs(sp.v) < 0.01;
      card.style.transform = still ? "" : `skewX(${sp.s.toFixed(2)}deg) rotate(${(sp.s * 0.12).toFixed(2)}deg)`;
    });
  };

  const size = () => {
    const wide = matchMedia(WIDE).matches && !reduced;
    section.classList.toggle("is-pinned", wide);
    if (!wide) { section.style.height = ""; track.style.transform = ""; return; }
    dist = Math.max(0, track.scrollWidth - viewport.clientWidth);
    section.style.height = `${innerHeight + dist}px`;
  };
  size();
  new ResizeObserver(size).observe(track);
  addEventListener("resize", size);

  onScroll(() => {
    if (!section.classList.contains("is-pinned")) return;
    const { top } = section.getBoundingClientRect();
    const p = clamp(-top / Math.max(section.offsetHeight - innerHeight, 1), 0, 1);
    target = p * dist;
    setMeta(p);
  });

  viewport.addEventListener("scroll", () => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    setMeta(max > 0 ? viewport.scrollLeft / max : 0);
  }, { passive: true });

  if (reduced) { setMeta(0); return; }

  // One loop: ease the track toward its target (pinned) and feed the springs
  // with whichever movement is happening (pinned track or native row).
  const frame = () => {
    let velocity;
    if (section.classList.contains("is-pinned")) {
      x += (target - x) * 0.12;
      track.style.transform = `translate3d(${(-x).toFixed(2)}px, 0, 0)`;
      velocity = x - last;
      last = x;
    } else {
      velocity = viewport.scrollLeft - lastRow;
      lastRow = viewport.scrollLeft;
    }
    jiggle(velocity);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  setMeta(0);
}

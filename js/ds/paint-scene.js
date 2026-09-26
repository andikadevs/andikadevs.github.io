// Paint scene: the section before it holds still while a brush stroke paints
// the whole screen from the top-left to the bottom-right, then the page moves
// on into the next section, already in the painted colour.
//
//   <div data-paint-scene>
//     <section data-paint-hold>…</section>          pinned while painting
//     <div class="paint-scene__canvas"><svg>…<path class="paint-scene__stroke" pathLength="1"/></svg></div>
//     <div class="paint-scene__run"></div>           scroll distance the painting takes
//   </div>
//
// Writes --paint (0 → 1) on the scene; CSS turns it into stroke-dashoffset.
import { onScroll } from "./smooth-scroll.js";

const clamp01 = (n) => Math.min(1, Math.max(0, n));

export function initPaintScenes(root = document) {
  root.querySelectorAll("[data-paint-scene]").forEach((scene) => {
    const hold = scene.querySelector("[data-paint-hold]");
    const run = scene.querySelector(".paint-scene__run");
    if (!hold || !run) return;

    // Pin the held section by its bottom edge: sticky with a top that leaves
    // exactly its own height on screen (negative when it's taller than the viewport).
    const pin = () => scene.style.setProperty("--hold-top", `${Math.min(0, innerHeight - hold.offsetHeight)}px`);
    pin();
    new ResizeObserver(pin).observe(hold);
    addEventListener("resize", pin);

    let painted = "";
    onScroll(() => {
      const { top, height } = run.getBoundingClientRect();
      // 0 when the run starts entering from the bottom, 1 when it has fully passed the top.
      const progress = clamp01((innerHeight - top) / (height + innerHeight * 0.0001)).toFixed(4);
      if (progress === painted) return;
      return () => { painted = progress; scene.style.setProperty("--paint", progress); };
    });
  });
}

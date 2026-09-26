// Scroll-reactive marquee: drifts on its own, speeds up with scroll velocity,
// and flips direction when the visitor scrolls back up.
// Without motion it falls back to a static row.
import { onScroll } from "./smooth-scroll.js";

export function initMarquees(root = document, { speed = 0.6 } = {}) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.querySelectorAll(".marquee").forEach((marquee) => {
    const track = marquee.querySelector(".marquee__track");
    if (!track || marquee.dataset.ready) return;
    marquee.dataset.ready = "true";
    const clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    marquee.append(clone);
    if (reduced) return;

    marquee.classList.add("is-driven");
    let x = 0;
    let direction = 1;
    let boost = 0;

    onScroll(({ velocity, direction: d }) => {
      if (d) direction = d;
      boost = Math.min(Math.abs(velocity) * 0.6, 14);
    });

    // Width is cached (measuring every frame forces a layout), and the loop only
    // runs while the marquee is on screen.
    let width = track.offsetWidth, visible = false, running = false;
    new ResizeObserver(() => { width = track.offsetWidth; }).observe(track);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !running) { running = true; requestAnimationFrame(frame); }
    }).observe(marquee);

    const frame = () => {
      if (!visible) { running = false; return; }
      x -= (speed + boost) * direction;
      if (width) x = ((x % width) - width) % width;   // keep x within (−width, 0]
      marquee.style.setProperty("--x", `${x}px`);
      boost *= 0.94;
      requestAnimationFrame(frame);
    };
  });
}

// Page-wide sound cues that don't belong to one section: each section heading
// gets a text-reveal as its words rise in (once per heading, when reveal.js
// marks it .is-in), and a nav jump between sections gets the sheet sliding over.
import { sfx, sfxOnce } from "./sound-fx.js";

export function initSoundCues(nav) {
  const headings = document.querySelectorAll("h2[data-split][data-reveal], h2 > [data-reveal]:first-child");   // split headings, and ones revealed line by line
  const rise = new MutationObserver((changes) => changes.forEach(({ target }) => {
    if (target.classList.contains("is-in")) sfxOnce(target, "text-reveal", { volume: 0.8 });
  }));
  headings.forEach((h) => rise.observe(h, { attributes: true, attributeFilter: ["class"] }));

  nav?.addEventListener("click", (event) => {
    const link = event.target.closest('a.nav-link[href^="#"]');
    if (link && document.querySelector(link.hash)) sfx("section-sheet", { volume: 0.8 });
  });
}

// Glass nav pill: frosts after the first scroll, collapses while scrolling down,
// marks the link of the section in view, and writes "03 / 06 — Work" into any
// [data-nav-readout] so the compact pill says where you are. The number comes
// from the section's own .sheet__no label when it has one.
import { onScroll as onScrollFrame } from "./smooth-scroll.js";

const pad = (n) => String(n).padStart(2, "0");

export function initNav(nav, { compactAfter = 480 } = {}) {
  if (!nav) return;
  const links = [...nav.querySelectorAll('a.nav-link[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.hash)).filter(Boolean);
  const readout = nav.querySelector("[data-nav-readout]");
  let lastY = scrollY;

  // Reads link text on every pass, so a language switch is picked up for free.
  const updateReadout = () => {
    const i = links.findIndex((a) => a.getAttribute("aria-current") === "true");
    if (!readout || i < 0) return;
    const number = sections[i]?.querySelector(".sheet__no")?.textContent ?? `${pad(i + 1)} / ${pad(links.length)}`;
    const label = links[i].querySelector(".roll__a")?.textContent ?? links[i].textContent;   // rolled links hold the text twice
    const text = `${number} — ${label}`;
    if (readout.textContent !== text) readout.textContent = text;
  };

  // Runs in the scroll feed's write phase with the position it already has, so
  // it never reads scrollY after other modules have written styles this frame.
  const apply = (y) => {
    nav.classList.toggle("is-scrolled", y > 24);
    nav.classList.toggle("is-compact", y > compactAfter && y > lastY);
    lastY = y;
    updateReadout();
  };

  const spy = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.setAttribute("aria-current", String(a.hash === `#${entry.target.id}`)));
      updateReadout();
    }),
    { rootMargin: "-45% 0px -50% 0px" },
  );
  sections.forEach((section) => spy.observe(section));

  onScrollFrame(({ y }) => () => apply(y));
  apply(scrollY);
}

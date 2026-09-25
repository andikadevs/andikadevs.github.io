// Footer wordmark: plays when it scrolls into view and rewinds when it leaves.
// Its second "a" is a door: hover, tap or focus it and it turns into an "@",
// and social cards spread out of it along an arc. They fold back in when the
// pointer leaves (with a short grace period so you can reach them).
import { html, render } from "../core/dom.js";
import { profile } from "../data/profile.js";

const ARC = { from: -152, to: -28, radius: 1.3 };      // degrees (0 = right, −90 = up), radius in wordmark heights; ends stay above the letters

function cards() {
  const links = [...profile.socials, { label: "Email", handle: profile.email, url: `mailto:${profile.email}` }];
  return links.map((s, k) => {
    const t = links.length > 1 ? k / (links.length - 1) : 0.5;
    const deg = ARC.from + (ARC.to - ARC.from) * t;
    return { ...s, k, deg, tilt: (t - 0.5) * 10 };
  });
}

const card = (c) => html`
  <a class="wm-card" href="${c.url}" ${c.url.startsWith("mailto:") ? "" : html`target="_blank" rel="noopener"`}
     style="--k:${c.k}; --deg:${c.deg}; --r:${c.tilt.toFixed(1)}deg" tabindex="-1">
    <b>${c.label}</b><small>${c.handle}</small>
  </a>`;

export function initWordmark(wrapper) {
  const svg = wrapper?.querySelector(".wm");
  const hit = wrapper?.querySelector("[data-wm-hit]");
  const spread = wrapper?.querySelector("[data-wm-spread]");
  if (!svg) return;

  new IntersectionObserver(([entry]) => svg.classList.toggle("is-in", entry.isIntersecting), { threshold: 0.35 }).observe(svg);
  if (!hit || !spread) return;

  const items = cards();
  render(spread, items.map(card));

  // Place the spread on the @'s centre, and each card on the arc around it (px).
  const layout = () => {
    const [cx, cy, vw, vh] = svg.dataset.at.split(",").map(Number);
    const box = svg.getBoundingClientRect(), host = wrapper.getBoundingClientRect();
    const x = box.left - host.left + (cx / vw) * box.width;
    const y = box.top - host.top + (cy / vh) * box.height;
    const r = Math.max(box.height * ARC.radius, 150);
    spread.style.setProperty("--ax", `${x}px`);
    spread.style.setProperty("--ay", `${y}px`);
    const narrow = host.width < 640;
    [...spread.children].forEach((el, i) => {
      const a = (items[i].deg * Math.PI) / 180;
      // Keep every card fully on screen: clamp its centre inside the wrapper.
      const half = el.offsetWidth / 2 + 8;
      const want = x + Math.cos(a) * r * (narrow ? 0.9 : 1.25);
      const cx = Math.min(Math.max(want, half), host.width - half);
      el.style.setProperty("--dx", `${(cx - x).toFixed(1)}px`);
      el.style.setProperty("--dy", `${(Math.sin(a) * r * (narrow ? 1.35 : 1)).toFixed(1)}px`);
    });
  };

  let closeTimer = 0;
  let openedAt = 0;
  const setOpen = (open) => {
    clearTimeout(closeTimer);
    if (open && !spread.classList.contains("is-open")) openedAt = performance.now();
    if (open) layout();
    svg.classList.toggle("is-at", open);
    spread.classList.toggle("is-open", open);
    hit.setAttribute("aria-expanded", String(open));
    [...spread.children].forEach((a) => a.setAttribute("tabindex", open ? "0" : "-1"));
  };
  const closeSoon = () => { clearTimeout(closeTimer); closeTimer = setTimeout(() => setOpen(false), 280); };

  // Mouse: hover opens, leaving closes. Touch fires enter/leave around every tap,
  // so it's left to click alone (tap toggles, tapping elsewhere closes).
  const mouse = (fn) => (e) => { if (e.pointerType !== "touch") fn(); };
  hit.addEventListener("pointerenter", mouse(() => setOpen(true)));
  hit.addEventListener("pointerleave", mouse(closeSoon));
  spread.addEventListener("pointerenter", mouse(() => clearTimeout(closeTimer)));
  spread.addEventListener("pointerleave", mouse(closeSoon));
  hit.addEventListener("click", () => {
    if (performance.now() - openedAt < 450) return;           // the click that follows a hover-open
    setOpen(!spread.classList.contains("is-open"));
  });
  hit.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); spread.querySelector("a")?.focus(); } });
  wrapper.addEventListener("focusout", (e) => { if (!wrapper.contains(e.relatedTarget)) closeSoon(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  // Touch: a tap anywhere outside the @ and its cards folds them back.
  document.addEventListener("pointerdown", (e) => {
    if (spread.classList.contains("is-open") && !spread.contains(e.target) && e.target !== hit) setOpen(false);
  });
  addEventListener("resize", () => spread.classList.contains("is-open") && layout());
}

// Studio (sheet 04): pointer depth. Moving over the section writes --mx/--my
// (−1…1, eased) on the stage, so the window tilts toward the pointer and the
// balloons drift at their own depths (site.css turns the numbers into motion).
// Catching a balloon or the window gives a small pop. Fine pointers only, and
// nothing under reduced motion. The window shows a screenshot of the studio's
// site (swapped per language by i18n); resting a mouse on it loads the live
// site in an iframe (scaled from a 1440 × 900 viewport to the card's width,
// unclickable, unable to navigate the page) and fades it in over the picture.
// Leaving fades back and drops the iframe, so its video stops too. A link over
// the window opens the site. Touch screens keep the screenshot.
import { sfx } from "./sound-fx.js";
import { lang } from "../core/i18n.js";

const SITE = "https://www.manggala.cloud";

const LIVE = 250, DROP = 700;                     // ms: rest before going live; linger before dropping the iframe

function initWindow(stage) {
  const win = stage.querySelector(".studio__window");
  const view = stage.querySelector("[data-studio-view]");
  const shot = view?.querySelector("img");
  if (!win || !view) return;
  const loaded = () => view.classList.add("is-loaded");
  shot?.complete ? loaded() : shot?.addEventListener("load", loaded, { once: true });
  new ResizeObserver(([entry]) => view.style.setProperty("--k", (entry.contentRect.width / 1440).toFixed(4))).observe(view);

  let frame = null, timer = 0;
  const drop = () => { view.classList.remove("is-live"); frame?.remove(); frame = null; };
  const live = () => {
    if (frame && frame.dataset.lang === lang()) return;
    drop();
    frame = document.createElement("iframe");
    frame.dataset.lang = lang();
    frame.src = `${SITE}/${lang() === "id" ? "id" : "en"}`;
    frame.title = "Manggala Cloud";
    frame.tabIndex = -1;
    frame.setAttribute("sandbox", "allow-scripts allow-same-origin");   // no top navigation, no popups
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.addEventListener("load", () => { if (win.matches(":hover")) view.classList.add("is-live"); }, { once: true });
    view.append(frame);
  };
  win.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(timer);
    if (frame?.dataset.lang === lang()) view.classList.add("is-live");   // still there from a moment ago
    else timer = setTimeout(live, LIVE);                              // a pass-over doesn't load it
  });
  win.addEventListener("pointerleave", () => {
    clearTimeout(timer);
    view.classList.remove("is-live");
    timer = setTimeout(drop, DROP);
  });
  document.addEventListener("langchange", drop);
}

export function initStudio(stage) {
  const section = stage?.closest("section");
  if (!section) return;
  stage.querySelectorAll(".studio__services li").forEach((chip) =>
    chip.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") sfx("ui-pop", { volume: 0.45, rate: 0.9 + Math.random() * 0.25 }); }));
  stage.querySelector(".studio__window")?.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") sfx("ui-pop-2", { volume: 0.5 }); });
  initWindow(stage);

  if (!matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
  let target = { x: 0, y: 0 }, now = { x: 0, y: 0 }, frame = 0;
  const tick = () => {
    now.x += (target.x - now.x) * 0.08;
    now.y += (target.y - now.y) * 0.08;
    stage.style.setProperty("--mx", now.x.toFixed(3));
    stage.style.setProperty("--my", now.y.toFixed(3));
    frame = Math.abs(target.x - now.x) + Math.abs(target.y - now.y) > 0.002 ? requestAnimationFrame(tick) : 0;
  };
  const aim = (x, y) => { target = { x, y }; if (!frame) frame = requestAnimationFrame(tick); };
  section.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect();
    const clamp = (n) => Math.max(-1, Math.min(1, n));
    aim(clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 0.75)), clamp((e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)));
  }, { passive: true });
  section.addEventListener("pointerleave", () => aim(0, 0));
}

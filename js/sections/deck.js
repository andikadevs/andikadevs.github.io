// Work ring: every project is a card on a half circle that fills the stage top
// to bottom. The active card faces the text at the ring's midpoint; neighbours
// follow the arc, leaning along it, smaller and softer. Positions come from one
// float (`pos`) each frame, so cards travel the real curve, a drag moves the
// ring continuously, a flick carries on with momentum, and it always settles on
// a card. Prev/next and arrow keys work too; the front card opens its case study.
import { html, render, $ } from "../core/dom.js";
import { pick, t } from "../core/i18n.js";
import { srcset } from "../core/media.js";
import { projects, DISCIPLINES } from "../data/projects.js";

const N = projects.length;
const STEP = 0.5;                                    // radians between neighbours on the ring
const TILT = 0.55;                                   // how much cards lean along the curve
const VISIBLE = 3.4;                                 // cards shown each side of the front one
const pad = (n) => String(n).padStart(2, "0");
// Same breakpoint as the two-column layout in site.css: beside the text = vertical ring.
const isWide = () => matchMedia("(min-width: 900px)").matches;
const wrap = (i) => ((i % N) + N) % N;

let pos = 0;           // animated, fractional
let target = 0;        // integer, may exceed N (wrapped on read)
let els = null;        // cached nodes, refreshed after each render

const card = (p, i) => html`
  <button class="deck-card" type="button" data-deck-card="${i}" tabindex="-1" aria-label="${pick(p.title)}">
    <span class="shot"><img src="${p.cover}" srcset="${srcset(p.cover)}" sizes="(min-width: 900px) 30vw, 72vw" alt="${t("work.shot")}: ${pick(p.title)} — ${pick(p.category)}" draggable="false" loading="${i < 3 ? "eager" : "lazy"}" decoding="async" width="1600" height="848"></span>
  </button>`;

const info = (p, i) => html`
  <article class="deck-info__item" data-deck-info="${i}" aria-hidden="true">
    <p class="label deck-info__meta">${pick(p.category)} · ${p.client} · ${p.year}</p>
    <h3 class="deck-info__title">${pick(p.title)}</h3>
    <p class="deck-info__text">${pick(p.summary)}</p>
    <div class="cluster">${p.disciplines.map((d) => html`<span class="chip chip--light">${pick(DISCIPLINES[d])}</span>`)}</div>
  </article>`;

export function renderDeck() {
  render($("[data-deck-cards]"), projects.map(card));
  render($("[data-deck-infos]"), projects.map(info));
  const total = $("[data-deck-total]");
  if (total) total.textContent = pad(N);
  els = null;
  place(true);
}

function nodes() {
  if (els) return els;
  const stage = $("[data-deck-stage]");
  els = {
    stage,
    cards: [...document.querySelectorAll("[data-deck-card]")],
    infos: [...document.querySelectorAll("[data-deck-info]")],
    current: $("[data-deck-current]"),
    open: $("[data-deck-open]"),
  };
  return els;
}

// Ring geometry: wide screens put the centre off to the right so the arc bulges
// left toward the text and spans the full stage height; narrow screens drop the
// centre below so the arc runs across the top.
function ring(w, h) {
  if (isWide()) {
    const r = h * 0.62;
    return { cx: w * 0.5 + r * 0.82, cy: h / 2, r, base: Math.PI };
  }
  const r = Math.max(w * 0.9, 340);
  return { cx: w / 2, cy: h * 0.42 + r, r, base: -Math.PI / 2 };
}

function place(force = false) {
  const { stage, cards, infos, current, open } = nodes();
  if (!stage || !cards.length) return;
  const { width: w, height: h } = stage.getBoundingClientRect();
  const g = ring(w, h);

  cards.forEach((el, i) => {
    const rel = wrap(i - pos + N / 2) - N / 2;       // shortest signed distance to the front
    const dist = Math.abs(rel);
    const a = g.base + rel * STEP;
    const x = g.cx + Math.cos(a) * g.r - w / 2;
    const y = g.cy + Math.sin(a) * g.r - h / 2;
    const scale = 1 - Math.min(dist, 3) * 0.13;
    const opacity = dist > VISIBLE ? 0 : 1 - (dist / VISIBLE) * 0.85;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(rel * STEP * TILT).toFixed(3)}rad) scale(${scale.toFixed(3)})`;
    el.style.opacity = opacity.toFixed(3);
    el.style.filter = dist > 0.05 ? `blur(${(Math.min(dist, 3) * 1.1).toFixed(2)}px)` : "none";
    el.style.zIndex = String(100 - Math.round(dist * 10));
    el.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
  });

  const active = wrap(Math.round(pos));
  if (force || current?.dataset.index !== String(active)) {
    if (current) { current.dataset.index = active; current.textContent = pad(active + 1); }
    infos.forEach((el, i) => {
      el.classList.toggle("is-active", i === active);
      el.setAttribute("aria-hidden", String(i !== active));
    });
    cards.forEach((el, i) => el.toggleAttribute("data-active", i === active));
    open?.setAttribute("data-project", projects[active].slug);
    open?.setAttribute("href", `#project/${projects[active].slug}`);
  }
}

// One rAF loop eases pos toward target and parks itself when it arrives.
let frame = 0;
function animate() {
  cancelAnimationFrame(frame);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tick = () => {
    const diff = target - pos;
    pos = reduced || Math.abs(diff) < 0.001 ? target : pos + diff * 0.12;
    place();
    if (pos !== target) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
}

const go = (delta) => { target = Math.round(target) + delta; animate(); };
const goTo = (index) => { target = Math.round(target) + (wrap(index - Math.round(target) + N / 2) - N / 2); animate(); };

export function initDeck(section) {
  if (!section) return;
  section.querySelector("[data-deck-prev]")?.addEventListener("click", () => go(-1));
  section.querySelector("[data-deck-next]")?.addEventListener("click", () => go(1));
  section.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go(-1); }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); go(1); }
  });

  // Clicking a side card brings it to the front; the front card opens its case study.
  section.addEventListener("click", (e) => {
    const cardEl = e.target.closest("[data-deck-card]");
    if (!cardEl || cardEl.hasAttribute("data-dragged")) return;
    const i = Number(cardEl.dataset.deckCard);
    if (i === wrap(Math.round(pos))) section.querySelector("[data-deck-open]")?.click();
    else goTo(i);
  });

  // Drag / swipe the deck. Velocity is tracked so a flick keeps going: on release
  // the target is pushed ahead by the throw, then eased in by animate().
  const stage = section.querySelector("[data-deck-stage]");
  const PX_PER_CARD = 150;
  let drag = null;
  stage?.addEventListener("dragstart", (e) => e.preventDefault());   // no native image ghost
  stage?.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();                                               // no text selection / image drag
    cancelAnimationFrame(frame);
    drag = { x: e.clientX, y: e.clientY, pos, moved: false, v: 0, lastX: e.clientX, lastY: e.clientY, lastT: performance.now() };
    stage.setPointerCapture?.(e.pointerId);
  });
  stage?.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const wide = isWide();   // ring runs vertically beside the text, horizontally when stacked
    const delta = wide ? (e.clientY - drag.y) : (drag.x - e.clientX);   // cards follow the pointer along the ring
    if (Math.abs(delta) > 5) drag.moved = true;
    if (!drag.moved) return;
    const now = performance.now(), dt = Math.max(now - drag.lastT, 1);
    const step = wide ? (e.clientY - drag.lastY) : (drag.lastX - e.clientX);
    drag.v = 0.8 * drag.v + 0.2 * (step / dt);                          // px per ms, smoothed
    drag.lastX = e.clientX; drag.lastY = e.clientY; drag.lastT = now;
    target = pos = drag.pos + delta / PX_PER_CARD;
    place();
  });
  const release = (e) => {
    if (!drag) return;
    if (drag.moved) {
      const cardEl = e.target.closest?.("[data-deck-card]");
      cardEl?.setAttribute("data-dragged", "");
      setTimeout(() => cardEl?.removeAttribute("data-dragged"), 0);
      target = Math.round(pos + (drag.v * 260) / PX_PER_CARD);            // throw
      animate();
    }
    drag = null;
  };
  stage?.addEventListener("pointerup", release);
  stage?.addEventListener("pointercancel", release);

  // Horizontal trackpad scrolling moves the deck too (vertical stays with the page).
  let wheelTimer = 0;
  stage?.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    cancelAnimationFrame(frame);
    target = pos = pos + e.deltaX / (PX_PER_CARD * 1.4);
    place();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { target = Math.round(pos); animate(); }, 120);
  }, { passive: false });

  new ResizeObserver(() => place(true)).observe(stage);
}

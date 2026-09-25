// Hero orbit: my projects float around the centred headline, each wired back to
// the mark (me) at the top, with packets running the wires. Laid out in real
// pixels from the hero's size, so it re-renders on resize. Nodes open case studies.
import { html, render, $ } from "../core/dom.js";
import { projects } from "../data/projects.js";
import { initParallax } from "../ds/tilt.js";
import { onScroll } from "../ds/smooth-scroll.js";

const CHAR_W = 7.4;
const COMPACT = 760;          // below this, nodes are dots without labels
const SPREAD = 0.35;          // how far chips drift outward as the hero scrolls away (× their distance from centre)

let layout = null;            // { hub, nodes } from the last draw, used by the scroll step

const nodeWidth = (label) => label.length * CHAR_W + 22;

// Two side columns, left and right of the copy (like images floating beside a
// centred headline), with a slight zig-zag so they don't read as a list.
function sides(items, w, zone) {
  const half = Math.ceil(items.length / 2);
  const rows = half - 1 || 1;
  return items.map((p, i) => {
    const left = i < half;
    const k = left ? i : i - half;
    const [x0, x1] = left ? [zone.edge, zone.inner] : [w - zone.inner, w - zone.edge];
    const mid = (x0 + x1) / 2, swing = (x1 - x0) * 0.26;
    const zig = (k % 2 ? 1 : -1) * (left ? 1 : -1);
    return { ...p, x: mid + zig * swing, y: zone.top + (k / rows) * (zone.bottom - zone.top) };
  });
}

// Wire from the character to a node: starts at its centre (hidden behind it),
// leaves sideways at its own height, then bends down to the node, so the wires
// fan out like an umbrella around the copy.
function curve(a, b) {
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${b.x.toFixed(1)} ${a.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

const node = (n, i, compact) => {
  const w = compact ? 16 : nodeWidth(n.short);
  const h = compact ? 16 : 30;
  return html`
    <a class="graph__node orbit__node" href="#project/${n.slug}" data-project="${n.slug}" aria-label="${n.short}" style="--i:${i}">
      <rect x="${(n.x - w / 2).toFixed(1)}" y="${(n.y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="${h / 2}"/>
      ${compact ? "" : html`<text x="${n.x.toFixed(1)}" y="${(n.y + 4).toFixed(1)}" text-anchor="middle">${n.short}</text>`}
    </a>`;
};

const packet = (d, i) =>
  html`<circle class="graph__packet" r="3" style="offset-path: path('${d}'); --delay:${(i * 0.41) % 3.4}s; --dur:${2.8 + (i % 4) * 0.6}s"/>`;

// Measure where things rest, not where an animation happens to have them this
// frame (the mark scales in and sways; the copy lifts with scroll).
function measureAtRest(scene, fn) {
  scene.classList.add("is-measuring");
  try { return fn(); } finally { scene.classList.remove("is-measuring"); }
}

function draw(scene, mount, anchor, copy, title) {
  const s = scene.getBoundingClientRect();
  const { width: w, height: h } = s;
  const c = copy.getBoundingClientRect();
  const a = measureAtRest(scene, () => anchor.getBoundingClientRect());
  const hub = { x: a.left - s.left + a.width / 2, y: a.top - s.top + a.height / 2 };
  // Side zones run from the page gutter to just outside the headline, top of the
  // copy to the bottom of the first screen (above the cloud bank).
  const textHalf = Math.max(title.getBoundingClientRect().width, c.width) / 2;
  const zone = {
    edge: Math.min(64, w * 0.05),
    inner: Math.max(w / 2 - textHalf - 36, w * 0.18),
    top: title.getBoundingClientRect().top - s.top,
    bottom: Math.min(h, innerHeight) - 90,
  };
  const compact = w < COMPACT;
  const nodes = sides(projects, w, zone).map((n) => ({ ...n, cx: w / 2, cy: (zone.top + zone.bottom) / 2 }));
  const wires = nodes.map((n) => curve(hub, n));
  layout = { hub, nodes };

  render(mount, html`
    <svg class="graph orbit" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" role="group" aria-label="Projects, wired to me">
      ${compact ? "" : html`<g class="orbit__wires">
        ${wires.map((d, i) => html`<path class="graph__edge" d="${d}" pathLength="1" style="--i:${i}"/>`)}
        ${wires.map(packet)}
      </g>`}
      ${nodes.map((n, i) => node(n, i, compact))}
    </svg>`);
}

// Chips drift outward as the hero scrolls away; each wire is recomputed to end
// on its chip and the packet's path follows, so wire and chip never separate.
function follow(scene) {
  if (!layout) return;
  const { top, height } = scene.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -top / height));
  const chips = scene.querySelectorAll(".orbit__node");
  const edges = scene.querySelectorAll(".orbit__wires .graph__edge");
  const packets = scene.querySelectorAll(".orbit__wires .graph__packet");
  layout.nodes.forEach((n, i) => {
    const dx = (n.x - n.cx) * p * SPREAD, dy = (n.y - n.cy) * p * SPREAD;
    chips[i]?.setAttribute("transform", `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);
    const d = curve(layout.hub, { x: n.x + dx, y: n.y + dy });
    edges[i]?.setAttribute("d", d);
    packets[i]?.style.setProperty("offset-path", `path('${d}')`);
  });
}

export function renderHero() {
  const scene = $("[data-hero]");
  const mount = $("[data-hero-graph]");
  const anchor = $("[data-hero-anchor]");
  const copy = $(".hero__lead");
  const title = $(".hero__title");
  if (!scene || !mount || !anchor || !copy || !title) return;

  let width = 0;
  const redraw = () => {
    if (Math.abs(scene.clientWidth - width) < 2) return;   // ignore mobile URL-bar height jitter
    width = scene.clientWidth;
    draw(scene, mount, anchor, copy, title);
    follow(scene);
  };
  new ResizeObserver(redraw).observe(scene);
  document.fonts?.ready.then(() => { width = 0; redraw(); });

  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) onScroll(() => follow(scene));
  initParallax(scene);
}

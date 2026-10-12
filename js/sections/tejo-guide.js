// Tejo walks you between the homepage and the projects page, so the two read
// as one place. He lives in the nav corner on both: click a link to the other
// page and he flies up to that corner (on the homepage; on the projects page
// he's already there), hops and says "follow me"; the page then cross-fades
// (a cross-document view transition, css/site.css) with him still in the same
// corner. On the homepage he then flies back down to his spot; on the projects
// page he hops and says where you've landed. sessionStorage carries the hand-off.
import { pick } from "../core/i18n.js";
import { chatter } from "../data/chatter.js";

const KEY = "tejo:guide";
const DOCK = 550;                                                    // ms: the flight up to the corner (mascot-fly.js)
const SAY = 420;                                                     // ms: the "follow me" line, typed and read, before the page goes
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const isProjects = (path) => /\/projects\/(index\.html)?$/.test(path);
const dir = (url) => url.pathname.replace(/index\.html$/, "");

// The page this visit came from with Tejo ("home" | "projects"), read once.
export function arrival() {
  try { const from = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); return from; } catch { return null; }
}

// A random line from a chatter.guide set, in the current language.
export const guideLine = (set) => { const lines = pick(chatter.guide[set]); return lines[Math.floor(Math.random() * lines.length)]; };
// Ask the chat to say one (mascot-chat.js listens).
export const sayGuide = (tejo, set) => tejo?.dispatchEvent(new CustomEvent("tejo:say", { detail: guideLine(set) }));
// One of his idle moves, on request (mascot-idle.js listens).
export const move = (tejo, name) => tejo?.dispatchEvent(new CustomEvent("tejo:move", { detail: name }));

export function initTejoGuide(tejo) {
  if (!tejo) return;
  const page = isProjects(location.pathname) ? "projects" : "home";
  const other = dir(new URL(page === "home" ? "projects/" : "../", location.href));   // relative, so it works under a sub-path too
  let leaving = false;

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || dir(url) !== other) return;   // only the other page is a trip (not previews, not anchors)
    try { sessionStorage.setItem(KEY, page); } catch { /* private mode: he just doesn't follow */ }
    if (reduced()) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    // Up to the corner first (unless he's already in it), then the call and a hop.
    const toCorner = page === "home" && !tejo.classList.contains("is-docked");
    if (toCorner) tejo.dispatchEvent(new CustomEvent("tejo:dock", { detail: DOCK }));
    setTimeout(() => { sayGuide(tejo, page === "home" ? "toProjects" : "toHome"); move(tejo, "hop"); }, toCorner ? DOCK : 0);
    setTimeout(() => location.assign(url), (toCorner ? DOCK : 0) + SAY);
  });
  addEventListener("pageshow", (event) => { if (event.persisted) leaving = false; });   // back from the bfcache
}

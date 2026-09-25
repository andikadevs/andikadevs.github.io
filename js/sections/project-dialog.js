// Case-study dialog. Opens from any [data-project] link, and from a
// #project/<slug> hash so a case study can be linked directly.
import { html, render, $ } from "../core/dom.js";
import { t, pick } from "../core/i18n.js";
import { projects, DISCIPLINES } from "../data/projects.js";
import { external, close } from "./icons.js";
import { lockScroll, unlockScroll } from "../ds/smooth-scroll.js";
import { srcset } from "../core/media.js";

const PREFIX = "#project/";
const bySlug = new Map(projects.map((p) => [p.slug, p]));
let openSlug = null;

const view = (p) => html`
  <button class="icon-btn dialog__close" type="button" data-dialog-close aria-label="${t("work.close")}">${close()}</button>
  <article class="case">
    <header class="case__head">
      <div class="cluster">${p.disciplines.map((d) => html`<span class="chip">${pick(DISCIPLINES[d])}</span>`)}</div>
      <h2 class="heading" id="case-title">${pick(p.title)}</h2>
      <p class="lead">${pick(p.summary)}</p>
      <dl class="case__facts">
        <div><dt class="label label--muted">${t("work.client")}</dt><dd>${p.client}</dd></div>
        <div><dt class="label label--muted">${t("work.year")}</dt><dd>${p.year}</dd></div>
      </dl>
      ${p.url
        ? html`<a class="btn" href="${p.url}" target="_blank" rel="noopener">${t("work.visit")} ${external()}</a>`
        : html`<p class="label label--muted">${t("work.private")}</p>`}
    </header>

    <img class="case__cover" src="${p.cover}" srcset="${srcset(p.cover)}" sizes="(min-width: 960px) 820px, 100vw" alt="${pick(p.title)} — main screen" width="1600" height="848">

    <div class="case__metrics">
      ${p.metrics.map((m) => html`<div class="stat"><span class="stat__value">${m.value}</span><span class="stat__label">${pick(m.label)}</span></div>`)}
    </div>

    <div class="case__story">
      <section><h3 class="label label--muted">${t("work.problem")}</h3><p>${pick(p.problem)}</p></section>
      <section><h3 class="label label--muted">${t("work.approach")}</h3><p>${pick(p.approach)}</p></section>
      <section><h3 class="label label--muted">${t("work.stack")}</h3><div class="cluster">${p.stack.map((s) => html`<span class="chip">${s}</span>`)}</div></section>
    </div>

    ${p.gallery.length ? html`<div class="case__gallery">${p.gallery.map((src, i) => html`<img src="${src}" srcset="${srcset(src)}" sizes="(min-width: 760px) 410px, 100vw" alt="${pick(p.title)} — screen ${i + 2}" loading="lazy" decoding="async" width="1600" height="848">`)}</div>` : ""}
  </article>`;

export function initProjectDialog(dialog) {
  if (!dialog) return;

  const show = (slug) => {
    const project = bySlug.get(slug);
    if (!project) return;
    openSlug = slug;
    render(dialog, view(project));
    dialog.scrollTop = 0;
    if (!dialog.open) { dialog.showModal(); lockScroll(); }
  };

  const clearHash = () => history.replaceState(null, "", location.pathname + location.search);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-project]");
    if (!link) return;
    event.preventDefault();
    history.replaceState(null, "", PREFIX + link.dataset.project);
    show(link.dataset.project);
  });

  dialog.addEventListener("click", (event) => {
    // A click on the backdrop lands on the <dialog> itself.
    if (event.target === dialog || event.target.closest("[data-dialog-close]")) dialog.close();
  });
  dialog.addEventListener("close", () => { openSlug = null; clearHash(); unlockScroll(); });

  document.addEventListener("langchange", () => { if (openSlug) show(openSlug); });

  const fromHash = () => { if (location.hash.startsWith(PREFIX)) show(location.hash.slice(PREFIX.length)); };
  addEventListener("hashchange", fromHash);
  fromHash();
}

// Projects page controller: fully interactive archive with Blueprint DS design system,
// sound effects, 3D card tilt parallax, real-time search & discipline filtering,
// view switching (grid/table), night sky canvas, and case-study dialog integration.
import { html, render, $, $$ } from "./core/dom.js";
import { initI18n, setLang, lang, t, pick } from "./core/i18n.js";
import { projects, DISCIPLINES } from "./data/projects.js";
import { initProjectDialog } from "./sections/project-dialog.js";
import { initThemeToggle } from "./ds/theme-toggle.js";
import { srcset } from "./core/media.js";
import { syncSegmented } from "./ds/segmented.js";

// Interactive Blueprint DS modules
import { initAudio } from "./core/audio.js";
import { initSoundFx, sfx } from "./sections/sound-fx.js";
import { initRobotVoice } from "./sections/robot-voice.js";
import { initMusic } from "./sections/music.js";
import { initSoundCues } from "./sections/sound-cues.js";
import { initMagnetic } from "./ds/magnetic.js";
import { initNightSky } from "./ds/night-sky.js";
import { initSmoothScroll } from "./ds/smooth-scroll.js";
import { rollify } from "./ds/text-roll.js";

const gridEl = $("[data-projects-grid]");
const metaEl = $("[data-projects-meta]");
const chipsEl = $("[data-filter-chips]");
const searchInput = $("[data-projects-search]");
const clearBtn = $("[data-search-clear]");
const totalBadge = $("[data-total-count]");
const viewSwitchEl = $("[data-view-switch]");

let activeDiscipline = "all";
let searchQuery = "";
let viewMode = (() => {
  try { return localStorage.getItem("projects_view") || "grid"; } catch { return "grid"; }
})();

// Image path resolver for /projects/ subpath
const assetSrc = (path) => `../${path}`;

function getFilteredProjects() {
  const q = searchQuery.trim().toLowerCase();
  return projects.filter((p) => {
    // Discipline filter
    if (activeDiscipline !== "all" && !p.disciplines.includes(activeDiscipline)) {
      return false;
    }
    // Search query filter
    if (q) {
      const matchTitle = (p.title.en + " " + p.title.id).toLowerCase().includes(q);
      const matchCat = (p.category.en + " " + p.category.id).toLowerCase().includes(q);
      const matchSummary = (p.summary.en + " " + p.summary.id).toLowerCase().includes(q);
      const matchClient = p.client.toLowerCase().includes(q);
      const matchYear = String(p.year).includes(q);
      const matchStack = p.stack.some((s) => s.toLowerCase().includes(q));
      const matchDisc = p.disciplines.some((d) => (DISCIPLINES[d]?.en + " " + DISCIPLINES[d]?.id).toLowerCase().includes(q));
      if (!matchTitle && !matchCat && !matchSummary && !matchClient && !matchYear && !matchStack && !matchDisc) {
        return false;
      }
    }
    return true;
  });
}

function renderCard(p, index, total) {
  const coverUrl = assetSrc(p.cover);
  const numStr = String(index + 1).padStart(2, "0");
  const totStr = String(total).padStart(2, "0");
  const metric = p.metrics && p.metrics.length ? p.metrics[0] : null;
  const primaryDiscipline = p.disciplines[0];
  const tags = p.stack.slice(0, 4);
  const remaining = p.stack.length - tags.length;

  return html`
    <article class="project-card" data-slug="${p.slug}">
      <div class="project-card__visual" data-project="${p.slug}" tabindex="0" role="button" aria-label="${t("work.open")}: ${pick(p.title)}">
        <img class="project-card__img" src="${coverUrl}" srcset="${srcset(coverUrl)}" sizes="(min-width: 1080px) 380px, (min-width: 680px) 46vw, 92vw" alt="${pick(p.title)} — preview" width="1600" height="848" loading="lazy" decoding="async">
        <div class="project-card__badges">
          <span class="project-card__badge-discipline">${pick(DISCIPLINES[primaryDiscipline])}</span>
          <span class="project-card__badge-year">${p.year}</span>
        </div>
      </div>

      <div class="project-card__body">
        <div class="project-card__meta-line">
          <span>${numStr} / ${totStr}</span>
          <span>${p.client}</span>
        </div>

        <h2 class="project-card__title">
          <a href="#project/${p.slug}" data-project="${p.slug}">
            <span>${pick(p.title)}</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11 11 5M5 5h6v6"/></svg>
          </a>
        </h2>

        <p class="project-card__category">${pick(p.category)}</p>
        <p class="project-card__summary">${pick(p.summary)}</p>

        <div class="project-card__tags">
          ${tags.map((s) => html`<span class="project-tag">${s}</span>`)}
          ${remaining > 0 ? html`<span class="project-tag project-tag--more">+${remaining}</span>` : ""}
        </div>

        <div class="project-card__footer">
          ${metric ? html`
            <div class="project-card__metric">
              <strong>${metric.value}</strong>
              <span>${pick(metric.label)}</span>
            </div>
          ` : html`<span></span>`}
          <button class="project-card__cta" type="button" data-project="${p.slug}" data-magnetic>
            <span>${t("projects.viewCase")}</span>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderTable(items) {
  return html`
    <div class="projects-table-wrapper">
      <table class="projects-table">
        <thead>
          <tr>
            <th style="width: 44px">#</th>
            <th style="width: 56px"></th>
            <th>${t("projects.colProject")}</th>
            <th>${t("projects.colClient")}</th>
            <th>${t("projects.colDiscipline")}</th>
            <th>${t("projects.colStack")}</th>
            <th>${t("projects.colYear")}</th>
            <th style="text-align: right"></th>
          </tr>
        </thead>
        <tbody>
          ${items.map((p, i) => {
            const coverUrl = assetSrc(p.cover);
            const numStr = String(i + 1).padStart(2, "0");
            return html`
              <tr data-project="${p.slug}" tabindex="0" role="button" aria-label="${t("work.open")}: ${pick(p.title)}">
                <td style="font: 500 11px / 1 var(--font-mono); color: var(--fg-subtle)">${numStr}</td>
                <td>
                  <span class="projects-table__thumb">
                    <img src="${coverUrl}" alt="" loading="lazy" decoding="async">
                  </span>
                </td>
                <td>
                  <div class="projects-table__title">${pick(p.title)}</div>
                  <div class="projects-table__cat">${pick(p.category)}</div>
                </td>
                <td style="font-size: var(--text-sm); color: var(--fg)">${p.client}</td>
                <td>
                  <span class="chip" style="height: 22px; font-size: 10px; padding: 0 8px">${p.disciplines.map((d) => pick(DISCIPLINES[d])).join(", ")}</span>
                </td>
                <td>
                  <div class="projects-table__stack">${p.stack.slice(0, 4).join(" · ")}</div>
                </td>
                <td style="font: 500 12px / 1 var(--font-mono); color: var(--fg-muted)">${p.year}</td>
                <td style="text-align: right">
                  <span class="project-card__cta">
                    <span>${t("projects.viewCase")}</span>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>
                  </span>
                </td>
              </tr>
            `;
          })}
        </tbody>
      </table>
    </div>
  `;
}

function renderEmpty() {
  return html`
    <div class="projects-empty">
      <div class="projects-empty__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="m8 11 6 0"/></svg>
      </div>
      <h3 class="projects-empty__title">${t("projects.emptyTitle")}</h3>
      <p class="projects-empty__desc">${t("projects.emptyDesc")}</p>
      <button class="btn btn--light" type="button" data-reset-filters data-magnetic>
        <span>${t("projects.clearFilters")}</span>
      </button>
    </div>
  `;
}

function resetAllFilters() {
  sfx("step", { volume: 0.5 });
  activeDiscipline = "all";
  searchQuery = "";
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.classList.remove("is-visible");
  renderFilterChips();
  updateView();
}

function updateView() {
  const items = getFilteredProjects();

  gridEl.classList.toggle("is-table-view", viewMode === "table");
  gridEl.classList.toggle("is-grid-view", viewMode === "grid");

  // Render cards or table or empty state
  if (items.length === 0) {
    render(gridEl, renderEmpty());
    const resetBtn = gridEl.querySelector("[data-reset-filters]");
    if (resetBtn) resetBtn.addEventListener("click", resetAllFilters);
  } else if (viewMode === "table") {
    render(gridEl, renderTable(items));
  } else {
    render(gridEl, html`${items.map((p, i) => renderCard(p, i, items.length))}`);
  }

  // Update meta bar (results counter + reset link)
  const isFiltered = activeDiscipline !== "all" || searchQuery.trim().length > 0;
  const countText = items.length === 1
    ? t("projects.resultsSingle")
    : t("projects.results").replace("{n}", items.length);

  metaEl.innerHTML = `
    <span>${countText}</span>
    ${isFiltered ? `<button class="reset-link" type="button" data-reset-meta>${t("projects.clearFilters")}</button>` : ""}
  `;

  const resetMeta = metaEl.querySelector("[data-reset-meta]");
  if (resetMeta) {
    resetMeta.addEventListener("click", resetAllFilters);
  }

  // Update total badge in nav if present
  if (totalBadge) {
    totalBadge.textContent = `${projects.length} ${t("projects.totalBadge")}`;
  }

  rollify(".project-card__cta > span");
}

function renderFilterChips() {
  if (!chipsEl) return;

  const counts = { all: projects.length };
  Object.keys(DISCIPLINES).forEach((key) => {
    counts[key] = projects.filter((p) => p.disciplines.includes(key)).length;
  });

  const chips = [
    { key: "all", label: t("projects.all"), count: counts.all },
    ...Object.entries(DISCIPLINES).map(([key, val]) => ({
      key,
      label: pick(val),
      count: counts[key] ?? 0,
    })),
  ];

  chipsEl.innerHTML = chips.map((c) => `
    <button class="chip chip--filter" type="button" data-filter="${c.key}" aria-pressed="${String(c.key === activeDiscipline)}">
      <span>${c.label}</span>
      <span class="chip__count">${c.count}</span>
    </button>
  `).join("");

  $$("[data-filter]", chipsEl).forEach((btn) => {
    btn.addEventListener("click", () => {
      sfx("step", { volume: 0.6 });
      activeDiscipline = btn.dataset.filter;
      renderFilterChips();
      updateView();
    });
  });
}

function initSearch() {
  if (!searchInput) return;

  const onSearch = () => {
    searchQuery = searchInput.value;
    if (clearBtn) {
      clearBtn.classList.toggle("is-visible", searchQuery.length > 0);
    }
    updateView();
  };

  searchInput.addEventListener("input", onSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      onSearch();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      sfx("step", { volume: 0.5 });
      searchInput.value = "";
      searchInput.focus();
      onSearch();
    });
  }
}

function initViewToggle() {
  if (!viewSwitchEl) return;

  const updateButtons = () => {
    $$("button[data-view]", viewSwitchEl).forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.view === viewMode));
    });
    syncSegmented(viewSwitchEl);
  };

  viewSwitchEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-view]");
    if (!btn || btn.dataset.view === viewMode) return;
    sfx("step", { volume: 0.7 });
    viewMode = btn.dataset.view;
    try { localStorage.setItem("projects_view", viewMode); } catch { /* ignore */ }
    updateButtons();
    updateView();
  });

  updateButtons();
}

function initLangSwitch(control) {
  const sync = () => {
    $$("button", control).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang())));
    syncSegmented(control);
  };
  control.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-lang]");
    if (button) setLang(button.dataset.lang);
  });
  document.addEventListener("langchange", sync);
}

// 3D Card Tilt with smooth pointer parallax and interactive audio cues
function initCardInteractions() {
  if (!gridEl) return;

  if (matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    let currentCard = null;

    gridEl.addEventListener("pointerover", (e) => {
      const card = e.target.closest(".project-card");
      if (card !== currentCard) {
        if (currentCard) {
          currentCard.style.removeProperty("--rx");
          currentCard.style.removeProperty("--ry");
          currentCard.style.removeProperty("--gx");
          currentCard.style.removeProperty("--gy");
        }
        currentCard = card;
        if (card && e.pointerType === "mouse") {
          sfx("ui-pop", { volume: 0.35, rate: 0.95 + Math.random() * 0.15 });
        }
      }
    });

    gridEl.addEventListener("pointermove", (e) => {
      if (!currentCard) return;
      const rect = currentCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width) * 2 - 1;
      const py = (y / rect.height) * 2 - 1;

      const rx = (-py * 5).toFixed(2);
      const ry = (px * 5).toFixed(2);
      currentCard.style.setProperty("--rx", `${rx}deg`);
      currentCard.style.setProperty("--ry", `${ry}deg`);
      currentCard.style.setProperty("--gx", `${((x / rect.width) * 100).toFixed(1)}%`);
      currentCard.style.setProperty("--gy", `${((y / rect.height) * 100).toFixed(1)}%`);
    }, { passive: true });

    gridEl.addEventListener("pointerout", (e) => {
      if (currentCard && !currentCard.contains(e.relatedTarget)) {
        currentCard.style.removeProperty("--rx");
        currentCard.style.removeProperty("--ry");
        currentCard.style.removeProperty("--gx");
        currentCard.style.removeProperty("--gy");
        currentCard = null;
      }
    });
  }

  // Sound cue on clicking card or case study trigger
  gridEl.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-project]");
    if (trigger) {
      sfx("section-sheet", { volume: 0.75 });
    }
  });

  // Keyboard accessibility: Enter or Space triggers click on cards or table rows
  gridEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const el = e.target.closest("[data-project]");
      if (el && el.tagName !== "BUTTON" && el.tagName !== "A") {
        e.preventDefault();
        el.click();
      }
    }
  });
}

// ---- Startup & Core Lifecycle -----------------------------------------------

// Unlock audio bus and sound FX
initAudio();
initSoundFx();

// Initial text rolls
rollify(".nav-link");

// Listeners first so language change re-renders properly
document.addEventListener("langchange", () => {
  renderFilterChips();
  updateView();
  rollify(".nav-link");
});

$$("[data-lang-switch]").forEach(initLangSwitch);
initI18n();

renderFilterChips();
initSearch();
initViewToggle();
updateView();
initCardInteractions();

// Global Blueprint DS features
initSmoothScroll();
initNightSky();
initMagnetic(document);
initThemeToggle($("[data-theme-toggle]"));
initRobotVoice($("[data-sound-toggle]"));
initMusic($("[data-music-toggle]"));
initSoundCues($("[data-nav]"));
initProjectDialog($("[data-project-dialog]"));

$("[data-year]").textContent = new Date().getFullYear();

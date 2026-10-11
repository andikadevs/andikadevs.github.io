// Projects page controller: interactive search, discipline filtering,
// responsive card grid, i18n and case-study dialog integration.
import { html, render, $, $$ } from "./core/dom.js";
import { initI18n, setLang, lang, t, pick } from "./core/i18n.js";
import { projects, DISCIPLINES } from "./data/projects.js";
import { initProjectDialog } from "./sections/project-dialog.js";
import { initThemeToggle } from "./ds/theme-toggle.js";
import { external } from "./sections/icons.js";
import { srcset } from "./core/media.js";
import { syncSegmented } from "./ds/segmented.js";

const gridEl = $("[data-projects-grid]");
const metaEl = $("[data-projects-meta]");
const chipsEl = $("[data-filter-chips]");
const searchInput = $("[data-projects-search]");
const clearBtn = $("[data-search-clear]");
const totalBadge = $("[data-total-count]");

let activeDiscipline = "all";
let searchQuery = "";

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

function renderCard(p) {
  const coverUrl = assetSrc(p.cover);
  return html`
    <article class="project-card" data-slug="${p.slug}">
      <div class="project-card__media" data-project="${p.slug}" role="button" tabindex="0" aria-label="${t("work.open")}: ${pick(p.title)}">
        <div class="shot">
          <img src="${coverUrl}" srcset="${srcset(coverUrl)}" sizes="(min-width: 1120px) 380px, (min-width: 680px) 46vw, 92vw" alt="${pick(p.title)} — preview" width="1600" height="848" loading="lazy" decoding="async">
        </div>
      </div>

      <div class="project-card__body">
        <div class="project-card__top">
          <div class="cluster">
            ${p.disciplines.map((d) => html`<span class="chip">${pick(DISCIPLINES[d])}</span>`)}
          </div>
          <span class="label label--muted">${p.year}</span>
        </div>

        <div class="project-card__headline">
          <h2 class="project-card__title">
            <a href="#project/${p.slug}" data-project="${p.slug}">${pick(p.title)}</a>
          </h2>
          <span class="project-card__category">${pick(p.category)} · ${p.client}</span>
        </div>

        <p class="project-card__summary">${pick(p.summary)}</p>

        <div class="project-card__stack">
          ${p.stack.map((s) => html`<span class="chip">${s}</span>`)}
        </div>

        ${p.metrics && p.metrics.length ? html`
          <div class="project-card__metrics">
            ${p.metrics.map((m) => html`
              <div class="project-card__metric">
                <span class="project-card__metric-val">${m.value}</span>
                <span class="project-card__metric-lbl">${pick(m.label)}</span>
              </div>
            `)}
          </div>
        ` : ""}

        <div class="project-card__footer">
          <button class="btn btn--light" type="button" data-project="${p.slug}">
            <span>${t("projects.viewCase")}</span>
            <svg class="btn__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>
          </button>

          ${p.url ? html`
            <a class="btn btn--glass" href="${p.url}" target="_blank" rel="noopener" aria-label="${t("work.visit")} ${pick(p.title)}">
              <span>${t("work.visit")}</span>
              ${external()}
            </a>
          ` : html`
            <span class="label label--muted">${t("work.private")}</span>
          `}
        </div>
      </div>
    </article>
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
      <button class="btn btn--light" type="button" data-reset-filters>
        <span>${t("projects.clearFilters")}</span>
      </button>
    </div>
  `;
}

function updateView() {
  const items = getFilteredProjects();

  // Render cards or empty state
  if (items.length === 0) {
    render(gridEl, renderEmpty());
    const resetBtn = gridEl.querySelector("[data-reset-filters]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        activeDiscipline = "all";
        searchQuery = "";
        if (searchInput) searchInput.value = "";
        if (clearBtn) clearBtn.classList.remove("is-visible");
        renderFilterChips();
        updateView();
      });
    }
  } else {
    render(gridEl, html`${items.map(renderCard)}`);
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
    resetMeta.addEventListener("click", () => {
      activeDiscipline = "all";
      searchQuery = "";
      if (searchInput) searchInput.value = "";
      if (clearBtn) clearBtn.classList.remove("is-visible");
      renderFilterChips();
      updateView();
    });
  }

  // Update total badge in nav
  if (totalBadge) {
    totalBadge.textContent = `${projects.length} ${t("projects.totalBadge")}`;
  }
}

function renderFilterChips() {
  if (!chipsEl) return;

  // Compute counts per discipline
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
      searchInput.value = "";
      searchInput.focus();
      onSearch();
    });
  }
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

// Initial setup
document.addEventListener("langchange", () => {
  renderFilterChips();
  updateView();
});

$$("[data-lang-switch]").forEach(initLangSwitch);
initI18n();

renderFilterChips();
initSearch();
updateView();

initThemeToggle($("[data-theme-toggle]"));
initProjectDialog($("[data-project-dialog]"));

$("[data-year]").textContent = new Date().getFullYear();

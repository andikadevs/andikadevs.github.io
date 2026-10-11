// Projects page controller: interactive search, discipline filtering,
// view-mode switching (grid vs table), and case-study dialog integration.
import { html, render, $, $$ } from "./core/dom.js";
import { initI18n, setLang, lang, t, pick } from "./core/i18n.js";
import { projects, DISCIPLINES } from "./data/projects.js";
import { initProjectDialog } from "./sections/project-dialog.js";
import { initThemeToggle } from "./ds/theme-toggle.js";
import { srcset } from "./core/media.js";
import { syncSegmented } from "./ds/segmented.js";

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
          <button class="project-card__cta" type="button" data-project="${p.slug}">
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
      <button class="btn btn--light" type="button" data-reset-filters>
        <span>${t("projects.clearFilters")}</span>
      </button>
    </div>
  `;
}

function updateView() {
  const items = getFilteredProjects();

  // Render cards or table or empty state
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

// Accessibility: Enter / Space triggers click on cards or table rows
gridEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    const el = e.target.closest("[data-project]");
    if (el && el.tagName !== "BUTTON" && el.tagName !== "A") {
      e.preventDefault();
      el.click();
    }
  }
});

// Initial setup
document.addEventListener("langchange", () => {
  renderFilterChips();
  updateView();
});

$$("[data-lang-switch]").forEach(initLangSwitch);
initI18n();

renderFilterChips();
initSearch();
initViewToggle();
updateView();

initThemeToggle($("[data-theme-toggle]"));
initProjectDialog($("[data-project-dialog]"));

$("[data-year]").textContent = new Date().getFullYear();

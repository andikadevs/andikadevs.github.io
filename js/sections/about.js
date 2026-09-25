// Experience accordion, education, highlight cards, client logos, socials.
import { html, render, $ } from "../core/dom.js";
import { pick } from "../core/i18n.js";
import { experience, education, highlights, clients, profile } from "../data/profile.js";

const job = (item, i) => html`
  <details class="accordion__item" data-reveal ${i === 0 ? "open" : ""}>
    <summary class="accordion__summary">
      <span class="job">
        <span class="job__period label label--muted">${pick(item.period)}</span>
        <span class="job__role">${pick(item.role)}</span>
        <span class="job__org">${item.org}</span>
      </span>
      <span class="accordion__plus" aria-hidden="true"></span>
    </summary>
    <div class="accordion__content">
      <p>${pick(item.body)}</p>
      <div class="cluster">${item.tags.map((tag) => html`<span class="chip">${tag}</span>`)}</div>
    </div>
  </details>`;

const school = (item) => html`
  <li><span class="label label--muted">${item.period}</span><strong>${item.school}</strong><span>${pick(item.degree)}</span></li>`;

const highlight = (item) => html`
  <div class="feature feature--${item.tone} hscroll__card">
    <span class="label">${pick(item.label)}</span>
    <span class="feature__big" data-count-up>${item.value}</span>
    <strong>${pick(item.title)}</strong>
    <p>${pick(item.body)}</p>
  </div>`;

const social = (s) => html`<li><a href="${s.url}" target="_blank" rel="noopener">${s.label}</a></li>`;

const logo = (c) => html`<li><img src="${c.logo}" alt="${c.name}" loading="lazy" height="40"></li>`;

export function renderAbout() {
  render($("[data-experience]"), experience.map(job));
  render($("[data-education]"), education.map(school));
  render($("[data-highlights]"), highlights.map(highlight));
  render($("[data-clients]"), clients.map(logo));
  render($("[data-socials]"), profile.socials.map(social));
}
